import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragCancelEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { useTabStore } from '@/stores/tabStore';
import { usePanelStore, MAIN_PANEL_ID } from '@/stores/panelStore';
import type { TabDragData, DropZoneType } from '@/types/tabDrag';
import type { PanelConfig, PanelGroupConfig } from '@/types/panel';
import { DropZoneIndicator } from './DropZoneIndicator';
import { calculateDropZoneDimensions, calculateEdgeLineDimensions } from '@/utils/dropZoneCalculator';
import { splitPanel, validateSplitOperation, type SplitEdge } from '@/utils/panelSplit';
import type { Tab } from '@/types/tab';

/**
 * DndTabContext component props
 */
interface DndTabContextProps {
  children: React.ReactNode;
}

/**
 * DndTabContext component
 * Wraps the tab system with drag-and-drop context
 * Handles tab dragging between tab bars
 * 
 * Implementation based on @dnd-kit best practices:
 * - Use useDraggable for tabs
 * - Use useDroppable for tab bars
 * - Handle drag end to move tabs between groups
 */
export const DndTabContext: React.FC<DndTabContextProps> = ({ children }) => {
  const { setDraggingTab, draggingTab, setModifierKeyHeld } = useTabStore();
  const { currentLayout, ensureMainPanelExists, getMainPanelId, setPanelTabGroupMapping, updateLayout } = usePanelStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  // Use ref for mouse position to ensure synchronous updates
  const mousePositionRef = React.useRef<{ x: number; y: number } | null>(null);
  // Track if Ctrl/Cmd is held during drag (for panel splitting)
  const isModifierHeldRef = React.useRef<boolean>(false);
  
  // Performance optimization: RAF throttling and DOM measurement caching
  const rafRef = React.useRef<number | null>(null);
  const lastMousePosRef = React.useRef<{ x: number; y: number } | null>(null);
  const rectCacheRef = React.useRef<Map<string, { rect: DOMRect; timestamp: number }>>(new Map());
  const MOUSE_MOVE_THRESHOLD = 5; // Only recalculate when mouse moves 5px+
  const CACHE_DURATION = 100; // Cache DOM measurements for 100ms

  /**
   * Calculate insertion index for tab in tab bar
   * @param mouseX - Mouse X coordinate (clientX)
   * @param tabBarElement - Tab bar DOM element
   * @param tabs - Array of tabs in the group
   * @returns Insertion index (0 to tabs.length)
   */
  const calculateTabInsertionIndex = useCallback((
    mouseX: number,
    tabBarElement: HTMLElement,
    tabs: Tab[]
  ): number => {
    const tabBarRect = tabBarElement.getBoundingClientRect();
    const relativeX = mouseX - tabBarRect.left;
    
    // If mouse is before first tab, insert at start
    if (relativeX < 0) return 0;
    
    // If mouse is after last tab, append at end
    if (relativeX > tabBarRect.width) return tabs.length;
    
    // Find which tab the mouse is over
    for (let i = 0; i < tabs.length; i++) {
      const tabElement = document.getElementById(`tab-${tabs[i].id}`);
      if (tabElement) {
        const tabRect = tabElement.getBoundingClientRect();
        const tabMidpoint = tabRect.left + tabRect.width / 2 - tabBarRect.left;
        
        if (relativeX < tabMidpoint) {
          return i; // Insert before this tab
        }
      }
    }
    
    // Default: append at end
    return tabs.length;
  }, []);

  // Configure sensors with proper activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts (reduced for better responsiveness)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Get cached or fresh DOM rect for an element
   * Caches measurements for CACHE_DURATION to avoid expensive recalculations
   */
  const getCachedRect = useCallback((element: HTMLElement, cacheKey: string): DOMRect => {
    const now = Date.now();
    const cached = rectCacheRef.current.get(cacheKey);
    
    // Use cached rect if still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.rect;
    }
    
    // Get fresh rect and cache it
    const rect = element.getBoundingClientRect();
    rectCacheRef.current.set(cacheKey, { rect, timestamp: now });
    
    // Clean up old cache entries (keep cache size reasonable)
    if (rectCacheRef.current.size > 50) {
      const entriesToDelete: string[] = [];
      for (const [key, value] of rectCacheRef.current.entries()) {
        if ((now - value.timestamp) >= CACHE_DURATION * 2) {
          entriesToDelete.push(key);
        }
      }
      entriesToDelete.forEach(key => rectCacheRef.current.delete(key));
    }
    
    return rect;
  }, []);

  // Edge detection function - can be called from mousemove or onDragOver
  // Now uses cached DOM measurements and is throttled via RAF
  const detectDropZone = useCallback((mouseX: number, mouseY: number) => {
    const tabStore = useTabStore.getState();
    
    // Check if dragging a tab - if not, clear drop zone and return
    if (!draggingTab || draggingTab.type !== 'tab') {
      // Clear drop zone if we're not dragging
      if (tabStore.activeDropZone) {
        tabStore.setActiveDropZone(null);
      }
      return;
    }
    
    // Check if over empty canvas first
    const hasLayout = currentLayout && currentLayout.groups && currentLayout.groups.length > 0;
    if (!hasLayout) {
      tabStore.setActiveDropZone({
        type: 'empty-canvas',
        position: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
      });
      return;
    }
    
    const TAB_BAR_HEIGHT = 35;
    const EDGE_THRESHOLD = 30;
    
    // PRIORITY 1: Check for panel edges (only if Ctrl/Cmd is held)
    // Edge detection requires modifier key to prevent accidental panel creation
    // Only show edge drop zones if Ctrl (Windows/Linux) or Cmd (Mac) is held
    if (!isModifierHeldRef.current) {
      // No modifier key - skip edge detection, only allow tab bar drops
      tabStore.setActiveDropZone(null);
      return;
    }
    
    // Modifier key is held - allow edge detection for panel splitting
    const allPanelElements = document.querySelectorAll('[data-panel-id]');
    let bestEdge: {
      panel: HTMLElement;
      panelId: string;
      rect: DOMRect;
      edge: DropZoneType;
      distance: number;
    } | null = null;
    
    allPanelElements.forEach((panelEl) => {
      const panel = panelEl as HTMLElement;
      const panelId = panel.getAttribute('data-panel-id');
      if (!panelId) return;
      
      // Use cached rect instead of calling getBoundingClientRect directly
      const cacheKey = `panel-${panelId}`;
      const rect = getCachedRect(panel, cacheKey);
      
      // Panel content area (excluding tab bar at top)
      const contentTop = rect.top + TAB_BAR_HEIGHT;
      const contentBottom = rect.bottom;
      const contentLeft = rect.left;
      const contentRight = rect.right;
      
      // Calculate perpendicular distance to each edge
      const MARGIN = 5; // Small margin to allow detection at window edges
      
      let edgeDistance = Infinity;
      let edgeType: DropZoneType | null = null;
      
      // Top edge: mouse must be horizontally aligned with panel (with margin) AND near top edge
      const distToTop = Math.abs(mouseY - contentTop);
      if (mouseX >= contentLeft - MARGIN && mouseX <= contentRight + MARGIN && 
          distToTop <= EDGE_THRESHOLD && distToTop < edgeDistance) {
        edgeDistance = distToTop;
        edgeType = 'top';
      }
      
      // Bottom edge
      const distToBottom = Math.abs(mouseY - contentBottom);
      if (mouseX >= contentLeft - MARGIN && mouseX <= contentRight + MARGIN && 
          distToBottom <= EDGE_THRESHOLD && distToBottom < edgeDistance) {
        edgeDistance = distToBottom;
        edgeType = 'bottom';
      }
      
      // Left edge
      const distToLeft = Math.abs(mouseX - contentLeft);
      if (mouseY >= contentTop - MARGIN && mouseY <= contentBottom + MARGIN && 
          distToLeft <= EDGE_THRESHOLD && distToLeft < edgeDistance) {
        edgeDistance = distToLeft;
        edgeType = 'left';
      }
      
      // Right edge
      const distToRight = Math.abs(mouseX - contentRight);
      if (mouseY >= contentTop - MARGIN && mouseY <= contentBottom + MARGIN && 
          distToRight <= EDGE_THRESHOLD && distToRight < edgeDistance) {
        edgeDistance = distToRight;
        edgeType = 'right';
      }
      
      // If we found an edge for this panel and it's closer than the current best, update best
      if (edgeType && edgeDistance <= EDGE_THRESHOLD) {
        if (!bestEdge || edgeDistance < bestEdge.distance) {
          bestEdge = {
            panel,
            panelId,
            rect,
            edge: edgeType,
            distance: edgeDistance,
          };
        }
      }
    });
    
    // If we found a panel edge, use it for drop zone
    // Note: DropZoneIndicator will calculate edge line and full preview dimensions itself
    // We just need to provide a valid position for the store
    if (bestEdge) {
      // Use edge line dimensions for initial position (DropZoneIndicator will handle the rest)
      const position = calculateEdgeLineDimensions(bestEdge.edge, bestEdge.rect, TAB_BAR_HEIGHT, 3);
      
      tabStore.setActiveDropZone({
        type: bestEdge.edge,
        targetPanelId: bestEdge.panelId,
        position,
      });
      return;
    }
    
    // PRIORITY 2: Check if mouse is over a tab bar (only if no edge detected or modifier not held)
    const elementAtPoint = document.elementFromPoint(mouseX, mouseY);
    if (elementAtPoint) {
      const panelElement = elementAtPoint.closest('[data-panel-id]') as HTMLElement | null;
      if (panelElement) {
        const panelId = panelElement.getAttribute('data-panel-id');
        if (panelId) {
          const panelRect = panelElement.getBoundingClientRect();
          
          // Check if mouse is over tab bar area
          if (mouseY >= panelRect.top && mouseY < panelRect.top + TAB_BAR_HEIGHT) {
            const panelStore = usePanelStore.getState();
            const tabGroupId = panelStore.getTabGroupForPanel(panelId);
            
            if (tabGroupId) {
              const tabBarElement = document.getElementById(`tab-bar-${tabGroupId}`);
              if (tabBarElement) {
                // Use cached rect instead of calling getBoundingClientRect directly
                const cacheKey = `tab-bar-${tabGroupId}`;
                const tabBarRect = getCachedRect(tabBarElement, cacheKey);
                
                if (mouseX >= tabBarRect.left && mouseX <= tabBarRect.right &&
                    mouseY >= tabBarRect.top && mouseY <= tabBarRect.bottom) {
                  const position = calculateDropZoneDimensions('tab-bar', tabBarRect, 50, TAB_BAR_HEIGHT);
                  
                  // Calculate insertion index based on mouse position
                  const tabGroup = tabStore.getTabGroup(tabGroupId);
                  const insertIndex = tabGroup 
                    ? calculateTabInsertionIndex(mouseX, tabBarElement, tabGroup.tabs)
                    : undefined;
                  
                  tabStore.setActiveDropZone({
                    type: 'tab-bar',
                    targetTabGroupId: tabGroupId,
                    insertIndex,
                    position,
                  });
                  return;
                }
              }
            }
          }
        }
      }
    }
    
    // No drop zone found - clear immediately
    tabStore.setActiveDropZone(null);
  }, [draggingTab, currentLayout, calculateTabInsertionIndex, getCachedRect]);

  // Track mouse position and modifier key during drag
  // Performance optimized: throttled with RAF and movement threshold
  React.useEffect(() => {
    if (!activeId) {
      mousePositionRef.current = null;
      lastMousePosRef.current = null;
      isModifierHeldRef.current = false;
      // Clear any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Clear cache when drag ends
      rectCacheRef.current.clear();
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      
      // Update ref synchronously (no state update delay)
      mousePositionRef.current = newPos;
      
      // Track modifier key state (Ctrl on Windows/Linux, Cmd on Mac)
      const modifierHeld = e.ctrlKey || e.metaKey;
      isModifierHeldRef.current = modifierHeld;
      setModifierKeyHeld(modifierHeld);
      
      // Performance optimization: Only recalculate if mouse moved significantly
      const lastPos = lastMousePosRef.current;
      if (!lastPos || 
          Math.abs(newPos.x - lastPos.x) > MOUSE_MOVE_THRESHOLD || 
          Math.abs(newPos.y - lastPos.y) > MOUSE_MOVE_THRESHOLD) {
        
        // Cancel previous frame if scheduled
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        
        // Schedule new calculation with RAF for smooth 60fps updates
        rafRef.current = requestAnimationFrame(() => {
          detectDropZone(newPos.x, newPos.y);
          lastMousePosRef.current = newPos;
          rafRef.current = null;
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Update modifier state on key events too (in case mouse move doesn't capture it)
      if (e.key === 'Control' || e.key === 'Meta') {
        isModifierHeldRef.current = true;
        setModifierKeyHeld(true);
        // Recalculate drop zone when modifier key changes (throttled via RAF)
        if (mousePositionRef.current) {
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }
          rafRef.current = requestAnimationFrame(() => {
            detectDropZone(mousePositionRef.current!.x, mousePositionRef.current!.y);
            rafRef.current = null;
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        isModifierHeldRef.current = false;
        setModifierKeyHeld(false);
        // Recalculate drop zone when modifier key changes (throttled via RAF)
        if (mousePositionRef.current) {
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }
          rafRef.current = requestAnimationFrame(() => {
            detectDropZone(mousePositionRef.current!.x, mousePositionRef.current!.y);
            rafRef.current = null;
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      mousePositionRef.current = null;
      lastMousePosRef.current = null;
      isModifierHeldRef.current = false;
      setModifierKeyHeld(false);
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Clear cache
      rectCacheRef.current.clear();
    };
  }, [activeId, detectDropZone]);

  /**
   * Handle drag start
   * Store the dragging tab data
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activatorEvent = event.activatorEvent as PointerEvent | undefined;
    setActiveId(active.id as string);

    // Set initial mouse position in ref
    if (activatorEvent) {
      mousePositionRef.current = { x: activatorEvent.clientX, y: activatorEvent.clientY };
      // Track initial modifier key state
      const modifierHeld = activatorEvent.ctrlKey || activatorEvent.metaKey;
      isModifierHeldRef.current = modifierHeld;
      setModifierKeyHeld(modifierHeld);
    }

    // Extract tab drag data from active element
    const dragData = active.data.current as TabDragData | undefined;
    if (dragData && dragData.type === 'tab') {
      setDraggingTab(dragData);
    } else {
      console.warn('Drag data is not a tab:', dragData);
    }
  }, [setDraggingTab, setModifierKeyHeld]);


  /**
   * Handle drag over
   * This is called by dnd-kit when dragging over droppable elements
   * But we also detect edges continuously via mousemove listener (throttled with RAF)
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Edge detection is now handled continuously by mousemove listener (throttled)
    // This handler is kept for compatibility but edge detection happens in detectDropZone
    const { active } = event;
    const dragData = active.data.current as TabDragData | undefined;
    if (!dragData || dragData.type !== 'tab') {
      return;
    }
    
    // Use current mouse position from ref (throttled via RAF)
    if (mousePositionRef.current) {
      const pos = mousePositionRef.current;
      const lastPos = lastMousePosRef.current;
      
      // Only recalculate if moved significantly
      if (!lastPos || 
          Math.abs(pos.x - lastPos.x) > MOUSE_MOVE_THRESHOLD || 
          Math.abs(pos.y - lastPos.y) > MOUSE_MOVE_THRESHOLD) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          detectDropZone(pos.x, pos.y);
          lastMousePosRef.current = pos;
          rafRef.current = null;
        });
      }
    }
  }, [detectDropZone]);

  /**
   * Handle drag end
   * Move tab to new group if dropped on a different tab bar
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active drag state
    setActiveId(null);
    setDraggingTab(null);

    // Get drag data from active element
    const dragData = active.data.current as TabDragData | undefined;
    if (!dragData) {
      console.warn('No drag data found');
      return;
    }

    if (dragData.type !== 'tab') {
      console.warn('Drag data is not a tab:', dragData);
      return;
    }

    const { tabId, tabGroupId: fromGroupId } = dragData;
    const tabStore = useTabStore.getState();

    // Get drop data from over element
    const overData = over?.data.current;
    
    // Get active drop zone from store (set during drag over)
    const activeDropZone = tabStore.activeDropZone;
    
    // Check if dropped on empty canvas
    if (activeDropZone && activeDropZone.type === 'empty-canvas') {
      // Create main panel and move tab there
      ensureMainPanelExists();
      const mainPanelId = getMainPanelId();
      
      // Create tab group with the tab
      const createdGroupId = tabStore.createTabGroupWithTab(tabId, fromGroupId, { x: 0, y: 0 });
      setPanelTabGroupMapping(mainPanelId, createdGroupId);
      tabStore.setActiveDropZone(null);
      return;
    }
    
    // Check if dropped on panel edge (create new panel)
    if (activeDropZone && (activeDropZone.type === 'top' || activeDropZone.type === 'right' || 
        activeDropZone.type === 'bottom' || activeDropZone.type === 'left')) {
      const targetPanelId = activeDropZone.targetPanelId;
      if (!targetPanelId) {
        console.warn('[DndTabContext] Edge drop zone has no target panel ID');
        tabStore.setActiveDropZone(null);
        return;
      }
      
      // Get current layout
      const state = usePanelStore.getState();
      const layout = state.currentLayout;
      
      if (!layout) {
        console.error('[DndTabContext] No layout exists for panel split');
        tabStore.setActiveDropZone(null);
        return;
      }
      
      // Validate split operation before proceeding
      const validation = validateSplitOperation(layout, targetPanelId, activeDropZone.type as SplitEdge);
      if (!validation.valid) {
        console.error(`[DndTabContext] Invalid split operation: ${validation.error}`);
        tabStore.setActiveDropZone(null);
        return;
      }
      
      // Create new tab group for the new panel
      const newTabGroupId = tabStore.createTabGroupWithTab(tabId, fromGroupId, { x: 0, y: 0 });
      
      // Check if main panel exists to determine new panel ID
      const mainPanelExists = layout.groups.some((group) =>
        group.panels.some((panel) => {
          if ('id' in panel && panel.id === MAIN_PANEL_ID) return true;
          if ('direction' in panel) {
            return panel.panels.some((p) => 'id' in p && p.id === MAIN_PANEL_ID);
          }
          return false;
        })
      );
      
      // Create new panel configuration
      const newPanelId = mainPanelExists ? crypto.randomUUID() : MAIN_PANEL_ID;
      const newPanel: PanelConfig = {
        id: newPanelId,
        component: 'editor',
        defaultSize: 50,
        minSize: 20,
        maxSize: 100,
        collapsible: false,
        collapsed: false,
        tabGroupId: newTabGroupId,
      };
      
      // Perform panel split using utility function
      const splitResult = splitPanel(
        layout,
        targetPanelId,
        activeDropZone.type as SplitEdge,
        newPanel,
        newTabGroupId
      );
      
      if (!splitResult.success) {
        console.error(`[DndTabContext] Panel split failed: ${splitResult.error}`);
        tabStore.setActiveDropZone(null);
        return;
      }
      
      // Update layout with split result
      if (splitResult.updatedLayout) {
        updateLayout(splitResult.updatedLayout);
      }
      
      // Map panel to tab group
      if (splitResult.newPanelId) {
        setPanelTabGroupMapping(splitResult.newPanelId, newTabGroupId);
      }
      
      tabStore.setActiveDropZone(null);
      return;
    }

    // If no drop target, do nothing
    if (!over) {
      tabStore.setActiveDropZone(null);
      return;
    }
    
    // Check if reordering within same group (useSortable case)
    // When using useSortable, over.id will be another tab (tab-{id}), not the tab bar
    if (over && active.id.startsWith('tab-') && over.id.startsWith('tab-')) {
      // Both are tabs - check if they're in the same group
      const activeTabId = active.id.replace('tab-', '');
      const overTabId = over.id.replace('tab-', '');
      
      // Get the tab group for the active tab
      const tabGroup = tabStore.getTabGroup(fromGroupId);
      if (!tabGroup) {
        console.error(`Tab group not found: ${fromGroupId}`);
        tabStore.setActiveDropZone(null);
        return;
      }
      
      // Check if both tabs are in the same group
      const activeTabInGroup = tabGroup.tabs.find(t => t.id === activeTabId);
      const overTabInGroup = tabGroup.tabs.find(t => t.id === overTabId);
      
      if (activeTabInGroup && overTabInGroup) {
        // Both tabs are in the same group - handle reorder
        const oldIndex = tabGroup.tabs.findIndex(t => t.id === activeTabId);
        const newIndex = tabGroup.tabs.findIndex(t => t.id === overTabId);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          // Reorder tabs using arrayMove
          const reorderedTabs = arrayMove(tabGroup.tabs, oldIndex, newIndex);
          const reorderedTabIds = reorderedTabs.map(t => t.id);
          tabStore.reorderTabsInGroup(fromGroupId, reorderedTabIds);
        }
        tabStore.setActiveDropZone(null);
        return;
      }
    }
    
    // Check if dropped on a tab bar (moving between groups)
    if (overData && typeof overData === 'object' && 'type' in overData) {
      if (overData.type === 'tab-bar') {
        const targetTabGroupId = overData.tabGroupId as string | undefined;
        
        if (!targetTabGroupId) {
          console.warn('Tab bar has no tabGroupId');
          tabStore.setActiveDropZone(null);
          return;
        }
        
        // Check if dropping on same group (should reorder instead of move)
        if (fromGroupId === targetTabGroupId) {
          // Same group - handle as reorder
          const fromGroup = tabStore.getTabGroup(fromGroupId);
          if (!fromGroup) {
            console.error(`Source tab group not found: ${fromGroupId}`);
            tabStore.setActiveDropZone(null);
            return;
          }
          
          const oldIndex = fromGroup.tabs.findIndex(t => t.id === tabId);
          const insertIndex = activeDropZone?.insertIndex;
          
          // If insertIndex is provided and different from current position, reorder
          if (insertIndex !== undefined && oldIndex !== -1 && oldIndex !== insertIndex) {
            const reorderedTabs = arrayMove(fromGroup.tabs, oldIndex, insertIndex);
            const reorderedTabIds = reorderedTabs.map(t => t.id);
            tabStore.reorderTabsInGroup(fromGroupId, reorderedTabIds);
          }
          // Otherwise, no-op (tab already in correct position)
          tabStore.setActiveDropZone(null);
          return;
        }
        
        // Different group - move tab
        // Verify both groups exist
        const fromGroup = tabStore.getTabGroup(fromGroupId);
        const toGroup = tabStore.getTabGroup(targetTabGroupId);
        
        if (!fromGroup) {
          console.error(`Source tab group not found: ${fromGroupId}`);
          tabStore.setActiveDropZone(null);
          return;
        }
        
        if (!toGroup) {
          console.error(`Target tab group not found: ${targetTabGroupId}`);
          tabStore.setActiveDropZone(null);
          return;
        }
        
        // Move the tab
        const insertIndex = activeDropZone?.insertIndex;
        tabStore.moveTabToGroup(tabId, fromGroupId, targetTabGroupId, insertIndex);
      }
    } else {
      console.warn('Invalid over data:', overData);
    }
    
    // Clear drop zone
    tabStore.setActiveDropZone(null);
  }, [setDraggingTab, currentLayout, ensureMainPanelExists, getMainPanelId, setPanelTabGroupMapping]);

  /**
   * Handle drag cancel
   * Reset drag state
   */
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDraggingTab(null);
    const tabStore = useTabStore.getState();
    tabStore.setActiveDropZone(null);
  }, [setDraggingTab]);

  // Get dragging tab for overlay
  const draggingTabData = draggingTab;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DropZoneIndicator />
      <DragOverlay>
        {draggingTabData && activeId ? (
          <div
            className="
              flex items-center gap-2 px-3 py-2
              bg-[#2d2d30] border border-[#3e3e42]
              text-[#cccccc] text-sm font-normal
              rounded shadow-lg
              opacity-90
              cursor-grabbing
            "
          >
            {draggingTabData.tabLabel}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
