// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::winapi_helpers::shell_execute_runas;.
use crate::winapi_helpers::shell_execute_runas;
// Подключаем модули: crate::winapi_helpers::HiddenWindow;.
use crate::winapi_helpers::HiddenWindow;

// Объявляем константу RULE_PREFIX.
pub const RULE_PREFIX: &str = "ZapretManager KillSwitch";

// Объявляем константу LAN_RANGES.
pub const LAN_RANGES: [&str; 3] = ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"];
// Объявляем константу POLICY_FILE.
pub const POLICY_FILE: &str = "killswitch-policy.txt";
// Объявляем константу ELEVATE_TIMEOUT_MS.
pub const ELEVATE_TIMEOUT_MS: u32 = 30_000;

// Объявляем константу RULE_ALLOW_VPN.
pub const RULE_ALLOW_VPN: &str = "AllowVPN";
// Объявляем константу RULE_ALLOW_LAN.
pub const RULE_ALLOW_LAN: &str = "AllowLAN";
// Объявляем константу RULE_ALLOW_DNS.
pub const RULE_ALLOW_DNS: &str = "AllowDNS";

// Объявляем константу DEFAULT_OUTBOUND_BLOCK.
pub const DEFAULT_OUTBOUND_BLOCK: &str = "blockoutbound";
// Объявляем константу DEFAULT_OUTBOUND_ALLOW.
pub const DEFAULT_OUTBOUND_ALLOW: &str = "allowoutbound";
// Объявляем константу DEFAULT_INBOUND_BLOCK.
pub const DEFAULT_INBOUND_BLOCK: &str = "blockinbound";
// Объявляем константу DEFAULT_INBOUND_ALLOW.
pub const DEFAULT_INBOUND_ALLOW: &str = "allowinbound";

/// Политика хранится парой «входящая,исходящая»: netsh требует задавать
/// обе части разом, а сменить входящую и не запомнить прежнюю — значит
/// оставить пользователя без входящих соединений навсегда.
// Объявляем функцию policy_pair.
pub fn policy_pair(inbound: &str, outbound: &str) -> String {
    // Выполняем операцию: format!("{inbound},{outbound}").
    format!("{inbound},{outbound}")
    // Закрываем блок.
}

// Объявляем функцию split_policy.
pub fn split_policy(policy: &str) -> (String, String) {
    // Выбираем вариант по значению.
    match policy.split_once(',') {
        // Выполняем операцию: Some((inbound, outbound)) => (inbound.trim().to_string(.
        Some((inbound, outbound)) => (inbound.trim().to_string(), outbound.trim().to_string()),
        // Выполняем операцию: None => (DEFAULT_INBOUND_ALLOW.to_string(), policy.trim.
        None => (DEFAULT_INBOUND_ALLOW.to_string(), policy.trim().to_string()),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию rule_name.
pub fn rule_name(suffix: &str) -> String {
    // Выполняем операцию: format!("{RULE_PREFIX} {suffix}").
    format!("{RULE_PREFIX} {suffix}")
    // Закрываем блок.
}

// Объявляем функцию allow_vpn_arguments.
pub fn allow_vpn_arguments(interface: &str) -> Vec<String> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: "advfirewall".to_string(),.
        "advfirewall".to_string(),
        // Выполняем операцию: "firewall".to_string(),.
        "firewall".to_string(),
        // Выполняем операцию: "add".to_string(),.
        "add".to_string(),
        // Выполняем операцию: "rule".to_string(),.
        "rule".to_string(),
        // Выполняем операцию: format!("name={}", rule_name(RULE_ALLOW_VPN)),.
        format!("name={}", rule_name(RULE_ALLOW_VPN)),
        // Выполняем операцию: "dir=out".to_string(),.
        "dir=out".to_string(),
        // Выполняем операцию: "action=allow".to_string(),.
        "action=allow".to_string(),
        // Выполняем операцию: format!("interface={interface}"),.
        format!("interface={interface}"),
        // Выполняем операцию: "enable=yes".to_string(),.
        "enable=yes".to_string(),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

// Объявляем функцию allow_lan_arguments.
pub fn allow_lan_arguments() -> Vec<String> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: "advfirewall".to_string(),.
        "advfirewall".to_string(),
        // Выполняем операцию: "firewall".to_string(),.
        "firewall".to_string(),
        // Выполняем операцию: "add".to_string(),.
        "add".to_string(),
        // Выполняем операцию: "rule".to_string(),.
        "rule".to_string(),
        // Выполняем операцию: format!("name={}", rule_name(RULE_ALLOW_LAN)),.
        format!("name={}", rule_name(RULE_ALLOW_LAN)),
        // Выполняем операцию: "dir=out".to_string(),.
        "dir=out".to_string(),
        // Выполняем операцию: "action=allow".to_string(),.
        "action=allow".to_string(),
        // Выполняем операцию: format!("remoteip={}", LAN_RANGES.join(",")),.
        format!("remoteip={}", LAN_RANGES.join(",")),
        // Выполняем операцию: "enable=yes".to_string(),.
        "enable=yes".to_string(),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

// Объявляем функцию allow_dns_arguments.
pub fn allow_dns_arguments() -> Vec<String> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: "advfirewall".to_string(),.
        "advfirewall".to_string(),
        // Выполняем операцию: "firewall".to_string(),.
        "firewall".to_string(),
        // Выполняем операцию: "add".to_string(),.
        "add".to_string(),
        // Выполняем операцию: "rule".to_string(),.
        "rule".to_string(),
        // Выполняем операцию: format!("name={}", rule_name(RULE_ALLOW_DNS)),.
        format!("name={}", rule_name(RULE_ALLOW_DNS)),
        // Выполняем операцию: "dir=out".to_string(),.
        "dir=out".to_string(),
        // Выполняем операцию: "action=allow".to_string(),.
        "action=allow".to_string(),
        // Выполняем операцию: "protocol=UDP".to_string(),.
        "protocol=UDP".to_string(),
        // Выполняем операцию: "remoteport=53".to_string(),.
        "remoteport=53".to_string(),
        // Выполняем операцию: "enable=yes".to_string(),.
        "enable=yes".to_string(),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

/// `policy` — пара «входящая,исходящая» целиком: netsh задаёт обе
/// части одной командой, разделить их нельзя.
// Объявляем функцию set_default_outbound_arguments.
pub fn set_default_outbound_arguments(policy: &str) -> Vec<String> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: "advfirewall".to_string(),.
        "advfirewall".to_string(),
        // Выполняем операцию: "firewall".to_string(),.
        "firewall".to_string(),
        // Выполняем операцию: "set".to_string(),.
        "set".to_string(),
        // Выполняем операцию: "allprofiles".to_string(),.
        "allprofiles".to_string(),
        // Выполняем операцию: "firewallpolicy".to_string(),.
        "firewallpolicy".to_string(),
        // Выполняем операцию: policy.to_string(),.
        policy.to_string(),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

// Объявляем функцию remove_rule_arguments.
pub fn remove_rule_arguments(name: &str) -> Vec<String> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: "advfirewall".to_string(),.
        "advfirewall".to_string(),
        // Выполняем операцию: "firewall".to_string(),.
        "firewall".to_string(),
        // Выполняем операцию: "delete".to_string(),.
        "delete".to_string(),
        // Выполняем операцию: "rule".to_string(),.
        "rule".to_string(),
        // Выполняем операцию: format!("name={name}"),.
        format!("name={name}"),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

// Объявляем функцию remove_all_arguments.
pub fn remove_all_arguments() -> Vec<Vec<String>> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: remove_rule_arguments(&rule_name(RULE_ALLOW_VPN)),.
        remove_rule_arguments(&rule_name(RULE_ALLOW_VPN)),
        // Выполняем операцию: remove_rule_arguments(&rule_name(RULE_ALLOW_LAN)),.
        remove_rule_arguments(&rule_name(RULE_ALLOW_LAN)),
        // Выполняем операцию: remove_rule_arguments(&rule_name(RULE_ALLOW_DNS)),.
        remove_rule_arguments(&rule_name(RULE_ALLOW_DNS)),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

/// План включения: правила-исключения идут первыми, политика по
/// умолчанию — последней. Входящую политику не трогаем: её смена
/// оборвала бы входящие соединения, в том числе туннель VPN.
// Объявляем функцию apply_plan.
pub fn apply_plan(interface: &str, previous_policy: &str) -> Vec<Vec<String>> {
    // Объявляем переменную plan.
    let mut plan: Vec<Vec<String>> = remove_all_arguments();
    // Выполняем операцию: plan.push(allow_vpn_arguments(interface));.
    plan.push(allow_vpn_arguments(interface));
    // Выполняем операцию: plan.push(allow_lan_arguments());.
    plan.push(allow_lan_arguments());
    // Выполняем операцию: plan.push(allow_dns_arguments());.
    plan.push(allow_dns_arguments());

    // Объявляем переменную (inbound, _) .
    let (inbound, _) = split_policy(previous_policy);
    // Выполняем операцию: plan.push(set_default_outbound_arguments(&policy_pair(.
    plan.push(set_default_outbound_arguments(&policy_pair(
        // Выполняем операцию: &inbound,.
        &inbound,
        // Выполняем операцию: DEFAULT_OUTBOUND_BLOCK,.
        DEFAULT_OUTBOUND_BLOCK,
        // Закрываем выражение или коллекцию.
    )));

    // Выполняем операцию: plan.
    plan
    // Закрываем блок.
}

// Объявляем функцию restore_plan.
pub fn restore_plan(previous_policy: &str) -> Vec<Vec<String>> {
    // Объявляем переменную plan.
    let mut plan: Vec<Vec<String>> = remove_all_arguments();
    // Выполняем операцию: plan.push(set_default_outbound_arguments(previous_polic.
    plan.push(set_default_outbound_arguments(previous_policy));

    // Выполняем операцию: plan.
    plan
    // Закрываем блок.
}

// Объявляем функцию policy_file_path.
pub fn policy_file_path(dir: &Path) -> PathBuf {
    // Выполняем операцию: dir.join(POLICY_FILE).
    dir.join(POLICY_FILE)
    // Закрываем блок.
}

/// Разбирает вывод PowerShell вида `INBOUND=Allow,Block` и
/// `OUTBOUND=Allow`, а также старый формат netsh
/// (`DefaultOutboundAction : Block`). Возвращает пару политик.
// Объявляем функцию parse_policy.
pub fn parse_policy(output: &str) -> Option<String> {
    // Объявляем переменную inbound.
    let mut inbound: Option<String> = None;
    // Объявляем переменную outbound.
    let mut outbound: Option<String> = None;

    // Перебираем элементы коллекции.
    for line in output.lines() {
        // Объявляем переменную trimmed .
        let trimmed = line.trim();

        // Проверяем условие: trimmed.is_empty() {.
        if trimmed.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную lowered .
        let lowered = trimmed.to_ascii_lowercase();

        // Проверяем условие: let Some(value) = lowered.strip_prefix("inbound=").
        if let Some(value) = lowered.strip_prefix("inbound=") {
            // Выполняем операцию: inbound = strictest_policy(value, inbound.as_deref(), t.
            inbound = strictest_policy(value, inbound.as_deref(), true).or(inbound);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(value) = lowered.strip_prefix("outbound=".
        if let Some(value) = lowered.strip_prefix("outbound=") {
            // Выполняем операцию: outbound = strictest_policy(value, outbound.as_deref(),.
            outbound = strictest_policy(value, outbound.as_deref(), false).or(outbound);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: lowered.contains("defaultoutboundaction") {.
        if lowered.contains("defaultoutboundaction") {
            // Выполняем операцию: outbound = trimmed.
            outbound = trimmed
                // Выполняем операцию: .split_whitespace().
                .split_whitespace()
                // Выполняем операцию: .last().
                .last()
                // Выполняем операцию: .and_then(|value| policy_word(value, false)).
                .and_then(|value| policy_word(value, false))
                // Выполняем операцию: .or(outbound);.
                .or(outbound);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: lowered.contains("defaultinboundaction") {.
        if lowered.contains("defaultinboundaction") {
            // Выполняем операцию: inbound = trimmed.
            inbound = trimmed
                // Выполняем операцию: .split_whitespace().
                .split_whitespace()
                // Выполняем операцию: .last().
                .last()
                // Выполняем операцию: .and_then(|value| policy_word(value, true)).
                .and_then(|value| policy_word(value, true))
                // Выполняем операцию: .or(inbound);.
                .or(inbound);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: is_policy_word(&lowered) {.
        if is_policy_word(&lowered) {
            // Старый формат: по одному значению на профиль. Считаем
            // строгим, если хотя бы один профиль блокирует.
            // Выполняем операцию: outbound = strictest_policy(&lowered, outbound.as_deref.
            outbound = strictest_policy(&lowered, outbound.as_deref(), false).or(outbound);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную outbound .
    let outbound = outbound?;

    // Объявляем переменную inbound .
    let inbound = inbound.unwrap_or_else(|| DEFAULT_INBOUND_ALLOW.to_string());

    // Выполняем операцию: Some(policy_pair(&inbound, &outbound)).
    Some(policy_pair(&inbound, &outbound))
    // Закрываем блок.
}

/// «NotConfigured» означает «действует значение по умолчанию»,
/// а оно — разрешать. Неизвестное значение не угадываем.
// Объявляем функцию policy_word.
fn policy_word(value: &str, inbound: bool) -> Option<String> {
    // Объявляем переменную blocked .
    let blocked = if inbound {
        // Выполняем операцию: DEFAULT_INBOUND_BLOCK.
        DEFAULT_INBOUND_BLOCK
    // Закрываем блок.
    } else {
        // Выполняем операцию: DEFAULT_OUTBOUND_BLOCK.
        DEFAULT_OUTBOUND_BLOCK
        // Закрываем блок.
    };
    // Объявляем переменную allowed .
    let allowed = if inbound {
        // Выполняем операцию: DEFAULT_INBOUND_ALLOW.
        DEFAULT_INBOUND_ALLOW
    // Закрываем блок.
    } else {
        // Выполняем операцию: DEFAULT_OUTBOUND_ALLOW.
        DEFAULT_OUTBOUND_ALLOW
        // Закрываем блок.
    };

    // Выбираем вариант по значению.
    match value.trim().to_ascii_lowercase().as_str() {
        // Выполняем операцию: "block" => Some(blocked.to_string()),.
        "block" => Some(blocked.to_string()),
        // Выполняем операцию: "allow" | "notconfigured" => Some(allowed.to_string()),.
        "allow" | "notconfigured" => Some(allowed.to_string()),
        // Выполняем операцию: _ => None,.
        _ => None,
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Из списка значений по профилям берём самое строгое: блокировка
/// хоть в одном профиле означает, что трафик пойдёт не везде.
// Объявляем функцию strictest_policy.
fn strictest_policy(values: &str, current: Option<&str>, inbound: bool) -> Option<String> {
    // Объявляем переменную blocked .
    let blocked = if inbound {
        // Выполняем операцию: DEFAULT_INBOUND_BLOCK.
        DEFAULT_INBOUND_BLOCK
    // Закрываем блок.
    } else {
        // Выполняем операцию: DEFAULT_OUTBOUND_BLOCK.
        DEFAULT_OUTBOUND_BLOCK
        // Закрываем блок.
    };

    // Объявляем переменную result .
    let mut result = current.map(|value| value.to_string());

    // Перебираем элементы коллекции.
    for part in values.split(',') {
        // Объявляем переменную Some(word) .
        let Some(word) = policy_word(part, inbound) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Выполняем операцию: result = Some(match result {.
        result = Some(match result {
            // Выполняем операцию: Some(ref current) if current == blocked => current.clon.
            Some(ref current) if current == blocked => current.clone(),
            // Выполняем операцию: _ => word,.
            _ => word,
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию is_policy_word.
fn is_policy_word(lowered: &str) -> bool {
    // Выполняем операцию: matches!(lowered, "allow" | "block" | "notconfigured").
    matches!(lowered, "allow" | "block" | "notconfigured")
    // Закрываем блок.
}

/// Блокирует ли политика исходящий трафик.
// Объявляем функцию policy_is_blocked.
pub fn policy_is_blocked(policy: &str) -> bool {
    // Объявляем переменную (_, outbound) .
    let (_, outbound) = split_policy(policy);

    // Выполняем операцию: outbound.eq_ignore_ascii_case(DEFAULT_OUTBOUND_BLOCK).
    outbound.eq_ignore_ascii_case(DEFAULT_OUTBOUND_BLOCK)
    // Закрываем блок.
}

// Объявляем функцию command_line.
pub fn command_line(args: &[String]) -> String {
    // Выполняем операцию: args.iter().
    args.iter()
        // Выполняем операцию: .map(|arg| {.
        .map(|arg| {
            // Проверяем условие: arg.contains(' ') {.
            if arg.contains(' ') {
                // Выполняем операцию: format!("\"{arg}\"").
                format!("\"{arg}\"")
            // Закрываем блок.
            } else {
                // Выполняем операцию: arg.clone().
                arg.clone()
                // Закрываем блок.
            }
            // Закрываем блок.
        })
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join(" ").
        .join(" ")
    // Закрываем блок.
}

// Объявляем функцию run_elevated.
async fn run_elevated(args: &[String]) -> AppResult<()> {
    // Объявляем переменную arguments .
    let arguments = command_line(args);
    // Объявляем переменную program .
    let program = "netsh.exe".to_string();

    // Объявляем переменную (handle, _pid) .
    let (handle, _pid) =
        // Выполняем операцию: tokio::task::spawn_blocking(move || shell_execute_runas.
        tokio::task::spawn_blocking(move || shell_execute_runas(&program, &arguments, None))
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))??.
            .map_err(|error| AppError::custom(error.to_string()))??;

    // Объявляем переменную code .
    let code = tokio::task::spawn_blocking(move || handle.wait_for_exit(ELEVATE_TIMEOUT_MS))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))??.
        .map_err(|error| AppError::custom(error.to_string()))??;

    // Проверяем условие: code != 0 {.
    if code != 0 {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "netsh завершился с кодом {code}: {}",.
            "netsh завершился с кодом {code}: {}",
            // Выполняем операцию: args.join(" ").
            args.join(" ") // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем константу POLICY_QUERY_SCRIPT.
pub const POLICY_QUERY_SCRIPT: &str = "$i = (Get-NetFirewallProfile | Select-Object -ExpandProperty DefaultInboundAction) -join ','; $o = (Get-NetFirewallProfile | Select-Object -ExpandProperty DefaultOutboundAction) -join ','; Write-Output \"INBOUND=$i\"; Write-Output \"OUTBOUND=$o\"";

// Объявляем функцию query_default_outbound.
async fn query_default_outbound() -> AppResult<String> {
    // Объявляем переменную output .
    let output = tokio::process::Command::new("powershell.exe")
        // Выполняем операцию: .args([.
        .args([
            // Выполняем операцию: "-NoProfile",.
            "-NoProfile",
            // Выполняем операцию: "-NonInteractive",.
            "-NonInteractive",
            // Выполняем операцию: "-Command",.
            "-Command",
            // Выполняем операцию: POLICY_QUERY_SCRIPT,.
            POLICY_QUERY_SCRIPT,
            // Выполняем операцию: ]).
        ])
        // Выполняем операцию: .hidden().
        .hidden()
        // Выполняем операцию: .output().
        .output()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| {.
        .map_err(|error| {
            // Выполняем операцию: AppError::custom(format!("Не удалось прочитать политику.
            AppError::custom(format!("Не удалось прочитать политику firewall: {error}"))
            // Закрываем блок.
        })?;

    // Объявляем переменную text .
    let text = String::from_utf8_lossy(&output.stdout).to_string();

    // Выбираем вариант по значению.
    match parse_policy(&text) {
        // Выполняем операцию: Some(policy) => Ok(policy),.
        Some(policy) => Ok(policy),
        // Выполняем операцию: None => {.
        None => {
            // Выполняем операцию: tracing::warn!("DefaultOutboundAction не прочитан, счит.
            tracing::warn!("DefaultOutboundAction не прочитан, считаю allowoutbound");
            // Выполняем операцию: Ok(policy_pair(DEFAULT_INBOUND_ALLOW, DEFAULT_OUTBOUND_.
            Ok(policy_pair(DEFAULT_INBOUND_ALLOW, DEFAULT_OUTBOUND_ALLOW))
            // Закрываем блок.
        } // Закрываем блок.
    }
    // Закрываем блок.
}

/// Политика, которую сохранило приложение при включении Kill Switch.
// Объявляем функцию read_saved_policy.
pub fn read_saved_policy(dir: &Path) -> Option<String> {
    // Объявляем переменную text .
    let text = std::fs::read_to_string(policy_file_path(dir)).ok()?;
    // Объявляем переменную trimmed .
    let trimmed = text.trim();

    // Проверяем условие: trimmed.is_empty() {.
    if trimmed.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(trimmed.to_string()).
    Some(trimmed.to_string())
    // Закрываем блок.
}

// Объявляем функцию save_policy.
pub fn save_policy(dir: &Path, policy: &str) -> AppResult<()> {
    // Выполняем операцию: std::fs::write(policy_file_path(dir), policy)?;.
    std::fs::write(policy_file_path(dir), policy)?;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию clear_policy.
pub fn clear_policy(dir: &Path) -> AppResult<()> {
    // Объявляем переменную path .
    let path = policy_file_path(dir);

    // Проверяем условие: path.exists() {.
    if path.exists() {
        // Выполняем операцию: std::fs::remove_file(path)?;.
        std::fs::remove_file(path)?;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Выполняем операцию: pub async fn apply(interface: &str, state_dir: &Path) -.
pub async fn apply(interface: &str, state_dir: &Path) -> AppResult<()> {
    // Объявляем переменную previous .
    let previous = match read_saved_policy(state_dir) {
        // Выполняем операцию: Some(saved) => saved,.
        Some(saved) => saved,
        // Выполняем операцию: None => query_default_outbound().await?,.
        None => query_default_outbound().await?,
        // Закрываем блок.
    };

    // Проверяем условие: policy_is_blocked(&previous) {.
    if policy_is_blocked(&previous) {
        // Выполняем операцию: tracing::warn!("Kill Switch уже активен, предыдущая пол.
        tracing::warn!("Kill Switch уже активен, предыдущая политика: {previous}");
        // Закрываем блок.
    }

    // Выполняем операцию: save_policy(state_dir, &previous)?;.
    save_policy(state_dir, &previous)?;

    // Перебираем элементы коллекции.
    for args in apply_plan(interface, &previous) {
        // Выполняем операцию: run_elevated(&args).await?;.
        run_elevated(&args).await?;
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Kill Switch включён на интерфейсе {inte.
    tracing::info!("Kill Switch включён на интерфейсе {interface}");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Выполняем операцию: pub async fn disable(state_dir: &Path) -> AppResult<()>.
pub async fn disable(state_dir: &Path) -> AppResult<()> {
    // Без сохранённой политики восстанавливать нечего: текущее
    // состояние — это и есть заблокированное. Возвращаем разрешение,
    // иначе пользователь остался бы без интернета навсегда.
    // Объявляем переменную previous .
    let previous = read_saved_policy(state_dir)
        // Выполняем операцию: .unwrap_or_else(|| policy_pair(DEFAULT_INBOUND_ALLOW, D.
        .unwrap_or_else(|| policy_pair(DEFAULT_INBOUND_ALLOW, DEFAULT_OUTBOUND_ALLOW));

    // Перебираем элементы коллекции.
    for args in restore_plan(&previous) {
        // Выполняем операцию: run_elevated(&args).await?;.
        run_elevated(&args).await?;
        // Закрываем блок.
    }

    // Выполняем операцию: clear_policy(state_dir)?;.
    clear_policy(state_dir)?;
    // Выполняем операцию: tracing::info!("Kill Switch выключен, политика восстано.
    tracing::info!("Kill Switch выключен, политика восстановлена: {previous}");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_killswitch_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
