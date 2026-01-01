import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Tab as TabType } from '@/types/tab';
import type { TabDragData } from '@/types/tabDrag';

/**
 * Tab component props
 */
interface TabProps {
  tab: TabType;
  tabGroupId: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

/**
 * Individual tab component
 * Displays tab label, icon, and handles interactions
 * Supports drag-and-drop functionality
 * 
 * Memoized with custom comparison to prevent unnecessary re-renders during drag operations
 */
export const Tab: React.FC<TabProps> = React.memo<TabProps>(({ tab, tabGroupId, isActive, onSelect, onClose }) => {
  // Make tab sortable (supports both reordering within group and dragging between groups)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `tab-${tab.id}`,
    data: {
      type: 'tab' as const,
      tabId: tab.id,
      tabGroupId: tabGroupId,
      tabLabel: tab.label,
      tabType: tab.type,
      filePath: tab.filePath,
    } satisfies TabDragData,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition, // Smooth animation during reorder
    opacity: isDragging ? 0.5 : 1,
  };
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
    e.preventDefault(); // Prevent drag when clicking close
    onClose();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 px-3 py-2
        transition-colors duration-150 flex-shrink-0
        ${isDragging 
          ? 'cursor-grabbing z-50 opacity-50' 
          : 'cursor-grab'
        }
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
      data-draggable-id={`tab-${tab.id}`}
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
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault(); // Prevent drag when clicking close
        }}
        aria-label={`Close ${tab.label}`}
        title={`Close ${tab.label}`}
        tabIndex={-1}
        style={{ pointerEvents: 'auto' }} // Ensure button is clickable
      >
        <span className="text-xs leading-none">×</span>
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props change
  return (
    prevProps.tab.id === nextProps.tab.id &&
    prevProps.tabGroupId === nextProps.tabGroupId &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.tab.label === nextProps.tab.label &&
    prevProps.tab.isModified === nextProps.tab.isModified &&
    prevProps.tab.isPinned === nextProps.tab.isPinned &&
    prevProps.tab.icon === nextProps.tab.icon &&
    prevProps.tab.type === nextProps.tab.type &&
    prevProps.tab.filePath === nextProps.tab.filePath
  );
});

