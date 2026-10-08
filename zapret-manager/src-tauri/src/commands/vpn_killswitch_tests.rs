use super::*;
use crate::commands::vpn_wireguard::{INSTALL_DIR, candidate_dirs};

#[test]
fn test_candidate_dirs_cover_local_and_program_files() {
    let dirs = candidate_dirs();
    let has_local = dirs.iter().any(|path| path == std::path::Path::new(INSTALL_DIR));

    assert!(has_local);
    assert!(dirs.len() >= 2);
}

#[test]
fn test_policy_query_script_avoids_pipeline_variable() {
    assert!(!POLICY_QUERY_SCRIPT.contains("$_"));
    assert!(POLICY_QUERY_SCRIPT.contains("DefaultOutboundAction"));
}

#[test]
fn test_allow_vpn_rule_scoped_to_interface() {
    let args = allow_vpn_arguments("nl");

    assert!(args.contains(&"action=allow".to_string()));
    assert!(args.contains(&"interface=nl".to_string()));
    assert!(!args.contains(&"action=block".to_string()));
}

#[test]
fn test_allow_lan_rule_uses_private_ranges() {
    let args = allow_lan_arguments();
    let joined = args.join(" ");

    for range in LAN_RANGES {
        assert!(joined.contains(range));
    }
}

#[test]
fn test_allow_dns_rule_is_udp_53() {
    let args = allow_dns_arguments();

    assert!(args.contains(&"protocol=UDP".to_string()));
    assert!(args.contains(&"remoteport=53".to_string()));
}

#[test]
fn test_apply_plan_blocks_outbound_last() {
    let plan = apply_plan("nl", DEFAULT_OUTBOUND_ALLOW);
    let last = plan.last().cloned().unwrap_or_default();

    assert!(last.contains(&"blockinbound,allowoutbound".to_string()));
    assert!(
        plan.iter()
            .any(|args| args.contains(&"blockinbound,blockoutbound".to_string()))
    );
}

#[test]
fn test_apply_plan_removes_stale_rules_first() {
    let plan = apply_plan("nl", DEFAULT_OUTBOUND_ALLOW);
    let first = plan.first().cloned().unwrap_or_default();

    assert!(first.contains(&"delete".to_string()));
}

#[test]
fn test_restore_plan_restores_previous_policy() {
    let plan = restore_plan(DEFAULT_OUTBOUND_BLOCK);
    let last = plan.last().cloned().unwrap_or_default();

    assert!(last.contains(&"blockinbound,blockoutbound".to_string()));
    assert_eq!(plan.len(), 4);
}

#[test]
fn test_remove_all_covers_every_allow_rule() {
    let plan = remove_all_arguments();
    let joined = plan
        .iter()
        .map(|args| args.join(" "))
        .collect::<Vec<String>>()
        .join("|");

    assert!(joined.contains(RULE_ALLOW_VPN));
    assert!(joined.contains(RULE_ALLOW_LAN));
    assert!(joined.contains(RULE_ALLOW_DNS));
}

#[test]
fn test_parse_policy_detects_block() {
    let output = "Settings for Windows Firewall:\r\n    DefaultOutboundAction : Block\r\n";

    assert_eq!(parse_policy(output).as_deref(), Some("blockoutbound"));
}

#[test]
fn test_parse_policy_detects_allow() {
    let output = "    DefaultOutboundAction    : Allow\n";

    assert_eq!(parse_policy(output).as_deref(), Some("allowoutbound"));
}

#[test]
fn test_parse_policy_reads_powershell_output() {
    assert_eq!(
        parse_policy("NotConfigured\r\nAllow\r\nAllow\r\n").as_deref(),
        Some("allowoutbound")
    );
    assert_eq!(
        parse_policy("NotConfigured\nNotConfigured\nNotConfigured\n").as_deref(),
        Some("allowoutbound")
    );
    assert_eq!(
        parse_policy("Block\nBlock\nBlock\n").as_deref(),
        Some("blockoutbound")
    );
}

#[test]
fn test_parse_policy_returns_none_on_unknown_layout() {
    assert_eq!(parse_policy("пусто"), None);
    assert_eq!(parse_policy("DefaultOutboundAction : ????"), None);
    assert_eq!(parse_policy("Get-NetFirewallProfile | Write-Error"), None);
}

#[test]
fn test_policy_is_blocked_only_for_block() {
    assert!(policy_is_blocked(DEFAULT_OUTBOUND_BLOCK));
    assert!(!policy_is_blocked(DEFAULT_OUTBOUND_ALLOW));
}

#[test]
fn test_command_line_quotes_spaces() {
    let args = vec![
        "advfirewall".to_string(),
        "name=My Rule".to_string(),
    ];
    let line = command_line(&args);

    assert!(line.contains("\"name=My Rule\""));
    assert!(line.starts_with("advfirewall "));
}

#[test]
fn test_command_line_without_spaces_is_untouched() {
    let args = vec!["netsh".to_string(), "advfirewall".to_string()];

    assert_eq!(command_line(&args), "netsh advfirewall");
}

#[test]
fn test_policy_file_roundtrip() {
    let dir = std::env::temp_dir().join("zapret-killswitch-policy");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    save_policy(&dir, DEFAULT_OUTBOUND_ALLOW).unwrap();
    assert_eq!(
        std::fs::read_to_string(policy_file_path(&dir)).unwrap(),
        "allowoutbound"
    );

    clear_policy(&dir).unwrap();
    assert!(!policy_file_path(&dir).exists());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_rule_names_are_prefixed() {
    assert_eq!(
        rule_name(RULE_ALLOW_VPN),
        "ZapretManager KillSwitch AllowVPN"
    );
}