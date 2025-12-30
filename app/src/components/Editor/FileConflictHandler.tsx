/**
 * File conflict handler component
 * Listens for file conflict events and displays the conflict dialog
 */

import React, { useEffect, useState } from 'react';
import { FileConflictDialog } from './FileConflictDialog';
import { resolveFileConflict, getActiveConflict } from '@/utils/editorFileWatcher';
import { useTabStore } from '@/stores/tabStore';
import { useEditorStore } from '@/stores/editorStore';

/**
 * File conflict handler component
 * Manages file conflict dialog state and resolution
 */
export const FileConflictHandler: React.FC = () => {
  const [conflict, setConflict] = useState<{ 
    filePath: string; 
    fileName: string; 
    hasUnsavedChanges?: boolean;
  } | null>(null);

  useEffect(() => {
    const handleConflict = (event: CustomEvent) => {
      const conflictData = event.detail as { 
        filePath: string; 
        fileName: string; 
        hasUnsavedChanges?: boolean;
      };
      setConflict(conflictData);
    };

    // Listen for file conflict events
    window.addEventListener('file-conflict', handleConflict as EventListener);

    // Check for existing conflict on mount
    const activeConflict = getActiveConflict();
    if (activeConflict) {
      // Check if there are unsaved changes by looking at the tab
      const tabStore = useTabStore.getState();
      const editorStore = useEditorStore.getState();
      const tabId = editorStore.getTabFromFile(activeConflict.filePath);
      const tabGroup = tabId ? tabStore.tabGroups.find((g) =>
        g.tabs.some((t) => t.id === tabId)
      ) : null;
      const tab = tabGroup?.tabs.find((t) => t.id === tabId);
      const hasUnsavedChanges = tab?.isModified || false;
      
      setConflict({
        filePath: activeConflict.filePath,
        fileName: activeConflict.fileName,
        hasUnsavedChanges,
      });
    }

    return () => {
      window.removeEventListener('file-conflict', handleConflict as EventListener);
    };
  }, []);

  const handleReload = () => {
    if (conflict) {
      resolveFileConflict('reload');
      setConflict(null);
    }
  };

  const handleKeep = () => {
    if (conflict) {
      resolveFileConflict('keep');
      setConflict(null);
    }
  };

  const handleCancel = () => {
    // Cancel = keep editor version (don't reload)
    if (conflict) {
      resolveFileConflict('keep');
      setConflict(null);
    }
  };

  if (!conflict) {
    return null;
  }

  return (
    <FileConflictDialog
      fileName={conflict.fileName}
      hasUnsavedChanges={conflict.hasUnsavedChanges}
      onReload={handleReload}
      onKeep={handleKeep}
      onCancel={handleCancel}
    />
  );
};

