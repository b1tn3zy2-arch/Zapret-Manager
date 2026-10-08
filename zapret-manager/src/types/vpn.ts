export type VpnProvider = "amnezia" | "wireguard" | "openvpn";

export type VpnState =
  "disconnected" | "connecting" | "connected" | "disconnecting" | "error";

export type SwitchStep =
  | "stopping-dpi"
  | "starting-vpn"
  | "checking-handshake"
  | "stopping-vpn"
  | "done";

export interface VpnConfigInfo {
  id: string;
  name: string;
  path: string;
  endpoint: string;
  address: string[];
  dns: string[];
  allowedIps: string[];
  size: number;
  importedAt: number;
}

export interface VpnStatus {
  state: VpnState;
  interface: string | null;
  endpoint: string | null;
  handshakeAt: number | null;
  bytesIn: number | null;
  bytesOut: number | null;
  uptimeSec: number | null;
  error: string | null;
}

export interface VpnStats {
  interface: string | null;
  endpoint: string | null;
  handshakeAt: number | null;
  bytesIn: number;
  bytesOut: number;
  uptimeSec: number;
  isSwitching: boolean;
  killSwitchOn: boolean;
}
