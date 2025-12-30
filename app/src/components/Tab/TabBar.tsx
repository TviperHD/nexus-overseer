import React, { useEffect } from 'react';
import type { Tab } from '@/types/tab';
import { Tab as TabComponent } from './Tab';

/**
 * TabBar component props
 */
interface TabBarProps {
  tabGroupId: string;
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

/**
 * Tab bar component
 * Displays all tabs in a tab group and handles tab interactions
 */
export const TabBar: React.FC<TabBarProps> = ({
  tabGroupId,
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
}) => {
  const tabBarRef = React.useRef<HTMLDivElement>(null);

  /**
   * Handle mouse wheel scrolling for horizontal scroll
   */
  useEffect(() => {
    const tabBar = tabBarRef.current;
    if (!tabBar) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scrolling if the tab bar can scroll
      if (tabBar.scrollWidth > tabBar.clientWidth) {
        // Prevent vertical scrolling on the tab bar
        e.preventDefault();
        // Scroll horizontally
        tabBar.scrollLeft += e.deltaY;
      }
    };

    tabBar.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      tabBar.removeEventListener('wheel', handleWheel);
    };
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if modifier keys are pressed (Ctrl on Windows/Linux, Cmd on Mac)
      const isModifierPressed = e.ctrlKey || e.metaKey;

      if (!isModifierPressed) {
        return;
      }

      // Ctrl+Tab (or Cmd+Tab) - Cycle through tabs
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (tabs.length === 0) return;

        const currentIndex = activeTabId
          ? tabs.findIndex((t) => t.id === activeTabId)
          : -1;
        const nextIndex = (currentIndex + 1) % tabs.length;
        onTabSelect(tabs[nextIndex].id);
        return;
      }

      // Ctrl+Shift+Tab - Cycle backwards through tabs
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        if (tabs.length === 0) return;

        const currentIndex = activeTabId
          ? tabs.findIndex((t) => t.id === activeTabId)
          : -1;
        const nextIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
        onTabSelect(tabs[nextIndex].id);
        return;
      }

      // Ctrl+W (or Cmd+W) - Close active tab
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (activeTabId) {
          onTabClose(activeTabId);
        }
        return;
      }

      // Ctrl+1 through Ctrl+9 - Switch to specific tab (first 9 tabs)
      const numberKey = parseInt(e.key, 10);
      if (numberKey >= 1 && numberKey <= 9) {
        e.preventDefault();
        const tabIndex = numberKey - 1;
        if (tabIndex < tabs.length) {
          onTabSelect(tabs[tabIndex].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabs, activeTabId, onTabSelect, onTabClose]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      ref={tabBarRef}
      className="flex items-center bg-[#2d2d30] overflow-x-auto overflow-y-hidden h-[35px] min-w-0 flex-shrink-0"
      role="tablist"
      aria-label="Tabs"
      style={{ scrollbarWidth: 'thin' }}
    >
      {tabs.map((tab) => (
        <TabComponent
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onSelect={() => onTabSelect(tab.id)}
          onClose={() => onTabClose(tab.id)}
        />
      ))}
    </div>
  );
};

