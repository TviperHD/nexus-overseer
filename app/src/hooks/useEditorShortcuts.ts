/**
 * Keyboard shortcuts hook for Monaco Editor
 * Handles Ctrl+S (save), Ctrl+Shift+S (save all), Ctrl+O (open), Ctrl+N (new), etc.
 */

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useTabStore } from '@/stores/tabStore';
import { openFileDialog } from '@/utils/fileDialog';

/**
 * Hook to handle editor keyboard shortcuts
 */
export function useEditorShortcuts() {
  const { saveFile, saveAllFiles, getFileFromTab, activeFileId } = useEditorStore();
  const { tabGroups, activeTabGroupId, getActiveTab } = useTabStore();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Cmd (Mac)
      const isModifierPressed = event.ctrlKey || event.metaKey;
      
      if (!isModifierPressed) {
        return;
      }

      // Ctrl+S or Cmd+S: Save active file
      if (event.key === 's' && !event.shiftKey) {
        event.preventDefault();
        
        // Get active file
        const activeGroupId = activeTabGroupId || tabGroups[0]?.id;
        if (!activeGroupId) {
          return;
        }

        const activeTab = getActiveTab(activeGroupId);
        if (!activeTab || activeTab.type !== 'file' || !activeTab.filePath) {
          return;
        }

        try {
          await saveFile(activeTab.filePath);
          console.log(`File saved: ${activeTab.filePath}`);
        } catch (error) {
          console.error('Failed to save file:', error);
        }
      }

      // Ctrl+Shift+S or Cmd+Shift+S: Save all files
      if (event.key === 'S' && event.shiftKey) {
        event.preventDefault();
        
        try {
          await saveAllFiles();
          console.log('All files saved');
        } catch (error) {
          console.error('Failed to save all files:', error);
        }
      }

      // Ctrl+O or Cmd+O: Open file
      if (event.key === 'o' && !event.shiftKey) {
        event.preventDefault();
        
        try {
          const selectedPath = await openFileDialog({
            title: 'Open File',
            multiple: false,
          });
          
          if (selectedPath && typeof selectedPath === 'string') {
            const { openFile } = useEditorStore.getState();
            await openFile(selectedPath);
          }
        } catch (error) {
          console.error('Failed to open file:', error);
        }
      }

      // Ctrl+N or Cmd+N: New file
      if (event.key === 'n' && !event.shiftKey) {
        event.preventDefault();
        
        try {
          // Create a new untitled file
          const tabStore = useTabStore.getState();
          const activeGroupId = activeTabGroupId || tabGroups[0]?.id;
          
          if (!activeGroupId) {
            // Create a new tab group if none exists
            const newGroupId = tabStore.createTabGroup();
            const newTab = {
              id: crypto.randomUUID(),
              type: 'file' as const,
              label: 'Untitled',
              filePath: null,
              isModified: false,
              isPinned: false,
            };
            tabStore.addTab(newGroupId, newTab);
            tabStore.setActiveTab(newGroupId, newTab.id);
          } else {
            const newTab = {
              id: crypto.randomUUID(),
              type: 'file' as const,
              label: 'Untitled',
              filePath: null,
              isModified: false,
              isPinned: false,
            };
            tabStore.addTab(activeGroupId, newTab);
            tabStore.setActiveTab(activeGroupId, newTab.id);
          }
        } catch (error) {
          console.error('Failed to create new file:', error);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveFile, saveAllFiles, activeTabGroupId, tabGroups, getActiveTab]);
}

