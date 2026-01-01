import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

/**
 * Check if we're running in a Tauri environment
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * WindowControls component
 * Custom window controls (minimize, maximize, close) for frameless window
 */
export const WindowControls: React.FC = () => {
  const handleMinimize = async () => {
    try {
      if (!isTauriEnvironment()) {
        console.warn('Window controls only work in Tauri environment');
        return;
      }
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      if (!isTauriEnvironment()) {
        console.warn('Window controls only work in Tauri environment');
        return;
      }
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
    } catch (error) {
      console.error('Failed to maximize window:', error);
    }
  };

  const handleClose = async () => {
    try {
      if (!isTauriEnvironment()) {
        console.warn('Window controls only work in Tauri environment');
        return;
      }
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  return (
    <div className="flex items-center h-full ml-auto" style={{ WebkitAppRegion: 'no-drag' }}>
      <button
        onClick={handleMinimize}
        className="
          h-full w-[46px]
          flex items-center justify-center
          text-[#cccccc] hover:bg-[#37373d]
          transition-colors duration-75
          focus:outline-none
        "
        aria-label="Minimize"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      
      <button
        onClick={handleMaximize}
        className="
          h-full w-[46px]
          flex items-center justify-center
          text-[#cccccc] hover:bg-[#37373d]
          transition-colors duration-75
          focus:outline-none
        "
        aria-label="Maximize"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      
      <button
        onClick={handleClose}
        className="
          h-full w-[46px]
          flex items-center justify-center
          text-[#cccccc] hover:bg-[#e81123]
          hover:text-white
          transition-colors duration-75
          focus:outline-none
        "
        aria-label="Close"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 3L9 9M9 3L3 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

