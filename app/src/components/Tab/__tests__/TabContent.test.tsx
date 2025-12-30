import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabContent } from '../TabContent';
import type { Tab } from '@/types/tab';

describe('TabContent Component', () => {
  it('should render empty state when no tab is provided', () => {
    render(<TabContent tab={null} />);

    expect(screen.getByText('No tab selected')).toBeInTheDocument();
    expect(screen.getByText('Open a file or panel to get started')).toBeInTheDocument();
  });

  it('should render Monaco Editor for file tab', () => {
    const fileTab: Tab = {
      id: 'tab-1',
      type: 'file',
      label: 'test.ts',
      filePath: '/path/to/test.ts',
    };

    render(<TabContent tab={fileTab} />);

    // Monaco Editor should render (it shows "Loading file..." if content not loaded)
    // Since we don't have the file in editor store, it should show loading state
    expect(screen.getByText('Loading file...')).toBeInTheDocument();
    expect(screen.getByText('/path/to/test.ts')).toBeInTheDocument();
  });

  it('should render panel tab placeholder for editor', () => {
    const panelTab: Tab = {
      id: 'tab-1',
      type: 'panel',
      label: 'Editor Panel',
      component: 'editor',
    };

    render(<TabContent tab={panelTab} />);

    expect(screen.getByText('Editor Panel (to be implemented)')).toBeInTheDocument();
  });

  it('should render panel tab placeholder for chat', () => {
    const panelTab: Tab = {
      id: 'tab-1',
      type: 'panel',
      label: 'Chat Panel',
      component: 'chat',
    };

    render(<TabContent tab={panelTab} />);

    expect(screen.getByText('Chat Panel (to be implemented)')).toBeInTheDocument();
  });

  it('should render panel tab placeholder for task-scheduler', () => {
    const panelTab: Tab = {
      id: 'tab-1',
      type: 'panel',
      label: 'Task Scheduler Panel',
      component: 'task-scheduler',
    };

    render(<TabContent tab={panelTab} />);

    expect(screen.getByText('Task Scheduler Panel (to be implemented)')).toBeInTheDocument();
  });

  it('should handle unknown panel component type', () => {
    const panelTab: Tab = {
      id: 'tab-1',
      type: 'panel',
      label: 'Unknown Panel',
      component: 'unknown-type',
    };

    render(<TabContent tab={panelTab} />);

    expect(screen.getByText(/Unknown panel type: unknown-type/)).toBeInTheDocument();
  });

  it('should handle unknown tab type', () => {
    const unknownTab = {
      id: 'tab-1',
      type: 'unknown' as any,
      label: 'Unknown Tab',
    };

    render(<TabContent tab={unknownTab} />);

    expect(screen.getByText(/Unknown tab type/)).toBeInTheDocument();
  });
});

