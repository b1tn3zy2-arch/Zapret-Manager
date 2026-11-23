// Обрабатываем конструкцию: export.
export type VpnProvider = "amnezia" | "wireguard" | "openvpn";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type VpnState =
  // Обрабатываем конструкцию: disconnected.
  "disconnected" | "connecting" | "connected" | "disconnecting" | "error";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type SwitchStep =
  // Обрабатываем конструкцию: | stopping-dpi | starting-vpn | checking-handshake | st….
  | "stopping-dpi"
  // Продолжаем выражение.
  | "starting-vpn"
  // Продолжаем выражение.
  | "checking-handshake"
  // Продолжаем выражение.
  | "stopping-vpn"
  // Продолжаем выражение.
  | "done";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnConfigInfo {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: path.
  path: string;
  // Обрабатываем конструкцию: endpoint.
  endpoint: string;
  // Обрабатываем конструкцию: address.
  address: string[];
  // Обрабатываем конструкцию: dns.
  dns: string[];
  // Обрабатываем конструкцию: allowedIps.
  allowedIps: string[];
  // Обрабатываем конструкцию: size.
  size: number;
  // Обрабатываем конструкцию: importedAt.
  importedAt: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnStatus {
  // Обрабатываем конструкцию: state.
  state: VpnState;
  // Обрабатываем конструкцию: interface.
  interface: string | null;
  // Обрабатываем конструкцию: endpoint.
  endpoint: string | null;
  // Обрабатываем конструкцию: handshakeAt.
  handshakeAt: number | null;
  // Обрабатываем конструкцию: bytesIn.
  bytesIn: number | null;
  // Обрабатываем конструкцию: bytesOut.
  bytesOut: number | null;
  // Обрабатываем конструкцию: uptimeSec.
  uptimeSec: number | null;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnStats {
  // Обрабатываем конструкцию: interface.
  interface: string | null;
  // Обрабатываем конструкцию: endpoint.
  endpoint: string | null;
  // Обрабатываем конструкцию: handshakeAt.
  handshakeAt: number | null;
  // Обрабатываем конструкцию: bytesIn.
  bytesIn: number;
  // Обрабатываем конструкцию: bytesOut.
  bytesOut: number;
  // Обрабатываем конструкцию: uptimeSec.
  uptimeSec: number;
  // Обрабатываем конструкцию: isSwitching.
  isSwitching: boolean;
  // Обрабатываем конструкцию: killSwitchOn.
  killSwitchOn: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SubscriptionServer {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: protocol.
  protocol: string;
  // Обрабатываем конструкцию: host.
  host: string;
  // Обрабатываем конструкцию: port.
  port: number;
  // Обрабатываем конструкцию: link.
  link: string;
  // Сохраняем пояснение разработчика: Транспорт из ссылки: tcp, ws, grpc и так далее.
  /** Транспорт из ссылки: tcp, ws, grpc и так далее. */
  // Обрабатываем конструкцию: transport.
  transport: string;
  // Сохраняем пояснение разработчика: Шифрование канала: reality, tls; пустая строка — без TLS.
  /** Шифрование канала: reality, tls; пустая строка — без TLS. */
  // Обрабатываем конструкцию: security.
  security: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface XrayStatus {
  // Обрабатываем конструкцию: installed.
  installed: boolean;
  // Обрабатываем конструкцию: running.
  running: boolean;
  // Обрабатываем конструкцию: activeServerId.
  activeServerId: string | null;
  // Обрабатываем конструкцию: uptimeSec.
  uptimeSec: number;
  // Обрабатываем конструкцию: socksPort.
  socksPort: number;
  // Обрабатываем конструкцию: httpPort.
  httpPort: number;
  // Обрабатываем конструкцию: pid.
  pid: number | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
