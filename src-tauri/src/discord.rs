use serde::Deserialize;

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

pub fn send_scan_report(report: DiscordReport) -> Result<(), String> {
    let webhook = report.webhook_url.trim().to_string();
    if !is_discord_webhook(&webhook) {
        return Err("Discord webhook URL is invalid.".to_string());
    }

    let player_name = report.player_name.trim().to_string();
    if player_name.is_empty() {
        return Err("A name is required before sending to Discord.".to_string());
    }

    let color = match report.overall_status.as_str() {
        "DETECTED" => 0xEF_44_44,
        "WARNING" => 0xEA_B3_08,
        _ => 0x22_C5_5E,
    };

    let result_lines = format_check_lines(&report);

    let payload = serde_json::json!({
        "username": "RAGE File Scanner",
        "embeds": [{
            "title": format!("Scan result: {}", report.overall_status),
            "color": color,
            "fields": [
                { "name": "name in character", "value": player_name, "inline": true },
                { "name": "Status", "value": report.overall_status, "inline": true },
                { "name": "Detected", "value": report.detected.to_string(), "inline": true },
                { "name": "Not detected", "value": report.not_detected.to_string(), "inline": true },
                { "name": "Errors", "value": report.errors.to_string(), "inline": true },
                { "name": "FiveM path", "value": format!("```{}```", report.five_m_path) },
                { "name": "Checks", "value": result_lines }
            ]
        }]
    });

    ureq::post(&webhook)
        .set("Content-Type", "application/json")
        .send_json(payload)
        .map_err(|error| format!("Failed to send Discord report: {error}"))?;

    Ok(())
}

fn format_check_lines(report: &DiscordReport) -> String {
    if report.results.is_empty() {
        return "No checks were reported.".to_string();
    }

    let mut flagged: Vec<&DiscordResultItem> = report
        .results
        .iter()
        .filter(|item| item.status != "NOT_FOUND")
        .collect();
    flagged.sort_by(|left, right| left.status.cmp(&right.status).then(left.name.cmp(&right.name)));

    let mut lines = if flagged.is_empty() {
        vec!["All checked files were not detected.".to_string()]
    } else {
        flagged.iter().map(|item| format_result_item(item)).collect()
    };

    if report.not_detected > 0 && !flagged.is_empty() {
        lines.push(format!(
            "• {} other check(s) not detected.",
            report.not_detected
        ));
    }

    truncate_field(&lines.join("\n"), 1024)
}

fn format_result_item(item: &DiscordResultItem) -> String {
    let status = if item.status == "NOT_FOUND" {
        "NOT DETECTED"
    } else {
        item.status.as_str()
    };

    let mut line = format!("• **{}**: {status} (`{}`)", item.name, item.relative_path);
    if !item.found_files.is_empty() {
        let preview: Vec<&str> = item
            .found_files
            .iter()
            .take(8)
            .map(String::as_str)
            .collect();
        let extra = item.found_files.len().saturating_sub(preview.len());
        let files = if extra > 0 {
            format!("{}; +{extra} more", preview.join(", "))
        } else {
            preview.join(", ")
        };
        line.push_str(&format!("\n  files: {files}"));
    }
    line
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
