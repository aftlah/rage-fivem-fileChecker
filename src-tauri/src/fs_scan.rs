use serde::{Deserialize, Serialize};
use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScanRuleInput {
    pub id: String,
    pub name: String,
    pub relative_path: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub severity: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScanResultDto {
    pub rule_id: String,
    pub name: String,
    pub status: String,
    pub path: String,
    pub relative_path: String,
    pub exists: bool,
    #[serde(rename = "type")]
    pub item_type: String,
    pub severity: String,
    pub modified_at: Option<i64>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScanProgressDto {
    pub current: usize,
    pub total: usize,
    pub rule_id: String,
    pub rule_name: String,
}

pub fn join_relative(base: &Path, relative: &str) -> Result<PathBuf, String> {
    let trimmed = relative.trim();
    if trimmed.is_empty() {
        return Err("Scan rule is missing a relative path.".to_string());
    }

    let mut path = base.to_path_buf();
    for part in trimmed.split(['/', '\\']) {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            return Err("Invalid relative path.".to_string());
        }
        path.push(part);
    }

    Ok(path)
}

pub fn inspect_rule(base: &Path, rule: &ScanRuleInput) -> ScanResultDto {
    let full_path = match join_relative(base, &rule.relative_path) {
        Ok(path) => path,
        Err(message) => {
            return error_result(rule, String::new(), message, false);
        }
    };

    let path_str = full_path.to_string_lossy().into_owned();

    match fs::metadata(&full_path) {
        Ok(metadata) => {
            let is_dir = metadata.is_dir();
            let is_file = metadata.is_file();
            let matches_type = match rule.item_type.as_str() {
                "directory" => is_dir,
                "file" => is_file,
                other => {
                    return error_result(
                        rule,
                        path_str,
                        format!("Unsupported scan type: {other}."),
                        true,
                    );
                }
            };

            if !matches_type {
                let found = if is_dir { "directory" } else { "file" };
                return error_result(
                    rule,
                    path_str,
                    format!(
                        "Expected a {}, but found a {found} instead.",
                        rule.item_type
                    ),
                    true,
                );
            }

            ScanResultDto {
                rule_id: rule.id.clone(),
                name: rule.name.clone(),
                status: "DETECTED".to_string(),
                path: path_str,
                relative_path: rule.relative_path.clone(),
                exists: true,
                item_type: rule.item_type.clone(),
                severity: rule.severity.clone(),
                modified_at: metadata.modified().ok().and_then(to_epoch_ms),
                error: None,
            }
        }
        Err(error) if error.kind() == ErrorKind::NotFound => ScanResultDto {
            rule_id: rule.id.clone(),
            name: rule.name.clone(),
            status: "NOT_FOUND".to_string(),
            path: path_str,
            relative_path: rule.relative_path.clone(),
            exists: false,
            item_type: rule.item_type.clone(),
            severity: rule.severity.clone(),
            modified_at: None,
            error: None,
        },
        Err(error) if error.kind() == ErrorKind::PermissionDenied => error_result(
            rule,
            path_str,
            "Permission denied. This folder or file could not be read.".to_string(),
            false,
        ),
        Err(error) => error_result(
            rule,
            path_str,
            format!("Unable to inspect this path: {error}"),
            false,
        ),
    }
}

pub fn ensure_directory(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Err("The selected folder does not exist.".to_string());
    }

    if !path.is_dir() {
        return Err("The selected path is not a folder.".to_string());
    }

    Ok(())
}

fn error_result(
    rule: &ScanRuleInput,
    path: String,
    message: String,
    exists: bool,
) -> ScanResultDto {
    ScanResultDto {
        rule_id: rule.id.clone(),
        name: rule.name.clone(),
        status: "ERROR".to_string(),
        path,
        relative_path: rule.relative_path.clone(),
        exists,
        item_type: rule.item_type.clone(),
        severity: rule.severity.clone(),
        modified_at: None,
        error: Some(message),
    }
}

fn to_epoch_ms(time: SystemTime) -> Option<i64> {
    time.duration_since(UNIX_EPOCH)
        .ok()
        .and_then(|duration| i64::try_from(duration.as_millis()).ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn joins_forward_slash_relative_path() {
        let base = PathBuf::from(r"C:\FiveM.app");
        let joined = join_relative(&base, "citizen/common/data/ai").unwrap();
        assert_eq!(joined, PathBuf::from(r"C:\FiveM.app\citizen\common\data\ai"));
    }

    #[test]
    fn rejects_parent_directory_segments() {
        let base = PathBuf::from(r"C:\FiveM.app");
        let result = join_relative(&base, "citizen/../Windows");
        assert!(result.is_err());
    }
}
