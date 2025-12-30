import React, { useState } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useEditorStore } from '@/stores/editorStore';
import { TabGroup } from './TabGroup';
import type { Tab } from '@/types/tab';

/**
 * Test component for tab system
 * Allows creating and testing tabs
 */
export const TabSystemTest: React.FC = () => {
  const { createTabGroup, addTab, tabGroups, activeTabGroupId } = useTabStore();
  const { openFile, clearAllFiles } = useEditorStore();
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabType, setNewTabType] = useState<'file' | 'panel'>('file');
  const [newTabComponent, setNewTabComponent] = useState('editor');
  const [filePathInput, setFilePathInput] = useState('');

  // Create default tab group if none exists
  React.useEffect(() => {
    if (tabGroups.length === 0) {
      createTabGroup();
    }
  }, [tabGroups.length, createTabGroup]);

  const handleCreateTab = () => {
    if (!newTabLabel.trim() || tabGroups.length === 0) {
      return;
    }

    const activeGroupId = activeTabGroupId || tabGroups[0].id;
    const newTab: Tab = {
      id: crypto.randomUUID(),
      type: newTabType,
      label: newTabLabel,
      ...(newTabType === 'file' && { filePath: `/path/to/${newTabLabel}` }),
      ...(newTabType === 'panel' && { component: newTabComponent }),
      isModified: false,
      isPinned: false,
    };

    addTab(activeGroupId, newTab);
    setNewTabLabel('');
  };

  const handleCreateFileTab = () => {
    if (tabGroups.length === 0) {
      return;
    }

    const activeGroupId = activeTabGroupId || tabGroups[0].id;
    const fileNames = ['main.ts', 'utils.ts', 'config.json', 'README.md', 'package.json'];
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];

    const newTab: Tab = {
      id: crypto.randomUUID(),
      type: 'file',
      label: randomFile,
      filePath: `/path/to/${randomFile}`,
      isModified: Math.random() > 0.5, // Random modified state for testing
      isPinned: false,
    };

    addTab(activeGroupId, newTab);
  };

  const handleCreatePanelTab = () => {
    if (tabGroups.length === 0) {
      return;
    }

    const activeGroupId = activeTabGroupId || tabGroups[0].id;
    const panelTypes = ['editor', 'chat', 'task-scheduler'];
    const randomPanel = panelTypes[Math.floor(Math.random() * panelTypes.length)];

    const newTab: Tab = {
      id: crypto.randomUUID(),
      type: 'panel',
      label: `${randomPanel} Panel`,
      component: randomPanel,
      isPinned: false,
    };

    addTab(activeGroupId, newTab);
  };

  if (tabGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
        <p>Initializing tab system...</p>
      </div>
    );
  }

  const activeGroupId = activeTabGroupId || tabGroups[0].id;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] min-w-0 overflow-hidden">
      {/* Controls */}
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] p-4 space-y-3 flex-shrink-0">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center flex-1">
            <input
              type="text"
              value={newTabLabel}
              onChange={(e) => setNewTabLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTab();
                }
              }}
              placeholder="Tab label"
              className="flex-1 px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc]"
            />
            <select
            value={newTabType}
            onChange={(e) => setNewTabType(e.target.value as 'file' | 'panel')}
            className="px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc]"
          >
            <option value="file">File</option>
            <option value="panel">Panel</option>
          </select>
          {newTabType === 'panel' && (
            <select
              value={newTabComponent}
              onChange={(e) => setNewTabComponent(e.target.value)}
              className="px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc]"
            >
              <option value="editor">Editor</option>
              <option value="chat">Chat</option>
              <option value="task-scheduler">Task Scheduler</option>
            </select>
          )}
          <button
            onClick={handleCreateTab}
            className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm rounded transition-colors"
          >
            Create Tab
          </button>
          </div>
          <button
            onClick={() => {
              const activeGroupId = activeTabGroupId || tabGroups[0]?.id;
              if (activeGroupId) {
                // Check if settings tab already exists
                const existingSettingsTab = tabGroups
                  .find((g) => g.id === activeGroupId)
                  ?.tabs.find((t) => t.type === 'panel' && t.component === 'settings');
                
                if (existingSettingsTab) {
                  // Switch to existing settings tab
                  useTabStore.getState().setActiveTab(activeGroupId, existingSettingsTab.id);
                } else {
                  // Create new settings tab
                  const settingsTab: Tab = {
                    id: crypto.randomUUID(),
                    type: 'panel',
                    label: 'Settings',
                    component: 'settings',
                    isPinned: false,
                  };
                  addTab(activeGroupId, settingsTab);
                  useTabStore.getState().setActiveTab(activeGroupId, settingsTab.id);
                }
              }
            }}
            className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm rounded transition-colors"
            title="Open Settings"
          >
            ⚙️ Settings
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateFileTab}
            className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm rounded transition-colors"
          >
            Quick File Tab
          </button>
          <button
            onClick={handleCreatePanelTab}
            className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm rounded transition-colors"
          >
            Quick Panel Tab
          </button>
          <button
            onClick={async () => {
              try {
                await clearAllFiles();
              } catch (error) {
                console.error('Failed to clear all files:', error);
                alert(`Failed to clear all files: ${error}`);
              }
            }}
            className="px-4 py-2 bg-[#d32f2f] hover:bg-[#c62828] text-white text-sm rounded transition-colors"
          >
            Clear All Files
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={filePathInput}
            onChange={(e) => setFilePathInput(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && filePathInput.trim()) {
                try {
                  await openFile(filePathInput.trim());
                  setFilePathInput('');
                } catch (error) {
                  console.error('Failed to open file:', error);
                  alert(`Failed to open file: ${error}`);
                }
              }
            }}
            placeholder="Enter file path to open (e.g., C:\\path\\to\\file.ts)"
            className="flex-1 px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc]"
          />
          <button
            onClick={async () => {
              if (filePathInput.trim()) {
                try {
                  await openFile(filePathInput.trim());
                  setFilePathInput('');
                } catch (error) {
                  console.error('Failed to open file:', error);
                  alert(`Failed to open file: ${error}`);
                }
              }
            }}
            className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm rounded transition-colors"
          >
            Open File
          </button>
        </div>
        <div className="text-xs text-[#858585]">
          <p>Keyboard shortcuts: Ctrl+Tab (cycle), Ctrl+W (close), Ctrl+1-9 (switch to tab), Ctrl+S (save), Ctrl+Shift+S (save all)</p>
        </div>
      </div>

      {/* Tab Group */}
      <div className="flex-1 overflow-hidden min-w-0">
        <TabGroup tabGroupId={activeGroupId} />
      </div>
    </div>
  );
};

