/**
 * Language detection utility for Monaco Editor
 * Maps file extensions to Monaco language IDs
 */

/**
 * Language mapping from file extension to Monaco language ID
 */
const LANGUAGE_MAP: Record<string, string> = {
  // TypeScript/JavaScript
  '.ts': 'typescript',
  '.tsx': 'typescriptreact',
  '.js': 'javascript',
  '.jsx': 'javascriptreact',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  
  // Rust
  '.rs': 'rust',
  
  // Python
  '.py': 'python',
  '.pyw': 'python',
  
  // Markdown
  '.md': 'markdown',
  '.mdx': 'markdown',
  
  // JSON
  '.json': 'json',
  '.jsonc': 'jsonc',
  
  // YAML
  '.yaml': 'yaml',
  '.yml': 'yaml',
  
  // HTML/CSS
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.less': 'less',
  
  // Other common languages
  '.xml': 'xml',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.ps1': 'powershell',
  '.bat': 'bat',
  '.cmd': 'bat',
  '.toml': 'toml',
  '.ini': 'ini',
  '.cfg': 'ini',
  '.conf': 'ini',
  '.txt': 'plaintext',
  '.log': 'plaintext',
};

/**
 * Detect Monaco language ID from file path
 * 
 * @param filePath - The file path to detect language for
 * @returns Monaco language ID (defaults to 'plaintext' if unknown)
 */
export function detectLanguage(filePath: string): string {
  if (!filePath) {
    return 'plaintext';
  }

  // Extract file extension
  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
    // No extension or extension is empty
    return 'plaintext';
  }

  const extension = filePath.substring(lastDotIndex).toLowerCase();
  
  // Look up extension in language map
  const languageId = LANGUAGE_MAP[extension];
  
  return languageId || 'plaintext';
}

