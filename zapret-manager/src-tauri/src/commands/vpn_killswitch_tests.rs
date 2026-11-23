// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::vpn_wireguard::{candidate_dirs, INSTAL.
use crate::commands::vpn_wireguard::{candidate_dirs, INSTALL_DIR};

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_candidate_dirs_cover_local_and_program_files.
fn test_candidate_dirs_cover_local_and_program_files() {
    // Объявляем переменную dirs .
    let dirs = candidate_dirs();
    // Объявляем переменную has_local .
    let has_local = dirs
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|path| path == std::path::Path::new(INSTALL_DIR));.
        .any(|path| path == std::path::Path::new(INSTALL_DIR));

    // Выполняем операцию: assert!(has_local);.
    assert!(has_local);
    // Выполняем операцию: assert!(dirs.len() >= 2);.
    assert!(dirs.len() >= 2);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_policy_query_script_avoids_pipeline_variable.
fn test_policy_query_script_avoids_pipeline_variable() {
    // Выполняем операцию: assert!(!POLICY_QUERY_SCRIPT.contains("$_"));.
    assert!(!POLICY_QUERY_SCRIPT.contains("$_"));
    // Выполняем операцию: assert!(POLICY_QUERY_SCRIPT.contains("DefaultOutboundAc.
    assert!(POLICY_QUERY_SCRIPT.contains("DefaultOutboundAction"));
    // Выполняем операцию: assert!(POLICY_QUERY_SCRIPT.contains("DefaultInboundAct.
    assert!(POLICY_QUERY_SCRIPT.contains("DefaultInboundAction"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_allow_vpn_rule_scoped_to_interface.
fn test_allow_vpn_rule_scoped_to_interface() {
    // Объявляем переменную args .
    let args = allow_vpn_arguments("nl");

    // Выполняем операцию: assert!(args.contains(&"action=allow".to_string()));.
    assert!(args.contains(&"action=allow".to_string()));
    // Выполняем операцию: assert!(args.contains(&"interface=nl".to_string()));.
    assert!(args.contains(&"interface=nl".to_string()));
    // Выполняем операцию: assert!(!args.contains(&"action=block".to_string()));.
    assert!(!args.contains(&"action=block".to_string()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_allow_lan_rule_uses_private_ranges.
fn test_allow_lan_rule_uses_private_ranges() {
    // Объявляем переменную args .
    let args = allow_lan_arguments();
    // Объявляем переменную joined .
    let joined = args.join(" ");

    // Перебираем элементы коллекции.
    for range in LAN_RANGES {
        // Выполняем операцию: assert!(joined.contains(range));.
        assert!(joined.contains(range));
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_allow_dns_rule_is_udp_53.
fn test_allow_dns_rule_is_udp_53() {
    // Объявляем переменную args .
    let args = allow_dns_arguments();

    // Выполняем операцию: assert!(args.contains(&"protocol=UDP".to_string()));.
    assert!(args.contains(&"protocol=UDP".to_string()));
    // Выполняем операцию: assert!(args.contains(&"remoteport=53".to_string()));.
    assert!(args.contains(&"remoteport=53".to_string()));
    // Закрываем блок.
}

/// Kill Switch обязан оставить исходящий трафик заблокированным:
/// прежняя политика не должна перезаписывать блокировку.
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_apply_plan_ends_with_blocked_outbound.
fn test_apply_plan_ends_with_blocked_outbound() {
    // Объявляем переменную plan .
    let plan = apply_plan("nl", DEFAULT_OUTBOUND_ALLOW);
    // Объявляем переменную last .
    let last = plan.last().cloned().unwrap_or_default();
    // Объявляем переменную joined .
    let joined = last.join(" ");

    // Выполняем операцию: assert!(joined.contains(DEFAULT_OUTBOUND_BLOCK), "{join.
    assert!(joined.contains(DEFAULT_OUTBOUND_BLOCK), "{joined}");
    // Выполняем операцию: assert!(!joined.contains(DEFAULT_OUTBOUND_ALLOW), "{joi.
    assert!(!joined.contains(DEFAULT_OUTBOUND_ALLOW), "{joined}");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_apply_plan_never_restores_previous_outbound.
fn test_apply_plan_never_restores_previous_outbound() {
    // Объявляем переменную plan .
    let plan = apply_plan(
        // Выполняем операцию: "nl",.
        "nl",
        // Выполняем операцию: &policy_pair(DEFAULT_INBOUND_ALLOW, DEFAULT_OUTBOUND_AL.
        &policy_pair(DEFAULT_INBOUND_ALLOW, DEFAULT_OUTBOUND_ALLOW),
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную joined .
    let joined = plan
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|args| args.join(" ")).
        .map(|args| args.join(" "))
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join("|");.
        .join("|");

    // Выполняем операцию: assert!(!joined.contains(DEFAULT_OUTBOUND_ALLOW), "{joi.
    assert!(!joined.contains(DEFAULT_OUTBOUND_ALLOW), "{joined}");
    // Закрываем блок.
}

/// Входящую политику менять нельзя: иначе пропадёт входящий
/// трафик, в том числе ответы VPN-сервера.
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_apply_plan_preserves_inbound_policy.
fn test_apply_plan_preserves_inbound_policy() {
    // Объявляем переменную plan .
    let plan = apply_plan(
        // Выполняем операцию: "nl",.
        "nl",
        // Выполняем операцию: &policy_pair(DEFAULT_INBOUND_BLOCK, DEFAULT_OUTBOUND_AL.
        &policy_pair(DEFAULT_INBOUND_BLOCK, DEFAULT_OUTBOUND_ALLOW),
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную last .
    let last = plan.last().cloned().unwrap_or_default();
    // Объявляем переменную joined .
    let joined = last.join(" ");

    // Выполняем операцию: assert!(joined.contains(DEFAULT_INBOUND_BLOCK), "{joine.
    assert!(joined.contains(DEFAULT_INBOUND_BLOCK), "{joined}");
    // Выполняем операцию: assert!(joined.contains(DEFAULT_OUTBOUND_BLOCK), "{join.
    assert!(joined.contains(DEFAULT_OUTBOUND_BLOCK), "{joined}");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_apply_plan_removes_stale_rules_first.
fn test_apply_plan_removes_stale_rules_first() {
    // Объявляем переменную plan .
    let plan = apply_plan("nl", DEFAULT_OUTBOUND_ALLOW);
    // Объявляем переменную first .
    let first = plan.first().cloned().unwrap_or_default();

    // Выполняем операцию: assert!(first.contains(&"delete".to_string()));.
    assert!(first.contains(&"delete".to_string()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_apply_plan_allows_vpn_lan_and_dns.
fn test_apply_plan_allows_vpn_lan_and_dns() {
    // Объявляем переменную plan .
    let plan = apply_plan("nl", DEFAULT_OUTBOUND_ALLOW);
    // Объявляем переменную joined .
    let joined = plan
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|args| args.join(" ")).
        .map(|args| args.join(" "))
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join("|");.
        .join("|");

    // Выполняем операцию: assert!(joined.contains(RULE_ALLOW_VPN));.
    assert!(joined.contains(RULE_ALLOW_VPN));
    // Выполняем операцию: assert!(joined.contains(RULE_ALLOW_LAN));.
    assert!(joined.contains(RULE_ALLOW_LAN));
    // Выполняем операцию: assert!(joined.contains(RULE_ALLOW_DNS));.
    assert!(joined.contains(RULE_ALLOW_DNS));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_restore_plan_restores_previous_policy.
fn test_restore_plan_restores_previous_policy() {
    // Объявляем переменную plan .
    let plan = restore_plan(&policy_pair(DEFAULT_INBOUND_ALLOW, DEFAULT_OUTBOUND_ALLOW));
    // Объявляем переменную last .
    let last = plan.last().cloned().unwrap_or_default();
    // Объявляем переменную joined .
    let joined = last.join(" ");

    // Выполняем операцию: assert!(joined.contains(DEFAULT_OUTBOUND_ALLOW), "{join.
    assert!(joined.contains(DEFAULT_OUTBOUND_ALLOW), "{joined}");
    // Выполняем операцию: assert_eq!(plan.len(), 4);.
    assert_eq!(plan.len(), 4);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_all_covers_every_allow_rule.
fn test_remove_all_covers_every_allow_rule() {
    // Объявляем переменную plan .
    let plan = remove_all_arguments();
    // Объявляем переменную joined .
    let joined = plan
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|args| args.join(" ")).
        .map(|args| args.join(" "))
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join("|");.
        .join("|");

    // Выполняем операцию: assert!(joined.contains(RULE_ALLOW_VPN));.
    assert!(joined.contains(RULE_ALLOW_VPN));
    // Выполняем операцию: assert!(joined.contains(RULE_ALLOW_LAN));.
    assert!(joined.contains(RULE_ALLOW_LAN));
    // Выполняем операцию: assert!(joined.contains(RULE_ALLOW_DNS));.
    assert!(joined.contains(RULE_ALLOW_DNS));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_policy_detects_block.
fn test_parse_policy_detects_block() {
    // Объявляем переменную output .
    let output = "Settings for Windows Firewall:\r\n    DefaultOutboundAction : Block\r\n";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_policy(output).as_deref(),.
        parse_policy(output).as_deref(),
        // Выполняем операцию: Some("allowinbound,blockoutbound").
        Some("allowinbound,blockoutbound") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_policy_detects_allow.
fn test_parse_policy_detects_allow() {
    // Объявляем переменную output .
    let output = "    DefaultOutboundAction    : Allow\n";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_policy(output).as_deref(),.
        parse_policy(output).as_deref(),
        // Выполняем операцию: Some("allowinbound,allowoutbound").
        Some("allowinbound,allowoutbound") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_policy_reads_powershell_output.
fn test_parse_policy_reads_powershell_output() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_policy("NotConfigured\r\nAllow\r\nAllow\r\n").as_.
        parse_policy("NotConfigured\r\nAllow\r\nAllow\r\n").as_deref(),
        // Выполняем операцию: Some("allowinbound,allowoutbound").
        Some("allowinbound,allowoutbound") // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_policy("NotConfigured\nNotConfigured\nNotConfigur.
        parse_policy("NotConfigured\nNotConfigured\nNotConfigured\n").as_deref(),
        // Выполняем операцию: Some("allowinbound,allowoutbound").
        Some("allowinbound,allowoutbound") // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_policy("Block\nBlock\nBlock\n").as_deref(),.
        parse_policy("Block\nBlock\nBlock\n").as_deref(),
        // Выполняем операцию: Some("allowinbound,blockoutbound").
        Some("allowinbound,blockoutbound") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_policy_reads_labelled_output.
fn test_parse_policy_reads_labelled_output() {
    // Объявляем переменную output .
    let output = "INBOUND=Allow,Allow\nOUTBOUND=Allow,Block\n";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_policy(output).as_deref(),.
        parse_policy(output).as_deref(),
        // Выполняем операцию: Some("allowinbound,blockoutbound").
        Some("allowinbound,blockoutbound") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_policy_takes_strictest_inbound.
fn test_parse_policy_takes_strictest_inbound() {
    // Объявляем переменную output .
    let output = "INBOUND=Allow,Block\nOUTBOUND=Allow\n";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_policy(output).as_deref(),.
        parse_policy(output).as_deref(),
        // Выполняем операцию: Some("blockinbound,allowoutbound").
        Some("blockinbound,allowoutbound") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_policy_returns_none_on_unknown_layout.
fn test_parse_policy_returns_none_on_unknown_layout() {
    // Выполняем операцию: assert_eq!(parse_policy("пусто"), None);.
    assert_eq!(parse_policy("пусто"), None);
    // Выполняем операцию: assert_eq!(parse_policy("DefaultOutboundAction : ????").
    assert_eq!(parse_policy("DefaultOutboundAction : ????"), None);
    // Выполняем операцию: assert_eq!(parse_policy("Get-NetFirewallProfile | Write.
    assert_eq!(parse_policy("Get-NetFirewallProfile | Write-Error"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_policy_is_blocked_only_for_block.
fn test_policy_is_blocked_only_for_block() {
    // Выполняем операцию: assert!(policy_is_blocked(DEFAULT_OUTBOUND_BLOCK));.
    assert!(policy_is_blocked(DEFAULT_OUTBOUND_BLOCK));
    // Выполняем операцию: assert!(!policy_is_blocked(DEFAULT_OUTBOUND_ALLOW));.
    assert!(!policy_is_blocked(DEFAULT_OUTBOUND_ALLOW));
    // Выполняем операцию: assert!(policy_is_blocked(&policy_pair(.
    assert!(policy_is_blocked(&policy_pair(
        // Выполняем операцию: DEFAULT_INBOUND_ALLOW,.
        DEFAULT_INBOUND_ALLOW,
        // Выполняем операцию: DEFAULT_OUTBOUND_BLOCK.
        DEFAULT_OUTBOUND_BLOCK // Закрываем выражение или коллекцию.
    )));
    // Выполняем операцию: assert!(!policy_is_blocked(&policy_pair(.
    assert!(!policy_is_blocked(&policy_pair(
        // Выполняем операцию: DEFAULT_INBOUND_BLOCK,.
        DEFAULT_INBOUND_BLOCK,
        // Выполняем операцию: DEFAULT_OUTBOUND_ALLOW.
        DEFAULT_OUTBOUND_ALLOW // Закрываем выражение или коллекцию.
    )));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_split_policy_handles_legacy_single_value.
fn test_split_policy_handles_legacy_single_value() {
    // Объявляем переменную (inbound, outbound) .
    let (inbound, outbound) = split_policy(DEFAULT_OUTBOUND_ALLOW);

    // Выполняем операцию: assert_eq!(inbound, DEFAULT_INBOUND_ALLOW);.
    assert_eq!(inbound, DEFAULT_INBOUND_ALLOW);
    // Выполняем операцию: assert_eq!(outbound, DEFAULT_OUTBOUND_ALLOW);.
    assert_eq!(outbound, DEFAULT_OUTBOUND_ALLOW);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_command_line_quotes_spaces.
fn test_command_line_quotes_spaces() {
    // Объявляем переменную args .
    let args = vec!["advfirewall".to_string(), "name=My Rule".to_string()];
    // Объявляем переменную line .
    let line = command_line(&args);

    // Выполняем операцию: assert!(line.contains("\"name=My Rule\""));.
    assert!(line.contains("\"name=My Rule\""));
    // Выполняем операцию: assert!(line.starts_with("advfirewall "));.
    assert!(line.starts_with("advfirewall "));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_command_line_without_spaces_is_untouched.
fn test_command_line_without_spaces_is_untouched() {
    // Объявляем переменную args .
    let args = vec!["netsh".to_string(), "advfirewall".to_string()];

    // Выполняем операцию: assert_eq!(command_line(&args), "netsh advfirewall");.
    assert_eq!(command_line(&args), "netsh advfirewall");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_policy_file_roundtrip.
fn test_policy_file_roundtrip() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-killswitch-policy");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Выполняем операцию: save_policy(&dir, DEFAULT_OUTBOUND_ALLOW).unwrap();.
    save_policy(&dir, DEFAULT_OUTBOUND_ALLOW).unwrap();
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: std::fs::read_to_string(policy_file_path(&dir)).unwrap(.
        std::fs::read_to_string(policy_file_path(&dir)).unwrap(),
        // Выполняем операцию: "allowoutbound".
        "allowoutbound" // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: clear_policy(&dir).unwrap();.
    clear_policy(&dir).unwrap();
    // Выполняем операцию: assert!(!policy_file_path(&dir).exists());.
    assert!(!policy_file_path(&dir).exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_saved_policy_returns_none_without_file.
fn test_read_saved_policy_returns_none_without_file() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-killswitch-missing");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Выполняем операцию: assert_eq!(read_saved_policy(&dir), None);.
    assert_eq!(read_saved_policy(&dir), None);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_rule_names_are_prefixed.
fn test_rule_names_are_prefixed() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: rule_name(RULE_ALLOW_VPN),.
        rule_name(RULE_ALLOW_VPN),
        // Выполняем операцию: "ZapretManager KillSwitch AllowVPN".
        "ZapretManager KillSwitch AllowVPN" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}
