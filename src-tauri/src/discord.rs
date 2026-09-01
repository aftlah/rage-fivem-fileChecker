use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiscordResultItem {
    pub name: String,
    pub status: String,
    pub relative_path: String,
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

    let result_lines = if report.results.is_empty() {
        "No checks were reported.".to_string()
    } else {
        report
            .results
            .iter()
            .map(|item| {
                let status = if item.status == "NOT_FOUND" {
                    "NOT DETECTED"
                } else {
                    item.status.as_str()
                };
                format!(
                    "• **{}**: {status} (`{}`)",
                    item.name, item.relative_path
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    };

    let payload = serde_json::json!({
        "username": "RAGE FiveM File Checker",
        "embeds": [{
            "title": format!("Scan result: {}", report.overall_status),
            "color": color,
            "fields": [
                { "name": "Name", "value": player_name, "inline": true },
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

fn is_discord_webhook(url: &str) -> bool {
    url.starts_with("https://discord.com/api/webhooks/")
        || url.starts_with("https://discordapp.com/api/webhooks/")
        || url.starts_with("https://canary.discord.com/api/webhooks/")
}
