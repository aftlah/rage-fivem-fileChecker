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
const DATA_ROOT_NAMES: [&str; 2] = ["FiveM Application Data", "FiveM.app"];

pub fn has_data_folder(base: &Path) -> bool {
    join_relative(base, "citizen/common/data")
        .map(|path| path.is_dir())
        .unwrap_or(false)
}

pub fn is_fivem_data_root_name(name: &std::ffi::OsStr) -> bool {
    DATA_ROOT_NAMES
        .iter()
        .any(|root| name.eq_ignore_ascii_case(root))
}

fn nested_data_root(base: &Path) -> Option<PathBuf> {
    DATA_ROOT_NAMES
        .iter()
        .map(|name| base.join(name))
        .find(|path| has_data_folder(path))
}

pub fn pick_fivem_data_root(candidates: impl IntoIterator<Item = PathBuf>) -> Option<String> {
    let mut with_citizen: Vec<PathBuf> = Vec::new();
    let mut existing: Vec<PathBuf> = Vec::new();

    for candidate in candidates {
        if !candidate.is_dir() {
            continue;
        }

        if has_data_folder(&candidate) {
            with_citizen.push(candidate);
            continue;
        }

        if let Some(nested) = nested_data_root(&candidate) {
            with_citizen.push(nested);
            continue;
        }

        existing.push(candidate);
    }

    let preferred = with_citizen.iter().find(|path| {
        path.file_name()
            .is_some_and(|name| name.eq_ignore_ascii_case("FiveM Application Data"))
    });

    preferred
        .or(with_citizen.first())
        .or(existing.first())
        .map(|path| path.to_string_lossy().into_owned())
}

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

    let suggested_path = if !has_data_folder(&selected) {
        nested_data_root(&selected).map(|path| path.to_string_lossy().into_owned())
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
        "This folder doesn't appear to be a valid FiveM installation. A FiveM data folder was found inside it."
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

pub fn detect_fivem_path() -> Option<String> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let fivem_root = PathBuf::from(local_app_data).join("FiveM");
        candidates.push(fivem_root.join("FiveM Application Data"));
        candidates.push(fivem_root.join("FiveM.app"));
        candidates.push(fivem_root);
    }

    pick_fivem_data_root(candidates)
}
