/**
 * File system type definitions for Nexus Overseer
 */

/**
 * File permissions information
 */
export interface FilePermissions {
  readable: boolean;
  writable: boolean;
  executable: boolean;
}

/**
 * File metadata
 */
export interface FileMetadata {
  path: string;
  name: string;
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  modified: string; // ISO date string
  created: string; // ISO date string
  permissions: FilePermissions;
}

/**
 * File read result
 */
export interface FileReadResult {
  content: string;
  encoding: string;
  lineCount: number;
  size: number;
}

/**
 * File write request
 */
export interface FileWriteRequest {
  path: string;
  content: string;
  createIfNotExists?: boolean;
  backup?: boolean;
}

/**
 * Directory entry
 */
export interface DirectoryEntry {
  name: string;
  path: string;
  isFile: boolean;
  isDirectory: boolean;
  size?: number;
  modified: string; // ISO date string
}

/**
 * File watch event types
 */
export type FileWatchEvent =
  | { type: 'created'; path: string }
  | { type: 'modified'; path: string }
  | { type: 'deleted'; path: string }
  | { type: 'renamed'; old: string; new: string };

