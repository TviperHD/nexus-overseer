import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tab } from '../Tab';
import type { Tab as TabType } from '@/types/tab';

describe('Tab Component', () => {
  const mockTab: TabType = {
    id: 'tab-1',
    type: 'file',
    label: 'test.ts',
    filePath: '/path/to/test.ts',
  };

  it('should render tab label', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<Tab tab={mockTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    expect(screen.getByText('test.ts')).toBeInTheDocument();
  });

  it('should show active state styling', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <Tab tab={mockTab} isActive={true} onSelect={onSelect} onClose={onClose} />
    );

    const tabElement = container.firstChild as HTMLElement;
    expect(tabElement).toHaveClass('bg-[#1e1e1e]');
    expect(tabElement).toHaveClass('border-t-2');
    expect(tabElement).toHaveClass('border-[#007acc]');
  });

  it('should show inactive state styling', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <Tab tab={mockTab} isActive={false} onSelect={onSelect} onClose={onClose} />
    );

    const tabElement = container.firstChild as HTMLElement;
    expect(tabElement).toHaveClass('bg-[#2d2d30]');
  });

  it('should call onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<Tab tab={mockTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    await user.click(screen.getByText('test.ts').closest('div')!);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<Tab tab={mockTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close test.ts');
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should show modified indicator when tab is modified', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const modifiedTab: TabType = {
      ...mockTab,
      isModified: true,
    };

    render(<Tab tab={modifiedTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    const modifiedIndicator = screen.getByTitle('Unsaved changes');
    expect(modifiedIndicator).toBeInTheDocument();
    expect(modifiedIndicator).toHaveTextContent('●');
  });

  it('should show pinned indicator when tab is pinned', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const pinnedTab: TabType = {
      ...mockTab,
      isPinned: true,
    };

    render(<Tab tab={pinnedTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    const pinnedIndicator = screen.getByTitle('Pinned tab');
    expect(pinnedIndicator).toBeInTheDocument();
  });

  it('should handle keyboard Enter key', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<Tab tab={mockTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    const tabElement = screen.getByText('test.ts').closest('div')!;
    tabElement.focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Space key', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<Tab tab={mockTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    const tabElement = screen.getByText('test.ts').closest('div')!;
    tabElement.focus();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Escape key', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<Tab tab={mockTab} isActive={false} onSelect={onSelect} onClose={onClose} />);

    const tabElement = screen.getByText('test.ts').closest('div')!;
    tabElement.focus();
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should display icon if provided', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const tabWithIcon: TabType = {
      ...mockTab,
      icon: '📄',
    };

    render(<Tab tab={tabWithIcon} isActive={false} onSelect={onSelect} onClose={onClose} />);

    expect(screen.getByText('📄')).toBeInTheDocument();
  });
});

