use serde::Deserialize;
use serde_json::{json, Value};

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiscordResultItem {
    pub name: String,
    pub status: String,
    pub relative_path: String,
    #[serde(default)]
    pub found_files: Vec<String>,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiscordReport {
    pub webhook_url: String,
    pub player_name: String,
    pub five_m_path: String,
    pub overall_status: String,
    pub detected: u32,
    pub not_detected: u32,
    pub errors: u32,
    pub results: Vec<DiscordResultItem>,
}

const DATA_PREFIX: &str = "citizen/common/data/";
const FIELD_LIMIT: usize = 1024;

pub fn send_scan_report(report: DiscordReport) -> Result<(), String> {
    let webhook = report.webhook_url.trim().to_string();
    if !is_discord_webhook(&webhook) {
        return Err("Discord webhook URL is invalid.".to_string());
    }

    let player_name = report.player_name.trim().to_string();
    if player_name.is_empty() {
        return Err("A name is required before sending to Discord.".to_string());
    }

    let (title, color) = match report.overall_status.as_str() {
        "DETECTED" => ("Flagged files found", 0xEF_44_44),
        "WARNING" => ("Scan finished with warnings", 0xEA_B3_08),
        _ => ("No flagged files", 0x22_C5_5E),
    };

    let description = if report.detected == 0 && report.errors == 0 {
        format!("**{player_name}** · all checks passed")
    } else {
        format!(
            "**{player_name}** · {} flagged · {} clean",
            report.detected, report.not_detected
        )
    };

    let payload = json!({
        "username": "RAGE File Scanner",
        "embeds": [{
            "author": { "name": "RAGE File Scanner" },
            "title": title,
            "description": description,
            "color": color,
            "fields": build_fields(&report, &player_name)
        }]
    });

    ureq::post(&webhook)
        .set("Content-Type", "application/json")
        .send_json(payload)
        .map_err(|error| format!("Failed to send Discord report: {error}"))?;

    Ok(())
}

fn build_fields(report: &DiscordReport, player_name: &str) -> Vec<Value> {
    let mut fields = vec![
        field("Player", player_name, true),
        field("Flagged", &report.detected.to_string(), true),
        field("Clean", &report.not_detected.to_string(), true),
    ];

    if report.errors > 0 {
        fields.push(field("Errors", &report.errors.to_string(), true));
    }

    fields.push(field(
        "FiveM path",
        &format!("`{}`", report.five_m_path),
        false,
    ));

    let flagged_chunks = flagged_field_values(report);
    let total = flagged_chunks.len();
    for (index, value) in flagged_chunks.into_iter().enumerate() {
        let name = if total <= 1 {
            "Flagged files".to_string()
        } else {
            format!("Flagged files ({}/{})", index + 1, total)
        };
        fields.push(field(&name, &value, false));
    }

    fields
}

fn field(name: &str, value: &str, inline: bool) -> Value {
    json!({ "name": name, "value": value, "inline": inline })
}

fn flagged_field_values(report: &DiscordReport) -> Vec<String> {
    let mut flagged: Vec<&DiscordResultItem> = report
        .results
        .iter()
        .filter(|item| item.status != "NOT_FOUND")
        .collect();
    flagged.sort_by(|left, right| left.status.cmp(&right.status).then(left.name.cmp(&right.name)));

    if flagged.is_empty() {
        return vec!["All checked files were clean.".to_string()];
    }

    let blocks: Vec<String> = flagged.iter().map(|item| format_result_item(item)).collect();
    chunk_blocks(&blocks, FIELD_LIMIT)
}

fn format_result_item(item: &DiscordResultItem) -> String {
    let path = display_path(&item.relative_path);
    let mut lines = vec![format!("**{}**\n`{path}`", item.name)];

    if !item.found_files.is_empty() {
        let preview: Vec<String> = item
            .found_files
            .iter()
            .take(4)
            .map(|file| format!("`{file}`"))
            .collect();
        let extra = item.found_files.len().saturating_sub(preview.len());
        let mut files = preview.join(" · ");
        if extra > 0 {
            files.push_str(&format!(" · +{extra} more"));
        }
        lines.push(files);
    }

    if item.status == "ERROR" {
        lines.push("Status: ERROR".to_string());
    }

    lines.join("\n")
}

fn display_path(relative: &str) -> String {
    let normalized = relative.replace('\\', "/");
    normalized
        .strip_prefix(DATA_PREFIX)
        .unwrap_or(&normalized)
        .to_string()
}

fn chunk_blocks(blocks: &[String], max: usize) -> Vec<String> {
    let mut chunks = Vec::new();
    let mut current = String::new();

    for block in blocks {
        let next = if current.is_empty() {
            block.clone()
        } else {
            format!("{current}\n\n{block}")
        };

        if next.chars().count() > max && !current.is_empty() {
            chunks.push(current);
            current = block.clone();
        } else {
            current = next;
        }
    }

    if !current.is_empty() {
        chunks.push(truncate_field(&current, max));
    }

    chunks
}

fn truncate_field(value: &str, max: usize) -> String {
    if value.chars().count() <= max {
        return value.to_string();
    }

    let keep = max.saturating_sub(14);
    let mut truncated: String = value.chars().take(keep).collect();
    truncated.push_str("\n…truncated");
    truncated
}

fn is_discord_webhook(url: &str) -> bool {
    url.starts_with("https://discord.com/api/webhooks/")
        || url.starts_with("https://discordapp.com/api/webhooks/")
        || url.starts_with("https://canary.discord.com/api/webhooks/")
}

#[cfg(test)]
mod tests {
    use super::display_path;

    #[test]
    fn strips_common_data_prefix() {
        assert_eq!(
            display_path("citizen/common/data/ai/pedaccuracy.meta"),
            "ai/pedaccuracy.meta"
        );
    }
}
