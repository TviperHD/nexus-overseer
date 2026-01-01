import React, { useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useTabStore } from '@/stores/tabStore';
import type { Tab } from '@/types/tab';
import { Tab as TabComponent } from './Tab';

/**
 * TabBar component props
 */
interface TabBarProps {
  tabGroupId: string;
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

/**
 * Tab bar component
 * Displays all tabs in a tab group and handles tab interactions
 * 
 * Memoized to prevent unnecessary re-renders during drag operations
 */
export const TabBar: React.FC<TabBarProps> = React.memo<TabBarProps>(({
  tabGroupId,
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
}) => {
  const tabBarRef = React.useRef<HTMLDivElement>(null);
  
  // Optimized selector: subscribe only to activeDropZone (not entire store)
  const activeDropZone = useTabStore(state => state.activeDropZone);
  
  // Make tab bar droppable
  const { setNodeRef, isOver } = useDroppable({
    id: `tab-bar-${tabGroupId}`,
    data: {
      type: 'tab-bar' as const,
      tabGroupId: tabGroupId,
    },
  });
  
  // Combine refs
  const combinedRef = (node: HTMLDivElement | null) => {
    tabBarRef.current = node;
    setNodeRef(node);
  };

  /**
   * Handle mouse wheel scrolling for horizontal scroll
   */
  useEffect(() => {
    const tabBar = tabBarRef.current;
    if (!tabBar) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scrolling if the tab bar can scroll
      if (tabBar.scrollWidth > tabBar.clientWidth) {
        // Prevent vertical scrolling on the tab bar
        e.preventDefault();
        // Scroll horizontally
        tabBar.scrollLeft += e.deltaY;
      }
    };

    tabBar.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      tabBar.removeEventListener('wheel', handleWheel);
    };
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if modifier keys are pressed (Ctrl on Windows/Linux, Cmd on Mac)
      const isModifierPressed = e.ctrlKey || e.metaKey;

      if (!isModifierPressed) {
        return;
      }

      // Ctrl+Tab (or Cmd+Tab) - Cycle through tabs
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (tabs.length === 0) return;

        const currentIndex = activeTabId
          ? tabs.findIndex((t) => t.id === activeTabId)
          : -1;
        const nextIndex = (currentIndex + 1) % tabs.length;
        onTabSelect(tabs[nextIndex].id);
        return;
      }

      // Ctrl+Shift+Tab - Cycle backwards through tabs
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        if (tabs.length === 0) return;

        const currentIndex = activeTabId
          ? tabs.findIndex((t) => t.id === activeTabId)
          : -1;
        const nextIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
        onTabSelect(tabs[nextIndex].id);
        return;
      }

      // Ctrl+W (or Cmd+W) - Close active tab
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (activeTabId) {
          onTabClose(activeTabId);
        }
        return;
      }

      // Ctrl+1 through Ctrl+9 - Switch to specific tab (first 9 tabs)
      const numberKey = parseInt(e.key, 10);
      if (numberKey >= 1 && numberKey <= 9) {
        e.preventDefault();
        const tabIndex = numberKey - 1;
        if (tabIndex < tabs.length) {
          onTabSelect(tabs[tabIndex].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabs, activeTabId, onTabSelect, onTabClose]);

  // Check if we should show insertion line
  const showInsertionLine = activeDropZone?.type === 'tab-bar' && 
                            activeDropZone.targetTabGroupId === tabGroupId &&
                            activeDropZone.insertIndex !== undefined;
  
  // Calculate insertion line position
  const insertionLineStyle = React.useMemo(() => {
    if (!showInsertionLine || !tabBarRef.current || activeDropZone.insertIndex === undefined) {
      return null;
    }
    
    const insertIndex = activeDropZone.insertIndex;
    const tabBarRect = tabBarRef.current.getBoundingClientRect();
    
    if (insertIndex === 0) {
      // Before first tab
      if (tabs.length === 0) {
        return { left: '0px' };
      }
      const firstTab = tabs[0];
      const firstTabEl = document.getElementById(`tab-${firstTab.id}`);
      if (firstTabEl) {
        const firstTabRect = firstTabEl.getBoundingClientRect();
        return { left: `${firstTabRect.left - tabBarRect.left}px` };
      }
      return { left: '0px' };
    } else if (insertIndex >= tabs.length) {
      // After last tab
      if (tabs.length === 0) {
        return { left: '0px' };
      }
      const lastTab = tabs[tabs.length - 1];
      const lastTabEl = document.getElementById(`tab-${lastTab.id}`);
      if (lastTabEl) {
        const lastTabRect = lastTabEl.getBoundingClientRect();
        return { left: `${lastTabRect.right - tabBarRect.left}px` };
      }
      return { left: `${tabBarRect.width}px` };
    } else {
      // Between tabs
      const beforeTab = tabs[insertIndex - 1];
      const beforeTabEl = document.getElementById(`tab-${beforeTab.id}`);
      if (beforeTabEl) {
        const beforeTabRect = beforeTabEl.getBoundingClientRect();
        return { left: `${beforeTabRect.right - tabBarRect.left}px` };
      }
      return null;
    }
  }, [showInsertionLine, activeDropZone, tabs, tabGroupId]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <SortableContext
      items={tabs.map(t => `tab-${t.id}`)}
      strategy={horizontalListSortingStrategy}
    >
      <div
        ref={combinedRef}
        id={`tab-bar-${tabGroupId}`}
        data-droppable-id={`tab-bar-${tabGroupId}`}
        className={`
          flex items-center bg-[#2d2d30] overflow-x-auto overflow-y-hidden h-[35px] min-w-0 flex-shrink-0
          relative
          ${isOver ? 'border-t-2 border-[#007acc]' : ''}
        `}
        role="tablist"
        aria-label="Tabs"
        style={{ scrollbarWidth: 'thin' }}
      >
        {tabs.map((tab) => (
          <TabComponent
            key={tab.id}
            tab={tab}
            tabGroupId={tabGroupId}
            isActive={tab.id === activeTabId}
            onSelect={() => onTabSelect(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
        {/* Insertion line indicator */}
        {showInsertionLine && insertionLineStyle && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: insertionLineStyle.left,
              width: '2px',
              height: '100%',
              backgroundColor: '#007acc',
              pointerEvents: 'none',
              zIndex: 10,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </SortableContext>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props change
  return (
    prevProps.tabGroupId === nextProps.tabGroupId &&
    prevProps.activeTabId === nextProps.activeTabId &&
    prevProps.tabs.length === nextProps.tabs.length &&
    prevProps.tabs.every((tab, index) => {
      const nextTab = nextProps.tabs[index];
      return nextTab && 
        tab.id === nextTab.id &&
        tab.label === nextTab.label &&
        tab.isModified === nextTab.isModified &&
        tab.isPinned === nextTab.isPinned;
    })
  );
});

