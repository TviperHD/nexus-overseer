/**
 * Panel component
 * Individual resizable panel wrapper
 */

import React from 'react';
import { Panel as ResizablePanel } from 'react-resizable-panels';
import { PanelContent } from './PanelContent';
import { usePanelStore, MAIN_PANEL_ID } from '../../stores/panelStore';
import { useTabStore } from '../../stores/tabStore';
import type { PanelConfig } from '../../types/panel';

interface PanelProps {
  config: PanelConfig;
  children?: React.ReactNode;
}

/**
 * Panel component
 * Wraps react-resizable-panels Panel with our configuration
 */
export const Panel: React.FC<PanelProps> = ({ config, children }) => {
  const isMainPanel = config.id === MAIN_PANEL_ID;
  const isModifierHeld = useTabStore((state) => state.isModifierKeyHeld);
  const showOrangeHighlight = isMainPanel && isModifierHeld;

  return (
    <ResizablePanel
      id={config.id}
      defaultSize={config.defaultSize}
      minSize={config.minSize}
      maxSize={config.maxSize}
      collapsible={config.collapsible}
      style={{ backgroundColor: '#1e1e1e', height: '100%', width: '100%' }}
    >
      <div
        data-panel-id={config.id}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Orange edge highlights for main panel when Ctrl is held */}
        {showOrangeHighlight && (
          <>
            {/* Top edge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: '#ff8800',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: '0 0 8px rgba(255, 136, 0, 0.8)',
              }}
            />
            {/* Bottom edge */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: '#ff8800',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: '0 0 8px rgba(255, 136, 0, 0.8)',
              }}
            />
            {/* Left edge */}
            <div
              style={{
                position: 'absolute',
                top: '35px', // Below tab bar
                left: 0,
                bottom: 0,
                width: '3px',
                backgroundColor: '#ff8800',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: '0 0 8px rgba(255, 136, 0, 0.8)',
              }}
            />
            {/* Right edge */}
            <div
              style={{
                position: 'absolute',
                top: '35px', // Below tab bar
                right: 0,
                bottom: 0,
                width: '3px',
                backgroundColor: '#ff8800',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: '0 0 8px rgba(255, 136, 0, 0.8)',
              }}
            />
          </>
        )}
        {children || (
          <PanelContent component={config.component} panelId={config.id} />
        )}
      </div>
    </ResizablePanel>
  );
};

