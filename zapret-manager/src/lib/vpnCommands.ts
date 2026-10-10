import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
import { VpnConfigInfoSchema, VpnStatusSchema } from "@/types/ipcSchemas";
import type {
  SubscriptionServer,
  VpnConfigInfo,
  VpnStats,
  VpnStatus,
  XrayStatus,
} from "@/types";

export async function isWireguardInstalled(): Promise<boolean> {
  return secureInvoke<boolean>("is_wireguard_installed");
}

export async function listConfigs(): Promise<VpnConfigInfo[]> {
  return await secureInvokeValidated(
    "list_vpn_configs",
    VpnConfigInfoSchema.array()
  );
}

export async function removeConfig(id: string): Promise<boolean> {
  return secureInvoke<boolean>("delete_vpn_config", { id });
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

export interface VpnSourceResult {
  subscriptionUrl: string | null;
  servers: SubscriptionServer[];
}

export async function importVpnSource(text: string): Promise<VpnSourceResult> {
  return secureInvoke<VpnSourceResult>("import_vpn_source", { text });
}

export async function installVpnCore(): Promise<boolean> {
  return secureInvoke<boolean>("install_vpn_core");
}

export async function fetchVpnCoreStatus(): Promise<XrayStatus> {
  return secureInvoke<XrayStatus>("vpn_core_status");
}

export async function connectVpnServer(
  link: string,
  name: string
): Promise<XrayStatus> {
  return secureInvoke<XrayStatus>("connect_vpn_server", { link, name });
}

export async function disconnectVpnServer(): Promise<XrayStatus> {
  return secureInvoke<XrayStatus>("disconnect_vpn_server");
}

export interface EndpointInput {
  host: string;
  port: number;
}

export interface EndpointPing {
  endpoint: string;
  latencyMs: number | null;
  success: boolean;
}

export async function pingEndpoints(
  endpoints: EndpointInput[]
): Promise<EndpointPing[]> {
  return secureInvoke<EndpointPing[]>("ping_endpoints", { endpoints });
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
