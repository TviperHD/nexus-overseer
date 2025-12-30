mod filesystem;
mod file_watcher;
mod security;

use filesystem::{
    create_directory, delete_directory, delete_file, file_exists, get_file_metadata,
    list_directory, read_file, write_file, DirectoryEntry, FileMetadata, FileReadResult,
    FileWriteRequest,
};
use file_watcher::{unwatch, unwatch_all, watch_directory, watch_file, FileWatcherState};
use security::{validate_path, SecurityManager};
use std::sync::Mutex;
use tauri::{AppHandle, State};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// File operations commands
#[tauri::command]
async fn read_file_command(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<FileReadResult, String> {
    // Validate path
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // Check if path is allowed (lock released before await)
    let is_allowed = {
        let security_manager = security.lock().unwrap();
        security_manager.is_path_allowed(&validated_path)
    };
    
    if !is_allowed {
        return Err(format!(
            "Path not allowed. Please request permission for: {}",
            path
        ));
    }
    
    read_file(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
async fn write_file_command(
    request: FileWriteRequest,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<(), String> {
    // Validate path
    let validated_path = validate_path(&request.path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // Check if path is allowed (lock released before await)
    let is_allowed = {
        let security_manager = security.lock().unwrap();
        security_manager.is_path_allowed(&validated_path)
    };
    
    if !is_allowed {
        return Err(format!(
            "Path not allowed. Please request permission for: {}",
            request.path
        ));
    }
    
    write_file(request)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
async fn delete_file_command(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<(), String> {
    // Validate path
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // Check if path is allowed (lock released before await)
    let is_allowed = {
        let security_manager = security.lock().unwrap();
        security_manager.is_path_allowed(&validated_path)
    };
    
    if !is_allowed {
        return Err(format!(
            "Path not allowed. Please request permission for: {}",
            path
        ));
    }
    
    delete_file(&path)
        .await
        .map_err(|e| format!("Failed to delete file: {}", e))
}

#[tauri::command]
async fn get_file_metadata_command(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<FileMetadata, String> {
    // Validate path
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // Check if path is allowed (lock released before await)
    let is_allowed = {
        let security_manager = security.lock().unwrap();
        security_manager.is_path_allowed(&validated_path)
    };
    
    if !is_allowed {
        return Err(format!(
            "Path not allowed. Please request permission for: {}",
            path
        ));
    }
    
    get_file_metadata(&path)
        .await
        .map_err(|e| format!("Failed to get file metadata: {}", e))
}

// Directory operations commands
#[tauri::command]
async fn list_directory_command(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<Vec<DirectoryEntry>, String> {
    // Validate path
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // Check if path is allowed (lock released before await)
    let is_allowed = {
        let security_manager = security.lock().unwrap();
        security_manager.is_path_allowed(&validated_path)
    };
    
    if !is_allowed {
        return Err(format!(
            "Path not allowed. Please request permission for: {}",
            path
        ));
    }
    
    list_directory(&path)
        .await
        .map_err(|e| format!("Failed to list directory: {}", e))
}

#[tauri::command]
async fn create_directory_command(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<(), String> {
    // Validate path
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // Check if path is allowed (lock released before await)
    let is_allowed = {
        let security_manager = security.lock().unwrap();
        security_manager.is_path_allowed(&validated_path)
    };
    
    if !is_allowed {
        return Err(format!(
            "Path not allowed. Please request permission for: {}",
            path
        ));
    }
    
    create_directory(&path)
        .await
        .map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
async fn delete_directory_command(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<(), String> {
    // Validate path
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // Check if path is allowed (lock released before await)
    let is_allowed = {
        let security_manager = security.lock().unwrap();
        security_manager.is_path_allowed(&validated_path)
    };
    
    if !is_allowed {
        return Err(format!(
            "Path not allowed. Please request permission for: {}",
            path
        ));
    }
    
    delete_directory(&path)
        .await
        .map_err(|e| format!("Failed to delete directory: {}", e))
}

#[tauri::command]
async fn file_exists_command(path: String) -> Result<bool, String> {
    // Validate path (but don't require it to be allowed for existence check)
    let _validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    file_exists(&path)
        .await
        .map_err(|e| format!("Failed to check file existence: {}", e))
}

// File watching commands
#[tauri::command]
async fn watch_file_command(
    path: String,
    app: AppHandle,
    state: State<'_, FileWatcherState>,
) -> Result<(), String> {
    watch_file(&path, app, &state)
        .map_err(|e| format!("Failed to watch file: {}", e))
}

#[tauri::command]
async fn watch_directory_command(
    path: String,
    recursive: bool,
    app: AppHandle,
    state: State<'_, FileWatcherState>,
) -> Result<(), String> {
    watch_directory(&path, recursive, app, &state)
        .map_err(|e| format!("Failed to watch directory: {}", e))
}

#[tauri::command]
async fn unwatch_command(
    path: String,
    state: State<'_, FileWatcherState>,
) -> Result<(), String> {
    unwatch(&path, &state)
        .map_err(|e| format!("Failed to unwatch: {}", e))
}

#[tauri::command]
async fn unwatch_all_command(state: State<'_, FileWatcherState>) -> Result<(), String> {
    unwatch_all(&state);
    Ok(())
}

// Security commands
#[tauri::command]
async fn request_path_permission(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<bool, String> {
    // Validate and normalize path first
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    // For now, automatically grant permission (in future, this could show a dialog)
    let mut security_manager = security.lock().unwrap();
    
    // Add the path itself
    security_manager.add_allowed_path(validated_path.clone());
    
    // Also try to canonicalize and add that version
    if let Ok(canonical) = validated_path.canonicalize() {
        security_manager.add_allowed_path(canonical);
    }
    
    Ok(true)
}

#[tauri::command]
async fn add_allowed_path(
    path: String,
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<(), String> {
    let validated_path = validate_path(&path)
        .map_err(|e| format!("Path validation failed: {}", e))?;
    
    let mut security_manager = security.lock().unwrap();
    security_manager.add_allowed_path(validated_path);
    
    Ok(())
}

#[tauri::command]
async fn get_allowed_paths(
    security: State<'_, Mutex<SecurityManager>>,
) -> Result<Vec<String>, String> {
    let security_manager = security.lock().unwrap();
    let paths = security_manager
        .get_allowed_paths()
        .iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect();
    
    Ok(paths)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(FileWatcherState::new())
        .manage(Mutex::new(SecurityManager::new()))
        .invoke_handler(tauri::generate_handler![
            greet,
            read_file_command,
            write_file_command,
            delete_file_command,
            get_file_metadata_command,
            list_directory_command,
            create_directory_command,
            delete_directory_command,
            file_exists_command,
            watch_file_command,
            watch_directory_command,
            unwatch_command,
            unwatch_all_command,
            request_path_permission,
            add_allowed_path,
            get_allowed_paths
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
