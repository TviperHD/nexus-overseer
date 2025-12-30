# Technical Specification: File System Integration

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The File System Integration System provides secure, efficient file operations for Nexus Overseer. It handles reading and writing files, watching for changes, directory operations, and managing file permissions. All file operations go through the Rust backend to ensure security and proper error handling.

**Key Features:**
- File read/write operations
- File watching and change detection
- Directory operations (list, create, delete)
- File permissions and security
- Project file management
- Async file operations
- Error handling and validation

**Purpose:**
- Enable Implementation AI to write code directly to files
- Enable code editor to read and display files
- Enable file watching for real-time updates
- Ensure secure file access (Tauri security model)
- Provide efficient file operations

---

## System Architecture

### High-Level Design

The File System Integration System consists of:

1. **File Operations Module (Rust):** Core file read/write operations
2. **File Watcher Module:** Monitors files for changes
3. **Directory Operations Module:** Handles directory operations
4. **Security Module:** Manages file permissions and access control
5. **Project File Manager:** Manages project-specific file operations

### Component Hierarchy

```
FileSystemIntegration (Main Module)
├── FileOperations (Read/Write)
│   ├── FileReader (Read operations)
│   └── FileWriter (Write operations)
├── FileWatcher (Change detection)
│   └── NotifyHandler (File system events)
├── DirectoryOperations (Directory management)
├── SecurityManager (Permissions and access control)
└── ProjectFileManager (Project-specific operations)
```

### Data Flow

```
Frontend (React)
  ↓
Tauri IPC Command
  ↓
File System Module (Rust)
  ↓
OS File System
  ↓
Response/Event
  ↓
Frontend (Updated)
```

---

## Data Structures

### Backend (Rust)

**File Metadata:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: PathBuf,
    pub name: String,
    pub size: u64,
    pub is_file: bool,
    pub is_directory: bool,
    pub modified: DateTime<Utc>,
    pub created: DateTime<Utc>,
    pub permissions: FilePermissions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilePermissions {
    pub readable: bool,
    pub writable: bool,
    pub executable: bool,
}
```

**File Read Result:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileReadResult {
    pub content: String,
    pub encoding: String,              // "utf-8", etc.
    pub line_count: usize,
    pub size: u64,
}
```

**File Write Request:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileWriteRequest {
    pub path: PathBuf,
    pub content: String,
    pub create_if_not_exists: bool,
    pub backup: bool,                  // Create backup before write
}
```

**File Watch Event:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FileWatchEvent {
    Created(PathBuf),
    Modified(PathBuf),
    Deleted(PathBuf),
    Renamed { old: PathBuf, new: PathBuf },
}
```

**Directory Listing:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirectoryEntry {
    pub name: String,
    pub path: PathBuf,
    pub is_file: bool,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub modified: DateTime<Utc>,
}
```

**Project File Structure:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectFileInfo {
    pub project_path: PathBuf,
    pub file_path: PathBuf,
    pub relative_path: String,        // Relative to project root
    pub file_type: FileType,          // Source code, config, etc.
}
```

### Frontend (TypeScript)

**File Metadata Interface:**
```typescript
interface FileMetadata {
  path: string;
  name: string;
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  modified: string;  // ISO date string
  created: string;
  permissions: {
    readable: boolean;
    writable: boolean;
    executable: boolean;
  };
}

interface FileReadResult {
  content: string;
  encoding: string;
  lineCount: number;
  size: number;
}

interface FileWriteRequest {
  path: string;
  content: string;
  createIfNotExists?: boolean;
  backup?: boolean;
}

interface DirectoryEntry {
  name: string;
  path: string;
  isFile: boolean;
  isDirectory: boolean;
  size?: number;
  modified: string;
}
```

---

## Core Components

### Backend Modules

#### filesystem.rs (Main Module)

**Purpose:** Core file system operations module.

**Key Functions:**

**File Operations:**
- `read_file(path)` - Read file content
- `write_file(request)` - Write file content
- `read_file_lines(path, start, end)` - Read specific lines
- `append_to_file(path, content)` - Append to file
- `delete_file(path)` - Delete file
- `copy_file(source, destination)` - Copy file
- `move_file(source, destination)` - Move/rename file

**Directory Operations:**
- `list_directory(path)` - List directory contents
- `create_directory(path)` - Create directory
- `delete_directory(path)` - Delete directory (recursive)
- `get_file_metadata(path)` - Get file metadata
- `exists(path)` - Check if path exists

**File Watching:**
- `watch_file(path, callback)` - Watch single file
- `watch_directory(path, callback)` - Watch directory
- `unwatch(path)` - Stop watching
- `unwatch_all()` - Stop all watches

**Project Operations:**
- `get_project_files(project_path)` - Get all project files
- `is_project_file(path, project_path)` - Check if file is in project
- `get_relative_path(path, project_path)` - Get relative path

**Security:**
- `validate_path(path, allowed_paths)` - Validate path is allowed
- `check_permissions(path)` - Check file permissions
- `request_permission(path)` - Request user permission

#### file_reader.rs

**Purpose:** Handles file reading operations.

**Key Functions:**
- `read_text_file(path)` - Read text file (UTF-8)
- `read_binary_file(path)` - Read binary file
- `read_file_chunk(path, offset, length)` - Read file chunk
- `detect_encoding(path)` - Detect file encoding

**Implementation Details:**
- Uses `tokio::fs` for async file operations
- Handles encoding detection and conversion
- Validates file size before reading
- Error handling for file not found, permissions, etc.

#### file_writer.rs

**Purpose:** Handles file writing operations.

**Key Functions:**
- `write_text_file(path, content)` - Write text file
- `write_binary_file(path, content)` - Write binary file
- `create_backup(path)` - Create backup before write
- `atomic_write(path, content)` - Atomic write (write to temp, then rename)

**Implementation Details:**
- Uses `tokio::fs` for async operations
- Creates backups if requested
- Uses atomic writes to prevent corruption
- Validates path and permissions before write

#### file_watcher.rs

**Purpose:** Monitors files for changes.

**Key Functions:**
- `watch(path, recursive)` - Start watching path
- `unwatch(path)` - Stop watching
- `get_events()` - Get file system events
- `handle_event(event)` - Process file system event

**Implementation Details:**
- Uses `notify` crate for file system watching
- Supports recursive directory watching
- Filters events (only relevant changes)
- Emits events via Tauri events

#### security_manager.rs

**Purpose:** Manages file access security.

**Key Functions:**
- `is_path_allowed(path, allowed_paths)` - Check if path is in allowed list
- `request_path_permission(path)` - Request user permission
- `add_allowed_path(path)` - Add path to allowed list
- `validate_path(path)` - Validate path (no traversal, etc.)

**Implementation Details:**
- Uses Tauri's security model
- Validates paths to prevent traversal attacks
- Manages allowed paths list
- Requests user permission for new paths

### Tauri Commands

**IPC Commands for Frontend-Backend Communication:**

```rust
#[tauri::command]
async fn read_file(path: String) -> Result<FileReadResult>;

#[tauri::command]
async fn write_file(request: FileWriteRequest) -> Result<()>;

#[tauri::command]
async fn delete_file(path: String) -> Result<()>;

#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<DirectoryEntry>>;

#[tauri::command]
async fn create_directory(path: String) -> Result<()>;

#[tauri::command]
async fn get_file_metadata(path: String) -> Result<FileMetadata>;

#[tauri::command]
async fn file_exists(path: String) -> Result<bool>;

#[tauri::command]
async fn watch_file(path: String) -> Result<()>; // Emits events

#[tauri::command]
async fn watch_directory(path: String, recursive: bool) -> Result<()>;

#[tauri::command]
async fn unwatch(path: String) -> Result<()>;

#[tauri::command]
async fn get_project_files(project_path: String) -> Result<Vec<ProjectFileInfo>>;

#[tauri::command]
async fn request_path_permission(path: String) -> Result<bool>;
```

---

## Algorithms

### File Read Flow

1. Validate path (security check)
2. Check file exists
3. Check file permissions (readable)
4. Check file size (prevent reading huge files)
5. Read file content (async)
6. Detect encoding if needed
7. Return content with metadata

### File Write Flow

1. Validate path (security check)
2. Check if file exists
3. If backup requested, create backup
4. If create_if_not_exists, create parent directories
5. Write content to temporary file
6. Atomic rename (temp to final)
7. Return success

### File Watch Flow

1. Validate path (security check)
2. Check if path exists
3. Register watcher with notify crate
4. Listen for file system events
5. Filter relevant events
6. Emit Tauri event to frontend
7. Frontend handles event and updates UI

### Path Validation Flow

1. Normalize path (resolve relative paths, etc.)
2. Check for path traversal attempts (../, etc.)
3. Check if path is in allowed paths list
4. If not in list, request user permission
5. If permission granted, add to allowed list
6. Return validation result

---

## Integration Points

### With Implementation AI

**Implementation AI Writes Files:**
- Calls `write_file()` to write generated code
- Can create backups before writing
- Receives write confirmation
- Handles write errors gracefully

**Integration Method:**
- Implementation AI uses Tauri commands
- File system module handles all file operations
- Errors returned to Implementation AI for handling

### With Code Editor

**Code Editor Reads Files:**
- Calls `read_file()` to load file content
- Receives file content and metadata
- Displays content in Monaco Editor
- Handles encoding automatically

**Code Editor Watches Files:**
- Calls `watch_file()` to monitor file changes
- Receives file change events
- Updates editor content when file changes externally
- Handles file deletion gracefully

### With Project Management

**Project File Management:**
- Uses `get_project_files()` to list project files
- Uses `is_project_file()` to validate files
- Manages project file tree
- Tracks file changes for project state

### With Security System

**File Access Control:**
- All file operations go through security validation
- User grants permissions for project directories
- Paths are validated before operations
- No unauthorized file access

---

## Security Considerations

### Tauri Security Model

1. **Allowed Paths:** Tauri restricts file access to allowed paths
2. **User Permission:** User must grant permission for new paths
3. **Path Validation:** All paths validated before operations
4. **No Path Traversal:** Prevent ../ and similar attacks

### File Operation Security

1. **Input Validation:** Validate all file paths and content
2. **Size Limits:** Prevent reading/writing huge files
3. **Backup Creation:** Create backups before destructive operations
4. **Atomic Writes:** Use atomic writes to prevent corruption
5. **Error Handling:** Don't expose file system paths in errors

### Permission Management

1. **Project Directories:** User grants permission for project root
2. **Subdirectories:** Automatically allowed within project
3. **External Files:** Require explicit permission
4. **Permission Persistence:** Remember permissions across sessions

---

## Performance Considerations

### Async Operations

1. **Non-Blocking:** All file operations are async (tokio::fs)
2. **Concurrent Operations:** Multiple file operations can run concurrently
3. **Streaming:** Large files can be read in chunks if needed

### File Watching

1. **Efficient Watching:** Use notify crate for efficient file watching
2. **Event Filtering:** Filter irrelevant events (only watch what's needed)
3. **Debouncing:** Debounce rapid file changes
4. **Selective Watching:** Only watch files that need watching

### Caching

1. **File Metadata Cache:** Cache file metadata to avoid repeated stat calls
2. **Directory Listing Cache:** Cache directory listings
3. **Cache Invalidation:** Invalidate cache on file changes

---

## Error Handling

### Error Types

1. **File Not Found:** File doesn't exist
2. **Permission Denied:** No permission to access file
3. **Path Invalid:** Path is invalid or not allowed
4. **File Too Large:** File exceeds size limit
5. **Encoding Error:** File encoding not supported
6. **IO Error:** General file system error
7. **Watch Error:** File watching failed

### Error Handling Strategy

1. **User-Friendly Messages:** Convert technical errors to user-friendly messages
2. **Error Recovery:** Retry operations where appropriate
3. **Logging:** Log technical details for debugging
4. **Graceful Degradation:** Continue with reduced functionality if possible

---

## Testing Checklist

### Unit Tests

- [ ] File read operations
- [ ] File write operations
- [ ] Directory operations
- [ ] Path validation
- [ ] Permission checking
- [ ] File metadata retrieval
- [ ] Error handling

### Integration Tests

- [ ] Tauri IPC communication
- [ ] File watching events
- [ ] Security validation
- [ ] Project file operations
- [ ] Concurrent file operations
- [ ] Error recovery

### User Acceptance Tests

- [ ] Can read files from project
- [ ] Can write files to project
- [ ] File changes detected and displayed
- [ ] Permissions requested correctly
- [ ] Errors handled gracefully
- [ ] Performance is acceptable
- [ ] Large files handled correctly

---

## Research Notes

### Tauri File System API

**Research Findings:**
- Tauri provides file system API via Rust backend
- Security model restricts file access to allowed paths
- User must grant permission for new paths
- Async file operations recommended (tokio::fs)
- File watching requires notify crate

**Sources:**
- [Tauri File System API Documentation](https://tauri.app/api/js/fs/)
- Tauri security documentation
- Tauri GitHub repository

**Implementation Approach:**
- Use tokio::fs for async file operations
- Use Tauri's security model for path validation
- Request user permission for project directories
- Use notify crate for file watching

**Why This Approach:**
- Async operations prevent blocking
- Security model ensures safe file access
- User control over file access
- Standard Rust patterns

### File Watching Patterns

**Research Findings:**
- `notify` crate is standard for file watching in Rust
- Supports cross-platform file watching
- Efficient event-based watching
- Can watch files or directories recursively

**Sources:**
- [notify crate documentation](https://docs.rs/notify/)
- Rust file watching patterns

**Implementation Approach:**
- Use notify crate for file system events
- Watch project directories recursively
- Filter events to only relevant changes
- Emit Tauri events to frontend

**Why This Approach:**
- Standard Rust library
- Cross-platform support
- Efficient and reliable
- Well-maintained

### Atomic File Writes

**Research Findings:**
- Atomic writes prevent file corruption
- Write to temp file, then rename
- Ensures file is either old or new, never corrupted
- Important for code files

**Sources:**
- General file system best practices
- Atomic write patterns

**Implementation Approach:**
- Write to temporary file first
- Atomic rename to final location
- Handle errors during write
- Clean up temp files on error

**Why This Approach:**
- Prevents file corruption
- Standard pattern for safe writes
- Important for code files
- Better than direct writes

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Implement file operations module
3. ⏳ Implement file watcher module
4. ⏳ Implement security manager
5. ⏳ Create Tauri commands
6. ⏳ Integrate with Implementation AI
7. ⏳ Integrate with Code Editor
8. ⏳ Testing and refinement

---

## Notes

- File system integration is critical for Implementation AI to write code
- Security is paramount - all paths must be validated
- Async operations are essential for performance
- File watching enables real-time updates
- Atomic writes prevent corruption
- User permission model ensures security and user control

