use serde::Serialize;
use std::path::{Path, PathBuf};

use crate::fs_scan::join_relative;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ValidationResult {
    pub is_valid: bool,
    pub path: String,
    pub missing: Vec<String>,
    pub message: String,
    pub suggested_path: Option<String>,
}

const EXPECTED_SEGMENTS: [&str; 3] = ["citizen", "citizen/common", "citizen/common/data"];

pub fn validate_fivem_path(path: &str) -> ValidationResult {
    let selected = PathBuf::from(path.trim());
    let path_string = selected.to_string_lossy().into_owned();

    if path.trim().is_empty() {
        return ValidationResult {
            is_valid: false,
            path: path_string,
            missing: EXPECTED_SEGMENTS.iter().map(|item| item.to_string()).collect(),
            message: "Choose a FiveM installation folder first.".to_string(),
            suggested_path: None,
        };
    }

    if !selected.exists() {
        return ValidationResult {
            is_valid: false,
            path: path_string,
            missing: EXPECTED_SEGMENTS.iter().map(|item| item.to_string()).collect(),
            message: "The selected folder does not exist.".to_string(),
            suggested_path: None,
        };
    }

    if !selected.is_dir() {
        return ValidationResult {
            is_valid: false,
            path: path_string,
            missing: EXPECTED_SEGMENTS.iter().map(|item| item.to_string()).collect(),
            message: "The selected path is not a folder.".to_string(),
            suggested_path: None,
        };
    }

    let nested_app = selected.join("FiveM.app");
    let suggested_path = if !has_data_folder(&selected) && has_data_folder(&nested_app) {
        Some(nested_app.to_string_lossy().into_owned())
    } else {
        None
    };

    let missing = missing_segments(&selected);

    if missing.is_empty() {
        return ValidationResult {
            is_valid: true,
            path: path_string,
            missing,
            message: "FiveM installation structure looks valid.".to_string(),
            suggested_path,
        };
    }

    let missing_list = missing.join(", ");
    let message = if suggested_path.is_some() {
        "This folder doesn't appear to be a valid FiveM installation. FiveM.app was found inside it."
            .to_string()
    } else {
        format!(
            "This folder doesn't appear to be a valid FiveM installation. The selected folder does not contain: {missing_list}"
        )
    };

    ValidationResult {
        is_valid: false,
        path: path_string,
        missing,
        message,
        suggested_path,
    }
}

fn missing_segments(base: &Path) -> Vec<String> {
    EXPECTED_SEGMENTS
        .iter()
        .filter_map(|relative| {
            join_relative(base, relative)
                .ok()
                .filter(|full| !full.is_dir())
                .map(|_| relative.to_string())
        })
        .collect()
}

fn has_data_folder(base: &Path) -> bool {
    join_relative(base, "citizen/common/data")
        .map(|path| path.is_dir())
        .unwrap_or(false)
}

pub fn detect_fivem_path() -> Option<String> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let fivem_root = PathBuf::from(local_app_data).join("FiveM");
        candidates.push(fivem_root.join("FiveM.app"));
        candidates.push(fivem_root);
    }

    for candidate in candidates {
        if !candidate.is_dir() {
            continue;
        }

        let validation = validate_fivem_path(&candidate.to_string_lossy());
        if validation.is_valid {
            return Some(candidate.to_string_lossy().into_owned());
        }
        if let Some(suggested) = validation.suggested_path {
            return Some(suggested);
        }
    }

    None
}
