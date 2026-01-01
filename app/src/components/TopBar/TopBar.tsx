import React from 'react';
import { TabTypeDropdown } from './TabTypeDropdown';
import { WindowControls } from './WindowControls';

/**
 * TopBar component props
 */
interface TopBarProps {
  className?: string;
}

/**
 * TopBar component
 * Sleek, minimal menu bar inspired by Cursor IDE
 * Fixed position bar at top of window with menu items and window controls
 */
export const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        fixed top-0 left-0 right-0 h-[30px]
        bg-[#2d2d30]
        border-b border-[#3e3e42]
        flex items-center justify-between
        z-50
        ${className}
      `}
      style={{
        WebkitAppRegion: 'drag', // Allow window dragging on macOS/Electron
      }}
    >
      {/* Left: Menu items - Cursor style */}
      <div className="flex items-center h-full px-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <TabTypeDropdown />
      </div>

      {/* Right: Window controls */}
      <WindowControls />
    </div>
  );
};

