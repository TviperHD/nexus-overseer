/**
 * Minimal test component to verify react-resizable-panels works
 */

import React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import './PanelGroupTest.css';

/**
 * Minimal test - just Group, Panel, Separator, Panel
 * No wrappers, no onClick handlers, no custom logic
 */
export const PanelGroupTest: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex' }}>
      <Group orientation="horizontal" style={{ width: '100%', height: '100%', display: 'flex' }}>
        <Panel id="panel1" defaultSize={33} minSize={10} style={{ backgroundColor: '#1e1e1e' }}>
          <div style={{ padding: '20px', color: 'white' }}>Panel 1</div>
        </Panel>
        <Separator />
        <Panel id="panel2" defaultSize={34} minSize={10} style={{ backgroundColor: '#252526' }}>
          <div style={{ padding: '20px', color: 'white' }}>Panel 2</div>
        </Panel>
        <Separator />
        <Panel id="panel3" defaultSize={33} minSize={10} style={{ backgroundColor: '#1e1e1e' }}>
          <div style={{ padding: '20px', color: 'white' }}>Panel 3</div>
        </Panel>
      </Group>
    </div>
  );
};

