import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../TabBar';
import type { Tab } from '@/types/tab';

describe('TabBar Component', () => {
  const mockTabs: Tab[] = [
    { id: 'tab-1', type: 'file', label: 'test1.ts' },
    { id: 'tab-2', type: 'file', label: 'test2.ts' },
    { id: 'tab-3', type: 'file', label: 'test3.ts' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all tabs', () => {
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    render(
      <TabBar
        tabGroupId="group-1"
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    expect(screen.getByText('test1.ts')).toBeInTheDocument();
    expect(screen.getByText('test2.ts')).toBeInTheDocument();
    expect(screen.getByText('test3.ts')).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    const { container } = render(
      <TabBar
        tabGroupId="group-1"
        tabs={mockTabs}
        activeTabId="tab-2"
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    const tabs = container.querySelectorAll('[role="tab"]');
    // Tab-2 should be active (index 1)
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should call onTabSelect when tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    render(
      <TabBar
        tabGroupId="group-1"
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    await user.click(screen.getByText('test2.ts').closest('div')!);
    expect(onTabSelect).toHaveBeenCalledWith('tab-2');
  });

  it('should call onTabClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    render(
      <TabBar
        tabGroupId="group-1"
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    const closeButton = screen.getByLabelText('Close test1.ts');
    await user.click(closeButton);
    expect(onTabClose).toHaveBeenCalledWith('tab-1');
  });

  it('should not render when tabs array is empty', () => {
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    const { container } = render(
      <TabBar
        tabGroupId="group-1"
        tabs={[]}
        activeTabId={null}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle keyboard shortcuts - Ctrl+Tab', async () => {
    const user = userEvent.setup();
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    render(
      <TabBar
        tabGroupId="group-1"
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    // Simulate Ctrl+Tab
    await user.keyboard('{Control>}{Tab}{/Control}');
    expect(onTabSelect).toHaveBeenCalledWith('tab-2');
  });

  it('should handle keyboard shortcuts - Ctrl+W', async () => {
    const user = userEvent.setup();
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    render(
      <TabBar
        tabGroupId="group-1"
        tabs={mockTabs}
        activeTabId="tab-2"
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    // Simulate Ctrl+W
    await user.keyboard('{Control>}w{/Control}');
    expect(onTabClose).toHaveBeenCalledWith('tab-2');
  });

  it('should handle keyboard shortcuts - Ctrl+1', async () => {
    const user = userEvent.setup();
    const onTabSelect = vi.fn();
    const onTabClose = vi.fn();

    render(
      <TabBar
        tabGroupId="group-1"
        tabs={mockTabs}
        activeTabId="tab-3"
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />
    );

    // Simulate Ctrl+1
    await user.keyboard('{Control>}1{/Control}');
    expect(onTabSelect).toHaveBeenCalledWith('tab-1');
  });
});

