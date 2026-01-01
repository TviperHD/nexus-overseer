/**
 * Drag and Drop Test Component
 * 
 * Provides a dedicated test interface for testing tab drag-and-drop functionality
 * with easy-to-use buttons to set up different test scenarios.
 */

import React, { useState } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { usePanelStore } from '@/stores/panelStore';
import { createTabForType, TAB_TYPES, type TabType } from '@/utils/tabTypeHelpers';
import { PanelGroup } from '../Panels';
import { createDefaultLayout } from '@/utils/defaultLayout';

/**
 * Test scenarios for drag-and-drop
 */
type TestScenario = 
  | 'empty-canvas'
  | 'single-panel'
  | 'two-panels-horizontal'
  | 'two-panels-vertical'
  | 'three-panels-grid'
  | 'multiple-tabs';

interface DragDropTestProps {
  className?: string;
}

export const DragDropTest: React.FC<DragDropTestProps> = ({ className = '' }) => {
  const [currentScenario, setCurrentScenario] = useState<TestScenario | null>(null);
  const { tabGroups, createTabGroup, addTab, setActiveTab, removeTab, removeTabGroup } = useTabStore();
  const { currentLayout, resetLayout, setPanelTabGroupMapping, getTabGroupForPanel } = usePanelStore();

  /**
   * Reset everything to empty state
   */
  const handleReset = () => {
    // Clear all tab groups
    const allGroupIds = tabGroups.map(g => g.id);
    allGroupIds.forEach(id => removeTabGroup(id));
    
    // Reset panel layout
    resetLayout();
    
    setCurrentScenario(null);
  };

  /**
   * Setup: Empty Canvas
   * No panels, no tabs - just empty canvas
   */
  const setupEmptyCanvas = () => {
    handleReset();
    setCurrentScenario('empty-canvas');
  };

  /**
   * Setup: Single Panel
   * One panel with one tab group containing multiple tabs
   */
  const setupSinglePanel = () => {
    handleReset();
    
    // Create default layout with one panel
    const layout = createDefaultLayout();
    usePanelStore.setState({ currentLayout: layout });
    
    // Create tab group for the editor panel
    const editorPanelId = 'editor-panel';
    const tabGroupId = createTabGroup();
    setPanelTabGroupMapping(editorPanelId, tabGroupId);
    
    // Add 3 tabs to the group
    const tab1 = createTabForType('file');
    tab1.label = 'main.ts';
    addTab(tabGroupId, tab1);
    
    const tab2 = createTabForType('file');
    tab2.label = 'utils.ts';
    addTab(tabGroupId, tab2);
    
    const tab3 = createTabForType('chat');
    addTab(tabGroupId, tab3);
    
    setActiveTab(tabGroupId, tab1.id);
    setCurrentScenario('single-panel');
  };

  /**
   * Setup: Two Panels Horizontal
   * Two panels side by side, each with tabs
   */
  const setupTwoPanelsHorizontal = () => {
    handleReset();
    
    // Create layout with two horizontal panels
    const layout = {
      id: 'test-layout',
      groups: [
        {
          id: 'group-1',
          orientation: 'horizontal' as const,
          panels: [
            {
              id: 'panel-left',
              defaultSize: 50,
              minSize: 20,
              maxSize: 80,
              collapsible: false,
              component: 'editor',
            },
            {
              id: 'panel-right',
              defaultSize: 50,
              minSize: 20,
              maxSize: 80,
              collapsible: false,
              component: 'chat',
            },
          ],
        },
      ],
    };
    
    usePanelStore.setState({ currentLayout: layout });
    
    // Create tab groups for both panels
    const leftTabGroupId = createTabGroup();
    setPanelTabGroupMapping('panel-left', leftTabGroupId);
    
    const leftTab1 = createTabForType('file');
    leftTab1.label = 'left-panel.ts';
    addTab(leftTabGroupId, leftTab1);
    setActiveTab(leftTabGroupId, leftTab1.id);
    
    const rightTabGroupId = createTabGroup();
    setPanelTabGroupMapping('panel-right', rightTabGroupId);
    
    const rightTab1 = createTabForType('chat');
    addTab(rightTabGroupId, rightTab1);
    setActiveTab(rightTabGroupId, rightTab1.id);
    
    setCurrentScenario('two-panels-horizontal');
  };

  /**
   * Setup: Two Panels Vertical
   * Two panels stacked vertically, each with tabs
   */
  const setupTwoPanelsVertical = () => {
    handleReset();
    
    // Create layout with two vertical panels
    const layout = {
      id: 'test-layout',
      groups: [
        {
          id: 'group-1',
          orientation: 'vertical' as const,
          panels: [
            {
              id: 'panel-top',
              defaultSize: 50,
              minSize: 20,
              maxSize: 80,
              collapsible: false,
              component: 'editor',
            },
            {
              id: 'panel-bottom',
              defaultSize: 50,
              minSize: 20,
              maxSize: 80,
              collapsible: false,
              component: 'chat',
            },
          ],
        },
      ],
    };
    
    usePanelStore.setState({ currentLayout: layout });
    
    // Create tab groups for both panels
    const topTabGroupId = createTabGroup();
    setPanelTabGroupMapping('panel-top', topTabGroupId);
    
    const topTab1 = createTabForType('file');
    topTab1.label = 'top-panel.ts';
    addTab(topTabGroupId, topTab1);
    setActiveTab(topTabGroupId, topTab1.id);
    
    const bottomTabGroupId = createTabGroup();
    setPanelTabGroupMapping('panel-bottom', bottomTabGroupId);
    
    const bottomTab1 = createTabForType('chat');
    addTab(bottomTabGroupId, bottomTab1);
    setActiveTab(bottomTabGroupId, bottomTab1.id);
    
    setCurrentScenario('two-panels-vertical');
  };

  /**
   * Setup: Three Panels Grid
   * Three panels in a grid layout (one horizontal group with nested vertical)
   */
  const setupThreePanelsGrid = () => {
    handleReset();
    
    // Create layout with three panels in grid
    const layout = {
      id: 'test-layout',
      groups: [
        {
          id: 'group-1',
          orientation: 'horizontal' as const,
          panels: [
            {
              id: 'panel-left',
              defaultSize: 33,
              minSize: 15,
              maxSize: 50,
              collapsible: false,
              component: 'editor',
            },
            {
              id: 'panel-middle',
              defaultSize: 34,
              minSize: 15,
              maxSize: 50,
              collapsible: false,
              component: 'chat',
            },
            {
              id: 'panel-right',
              defaultSize: 33,
              minSize: 15,
              maxSize: 50,
              collapsible: false,
              component: 'task-scheduler',
            },
          ],
        },
      ],
    };
    
    usePanelStore.setState({ currentLayout: layout });
    
    // Create tab groups for all panels
    ['panel-left', 'panel-middle', 'panel-right'].forEach((panelId, index) => {
      const tabGroupId = createTabGroup();
      setPanelTabGroupMapping(panelId, tabGroupId);
      
      const tab = createTabForType(index === 0 ? 'file' : index === 1 ? 'chat' : 'task-scheduler');
      tab.label = `${panelId}.ts`;
      addTab(tabGroupId, tab);
      setActiveTab(tabGroupId, tab.id);
    });
    
    setCurrentScenario('three-panels-grid');
  };

  /**
   * Setup: Multiple Tabs
   * Single panel with many tabs (test tab bar scrolling)
   */
  const setupMultipleTabs = () => {
    handleReset();
    
    const layout = createDefaultLayout();
    usePanelStore.setState({ currentLayout: layout });
    
    const editorPanelId = 'editor-panel';
    const tabGroupId = createTabGroup();
    setPanelTabGroupMapping(editorPanelId, tabGroupId);
    
    // Add 10 tabs
    const tabTypes: TabType[] = ['file', 'chat', 'task-scheduler', 'file', 'chat', 'file', 'task-scheduler', 'file', 'chat', 'file'];
    let firstTabId: string | null = null;
    tabTypes.forEach((type, index) => {
      const tab = createTabForType(type);
      tab.label = `tab-${index + 1}.ts`;
      addTab(tabGroupId, tab);
      if (index === 0) {
        firstTabId = tab.id;
      }
    });
    
    if (firstTabId) {
      setActiveTab(tabGroupId, firstTabId);
    }
    setCurrentScenario('multiple-tabs');
  };

  /**
   * Quick action: Add tab to main panel
   */
  const handleAddTab = (tabType: TabType) => {
    const layout = usePanelStore.getState().currentLayout;
    if (!layout || !layout.groups || layout.groups.length === 0) {
      // No layout - create single panel first
      setupSinglePanel();
      // Wait a bit for state to update, then add tab
      setTimeout(() => {
        const mainPanelId = 'editor-panel';
        let tabGroupId = usePanelStore.getState().getTabGroupForPanel(mainPanelId);
        if (!tabGroupId) {
          tabGroupId = useTabStore.getState().createTabGroup();
          usePanelStore.getState().setPanelTabGroupMapping(mainPanelId, tabGroupId);
        }
        const newTab = createTabForType(tabType);
        useTabStore.getState().addTab(tabGroupId, newTab);
        useTabStore.getState().setActiveTab(tabGroupId, newTab.id);
      }, 100);
      return;
    }
    
    // Find first panel
    const firstPanel = layout.groups[0]?.panels[0];
    if (!firstPanel) return;
    
    let tabGroupId = getTabGroupForPanel(firstPanel.id);
    if (!tabGroupId) {
      tabGroupId = createTabGroup();
      setPanelTabGroupMapping(firstPanel.id, tabGroupId);
    }
    
    const newTab = createTabForType(tabType);
    addTab(tabGroupId, newTab);
    setActiveTab(tabGroupId, newTab.id);
  };

  return (
    <div className={`h-full w-full flex flex-col bg-[#1e1e1e] ${className}`}>
      {/* Test Controls Panel */}
      <div className="flex-shrink-0 bg-[#2d2d30] border-b border-[#3e3e42] p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#cccccc] font-medium">Test Scenarios:</span>
            <button
              onClick={setupEmptyCanvas}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                currentScenario === 'empty-canvas'
                  ? 'bg-[#007acc] border-[#007acc] text-white'
                  : 'bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
              }`}
            >
              Empty Canvas
            </button>
            <button
              onClick={setupSinglePanel}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                currentScenario === 'single-panel'
                  ? 'bg-[#007acc] border-[#007acc] text-white'
                  : 'bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
              }`}
            >
              Single Panel
            </button>
            <button
              onClick={setupTwoPanelsHorizontal}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                currentScenario === 'two-panels-horizontal'
                  ? 'bg-[#007acc] border-[#007acc] text-white'
                  : 'bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
              }`}
            >
              2 Panels (H)
            </button>
            <button
              onClick={setupTwoPanelsVertical}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                currentScenario === 'two-panels-vertical'
                  ? 'bg-[#007acc] border-[#007acc] text-white'
                  : 'bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
              }`}
            >
              2 Panels (V)
            </button>
            <button
              onClick={setupThreePanelsGrid}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                currentScenario === 'three-panels-grid'
                  ? 'bg-[#007acc] border-[#007acc] text-white'
                  : 'bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
              }`}
            >
              3 Panels Grid
            </button>
            <button
              onClick={setupMultipleTabs}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                currentScenario === 'multiple-tabs'
                  ? 'bg-[#007acc] border-[#007acc] text-white'
                  : 'bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
              }`}
            >
              Many Tabs
            </button>
          </div>
          
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[#3e3e42]">
            <span className="text-sm text-[#cccccc] font-medium">Quick Add:</span>
            {TAB_TYPES.map((tabTypeConfig) => (
              <button
                key={tabTypeConfig.type}
                onClick={() => handleAddTab(tabTypeConfig.type)}
                className="px-3 py-1.5 text-xs rounded bg-[#3e3e42] border border-[#3e3e42] text-[#cccccc] hover:bg-[#464647] transition-colors"
              >
                {tabTypeConfig.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs rounded bg-[#d32f2f] border border-[#d32f2f] text-white hover:bg-[#c62828] transition-colors ml-auto"
          >
            Reset All
          </button>
        </div>
        
        {/* Current Scenario Info */}
        {currentScenario && (
          <div className="mt-3 pt-3 border-t border-[#3e3e42]">
            <p className="text-xs text-[#858585]">
              <span className="text-[#cccccc] font-medium">Current Scenario:</span>{' '}
              <span className="text-[#007acc]">{currentScenario}</span>
            </p>
            <p className="text-xs text-[#858585] mt-1">
              <span className="text-[#cccccc] font-medium">Tab Groups:</span>{' '}
              {tabGroups.length} | <span className="text-[#cccccc] font-medium">Panels:</span>{' '}
              {currentLayout?.groups?.[0]?.panels?.length || 0}
            </p>
          </div>
        )}
      </div>
      
      {/* Test Area - Render panels if layout exists */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        {currentLayout && currentLayout.groups && currentLayout.groups.length > 0 ? (
          currentLayout.groups.map((group) => (
            <div key={group.id} className="h-full w-full">
              <PanelGroup config={group} />
            </div>
          ))
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-[#cccccc] mb-2">No Test Scenario Active</p>
              <p className="text-sm text-[#858585]">Select a scenario above to start testing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

