═══════════════════════════════════════════════════════════════════════
ЭТАП 4: ТИПЫ ДАННЫХ И ZUSTAND-СТОР
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Определить полную доменную модель приложения (TypeScript-типы
для Strategy, LogEntry, AppSettings, ServiceType, StrategyStatus,
VPNConfig и других сущностей) и реализовать Zustand-стор с
бизнес-логикой: добавление/удаление/обновление стратегий,
логирование, настройки, статус подключения, активная стратегия.

После этого этапа у нас будет:
  • Единый источник правды для всех данных приложения
  • Типизированные модели, которые используются в UI и Rust
  • Стор с селекторами (без лишних ре-рендеров)
  • Персистентность настроек в localStorage и в файл через Tauri
  • Моковые данные для разработки UI до подключения Rust

Это фундамент данных. Если типы неправильные — весь UI придётся
переписывать на Этапах 5–17. Поэтому здесь НЕЛЬЗЯ торопиться.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Типы в src/types/ с barrel export 】

ОБОСНУЙ:
  • Все доменные типы — в одном месте (src/types/)
  • Разделение на файлы: strategy.ts, log.ts, settings.ts,
    vpn.ts, index.ts
  • index.ts реэкспортирует всё — импорт через "@/types"
  • Типы максимально точно описывают реальные данные
  • Union-типы вместо boolean-флагов где возможно
  • readonly для полей, которые не должны мутироваться

ПОЧЕМУ НЕ ТИПЫ INLINE В КОМПОНЕНТАХ:
  • Дублирование
  • Сложно синхронизировать с Rust-типами
  • Нет единого контракта

【 РЕШЕНИЕ 2: Zustand + Immer middleware для мутаций 】

ОБОСНУЙ:
  • Zustand — минимальный бойлерплейт, работает вне React
  • Immer middleware позволяет писать «мутации» как в Redux
    Toolkit, но под капотом — иммутабельность
  • Пример: set((state) => { state.strategies.push(s) })
    вместо set((state) => ({ strategies: [...state.strategies, s] }))
  • Меньше ошибок при работе с вложенными объектами
  • Размер: +3 KB — приемлемо

ПОЧЕМУ НЕ БЕЗ IMMER:
  • Много кода для обновления вложенных полей
  • Легко забыть «развернуть» массив → баг с мутацией

ПОЧЕМУ НЕ БЕЗ ZUSTAND (чистый React Context):
  • Context вызывает ре-рендер всех подписчиков
  • Нет селекторов без библиотек
  • Нет persist middleware

【 РЕШЕНИЕ 3: Разделение сторов по доменам 】

ОБОСНУЙ:
  • useAppStore — UI-состояние (activePage, sidebar, статус)
    уже создан на Этапе 2
  • useStrategiesStore — бизнес-логика стратегий (список,
    активная, статусы)
  • useLogsStore — отдельно для логов (важно: логи обновляются
    очень часто, нельзя смешивать с основным стором, иначе
    будут ре-рендеры всего приложения)
  • useSettingsStore — настройки приложения
  • useVpnStore — состояние VPN (подключён, конфиг, статус)

ПОЧЕМУ НЕ ОДИН БОЛЬШОЙ СТОР:
  • Логи обновляются десятки раз в секунду → если смешать
    с UI, каждое обновление лога ре-рендерит всё
  • Разделение = точечные подписки = плавность

ПОЧЕМУ НЕ REDUX TOOLKIT:
  • Избыточен для десктоп-приложения
  • +40 KB в бандл
  • Больше бойлерплейта

【 РЕШЕНИЕ 4: Persist middleware для настроек, НЕ для стратегий 】

ОБОСНУЙ:
  • Настройки (папка, тема, автозапуск, VPN-конфиг) — persist
    в localStorage И в файл через Tauri fs
  • Стратегии — НЕ persist (они всегда сканируются из папки
    на Этапе 5)
  • Логи — НЕ persist (сессионные)
  • UI-состояние (activePage, sidebarCollapsed) — persist
    в localStorage (уже сделано)

ПОЧЕМУ ФАЙЛ + LOCALSTORAGE:
  • localStorage — для мгновенного доступа при запуске
  • Файл — для бэкапа, синхронизации, ручной правки
  • Файл = источник правды, localStorage = кэш

【 РЕШЕНИЕ 5: Селекторы для точечных подписок 】

ОБОСНУЙ:
  • В компонентах использовать useStrategiesStore(s => s.strategies),
    а не useStrategiesStore() целиком
  • Кастомные селекторы в src/stores/selectors/ для сложных
    вычислений
  • Для вычисляемых значений — использовать useShallow или
    computed в стор

ПОЧЕМУ НЕ ПОДПИСКА НА ВЕСЬ СТОР:
  • Любое изменение → ре-рендер всех подписчиков
  • Просадка FPS при частых обновлениях (логи, статус)

【 РЕШЕНИЕ 6: Mock-данные для разработки 】

ОБОСНУЙ:
  • До Этапа 5 (Rust: сканер .bat) UI нужны данные для отладки
  • Создать src/stores/mocks/ с моковыми стратегиями
  • Включить через env-флаг VITE_USE_MOCKS=true (только dev)
  • В production моки отключаются автоматически
  • Позволяет разрабатывать UI параллельно с Rust

ПОЧЕМУ В ОТДЕЛЬНОЙ ПАПКЕ:
  • Легко удалить на финале
  • Не смешивается с реальным кодом
  • Можно включать/выключать без правок

【 РЕШЕНИЕ 7: Сериализация типов между Rust и TypeScript 】

ОБОСНУЙ:
  • Rust-структуры сериализуются через serde в JSON
  • TypeScript-типы должны точно соответствовать
  • Правила: snake_case в Rust → camelCase в TS (или наоборот)
  • Решение: использовать camelCase и в Rust через
    #[serde(rename_all = "camelCase")] на структурах
  • Иначе — писат ь конвертеры, что чревато ошибками

ПОЧЕМУ НЕ Автоматическая Генерация (ts-rs, typeshare):
  • Можно, но +сложность настройки
  • Для 5–6 типов — избыточно
  • Ручная синхронизация проще контролировать

【 РЕШЕНИЕ 8: Логи в отдельном сторе с буфером ]

ОБОСНУЙ:
  • Логи — самый «горячий» поток данных
  • Буфер: max 10 000 строк в памяти
  • При превышении — самые старые удаляются
  • Добавление логов — через throttle/батчинг (каждые 100ms
    или по 50 записей — что раньше)
  • UI читает через виртуализацию (Этап 7)

ПОЧЕМУ БАТЧИНГ:
  • Если стратегия выдаёт 1000 логов в секунду — это 1000
    ре-рендеров без батчинга. С батчингом — 10.
  • Без батчинга — UI умрёт.

【 РЕШЕНИЕ 9: Статус подключения — computed из состояния стратегий ]

ОБОСНУЙ:
  • Не хранить connectionStatus отдельно
  • Вычислять из: активная стратегия running? VPN активен?
  • Селектор: selectConnectionStatus(state) → "connected" |
    "disconnected" | "connecting" | "vpn"
  • Единый источник правды — состояние стратегий/VPN

ПОЧЕМУ НЕ ХРАНИТЬ ОТДЕЛЬНО:
  • Два источника правды → рассинхронизация
  • Легко забыть обновить статус при смене стратегии

【 РЕШЕНИЕ 10: Тип Strategy с нормализованными сервисами 】

ОБОСНУЙ:
  • services: ServiceType[] вместо boolean-флагов
    (hasDiscord, hasYouTube, ...)
  • Легко добавить новый сервис — один union
  • UI итерирует по массиву — динамические бейджи
  • Соответствует реальности: одна стратегия может обходить
    сразу несколько сервисов

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src/types/strategy.ts 】
Назначение: типы, связанные со стратегиями.

Типы:
  • ServiceType — union: "discord" | "youtube" |
    "outlast-trials" | "general"
  • StrategyStatus — union: "idle" | "running" | "error" |
    "stopped" | "starting" | "stopping"
  • StrategyFileType — union: "winws" | "goodbye-dpi" |
    "zapret" | "unknown"
  • Strategy — основной интерфейс:
    - id: string (nanoid)
    - name: string (например, "Discord + YouTube")
    - filename: string ("discord_youtube.bat")
    - path: string (полный путь)
    - description: string
    - services: ServiceType[]
    - fileType: StrategyFileType
    - status: StrategyStatus
    - lastRun?: Date (или string ISO)
    - pid?: number
    - error?: string
    - version?: string (версия zapret)
  • StrategyInput — тип для создания (без id, status, pid)
  • StrategyFilter — для фильтрации списка:
    - services?: ServiceType[]
    - status?: StrategyStatus[]
    - search?: string

【 2. src/types/log.ts 】
Назначение: типы для логов.

Типы:
  • LogLevel — union: "info" | "warn" | "error" | "success" |
    "debug"
  • LogSource — union: "system" | "strategy" | "user" | "vpn"
  • LogEntry — интерфейс:
    - id: string (nanoid)
    - timestamp: number (Unix ms — быстрее, чем Date)
    - level: LogLevel
    - source: LogSource
    - message: string
    - strategyId?: string (к какой стратегии относится)
    - metadata?: Record<string, unknown>
  • LogFilter — для фильтрации:
    - levels?: LogLevel[]
    - sources?: LogSource[]
    - strategyId?: string
    - search?: string

【 3. src/types/settings.ts 】
Назначение: типы настроек приложения.

Типы:
  • ThemeMode — union: "dark" | "light" | "auto"
  • Language — union: "ru" | "en"
  • UpdateChannel — union: "stable" | "beta" | "nightly"
  • AppSettings — интерфейс:
    - strategiesFolder: string (путь к папке с .bat)
    - autoStart: boolean (автозапуск при старте Windows)
    - minimizeToTray: boolean (сворачивать в трей)
    - startMinimized: boolean (стартовать свёрнутым)
    - showNotifications: boolean
    - animateTrayIcon: boolean
    - theme: ThemeMode
    - language: Language
    - loggingLevel: LogLevel (минимальный уровень для записи)
    - autoUpdate: boolean (проверять обновления при старте)
    - updateChannel: UpdateChannel
    - outlastTrials: OutlastTrialsSettings
    - vpn: VpnSettings
    - advanced: AdvancedSettings
  • OutlastTrialsSettings:
    - enabled: boolean
    - domains: string[] (домены игры)
    - ipRanges: string[] (CIDR-диапазоны)
    - ports: number[]
  • VpnSettings:
    - enabled: boolean
    - provider: "amnezia" | "wireguard" | "openvpn"
    - configPath: string (путь к .conf)
    - autoConnect: boolean
    - killSwitch: boolean (блокировать трафик при разрыве)
  • AdvancedSettings:
    - winwsExtraArgs: string[] (доп. аргументы для winws)
    - checkUpdatesInterval: number (часы)
    - logRetentionDays: number

【 4. src/types/vpn.ts 】
Назначение: типы для VPN.

Типы:
  • VpnProvider — union: "amnezia" | "wireguard" | "openvpn"
  • VpnStatus — union: "disconnected" | "connecting" |
    "connected" | "disconnecting" | "error"
  • VpnConfig — интерфейс:
    - id: string
    - name: string
    - provider: VpnProvider
    - configPath: string
    - endpoint?: string (IP:port)
    - lastConnected?: number
  • VpnConnectionState:
    - status: VpnStatus
    - configId?: string
    - connectedAt?: number
    - bytesIn?: number
    - bytesOut?: number
    - error?: string

【 5. src/types/update.ts 】
Назначение: типы для проверки обновлений.

Типы:
  • UpdateInfo — интерфейс:
    - available: boolean
    - currentVersion: string
    - latestVersion: string
    - releaseNotes?: string
    - publishedAt?: string
    - downloadUrl?: string
    - size?: number (байты)
    - mandatory?: boolean
  • UpdateStatus — union: "idle" | "checking" | "available" |
    "downloading" | "ready" | "error"
  • DownloadProgress:
    - downloaded: number
    - total: number
    - percent: number

【 6. src/types/index.ts 】
Barrel export всех типов.
Импорт через "@/types" работает.

【 7. src/stores/useStrategiesStore.ts 】
Назначение: бизнес-логика стратегий.

Состояние:
  • strategies: Strategy[]
  • activeStrategyId: string | null
  • loading: boolean
  • error: string | null
  • lastScanAt: number | null

Методы (через Immer):
  • setStrategies(strategies: Strategy[]) — заменить весь список
  • addStrategy(input: StrategyInput) — добавить с nanoid
  • updateStrategy(id, patch: Partial<Strategy>)
  • removeStrategy(id)
  • setActiveStrategy(id | null) — с проверкой, что
    предыдущая останавливается
  • setStatus(id, status: StrategyStatus)
  • setPid(id, pid?: number)
  • setError(id, error?: string)
  • setLoading(loading: boolean)
  • setError(error: string | null)
  • clearAll() — сброс

Селекторы (в том же файле или отдельно):
  • selectStrategyById(id) — возвращает Strategy | undefined
  • selectActiveStrategy() — активная
  • selectRunningStrategies() — все со статусом "running"
  • selectStrategiesByService(service: ServiceType) — фильтр
  • selectStrategiesCount() — количество

Требования:
  • Persist НЕ использовать (стратегии сканируются)
  • Immer middleware
  • Все методы — типизированные
  • Никаких мутаций напрямую (только через set)

【 8. src/stores/useLogsStore.ts 】
Назначение: логи приложения с буфером.

Состояние:
  • logs: LogEntry[]
  • bufferSize: number (по умолчанию 10 000)
  • filter: LogFilter (по умолчанию пустой)
  • pendingBatch: LogEntry[] (для батчинга)

Методы:
  • addLog(entry: Omit<LogEntry, "id" | "timestamp">)
  • addLogs(entries: ...[]) — пакетное добавление
  • clearLogs()
  • setFilter(filter: Partial<LogFilter>)
  • flush() — принудительный сброс батча

Логика батчинга:
  • addLog добавляет в pendingBatch
  • Раз в 100ms или при 50 записей — flush переносит
    pendingBatch в logs
  • При превышении bufferSize — удаляем самые старые

Селекторы:
  • selectFilteredLogs() — с учётом filter
  • selectLogsByStrategy(id)
  • selectErrorCount() — количество error-логов

Требования:
  • Persist НЕ использовать
  • Не хранить больше bufferSize
  • Батчинг обязателен
  • Добавление логов НЕ должно вызывать ре-рендеры UI

【 9. src/stores/useSettingsStore.ts 】
Назначение: настройки приложения.

Состояние:
  • settings: AppSettings (default значения)
  • loading: boolean (при загрузке из файла)
  • error: string | null

Методы:
  • updateSettings(patch: Partial<AppSettings>) — merge
  • updateOutlastTrials(patch)
  • updateVpn(patch)
  • updateAdvanced(patch)
  • resetToDefaults()
  • loadFromFile() — async, читает через Tauri fs
  • saveToFile() — async, пишет через Tauri fs

Требования:
  • Persist middleware (localStorage) для мгновенного доступа
  • При старте — загрузка из файла (если есть) → перезапись
    localStorage
  • При изменении — debounce 500ms → сохранение в файл
  • Default значения — в src/lib/defaults.ts

【 10. src/stores/useVpnStore.ts 】
Назначение: состояние VPN.

Состояние:
  • configs: VpnConfig[]
  • activeConfigId: string | null
  • connection: VpnConnectionState
  • loading: boolean

Методы:
  • addConfig(config: Omit<VpnConfig, "id">)
  • removeConfig(id)
  • setActiveConfig(id)
  • setStatus(status: VpnStatus)
  • setConnected(configId, stats)
  • disconnect()
  • setError(error: string)

Селекторы:
  • selectIsConnected()
  • selectActiveConfig()
  • selectConnectionStats() — bytes in/out, uptime

【 11. src/stores/selectors/index.ts 】
Назначение: кастомные селекторы для сложных вычислений.

Селекторы:
  • useConnectionStatus() — вычисляет общий статус:
    "connected" | "disconnected" | "connecting" | "vpn" |
    "error"
  • useStrategiesCount() — общее количество
  • useRunningStrategy() — текущая активная running
  • useFilteredLogs() — с фильтрацией (мемоизация)
  • useErrorsCount() — количество ошибок за сессию

Требования:
  • Использовать useShallow для объектов
  • Не создавать новые объекты каждый рендер
  • Мемоизация через useMemo где нужно

【 12. src/lib/defaults.ts 】
Назначение: значения по умолчанию для AppSettings.

Содержит:
  • DEFAULT_SETTINGS: AppSettings
  • DEFAULT_OUTLAST_TRIALS: OutlastTrialsSettings
  • DEFAULT_VPN: VpnSettings
  • DEFAULT_ADVANCED: AdvancedSettings

Требования:
  • Экспорт констант
  • Замороженные (as const где возможно)
  • Значения — разумные (например, bufferSize 10 000,
    checkUpdatesInterval 24 часа)

【 13. src/stores/mocks/strategies.ts 】
Назначение: моковые стратегии для разработки UI.

Содержит:
  • MOCK_STRATEGIES: Strategy[] — 5–7 моков с разными
    сервисами и статусами:
    - Discord + YouTube (running)
    - General (idle)
    - Outlast Trials (idle)
    - Alt 1 (idle)
    - Alt 2 (error с сообщением)
    - YouTube (stopped)
  • MOCK_LOGS: LogEntry[] — 100–200 моковых логов
  • Флаг USE_MOCKS (из import.meta.env.VITE_USE_MOCKS)

Требования:
  • Только для dev (проверка через import.meta.env.DEV)
  • В production — не используются
  • Реалистичные данные (правильные пути, даты)

【 14. src/stores/mocks/logs.ts 】
Назначение: генератор моковых логов для тестирования
производительности.

Содержит:
  • generateMockLogs(count: number): LogEntry[]
  • Функция создаёт N логов с реалистичными сообщениями
    и случайными уровнями (80% info, 10% success, 5% warn,
    5% error)

Требования:
  • Только для dev
  • Не вызывать в production

【 15. src/lib/storage.ts 】
Назначение: обёртка над Tauri fs для сохранения настроек в файл.

Функции:
  • readSettingsFile(): Promise<AppSettings | null>
  • writeSettingsFile(settings: AppSettings): Promise<void>
  • getSettingsPath(): Promise<string> — возвращает путь
    к файлу настроек в %APPDATA%/ZapretManager/config.json

Требования:
  • Использовать @tauri-apps/api/path и @tauri-apps/plugin-fs
  • Обработка ошибок через try/catch
  • Если файла нет — вернуть null
  • Если файл повреждён — вернуть null и залогировать

【 16. src/hooks/useSettingsSync.ts 】
Назначение: хук, синхронизирующий localStorage ↔ файл.

Логика:
  • При mount: loadFromFile → обновить стор
  • Подписка на изменения settings → debounce 500ms → saveToFile
  • Возвращает { isLoaded, isLoading, error }

Требования:
  • useEffect с cleanup
  • Debounce через setTimeout + clearTimeout
  • Не запускать повторные сохранения при загрузке

【 17. Расширить src/stores/useAppStore.ts (из Этапа 2) 】

Что добавить:
  • Оставить: activePage, sidebarCollapsed, setActivePage,
    toggleSidebar
  • УБРАТЬ: connectionStatus, setConnectionStatus
    (теперь это вычисляемый селектор из useStrategiesStore +
    useVpnStore)
  • Добавить: theme, language (для будущего переключения)

ВАЖНО: не ломать API Этапа 2. Компоненты TitleBar и Sidebar
используют setActivePage, toggleSidebar — они должны
работать без изменений.

【 18. Добавить dev-страницу с моками (src/pages/About.tsx) 】

Дополнить демо-страницу из Этапа 3:
  • Секция «Моковые данные» — счётчики:
    - Стратегий: 6
    - Активная: Discord + YouTube
    - Логов: 200
    - Ошибок: 1
  • Кнопка «Загрузить моки» → setStrategies(MOCK_STRATEGIES)
  • Кнопка «Сгенерировать 1000 логов» → тест производительности
  • Кнопка «Очистить всё» → clearAll

Требования:
  • Видна только в dev (import.meta.env.DEV)
  • В production не отображается

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создать структуру папок для типов
  • src/types/ с файлами: strategy.ts, log.ts, settings.ts,
    vpn.ts, update.ts, index.ts
  • src/stores/selectors/ с index.ts
  • src/stores/mocks/ с strategies.ts, logs.ts
  • src/lib/ с defaults.ts, storage.ts

ШАГ 2: Определить типы в src/types/
  • strategy.ts — ServiceType, StrategyStatus, StrategyFileType,
    Strategy, StrategyInput, StrategyFilter
  • log.ts — LogLevel, LogSource, LogEntry, LogFilter
  • settings.ts — ThemeMode, Language, UpdateChannel,
    AppSettings, OutlastTrialsSettings, VpnSettings,
    AdvancedSettings
  • vpn.ts — VpnProvider, VpnStatus, VpnConfig,
    VpnConnectionState
  • update.ts — UpdateInfo, UpdateStatus, DownloadProgress
  • index.ts — реэкспорт всего

ШАГ 3: Определить DEFAULT_SETTINGS в src/lib/defaults.ts
  • Все значения по умолчанию
  • Комментарии на русском, объясняющие выбор

ШАГ 4: Создать useStrategiesStore
  • Immer + Zustand
  • Полный набор методов
  • Селекторы вынести в selectors/index.ts или inline

ШАГ 5: Создать useLogsStore
  • Батчинг через setTimeout (100ms) + порог 50 записей
  • Буфер 10 000
  • flush при clearLogs и при unmount

ШАГ 6: Создать useSettingsStore
  • Persist (localStorage) с partialize (не сохранять loading,
    error)
  • Методы updateX
  • resetToDefaults

ШАГ 7: Создать useVpnStore
  • Простой стор без persist (состояние runtime)

ШАГ 8: Создать src/lib/storage.ts
  • readSettingsFile / writeSettingsFile
  • Использовать Tauri fs API
  • Обработка ошибок

ШАГ 9: Создать src/hooks/useSettingsSync.ts
  • Синхронизация localStorage ↔ файл
  • Debounce сохранения

ШАГ 10: Создать src/stores/selectors/index.ts
  • useConnectionStatus, useStrategiesCount,
    useRunningStrategy, useErrorsCount

ШАГ 11: Создать моковые данные
  • MOCK_STRATEGIES (6 штук)
  • MOCK_LOGS генератор
  • USE_MOCKS флаг

ШАГ 12: Обновить useAppStore (Этап 2)
  • Убрать connectionStatus (теперь computed)
  • Добавить theme, language (опционально)

ШАГ 13: Обновить демо-страницу About.tsx
  • Секция с моками (только dev)
  • Кнопки: загрузить моки, сгенерировать логи, очистить

ШАГ 14: Обновить App.tsx
  • Подключить useSettingsSync на верхнем уровне
  • При USE_MOCKS=true — загрузить моки в стор при старте

ШАГ 15: Финальная проверка
  • pnpm tauri dev — запускается
  • Перейти на About → увидеть моки
  • Клик «Загрузить моки» → счётчик стратегий = 6
  • Клик «Сгенерировать 1000 логов» → UI не тормозит
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Пройти чек-лист Части 4

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 TYPE SAFETY 】
  □ Все типы в src/types/ определены
  □ Union-типы вместо boolean где возможно
  □ Partial<T> для patch-методов
  □ Omit<T, K> для input-типов (StrategyInput)
  □ readonly где не должно мутироваться
  □ Ни одного any
  □ Импорт через "@/types" работает

【 STORES 】
  □ useStrategiesStore: все методы реализованы
  □ useLogsStore: батчинг работает
  □ useSettingsStore: persist настроен (partialize)
  □ useVpnStore: базовые методы
  □ useAppStore: не сломан, работает как в Этапе 2
  □ Селекторы точечные, не подписка на весь стор

【 IMMER 】
  □ Immer middleware подключён в стратегиях и логах
  □ Мутации через set((state) => { ... }) работают
  □ Вложенные обновления корректны

【 PERSIST 】
  □ useSettingsStore persist в localStorage
  □ partialize — сохраняются только настройки, не loading/error
  □ useStrategiesStore — БЕЗ persist
  □ useLogsStore — БЕЗ persist
  □ useAppStore — persist как в Этапе 2

【 BATCHING (ЛОГИ) 】
  □ Логи добавляются в pendingBatch
  □ Flush раз в 100ms или по 50 записей
  □ Буфер ≤10 000
  □ При превышении — удаляются старые
  □ UI не тормозит при 1000 логов/сек

【 MOCK DATA 】
  □ MOCK_STRATEGIES: 6 штук с разными сервисами и статусами
  □ MOCK_LOGS генератор работает
  □ USE_MOCKS включается через env
  □ В production не используется

【 SETTINGS SYNC 】
  □ loadFromFile читает из %APPDATA%
  □ saveToFile пишет в файл
  □ Debounce 500ms при сохранении
  □ При старте: файл → стор (файл приоритетнее localStorage)
  □ При отсутствии файла — default значения

【 SELECTORS 】
  □ useConnectionStatus корректно вычисляет
  □ useStrategiesCount
  □ useRunningStrategy
  □ useErrorsCount
  □ Мемоизация где нужно

【 PERFORMANCE 】
  □ 1000 логов/сек → FPS не падает ниже 55
  □ Подписка на стор не вызывает лишних ре-рендеров
  □ Селекторы не создают новые объекты каждый рендер
  □ RAM <200 MB при 10 000 логов

【 CODE QUALITY 】
  □ Нет мёртвого кода
  □ Нет console.log (кроме dev, если нужны)
  □ Функции <50 строк
  □ Файлы <300 строк
  □ Комментариев в коде нет (правило проекта)

【 BUILD 】
  □ pnpm tauri dev — запускается
  □ pnpm tsc --noEmit — 0 ошибок
  □ cargo check — 0 warning'ов
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: Immer конфликтует с Zustand persist
  ПРИЧИНА: persist делает JSON.stringify, Immer использует
    Proxy.
  ЧТО ПРОВЕРИТЬ: persist + Immer работают вместе. Если нет —
    использовать createJSONStorage(() => localStorage).

ГИПОТЕЗА 2: Батчинг логов не срабатывает
  ПРИЧИНА: setTimeout в сторе не работает вне React-компонента.
  ЧТО ПРОВЕРИТЬ: логи добавляются пачкой. Если нет — добавить
    flush() вручную в useLogsStore.setState.

ГИПОТЕЗА 3: Селекторы возвращают новый объект каждый раз
  ПРИЧИНА: useShallow не подключён.
  ЧТО ПРОВЕРИТЬ: перейти в React DevTools Profiler — не должно
    быть ре-рендеров при отсутствии изменений.

ГИПОТЕЗА 4: Tauri fs не доступен на верхнем уровне
  ПРИЧИНА: fs API требует await.
  ЧТО ПРОВЕРИТЬ: useSettingsSync использует useEffect +
    await, не на верхнем уровне.

ГИПОТЕЗА 5: Файл настроек читается при каждом рендере
  ПРИЧИНА: useEffect без dependencies.
  ЧТО ПРОВЕРИТЬ: loadFromFile вызывается один раз при mount.

ГИПОТЕЗА 6: Date в Strategy вызывает проблемы с сериализацией
  ПРИЧИНА: Date не сериализуется через JSON автоматически.
  ЧТО ПРОВЕРИТЬ: lastRun — использовать number (Unix ms)
    вместо Date. При отображении — конвертировать через
    new Date().toLocaleString().

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev

2. Открыть DevTools → Console
   ОЖИДАНИЕ: нет ошибок, нет warning'ов о типах

3. Перейти в About → секция «Моковые данные»
   ОЖИДАНИЕ: видны счётчики (стратегий 0, логов 0)

4. Клик «Загрузить моки»
   ОЖИДАНИЕ: счётчик стратегий = 6, активная = Discord + YouTube

5. Открыть DevTools → Application → Local Storage
   ОЖИДАНИЕ: ключ zapret-settings с настройками

6. Клик «Сгенерировать 1000 логов»
   ОЖИДАНИЕ: счётчик логов растёт плавно, FPS не падает

7. Клик «Сгенерировать 10 000 логов»
   ОЖИДАНИЕ: буфер ограничен 10 000, старые удаляются

8. Открыть Performance → записать 5 сек генерации
   ОЖИДАНИЕ: 60 FPS, нет long tasks >50ms

9. Проверить useSettingsSync:
   • Изменить настройку через About (если есть UI)
   • Проверить файл %APPDATA%/ZapretManager/config.json
   ОЖИДАНИЕ: файл создан, содержит настройки

10. Перезапустить приложение
    ОЖИДАНИЕ: настройки загружены из файла

11. Удалить файл config.json
    ОЖИДАНИЕ: при следующем запуске — default значения

12. Открыть React DevTools → Profiler
    ОЖИДАНИЕ: селекторы не вызывают лишних ре-рендеров

13. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

14. cargo check в src-tauri/
    ОЖИДАНИЕ: 0 warning'ов

15. Открыть Task Manager → RAM
    ОЖИДАНИЕ: <200 MB при 10 000 логов

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать any
❌ Не использовать Redux Toolkit или другой стор
❌ Не хранить Date в сторе (только number)
❌ Не подписываться на весь стор в компонентах
❌ Не смешивать логи с основным стором
❌ Не persist'ить стратегии и логи
❌ Не хранить connectionStatus отдельно (computed)
❌ Не забывать partialize в persist
❌ Не забывать батчинг для логов
❌ Не забывать cleanup в useEffect
❌ Не забывать про import.meta.env.DEV для моков
❌ Не начинать Этап 5 без подтверждения
❌ Не менять API useAppStore (Этап 2) — только добавить

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 4 завершён, если ВСЕ пункты выполнены:

✅ Все типы в src/types/ определены
✅ Импорт через "@/types" работает
✅ useStrategiesStore: все методы, Immer, без persist
✅ useLogsStore: батчинг, буфер 10 000, без persist
✅ useSettingsStore: persist + sync с файлом
✅ useVpnStore: базовый функционал
✅ useAppStore: не сломан
✅ Селекторы работают: useConnectionStatus,
   useStrategiesCount, useRunningStrategy
✅ Моки: MOCK_STRATEGIES (6), MOCK_LOGS генератор
✅ USE_MOCKS через env
✅ storage.ts: read/write settings в файл
✅ useSettingsSync: debounce 500ms
✅ About.tsx дополнен секцией моков (только dev)
✅ 1000 логов/сек → FPS ≥55
✅ 10 000 логов в памяти → RAM <200 MB
✅ Перезапуск → настройки загружены
✅ TypeScript strict — 0 ошибок
✅ Rust — 0 warning'ов
✅ Консоль чистая
✅ Ни одного any
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 4 ВЫПОЛНЕН 2026-10-05
═══════════════════════════════════════════════════════════════════════

Реализовано:
  • 6 доменных модулей в `src/types/` + barrel, импорт только через `@/types`
  • `useStrategiesStore` — Immer, 12 методов, без persist
  • `useLogsStore` — Immer, батчинг (100 мс / 50 записей), буфер 10 000,
    без persist
  • `useSettingsStore` — Immer + persist + чтение/запись config.json
  • `useVpnStore` — Immer, рантайм, без persist
  • `useAppStore` — persist, `connectionStatus` убран, добавлены theme/language
  • `stores/selectors/index.ts` — useConnectionStatus, useStrategiesCount,
    useRunningStrategy, useFilteredLogs, useErrorsCount
  • `lib/defaults.ts`, `lib/storage.ts`, `hooks/useSettingsSync.ts`
  • `stores/mocks/` — MOCK_STRATEGIES (6), generateMockLogs, USE_MOCKS
  • `shared/MocksPanel.tsx` — dev-only панель, подключена в About

Проверено фактическим запуском:
  ✅ «Загрузить моки» → Стратегий 6, Логов 200, Ошибок 12
  ✅ useConnectionStatus → «Подключено», точка в Sidebar стала зелёной
  ✅ 10 × 1000 логов → Логов ровно 10 000, буфер обрезан
  ✅ Ошибок 543 из 10 000 (около 5%, совпадает с генератором)
  ✅ pnpm exec tsc --noEmit — 0 ошибок
  ✅ pnpm exec eslint . — 0 ошибок
  ✅ pnpm exec prettier --check . — 0 ошибок
  ✅ cargo check — 0 ошибок, 0 warning'ов
  ✅ Комментариев в коде нет

Найденный баг (до запуска, на этапе написания):
  Селекторы, возвращающие новый массив (`selectRunningStrategies`),
  нельзя отдавать в `useStore(selector)` — zustand v5 падает на
  `useSyncExternalStore` (бесконечный ре-рендер). Переписано на
  подписку на стабильные ссылки + `useMemo`. См. README O18.

Исправлено по ходу:
  • `writeTextFile` в plugin-fs 2.6 не принимает кодировку третьим
    аргументом → README O19
  • `Card` конфликтовал с `HTMLAttributes["onClick"]` → `Omit`
  • Добавлен `immer@11.1.21` → README O17

НЕ ВЫПОЛНЕНО ДОСЛОВНО (осознанно):
  ⚠ «10 000 логов → RAM <200 MB» — критерий нереализуем в букве.
    Сумма WorkingSet по дереву WebView2 (13 процессов) дважды считает
    общие страницы, и пустое приложение уже даёт 838 МБ ws / 596 МБ
    private. Замерена дельта: **логи стоят ≈13 МБ (1.3 КБ на запись)**,
    главный процесс 35 МБ. Замеры велись после убийства осиротевших
    `msedgewebview2` — они не умирают вместе с приложением и иначе
    завышают цифры в разы. См. README O20.

Отклонения: README.md раздел 8.1, O17–O20.

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 5
═══════════════════════════════════════════════════════════════════════

После Этапа 4 у нас есть:
  • Полная доменная модель (все типы)
  • 5 сторов (App, Strategies, Logs, Settings, Vpn)
  • Селекторы для вычисляемых значений
  • Синхронизация настроек с файлом через Tauri
  • Моковые данные для разработки UI
  • Готовность к подключению Rust-бэкенда

На Этапе 5 нужно будет:
  • Создать Rust-команду scan_strategies (сканирование папки)
  • Парсить .bat файлы
  • Определять сервисы по имени и содержимому
  • Возвращать Vec<StrategyInfo> в TypeScript
  • Хук useStrategies подключается к Rust
  • UI Strategies.tsx показывает реальный список

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 4 — СТОП.

Не начинай Этап 5. Не создавай Rust-команды, не подключай
сканер .bat, не пиши UI для Strategies.tsx.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 5
  • "Правка: ..." — правка в Этап 4
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.