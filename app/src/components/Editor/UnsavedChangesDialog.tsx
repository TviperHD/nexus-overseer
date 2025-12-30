/**
 * Unsaved changes confirmation dialog
 * Shown when user tries to close a file with unsaved changes
 */

import React from 'react';

interface UnsavedChangesDialogProps {
  fileName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

/**
 * Unsaved changes dialog component
 * Shows options: Save, Don't Save, Cancel
 */
export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  fileName,
  onSave,
  onDiscard,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-lg font-semibold text-[#cccccc] mb-2">
          Unsaved Changes
        </h2>
        <p className="text-sm text-[#858585] mb-6">
          The file &quot;{fileName}&quot; has unsaved changes. Do you want to save them?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#cccccc] hover:bg-[#3e3e42] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-sm text-[#cccccc] hover:bg-[#3e3e42] rounded transition-colors"
          >
            Don&apos;t Save
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm bg-[#007acc] text-white hover:bg-[#005a9e] rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

