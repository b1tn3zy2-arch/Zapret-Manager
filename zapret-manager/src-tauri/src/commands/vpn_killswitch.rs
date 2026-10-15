use std::path::{Path, PathBuf};

use crate::error::{AppError, AppResult};
use crate::winapi_helpers::shell_execute_runas;
use crate::winapi_helpers::HiddenWindow;

pub const RULE_PREFIX: &str = "ZapretManager KillSwitch";

pub const LAN_RANGES: [&str; 3] = ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"];
pub const POLICY_FILE: &str = "killswitch-policy.txt";
pub const ELEVATE_TIMEOUT_MS: u32 = 30_000;

pub const RULE_ALLOW_VPN: &str = "AllowVPN";
pub const RULE_ALLOW_LAN: &str = "AllowLAN";
pub const RULE_ALLOW_DNS: &str = "AllowDNS";

pub const DEFAULT_OUTBOUND_BLOCK: &str = "blockoutbound";
pub const DEFAULT_OUTBOUND_ALLOW: &str = "allowoutbound";

pub fn rule_name(suffix: &str) -> String {
    format!("{RULE_PREFIX} {suffix}")
}

pub fn allow_vpn_arguments(interface: &str) -> Vec<String> {
    vec![
        "advfirewall".to_string(),
        "firewall".to_string(),
        "add".to_string(),
        "rule".to_string(),
        format!("name={}", rule_name(RULE_ALLOW_VPN)),
        "dir=out".to_string(),
        "action=allow".to_string(),
        format!("interface={interface}"),
        "enable=yes".to_string(),
    ]
}

pub fn allow_lan_arguments() -> Vec<String> {
    vec![
        "advfirewall".to_string(),
        "firewall".to_string(),
        "add".to_string(),
        "rule".to_string(),
        format!("name={}", rule_name(RULE_ALLOW_LAN)),
        "dir=out".to_string(),
        "action=allow".to_string(),
        format!("remoteip={}", LAN_RANGES.join(",")),
        "enable=yes".to_string(),
    ]
}

pub fn allow_dns_arguments() -> Vec<String> {
    vec![
        "advfirewall".to_string(),
        "firewall".to_string(),
        "add".to_string(),
        "rule".to_string(),
        format!("name={}", rule_name(RULE_ALLOW_DNS)),
        "dir=out".to_string(),
        "action=allow".to_string(),
        "protocol=UDP".to_string(),
        "remoteport=53".to_string(),
        "enable=yes".to_string(),
    ]
}

pub fn set_default_outbound_arguments(policy: &str) -> Vec<String> {
    vec![
        "advfirewall".to_string(),
        "firewall".to_string(),
        "set".to_string(),
        "allprofiles".to_string(),
        "firewallpolicy".to_string(),
        format!("blockinbound,{policy}"),
    ]
}

pub fn remove_rule_arguments(name: &str) -> Vec<String> {
    vec![
        "advfirewall".to_string(),
        "firewall".to_string(),
        "delete".to_string(),
        "rule".to_string(),
        format!("name={name}"),
    ]
}

pub fn remove_all_arguments() -> Vec<Vec<String>> {
    vec![
        remove_rule_arguments(&rule_name(RULE_ALLOW_VPN)),
        remove_rule_arguments(&rule_name(RULE_ALLOW_LAN)),
        remove_rule_arguments(&rule_name(RULE_ALLOW_DNS)),
    ]
}

pub fn apply_plan(interface: &str, previous_policy: &str) -> Vec<Vec<String>> {
    let mut plan: Vec<Vec<String>> = remove_all_arguments();
    plan.push(allow_vpn_arguments(interface));
    plan.push(allow_lan_arguments());
    plan.push(allow_dns_arguments());
    plan.push(set_default_outbound_arguments(DEFAULT_OUTBOUND_BLOCK));
    plan.push(set_default_outbound_arguments(previous_policy));

    plan
}

pub fn restore_plan(previous_policy: &str) -> Vec<Vec<String>> {
    let mut plan: Vec<Vec<String>> = remove_all_arguments();
    plan.push(set_default_outbound_arguments(previous_policy));

    plan
}

pub fn policy_file_path(dir: &Path) -> PathBuf {
    dir.join(POLICY_FILE)
}

pub fn parse_policy(output: &str) -> Option<String> {
    for line in output.lines() {
        let trimmed = line.trim();

        if trimmed.is_empty() {
            continue;
        }

        let lowered = trimmed.to_ascii_lowercase();

        if !lowered.contains("defaultoutboundaction") && !is_policy_word(&lowered) {
            continue;
        }

        let value = trimmed.split_whitespace().last()?;

        if value.eq_ignore_ascii_case("block") {
            return Some(DEFAULT_OUTBOUND_BLOCK.to_string());
        }

        if value.eq_ignore_ascii_case("allow") || value.eq_ignore_ascii_case("notconfigured") {
            return Some(DEFAULT_OUTBOUND_ALLOW.to_string());
        }
    }

    None
}

fn is_policy_word(lowered: &str) -> bool {
    matches!(lowered, "allow" | "block" | "notconfigured")
}

pub fn policy_is_blocked(policy: &str) -> bool {
    policy.eq_ignore_ascii_case(DEFAULT_OUTBOUND_BLOCK)
}

pub fn command_line(args: &[String]) -> String {
    args.iter()
        .map(|arg| {
            if arg.contains(' ') {
                format!("\"{arg}\"")
            } else {
                arg.clone()
            }
        })
        .collect::<Vec<String>>()
        .join(" ")
}

async fn run_elevated(args: &[String]) -> AppResult<()> {
    let arguments = command_line(args);
    let program = "netsh.exe".to_string();

    let (handle, _pid) = tokio::task::spawn_blocking(move || {
        shell_execute_runas(&program, &arguments, None)
    })
    .await
    .map_err(|error| AppError::custom(error.to_string()))??;

    let code = tokio::task::spawn_blocking(move || handle.wait_for_exit(ELEVATE_TIMEOUT_MS))
        .await
        .map_err(|error| AppError::custom(error.to_string()))??;

    if code != 0 {
        return Err(AppError::custom(format!(
            "netsh завершился с кодом {code}: {}",
            args.join(" ")
        )));
    }

    Ok(())
}

pub const POLICY_QUERY_SCRIPT: &str =
    "Get-NetFirewallProfile | Select-Object -ExpandProperty DefaultOutboundAction";

async fn query_default_outbound() -> AppResult<String> {
    let output = tokio::process::Command::new("powershell.exe")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            POLICY_QUERY_SCRIPT,
        ])
        .hidden()
        .output()
        .await
        .map_err(|error| {
            AppError::custom(format!("Не удалось прочитать политику firewall: {error}"))
        })?;

    let text = String::from_utf8_lossy(&output.stdout).to_string();

    match parse_policy(&text) {
        Some(policy) => Ok(policy),
        None => {
            tracing::warn!("DefaultOutboundAction не прочитан, считаю allowoutbound");
            Ok(DEFAULT_OUTBOUND_ALLOW.to_string())
        }
    }
}

pub async fn read_current_policy(dir: &Path) -> AppResult<String> {
    let path = policy_file_path(dir);

    if let Ok(text) = std::fs::read_to_string(&path) {
        let trimmed = text.trim();

        if !trimmed.is_empty() {
            return Ok(trimmed.to_string());
        }
    }

    query_default_outbound().await
}

pub fn save_policy(dir: &Path, policy: &str) -> AppResult<()> {
    std::fs::write(policy_file_path(dir), policy)?;

    Ok(())
}

pub fn clear_policy(dir: &Path) -> AppResult<()> {
    let path = policy_file_path(dir);

    if path.exists() {
        std::fs::remove_file(path)?;
    }

    Ok(())
}

pub async fn apply(interface: &str, state_dir: &Path) -> AppResult<()> {
    let previous = read_current_policy(state_dir).await?;

    if policy_is_blocked(&previous) {
        tracing::warn!("Kill Switch уже активен, предыдущая политика: {previous}");
    }

    save_policy(state_dir, &previous)?;

    for args in apply_plan(interface, &previous) {
        run_elevated(&args).await?;
    }

    tracing::info!("Kill Switch включён на интерфейсе {interface}");

    Ok(())
}

pub async fn disable(state_dir: &Path) -> AppResult<()> {
    let previous = read_current_policy(state_dir).await?;

    for args in restore_plan(&previous) {
        run_elevated(&args).await?;
    }

    clear_policy(state_dir)?;
    tracing::info!("Kill Switch выключен, политика восстановлена: {previous}");

    Ok(())
}

#[cfg(test)]
#[path = "vpn_killswitch_tests.rs"]
mod tests;