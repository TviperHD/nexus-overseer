/**
 * Panel content component
 * Renders content for each panel based on component type
 */

import React, { useEffect } from 'react';
import { TabGroup } from '../Tab/TabGroup';
import { FileTreePlaceholder } from '../FileTree/FileTreePlaceholder';
import { ChatPlaceholder } from '../Chat/ChatPlaceholder';
import { TaskSchedulerPlaceholder } from '../TaskScheduler/TaskSchedulerPlaceholder';
import { usePanelStore } from '../../stores/panelStore';

interface PanelContentProps {
  component: string;  // Component type: 'editor', 'chat', 'file-tree', 'tasks', etc.
  panelId: string;    // Panel ID
}

/**
 * Panel content component
 * Renders appropriate content based on component type
 */
export const PanelContent: React.FC<PanelContentProps> = ({ component, panelId }) => {
  // Use selector to only subscribe to the specific mapping we need
  // This prevents unnecessary re-renders and excessive function calls
  const tabGroupId = usePanelStore((state) => state.panelToTabGroupMap.get(panelId) || null);
  
  // Only call getTabGroupForPanel in useEffect (not during render) when mapping is missing
  // This ensures the mapping is created if needed, but doesn't cause render loops
  useEffect(() => {
    if (!tabGroupId && component === 'editor') {
      // Only ensure mapping exists for editor panels
      // Use a small delay to avoid calling during initial render cascade
      const timer = setTimeout(() => {
        const { getTabGroupForPanel } = usePanelStore.getState();
        getTabGroupForPanel(panelId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [panelId, tabGroupId, component]);

  // Render content based on component type
  // Note: All content must have explicit height/width to not interfere with resizing
  switch (component) {
    case 'editor':
    case 'file':
      // Render TabGroup with editor tabs
      if (tabGroupId) {
        return <TabGroup tabGroupId={tabGroupId} />;
      }
      return (
        <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
          <p className="text-sm">No tab group assigned to this panel</p>
        </div>
      );

    case 'chat':
      // Render ChatPlaceholder (or Chat component when ready)
      return <ChatPlaceholder />;

    case 'file-tree':
      // Render FileTreePlaceholder (or FileTree when ready)
      return <FileTreePlaceholder />;

    case 'tasks':
      // Render TaskSchedulerPlaceholder (or TaskScheduler when ready)
      return <TaskSchedulerPlaceholder />;

    default:
      // Unknown component type
      return (
        <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
          <p className="text-sm">Unknown component type: {component}</p>
        </div>
      );
  }
};

