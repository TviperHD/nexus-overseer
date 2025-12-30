use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;

use crate::filesystem::FileSystemError;

/// Event names for file watch events
pub const FILE_CREATED: &str = "file-created";
pub const FILE_MODIFIED: &str = "file-modified";
pub const FILE_DELETED: &str = "file-deleted";
pub const FILE_RENAMED: &str = "file-renamed";

/// File watch event payload
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum FileWatchEvent {
    Created(String),
    Modified(String),
    Deleted(String),
    Renamed { old: String, new: String },
}

/// File watcher state (thread-safe)
pub struct FileWatcherState {
    watchers: Mutex<HashMap<PathBuf, RecommendedWatcher>>,
}

impl FileWatcherState {
    pub fn new() -> Self {
        Self {
            watchers: Mutex::new(HashMap::new()),
        }
    }
}

/// Watch a single file for changes
/// 
/// # Arguments
/// * `path` - The file path to watch
/// * `app` - Tauri app handle for emitting events
/// * `state` - File watcher state
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(FileSystemError)` - Error on failure
pub fn watch_file(
    path: &str,
    app: AppHandle,
    state: &FileWatcherState,
) -> Result<(), FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    if !path_buf.exists() {
        return Err(FileSystemError::NotFound(format!("File not found: {}", path)));
    }
    
    // Check if already watching
    {
        let watchers = state.watchers.lock().unwrap();
        if watchers.contains_key(&path_buf) {
            return Ok(()); // Already watching
        }
    }
    
    // Create channel for file system events
    let (tx, mut rx) = mpsc::channel(100);
    
    // Create watcher
    let mut watcher = RecommendedWatcher::new(
        move |result: Result<notify::Event, notify::Error>| {
            if let Ok(event) = result {
                let _ = tx.try_send(event);
            }
        },
        notify::Config::default(),
    )
    .map_err(|e| FileSystemError::WatchError(format!("Failed to create watcher: {}", e)))?;
    
    // Watch the file
    watcher
        .watch(&path_buf, RecursiveMode::NonRecursive)
        .map_err(|e| FileSystemError::WatchError(format!("Failed to watch file: {}", e)))?;
    
    // Store watcher
    {
        let mut watchers = state.watchers.lock().unwrap();
        watchers.insert(path_buf.clone(), watcher);
    }
    
    // Spawn task to handle events
    let watched_path = path_buf.clone();
    tokio::spawn(async move {
        while let Some(event) = rx.recv().await {
            handle_file_event(&event, &watched_path, &app);
        }
    });
    
    Ok(())
}

/// Watch a directory for changes
/// 
/// # Arguments
/// * `path` - The directory path to watch
/// * `recursive` - Whether to watch recursively
/// * `app` - Tauri app handle for emitting events
/// * `state` - File watcher state
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(FileSystemError)` - Error on failure
pub fn watch_directory(
    path: &str,
    recursive: bool,
    app: AppHandle,
    state: &FileWatcherState,
) -> Result<(), FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    if !path_buf.exists() {
        return Err(FileSystemError::NotFound(format!("Directory not found: {}", path)));
    }
    
    if !path_buf.is_dir() {
        return Err(FileSystemError::InvalidPath(format!("Path is not a directory: {}", path)));
    }
    
    // Check if already watching
    {
        let watchers = state.watchers.lock().unwrap();
        if watchers.contains_key(&path_buf) {
            return Ok(()); // Already watching
        }
    }
    
    // Create channel for file system events
    let (tx, mut rx) = mpsc::channel(100);
    
    // Create watcher
    let mut watcher = RecommendedWatcher::new(
        move |result: Result<notify::Event, notify::Error>| {
            if let Ok(event) = result {
                let _ = tx.try_send(event);
            }
        },
        notify::Config::default(),
    )
    .map_err(|e| FileSystemError::WatchError(format!("Failed to create watcher: {}", e)))?;
    
    // Watch the directory
    let mode = if recursive {
        RecursiveMode::Recursive
    } else {
        RecursiveMode::NonRecursive
    };
    
    watcher
        .watch(&path_buf, mode)
        .map_err(|e| FileSystemError::WatchError(format!("Failed to watch directory: {}", e)))?;
    
    // Store watcher
    {
        let mut watchers = state.watchers.lock().unwrap();
        watchers.insert(path_buf.clone(), watcher);
    }
    
    // Spawn task to handle events
    let watched_path = path_buf.clone();
    tokio::spawn(async move {
        while let Some(event) = rx.recv().await {
            handle_directory_event(&event, &watched_path, &app);
        }
    });
    
    Ok(())
}

/// Stop watching a path
/// 
/// # Arguments
/// * `path` - The path to stop watching
/// * `state` - File watcher state
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(FileSystemError)` - Error on failure
pub fn unwatch(path: &str, state: &FileWatcherState) -> Result<(), FileSystemError> {
    let path_buf = PathBuf::from(path);
    
    let mut watchers = state.watchers.lock().unwrap();
    if watchers.remove(&path_buf).is_some() {
        Ok(())
    } else {
        Err(FileSystemError::NotFound(format!("Path not being watched: {}", path)))
    }
}

/// Stop watching all paths
/// 
/// # Arguments
/// * `state` - File watcher state
pub fn unwatch_all(state: &FileWatcherState) {
    let mut watchers = state.watchers.lock().unwrap();
    watchers.clear();
}

/// Handle file system event for a single file
fn handle_file_event(event: &notify::Event, watched_path: &PathBuf, app: &AppHandle) {
    for path in &event.paths {
        if path == watched_path {
            match event.kind {
                notify::EventKind::Create(_) => {
                    let payload = FileWatchEvent::Created(path.to_string_lossy().to_string());
                    let _ = app.emit(FILE_CREATED, &payload);
                }
                notify::EventKind::Modify(_) => {
                    let payload = FileWatchEvent::Modified(path.to_string_lossy().to_string());
                    let _ = app.emit(FILE_MODIFIED, &payload);
                }
                notify::EventKind::Remove(_) => {
                    let payload = FileWatchEvent::Deleted(path.to_string_lossy().to_string());
                    let _ = app.emit(FILE_DELETED, &payload);
                }
                notify::EventKind::Any => {
                    // Handle any other event types (including rename in some notify versions)
                    // For rename events, notify 6.x may emit them differently
                }
                _ => {}
            }
        }
    }
}

/// Handle file system event for a directory
fn handle_directory_event(event: &notify::Event, watched_dir: &PathBuf, app: &AppHandle) {
    for path in &event.paths {
        // Only emit events for files/directories within the watched directory
        if path.starts_with(watched_dir) {
            match event.kind {
                notify::EventKind::Create(_) => {
                    let payload = FileWatchEvent::Created(path.to_string_lossy().to_string());
                    let _ = app.emit(FILE_CREATED, &payload);
                }
                notify::EventKind::Modify(_) => {
                    let payload = FileWatchEvent::Modified(path.to_string_lossy().to_string());
                    let _ = app.emit(FILE_MODIFIED, &payload);
                }
                notify::EventKind::Remove(_) => {
                    let payload = FileWatchEvent::Deleted(path.to_string_lossy().to_string());
                    let _ = app.emit(FILE_DELETED, &payload);
                }
                notify::EventKind::Any => {
                    // Handle any other event types (including rename in some notify versions)
                    // For rename events, notify 6.x may emit them differently
                    // If event has multiple paths, it might be a rename
                    if event.paths.len() == 2 {
                        let payload = FileWatchEvent::Renamed {
                            old: event.paths[0].to_string_lossy().to_string(),
                            new: event.paths[1].to_string_lossy().to_string(),
                        };
                        let _ = app.emit(FILE_RENAMED, &payload);
                    }
                }
                _ => {}
            }
        }
    }
}

