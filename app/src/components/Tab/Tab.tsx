import React from 'react';
import type { Tab as TabType } from '@/types/tab';

/**
 * Tab component props
 */
interface TabProps {
  tab: TabType;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

/**
 * Individual tab component
 * Displays tab label, icon, and handles interactions
 */
export const Tab: React.FC<TabProps> = ({ tab, isActive, onSelect, onClose }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 cursor-pointer
        transition-colors duration-150 flex-shrink-0
        ${isActive 
          ? 'bg-[#1e1e1e] border-t-2 border-[#007acc] text-[#cccccc]' 
          : 'bg-[#2d2d30] text-[#858585] hover:bg-[#37373d]'
        }
      `}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
    >
      {/* Tab icon (if provided) */}
      {tab.icon && (
        <span className="text-sm" aria-hidden="true">
          {tab.icon}
        </span>
      )}

      {/* Tab label */}
      <span className="text-sm font-normal truncate max-w-[200px]">
        {tab.label}
      </span>

      {/* Modified indicator */}
      {tab.isModified && (
        <span 
          className="text-[#4fc1ff] text-xs" 
          aria-label="Modified"
          title="Unsaved changes"
        >
          ●
        </span>
      )}

      {/* Pinned indicator */}
      {tab.isPinned && (
        <span 
          className="text-[#858585] text-xs" 
          aria-label="Pinned"
          title="Pinned tab"
        >
          📌
        </span>
      )}

      {/* Close button */}
      <button
        className={`
          ml-1 w-4 h-4 flex items-center justify-center
          rounded hover:bg-[#3e3e42]
          transition-colors duration-150
          ${isActive ? 'text-[#cccccc]' : 'text-[#858585]'}
        `}
        onClick={handleCloseClick}
        aria-label={`Close ${tab.label}`}
        title={`Close ${tab.label}`}
        tabIndex={-1}
      >
        <span className="text-xs leading-none">×</span>
      </button>
    </div>
  );
};

