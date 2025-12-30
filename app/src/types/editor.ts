/**
 * Editor type definitions for Nexus Overseer
 * Defines data structures for Monaco Editor integration
 */

/**
 * Open file interface
 * Represents a file that is currently open in the editor
 */
export interface OpenFile {
  id: string;                    // UUID (matches tab ID)
  path: string;                  // Full file path
  name: string;                  // File name (basename)
  content: string;                // File content
  language: string;               // Monaco language ID (typescript, rust, etc.)
  isModified: boolean;            // Has unsaved changes
  isReadOnly: boolean;            // Read-only file
  encoding: string;              // File encoding (utf-8, etc.)
  lineCount: number;              // Number of lines
  lastModified: string;           // Last modified timestamp (ISO string)
}

/**
 * Editor settings interface
 * User preferences for editor appearance and behavior
 */
export interface EditorSettings {
  theme: string;                 // Editor theme (vs-dark, vs-light, etc.)
  fontSize: number;               // Font size in pixels
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimap: { enabled: boolean };
  lineNumbers: 'on' | 'off' | 'relative';
  tabSize: number;                // Tab size in spaces
  insertSpaces: boolean;           // Use spaces instead of tabs
  fontFamily?: string;            // Font family (optional)
  renderWhitespace?: 'none' | 'boundary' | 'selection' | 'all';
  scrollBeyondLastLine?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
}

/**
 * Editor view state interface
 * Stores cursor position, scroll position, and selections
 * Used to restore editor state when switching files
 */
export interface EditorViewState {
  cursorPosition: { line: number; column: number };
  scrollPosition: { scrollTop: number; scrollLeft: number };
  selections?: Array<{
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  }>;
  // Note: Monaco's IEditorViewState is more complex, but we'll store essential parts
}

