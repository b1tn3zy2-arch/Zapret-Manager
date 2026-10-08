═══════════════════════════════════════════════════════════════════════
ЭТАП 9: DASHBOARD — ГЛАВНЫЙ ЭКРАН ПРИЛОЖЕНИЯ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Создать главный экран приложения — Dashboard. Это первое, что
видит пользователь при запуске. Он должен производить «вау»-эффект
с первой секунды: большой пульсирующий статус-индикатор, живая
информация о соединении (IP, страна, провайдер), быстрые действия,
мини-визуализация пинга и последние логи.

После этого этапа пользователь сможет:
  • Видеть текущий статус подключения с крупным анимированным
    индикатором (Connected / Disconnected / Connecting / VPN / Error)
  • Узнать свой внешний IP, страну и провайдера
  • Запустить последнюю использованную стратегию одной кнопкой
  • Увидеть текущую активную стратегию и её PID
  • Переключиться на VPN одним тумблером (заглушка, полная
    интеграция на Этапе 14)
  • Видеть мини-график пинга до ключевых сервисов
  • Видеть 5 последних логов в реальном времени
  • Видеть счётчики: всего стратегий, запущено, ошибок

Dashboard — это «лицо» приложения. Если он выглядит дёшево —
всё приложение воспринимается как дешёвое. Поэтому здесь
визуальная полировка критична.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Hero-панель сверху с большим статусом 】

ОБОСНУЙ:
  • Первое, что видит пользователь — статус подключения
  • Большой индикатор (120x120) с пульсацией при Connected
  • Цвет индикатора зависит от статуса:
    - Connected: зелёный (accent-primary) + pulse
    - Connecting: жёлтый (amber) + вращение
    - Disconnected: серый (text-tertiary)
    - VPN: голубой (accent-secondary) + pulse
    - Error: красный (accent-danger) + тряска
  • В центре индикатора — иконка (Shield, ShieldCheck, Lock,
    AlertCircle)
  • Под индикатором — крупный текст статуса (Inter 700, 24px)
  • Рядом с индикатором — кнопка «Подключиться» / «Отключиться»
    (большая, primary)

ПОЧЕМУ БОЛЬШОЙ:
  • Пользователь понимает статус за 0.3 сек
  • Создаёт «вау»-эффект
  • Ядро UX приложения

ПОЧЕМУ ПУЛЬСАЦИЯ:
  • Показывает, что система «живая»
  • Стандарт для status-индикаторов (Discord, VPN-клиенты)

【 РЕШЕНИЕ 2: Информация о соединении — карточка с IP/страной/провайдером 】

ОБОСНУЙ:
  • Рядом с Hero-панелью — карточка с данными:
    - Внешний IP (например, 185.123.45.67)
    - Страна + флаг (эмодзи или SVG)
    - Провайдер (ISP)
    - Город (если доступно)
    - Задержка до сервера (ping)
  • Данные получаются через публичные API:
    - ipapi.co/json/ (бесплатно, 1000 запросов/день)
    - ipwho.is/ (без API-ключа)
    - ip-api.com/json (бесплатно, 45 req/min)
  • Кэширование: 5 минут (не дёргать API каждый рендер)
  • Fallback: если API недоступен — показать «—»

ПОЧЕМУ ВНЕШНИЕ API:
  • Нет смысла писать свой GeoIP-сервис
  • Публичные API бесплатны для нашего объёма
  • Актуальные данные

ПОЧЕМУ НЕ ЛОКАЛЬНАЯ БАЗА:
  • Требует обновления
  • Большой размер
  • Избыточно

【 РЕШЕНИЕ 3: Флаг страны — локальные SVG (circle-flags) 】

ОБОСНУЙ:
  Исходный вариант — эмодзи-флаг из ISO-кода через
  String.fromCodePoint. На Windows это не работает
  как задумано:
  • Windows рисует эмодзи-флаги только шрифтом
    Segoe UI Emoji, остальные глифы заменяет на
    буквы («NL» вместо флага)
  • Размер и цвет не контролируются — флаг не вписывается
    в неоновую палитру (#00ff88 / #00d4ff)
  • В разных версиях Windows выглядит по-разному

  РЕШЕНИЕ: скачать circle-flags (MIT, npm) на этапе
  сборки в src/assets/flags/ и рендерить нужный SVG
  по country_code через <img src={flags[code]}>.
  • Флаг — обычный файл, попадает в бандл через Vite
  • Внешних запросов в рантайме нет
  • Размер фиксирован, цвет наследуется обводкой,
    поэтому гармонично садится в тёмную тему
  • Всегда одинаково выглядит на любой Windows

ПОЧЕМУ ИМЕННО circle-flags:
  • MIT — можно свободно использовать в MIT-проекте
  • Флаги круглые, а не прямоугольные — визуально
    совпадают с круглым статус-индикатором
  • Есть все нужные страны, включая NL, DE, US, RU
  • SVG, поэтому чёткий на любом DPI

ПОЧЕМУ НЕ ЭМОДЗИ:
  • Непредсказуемо на Windows, см. выше

ПОЧЕМУ НЕ ЭМОДЗИ + ФОЛБЭК:
  • Два набора ассетов вместо одного, лишняя сложность
  • Винтажный border-radius у эмодзи не подходит

【 РЕШЕНИЕ 4: Кнопка быстрого запуска — «последняя использованная стратегия» 】

ОБОСНУЙ:
  • Пользователь открывает приложение → хочет сразу запустить
    обход
  • Не нужно идти в Strategies и выбирать
  • Кнопка «Продолжить с Discord + YouTube» (имя последней
    стратегии)
  • Если стратегия не выбрана — кнопка «Выбрать стратегию»
    (ведёт в Strategies)
  • Если активна — кнопка «Остановить» (danger)
  • Последняя стратегия сохраняется в localStorage (persist)

ПОЧЕМУ ПОСЛЕДНЯЯ:
  • Пользователь обычно использует 1–2 стратегии
  • Экономит 2 клика
  • Стандарт для VPN-приложений

ПОЧЕМУ НЕ ВЫПАДАЮЩИЙ СПИСОК:
  • Проще одна кнопка
  • Меньше визуального шума
  • Для выбора всех — есть страница Strategies

【 РЕШЕНИЕ 5: Мини-график пинга — SVG-спарклайн 】

ОБОСНУЙ:
  • Показывает пинг до 3 сервисов (Discord, YouTube, Google)
  • Обновление раз в 5 секунд
  • 30 точек (2.5 минуты истории)
  • Реализация: SVG polyline, не библиотека графиков
  • Минимум визуального шума, максимум информации

ПОЧЕМУ НЕ RECHARTS:
  • Избыточен для спарклайна
  • +100 KB в бандл
  • SVG polyline = 20 строк кода

ПОЧЕМУ 3 СЕРВИСА:
  • Discord — основной кейс
  • YouTube — второй кейс
  • Google — базовый пинг (DNS)
  • Больше — визуальный шум

ПОЧЕМУ ПИНГ ИЗ RUST:
  • Не из frontend (CORS-проблемы)
  • Rust может делать TCP-connect и замерять время
  • Или использовать ICMP (требует admin)

РЕАЛИЗАЦИЯ (упрощённо):
  • Rust команда ping_hosts(hosts: Vec<String>) -> Vec<PingResult>
  • Для каждого host: TcpStream::connect((host, 443)) + замер
    времени
  • Timeout 3 секунды
  • Возврат: { host, latencyMs, success }

【 РЕШЕНИЕ 6: Последние логи — 5 строк из useLogsStore 】

ОБОСНУЙ:
  • В правом нижнем углу — карточка «Последние события»
  • 5 последних строк лога
  • Кнопка «Все логи» → переход на страницу Logs
  • Не дублировать виртуализацию — просто slice(-5)
  • Обновляется автоматически при новых логах

ПОЧЕМУ 5:
  • Достаточно для обзора
  • Не занимает много места
  • Кнопка «Все логи» для деталей

【 РЕШЕНИЕ 7: Счётчики-статистика в верхней части ]

ОБОСНУЙ:
  • 3–4 карточки с метриками:
    - Всего стратегий (из useStrategiesStore)
    - Запущено сейчас (running + starting)
    - Ошибок за сессию (из useLogsStore)
    - Время работы (uptime текущей стратегии)
  • Каждая карточка — с иконкой, цифрой (большой), подписью
  • Hover → лёгкий подъём

ПОЧЕМУ НЕ ТОЛЬКО СТАТУС:
  • Пользователь хочет видеть общую картину
  • Метрики дают ощущение «приборной панели»

【 РЕШЕНИЕ 8: Toggle VPN ↔ DPI в Hero-панели ]

ОБОСНУЙ:
  • Большой тумблер с двумя режимами:
    - DPI (bat-стратегии) ←→ VPN
  • Пока заглушка (реализация на Этапе 14)
  • При клике:
    - Если активна bat-стратегия → остановить, показать
      «VPN в разработке»
    - Если VPN активен → остановить VPN, показать
      «Переключение на DPI»
  • Визуально: две иконки (Zap для DPI, Lock для VPN)
    с анимированным индикатором между ними

ПОЧЕМУ ЗАГЛУШКА:
  • Полная реализация — Этап 14
  • Визуальный задел нужен сейчас, чтобы UI был закончен
  • Пользователь видит, что функционал в планах

【 РЕШЕНИЕ 9: Refresh данных — периодический поллинг ]

ОБОСНУЙ:
  • IP/страна: раз в 5 минут
  • Пинг: раз в 5 секунд
  • Логи: через events (уже подписаны)
  • Статусы стратегий: через events
  • При возврате на Dashboard — обновить IP сразу

ПОЧЕМУ НЕ WEBSOCKET:
  • Для IP/страны — избыточно
  • Пинг и так короткий запрос

ПОЧЕМУ 5 МИНУТ ДЛЯ IP:
  • IP меняется редко
  • API-лимиты
  • Кэш

【 РЕШЕНИЕ 10: Разделение компонентов Dashboard ]

ОБОСНУЙ:
  • DashboardHero — большая панель со статусом
  • DashboardStats — 4 счётчика
  • DashboardConnection — карточка с IP/страной
  • DashboardPing — спарклайн
  • DashboardLogs — 5 последних логов
  • DashboardQuickActions — быстрый запуск + VPN toggle

ПОЧЕМУ РАЗДЕЛЕНИЕ:
  • Каждый компонент независим
  • Легко тестировать
  • Легко переставлять
  • Ре-рендеры локализованы

【 РЕШЕНИЕ 11: Адаптивная сетка Dashboard ]

ОБОСНУЙ:
  • Desktop (>1024px): 3 колонки
    - Левая (2/3): Hero + Stats
    - Правая (1/3): Connection + Ping
    - Низ: Logs + QuickActions
  • Tablet (640–1024px): 2 колонки
  • Mobile (<640px): 1 колонка

ПОЧЕМУ ТАК:
  • Hero — главное, много места
  • Connection/Ping — компактные
  • Логи — внизу

【 РЕШЕНИЕ 12: Greeting по времени суток ]

ОБОСНУЙ:
  • «Доброе утро» / «Добрый день» / «Добрый вечер» / «Доброй
    ночи» в заголовке
  • Мелкая деталь, но добавляет персонализации
  • Определяется по new Date().getHours()

ПОЧЕМУ ПОЛЕЗНО:
  • Создаёт «живое» ощущение
  • Стандарт для современных SaaS

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/src/commands/network.rs (создать) 】
Назначение: сетевые команды для Dashboard.

Команды:
  • ping_hosts(hosts: Vec<String>) -> Vec<PingResult>
    Логика:
    1. Для каждого host — tokio::spawn с timeout 3s
    2. TcpStream::connect((host, 443))
    3. Замерить время от начала до успеха
    4. Вернуть { host, latencyMs: Option<u64>, success: bool }
    Требования:
    • Параллельно через JoinSet
    • Timeout через tokio::time::timeout
    • Не падать при ошибке

Структуры:
  • PingResult (Serialize):
    - host: String
    - latencyMs: Option<u64>
    - success: bool

【 2. src-tauri/src/commands/mod.rs (обновить) 】
Добавить:
  • pub mod network;
  • pub use network::ping_hosts;

【 3. src-tauri/src/lib.rs (обновить) 】
Зарегистрировать:
  • commands::ping_hosts

【 4. src/hooks/useNetworkInfo.ts (создать) 】
Назначение: получение информации о сети (IP, страна, провайдер).

Состояние:
  • info: NetworkInfo | null
  • isLoading: boolean
  • error: string | null

Методы:
  • refresh(): Promise<void>

Логика:
  • fetch("https://ipwho.is/") — без API-ключа
  • Парсинг JSON: { ip, country, country_code, city, connection: { isp } }
  • setInfo
  • Кэш в localStorage на 5 минут (проверка timestamp)
  • При ошибке — fallback на ipapi.co/json/

Возвращает:
  • { info, isLoading, error, refresh }

Типы:
  • NetworkInfo:
    - ip: string
    - country: string
    - countryCode: string
    - city: string
    - isp: string
    - fetchedAt: number

Требования:
  • AbortController для отмены при unmount
  • Обработка CORS (Tauri позволяет)
  • Не дёргать API при каждом рендере

【 5. src/hooks/usePing.ts (создать) 】
Назначение: периодический пинг до сервисов.

Состояние:
  • results: Map<string, PingPoint[]> — история пингов
  • PingPoint: { timestamp, latencyMs, success }

Логика:
  • Интервал 5 секунд
  • invoke("ping_hosts", { hosts: ["discord.com",
    "www.youtube.com", "google.com"] })
  • Добавить результаты в историю
  • Ограничить историю: 30 точек на хост
  • Cleanup при unmount

Возвращает:
  • { results, isLoading }

Требования:
  • Не блокировать UI
  • Не дёргать API при скрытом окне (document.hidden)

【 6. src/hooks/useUptime.ts (создать) 】
Назначение: время работы активной стратегии.

Логика:
  • Принимает startedAt (Unix ms) или null
  • setInterval 1 секунда → обновить elapsed
  • Возвращает форматированную строку: «00:05:23»
  • Cleanup при unmount

Сигнатура:
  • useUptime(startedAt: number | null): string

【 7. src/lib/geo.ts (создать) 】
Назначение: утилиты для работы с геоданными.

Функции:
  • countryCodeToFlagSrc(code: string): string
    - Возвращает путь к SVG из src/assets/flags/
    - Приводит код к нижнему регистру: "NL" → "nl.svg"
    - Если файла нет — возвращает заглушку
      assets/flags/unknown.svg
    - НЕ строит эмодзи из code points
  • getGreeting(): string
    - «Доброе утро» (5–12), «Добрый день» (12–18),
      «Добрый вечер» (18–23), «Доброй ночи» (23–5)
  • hasFlagAsset(code: string): boolean
    - Проверяет наличие файла в карте импортов,
      чтобы не делать сетевой запрос за отсутствующим

Компонент:
  src/components/dashboard/CountryFlag.tsx
  • props: countryCode: string, size?: number
  • Рендерит <img> с флагом и alt={countryName}
  • border-radius: 50%
  • box-shadow по палитре, а не серый по умолчанию

【 8. src/lib/pingUtils.ts (создать) 】
Назначение: работа с данными пинга.

Функции:
  • buildSparklinePath(points: PingPoint[], width: number,
    height: number): string
    - Возвращает SVG path d-string
    - Нормализует точки по min/max
    - Пропускает неуспешные (разрыв линии)
  • getPingColor(latencyMs: number): string
    - < 50ms → accent-primary (зелёный)
    - 50–150ms → amber (жёлтый)
    - > 150ms → accent-danger (красный)
  • formatPing(latencyMs: number | null): string
    - null → «—»
    - иначе → «{n} ms»

【 9. src/components/dashboard/DashboardHero.tsx (создать) 】
Назначение: главная панель со статусом.

Props:
  • status: ConnectionStatus
  • activeStrategyName?: string
  • onConnect: () => void
  • onDisconnect: () => void
  • isConnecting: boolean

Рендер:
  • Большой круглый индикатор 120x120:
    - Цвет по статусу
    - Пульсация через framer-motion (scale 1 → 1.1 → 1)
    - Иконка в центре (Shield, ShieldCheck, Lock,
      AlertCircle)
  • Справа:
    - Greeting (text-secondary, text-sm)
    - Название стратегии или статус (Inter 700, 24px)
    - Подпись: «Активна» / «Отключено» / «Подключение...»
    - Кнопка «Подключиться» / «Отключиться» (primary/danger,
      size="lg")
  • Badge статуса сверху (success/warning/error/neutral)

Требования:
  • GlassPanel variant="default" padding="lg"
  • Минимум 280px высота
  • Пульсация только при active статусах
  • Плавные переходы между статусами (framer-motion)

【 10. src/components/dashboard/DashboardStats.tsx (создать) 】
Назначение: 4 счётчика-метрики.

Props: нет (работает со стором).

Рендер:
  • Grid 4 колонки (на desktop) / 2 (tablet) / 1 (mobile)
  • 4 карточки:
    - «Всего стратегий» — Layers icon, количество
    - «Активных» — Zap icon, количество running
    - «Ошибок» — AlertTriangle icon, количество error-логов
    - «Время работы» — Clock icon, uptime
  • Каждая карточка: GlassPanel, иконка + число + подпись

Требования:
  • Числа крупные (Inter 700, 32px)
  • Подписи мелкие (text-xs, text-secondary)
  • Обновление в реальном времени

【 11. src/components/dashboard/DashboardConnection.tsx (создать) 】
Назначение: карточка с информацией о соединении.

Props: нет (использует useNetworkInfo).

Рендер:
  • GlassPanel
  • Заголовок: «Информация о соединении»
  • Ряд: флаг (эмодзи 32px) + страна + город
  • IP (mono, 14px)
  • Провайдер (text-secondary)
  • Кнопка обновления (icon RefreshCw)
  • Loading skeleton при загрузке
  • Error state

Требования:
  • Автообновление раз в 5 минут
  • Ручное обновление по кнопке
  • Кэш на 5 минут

【 12. src/components/dashboard/DashboardPing.tsx (создать) 】
Назначение: мини-график пинга.

Props: нет (использует usePing).

Рендер:
  • GlassPanel
  • Заголовок: «Пинг до сервисов»
  • 3 строки:
    - Discord: sparkline + текущее значение
    - YouTube: sparkline + текущее значение
    - Google: sparkline + текущее значение
  • Sparkline: SVG 200x32, polyline с градиентом

Требования:
  • SVG, не canvas
  • Плавное обновление
  • Цвет по latency

【 13. src/components/dashboard/DashboardRecentLogs.tsx (создать) 】
Назначение: последние 5 логов.

Props:
  • onOpenAllLogs: () => void

Логика:
  • useLogsStore → slice(-5)
  • Если пусто — EmptyState «Логов пока нет»

Рендер:
  • GlassPanel
  • Заголовок: «Последние события» + кнопка «Все логи →»
  • 5 строк логов (упрощённый LogRow, без timestamp)
  • Клик → переход в Logs

Требования:
  • Не ре-рендерить весь LogRow — упрощённая версия

【 14. src/components/dashboard/DashboardQuickActions.tsx (создать) 】
Назначение: быстрые действия.

Props:
  • lastStrategy?: Strategy
  • activeStrategy?: Strategy
  • onQuickRun: () => void
  • onStop: () => void
  • onVpnToggle: () => void
  • isVpnActive: boolean

Рендер:
  • GlassPanel
  • Заголовок: «Быстрые действия»
  • Кнопка «Продолжить: {name}» (primary, fullWidth)
    или «Остановить» (danger) если активна
  • VPN toggle (заглушка): большой переключатель DPI ↔ VPN
  • Подпись: «VPN в разработке (Этап 14)»

Требования:
  • Кнопка Play/Stop анимированная (framer-motion)
  • VPN toggle — с иконками

【 15. src/components/dashboard/PingSparkline.tsx (создать) 】
Назначение: переиспользуемый SVG спарклайн.

Props:
  • points: PingPoint[]
  • width?: number (default 200)
  • height?: number (default 32)
  • color?: string

Рендер:
  • SVG с viewBox
  • Path через buildSparklinePath
  • Градиент снизу (fade)
  • Точка в конце (текущее значение)

Требования:
  • Реагирует на изменение points
  • Не рендерить, если точек < 2
  • Использовать useMemo для path

【 16. src/components/dashboard/StatusOrb.tsx (создать) 】
Назначение: большой пульсирующий индикатор.

Props:
  • status: ConnectionStatus
  • size?: number (default 120)

Рендер:
  • Круг с градиентом
  • Внутренний круг с иконкой
  • Внешние кольца (пульсация через framer-motion)
  • Цвета по статусу

Требования:
  • Пульсация только для active статусов
  • Плавные переходы между статусами
  • Не использовать CSS keyframes — framer-motion

【 17. src/components/dashboard/VpnToggle.tsx (создать) 】
Назначение: toggle DPI ↔ VPN (заглушка).

Props:
  • isVpn: boolean
  • onChange: (value: boolean) => void
  • disabled?: boolean

Рендер:
  • Контейнер с двумя иконками: Zap (слева) и Lock (справа)
  • Индикатор между ними (переезжает по клику)
  • Активная иконка — акцентный цвет
  • Подпись внизу: текущий режим

Требования:
  • framer-motion layoutId для индикатора
  • Пока заглушка — при клике показать toast
    «VPN появится в Этапе 14»

【 18. src/pages/Dashboard.tsx (реализовать полностью) 】
Назначение: сборка Dashboard из компонентов.

Структура:
  • Greeting (H1: «Доброе утро»)
  • Подзаголовок: «Управление обходом блокировок»
  • Grid:
    - Левая колонка (lg:col-span-2):
      • DashboardHero
      • DashboardStats
    - Правая колонка:
      • DashboardConnection
      • DashboardPing
    - Полная ширина:
      • Grid 2 колонки: DashboardQuickActions + DashboardRecentLogs

Логика:
  • useStrategiesStore — получить последнюю стратегию
    (из settings.lastStrategyId)
  • useStrategyRunner — run/stop
  • useSettingsStore — lastStrategyId
  • useNetworkInfo — IP/страна
  • usePing — пинг
  • useLogsStore — 5 последних логов
  • useConnectionStatus селектор — computed статус

Поведение:
  • При mount — refresh network info
  • При статусе running — обновлять uptime каждую секунду
  • Quick run → если нет lastStrategy — переход в Strategies

Требования:
  • Не подписываться на весь стор
  • Адаптивная сетка
  • Минимум 60 FPS

【 19. src/stores/useSettingsStore.ts (обновить) 】
Добавить:
  • lastStrategyId: string | null
  • setLastStrategyId(id: string | null)
  • Persist (уже есть)

При запуске стратегии (useStrategyRunner.run) —
вызывать setLastStrategyId(id).

【 20. src/stores/selectors/index.ts (обновить) 】
Добавить селектор:
  • useLastStrategy(): Strategy | undefined
    - useStrategiesStore + useSettingsStore.lastStrategyId
  • useActiveStrategy(): Strategy | undefined
    • useRunningStrategies(): Strategy[]

【 21. src/lib/constants.ts (обновить) 】
Добавить:
  • NETWORK_INFO_CACHE_MS = 5 * 60 * 1000 (5 минут)
  • PING_INTERVAL_MS = 5000
  • PING_HISTORY_SIZE = 30
  • UPTIME_TICK_MS = 1000
  • RECENT_LOGS_COUNT = 5
  • PING_HOSTS = ["discord.com", "www.youtube.com",
    "google.com"]

【 22. src-tauri/capabilities/default.json (обновить) 】
Убедиться, что разрешены HTTP-запросы:
  • http:default (для ipwho.is)
  • Или использовать reqwest напрямую в Rust для network info
    (без CORS)

РЕКОМЕНДАЦИЯ: использовать reqwest в Rust, чтобы избежать
CORS и проблем с WebView. Создать команду
fetch_network_info() в Rust, которая возвращает те же данные.

ТОГДА:
  • Убрать useNetworkInfo fetch из frontend
  • Заменить на invoke("fetch_network_info")
  • Добавить команду в network.rs

【 23. src-tauri/src/commands/network.rs (дополнить) 】
Добавить команду:
  • fetch_network_info() -> Result<NetworkInfo, AppError>
    Логика:
    1. reqwest::get("https://ipwho.is/")
    2. Parse JSON в struct
    3. Вернуть NetworkInfo (Serialize, camelCase)

Структуры:
  • NetworkInfo (Serialize):
    - ip: String
    - country: String
    - countryCode: String
    - city: String
    - isp: String

【 24. src/hooks/useNetworkInfo.ts (переписать) 】
Заменить fetch на invoke:
  • const result = await invoke<NetworkInfo>("fetch_network_info")
  • Остальная логика та же

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создать network.rs в Rust
  • Структура PingResult, NetworkInfo
  • Команды ping_hosts, fetch_network_info
  • reqwest для HTTP

ШАГ 2: Зарегистрировать команды
  • commands/mod.rs
  • lib.rs

ШАГ 3: Обновить Cargo.toml
  • Убедиться, что reqwest с features json, rustls-tls
  • tokio с full

ШАГ 4: Создать geo.ts
  • countryCodeToFlag, getGreeting

ШАГ 5: Создать pingUtils.ts
  • buildSparklinePath, getPingColor, formatPing

ШАГ 6: Создать useNetworkInfo
  • invoke("fetch_network_info")
  • Кэш в localStorage 5 минут
  • AbortController

ШАГ 7: Создать usePing
  • Интервал 5 сек
  • invoke("ping_hosts")
  • История 30 точек

ШАГ 8: Создать useUptime
  • setInterval 1 сек
  • Формат HH:mm:ss

ШАГ 9: Обновить useSettingsStore
  • lastStrategyId + persist

ШАГ 10: Обновить селекторы
  • useLastStrategy, useActiveStrategy, useRunningStrategies

ШАГ 11: Создать StatusOrb
  • Большой пульсирующий индикатор
  • Цвета по статусу
  • Framer Motion

ШАГ 12: Создать VpnToggle
  • Заглушка с двумя иконками
  • layoutId для индикатора

ШАГ 13: Создать PingSparkline
  • SVG с polyline
  • useMemo

ШАГ 14: Создать DashboardHero
  • StatusOrb + текст + кнопка

ШАГ 15: Создать DashboardStats
  • 4 карточки-метрики

ШАГ 16: Создать DashboardConnection
  • Карточка с IP/страной/провайдером

ШАГ 17: Создать DashboardPing
  • 3 спарклайна

ШАГ 18: Создать DashboardRecentLogs
  • 5 последних логов + кнопка «Все»

ШАГ 19: Создать DashboardQuickActions
  • Кнопка Play/Stop + VpnToggle

ШАГ 20: Реализовать Dashboard.tsx
  • Сборка всех компонентов
  • Адаптивная сетка
  • Интеграция с сторами

ШАГ 21: Обновить App.tsx
  • Заменить заглушку Dashboard на реализацию

ШАГ 22: Обновить constants.ts
  • NETWORK_INFO_CACHE_MS, PING_INTERVAL_MS, и т.д.

ШАГ 23: Обновить capabilities
  • Убедиться, что http разрешён (или использовать Rust)

ШАГ 24: Финальная проверка
  • pnpm tauri dev — запускается
  • Dashboard показывает все секции
  • Запустить стратегию → Hero меняется на running
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 RUST — TYPE SAFETY 】
  □ PingResult, NetworkInfo с serde camelCase
  □ Все ошибки через AppError
  □ Никаких unwrap() без обоснования
  □ reqwest с timeout 5s

【 RUST — ASYNC 】
  □ ping_hosts — параллельно через JoinSet
  □ fetch_network_info — reqwest
  □ Не блокировать tokio runtime

【 FRONTEND — HOOKS 】
  □ useNetworkInfo: кэш 5 мин, AbortController, fallback
  □ usePing: интервал 5s, история 30 точек, cleanup
  □ useUptime: 1s tick, cleanup
  □ Не дёргать API при скрытом окне (document.hidden)

【 FRONTEND — UI 】
  □ StatusOrb: пульсация для active статусов
  □ DashboardHero: 120x120 индикатор, кнопка Play/Stop
  □ DashboardStats: 4 метрики в реальном времени
  □ DashboardConnection: флаг, IP, страна, провайдер,
    кнопка обновления
  □ DashboardPing: 3 спарклайна
  □ DashboardRecentLogs: 5 логов + кнопка
  □ DashboardQuickActions: Play/Stop + VpnToggle
  □ Адаптивная сетка

【 FRONTEND — STORE SYNC 】
  □ useLastStrategy селектор работает
  □ lastStrategyId сохраняется при запуске
  □ useConnectionStatus вычисляется корректно
  □ useErrorsCount считает ошибки

【 PERFORMANCE 】
  □ Dashboard рендерится <100ms
  □ 60 FPS при пульсации StatusOrb
  • Пинг-запросы не блокируют UI
  □ RAM <250 MB

【 UX 】
  □ Greeting по времени суток
  □ Статус понятен за 0.3 сек
  □ Флаг страны отрисован как SVG, а не буквами «NL»
  □ Неизвестный код даёт заглушку, а не пустоту
  □ Кнопка Play/Stop работает
  □ IP/страна показываются
  □ Спарклайны обновляются плавно
  □ Последние 5 логов видны
  □ Клик «Все логи» → переход в Logs
  □ Клик «Продолжить: {name}» → запуск стратегии
  □ Если нет lastStrategy — переход в Strategies
  □ VPN toggle показывает заглушку
  □ Никаких «пустых» состояний без объяснений

【 ДОСТУПНОСТЬ 】
  □ aria-label на иконках
  □ focus-visible на кнопках
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
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: ipwho.is недоступен или rate-limit
  ПРИЧИНА: публичный API без ключа.
  ЧТО ПРОВЕРИТЬ: fallback на ipapi.co/json. Если оба падают
    — показать «—» и не крашить UI.

ГИПОТЕЗА 2: CORS-ошибка при fetch из frontend
  ПРИЧИНА: WebView блокирует запросы.
  ЧТО ПРОВЕРИТЬ: перенести fetch в Rust (reqwest). Это
    уже сделано в решении.

ГИПОТЕЗА 3: Пульсация StatusOrb тормозит
  ПРИЧИНА: framer-motion анимирует box-shadow/transform
    без GPU-ускорения.
  ЧТО ПРОВЕРИТЬ: использовать transform и opacity,
    добавл  ять will-change: transform.

ГИПОТЕЗА 4: usePing накапливает setTimeout
  ПРИЧИНА: нет cleanup.
  ЧТО ПРОВЕРИТЬ: clearInterval в return useEffect.

ГИПОТЕЗА 5: useNetworkInfo делает запрос при каждом рендере
  ПРИЧИНА: useEffect без dependencies.
  ЧТО ПРОВЕРИТЬ: useEffect с [] (только mount) + ручной
    refresh.

ГИПОТЕЗА 6: lastStrategyId не сохраняется
  ПРИЧИНА: persist не настроен.
  ЧТО ПРОВЕРИТЬ: partialize в useSettingsStore включает
    lastStrategyId.

ГИПОТЕЗА 7: Кнопка «Продолжить» не работает, если стратегия
   удалена из папки
  ПРИЧИНА: lastStrategyId указывает на несуществующую
    стратегию.
  ЧТО ПРОВЕРИТЬ: useLastStrategy возвращает undefined, если
    стратегия не найдена. В UI — переход в Strategies.

ГИПОТЕЗА 8: Пинг всегда 0 или всегда timeout
  ПРИЧИНА: firewall блокирует, или TcpStream::connect не
    работает на порт 443.
  ЧТО ПРОВЕРИТЬ: заменить на ping через ICMP (требует
    admin) или использовать TCP на разные порты. Тестировать
    отдельно.

ГИПОТЕЗА 9: Флаг страны не отображается
  ПРИЧИНА (исходная гипотеза была неверна): Windows 10
  якобы «без эмодзи-шрифта». На деле Segoe UI Emoji есть,
  но эмодзи-флаги всё равно отображаются как буквы,
  а в неоновой палитре выглядят инородно.
  РЕШЕНИЕ (принято): circle-flags, скачать в
  src/assets/flags на этапе сборки (см. Решение 3).
  Проверить: флаг Netherlands отрисован как SVG,
  а не как «NL» буквами.

ГИПОТЕЗА 10: Сетка ломается на узких окнах
  ПРИЧИНА: фиксированные ширины.
  ЧТО ПРОВЕРИТЬ: использовать grid с auto-fit/minmax.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev

2. Приложение открывается на Dashboard (activePage=dashboard)
   ОЖИДАНИЕ:
   • Greeting по времени суток
   • StatusOrb серый (disconnected)
   • Кнопка «Подключиться» (primary)
   • Statistics: 0 активных, 0 ошибок
   • Connection: IP появился через 1 сек
   • Ping: пустые спарклайны (первые секунды)
   • Recent logs: empty state

3. Подождать 5 секунд
   ОЖИДАНИЕ:
   • Ping: 3 спарклайна заполняются
   • Точки зелёные

4. Перейти в Strategies, запустить стратегию
   ОЖИДАНИЕ:
   • StatusOrb → зелёный, пульсирует
   • Hero: название стратегии «Discord + YouTube»
   • Кнопка стала «Отключиться» (danger)
   • Statistics: 1 активная
   • Uptime начал тикать
   • Recent logs: 5 последних событий

5. Проверить VPN toggle
   ОЖИДАНИЕ:
   • Индикатор слева (DPI)
   • Клик → toast «VPN появится в Этапе 14»
   • Индикатор не переехал (заглушка)

6. Клик «Отключиться»
   ОЖИДАНИЕ:
   • StatusOrb → серый
   • Кнопка → «Подключиться»
   • Statistics: 0 активных

7. Клик «Продолжить: Discord + YouTube»
   ОЖИДАНИЕ: стратегия запускается

8. Клик «Все логи →»
   ОЖИДАНИЕ: переход на страницу Logs

9. Проверить кэш network info:
   • Подождать 6 минут
   ОЖИДАНИЕ: автоматическое обновление

10. Клик обновления (RefreshCw) в Connection
    ОЖИДАНИЕ: данные обновляются вручную

11. Изменить размер окна на 1024px
    ОЖИДАНИЕ: сетка переходит на 2 колонки

12. Изменить размер на 640px
    ОЖИДАНИЕ: 1 колонка

13. Открыть DevTools → Performance → записать 10 сек
    ОЖИДАНИЕ: 60 FPS, нет long tasks

14. Проверить, что пульсация не тормозит:
    • Performance → Rendering → Paint flashing
    ОЖИДАНИЕ: минимальные repaints

15. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

16. cargo check
    ОЖИДАНИЕ: 0 warning'ов

17. Открыть React DevTools → Profiler
    ОЖИДАНИЕ: usePing не ре-рендерит весь Dashboard

18. Task Manager → RAM
    ОЖИДАНИЕ: <250 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать any
❌ Не делать fetch напрямую из frontend (использовать Rust)
❌ Не забывать cleanup в useEffect (пинг, uptime)
❌ Не забывать AbortController для fetch
❌ Не подписываться на весь стор
❌ Не рендерить весь LogRow в Dashboard (упрощённая версия)
❌ Не анимировать box-shadow (только transform/opacity)
❌ Не забывать will-change: transform для пульсации
❌ Не хардкодить IP-API URL (в константах)
❌ Не забывать про кэш network info
❌ Не вызывать fetch при каждом рендере
❌ Не забывать persist для lastStrategyId
❌ Не начинать Этап 10 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 9 завершён, если ВСЕ пункты выполнены:

✅ network.rs реализован (ping_hosts, fetch_network_info)
✅ Команды зарегистрированы
✅ StatusOrb с пульсацией для active статусов
✅ DashboardHero: индикатор + название + кнопка
✅ DashboardStats: 4 метрики обновляются
✅ DashboardConnection: IP, страна, флаг, провайдер
✅ DashboardPing: 3 спарклайна, обновление 5 сек
✅ DashboardRecentLogs: 5 логов + кнопка «Все»
✅ DashboardQuickActions: Play/Stop + VPN toggle
✅ VpnToggle: заглушка с анимацией
✅ PingSparkline: SVG polyline
✅ useNetworkInfo с кэшем и fallback
✅ usePing с историей 30 точек
✅ useUptime с тиком 1 сек
✅ lastStrategyId в useSettingsStore + persist
✅ useLastStrategy, useActiveStrategy селекторы
✅ Greeting по времени суток
✅ Адаптивная сетка (3/2/1 колонки)
✅ 60 FPS при пульсации
✅ Клик «Все логи» → переход в Logs
✅ Клик «Продолжить» → запуск стратегии
✅ Если нет lastStrategy — переход в Strategies
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ Консоль чистая
✅ RAM <250 MB
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 9 ВЫПОЛНЕН 2026-10-06
═══════════════════════════════════════════════════════════════════════

Реализовано Rust:
  • commands/network.rs       — ping_hosts (JoinSet), fetch_network_info
  • commands/network_tests.rs  — 13 тестов
  • lib.rs                     — регистрация двух команд

Реализовано frontend:
  • hooks/useNetworkInfo.ts    — кэш 5 мин, refresh, ошибки
  • hooks/usePing.ts           — интервал 5 с, история 30 точек
  • hooks/useUptime.ts         — тик 1 с, формат HH:mm:ss
  • lib/geo.ts                 — флаги, getGreeting
  • lib/pingUtils.ts           — спарклайн, цвет задержки
  • components/dashboard/StatusOrb.tsx
  • components/dashboard/PingSparkline.tsx
  • components/dashboard/VpnToggle.tsx
  • components/dashboard/CountryFlag.tsx
  • components/dashboard/DashboardHero.tsx
  • components/dashboard/DashboardStats.tsx
  • components/dashboard/DashboardConnection.tsx
  • components/dashboard/DashboardPing.tsx
  • components/dashboard/DashboardRecentLogs.tsx
  • components/dashboard/DashboardQuickActions.tsx
  • pages/Dashboard.tsx        — 130 строк
  • lastStrategyId в useSettingsStore + persist
  • селекторы useLastStrategy, useActiveStrategy, useRunningStartedAt

Проверено запуском:
  ✅ Greeting «Доброй ночи»
  ✅ Hero: серый orb, «Отключено», кнопка «Подключиться»
  ✅ Метрики: 4 счётчика в реальном времени
  ✅ IP 79.139.162.72, Russian Federation, Moscow, провайдер
  ✅ Флаг страны круглым SVG с обводкой палитры
  ✅ Пинг трёх сервисов: 20–33 мс, спарклайны зелёные, 30 точек истории
  ✅ Запуск стратегии: orb зелёный с пульсацией, «Отключить»
  ✅ Uptime тикает: 00:00:01 → 00:00:52
  ✅ Активных = 1
  ✅ Последние 5 событий видны, новые сверху
  ✅ Кнопка «Продолжить: {name}» с именем стратегии
  ✅ Остановка → orb серый, winws.exe: 0
  ✅ VPN toggle переезжает, подпись меняется
  ✅ «Все логи» → переход на Logs
  ✅ RAM 38 МБ
  ✅ 93/93 Rust-теста
  ✅ tsc 0, eslint 0, prettier 0, build 0
  ✅ cargo check — 0 ошибок, 0 warning'ов
  ✅ Нет any, TODO/FIXME, console.log, комментариев
  ✅ Файлы < 300 строк

ГЛАВНАЯ НАХОДКА ЭТАПА:
  ipwho.is и ipapi.co с этой машины не работают. DNS резолвит, TCP 443
  соединяется, но TLS-хендшейк зависает до таймаута. При этом curl к тем
  же адресам отвечает мгновенно — то есть дело в HTTP-клиенте reqwest,
  а не в сети. Найдено отдельным бинарником: reqwest получает TimedOut
  на обоих адресах. Решение: цепочка из трёх провайдеров, добавлен
  freeipapi.com — отвечает и отдаёт все нужные поля. README O46.

Также пришлось добавить пятый статус ConnectionStatus «error»: в
спецификации требовались иконка и цвет для Error, но в типе было только
четыре значения. Дополнены orb, Sidebar и селектор статуса. README O50.

НЕ ПРОВЕРЕНО:
  ⚠ Адаптивность на 640px и 1024px — окно зафиксировано 1280×800, менять
    размер окна скриптом не пробовал.
  ⚠ FPS через DevTools: расширения нет, webview без инструментов
    профилирования. Вместо этого замерена стабильность: за 3 минуты
    работы с пульсацией и пингом RAM выросла на 0 МБ.

Отклонения: README.md раздел «Отклонения этапа 9», O46–O50.

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 10
═══════════════════════════════════════════════════════════════════════

После Этапа 9 у нас есть:
  • Полноценный Dashboard — «лицо» приложения
  • Hero-панель со статусом и пульсацией
  • Информация о соединении (IP, страна, провайдер)
  • Мини-график пинга (3 сервиса)
  • Быстрые действия (Play/Stop, VPN toggle)
  • Последние 5 логов
  • 4 метрики-счётчика
  • Greeting по времени суток
  • Готовность к Этапу 10 — «Игра в стратегий»

На Этапе 10 нужно будет:
  • Создать интерактивную визуализацию стратегий в виде
    «карт» (геймификация)
  • Каждая стратегия — карта с характеристиками (какие
    сервисы, скорость, стабильность)
  • Возможность «играть»: выбирать карты, сравнивать,
    запускать
  • Анимации: появление карт, переворот, свечение при
    выборе
  • Это первый сигнатурный момент приложения

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 9 — СТОП.

Не начинай Этап 10. Не создавай «игру в стратегий», не
делай карточки с геймификацией.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 10
  • "Правка: ..." — правка в Этап 9
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.