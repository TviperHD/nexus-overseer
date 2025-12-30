import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '../editorStore';
import { useTabStore } from '../tabStore';
import * as fileSystem from '@/utils/fileSystem';

// Mock file system utilities
vi.mock('@/utils/fileSystem', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  watchFile: vi.fn(),
  unwatch: vi.fn(),
}));

// Mock language detection
vi.mock('@/utils/languageDetection', () => ({
  detectLanguage: vi.fn((path: string) => {
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.md')) return 'markdown';
    return 'plaintext';
  }),
}));

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

describe('EditorStore', () => {
  beforeEach(() => {
    // Clear stores before each test
    localStorage.clear();
    useTabStore.setState({
      tabGroups: [],
      activeTabGroupId: null,
    });
    useEditorStore.setState({
      fileToTabMap: new Map(),
      tabToFileMap: new Map(),
      fileContent: new Map(),
      fileViewState: new Map(),
      activeFileId: null,
      editorSettings: {
        theme: 'vs-dark',
        fontSize: 14,
        wordWrap: 'on',
        minimap: { enabled: true },
        lineNumbers: 'on',
        tabSize: 2,
        insertSpaces: true,
      },
    });
    vi.clearAllMocks();
  });

  describe('openFile', () => {
    it('should open a file and create a tab', async () => {
      const filePath = '/path/to/test.ts';
      const fileContent = 'console.log("test");';
      
      // Create a tab group first
      const tabGroupId = useTabStore.getState().createTabGroup();
      
      // Mock readFile
      vi.mocked(fileSystem.readFile).mockResolvedValue({
        content: fileContent,
        encoding: 'utf-8',
        lineCount: 1,
        size: fileContent.length,
      });

      // Mock watchFile
      vi.mocked(fileSystem.watchFile).mockResolvedValue();

      await useEditorStore.getState().openFile(filePath);

      const store = useEditorStore.getState();
      expect(store.fileContent.get(filePath)).toBe(fileContent);
      expect(store.fileToTabMap.has(filePath)).toBe(true);
      
      const tabId = store.fileToTabMap.get(filePath);
      expect(tabId).toBeDefined();
      
      const tabGroup = useTabStore.getState().getTabGroup(tabGroupId);
      expect(tabGroup?.tabs.some(t => t.id === tabId)).toBe(true);
      expect(fileSystem.watchFile).toHaveBeenCalledWith(filePath);
    });

    it('should switch to existing tab if file is already open', async () => {
      const filePath = '/path/to/test.ts';
      const tabGroupId = useTabStore.getState().createTabGroup();
      
      // Open file first time
      vi.mocked(fileSystem.readFile).mockResolvedValue({
        content: 'test',
        encoding: 'utf-8',
        lineCount: 1,
        size: 4,
      });
      vi.mocked(fileSystem.watchFile).mockResolvedValue();

      await useEditorStore.getState().openFile(filePath);
      const firstTabId = useEditorStore.getState().fileToTabMap.get(filePath);

      // Try to open again
      await useEditorStore.getState().openFile(filePath);
      const secondTabId = useEditorStore.getState().fileToTabMap.get(filePath);

      // Should be the same tab
      expect(firstTabId).toBe(secondTabId);
      // readFile should only be called once
      expect(fileSystem.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateFileContent', () => {
    it('should update file content and mark as modified', () => {
      const filePath = '/path/to/test.ts';
      const tabGroupId = useTabStore.getState().createTabGroup();
      
      // Set up file in store
      const store = useEditorStore.getState();
      const newFileToTabMap = new Map(store.fileToTabMap);
      const newTabToFileMap = new Map(store.tabToFileMap);
      const newFileContent = new Map(store.fileContent);
      
      const tabId = crypto.randomUUID();
      newFileToTabMap.set(filePath, tabId);
      newTabToFileMap.set(tabId, filePath);
      newFileContent.set(filePath, 'original');
      
      useEditorStore.setState({
        fileToTabMap: newFileToTabMap,
        tabToFileMap: newTabToFileMap,
        fileContent: newFileContent,
      });

      // Add tab to tab store
      useTabStore.getState().addTab(tabGroupId, {
        id: tabId,
        type: 'file',
        label: 'test.ts',
        filePath,
        isModified: false,
      });

      // Update content
      useEditorStore.getState().updateFileContent(filePath, 'updated');

      expect(useEditorStore.getState().fileContent.get(filePath)).toBe('updated');
      
      const tab = useTabStore.getState().getTab(tabGroupId, tabId);
      expect(tab?.isModified).toBe(true);
    });
  });

  describe('saveFile', () => {
    it('should save file and mark as not modified', async () => {
      const filePath = '/path/to/test.ts';
      const tabGroupId = useTabStore.getState().createTabGroup();
      
      // Set up file in store
      const store = useEditorStore.getState();
      const newFileToTabMap = new Map(store.fileToTabMap);
      const newTabToFileMap = new Map(store.tabToFileMap);
      const newFileContent = new Map(store.fileContent);
      
      const tabId = crypto.randomUUID();
      newFileToTabMap.set(filePath, tabId);
      newTabToFileMap.set(tabId, filePath);
      newFileContent.set(filePath, 'content to save');
      
      useEditorStore.setState({
        fileToTabMap: newFileToTabMap,
        tabToFileMap: newTabToFileMap,
        fileContent: newFileContent,
      });

      // Add tab to tab store
      useTabStore.getState().addTab(tabGroupId, {
        id: tabId,
        type: 'file',
        label: 'test.ts',
        filePath,
        isModified: true,
      });

      // Mock writeFile
      vi.mocked(fileSystem.writeFile).mockResolvedValue();

      await useEditorStore.getState().saveFile(filePath);

      expect(fileSystem.writeFile).toHaveBeenCalledWith({
        path: filePath,
        content: 'content to save',
        createIfNotExists: true,
        backup: false,
      });

      const tab = useTabStore.getState().getTab(tabGroupId, tabId);
      expect(tab?.isModified).toBe(false);
    });
  });

  describe('closeFile', () => {
    it('should close file and remove tab', async () => {
      const filePath = '/path/to/test.ts';
      const tabGroupId = useTabStore.getState().createTabGroup();
      
      // Set up file in store
      const store = useEditorStore.getState();
      const newFileToTabMap = new Map(store.fileToTabMap);
      const newTabToFileMap = new Map(store.tabToFileMap);
      const newFileContent = new Map(store.fileContent);
      
      const tabId = crypto.randomUUID();
      newFileToTabMap.set(filePath, tabId);
      newTabToFileMap.set(tabId, filePath);
      newFileContent.set(filePath, 'content');
      
      useEditorStore.setState({
        fileToTabMap: newFileToTabMap,
        tabToFileMap: newTabToFileMap,
        fileContent: newFileContent,
      });

      // Add tab to tab store
      useTabStore.getState().addTab(tabGroupId, {
        id: tabId,
        type: 'file',
        label: 'test.ts',
        filePath,
        isModified: false,
      });

      // Mock unwatch
      vi.mocked(fileSystem.unwatch).mockResolvedValue();

      await useEditorStore.getState().closeFile(filePath);

      expect(fileSystem.unwatch).toHaveBeenCalledWith(filePath);
      expect(useEditorStore.getState().fileToTabMap.has(filePath)).toBe(false);
      expect(useTabStore.getState().getTab(tabGroupId, tabId)).toBeNull();
    });

    it('should not close file with unsaved changes', async () => {
      const filePath = '/path/to/test.ts';
      const tabGroupId = useTabStore.getState().createTabGroup();
      
      // Set up file in store
      const store = useEditorStore.getState();
      const newFileToTabMap = new Map(store.fileToTabMap);
      const newTabToFileMap = new Map(store.tabToFileMap);
      const newFileContent = new Map(store.fileContent);
      
      const tabId = crypto.randomUUID();
      newFileToTabMap.set(filePath, tabId);
      newTabToFileMap.set(tabId, filePath);
      newFileContent.set(filePath, 'content');
      
      useEditorStore.setState({
        fileToTabMap: newFileToTabMap,
        tabToFileMap: newTabToFileMap,
        fileContent: newFileContent,
      });

      // Add tab with unsaved changes
      useTabStore.getState().addTab(tabGroupId, {
        id: tabId,
        type: 'file',
        label: 'test.ts',
        filePath,
        isModified: true,
      });

      await useEditorStore.getState().closeFile(filePath);

      // File should still be open
      expect(useEditorStore.getState().fileToTabMap.has(filePath)).toBe(true);
      expect(fileSystem.unwatch).not.toHaveBeenCalled();
    });
  });

  describe('viewState management', () => {
    it('should save and retrieve view state', () => {
      const filePath = '/path/to/test.ts';
      const viewState = {
        cursorPosition: { line: 10, column: 5 },
        scrollPosition: { scrollTop: 100, scrollLeft: 0 },
      };

      useEditorStore.getState().updateViewState(filePath, viewState);
      const retrieved = useEditorStore.getState().getViewState(filePath);

      expect(retrieved).toEqual(viewState);
    });
  });

  describe('editor settings', () => {
    it('should update editor settings', () => {
      const store = useEditorStore.getState();
      const initialFontSize = store.editorSettings.fontSize;

      store.updateEditorSettings({ fontSize: 16 });

      expect(useEditorStore.getState().editorSettings.fontSize).toBe(16);
      expect(useEditorStore.getState().editorSettings.fontSize).not.toBe(initialFontSize);
    });
  });
});

