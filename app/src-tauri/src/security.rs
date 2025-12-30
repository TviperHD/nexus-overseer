use std::collections::HashSet;
use std::path::{Path, PathBuf};
use crate::filesystem::FileSystemError;

/// Security manager for path validation and permission checking
pub struct SecurityManager {
    allowed_paths: HashSet<PathBuf>,
}

impl SecurityManager {
    pub fn new() -> Self {
        Self {
            allowed_paths: HashSet::new(),
        }
    }
    
    /// Add an allowed path
    pub fn add_allowed_path(&mut self, path: PathBuf) {
        // Add both canonicalized and non-canonicalized versions
        // Try to canonicalize first
        if let Ok(canonical) = path.canonicalize() {
            self.allowed_paths.insert(canonical.clone());
            // Also add the original if it's different
            if canonical != path {
                self.allowed_paths.insert(path);
            }
        } else {
            // If canonicalization fails, add as-is (path may not exist yet)
            self.allowed_paths.insert(path);
        }
    }
    
    /// Remove an allowed path
    pub fn remove_allowed_path(&mut self, path: &Path) {
        if let Ok(canonical) = path.canonicalize() {
            self.allowed_paths.remove(&canonical);
        }
    }
    
    /// Check if a path is allowed
    pub fn is_path_allowed(&self, path: &Path) -> bool {
        // Normalize path string for comparison (case-insensitive on Windows)
        let path_str = self.normalize_path_string(path);
        
        // Check each allowed path
        for allowed_path in &self.allowed_paths {
            let allowed_str = self.normalize_path_string(allowed_path);
            
            // Exact match
            if path_str == allowed_str {
                return true;
            }
            
            // Check if path starts with allowed path (path is within allowed directory)
            // Ensure it's a proper prefix (not just a substring)
            if path_str.starts_with(&allowed_str) {
                // Check that the next character is a path separator (or end of string)
                // This prevents C:\foo from matching C:\foobar
                let remaining = &path_str[allowed_str.len()..];
                if remaining.is_empty() || remaining.starts_with('\\') || remaining.starts_with('/') {
                    return true;
                }
            }
            
            // Also check canonicalized versions (for existing paths)
            if let (Ok(canonical_path), Ok(canonical_allowed)) = 
                (path.canonicalize(), allowed_path.canonicalize()) 
            {
                let canonical_path_str = self.normalize_path_string(&canonical_path);
                let canonical_allowed_str = self.normalize_path_string(&canonical_allowed);
                
                if canonical_path_str == canonical_allowed_str {
                    return true;
                }
                
                if canonical_path_str.starts_with(&canonical_allowed_str) {
                    let remaining = &canonical_path_str[canonical_allowed_str.len()..];
                    if remaining.is_empty() || remaining.starts_with('\\') || remaining.starts_with('/') {
                        return true;
                    }
                }
            }
        }
        
        false
    }
    
    /// Normalize path string for comparison (handles Windows case-insensitivity and separators)
    fn normalize_path_string(&self, path: &Path) -> String {
        let path_str = path.to_string_lossy().to_string();
        #[cfg(windows)]
        {
            // Normalize backslashes and make lowercase for case-insensitive comparison
            // Remove trailing separators for consistent comparison
            let mut normalized = path_str.replace('/', "\\").to_lowercase();
            // Strip Windows extended-length path prefix (\\?\) for comparison
            if normalized.starts_with("\\\\?\\") {
                normalized = normalized[4..].to_string();
            }
            // Also handle UNC paths (\\?\UNC\)
            if normalized.starts_with("\\\\?\\unc\\") {
                normalized = format!("\\\\{}", &normalized[8..]);
            }
            normalized.trim_end_matches('\\').to_string()
        }
        #[cfg(not(windows))]
        {
            path_str.trim_end_matches('/').to_string()
        }
    }
    
    /// Get all allowed paths
    pub fn get_allowed_paths(&self) -> Vec<PathBuf> {
        self.allowed_paths.iter().cloned().collect()
    }
}

/// Normalize a path (resolve . and .. components)
/// 
/// # Arguments
/// * `path` - The path to normalize
/// 
/// # Returns
/// * `Ok(PathBuf)` - Normalized path
/// * `Err(FileSystemError)` - Error on failure
pub fn normalize_path(path: &str) -> Result<PathBuf, FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    // Try to canonicalize (resolves symlinks and .. components)
    match path_buf.canonicalize() {
        Ok(canonical) => Ok(canonical),
        Err(_) => {
            // If canonicalization fails (path doesn't exist), resolve manually
            let mut normalized = PathBuf::new();
            for component in path_buf.components() {
                match component {
                    std::path::Component::Prefix(_) | std::path::Component::RootDir => {
                        normalized.push(component);
                    }
                    std::path::Component::CurDir => {
                        // Skip .
                    }
                    std::path::Component::ParentDir => {
                        // Go up one level
                        normalized.pop();
                    }
                    std::path::Component::Normal(name) => {
                        normalized.push(name);
                    }
                }
            }
            Ok(normalized)
        }
    }
}

/// Validate a path for security (prevent path traversal attacks)
/// 
/// # Arguments
/// * `path` - The path to validate
/// 
/// # Returns
/// * `Ok(PathBuf)` - Validated and normalized path
/// * `Err(FileSystemError)` - Error on failure
pub fn validate_path(path: &str) -> Result<PathBuf, FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    // Check for path traversal attempts
    let path_str = path_buf.to_string_lossy();
    if path_str.contains("..") || path_str.contains("//") {
        return Err(FileSystemError::InvalidPath(format!(
            "Path contains invalid components: {}",
            path
        )));
    }
    
    // Normalize the path
    normalize_path(path)
}

/// Check if a path is within an allowed directory
/// 
/// # Arguments
/// * `path` - The path to check
/// * `allowed_base` - The allowed base directory
/// 
/// # Returns
/// * `Ok(bool)` - True if path is within allowed directory
/// * `Err(FileSystemError)` - Error on failure
pub fn is_path_within_allowed(path: &Path, allowed_base: &Path) -> Result<bool, FileSystemError> {
    let normalized_path = normalize_path(&path.to_string_lossy())?;
    let normalized_base = normalize_path(&allowed_base.to_string_lossy())?;
    
    Ok(normalized_path.starts_with(&normalized_base))
}

