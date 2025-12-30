# File System Security Configuration

## Overview

Nexus Overseer implements a security model for file system access that validates all paths before operations and manages allowed paths.

## Security Model

### Path Validation

All file operations go through path validation:
1. **Path Normalization**: Resolves `.` and `..` components, handles symlinks
2. **Path Traversal Detection**: Prevents `../` attacks
3. **Allowed Paths Check**: Verifies path is in allowed list

### Security Manager

The `SecurityManager` maintains a set of allowed paths:
- Paths must be explicitly added to the allowed list
- Subdirectories of allowed paths are automatically allowed
- Paths are normalized before checking

### Tauri Security

Tauri 2.0 security is configured in `tauri.conf.json`:
- Security capabilities can be configured (currently using custom validation)
- All file operations go through Rust backend for security

## Usage

### Requesting Path Permission

Before accessing a path, request permission:

```typescript
import { requestPathPermission } from '@/utils/fileSystem';

// Request permission for a project directory
const granted = await requestPathPermission('/path/to/project');
if (granted) {
  // Path is now allowed, proceed with operations
}
```

### Adding Allowed Paths

Add paths to the allowed list:

```typescript
import { addAllowedPath } from '@/utils/fileSystem';

// Add a project directory
await addAllowedPath('/path/to/project');
```

### Getting Allowed Paths

List all currently allowed paths:

```typescript
import { getAllowedPaths } from '@/utils/fileSystem';

const paths = await getAllowedPaths();
console.log('Allowed paths:', paths);
```

## Implementation Details

### Backend

- `security.rs`: Path validation and SecurityManager
- All Tauri commands validate paths before operations
- SecurityManager state managed via Tauri State

### Frontend

- `fileSystem.ts`: Utility functions for security operations
- All file operations automatically check permissions
- User-friendly error messages for security violations

## Security Considerations

1. **Path Traversal**: All paths validated to prevent `../` attacks
2. **Permission Model**: Explicit permission required for new paths
3. **Error Messages**: Don't expose sensitive path information in errors
4. **Atomic Operations**: File writes use atomic operations to prevent corruption

## Future Enhancements

- User dialog for permission requests
- Persistent allowed paths (save to config file)
- Project-based path management
- More granular permission levels

---

**Last Updated:** 2025-12-28

