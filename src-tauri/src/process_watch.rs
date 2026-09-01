use serde::Serialize;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

const POLL_INTERVAL: Duration = Duration::from_secs(2);

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct FiveMStatus {
    running: bool,
}

pub fn start(app: AppHandle) {
    std::thread::spawn(move || {
        let mut was_running = is_fivem_running();
        let _ = app.emit("fivem-status", FiveMStatus { running: was_running });

        loop {
            std::thread::sleep(POLL_INTERVAL);
            let running = is_fivem_running();

            if running != was_running {
                let _ = app.emit("fivem-status", FiveMStatus { running });
            }

            if running && !was_running {
                let _ = app.emit("fivem-launched", ());
            }

            was_running = running;
        }
    });
}

#[cfg(windows)]
pub fn is_fivem_running() -> bool {
    use std::os::windows::process::CommandExt;
    use std::process::Command;

    const CREATE_NO_WINDOW: u32 = 0x0800_0000;

    let output = Command::new("tasklist")
        .args(["/FI", "IMAGENAME eq FiveM*", "/NH"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let Ok(output) = output else {
        return false;
    };

    let text = String::from_utf8_lossy(&output.stdout).to_lowercase();
    if text.contains("no tasks") {
        return false;
    }

    text.lines().any(|line| {
        let name = line.split_whitespace().next().unwrap_or("");
        name == "fivem.exe" || name.starts_with("fivem_")
    })
}

#[cfg(not(windows))]
pub fn is_fivem_running() -> bool {
    false
}
