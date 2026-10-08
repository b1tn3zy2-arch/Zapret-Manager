═══════════════════════════════════════════════════════════════════════
ЭТАП 14: ПЕРЕКЛЮЧЕНИЕ BAT ↔ VPN (AMNEZIA / WIREGUARD)
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Реализовать полноценный функционал переключения между двумя
режимами обхода блокировок: DPI-обход (bat-стратегии из zapret) и
VPN-туннель (WireGuard или AmneziaWG). Сделать это через большой
анимированный тумблер в Dashboard (заглушка создана на Этапе 9) и
через рабочую секцию VPN в Settings (заглушка создана на Этапе 13).

После этого этапа пользователь сможет:
  • Одним кликом переключиться с bat-стратегии на VPN и обратно
  • Импортировать .conf файл WireGuard/AmneziaWG через Settings
  • Выбрать один из нескольких VPN-конфигов (если их несколько)
  • Видеть текущее состояние VPN: подключён / отключается /
    ошибка / handshake
  • Видеть метрики: сколько байт получено/отправлено через
    туннель, uptime, endpoint, последний handshake
  • Включить Kill Switch: блокировка всего трафика при разрыве
    VPN (защита от утечек)
  • Управлять автозапуском VPN при старте
  • Видеть в Dashboard актуальный статус (не «в разработке», а
    реальный)

Это последний функциональный этап перед визуальной полировкой
(Этапы 15–17). После него приложение становится полноценной
альтернативой отдельным VPN-клиентам и zapret-обёрткам.

⚠️ ВАЖНО: переключение DPI ↔ VPN — взаимоисключающее.
Нельзя одновременно запустить bat-стратегию и VPN — это приведёт
к конфликту на уровне сетевых драйверов (WinDivert + WFP).
При переключении — сначала корректно останавливаем текущий режим,
ждём подтверждения, только потом запускаем новый.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Выбор провайдера — WireGuard + AmneziaWG ]

ОБОСНУЙ:
  • WireGuard — стандартный протокол, встроен в Windows начиная
    с Windows 10 (через официальный клиент WireGuard for Windows)
  • AmneziaWG — модифицированный WireGuard, устойчивый к DPI
    (специально для РФ/Ирана/Китая). Полностью совместим с
    интерфейсом WireGuard, но с дополнительным обфусцирующим
    слоем
  • Amnezia VPN — обёртка, использующая AmneziaWG под капотом,
    плюс свой UI и API
  • OpenVPN — устаревший, медленный, не берём
  • Xray/VLESS — сложно, требует сервер, не для среднего
    пользователя

ВЫБОР: поддержать WireGuard (.conf) и AmneziaWG (.conf) как
основные. Amnezia VPN — через её CLI (если найдена в системе).

ПОЧЕМУ НЕ AMNEZIA VPN КАК ОСНОВНОЙ:
  • Требует установки их клиента
  • Тяжёлый (Electron + Docker)
  • Ориентирован на self-hosted серверы, требует настройки

ПОЧЕМУ НЕ OPENVPN:
  • Медленнее в 2–3 раза
  • Больше overhead
  • Устаревший

【 РЕШЕНИЕ 2: Интеграция с WireGuard for Windows через CLI ]

ОБОСНУЙ:
  • WireGuard for Windows устанавливается отдельно (пользователем)
  • CLI: wireguard.exe
  • Команды:
    - wireguard.exe /installtunnelservice "C:\path\to\config.conf"
      → устанавливает туннель как Windows Service
    - wireguard.exe /uninstalltunnelservice "tunnelName"
      → удаляет службу
    - wireguard.exe /tunnelservice "config.conf"
      → запускает в foreground (не используем)
  • После /installtunnelservice — туннель автоматически
    поднимается
  • Проверка статуса: sc query "WireGuardTunnel$tunnelName"
    или wg.exe show (если установлен wg.exe)

АЛЬТЕРНАТИВА: wg.exe из пакета wireguard-tools
  • wg-quick up/down — не работает на Windows
  • wg show — показывает handshake, байты, endpoint
  • Требует установки wireguard-tools отдельно

РЕКОМЕНДАЦИЯ: использовать wireguard.exe (входит в
WireGuard for Windows). Для проверки статуса — через PowerShell
Get-Service или sc query.

【 РЕШЕНИЕ 3: Обнаружение WireGuard в системе ]

ОБОСНУЙ:
  • WireGuard.exe обычно в C:\Program Files\WireGuard\
  • Или через реестр: HKLM\SOFTWARE\WireGuard\WireGuard
  • Или через PATH
  • При старте приложения — проверить наличие
  • Если не найден — предложить скачать
  • Ссылка: https://www.wireguard.com/install/

ПОЧЕМУ НЕ ВКЛЮЧАТЬ WG В СБОРКУ:
  • Лицензия (WireGuard — GPLv2, Tauri — MIT/Apache)
  • Размер (+20 MB)
  • Обновления (WireGuard обновляется независимо)

ПОЧЕМУ НЕ СКАЧИВАТЬ АВТОМАТИЧЕСКИ:
  • Требует admin-прав
  • Пользователь должен согласиться с лицензией
  • Лучше дать ссылку

【 РЕШЕНИЕ 4: Хранение конфигов — папка %APPDATA%/ZapretManager/vpn/ ]

ОБОСНУЙ:
  • Пользователь импортирует .conf файлы через Settings
  • Приложение копирует их в свою папку
  • Не хранить в папке стратегий (разные сущности)
  • Структура:
    %APPDATA%/ZapretManager/vpn/
    ├── configs/
    │   ├── mullvad-nl.conf
    │   ├── amnezia-frankfurt.conf
    │   └── ...
    └── active.conf (симлинк или копия активного)

ПОЧЕМУ НЕ В ПАПКЕ СТРАТЕГИЙ:
  • Логическое разделение
  • Пользователь может удалить папку стратегий, не потеряв VPN
  • Разные типы данных

ПОЧЕМУ КОПИРОВАТЬ, А НЕ ССЫЛАТЬСЯ:
  • Пользователь может удалить оригинал
  • Единый источник правды
  • Проще управлять

【 РЕШЕНИЕ 5: Взаимоисключение DPI ↔ VPN — сначала остановить текущий ]

ОБОСНУЙ:
  • Конфликт: WinDivert (используется zapret) и WFP (используется
    WireGuard) на уровне сетевого стека
  • Если одновременно — обход не работает, VPN падает
  • Порядок переключения DPI → VPN:
    1. Остановить все активные bat-стратегии (kill процессов)
    2. Дождаться завершения (до 5 сек)
    3. Остановить WinDivert-службу (если есть)
    4. Запустить VPN-туннель
    5. Проверить, что handshake прошёл
  • Порядок VPN → DPI:
    1. Остановить VPN-туннель
    2. Дождаться (до 5 сек)
    3. Запустить bat-стратегию
    4. Проверить, что WinDivert поднялся

ПОЧЕМУ НЕ ПРОСТО ЗАПУСТИТЬ ВТОРОЙ:
  • Конфликт драйверов
  • Непредсказуемое поведение
  • Может привести к BSOD (редко, но возможно)

ПОЧЕМУ ЖДАТЬ 5 СЕК:
  • Драйверы нужно время на выгрузку
  • Процессы на kill
  • Если меньше — race condition

РЕАЛИЗАЦИЯ:
  • Rust-команда switch_to_vpn() — атомарная операция
  • Rust-команда switch_to_dpi(strategyId) — атомарная
  • Внутри — последовательные шаги с await
  • Frontend показывает прогресс: «Остановка стратегии...» →
    «Запуск VPN...» → «Проверка...»

【 РЕШЕНИЕ 6: Проверка handshake для подтверждения подключения ]

ОБОСНУЙ:
  • После запуска VPN — WireGuard сразу создаёт интерфейс
  • Но handshake с сервером занимает 0.5–3 секунды
  • До handshake — трафик не идёт
  • Проверка через wg show:
    latest handshake: 2 seconds ago
    transfer: 1.2 KiB received, 800 B sent
  • Если handshake не прошёл за 15 секунд — ошибка

ПОЧЕМУ ВАЖНО:
  • Пользователь должен видеть «подключено» только когда реально
    работает
  • Иначе — «подключено», но трафик не идёт

РЕАЛИЗАЦИЯ:
  • После установки туннеля — polling каждые 500ms
  • Читать вывод wg show
  • Парсить latest handshake
  • Если < 60 сек назад — считаем подключённым
  • Таймаут 15 сек — ошибка

АЛЬТЕРНАТИВА (если wg.exe недоступен):
  • Проверять наличие сетевого интерфейса с именем туннеля
  • Проверять ping до 1.1.1.1 через интерфейс
  • Менее надёжно

РЕКОМЕНДАЦИЯ: использовать wg show (требует установки
wireguard-tools). Fallback — проверка интерфейса.

【 РЕШЕНИЕ 7: Kill Switch через Windows Firewall ]

ОБОСНУЙ:
  • Kill Switch — блокировка всего трафика, если VPN упал
  • Защита от утечек (реальный IP не утекает)
  • Реализация: Windows Firewall (netsh advfirewall)
  • Правила:
    - Блокировать весь исходящий трафик
    - Разрешить только трафик через VPN-интерфейс
    - Разрешить локальный трафик (LAN)
  • При включении VPN — правила активируются
  • При выключении — деактивируются

РЕАЛИЗАЦИЯ:
  • Rust-команда enable_kill_switch(interface_name: String)
  • Rust-команда disable_kill_switch()
  • Через netsh advfirewall firewall add rule ...
  • Требует admin-прав → UAC

ПОЧЕМУ ЧЕРЕЗ NETSH:
  • Встроено в Windows
  • Не требует сторонних библиотек
  • Работает надёжно

ПОЧЕМУ ТРЕБУЕТ ADMIN:
  • Firewall-правила — системный уровень
  • Без admin не работает

АЛЬТЕРНАТИВА: WinAPI (FwpmEngineOpen, FwpmFilterAdd)
  • Сложнее
  • Требует admin тоже
  • Меньше прозрачно

РЕКОМЕНДАЦИЯ: netsh + UAC при включении.

⚠️ ВАЖНО: Kill Switch по умолчанию ВЫКЛЮЧЕН. Пользователь
включает сам в настройках, понимая риски.

【 РЕШЕНИЕ 8: Импорт .conf файла ]

ОБОСНУЙ:
  • Пользователь кликает «Импорт конфига» в Settings → VPN
  • dialog.open с фильтром .conf
  • Читаем файл, валидируем:
    - Начинается с [Interface]
    - Есть PrivateKey, Address
    - Есть [Peer]
    - Есть PublicKey, Endpoint, AllowedIPs
  • Копируем в %APPDATA%/ZapretManager/vpn/configs/
  • Имя файла: {original_name}.conf
  • Добавляем в useVpnStore.configs

ПОЧЕМУ ВАЛИДАЦИЯ:
  • Файл может быть не WireGuard
  • Может быть повреждён
  • Может содержать невалидные данные

РЕАЛИЗАЦИЯ:
  • Rust-команда validate_wireguard_config(content: String) →
    Result<ConfigInfo, AppError>
  • Возвращает: name, address, endpoint, dns, allowedIps

【 РЕШЕНИЕ 9: UI — большой тумблер в Dashboard ]

ОБОСНУЙ:
  • Заглушка VpnToggle уже есть (Этап 9)
  • Теперь — рабочий тумблер
  • Два состояния: DPI (слева) / VPN (справа)
  • При переключении — анимация thumb + смена иконок
  • Индикатор прогресса при переключении (шаги)
  • Показывает текущий активный режим

ВИЗУАЛ:
  • Большой тумблер (240x80)
  • Две иконки: Zap (DPI) / Lock (VPN)
  • Thumb переезжает через framer-motion layoutId
  • При переключении — подписи «Остановка DPI...» →
    «Запуск VPN...» → «Проверка handshake...» → «Готово»

ПОЧЕМУ БОЛЬШОЙ:
  • Ключевая функция
  • Должна быть заметной
  • Не спрятана в настройках

【 РЕШЕНИЕ 10: VpnSection в Settings — полная реализация ]

ОБОСНУЙ:
  • Список конфигов (карточки с выбором)
  • Импорт конфига (кнопка)
  • Удаление конфига (с подтверждением)
  • Активный конфиг (radio button)
  • Автоподключение при старте (Toggle)
  • Kill Switch (Toggle)
  • Таймаут handshake (Input, сек)
  • Информация о текущем подключении:
    - Endpoint
    - Последний handshake
    - Трафик (получено/отправлено)
    - Uptime
  • Кнопки: «Подключить», «Отключить», «Переподключить»

【 РЕШЕНИЕ 11: Метрики VPN — интеграция с Монитором ]

ОБОСНУЙ:
  • На Этапе 11 создан Монитор с графиками трафика
  • Теперь — дополнительно показывать:
    - Трафик через VPN-интерфейс (не весь)
    - Handshake статус
    - Endpoint IP
  • В Dashboard — карточка «VPN» со сводкой

РЕАЛИЗАЦИЯ:
  • Rust: get_vpn_stats() → VpnStats:
    - bytesIn, bytesOut (через wg show)
    - handshake: u64 (Unix ms)
    - endpoint: String
    - interface: String
  • Обновление каждые 2 сек
  • Отображение в VpnSection и в Dashboard

【 РЕШЕНИЕ 12: Индикатор режима в TitleBar ]

ОБОСНУЙ:
  • В TitleBar (Этап 2) — маленький бейдж текущего режима:
    - «DPI» (зелёный) если активна bat-стратегия
    - «VPN» (голубой) если активен VPN
    - «OFF» (серый) если ничего не активно
  • Клик → открывает Dashboard
  • Даёт быстрый обзор

ПОЧЕМУ В TITLEBAR:
  • Всегда на виду
  • Не нужно открывать Dashboard
  • Стандарт для VPN-клиентов (NordVPN, Mullvad)

【 РЕШЕНИЕ 13: Проверка утечек IP (опционально) ]

ОБОСНУЙ:
  • После подключения VPN — проверить, что внешний IP изменился
  • Запрос к ipwho.is (уже есть с Этапа 9)
  • Если IP совпадает с «домашним» — предупреждение «Возможна
    утечка IP»
  • Показывать в VpnSection

ПОЧЕМУ ВАЖНО:
  • Пользователь должен быть уверен, что VPN работает
  • Защита от ошибок

ОПЦИОНАЛЬНО:
  • Если времени мало — отложить на Этап 18

【 РЕШЕНИЕ 14: Fallback при отсутствии WireGuard ]

ОБОСНУЙ:
  • Если WireGuard не установлен — показать в VpnSection
    сообщение:
    «WireGuard не найден. Установите для использования VPN.»
  • Кнопка «Скачать WireGuard» → открывает сайт
  • После установки — кнопка «Проверить снова»

ПОЧЕМУ ВАЖНО:
  • Не все пользователи имеют WireGuard
  • Понятная инструкция вместо ошибки

【 РЕШЕНИЕ 15: Логирование всех операций VPN ]

ОБОСНУЙ:
  • Все действия → логи:
    - «Импортирован конфиг: mullvad-nl.conf»
    - «Переключение на VPN...»
    - «VPN подключён: endpoint 185.65.134.1:51820»
    - «Handshake прошёл за 1.2 сек»
    - «VPN отключён»
    - «Ошибка: WireGuard не найден»
  • В useLogsStore
  • Пользователь видит всё

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/src/commands/vpn.rs (создать) 】
Назначение: управление VPN-туннелями.

Структуры:
  • VpnConfigInfo (Serialize, camelCase):
    - id: String
    - name: String
    - path: String
    - endpoint: String
    - address: String
    - dns: Vec<String>
    - allowedIps: Vec<String>
    - size: u64
    - importedAt: u64
  • VpnStatus (Serialize):
    - state: String ("disconnected" | "connecting" |
      "connected" | "disconnecting" | "error")
    - interface: Option<String>
    - endpoint: Option<String>
    - handshakeAt: Option<u64>
    - bytesIn: Option<u64>
    - bytesOut: Option<u64>
    - uptime: Option<u64>
    - error: Option<String>
  • VpnState:
    - active_config: Arc<Mutex<Option<String>>>
    - active_interface: Arc<Mutex<Option<String>>>
    - wireguard_path: Arc<Mutex<Option<PathBuf>>>
    - is_switching: Arc<AtomicBool>

Команды:
  • detect_wireguard() -> Result<Option<String>, AppError>
    Логика:
    1. Проверить C:\Program Files\WireGuard\wireguard.exe
    2. Проверить реестр HKLM\SOFTWARE\WireGuard
    3. Проверить PATH через which
    4. Вернуть путь или None

  • import_vpn_config(source_path: String)
    -> Result<VpnConfigInfo, AppError>
    Логика:
    1. Прочитать файл
    2. Валидировать (см. validate_wireguard_config)
    3. Скопировать в %APPDATA%/ZapretManager/vpn/configs/
    4. Вернуть VpnConfigInfo

  • list_vpn_configs() -> Result<Vec<VpnConfigInfo>, AppError>
    Логика:
    • Прочитать все .conf в папке
    • Для каждого — распарсить и вернуть

  • delete_vpn_config(id: String) -> Result<(), AppError>
    Логика:
    • Удалить файл
    • Если это активный — отключить VPN

  • validate_wireguard_config(content: String)
    -> Result<ConfigInfo, AppError>
    Логика:
    1. Парсинг INI-структуры:
       [Interface]
       PrivateKey = ...
       Address = 10.0.0.2/32
       DNS = 1.1.1.1
       [Peer]
       PublicKey = ...
       Endpoint = 185.65.134.1:51820
       AllowedIPs = 0.0.0.0/0
    2. Проверка обязательных полей
    3. Вернуть ConfigInfo

  • switch_to_vpn(config_id: String, enable_kill_switch: bool,
    app: AppHandle) -> Result<(), AppError>
    Логика:
    1. Если is_switching → вернуть ошибку
    2. is_switching = true
    3. Emit "vpn-switching" { step: "stopping-dpi" }
    4. Остановить все активные bat-стратегии:
       - Вызвать kill_all_processes из Этапа 6
       - Дождаться завершения (до 5 сек)
    5. Emit "vpn-switching" { step: "starting-vpn" }
    6. wireguard.exe /installtunnelservice "config.conf"
    7. Дождаться появления службы (sc query)
    8. Emit "vpn-switching" { step: "checking-handshake" }
    9. Polling wg show (каждые 500ms, до 15 сек):
       - Парсить latest handshake
       - Если handshake < 60 сек → success
    10. Если enable_kill_switch → enable_kill_switch(...)
    11. Emit "vpn-connected" { configId, endpoint }
    12. is_switching = false
    13. Записать в лог

  • switch_to_dpi(strategy_id: Option<String>, app: AppHandle)
    -> Result<(), AppError>
    Логика:
    1. is_switching = true
    2. Emit "vpn-switching" { step: "stopping-vpn" }
    3. Отключить kill switch (если включён)
    4. wireguard.exe /uninstalltunnelservice "tunnelName"
    5. Дождаться (до 5 сек)
    6. Emit "vpn-switching" { step: "starting-dpi" }
    7. Если strategy_id — запустить через run_strategy
    8. Emit "dpi-connected"
    9. is_switching = false

  • disconnect_vpn(app: AppHandle) -> Result<(), AppError>
    Логика:
    • То же, что switch_to_dpi без запуска DPI

  • get_vpn_status() -> Result<VpnStatus, AppError>
    Логика:
    1. Проверить, есть ли активная служба WireGuard
    2. Если есть — парсить wg show
    3. Вернуть VpnStatus

  • get_vpn_stats() -> Result<VpnStats, AppError>
    • Для периодического обновления (2 сек)
    • Те же данные, что в status, но чаще

  • enable_kill_switch(interface: String) -> Result<(),
    AppError>
    Логика:
    1. netsh advfirewall firewall add rule
       name="ZapretManager KillSwitch Block"
       dir=out action=block
    2. netsh advfirewall firewall add rule
       name="ZapretManager KillSwitch Allow VPN"
       dir=out action=allow
       interface="{interface}"
    3. netsh advfirewall firewall add rule
       name="ZapretManager KillSwitch Allow LAN"
       dir=out action=allow
       remoteip=192.168.0.0/16,10.0.0.0/8,172.16.0.0/12
    Требует admin → UAC через runas

  • disable_kill_switch() -> Result<(), AppError>
    Логика:
    • netsh advfirewall firewall delete rule
      name="ZapretManager KillSwitch Block"
    • То же для остальных

  • is_wireguard_installed() -> Result<bool, AppError>
  • get_wireguard_version() -> Result<String, AppError>

Вспомогательные функции:
  • parse_config(content: &str) -> Result<ConfigInfo,
    AppError>
    - INI-парсер (использовать crate `ini` или вручную)
  • get_tunnel_name(config_path: &str) -> String
    - Из имени файла: "mullvad-nl.conf" → "mullvad-nl"
  • wait_for_handshake(interface: &str, timeout_ms: u64)
    -> Result<HandshakeInfo, AppError>
    - Polling wg show
  • parse_wg_show_output(output: &str) -> HandshakeInfo
    - Regex: latest handshake: (\d+) (second|minute|hour)s? ago
    - transfer: ([\d.]+) (B|KiB|MiB|GiB) received,
      ([\d.]+) ... sent

Требования:
  • Все команды async
  • Все ошибки через AppError
  • UAC при enable_kill_switch
  • Логирование через tracing
  • Никаких unwrap() без обоснования
  • is_switching — AtomicBool для защиты от двойного запуска

【 2. src-tauri/src/commands/mod.rs и lib.rs (обновить) 】
  • pub mod vpn;
  • Зарегистрировать 12+ команд
  • Инициализировать VpnState через .manage()

【 3. src-tauri/Cargo.toml (обновить) 】
Добавить:
  • ini = "0.21.0" (для парсинга .conf)
  • winreg = "0.52.0" (для поиска WireGuard в реестре)

【 4. src/types/vpn.ts (расширить) 】
Дополнить:
  • VpnConfig:
    - id, name, path, endpoint, address, dns, allowedIps,
      size, importedAt
  • VpnStatus:
    - state, interface, endpoint, handshakeAt, bytesIn,
      bytesOut, uptime, error
  • VpnStats
  • SwitchStep — union: "stopping-dpi" | "starting-vpn" |
    "checking-handshake" | "stopping-vpn" | "starting-dpi" |
    "done"

【 5. src/types/settings.ts (обновить) 】
Дополнить VpnSettings:
  • enabled: boolean
  • activeConfigId: string | null
  • autoConnectOnStart: boolean
  • killSwitch: boolean
  • handshakeTimeoutSec: number (по умолчанию 15)
  • lastConnectedAt: number | null

【 6. src/lib/defaults.ts (обновить) 】
DEFAULT_VPN:
  • enabled: false
  • activeConfigId: null
  • autoConnectOnStart: false
  • killSwitch: false
  • handshakeTimeoutSec: 15
  • lastConnectedAt: null

【 7. src/hooks/useVpn.ts (создать) 】
Назначение: React-хук для управления VPN.

Состояние:
  • status: VpnStatus
  • stats: VpnStats | null
  • isSwitching: boolean
  • switchStep: SwitchStep | null
  • error: string | null
  • wireguardInstalled: boolean

Методы:
  • detectWireguard(): Promise<void>
    - invoke("detect_wireguard")
    - setWireguardInstalled(!!result)
  • importConfig(): Promise<VpnConfigInfo | null>
    - dialog.open(.conf)
    - invoke("import_vpn_config")
    - Обновить стор
  • deleteConfig(id: string): Promise<void>
  • switchToVpn(configId: string): Promise<void>
    - setSwitching(true)
    - Подписка на "vpn-switching" → setSwitchStep
    - invoke("switch_to_vpn", { configId,
        enableKillSwitch: settings.vpn.killSwitch })
    - По завершении — setSwitching(false)
  • switchToDpi(strategyId?: string): Promise<void>
  • disconnect(): Promise<void>
  • refreshStatus(): Promise<void>
    - invoke("get_vpn_status")

Подписки (useEffect):
  • listen("vpn-switching", (e) => setSwitchStep(e.payload.step))
  • listen("vpn-connected", (e) => { setStatus("connected");
      addLog(success) })
  • listen("vpn-disconnected", ...)
  • listen("vpn-error", ...)
  • Cleanup

Возвращает:
  • { status, stats, isSwitching, switchStep, error,
    wireguardInstalled, detectWireguard, importConfig,
    deleteConfig, switchToVpn, switchToDpi, disconnect,
    refreshStatus }

【 8. src/hooks/useVpnStats.ts (создать) 】
Назначение: периодическое обновление метрик VPN.

Логика:
  • setInterval 2 сек
  • Только если status.state === "connected"
  • invoke("get_vpn_stats")
  • Обновить состояние
  • Cleanup

【 9. src/stores/useVpnStore.ts (переработать) 】
Уже создан на Этапе 4, но был минимальным.

Дополнить:
  • configs: VpnConfigInfo[]
  • activeConfigId: string | null
  • status: VpnStatus
  • stats: VpnStats | null
  • isSwitching: boolean
  • switchStep: SwitchStep | null
  • wireguardInstalled: boolean

Методы:
  • setConfigs, addConfig, removeConfig
  • setActiveConfig
  • setStatus, setStats
  • setSwitching, setSwitchStep
  • setWireguardInstalled

Селекторы:
  • useVpnActive — bool
  • useVpnConfigs — list
  • useActiveVpnConfig — VpnConfigInfo | undefined
  • useVpnSwitching — bool

【 10. src/components/dashboard/VpnToggle.tsx (переработать) 】
Заглушка с Этапа 9 → рабочая версия.

Props: нет (использует useVpn + useStrategyRunner).

Логика:
  • Определить текущий режим:
    - Если активна bat-стратегия → "dpi"
    - Если VPN подключён → "vpn"
    - Если ничего → null
  • При клике на "VPN" → switchToVpn(activeConfigId)
  • При клике на "DPI" → switchToDpi(lastStrategyId)
  • Если конфиг не выбран → открыть модалку выбора

Рендер:
  • Большой тумблер 240x80
  • Две иконки: Zap (слева), Lock (справа)
  • Thumb через layoutId
  • Подписи под тумблером
  • При переключении — спиннер + switchStep текст
  • Disabled при isSwitching

【 11. src/components/vpn/VpnConfigCard.tsx (создать) 】
Назначение: карточка VPN-конфига.

Props:
  • config: VpnConfigInfo
  • isActive: boolean
  • onSelect: () => void
  • onDelete: () => void

Рендер:
  • Название
  • Endpoint
  • Address
  • Размер файла
  • Radio button (выбор активного)
  • Кнопка удаления (Trash)

【 12. src/components/vpn/VpnConfigList.tsx (создать) 】
Назначение: список конфигов.

Props: нет (использует useVpnStore).

Рендер:
  • Если пусто → EmptyState с кнопкой «Импорт»
  • Список VpnConfigCard
  • Кнопка «+ Импорт конфига» сверху

【 13. src/components/vpn/VpnStatusCard.tsx (создать) 】
Назначение: карточка статуса VPN.

Props:
  • status: VpnStatus
  • stats: VpnStats | null

Рендер:
  • Большой статус: «Подключено» / «Отключено» / «Ошибка»
  • Endpoint (если подключено)
  • Handshake: «5 секунд назад»
  • Трафик: 1.2 MB / 340 KB
  • Uptime: 00:15:23
  • Кнопки: Подключить / Отключить / Переподключить

【 14. src/components/vpn/VpnKillSwitchWarning.tsx (создать) 】
Назначение: предупреждение при включении Kill Switch.

Рендер:
  • Modal confirm с текстом:
    «Kill Switch блокирует весь интернет-трафик при разрыве
    VPN. Это защитит от утечек, но при проблемах с VPN вы
    останетесь без интернета. Продолжить?»
  • Кнопки: Отмена / Включить

【 15. src/components/vpn/WireguardNotInstalled.tsx (создать) 】
Назначение: сообщение, если WireGuard не найден.

Рендер:
  • Icon AlertTriangle (amber)
  • Текст: «WireGuard не найден в системе. Установите его
    для использования VPN-режима.»
  • Кнопка «Скачать WireGuard» → открывает
    https://www.wireguard.com/install/
  • Кнопка «Проверить снова» → detectWireguard()

【 16. src/components/vpn/VpnImportButton.tsx (создать) 】
Назначение: кнопка импорта .conf.

Props:
  • onImport: () => void
  • disabled?: boolean

Рендер:
  • Button secondary, icon Upload
  • Текст: «Импорт конфига (.conf)»

【 17. src/components/settings/VpnSection.tsx (переработать) 】
Заглушка с Этапа 13 → полная версия.

Структура:
  • Если WireGuard не установлен → WireguardNotInstalled
  • Иначе:
    - VpnConfigList (список конфигов)
    - VpnImportButton
    - Toggle «Автоподключение при старте»
    - Toggle «Kill Switch» (с предупреждением)
    - Input «Таймаут handshake (сек)» (5–60)
    - VpnStatusCard (текущее состояние)
    - Кнопки: Подключить / Отключить / Переподключить

【 18. src/components/layout/TitleBar.tsx (обновить) 】
Добавить индикатор режима:
  • Справа (перед кнопками окна):
    - Badge «DPI» (accent-primary) если активна bat-стратегия
    - Badge «VPN» (accent-secondary) если активен VPN
    - Badge «OFF» (neutral) если ничего не активно
  • Клик → открывает Dashboard

【 19. src/components/dashboard/DashboardHero.tsx (обновить) 】
Дополнить:
  • Если VPN активен → показывать «VPN: Mullvad NL» вместо
    названия стратегии
  • Иконка Lock (вместо Shield)
  • Счётчик байт через VPN

【 20. src/pages/Dashboard.tsx (обновить) 】
Дополнить:
  • Использовать рабочий VpnToggle
  • Если switchStep — показывать прогресс

【 21. src/hooks/useStrategyRunner.ts (обновить) 】
Интегрировать взаимоисключение:
  • Перед run_strategy — если VPN активен:
    - Вызвать switch_to_dpi(strategyId)
    - Не вызывать run_strategy напрямую
  • Перед switchToVpn — если bat-стратегия активна:
    - Вызвать switch_to_vpn (внутри он сам остановит)

【 22. src/hooks/useAutoVpnConnect.ts (создать) 】
Назначение: автоподключение VPN при старте.

Логика:
  • useEffect при mount
  • Если settings.vpn.autoConnectOnStart && activeConfigId:
    - setTimeout 5 сек → switchToVpn(activeConfigId)
  • Cleanup

【 23. src/lib/constants.ts (обновить) 】
Добавить:
  • VPN_CONFIGS_DIR = "vpn/configs"
  • VPN_HANDSHAKE_TIMEOUT_DEFAULT = 15
  • VPN_HANDSHAKE_POLL_INTERVAL_MS = 500
  • VPN_STATS_INTERVAL_MS = 2000
  • VPN_SWITCH_WAIT_MS = 5000
  • WIREGUARD_DOWNLOAD_URL = "https://www.wireguard.com/install/"
  • KILL_SWITCH_RULE_PREFIX = "ZapretManager KillSwitch"

【 24. src/lib/vpnUtils.ts (создать) 】
Назначение: утилиты для VPN.

Функции:
  • formatHandshakeTime(timestamp: number | null): string
    - «5 секунд назад» / «2 минуты назад» / «Никогда»
  • formatVpnState(state: string): string
    - Перевод состояний на русский
  • getVpnStateColor(state: string): string
  • parseEndpoint(endpoint: string): { host, port }
  • formatUptime(seconds: number): string

【 25. src-tauri/src/commands/vpn_tests.rs (создать) 】
Тесты:
  • test_parse_wireguard_config — валидный конфиг
  • test_parse_invalid_config — без [Interface]
  • test_parse_wg_show_output — парсинг handshake
  • test_get_tunnel_name — из имени файла
  • test_kill_switch_rules_format — формирование netsh-команд

【 26. src-tauri/capabilities/default.json (обновить) 】
Убедиться, что разрешены:
  • shell:allow-execute (для wireguard.exe)
  • shell:allow-open (для ссылки на сайт WG)
  • fs:allow-read-text-file, fs:allow-write-text-file
  • dialog:allow-open
  • core:event:default

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Добавить зависимости
  • Cargo: ini, winreg
  • Обновить capabilities

ШАГ 2: Создать vpn.rs в Rust
  • Структуры VpnConfigInfo, VpnStatus, VpnState
  • 12+ команд
  • Вспомогательные функции (parse_config, wait_for_handshake,
    parse_wg_show_output)

ШАГ 3: Зарегистрировать команды
  • commands/mod.rs
  • lib.rs
  • Инициализировать VpnState через .manage()

ШАГ 4: Расширить типы
  • src/types/vpn.ts — VpnConfig, VpnStatus, VpnStats,
    SwitchStep
  • src/types/settings.ts — VpnSettings
  • src/lib/defaults.ts — DEFAULT_VPN

ШАГ 5: Переработать useVpnStore
  • Полное состояние + методы
  • Селекторы

ШАГ 6: Создать useVpn
  • Все методы + подписки на 4 события
  • Cleanup

ШАГ 7: Создать useVpnStats
  • Интервал 2 сек

ШАГ 8: Создать useAutoVpnConnect
  • Автоподключение

ШАГ 9: Создать vpnUtils.ts
  • formatHandshakeTime, formatVpnState, getVpnStateColor,
    parseEndpoint, formatUptime

ШАГ 10: Создать VpnConfigCard
  • Карточка конфига

ШАГ 11: Создать VpnConfigList
  • Список конфигов

ШАГ 12: Создать VpnStatusCard
  • Статус + метрики

ШАГ 13: Создать VpnKillSwitchWarning
  • Modal confirm

ШАГ 14: Создать WireguardNotInstalled
  • Сообщение + ссылка

ШАГ 15: Создать VpnImportButton
  • Кнопка импорта

ШАГ 16: Переработать VpnToggle
  • Рабочий тумблер в Dashboard

ШАГ 17: Переработать VpnSection
  • Полная версия

ШАГ 18: Обновить TitleBar
  • Бейдж режима (DPI/VPN/OFF)

ШАГ 19: Обновить DashboardHero
  • Показывать VPN-статус

ШАГ 20: Обновить Dashboard
  • Использовать рабочий VpnToggle

ШАГ 21: Обновить useStrategyRunner
  • Взаимоисключение с VPN

ШАГ 22: Обновить constants.ts
  • Константы VPN

ШАГ 23: Написать unit-тесты (Rust)
  • 5+ тестов
  • cargo test — зелёные

ШАГ 24: Финальная проверка
  • pnpm tauri dev — запускается
  • Импорт .conf работает
  • Переключение DPI ↔ VPN работает
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • cargo test — зелёные
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 RUST — TYPE SAFETY 】
  □ VpnConfigInfo, VpnStatus, VpnStats с serde camelCase
  □ Все ошибки через AppError
  □ Никаких unwrap() без обоснования
  □ VpnState с Arc<Mutex> для потокобезопасности

【 RUST — ASYNC 】
  □ Все команды async
  □ switch_to_vpn и switch_to_dpi — атомарные
  □ is_switching — AtomicBool для защиты от двойного
  □ Не блокировать runtime
  □ Mutex не держится через await

【 RUST — ЛОГИКА 】
  □ detect_wireguard работает (файл + реестр + PATH)
  □ import_vpn_config валидирует перед копированием
  □ list_vpn_configs парсит все .conf
  □ switch_to_vpn останавливает DPI перед запуском VPN
  □ switch_to_dpi останавливает VPN перед запуском DPI
  □ wait_for_handshake polling 500ms до 15 сек
  □ parse_wg_show_output корректно парсит
  □ enable_kill_switch создаёт 3 правила
  □ disable_kill_switch удаляет все правила
  □ UAC при enable_kill_switch

【 RUST — ТЕСТЫ 】
  □ 5+ тестов
  □ Все зелёные
  □ Покрывают edge cases

【 FRONTEND — HOOKS 】
  □ useVpn: все методы + подписки
  □ useVpnStats: интервал 2 сек
  □ useAutoVpnConnect: автоподключение
  □ Cleanup всех listeners

【 FRONTEND — STORE 】
  □ useVpnStore с полным состоянием
  □ Селекторы useVpnActive, useVpnConfigs,
    useActiveVpnConfig, useVpnSwitching

【 FRONTEND — UI 】
  □ VpnToggle: рабочий тумблер в Dashboard
  □ VpnConfigCard: карточка конфига
  □ VpnConfigList: список + импорт
  □ VpnStatusCard: статус + метрики
  □ VpnKillSwitchWarning: Modal confirm
  □ WireguardNotInstalled: сообщение + ссылка
  □ VpnImportButton: кнопка импорта
  □ VpnSection: полная версия
  □ TitleBar: бейдж режима
  □ DashboardHero: VPN-статус

【 UX 】
  □ Импорт .conf работает (валидация)
  □ Переключение DPI → VPN: сначала стоп DPI, потом VPN
  □ Переключение VPN → DPI: сначала стоп VPN, потом DPI
  □ Прогресс-шаги видны пользователю
  □ Handshake проверяется
  □ Kill Switch с предупреждением
  □ WireGuard не найден → понятное сообщение
  □ Автоподключение работает
  □ Метрики обновляются
  □ Ошибки понятны

【 ВЗАИМОИСКЛЮЧЕНИЕ 】
  □ Нельзя одновременно DPI + VPN
  □ switch_to_vpn останавливает bat-стратегии
  □ switch_to_dpi отключает VPN
  □ Ждать завершения (5 сек)
  □ Race condition защищён через is_switching

【 KILL SWITCH 】
  □ По умолчанию выключен
  □ Предупреждение при включении
  □ Требует admin (UAC)
  □ 3 правила создаются
  □ При отключении VPN — правила удаляются
  □ Проверено на реальном разрыве (вручную)

【 ПРОИЗВОДИТЕЛЬНОСТЬ 】
  □ Переключение DPI ↔ VPN < 20 сек
  □ Handshake < 15 сек
  □ Метрики обновляются без тормозов
  □ Polling не грузит CPU

【 ДОСТУПНОСТЬ 】
  □ aria-label на иконках
  □ focus-visible
  □ Tab-навигация
  □ Контраст ≥4.5:1

【 CODE QUALITY 】
  □ Нет мёртвого кода
  □ Нет console.log
  □ Функции <50 строк
  □ Файлы <300 строк
  □ Комментариев в коде нет (правило проекта)

【 BUILD 】
  □ pnpm tauri dev — запускается
  □ pnpm tsc --noEmit — 0 ошибок
  □ cargo check — 0 warning'ов
  □ cargo test — зелёные
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: WireGuard не найден, но установлен
  ПРИЧИНА: нестандартный путь установки.
  ЧТО ПРОВЕРИТЬ: реестр HKLM\SOFTWARE\WireGuard\InstallDir.
    Fallback — поиск в PATH. Fallback — диалог выбора пути.

ГИПОТЕЗА 2: wg.exe не найден
  ПРИЧИНА: wireguard-tools не установлены отдельно.
  ЧТО ПРОВЕРИТЬ: fallback на проверку через PowerShell:
    Get-NetAdapter | Where-Object Name -like "*tunnel*"
    Или sc query.

ГИПОТЕЗА 3: Handshake не проходит
  ПРИЧИНА: сервер недоступен, неверный конфиг.
  ЧТО ПРОВЕРИТЬ: логи wg show, ошибка с понятным сообщением.
    Показать endpoint.

ГИПОТЕЗА 4: Kill Switch ломает интернет полностью
  ПРИЧИНА: неправильное правило.
  ЧТО ПРОВЕРИТЬ: тест на реальном использовании. Правила
    должны разрешать LAN + VPN-интерфейс.

ГИПОТЕЗА 5: switch_to_vpn зависает на «stopping-dpi»
  ПРИЧИНА: процесс не убивается.
  ЧТО ПРОВЕРИТЬ: таймаут 5 сек, force kill если не
    завершился.

ГИПОТЕЗА 6: Конфликт WireGuard + zapret драйверов
  ПРИЧИНА: WinDivert и WFP.
  ЧТО ПРОВЕРИТЬ: реальное переключение. Если BSOD — вернуть
    последовательность (DPI стоп → 2 сек пауза → VPN).

ГИПОТЕЗА 7: UAC при enable_kill_switch не показывается
  ПРИЧИНА: netsh вызывается без runas.
  ЧТО ПРОВЕРИТЬ: ShellExecuteEx с runas (как в Этапе 6).

ГИПОТЕЗА 8: Импорт .conf падает на невалидном файле
  ПРИЧИНА: нет валидации.
  ЧТО ПРОВЕРИТЬ: parse_config проверяет все обязательные
    поля.

ГИПОТЕЗА 9: Метрики показывают 0
  ПРИЧИНА: парсинг wg show сломан.
  ЧТО ПРОВЕРИТЬ: unit-тест на реальном выводе wg show.

ГИПОТЕЗА 10: При переключении UI зависает
  ПРИЧИНА: switch синхронный.
  ЧТО ПРОВЕРИТЬ: async + emit событий на каждом шаге.

ГИПОТЕЗА 11: VPN-интерфейс не удаляется после disconnect
  ПРИЧИНА: uninstalltunnelservice не сработал.
  ЧТО ПРОВЕРИТЬ: доп. вызов sc delete + проверка.

ГИПОТЕЗА 12: Импорт .conf с кириллицей в имени
  ПРИЧИНА: неправильная кодировка.
  ЧТО ПРОВЕРИТЬ: использовать UTF-8, проверить на
    "мой-конфиг.conf".

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

ПОДГОТОВКА:
  • Установить WireGuard for Windows (если нет)
  • Подготовить 2 .conf файла (например, с mullvad.net
    free config или своим сервером)

1. Запустить pnpm tauri dev

2. Перейти в Settings → VPN
   ОЖИДАНИЕ:
   • Если WG установлен → список конфигов (пуст)
   • Если нет → сообщение «WireGuard не найден»

3. Если WG нет — клик «Скачать WireGuard»
   ОЖИДАНИЕ: открывается сайт

4. Установить WG, вернуться, клик «Проверить снова»
   ОЖИДАНИЕ: список конфигов появляется

5. Клик «Импорт конфига» → выбрать .conf
   ОЖИДАНИЕ:
   • Конфиг добавлен в список
   • Показаны endpoint, address

6. Импортировать невалидный файл (.txt с мусором)
   ОЖИДАНИЕ: ошибка «Невалидный WireGuard конфиг»

7. Импортировать второй .conf
   ОЖИДАНИЕ: 2 конфига в списке

8. Выбрать первый (radio)
   ОЖИДАНИЕ: активный конфиг выбран

9. Клик «Подключить»
   ОЖИДАНИЕ:
   • UAC (если kill switch включён — иначе нет)
   • Прогресс: «Запуск VPN» → «Проверка handshake»
   • Через 2–5 сек: статус «Подключено»
   • Показан endpoint
   • Показан handshake «2 секунды назад»
   • Метрики: байты растут

10. Открыть браузер → проверить IP
    ОЖИДАНИЕ: IP изменился на VPN-IP

11. Перейти в Dashboard
    ОЖИДАНИЕ:
    • VpnToggle справа (VPN)
    • DashboardHero: «VPN: [имя конфига]»
    • Иконка Lock

12. Проверить TitleBar
    ОЖИДАНИЕ: Badge «VPN» (голубой)

13. Запустить bat-стратегию в Strategies
    ОЖИДАНИЕ:
    • Прогресс: «Остановка VPN» → «Запуск DPI»
    • Через 5–8 сек: стратегия запущена
    • VPN отключён
    • TitleBar Badge: «DPI»

14. Переключиться обратно на VPN через тумблер в Dashboard
    ОЖИДАНИЕ: прогресс, затем VPN подключён

15. Включить Kill Switch в Settings → VPN
    ОЖИДАНИЕ:
    • Modal с предупреждением
    • UAC
    • После подтверждения — kill switch активен

16. Отключить VPN вручную (не через переключение)
    ОЖИДАНИЕ:
    • Kill switch блокирует весь интернет
    • Браузер не открывает сайты
    • Правила видны в netsh advfirewall firewall show rule

17. Выключить Kill Switch
    ОЖИДАНИЕ: интернет вернулся

18. Проверить автоподключение:
    • Включить «Автоподключение при старте»
    • Закрыть приложение
    • Открыть
    ОЖИДАНИЕ: через 5 сек VPN подключается

19. Перезагрузить компьютер (если возможно)
    ОЖИДАНИЕ: VPN подключён после загрузки (если
    autostart + autoConnect)

20. Проверить метрики:
    • Скачать файл через VPN
    ОЖИДАНИЕ: байты растут, скорость видна

21. Проверить logs
    ОЖИДАНИЕ: все операции VPN в логах

22. Тест ошибки:
    • Взять нерабочий конфиг (недоступный endpoint)
    • Подключить
    ОЖИДАНИЕ:
    • Handshake timeout через 15 сек
    • Ошибка «Handshake не прошёл за 15 секунд»
    • Status → error
    • Логи с деталями

23. Тест параллельного запуска:
    • Запустить switch_to_vpn дважды подряд
    ОЖИДАНИЕ: второй вызов игнорируется (is_switching)

24. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

25. cargo check
    ОЖИДАНИЕ: 0 warning'ов

26. cargo test
    ОЖИДАНИЕ: все зелёные

27. Открыть Task Manager → RAM
    ОЖИДАНИЕ: <350 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать any
❌ Не запускать VPN и DPI одновременно
❌ Не переключать без ожидания завершения (5 сек)
❌ Не включать Kill Switch без предупреждения
❌ Не включать Kill Switch без UAC
❌ Не использовать unwrap() в Rust
❌ Не дёргать wg show слишком часто (не чаще 500ms)
❌ Не хранить .conf в папке стратегий
❌ Не удалять активный конфиг без отключения VPN
❌ Не забывать cleanup listeners
❌ Не забывать is_switching AtomicBool
❌ Не забывать про кириллические пути
❌ Не забывать про валидацию .conf
❌ Не забывать про UAC при kill switch
❌ Не забывать про fallback, если WireGuard не найден
❌ Не забывать про взаимоисключение в useStrategyRunner
❌ Не начинать Этап 15 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 14 завершён, если ВСЕ пункты выполнены:

✅ vpn.rs с 12+ командами
✅ detect_wireguard работает
✅ import_vpn_config с валидацией
✅ list_vpn_configs
✅ delete_vpn_config
✅ switch_to_vpn (останавливает DPI)
✅ switch_to_dpi (останавливает VPN)
✅ disconnect_vpn
✅ get_vpn_status, get_vpn_stats
✅ enable_kill_switch, disable_kill_switch
✅ parse_config, wait_for_handshake,
   parse_wg_show_output
✅ 5+ unit-тестов проходят
✅ useVpnStore с полным состоянием
✅ useVpn: все методы + 4 подписки
✅ useVpnStats: интервал 2 сек
✅ useAutoVpnConnect
✅ vpnUtils.ts
✅ VpnConfigCard, VpnConfigList
✅ VpnStatusCard
✅ VpnKillSwitchWarning
✅ WireguardNotInstalled
✅ VpnImportButton
✅ VpnToggle: рабочий тумблер
✅ VpnSection: полная версия
✅ TitleBar: бейдж DPI/VPN/OFF
✅ DashboardHero: VPN-статус
✅ useStrategyRunner: взаимоисключение
✅ Переключение DPI → VPN < 20 сек
✅ Переключение VPN → DPI < 20 сек
✅ Handshake < 15 сек
✅ Kill Switch работает (проверено)
✅ Автоподключение работает
✅ Метрики обновляются
✅ Ошибки понятны
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ cargo test — зелёные
✅ Консоль чистая
✅ RAM <350 MB
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 15
═══════════════════════════════════════════════════════════════════════

После Этапа 14 у нас есть:
  • Полноценное переключение DPI ↔ VPN
  • Импорт/удаление WireGuard-конфигов
  • Handshake проверка
  • Kill Switch через Windows Firewall
  • Автоподключение
  • Метрики VPN (байты, handshake, uptime)
  • Большой тумблер в Dashboard
  • Бейдж режима в TitleBar
  • Взаимоисключение DPI ↔ VPN
  • Готовность к Этапу 15

На Этапе 15 нужно будет:
  • Создать профессиональный системный трей
  • 5 состояний иконки (idle, connecting, connected, vpn,
    error)
  • Анимации иконки (пульсация, мигание)
  • Контекстное меню с динамическими пунктами
  • Быстрые действия (лево/право/средний клик)
  • Уведомления (при старте, ошибке, обновлении)
  • Настройки трея
  • Минимизация в трей при закрытии

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 14 — СТОП.

Не начинай Этап 15. Не создавай системный трей, не добавляй
5 состояний иконки, не делай контекстное меню с быстрыми
действиями.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 15
  • "Правка: ..." — правка в Этап 14
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.