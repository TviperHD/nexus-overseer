import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTabStore } from '../tabStore';
import type { Tab, TabGroup } from '@/types/tab';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('TabStore', () => {
  beforeEach(() => {
    // Clear store before each test
    localStorage.clear();
    // Reset store state by directly modifying it
    useTabStore.setState({
      tabGroups: [],
      activeTabGroupId: null,
    });
  });

  describe('createTabGroup', () => {
    it('should create a new tab group', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      expect(groupId).toBeDefined();
      expect(typeof groupId).toBe('string');
      
      const group = store.getTabGroup(groupId);
      expect(group).toBeDefined();
      expect(group?.id).toBe(groupId);
      expect(group?.tabs).toEqual([]);
      expect(group?.activeTabId).toBeNull();
    });

    it('should set as active tab group if none exists', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();
      
      // Get fresh state after createTabGroup
      const updatedState = useTabStore.getState();
      expect(updatedState.activeTabGroupId).toBe(groupId);
    });
  });

  describe('addTab', () => {
    it('should add a tab to a tab group', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab: Tab = {
        id: 'tab-1',
        type: 'file',
        label: 'test.ts',
        filePath: '/path/to/test.ts',
      };

      store.addTab(groupId, tab);

      const group = store.getTabGroup(groupId);
      expect(group?.tabs).toHaveLength(1);
      expect(group?.tabs[0]).toEqual(tab);
      expect(group?.activeTabId).toBe('tab-1');
    });

    it('should make new tab active', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab1: Tab = {
        id: 'tab-1',
        type: 'file',
        label: 'test1.ts',
      };

      const tab2: Tab = {
        id: 'tab-2',
        type: 'file',
        label: 'test2.ts',
      };

      store.addTab(groupId, tab1);
      store.addTab(groupId, tab2);

      const group = store.getTabGroup(groupId);
      expect(group?.activeTabId).toBe('tab-2');
    });

    it('should not add duplicate tabs', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab: Tab = {
        id: 'tab-1',
        type: 'file',
        label: 'test.ts',
      };

      store.addTab(groupId, tab);
      store.addTab(groupId, tab); // Try to add again

      const group = store.getTabGroup(groupId);
      expect(group?.tabs).toHaveLength(1);
    });

    it('should handle non-existent tab group', () => {
      const store = useTabStore.getState();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const tab: Tab = {
        id: 'tab-1',
        type: 'file',
        label: 'test.ts',
      };

      store.addTab('non-existent', tab);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('removeTab', () => {
    it('should remove a tab from a tab group', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab1: Tab = {
        id: 'tab-1',
        type: 'file',
        label: 'test1.ts',
      };

      const tab2: Tab = {
        id: 'tab-2',
        type: 'file',
        label: 'test2.ts',
      };

      store.addTab(groupId, tab1);
      store.addTab(groupId, tab2);
      store.removeTab(groupId, 'tab-1');

      const group = store.getTabGroup(groupId);
      expect(group?.tabs).toHaveLength(1);
      expect(group?.tabs[0].id).toBe('tab-2');
    });

    it('should activate next tab when active tab is removed', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab1: Tab = { id: 'tab-1', type: 'file', label: 'test1.ts' };
      const tab2: Tab = { id: 'tab-2', type: 'file', label: 'test2.ts' };
      const tab3: Tab = { id: 'tab-3', type: 'file', label: 'test3.ts' };

      store.addTab(groupId, tab1);
      store.addTab(groupId, tab2);
      store.addTab(groupId, tab3);
      store.setActiveTab(groupId, 'tab-2');
      store.removeTab(groupId, 'tab-2');

      const group = store.getTabGroup(groupId);
      expect(group?.activeTabId).toBe('tab-1'); // Should activate previous tab
    });

    it('should set activeTabId to null when last tab is removed', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab: Tab = { id: 'tab-1', type: 'file', label: 'test.ts' };
      store.addTab(groupId, tab);
      store.removeTab(groupId, 'tab-1');

      const group = store.getTabGroup(groupId);
      expect(group?.tabs).toHaveLength(0);
      expect(group?.activeTabId).toBeNull();
    });
  });

  describe('setActiveTab', () => {
    it('should set active tab in a tab group', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab1: Tab = { id: 'tab-1', type: 'file', label: 'test1.ts' };
      const tab2: Tab = { id: 'tab-2', type: 'file', label: 'test2.ts' };

      store.addTab(groupId, tab1);
      store.addTab(groupId, tab2);
      store.setActiveTab(groupId, 'tab-1');

      const group = store.getTabGroup(groupId);
      expect(group?.activeTabId).toBe('tab-1');
      
      // Get fresh state after setActiveTab
      const updatedState = useTabStore.getState();
      expect(updatedState.activeTabGroupId).toBe(groupId);
    });

    it('should handle non-existent tab', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      store.setActiveTab(groupId, 'non-existent');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('updateTab', () => {
    it('should update tab properties', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab: Tab = {
        id: 'tab-1',
        type: 'file',
        label: 'test.ts',
        isModified: false,
      };

      store.addTab(groupId, tab);
      store.updateTab(groupId, 'tab-1', { isModified: true, label: 'updated.ts' });

      const updatedTab = store.getTab(groupId, 'tab-1');
      expect(updatedTab?.isModified).toBe(true);
      expect(updatedTab?.label).toBe('updated.ts');
    });
  });

  describe('moveTab', () => {
    it('should move tab from one group to another', () => {
      const store = useTabStore.getState();
      const group1Id = store.createTabGroup();
      const group2Id = store.createTabGroup();

      const tab: Tab = { id: 'tab-1', type: 'file', label: 'test.ts' };
      store.addTab(group1Id, tab);
      store.moveTab('tab-1', group1Id, group2Id);

      const group1 = store.getTabGroup(group1Id);
      const group2 = store.getTabGroup(group2Id);

      expect(group1?.tabs).toHaveLength(0);
      expect(group2?.tabs).toHaveLength(1);
      expect(group2?.tabs[0].id).toBe('tab-1');
      expect(group2?.activeTabId).toBe('tab-1');
      
      // Get fresh state after moveTab
      const updatedState = useTabStore.getState();
      expect(updatedState.activeTabGroupId).toBe(group2Id);
    });
  });

  describe('reorderTab', () => {
    it('should reorder tab within group', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab1: Tab = { id: 'tab-1', type: 'file', label: 'test1.ts' };
      const tab2: Tab = { id: 'tab-2', type: 'file', label: 'test2.ts' };
      const tab3: Tab = { id: 'tab-3', type: 'file', label: 'test3.ts' };

      store.addTab(groupId, tab1);
      store.addTab(groupId, tab2);
      store.addTab(groupId, tab3);

      // Move tab-1 to position 2 (after tab-2)
      store.reorderTab(groupId, 'tab-1', 2);

      const group = store.getTabGroup(groupId);
      expect(group?.tabs[0].id).toBe('tab-2');
      expect(group?.tabs[1].id).toBe('tab-3');
      expect(group?.tabs[2].id).toBe('tab-1');
    });
  });

  describe('removeTabGroup', () => {
    it('should remove a tab group', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();
      store.removeTabGroup(groupId);

      const group = store.getTabGroup(groupId);
      expect(group).toBeNull();
    });

    it('should set new active group when active group is removed', () => {
      const store = useTabStore.getState();
      const group1Id = store.createTabGroup();
      const group2Id = store.createTabGroup();

      // Set active group using setState
      useTabStore.setState({ activeTabGroupId: group1Id });
      store.removeTabGroup(group1Id);

      // Get fresh state after removeTabGroup
      const updatedState = useTabStore.getState();
      expect(updatedState.activeTabGroupId).toBe(group2Id);
    });
  });

  describe('getTab', () => {
    it('should get tab by ID', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab: Tab = { id: 'tab-1', type: 'file', label: 'test.ts' };
      store.addTab(groupId, tab);

      const retrievedTab = store.getTab(groupId, 'tab-1');
      expect(retrievedTab).toEqual(tab);
    });

    it('should return null for non-existent tab', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const retrievedTab = store.getTab(groupId, 'non-existent');
      expect(retrievedTab).toBeNull();
    });
  });

  describe('getActiveTab', () => {
    it('should get active tab from group', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const tab1: Tab = { id: 'tab-1', type: 'file', label: 'test1.ts' };
      const tab2: Tab = { id: 'tab-2', type: 'file', label: 'test2.ts' };

      store.addTab(groupId, tab1);
      store.addTab(groupId, tab2);
      store.setActiveTab(groupId, 'tab-2');

      const activeTab = store.getActiveTab(groupId);
      expect(activeTab?.id).toBe('tab-2');
    });

    it('should return null when no active tab', () => {
      const store = useTabStore.getState();
      const groupId = store.createTabGroup();

      const activeTab = store.getActiveTab(groupId);
      expect(activeTab).toBeNull();
    });
  });
});

