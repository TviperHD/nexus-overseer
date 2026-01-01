import React from 'react';
import { useDroppable } from '@dnd-kit/core';

/**
 * EmptyCanvas component props
 */
interface EmptyCanvasProps {
  className?: string;
}

/**
 * EmptyCanvas component
 * Renders empty state when no panels exist
 * Note: TopBar is rendered at App level, so this component doesn't include it
 * Also acts as a drop zone for tabs
 */
export const EmptyCanvas: React.FC<EmptyCanvasProps> = ({ className = '' }) => {
  // Make empty canvas droppable
  const { setNodeRef, isOver } = useDroppable({
    id: 'empty-canvas',
    data: {
      type: 'empty-canvas' as const,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full w-full bg-[#1e1e1e] ${className} ${isOver ? 'ring-2 ring-[#007acc]' : ''}`}
    >
      {/* Empty state content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-semibold text-[#cccccc] mb-3">
            Welcome to Nexus Overseer
          </h1>
          <p className="text-base text-[#858585] mb-6">
            Select a tab from the menu above to get started
          </p>
          
          {/* Optional: Keyboard shortcut hints */}
          <div className="mt-8 pt-6 border-t border-[#3e3e42]">
            <p className="text-xs text-[#6a6a6a] mb-2">Keyboard Shortcuts:</p>
            <div className="flex flex-col gap-1 text-xs text-[#858585]">
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-[#2d2d30] border border-[#3e3e42] rounded text-[#cccccc]">
                  Ctrl+N
                </kbd>
                <span>Open new tab</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

