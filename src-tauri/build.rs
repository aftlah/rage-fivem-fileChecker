fn main() {
    embed_discord_webhook();
    tauri_build::build();
}

fn embed_discord_webhook() {
    println!("cargo:rerun-if-env-changed=DISCORD_WEBHOOK_URL");
    println!("cargo:rerun-if-changed=.discord.env");
    println!("cargo:rerun-if-changed=../.discord.env");

    if let Ok(url) = std::env::var("DISCORD_WEBHOOK_URL") {
        let trimmed = url.trim();
        if !trimmed.is_empty() {
            println!("cargo:rustc-env=DISCORD_WEBHOOK_URL={trimmed}");
            return;
        }
    }

    for candidate in [".discord.env", "../.discord.env"] {
        if let Ok(contents) = std::fs::read_to_string(candidate) {
            for line in contents.lines() {
                let trimmed = line.trim();
                if trimmed.is_empty() || trimmed.starts_with('#') {
                    continue;
                }
                if let Some(value) = trimmed.strip_prefix("DISCORD_WEBHOOK_URL=") {
                    let value = value.trim().trim_matches('"');
                    if !value.is_empty() {
                        println!("cargo:rustc-env=DISCORD_WEBHOOK_URL={value}");
                        return;
                    }
                }
            }
        }
    }
}
