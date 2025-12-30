/**
 * Path utility functions for normalizing file paths
 */

/**
 * Normalize file path for comparison (handles Windows/Unix path differences)
 * Converts backslashes to forward slashes and normalizes duplicate slashes
 * 
 * @param path - The file path to normalize
 * @returns Normalized path with forward slashes
 */
export function normalizePath(path: string): string {
  // Convert backslashes to forward slashes and normalize
  return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}

