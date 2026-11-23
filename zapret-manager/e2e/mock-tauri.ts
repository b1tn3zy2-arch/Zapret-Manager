import type { Page } from "@playwright/test";

export interface MockOptions {
  readonly strategiesFolder?: string;
  readonly available?: boolean;
  readonly vpnInstalled?: boolean;
  readonly firstRun?: boolean;
  /**
   * Синтетический сетевой трафик: монитор обязан показывать реальные цифры
   * из событий, а не нули. Без этого метрики страницы нечем было проверить.
   */
  readonly networkStats?: boolean;
  /**
   * Подписка по умолчанию добавлена: большинство сценариев живёт
   * в состоянии «VPN доступен». Тесты gating-а выключают её опцией.
   */
  readonly subscriptionPresent?: boolean;
  /** Задержка сканера игр: нужна, чтобы поймать skeleton в e2e. */
  readonly gamesScanDelayMs?: number;
  /** Сканер не находит ни одной игры: проверка пустого состояния. */
  readonly emptyGames?: boolean;
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
  const networkStats = options.networkStats ?? false;
  const subscriptionPresent = options.subscriptionPresent ?? true;
  const gamesScanDelayMs = options.gamesScanDelayMs ?? 0;
  const emptyGames = options.emptyGames ?? false;

  await page.addInitScript(
    ({
      strategiesFolder,
      updateAvailable,
      wireguard,
      firstRunFlag,
      networkStats,
      subscriptionPresent,
      gamesScanDelayMs,
      emptyGames,
    }) => {
      const listeners = new Map<
        number,
        { event: string; handler: (event: unknown) => void }
      >();
      /** колбэки из transformCallback: привязываются к событию позже */
      const callbacks = new Map<number, (event: unknown) => void>();
      let nextListenerId = 1;

      let networkTimer: number | null = null;

      const stopNetworkTimer = (): void => {
        if (networkTimer !== null) {
          window.clearInterval(networkTimer);
          networkTimer = null;
        }
      };

      const dispatch = (event: string, payload: unknown): void => {
        for (const entry of listeners.values()) {
          if (entry.event !== event) {
            continue;
          }

          entry.handler({
            event: { id: 1, event, windowLabel: "main" },
            id: 1,
            payload,
          });
        }
      };

      /**
       * Аргументы команд проверяются так же, как их ждёт Rust.
       * Мок, принимающий любые аргументы, маскирует несовпадение
       * сигнатур: сломанный вызов выглядел бы рабочим.
       */
      const requireArgs = (
        args: unknown,
        names: readonly string[]
      ): Record<string, unknown> => {
        const record = (args ?? {}) as Record<string, unknown>;

        for (const name of names) {
          const value = record[name];

          if (value === undefined || value === null || value === "") {
            throw new Error(`нет аргумента ${name}`);
          }
        }

        return record;
      };

      /**
       * Матрица цен — те же числа, что Rust берёт с панели:
       * своя цена за каждое количество устройств, без коэффициентов.
       */
      const buildTariffPrices = () => {
        const plans = [
          {
            id: "1m",
            months: 1,
            prices: [199, 240, 299, 370, 399, 480, 499, 540, 570, 599],
          },
          {
            id: "3m",
            months: 3,
            prices: [399, 620, 599, 975, 799, 1245, 999, 1400, 1480, 1199],
          },
          {
            id: "6m",
            months: 6,
            prices: [699, 1150, 899, 1800, 1099, 2300, 1499, 2590, 2730, 1699],
          },
          {
            id: "12m",
            months: 12,
            prices: [
              1199, 2110, 1399, 3300, 1599, 4220, 2299, 4740, 5000, 2499,
            ],
          },
        ];
        const prices = [];

        for (let devices = 1; devices <= 10; devices += 1) {
          for (const plan of plans) {
            const total = plan.prices[devices - 1] ?? 0;

            prices.push({
              planId: plan.id,
              devices,
              total,
              perMonth: Math.round(total / plan.months),
            });
          }
        }

        return prices;
      };

      // Туннель, поднятый умным подключением: после него
      // статус ядра должен быть «подключено».
      let vpnConnected = false;

      /**
       * Хранилище подписки: тот же снимок, что Rust кладёт в
       * subscription-store. По ключу `url` команда refresh-а решает,
       * есть ли подписка.
       */
      interface StoredSubscription {
        url: string;
        title: string | null;
        trafficUsedBytes: number;
        trafficLimitBytes: number;
        expiresAt: number | null;
        serverCount: number;
        updatedAt: number;
      }

      const GB = 1024 * 1024 * 1024;
      /** 14 дней вперёд: карточка всегда показывает «Осталось 14 дней». */
      const expiresAt = Math.floor(1_798_782_953);

      const initialSubscription: StoredSubscription | null = subscriptionPresent
        ? {
            url: "https://maximavps.cloud/api/v1/client/subscribe?token=demo",
            title: "Профиль 3 месяца",
            trafficUsedBytes: Math.round(45.2 * GB),
            trafficLimitBytes: Math.round(100 * GB),
            expiresAt,
            serverCount: 3,
            updatedAt: 1_798_712_953,
          }
        : null;

      let subscription: StoredSubscription | null = initialSubscription;

      const subscriptionInfo = (record: StoredSubscription | null): unknown => {
        if (record === null) {
          return {
            trafficUsedGb: null,
            trafficLimitGb: null,
            trafficPercent: null,
            daysRemaining: null,
            isActive: false,
            isLinked: false,
            title: null,
            serverCount: null,
            expiresAt: null,
            lastCheckedAt: null,
          };
        }

        const usedGb = record.trafficUsedBytes / GB;
        const limitGb = record.trafficLimitBytes / GB;
        const percent =
          limitGb > 0 ? Math.min((usedGb / limitGb) * 100, 100) : null;

        return {
          trafficUsedGb: Math.round(usedGb * 100) / 100,
          trafficLimitGb: Math.round(limitGb * 100) / 100,
          trafficPercent: percent,
          daysRemaining: 14,
          isActive: true,
          isLinked: true,
          title: record.title,
          serverCount: record.serverCount,
          expiresAt: record.expiresAt,
          lastCheckedAt: record.updatedAt,
        };
      };

      /**
       * Рейтинги стратегий. Замер мока никогда не набирает второй
       * серии: записи приходят с samples=1 и нулевыми метриками,
       * поэтому карточки честно показывают состояние «нет данных».
       */
      const ratingRecord = (input: { strategyId?: string }): unknown => ({
        strategyId: input.strategyId ?? "",
        strategyHash: "sha256-e2e",
        networkKey: "net-e2e",
        providerLabel: null,
        machineKey: "machine-e2e",
        samples: 1,
        ratingScore: null,
        coverage: null,
        successRate: null,
        medianLatencyMs: null,
        jitterMs: null,
        lastMeasuredAt: 1_798_712_953,
      });

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
            techniques: ["faketls"],
            fileType: "zapret",
            status: "idle",
            version: null,
            size: 2048,
            modifiedAt: 1_700_000_000_000,
            config: {
              sourceFilename: `strategy-${index}.bat`,
              winwsPath: `${strategiesFolder}\\bin\\winws.exe`,
              wfTcp: "80,443",
              wfUdp: "443",
              groups: [
                {
                  args: ["--filter-tcp=80,443", "--dpi-desync=fake"],
                  usesGeneralHostlist: true,
                  usesAllIpset: false,
                },
              ],
            },
          })),
        init_resources: () => ({
          firstRun: firstRunFlag,
          updated: false,
          strategiesCount: 22,
          resourcesVersion: "1.10.3",
          extractedBytes: 0,
          available: firstRunFlag,
          vpnCoreIncluded: true,
        }),
        check_resources_integrity: () => ({
          total: 33,
          missing: [],
          modified: [],
          ok: true,
          resourcesVersion: "1.10.3",
        }),
        list_bundled_strategies: () => [],
        get_resources_version: () => "1.10.3",
        get_resources_layout: () => [
          "strategies",
          "vpn",
          "logs",
          "backups",
          "cache",
          "manifest.json",
        ],
        get_resources_strategies_path: () => strategiesFolder,
        restore_bundled_strategies: () => ({
          restored: 0,
          skipped: 0,
          resourcesVersion: "1.10.3",
        }),
        get_system_info: () => ({
          os: "Windows 11 Pro",
          osVersion: "10.0.26100",
          osBuild: "26100",
          arch: "x86_64",
          tauriVersion: "2.12.1",
          rustVersion: "1.98.0",
          appVersion: "1.0.0",
          webviewVersion: "154.0.0.0",
        }),
        get_folder_path: () => strategiesFolder,
        check_for_updates: (args: unknown) => {
          requireArgs(args, ["strategiesDir"]);

          return {
            available: updateAvailable,
            currentVersion: "1.10.3",
            latestVersion: updateAvailable ? "1.11.0" : "1.10.3",
            releaseName: updateAvailable ? "Release 1.11.0" : "Release 1.10.3",
            releaseNotes: "- Что-то изменилось\n- И ещё одно",
            publishedAt: "2026-09-01T10:00:00Z",
            downloadUrl:
              "https://github.com/Flowseal/zapret-discord-youtube/releases/download/v1.11.0/zapret.zip",
            assetName: "zapret.zip",
            digest: "sha256:0123456789abcdef",
            size: 4_200_000,
            isNewer: updateAvailable,
            ignored: false,
          };
        },
        download_update: (args: unknown) => {
          requireArgs(args, ["url", "version", "expectedDigest"]);

          return "C:\\temp\\zapret-1.11.0.zip";
        },
        install_update: () => ({
          installed: 3,
          removed: 0,
          updated: false,
          skipped: 0,
          backupPath: "C:\\temp\\backup",
        }),
        cancel_download: () => true,
        set_current_version: () => true,
        get_current_version: () => "1.10.3",
        list_update_backups: () => [],
        rollback_update: (args: unknown) => {
          requireArgs(args, ["backupPath", "strategiesDir"]);

          return 0;
        },
        run_strategy: () => {
          for (const entry of listeners.values()) {
            if (entry.event !== "strategy-log") {
              continue;
            }

            entry.handler({
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
        run_strategy_native: () => {
          for (const entry of listeners.values()) {
            if (entry.event !== "strategy-log") {
              continue;
            }

            entry.handler({
              event: { id: 1, event: "strategy-log", windowLabel: "main" },
              id: 1,
              payload: [
                {
                  level: "success",
                  message:
                    "Встроенный движок: winws.exe запущен напрямую (PID 4242), групп фильтров 1",
                },
                { level: "info", message: "Запуск стратегии" },
                { level: "info", message: "zapret поднят на порту 7911" },
                { level: "warning", message: "Инъекция недоступна" },
              ],
            });
          }

          return { pid: 4242, logPath: "C:\\temp\\log.txt" };
        },
        run_strategy_auto: () => {
          for (const entry of listeners.values()) {
            if (entry.event !== "strategy-log") {
              continue;
            }

            entry.handler({
              event: { id: 1, event: "strategy-log", windowLabel: "main" },
              id: 1,
              payload: [
                {
                  level: "success",
                  message:
                    "Встроенный движок: winws.exe запущен напрямую (PID 4242), групп фильтров 1",
                },
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
          speedIn: 1024,
          speedOut: 2048,
          packetsIn: 8,
          packetsOut: 12,
          connections: 3,
          timestamp: 1_700_000_000_000,
        }),
        start_monitoring: () => {
          if (networkStats) {
            stopNetworkTimer();
            networkTimer = window.setInterval(() => {
              dispatch("network-stats", {
                bytesIn: 5_242_880,
                bytesOut: 1_048_576,
                speedIn: 102_400,
                speedOut: 51_200,
                packetsIn: 4000,
                packetsOut: 2000,
                connections: 42,
                timestamp: Date.now(),
              });
            }, 50);
          }

          return true;
        },
        stop_monitoring: () => {
          stopNetworkTimer();

          return true;
        },
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
        get_vpn_stats: () => ({
          interface: null,
          endpoint: null,
          handshakeAt: null,
          bytesIn: 1024,
          bytesOut: 2048,
          uptimeSec: 0,
          isSwitching: false,
          killSwitchOn: false,
        }),
        reconcile_vpn_tunnels: () => 0,
        vpn_core_status: () => ({
          installed: true,
          running: vpnConnected,
          activeServerId: vpnConnected ? "alpha" : null,
          uptimeSec: vpnConnected ? 12 : 0,
          socksPort: 12080,
          httpPort: 12081,
          pid: vpnConnected ? 4242 : null,
        }),
        install_vpn_core: () => true,
        import_vpn_source: () => ({
          subscriptionUrl: "https://sub.example.com/list",
          servers: [
            {
              id: "srv_alpha",
              name: "Alpha",
              protocol: "vless",
              host: "alpha.example.com",
              port: 443,
              link: "vless://uuid@alpha.example.com:443#Alpha",
              transport: "tcp",
              security: "reality",
            },
            {
              id: "srv_beta",
              name: "Beta",
              protocol: "trojan",
              host: "beta.example.com",
              port: 8443,
              link: "trojan://pass@beta.example.com:8443#Beta",
              transport: "ws",
              security: "tls",
            },
            {
              id: "srv_gamma",
              name: "Gamma",
              protocol: "vmess",
              host: "gamma.example.com",
              port: 443,
              link: "vmess://eyJ2IjoiMiJ9#Gamma",
              transport: "tcp",
              security: "",
            },
          ],
        }),
        tray_menu_ready: () => null,
        tray_menu_snapshot: () => ({
          state: "idle",
          activeStrategy: null,
          vpnName: null,
        }),
        tray_menu_action: () => null,
        tray_menu_hide: () => null,
        connect_vpn_server: () => ({
          installed: true,
          running: true,
          activeServerId: "srv_e2e",
          uptimeSec: 0,
          socksPort: 12080,
          httpPort: 12081,
          pid: 4321,
        }),
        disconnect_vpn_server: () => ({
          installed: true,
          running: false,
          activeServerId: null,
          uptimeSec: 0,
          socksPort: 12080,
          httpPort: 12081,
          pid: null,
        }),
        ping_endpoints: (args: unknown) => {
          const endpoints =
            (args as { endpoints?: { host: string; port: number }[] })
              .endpoints ?? [];

          return endpoints.map(({ host }) => ({
            endpoint: host,
            latencyMs: 42,
            success: true,
          }));
        },
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
        restore_from_backup: (args: unknown) => {
          requireArgs(args, ["strategyPath"]);

          return 1;
        },
        list_backups: () => [],
        extract_config_paths: () => [],
        scan_installed_games: async () => {
          if (gamesScanDelayMs > 0) {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, gamesScanDelayMs);
            });
          }

          if (emptyGames) {
            return [];
          }

          return [
            {
              id: "steam-portal",
              name: "Portal 2",
              appid: "620",
              launchArgs: null,
              platform: "steam",
              source: "steam",
              installPath: "C:\\Games\\Portal 2",
              executablePath: "C:\\Games\\Portal 2\\portal2.exe",
              coverUrl: "620.jpg",
              coverPath: null,
              gameSettingsId: null,
              anticheat: "none",
              lastLaunchedAt: null,
              launchCount: 0,
            },
            {
              id: "custom-indie",
              name: "Indie Game",
              appid: null,
              platform: "custom",
              source: "userFolder",
              installPath: "C:\\Games\\Indie",
              executablePath: "C:\\Games\\Indie\\indie.exe",
              launchArgs: null,
              coverUrl: null,
              coverPath: null,
              gameSettingsId: null,
              anticheat: "battleye",
              lastLaunchedAt: null,
              launchCount: 0,
            },
          ];
        },
        game_cover: () => null,
        game_steam_cover: () => null,
        import_game_cover: () => "imported-cover.jpg",
        // бэкенд отдаёт дерево процессов: лаунчер античит�� может завершиться
        launch_game: (args: unknown) => {
          const path =
            (args as { executablePath?: string } | undefined)?.executablePath ??
            "";

          if (path.toLowerCase().includes("missing")) {
            throw new Error(`Файл игры не найден: ${path}`);
          }

          return [4242, 4243];
        },
        hide_main_window: () => null,
        is_game_running: () => true,
        verify_configs: () => ({ total: 0, ok: 0, missing: [] }),
        delete_all_backups: () => 0,
        export_logs_file: () => ({ path: "C:\\temp\\logs.txt", bytes: 128 }),
        export_settings_file: () => null,
        import_settings_file: () => null,
        save_monitor_snapshot: () => "C:\\temp\\snapshot.png",
        running_games: () => [],
        close_game_by_path: (args: unknown) => {
          requireArgs(args, ["executablePath"]);

          return true;
        },
        game_cover_file: () => null,
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
        // Команды, которые раньше не были смоканы. Формы ответов
        // совпадают с настоящими структурами Rust: расхождение формы
        // должно ломать e2e, а не проходить молча.
        tune_strategy_for_game: (args: unknown) => {
          const request = (args ?? {}) as {
            gameId?: string;
            gameName?: string;
            basePorts?: number[];
          };

          return {
            gameId: request.gameId ?? "game",
            gameName: request.gameName ?? "Game",
            requiresEacTuning: false,
            usesGamelift: false,
            ports: request.basePorts ?? [],
            addedPorts: [],
            dropUdpFilter: false,
            dropIpset: false,
            notes: [],
          };
        },
        analyze_game_logs: () => ({
          gameId: "game",
          code: "no-log",
          message: "Лог обхода не найден",
          recommendation: "",
          logPaths: [],
          applied: [],
        }),
        analyze_traffic: () => ({
          ip: "203.0.113.10",
          port: 27015,
          outbound: 0,
          inbound: 0,
          tampered: 0,
          dropped: 0,
          verdict: "no-log",
          message: "Лог не найден",
          logPath: null,
        }),
        check_game_connectivity: () => ({
          dnsOk: true,
          dnsAddress: "203.0.113.10",
          dnsError: null,
          tcp: [],
          udpStatus: "unverifiable",
          udpNote: "udp-unverifiable",
          verdict: "tcp-ok",
        }),
        check_game_endpoints: () => [],
        detect_game_endpoints: () => [],
        match_known_game: () => null,
        close_game: () => true,
        delete_all_logs: () => 0,
        prune_logs: () => 0,
        full_uninstall: () => null,
        open_folder: () => null,
        system_toasts_enabled: () => true,
        game_exe_icon: () => null,
        game_folder_cover: () => null,
        game_cover_for: () => null,
        write_monitor_snapshot: () => 0,
        tray_menu_set_height: () => null,
        // Подписка: снимок без сети, добавление по HTTPS-ссылке,
        // обновление и удаление. Формы совпадают со структурами Rust.
        get_subscription: () => subscriptionInfo(subscription),
        add_subscription: (args: unknown) => {
          const request = (args ?? {}) as { url?: string };
          const url = (request.url ?? "").trim();

          if (!url.startsWith("https://")) {
            throw new Error("Ссылка должна начинаться с https://");
          }

          // Backend принимает только подписки Maxima VPS: проверяем так же.
          const host = new URL(url).hostname.toLowerCase();
          const maximaHosts = [
            "maximavps.cloud",
            "maximacloud.online",
            "maxima-vps.online",
            "maxima.run",
          ];
          const allowed = maximaHosts.some(
            (domain) => host === domain || host.endsWith(`.${domain}`)
          );

          if (!allowed) {
            throw new Error("Подписка принимается только от Maxima VPS");
          }

          subscription = {
            url,
            title: "Профиль 3 месяца",
            trafficUsedBytes: Math.round(45.2 * GB),
            trafficLimitBytes: Math.round(100 * GB),
            expiresAt,
            serverCount: 3,
            updatedAt: 1_798_712_953,
          };

          return subscriptionInfo(subscription);
        },
        refresh_subscription: () => {
          if (subscription === null) {
            throw new Error("Подписка не добавлена");
          }

          subscription = {
            ...subscription,
            updatedAt: 1_798_730_000,
          };

          return subscriptionInfo(subscription);
        },
        prepare_subscription_servers: () => {
          if (subscription === null) {
            throw new Error("Подписка не добавлена");
          }

          return subscription.serverCount;
        },
        remove_subscription: () => {
          subscription = null;

          return null;
        },
        // Оплата и личный кабинет открываются в изолированном окне
        // приложения. Заголовок окна передаёт интерфейс («Оплата»,
        // «Личный кабинет»).
        open_payment_window: (args: unknown) => {
          requireArgs(args, ["url"]);

          return null;
        },
        // Заказ создаётся при каждом клике «Оплатить»: ссылка всегда
        // свежая. Мок возвращает стабильный адрес, чтобы тесты
        // сверяли его с аргументом open_payment_window.
        create_payment_order_command: (args: unknown) => {
          const { plan, devices, email } = requireArgs(args, [
            "plan",
            "devices",
            "email",
          ]) as { plan: string; devices: number; email: string };

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
            throw new Error("Укажите корректный email");
          }

          return {
            url: `https://maximacloud.online/pay/transactions/mock-${plan}-${devices}`,
            guid: `mock-${plan}-${devices}`,
            amount: 199,
          };
        },
        // Окно оплаты в моке существует ровно на момент открытия:
        // адрес не читается, следилка сразу останавливается.
        payment_window_url: () => null,
        // Автоподхват подписки из кабинета в моке ничего не находит.
        find_subscription_in_maxima_page: () => null,
        // Канал уведомлений («app» или «windows») уходит бэкенду.
        set_notification_channel: (args: unknown) => {
          requireArgs(args, ["channel"]);

          return null;
        },
        // Рейтинги: список пуст, а после запуска замер отдаёт
        // запись без метрик — карточка показывает состояние «нет данных».
        measure_strategy_rating: (args: unknown) => {
          const input =
            (
              (args ?? {}) as {
                input?: { strategyId?: string; strategyPath?: string };
              }
            ).input ?? {};

          if (
            input.strategyId === undefined ||
            input.strategyPath === undefined
          ) {
            throw new Error("нет аргумента input.strategyId");
          }

          return ratingRecord(input);
        },
        get_strategy_ratings: (args: unknown) => {
          requireArgs(args, ["strategies"]);

          return [];
        },
        reset_strategy_ratings: () => true,
        fetch_tariff_matrix: () => ({
          plans: [
            {
              id: "1m",
              months: 1,
              days: 31,
              basePrice: 199,
              highlight: "none",
            },
            {
              id: "3m",
              months: 3,
              days: 92,
              basePrice: 399,
              highlight: "popular",
            },
            {
              id: "6m",
              months: 6,
              days: 184,
              basePrice: 699,
              highlight: "profitable",
            },
            {
              id: "12m",
              months: 12,
              days: 365,
              basePrice: 1199,
              highlight: "best",
            },
          ],
          prices: buildTariffPrices(),
          deviceCounts: [1, 3, 5, 7, 10],
        }),
        // Серверы теперь берёт сама Rust: подписка скачивается
        // внутри команды, и она же выбирает самый быстрый узел.
        auto_connect_vpn: () => {
          vpnConnected = true;

          return {
            serverId: "srv_alpha",
            serverName: "Alpha",
            pingMs: 24,
            status: {
              installed: true,
              running: true,
              activeServerId: "srv_alpha",
              uptimeSec: 0,
              socksPort: 12080,
              httpPort: 12081,
              pid: 4242,
            },
          };
        },
      };

      const coreHandlers: Record<string, (args: unknown) => unknown> = {
        "plugin:window|is_maximized": () => false,
        "plugin:window|is_fullscreen": () => false,
        "plugin:window|scale_factor": () => 1,
        "plugin:window|inner_size": () => ({ width: 1280, height: 800 }),
        "plugin:window|current_monitor": () => null,
        "plugin:window|available_monitors": () => [],

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

      const eventApi: {
        listen: (
          event: string,
          handler: (value: unknown) => void
        ) => Promise<number>;
        unlisten: (id: number) => Promise<void>;
        unregisterListener: (event: string, id: number) => Promise<void>;
        emit: (event: string, payload?: unknown) => Promise<null>;
      } = {
        listen: async (event: string, handler: (value: unknown) => void) => {
          const id = nextListenerId;
          nextListenerId += 1;
          listeners.set(id, { event, handler });

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
        // Tauri передаёт (event, eventId): первый аргумент — имя события,
        // а не идентификатор подписки. Раньше подписки не снимались вообще,
        // и каждое монтирование добавляло ещё одну.
        unregisterListener: async (_event: string, id: number) => {
          listeners.delete(id);
        },
        emit: async () => null,
      };

      // Раньше plugin:event|listen был заглушкой: подписки не регистрировались,
      // а события рассылались всем слушателям разом. Из-за этого слушатель,
      // подписанный на tray-notify, получал strategy-log и падал на чужом
      // payload, что превращало успешный запуск стратегии в ошибку.
      handlers["plugin:event|listen"] = (args: unknown) => {
        const { event, handler } = args as {
          event: string;
          handler: number;
        };
        const callback = callbacks.get(handler);

        if (callback === undefined) {
          return 0;
        }

        return eventApi.listen(event, callback);
      };

      handlers["plugin:event|unlisten"] = () => null;

      (
        window as unknown as Record<string, unknown>
      ).__TAURI_EVENT_PLUGIN_INTERNALS__ = eventApi;

      const recorded: { command: string; args?: unknown }[] = [];

      (window as unknown as Record<string, unknown>).__MOCK_INVOKE_LOG__ =
        recorded;

      (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
        invoke: async (command: string, args?: unknown) => {
          recorded.push({ command, args });

          const failures = (
            window as unknown as {
              __MOCK_FAIL_COMMANDS__?: string[] | Record<string, string>;
            }
          ).__MOCK_FAIL_COMMANDS__;

          if (Array.isArray(failures) && failures.includes(command)) {
            throw new Error("Нет подключения к интернету");
          }

          if (failures !== undefined && !Array.isArray(failures)) {
            const message = failures[command];

            if (typeof message === "string") {
              throw new Error(message);
            }
          }

          const handler = handlers[command];

          if (handler === undefined) {
            throw new Error(`Команда не найдена в моке: ${command}`);
          }

          return handler(args);
        },
        transformCallback: (callback: (value: unknown) => void) => {
          const id = nextListenerId;
          nextListenerId += 1;
          callbacks.set(id, callback);

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
      networkStats,
      subscriptionPresent,
      gamesScanDelayMs,
      emptyGames,
    }
  );
}
