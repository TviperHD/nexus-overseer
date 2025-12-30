/**
 * Error message utilities
 * Converts technical errors into user-friendly messages
 */

/**
 * Get user-friendly error message from an error
 * @param error - The error object or string
 * @param context - Context about what operation failed (e.g., "opening file", "saving file")
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown, context: string): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // File not found errors
  if (lowerMessage.includes('not found') || lowerMessage.includes('enoent') || lowerMessage.includes('no such file')) {
    return `File not found. Please check the file path and try again.`;
  }

  // Permission denied errors
  if (lowerMessage.includes('permission denied') || lowerMessage.includes('eacces') || lowerMessage.includes('access denied')) {
    return `Permission denied. You don't have permission to ${context}.`;
  }

  // File too large errors
  if (lowerMessage.includes('too large') || lowerMessage.includes('file size')) {
    return `File is too large to ${context}. Maximum file size is 10MB.`;
  }

  // Path not allowed (Tauri security)
  if (lowerMessage.includes('path not allowed') || lowerMessage.includes('not allowed')) {
    return `File access not allowed. Please grant permission to access this file.`;
  }

  // Network errors (if applicable)
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return `Network error. Please check your connection and try again.`;
  }

  // Encoding errors
  if (lowerMessage.includes('encoding') || lowerMessage.includes('invalid encoding')) {
    return `File encoding error. The file may be corrupted or use an unsupported encoding.`;
  }

  // Generic error - provide context but don't expose technical details
  return `Failed to ${context}. Please try again.`;
}

/**
 * Check if a file path might be a binary file based on extension
 * @param filePath - The file path to check
 * @returns True if the file is likely binary
 */
export function isLikelyBinaryFile(filePath: string): boolean {
  const binaryExtensions = [
    '.exe', '.dll', '.so', '.dylib', // Executables
    '.bin', '.dat', '.db', '.sqlite', // Data files
    '.zip', '.tar', '.gz', '.rar', '.7z', // Archives
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg', // Images
    '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flac', // Media
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', // Documents
    '.woff', '.woff2', '.ttf', '.otf', // Fonts
  ];

  const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  return binaryExtensions.includes(extension);
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Check if file size exceeds limits
 * @param bytes - File size in bytes
 * @param maxBytes - Maximum allowed size in bytes (default: 10MB for read, 50MB for write)
 * @returns True if file exceeds limit
 */
export function exceedsFileSizeLimit(bytes: number, maxBytes: number = 10 * 1024 * 1024): boolean {
  return bytes > maxBytes;
}

