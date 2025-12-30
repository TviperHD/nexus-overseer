import React from 'react';
import { MonacoEditor } from '@/components/Editor';
import { Settings } from '@/components/Settings';
import type { Tab } from '@/types/tab';

/**
 * TabContent component props
 */
interface TabContentProps {
  tab: Tab | null;
}

/**
 * Tab content component
 * Renders content based on tab type (file or panel)
 */
export const TabContent: React.FC<TabContentProps> = ({ tab }) => {
  // Empty state - no active tab
  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <p className="text-base mb-2">No tab selected</p>
          <p className="text-sm">Open a file or panel to get started</p>
        </div>
      </div>
    );
  }

  // File tab - render Monaco Editor
  if (tab.type === 'file') {
    return <MonacoEditor filePath={tab.filePath || null} />;
  }

  // Panel tab - render panel component based on component type
  if (tab.type === 'panel') {
    const componentType = tab.component || 'unknown';

    // Placeholder components for different panel types
    // These will be implemented in later phases
    switch (componentType) {
      case 'editor':
        return (
          <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
            <p className="text-sm">Editor Panel (to be implemented)</p>
          </div>
        );
      case 'chat':
        return (
          <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
            <p className="text-sm">Chat Panel (to be implemented)</p>
          </div>
        );
      case 'task-scheduler':
        return (
          <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
            <p className="text-sm">Task Scheduler Panel (to be implemented)</p>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
            <div className="text-center">
              <p className="text-sm mb-2">Unknown panel type: {componentType}</p>
              <p className="text-xs text-[#6a6a6a]">
                Component type &quot;{componentType}&quot; is not recognized.
              </p>
            </div>
          </div>
        );
    }
  }

  // Fallback for unknown tab type
  return (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
      <div className="text-center">
        <p className="text-sm mb-2">Unknown tab type</p>
        <p className="text-xs text-[#6a6a6a]">
          Tab type &quot;{tab.type}&quot; is not recognized.
        </p>
      </div>
    </div>
  );
};

