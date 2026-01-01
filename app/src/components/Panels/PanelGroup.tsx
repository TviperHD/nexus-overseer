/**
 * Panel group component
 * Container for resizable panels using react-resizable-panels
 */

import React from 'react';
import { Group, Separator } from 'react-resizable-panels';
import { Panel } from './Panel';
import { usePanelStore } from '../../stores/panelStore';
import type { PanelGroupConfig, PanelConfig } from '../../types/panel';
import type { Layout } from 'react-resizable-panels';

interface PanelGroupProps {
  config: PanelGroupConfig;
  onResize?: (sizes: number[]) => void;
}

/**
 * Panel group component
 * Container for resizable panels
 * Built from the working minimal test pattern
 */
export const PanelGroup: React.FC<PanelGroupProps> = ({ config, onResize }) => {
  const { setPanelSizes } = usePanelStore();

  // Handle layout change - debounced to avoid interrupting drag
  const handleLayoutChange = React.useCallback((layout: Layout) => {
    // Update store (will be debounced internally)
    setPanelSizes(layout);
    
    // Call optional callback
    if (onResize) {
      const sizesArray = config.panels.map((panel) => layout[panel.id] ?? panel.defaultSize);
      onResize(sizesArray);
    }
  }, [config.panels, onResize, setPanelSizes]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <Group 
        orientation={config.direction} 
        onLayoutChange={handleLayoutChange}
        style={{ width: '100%', height: '100%', display: 'flex' }}
      >
        {config.panels.map((item, index) => {
          // Check if item is a nested group or a panel
          const isNestedGroup = 'direction' in item && 'panels' in item;
          
          const elements: React.ReactNode[] = [];
          
          if (isNestedGroup) {
            // Nested groups must be wrapped in a Panel component
            // Create a temporary panel config for the wrapper
            const nestedGroup = item as PanelGroupConfig;
            const wrapperPanelConfig: PanelConfig = {
              id: nestedGroup.id, // Use group ID as panel ID
              component: 'nested-group', // Special component type
              defaultSize: config.defaultSizes[index] || 50,
              minSize: 20,
              maxSize: 100,
              collapsible: false,
              collapsed: false,
            };
            
            elements.push(
              <Panel key={nestedGroup.id} config={wrapperPanelConfig}>
                <PanelGroup config={nestedGroup} />
              </Panel>
            );
          } else {
            elements.push(
              <Panel key={item.id} config={item as PanelConfig} />
            );
          }
          
          if (index < config.panels.length - 1) {
            elements.push(<Separator key={`separator-${index}`} />);
          }
          
          return elements;
        })}
      </Group>
    </div>
  );
};

