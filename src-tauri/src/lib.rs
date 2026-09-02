mod commands;
mod discord;
mod fs_scan;
mod process_watch;
mod tray;
mod validation;

use commands::{
    detect_fivem_path, get_fivem_status, hide_main_window, inspect_path, open_location, scan_fivem,
    select_folder, send_discord_report, show_main_window_cmd, validate_fivem_path,
};
use process_watch::show_main_window;
use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--autostart".into()]),
        ))
        .setup(|app| {
            let started_in_background = std::env::args().any(|arg| arg == "--autostart");
            tray::setup(app)?;
            tray::configure_main_window(app.handle());
            process_watch::start(app.handle().clone());

            if !started_in_background {
                show_main_window(app.handle());
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            select_folder,
            validate_fivem_path,
            detect_fivem_path,
            inspect_path,
            scan_fivem,
            open_location,
            send_discord_report,
            hide_main_window,
            show_main_window_cmd,
            get_fivem_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
