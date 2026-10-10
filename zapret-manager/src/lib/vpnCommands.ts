import { open } from "@tauri-apps/plugin-dialog";

import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
import { VpnConfigInfoSchema, VpnStatusSchema } from "@/types/ipcSchemas";
import type { VpnConfigInfo, VpnStats, VpnStatus } from "@/types";

export async function isWireguardInstalled(): Promise<boolean> {
  return secureInvoke<boolean>("is_wireguard_installed");
}

export async function listConfigs(): Promise<VpnConfigInfo[]> {
  return await secureInvokeValidated(
    "list_vpn_configs",
    VpnConfigInfoSchema.array()
  );
}

export async function importConfigFromDialog(): Promise<VpnConfigInfo | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "WireGuard", extensions: ["conf"] }],
  });

  if (typeof selected !== "string" || selected === "") {
    return null;
  }

  return await secureInvokeValidated("import_vpn_config", VpnConfigInfoSchema, {
    sourcePath: selected,
  });
}

export async function removeConfig(id: string): Promise<boolean> {
  return secureInvoke<boolean>("delete_vpn_config", { id });
}

export async function importConfigFromText(
  content: string
): Promise<VpnConfigInfo> {
  return await secureInvokeValidated(
    "import_vpn_config_text",
    VpnConfigInfoSchema,
    { content }
  );
}

export async function fetchStatus(): Promise<VpnStatus> {
  const status = await secureInvokeValidated("get_vpn_status", VpnStatusSchema);

  return { ...status, state: status.state as VpnStatus["state"] };
}

export async function fetchStats(): Promise<VpnStats> {
  return secureInvoke<VpnStats>("get_vpn_stats");
}

export async function reconcileTunnels(): Promise<void> {
  await secureInvoke<number>("reconcile_vpn_tunnels");
}

export interface VpnRunResult {
  pid: number;
  logPath: string;
}

export async function runStrategy(
  strategyId: string,
  path: string
): Promise<VpnRunResult> {
  return secureInvoke<VpnRunResult>("run_strategy", { strategyId, path });
}

export async function connect(
  configId: string,
  enableKillSwitch: boolean,
  handshakeTimeoutSec: number
): Promise<VpnStatus> {
  const status = await secureInvokeValidated("switch_to_vpn", VpnStatusSchema, {
    configId,
    enableKillSwitch,
    handshakeTimeoutSec,
  });

  return { ...status, state: status.state as VpnStatus["state"] };
}

export async function disconnect(): Promise<void> {
  await secureInvoke<null>("disconnect_vpn");
}

export async function switchBackToDpi(): Promise<void> {
  await secureInvoke<null>("switch_to_dpi");
}
