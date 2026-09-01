use serde::Deserialize;
use serde_json::json;

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

const DESCRIPTION_LIMIT: usize = 4096;

pub fn send_scan_report(report: DiscordReport) -> Result<(), String> {
    let webhook = report.webhook_url.trim().to_string();
    if !is_discord_webhook(&webhook) {
        return Err("Discord webhook URL is invalid.".to_string());
    }

    let player_name = report.player_name.trim().to_string();
    if player_name.is_empty() {
        return Err("A name is required before sending to Discord.".to_string());
    }

    let has_issue = report.detected > 0 || report.errors > 0;
    let (title, color, ping) = if has_issue {
        (
            "ADA FILE",
            0xEF_44_44,
            format!("**{player_name}** ada file yang dicurigai."),
        )
    } else {
        (
            "AMAN",
            0x22_C5_5E,
            format!("**{player_name}** aman, tidak ada file yang dicurigai."),
        )
    };

    let payload = json!({
        "username": "RAGE File Scanner",
        "content": ping,
        "embeds": [{
            "title": title,
            "description": build_description(&report, &player_name, has_issue),
            "color": color
        }]
    });

    ureq::post(&webhook)
        .set("Content-Type", "application/json")
        .send_json(payload)
        .map_err(|error| format!("Failed to send Discord report: {error}"))?;

    Ok(())
}

fn build_description(report: &DiscordReport, player_name: &str, has_issue: bool) -> String {
    let mut lines = vec![
        format!("Nama: **{player_name}**"),
        format!("Folder FiveM: {}", report.five_m_path),
        String::new(),
    ];

    if has_issue {
        let mut found: Vec<&DiscordResultItem> = report
            .results
            .iter()
            .filter(|item| item.status != "NOT_FOUND")
            .collect();
        found.sort_by(|left, right| left.name.cmp(&right.name));

        lines.push(format!("File yang ketemu ({}):", found.len()));
        for (index, item) in found.iter().enumerate() {
            lines.push(format!("{}. {}", index + 1, format_found_name(item)));
        }
    } else {
        lines.push("Tidak ada file yang dicari.".to_string());
    }

    let clean: Vec<&str> = report
        .results
        .iter()
        .filter(|item| item.status == "NOT_FOUND")
        .map(|item| item.name.as_str())
        .collect();
    if !clean.is_empty() {
        lines.push(String::new());
        lines.push(format!("Tidak ketemu: {}", clean.join(", ")));
    }

    truncate(&lines.join("\n"), DESCRIPTION_LIMIT)
}

fn format_found_name(item: &DiscordResultItem) -> String {
    if item.status == "ERROR" {
        return format!("{} (gagal dibaca)", item.name);
    }

    if item.found_files.is_empty() {
        return item.name.clone();
    }

    let extra = item.found_files.len().saturating_sub(1);
    if extra == 0 {
        format!("{} ({})", item.name, item.found_files[0])
    } else {
        format!("{} ({}, +{} file lain)", item.name, item.found_files[0], extra)
    }
}

fn truncate(value: &str, max: usize) -> String {
    if value.chars().count() <= max {
        return value.to_string();
    }

    let keep = max.saturating_sub(1);
    let mut truncated: String = value.chars().take(keep).collect();
    truncated.push('…');
    truncated
}

fn is_discord_webhook(url: &str) -> bool {
    url.starts_with("https://discord.com/api/webhooks/")
        || url.starts_with("https://discordapp.com/api/webhooks/")
        || url.starts_with("https://canary.discord.com/api/webhooks/")
}
