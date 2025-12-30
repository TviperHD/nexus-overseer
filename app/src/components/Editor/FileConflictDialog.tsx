/**
 * File conflict dialog component
 * Shown when a file is modified externally while the editor has unsaved changes
 */

import React from 'react';

interface FileConflictDialogProps {
  fileName: string;
  hasUnsavedChanges?: boolean;
  onReload: () => void;
  onKeep: () => void;
  onCancel: () => void;
}

/**
 * File conflict dialog component
 * Shows options: Reload (discard editor changes), Keep (keep editor changes), Cancel
 */
export const FileConflictDialog: React.FC<FileConflictDialogProps> = ({
  fileName,
  hasUnsavedChanges = false,
  onReload,
  onKeep,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-lg font-semibold text-[#cccccc] mb-2">
          File Modified Externally
        </h2>
        <p className="text-sm text-[#858585] mb-4">
          The file &quot;{fileName}&quot; has been modified by another program.
        </p>
        {hasUnsavedChanges ? (
          <p className="text-sm text-[#858585] mb-6">
            You have unsaved changes in the editor. What would you like to do?
          </p>
        ) : (
          <p className="text-sm text-[#858585] mb-6">
            Would you like to reload the file to see the latest changes?
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#cccccc] hover:bg-[#3e3e42] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onKeep}
            className="px-4 py-2 text-sm text-[#cccccc] hover:bg-[#3e3e42] rounded transition-colors"
          >
            Keep Editor Version
          </button>
          <button
            onClick={onReload}
            className="px-4 py-2 text-sm bg-[#007acc] text-white hover:bg-[#005a9e] rounded transition-colors"
          >
            Reload from Disk
          </button>
        </div>
      </div>
    </div>
  );
};

