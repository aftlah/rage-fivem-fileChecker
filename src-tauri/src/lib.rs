mod commands;
mod fs_scan;
mod process_watch;
mod validation;

use commands::{
    detect_fivem_path, inspect_path, open_location, scan_fivem, select_folder, validate_fivem_path,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            process_watch::start(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            select_folder,
            validate_fivem_path,
            detect_fivem_path,
            inspect_path,
            scan_fivem,
            open_location
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
