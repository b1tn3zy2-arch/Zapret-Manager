import type { Page } from "@playwright/test";

export interface MockOptions {
  readonly strategiesFolder?: string;
  readonly available?: boolean;
  readonly vpnInstalled?: boolean;
  readonly firstRun?: boolean;
}

export const MOCK_FOLDER = "C:\\zapret-e2e\\strategies";

export async function mockTauri(
  page: Page,
  options: MockOptions = {}
): Promise<void> {
  const folder = options.strategiesFolder ?? MOCK_FOLDER;
  const available = options.available ?? false;
  const vpnInstalled = options.vpnInstalled ?? true;
  const firstRun = options.firstRun ?? false;

  await page.addInitScript(
    ({ strategiesFolder, updateAvailable, wireguard, firstRunFlag }) => {
      const listeners = new Map<number, (event: unknown) => void>();
      let nextListenerId = 1;

      const handlers: Record<string, (args: unknown) => unknown> = {
        scan_strategies: () =>
          Array.from({ length: 22 }, (_, index) => ({
            id: `st_${String(index).padStart(16, "0")}`,
            name: [
              "Discord + YouTube",
              "General ALT",
              "General Baseline",
              "YouTube Only",
              "Outlast Trials",
            ][index % 5],
            filename: `strategy-${index}.bat`,
            path: `${strategiesFolder}\\strategy-${index}.bat`,
            description: "Тестовая стратегия для e2e",
            services: index % 2 === 0 ? ["discord", "youtube"] : ["youtube"],
            techniques: ["fragment"],
            fileType: "zapret",
            status: "idle",
            version: null,
            size: 2048,
            modifiedAt: 1_700_000_000_000,
          })),
        init_resources: () => ({
          ok: true,
          version: "1.10.3",
          firstRun: firstRunFlag,
          available: firstRunFlag,
          extractedBytes: 0,
          filesExtracted: 0,
          skipped: 0,
          updated: 0,
          removed: 0,
          warnings: [],
        }),
        check_resources_integrity: () => ({
          ok: true,
          total: 3,
          okCount: 3,
          missing: [],
          modified: [],
          extra: [],
          version: "1.10.3",
        }),
        list_bundled_strategies: () => [],
        get_resources_version: () => "1.10.3",
        get_resources_layout: () => ({}),
        get_resources_strategies_path: () => strategiesFolder,
        restore_bundled_strategies: () => ({ restored: 0, removed: 0 }),
        get_system_info: () => ({
          os: "Windows 11 Pro",
          osVersion: "10.0.26100",
          osBuild: "26100",
          arch: "x86_64",
          tauriVersion: "2.12.1",
          rustVersion: "1.98.0",
          appVersion: "0.1.0",
          webviewVersion: "154.0.0.0",
        }),
        get_folder_path: () => strategiesFolder,
        check_for_updates: () => ({
          available: updateAvailable,
          currentVersion: "1.10.3",
          latestVersion: updateAvailable ? "1.11.0" : "1.10.3",
          releaseName: updateAvailable ? "Release 1.11.0" : "Release 1.10.3",
          releaseNotes: "- Что-то изменилось\n- И ещё одно",
          publishedAt: "2026-09-01T10:00:00Z",
          downloadUrl:
            "https://github.com/Flowseal/zapret-discord-youtube/releases/download/v1.11.0/zapret.zip",
          assetName: "zapret.zip",
          size: 4_200_000,
          isNewer: updateAvailable,
          ignored: false,
        }),
        download_update: () => "C:\\temp\\zapret-1.11.0.zip",
        install_update: () => ({
          installed: 3,
          removed: 0,
          updated: 0,
          skipped: 0,
          backupPath: "C:\\temp\\backup",
        }),
        cancel_download: () => true,
        set_current_version: () => true,
        get_current_version: () => "1.10.3",
        list_update_backups: () => [],
        rollback_update: () => 0,
        run_strategy: () => {
          for (const handler of listeners.values()) {
            handler({
              event: { id: 1, event: "strategy-log", windowLabel: "main" },
              id: 1,
              payload: [
                { level: "info", message: "Запуск стратегии" },
                { level: "info", message: "zapret поднят на порту 7911" },
                { level: "warning", message: "Инъекция недоступна" },
              ],
            });
          }

          return { pid: 4242, logPath: "C:\\temp\\log.txt" };
        },
        stop_strategy: () => 1,
        check_strategy_status: () => ({
          running: true,
          winwsPids: [4242],
          startedAt: 1_700_000_000_000,
          uptime: 12,
        }),
        list_running_processes: () => [],
        kill_all_processes: () => 0,
        get_network_stats: () => ({
          bytesIn: 1024,
          bytesOut: 2048,
          connections: 3,
          samples: [1, 2, 3],
          ping: [20, 25, 22],
          labels: ["10:00", "10:01", "10:02"],
        }),
        start_monitoring: () => true,
        stop_monitoring: () => true,
        is_monitoring: () => false,
        fetch_network_info: () => ({
          ip: "203.0.113.10",
          country: "Россия",
          countryCode: "ru",
          city: "Москва",
          isp: "Example ISP",
        }),
        ping_hosts: () => [
          { host: "discord.com", latencyMs: 32, success: true },
          { host: "youtube.com", latencyMs: 41, success: true },
        ],
        is_wireguard_installed: () => wireguard,
        detect_wireguard_command: () =>
          wireguard ? "C:\\Program Files\\WireGuard\\wireguard.exe" : null,
        list_vpn_configs: () => [
          {
            id: "e2e-config",
            name: "e2e",
            path: "C:\\vpn\\e2e.conf",
            endpoint: "vpn.example.com:51820",
            address: ["10.8.0.2/32"],
            dns: ["1.1.1.1"],
            allowedIps: ["0.0.0.0/0"],
            size: 320,
            importedAt: 1_700_000_000_000,
          },
        ],
        import_vpn_config: () => ({
          id: "e2e-config",
          name: "e2e",
          path: "C:\\vpn\\e2e.conf",
          endpoint: "vpn.example.com:51820",
          address: ["10.8.0.2/32"],
          dns: ["1.1.1.1"],
          allowedIps: ["0.0.0.0/0"],
          size: 320,
          importedAt: 1_700_000_000_000,
        }),
        delete_vpn_config: () => true,
        switch_to_vpn: () => ({
          state: "connected",
          interface: "wg0",
          endpoint: "vpn.example.com:51820",
          handshakeAt: 1_700_000_000_000,
          bytesIn: 1024,
          bytesOut: 2048,
          uptimeSec: 30,
          error: null,
        }),
        switch_to_dpi: () => null,
        disconnect_vpn: () => null,
        get_vpn_status: () => ({
          state: "disconnected",
          interface: null,
          endpoint: null,
          handshakeAt: null,
          bytesIn: null,
          bytesOut: null,
          uptimeSec: null,
          error: null,
        }),
        get_vpn_stats: () => ({ bytesIn: 1024, bytesOut: 2048, uptimeSec: 0 }),
        reconcile_vpn_tunnels: () => 0,
        enable_kill_switch: () => true,
        disable_kill_switch: () => true,
        inject_outlast: () => ({
          filesModified: ["C:\\zapret\\list-general.txt"],
          domainsAdded: 2,
          ipsAdded: 0,
          portsAccepted: 0,
          backupsCreated: [],
          skippedDuplicates: 1,
          rejectedEntries: 0,
        }),
        restore_backup: () => 1,
        restore_from_backup: () => 1,
        list_backups: () => [],
        extract_config_paths: () => [],
        verify_configs: () => ({ total: 0, ok: 0, missing: [] }),
        delete_all_backups: () => 0,
        write_log_export: () => "C:\\temp\\logs.txt",
        read_license_text: () => "MIT License",
        update_tray_state: () => null,
        update_tray_config: () => null,
        show_notification: () => null,
        toggle_tray_window: () => null,
        show_tray_window: () => null,
        quit_app: () => null,
        set_minimize_to_tray_cmd: () => true,
        get_monitor_info: () => ({
          name: "Test Monitor",
          scaleFactor: 1,
          width: 2560,
          height: 1440,
          logicalWidth: 2560,
          logicalHeight: 1440,
          x: 0,
          y: 0,
        }),
        get_current_monitor: () => ({
          name: "Test Monitor",
          scaleFactor: 1,
          width: 2560,
          height: 1440,
          logicalWidth: 2560,
          logicalHeight: 1440,
          x: 0,
          y: 0,
        }),
        available_monitors: () => [],
        open_external_url: () => null,
        read_user_text_file: () => "{}",
        write_user_text_file: () => null,
      };

      const coreHandlers: Record<string, (args: unknown) => unknown> = {
        "plugin:window|is_maximized": () => false,
        "plugin:window|is_fullscreen": () => false,
        "plugin:window|scale_factor": () => 1,
        "plugin:window|inner_size": () => ({ width: 1280, height: 800 }),
        "plugin:window|current_monitor": () => null,
        "plugin:window|available_monitors": () => [],
        "plugin:event|listen": () => 1,
        "plugin:event|unlisten": () => null,
        "plugin:path|resolve_directory": () => "C:\\Users\\e2e\\AppData",
        "plugin:path|resolve_file": () =>
          "C:\\Users\\e2e\\AppData\\config.json",
        "plugin:fs|read_text_file": () =>
          Array.from(
            new TextEncoder().encode(
              JSON.stringify({ strategiesFolder, strategyUpdates: {} })
            )
          ),
        "plugin:fs|write_text_file": () => null,
        "plugin:fs|exists": () => true,
        "plugin:fs|mkdir": () => null,
        "plugin:fs|read_dir": () => [],
        "plugin:dialog|open": () => null,
        "plugin:dialog|save": () => null,
        "plugin:autostart|is_enabled": () => false,
        "plugin:autostart|enable": () => null,
        "plugin:autostart|disable": () => null,
      };

      Object.assign(handlers, coreHandlers);

      const eventApi = {
        listen: async (event: string, handler: (value: unknown) => void) => {
          const id = nextListenerId;
          nextListenerId += 1;
          listeners.set(id, handler);

          if (
            event === "tauri://resize" ||
            event === "tauri://scale-factor-changed"
          ) {
            window.setTimeout(() => {
              handler({ payload: { event, id, windowLabel: "main" } });
            }, 10);
          }

          return id;
        },
        unlisten: async (id: number) => {
          listeners.delete(id);
        },
        unregisterListener: async (id: number) => {
          listeners.delete(id);
        },
        emit: async () => null,
      };

      (
        window as unknown as Record<string, unknown>
      ).__TAURI_EVENT_PLUGIN_INTERNALS__ = eventApi;

      (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
        invoke: async (command: string, args?: unknown) => {
          const handler = handlers[command];

          if (handler === undefined) {
            throw new Error(`Команда не найдена в моке: ${command}`);
          }

          return handler(args);
        },
        transformCallback: (callback: (value: unknown) => void) => {
          const id = nextListenerId;
          nextListenerId += 1;
          listeners.set(id, callback);

          return id;
        },
        convertFileSrc: (path: string) => path,
        metadata: {
          currentWindow: { label: "main" },
          currentWebview: { label: "main" },
        },
      };

      const scope = window as unknown as Record<
        string,
        Record<string, unknown>
      >;

      const internals = scope.__TAURI_INTERNALS__;

      if (internals === undefined) {
        throw new Error("mock-tauri: внутренний объект не создан");
      }

      (window as unknown as Record<string, unknown>).__TAURI__ = {
        core: {
          invoke: internals.invoke,
        },
      };
    },
    {
      strategiesFolder: folder,
      updateAvailable: available,
      wireguard: vpnInstalled,
      firstRunFlag: firstRun,
    }
  );
}
