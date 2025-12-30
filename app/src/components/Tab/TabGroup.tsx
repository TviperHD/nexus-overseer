import React, { useState } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useEditorStore } from '@/stores/editorStore';
import { TabBar } from './TabBar';
import { TabContent } from './TabContent';
import { UnsavedChangesDialog } from '../Editor/UnsavedChangesDialog';

/**
 * TabGroup component props
 */
interface TabGroupProps {
  tabGroupId: string;
}

/**
 * Tab group component
 * Container for tabs that displays tab bar and active tab content
 */
export const TabGroup: React.FC<TabGroupProps> = ({ tabGroupId }) => {
  const { getTabGroup, getActiveTab, setActiveTab, removeTab } = useTabStore();
  const { closeFile, saveFile } = useEditorStore();
  const [unsavedDialog, setUnsavedDialog] = useState<{
    tabId: string;
    fileName: string;
    filePath: string;
  } | null>(null);

  const tabGroup = getTabGroup(tabGroupId);
  const activeTab = getActiveTab(tabGroupId);

  // Handle missing tab group
  if (!tabGroup) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <p className="text-sm mb-2">Tab group not found</p>
          <p className="text-xs text-[#6a6a6a]">
            Tab group ID: {tabGroupId}
          </p>
        </div>
      </div>
    );
  }

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabGroupId, tabId);
  };

  const handleTabClose = async (tabId: string) => {
    const tab = tabGroup?.tabs.find((t) => t.id === tabId);
    
    // If it's a file tab with unsaved changes, show dialog
    if (tab?.type === 'file' && tab.filePath && tab.isModified) {
      setUnsavedDialog({
        tabId,
        fileName: tab.label,
        filePath: tab.filePath,
      });
      return;
    }

    // If it's a file tab, use editor store to close it
    if (tab?.type === 'file' && tab.filePath) {
      try {
        await closeFile(tab.filePath);
      } catch (error) {
        console.error('Failed to close file:', error);
        // Fall back to removing tab directly if closeFile fails
        removeTab(tabGroupId, tabId);
      }
    } else {
      // For panel tabs, just remove the tab
      removeTab(tabGroupId, tabId);
    }
  };

  const handleDialogSave = async () => {
    if (!unsavedDialog) return;
    
    try {
      await saveFile(unsavedDialog.filePath);
      await closeFile(unsavedDialog.filePath);
      setUnsavedDialog(null);
    } catch (error) {
      console.error('Failed to save file:', error);
      // Still close the dialog even if save fails
      setUnsavedDialog(null);
    }
  };

  const handleDialogDiscard = async () => {
    if (!unsavedDialog) return;
    
    try {
      // Force close the file, discarding unsaved changes
      await closeFile(unsavedDialog.filePath, true);
      setUnsavedDialog(null);
    } catch (error) {
      console.error('Failed to close file:', error);
      // Fall back to removing tab directly
      removeTab(tabGroupId, unsavedDialog.tabId);
      setUnsavedDialog(null);
    }
  };

  const handleDialogCancel = () => {
    setUnsavedDialog(null);
  };

  // Empty state - no tabs
  if (tabGroup.tabs.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-[#2d2d30] h-[35px] flex items-center px-4">
          <span className="text-xs text-[#858585]">No tabs open</span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-[#858585]">
          <div className="text-center">
            <p className="text-base mb-2">No tabs in this group</p>
            <p className="text-sm text-[#6a6a6a]">
              Create or open a tab to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full min-w-0">
        {/* Tab bar */}
        <div className="flex-shrink-0 min-w-0">
          <TabBar
            tabGroupId={tabGroupId}
            tabs={tabGroup.tabs}
            activeTabId={tabGroup.activeTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
          />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden min-w-0">
          <TabContent tab={activeTab} />
        </div>
      </div>

      {/* Unsaved changes dialog */}
      {unsavedDialog && (
        <UnsavedChangesDialog
          fileName={unsavedDialog.fileName}
          onSave={handleDialogSave}
          onDiscard={handleDialogDiscard}
          onCancel={handleDialogCancel}
        />
      )}
    </>
  );
};

