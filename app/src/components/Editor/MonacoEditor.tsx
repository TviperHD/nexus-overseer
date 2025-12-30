/**
 * Monaco Editor component for Nexus Overseer
 * Wraps Monaco Editor with file integration and view state management
 */

import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEditorStore } from '@/stores/editorStore';
import { useTabStore } from '@/stores/tabStore';
import { detectLanguage } from '@/utils/languageDetection';
import { normalizePath } from '@/utils/pathUtils';
import { debounce } from '@/utils/debounce';
import type { EditorViewState } from '@/types/editor';

interface MonacoEditorProps {
  filePath: string | null;  // File path to display (null = no file)
}

/**
 * Monaco Editor component
 * Displays file content with syntax highlighting and IntelliSense
 */
export const MonacoEditor: React.FC<MonacoEditorProps> = ({ filePath }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { 
    fileContent, 
    editorSettings, 
    updateFileContent, 
    updateViewState, 
    getViewState 
  } = useEditorStore();

  // Normalize file path for consistent lookup
  const normalizedFilePath = filePath ? normalizePath(filePath) : null;

  // Get file content - ensure fileContent is a Map
  const content = normalizedFilePath && fileContent instanceof Map ? fileContent.get(normalizedFilePath) : null;
  const language = filePath ? detectLanguage(filePath) : 'plaintext';

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Restore view state if available
    if (normalizedFilePath) {
      const savedViewState = getViewState(normalizedFilePath);
      if (savedViewState) {
        // Monaco's restoreViewState expects IEditorViewState, but we'll restore cursor and scroll
        // For now, we'll just set cursor position
        editor.setPosition({
          lineNumber: savedViewState.cursorPosition.line,
          column: savedViewState.cursorPosition.column,
        });
        editor.setScrollPosition({
          scrollTop: savedViewState.scrollPosition.scrollTop,
          scrollLeft: savedViewState.scrollPosition.scrollLeft,
        });
      }
    }

    // Set up event listeners for view state tracking
    editor.onDidChangeCursorPosition(() => {
      if (normalizedFilePath && editorRef.current) {
        const position = editorRef.current.getPosition();
        const scrollTop = editorRef.current.getScrollTop();
        const scrollLeft = editorRef.current.getScrollLeft();
        
        if (position) {
          updateViewState(normalizedFilePath, {
            cursorPosition: {
              line: position.lineNumber,
              column: position.column,
            },
            scrollPosition: {
              scrollTop,
              scrollLeft,
            },
          });
        }
      }
    });

    editor.onDidScrollChange(() => {
      if (normalizedFilePath && editorRef.current) {
        const position = editorRef.current.getPosition();
        const scrollTop = editorRef.current.getScrollTop();
        const scrollLeft = editorRef.current.getScrollLeft();
        
        if (position) {
          updateViewState(normalizedFilePath, {
            cursorPosition: {
              line: position.lineNumber,
              column: position.column,
            },
            scrollPosition: {
              scrollTop,
              scrollLeft,
            },
          });
        }
      }
    });
  }, [normalizedFilePath, getViewState, updateViewState]);

  // Save view state before switching files
  useEffect(() => {
    return () => {
      if (normalizedFilePath && editorRef.current) {
        const position = editorRef.current.getPosition();
        const scrollTop = editorRef.current.getScrollTop();
        const scrollLeft = editorRef.current.getScrollLeft();
        
        if (position) {
          updateViewState(normalizedFilePath, {
            cursorPosition: {
              line: position.lineNumber,
              column: position.column,
            },
            scrollPosition: {
              scrollTop,
              scrollLeft,
            },
          });
        }
      }
    };
  }, [normalizedFilePath, updateViewState]);

  // Debounced onChange handler (300ms delay)
  // Use useRef to persist the debounced function across renders
  const debouncedUpdateRef = useRef<((value: string) => void) | null>(null);
  
  useEffect(() => {
    // Create debounced function when filePath or updateFileContent changes
    debouncedUpdateRef.current = debounce((value: string) => {
      if (normalizedFilePath) {
        updateFileContent(normalizedFilePath, value);
      }
    }, 300);
    
    // Cleanup: cancel any pending debounced calls when component unmounts or dependencies change
    return () => {
      if (debouncedUpdateRef.current) {
        // The debounce function doesn't expose a cancel method, but the timeout will be cleared
        // when the function is recreated on the next render
        debouncedUpdateRef.current = null;
      }
    };
  }, [normalizedFilePath, updateFileContent]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined && debouncedUpdateRef.current) {
      debouncedUpdateRef.current(value);
    }
  }, []);

  // Configure editor options
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    theme: editorSettings.theme || 'vs-dark',
    fontSize: editorSettings.fontSize || 14,
    fontFamily: editorSettings.fontFamily || 'Consolas, "Courier New", monospace',
    wordWrap: editorSettings.wordWrap || 'on',
    minimap: editorSettings.minimap || { enabled: true },
    lineNumbers: editorSettings.lineNumbers || 'on',
    renderWhitespace: editorSettings.renderWhitespace || 'selection',
    tabSize: editorSettings.tabSize || 2,
    insertSpaces: editorSettings.insertSpaces !== false,
    automaticLayout: true,  // Important: auto-resize with container
    scrollBeyondLastLine: editorSettings.scrollBeyondLastLine !== false,
    formatOnPaste: editorSettings.formatOnPaste !== false,
    formatOnType: editorSettings.formatOnType !== false,
    readOnly: false,
  };

  // Empty state - no file open
  if (!normalizedFilePath) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <p className="text-base mb-2">No file open</p>
          <p className="text-sm">Open a file to start editing</p>
        </div>
      </div>
    );
  }

  // File content not loaded yet - this shouldn't happen if file was opened correctly
  // But if it does, show a message instead of trying to auto-reload (which causes duplicate tabs)
  if (content === null || content === undefined) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <p className="text-base mb-2">File content not available</p>
          <p className="text-sm mb-4">{filePath}</p>
          <p className="text-xs text-[#666]">Please close and reopen this file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
      />
    </div>
  );
};

