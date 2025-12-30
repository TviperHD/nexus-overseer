use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::io;
use std::path::PathBuf;
use tokio::fs;

/// Maximum file size for reading (10MB)
const MAX_FILE_SIZE_READ: u64 = 10 * 1024 * 1024;

/// Maximum file size for writing (50MB)
const MAX_FILE_SIZE_WRITE: u64 = 50 * 1024 * 1024;

/// Custom error type for file system operations
#[derive(Debug)]
pub enum FileSystemError {
    NotFound(String),
    PermissionDenied(String),
    InvalidPath(String),
    FileTooLarge(String),
    IoError(io::Error),
    EncodingError(String),
    WatchError(String),
}

impl std::fmt::Display for FileSystemError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FileSystemError::NotFound(msg) => write!(f, "File not found: {}", msg),
            FileSystemError::PermissionDenied(msg) => write!(f, "Permission denied: {}", msg),
            FileSystemError::InvalidPath(msg) => write!(f, "Invalid path: {}", msg),
            FileSystemError::FileTooLarge(msg) => write!(f, "File too large: {}", msg),
            FileSystemError::IoError(e) => write!(f, "IO error: {}", e),
            FileSystemError::EncodingError(msg) => write!(f, "Encoding error: {}", msg),
            FileSystemError::WatchError(msg) => write!(f, "Watch error: {}", msg),
        }
    }
}

impl std::error::Error for FileSystemError {}

impl From<io::Error> for FileSystemError {
    fn from(error: io::Error) -> Self {
        match error.kind() {
            io::ErrorKind::NotFound => FileSystemError::NotFound(error.to_string()),
            io::ErrorKind::PermissionDenied => FileSystemError::PermissionDenied(error.to_string()),
            _ => FileSystemError::IoError(error),
        }
    }
}

/// File permissions information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilePermissions {
    pub readable: bool,
    pub writable: bool,
    pub executable: bool,
}

/// File metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub is_file: bool,
    pub is_directory: bool,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub modified: DateTime<Utc>,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub created: DateTime<Utc>,
    pub permissions: FilePermissions,
}

/// File read result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileReadResult {
    pub content: String,
    pub encoding: String,
    pub line_count: usize,
    pub size: u64,
}

/// File write request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileWriteRequest {
    pub path: String,
    pub content: String,
    #[serde(default)]
    pub create_if_not_exists: bool,
    #[serde(default)]
    pub backup: bool,
}

/// Directory entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirectoryEntry {
    pub name: String,
    pub path: String,
    pub is_file: bool,
    pub is_directory: bool,
    pub size: Option<u64>,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub modified: DateTime<Utc>,
}

/// Read a file from the file system
/// 
/// # Arguments
/// * `path` - The file path to read
/// 
/// # Returns
/// * `Ok(FileReadResult)` - File content with metadata on success
/// * `Err(FileSystemError)` - Error on failure
pub async fn read_file(path: &str) -> Result<FileReadResult, FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    // Check if file exists
    if !path_buf.exists() {
        return Err(FileSystemError::NotFound(format!("File not found: {}", path)));
    }
    
    // Check file size before reading
    let metadata = fs::metadata(&path_buf).await?;
    if metadata.len() > MAX_FILE_SIZE_READ {
        return Err(FileSystemError::FileTooLarge(format!(
            "File size {} exceeds maximum read size {}",
            metadata.len(),
            MAX_FILE_SIZE_READ
        )));
    }
    
    // Read file content
    let content = fs::read_to_string(&path_buf).await?;
    let line_count = content.lines().count();
    let size = metadata.len();
    
    Ok(FileReadResult {
        content,
        encoding: "utf-8".to_string(),
        line_count,
        size,
    })
}

/// Write a file to the file system
/// 
/// # Arguments
/// * `request` - File write request with path, content, and options
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(FileSystemError)` - Error on failure
pub async fn write_file(request: FileWriteRequest) -> Result<(), FileSystemError> {
    let path_buf = PathBuf::from(&request.path);
    
    // Check file size before writing
    let content_size = request.content.len() as u64;
    if content_size > MAX_FILE_SIZE_WRITE {
        return Err(FileSystemError::FileTooLarge(format!(
            "Content size {} exceeds maximum write size {}",
            content_size,
            MAX_FILE_SIZE_WRITE
        )));
    }
    
    // Create backup if requested and file exists
    if request.backup && path_buf.exists() {
        let backup_path = format!("{}.backup", request.path);
        fs::copy(&path_buf, &backup_path).await?;
    }
    
    // Create parent directories if needed
    if request.create_if_not_exists {
        if let Some(parent) = path_buf.parent() {
            fs::create_dir_all(parent).await?;
        }
    }
    
    // Atomic write: write to temp file, then rename
    let temp_path = path_buf.with_extension(".tmp");
    
    // Write to temp file
    fs::write(&temp_path, &request.content).await?;
    
    // Atomic rename
    fs::rename(&temp_path, &path_buf).await?;
    
    Ok(())
}

/// Delete a file from the file system
/// 
/// # Arguments
/// * `path` - The file path to delete
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(FileSystemError)` - Error on failure
pub async fn delete_file(path: &str) -> Result<(), FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    if !path_buf.exists() {
        return Err(FileSystemError::NotFound(format!("File not found: {}", path)));
    }
    
    fs::remove_file(&path_buf).await?;
    Ok(())
}

/// Get file metadata
/// 
/// # Arguments
/// * `path` - The file path
/// 
/// # Returns
/// * `Ok(FileMetadata)` - File metadata on success
/// * `Err(FileSystemError)` - Error on failure
pub async fn get_file_metadata(path: &str) -> Result<FileMetadata, FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    if !path_buf.exists() {
        return Err(FileSystemError::NotFound(format!("Path not found: {}", path)));
    }
    
    let metadata = fs::metadata(&path_buf).await?;
    let file_type = metadata.file_type();
    let is_file = file_type.is_file();
    let is_directory = file_type.is_dir();
    
    let name = path_buf
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();
    
    let modified = metadata
        .modified()
        .map(|t| DateTime::<Utc>::from(t))
        .unwrap_or_else(|_| Utc::now());
    
    let created = metadata
        .created()
        .map(|t| DateTime::<Utc>::from(t))
        .unwrap_or_else(|_| Utc::now());
    
    // Check permissions (simplified - actual permission checking is platform-specific)
    let permissions = FilePermissions {
        readable: metadata.permissions().readonly() == false || is_directory,
        writable: metadata.permissions().readonly() == false,
        executable: false, // Platform-specific check would go here
    };
    
    Ok(FileMetadata {
        path: path_buf.to_string_lossy().to_string(),
        name,
        size: metadata.len(),
        is_file,
        is_directory,
        modified,
        created,
        permissions,
    })
}

/// List directory contents
/// 
/// # Arguments
/// * `path` - The directory path
/// 
/// # Returns
/// * `Ok(Vec<DirectoryEntry>)` - Directory entries on success
/// * `Err(FileSystemError)` - Error on failure
pub async fn list_directory(path: &str) -> Result<Vec<DirectoryEntry>, FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    if !path_buf.exists() {
        return Err(FileSystemError::NotFound(format!("Directory not found: {}", path)));
    }
    
    if !path_buf.is_dir() {
        return Err(FileSystemError::InvalidPath(format!("Path is not a directory: {}", path)));
    }
    
    let mut entries = Vec::new();
    let mut dir_entries = fs::read_dir(&path_buf).await?;
    
    while let Some(entry) = dir_entries.next_entry().await? {
        let entry_path = entry.path();
        let metadata = entry.metadata().await?;
        let file_type = metadata.file_type();
        let is_file = file_type.is_file();
        let is_directory = file_type.is_dir();
        
        let name = entry_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();
        
        let modified = metadata
            .modified()
            .map(|t| DateTime::<Utc>::from(t))
            .unwrap_or_else(|_| Utc::now());
        
        entries.push(DirectoryEntry {
            name,
            path: entry_path.to_string_lossy().to_string(),
            is_file,
            is_directory,
            size: if is_file { Some(metadata.len()) } else { None },
            modified,
        });
    }
    
    // Sort: directories first, then files
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
        }
    });
    
    Ok(entries)
}

/// Create a directory
/// 
/// # Arguments
/// * `path` - The directory path to create
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(FileSystemError)` - Error on failure
pub async fn create_directory(path: &str) -> Result<(), FileSystemError> {
    let path_buf = PathBuf::from(path);
    fs::create_dir_all(&path_buf).await?;
    Ok(())
}

/// Delete a directory (recursive)
/// 
/// # Arguments
/// * `path` - The directory path to delete
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(FileSystemError)` - Error on failure
pub async fn delete_directory(path: &str) -> Result<(), FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    if !path_buf.exists() {
        return Err(FileSystemError::NotFound(format!("Directory not found: {}", path)));
    }
    
    fs::remove_dir_all(&path_buf).await?;
    Ok(())
}

/// Check if a path exists
/// 
/// # Arguments
/// * `path` - The path to check
/// 
/// # Returns
/// * `Ok(bool)` - True if path exists, false otherwise
/// * `Err(FileSystemError)` - Error on failure
pub async fn file_exists(path: &str) -> Result<bool, FileSystemError> {
    let path_buf = PathBuf::from(path);
    Ok(path_buf.exists())
}

