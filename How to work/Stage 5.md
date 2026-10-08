═══════════════════════════════════════════════════════════════════════
ЭТАП 5: RUST-БЭКЕНД — СКАНЕР .BAT ФАЙЛОВ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Научить Rust-бэкенд приложения сканировать выбранную папку с
.bat файлами, парсить их содержимое, определять тип стратегии
(winws, GoodbyeDPI, Zapret), определять, какие сервисы обходит
стратегия (Discord, YouTube, Outlast Trials, общие), и возвращать
типизированный список в TypeScript.

Подключить этот функционал к React через хук useStrategies,
который автоматически обновляет стор useStrategiesStore (созданный
на Этапе 4). Заменить моковые данные на реальные.

После этого этапа пользователь сможет:
  • Выбрать папку с .bat файлами через системный диалог
  • Увидеть список всех стратегий с именами, описаниями и
    бейджами сервисов
  • Обновить список одной кнопкой
  • Увидеть empty state, если папка пуста или не выбрана

Это первый «настоящий» функционал приложения. Он должен работать
без сбоев: не падать на невалидных .bat, не блокировать UI,
не терять данные при переключении страниц.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Сканирование через Rust, не через frontend 】

ОБОСНУЙ:
  • Rust имеет доступ к файловой системе на уровне ОС
    (быстрее, безопаснее)
  • Frontend (браузер) не имеет прямого доступа к диску —
    пришлось бы использовать Tauri fs plugin (медленнее)
  • Rust может параллельно читать файлы (tokio + rayon)
  • Rust может корректно обрабатывать ошибки на уровне ОС
    (permission denied, path not found, invalid utf-8)
  • Результат сериализуется через serde — быстро

ПОЧЕМУ НЕ TAURI FS PLUGIN НАПРЯМУЮ ИЗ JS:
  • Медленнее (каждый вызов — IPC между Rust и JS)
  • Нет параллелизма
  • Обработка ошибок сложнее
  • Нет парсинга — только чтение сырых строк

【 РЕШЕНИЕ 2: Асинхронная команда Tauri (не блокирует UI) 】

ОБОСНУЙ:
  • Сканирование 50+ файлов занимает время (10–500ms)
  • Если команда синхронная — UI замирает
  • Асинхронная команда выполняется в отдельном потоке tokio
  • UI остаётся отзывчивым, показывает спиннер
  • При отмене — задача может быть прервана (не обязательно
    на этом этапе, но задел на будущее)

ПОЧЕМУ НЕ SYNC КОМАНДА:
  • При 100 .bat файлов UI замерзает на секунду
  • Нет способа показать прогресс
  • Плохой UX

【 РЕШЕНИЕ 3: Параллельное чтение через tokio::task::JoinSet 】

ОБОСНУЙ:
  • Файлы не зависят друг от друга — можно читать параллельно
  • tokio::task::JoinSet позволяет запустить N задач и дождаться
    всех
  • На SSD 50 файлов читаются за 20ms вместо 200ms
  • Ограничение параллелизма: 8 одновременных чтений
    (чтобы не перегружать диск)

ПОЧЕМУ НЕ ПОСЛЕДОВАТЕЛЬНОЕ ЧТЕНИЕ:
  • Медленно на больших папках
  • Не использует преимущества SSD

ПОЧЕМУ НЕ RAYON:
  • Rayon — для CPU-bound задач
  • Чтение файлов — I/O-bound
  • Tokio лучше подходит для async I/O

【 РЕШЕНИЕ 4: Определение сервисов по имени + содержимому 】

ОБОСНУЙ:
  • Имя файла: `discord_youtube.bat` → services: ["discord",
    "youtube"]
  • Содержимое: если в файле упоминается `--hostlist=list-discord.txt`
    или `discord.com` — добавить "discord"
  • Комбинация даёт 95%+ точность
  • Список доменов для каждого сервиса — в constants.rs

ЛОГИКА:
  1. Сначала парсим имя файла (быстро)
  2. Если сервисы не найдены — парсим содержимое
  3. Если и там нет — services: ["general"]
  4. Убираем дубликаты (HashSet)

ПОЧЕМУ НЕ ПАРСИНГ ТОЛЬКО ПО ИМЕНИ:
  • Файлы могут называться `strategy1.bat`, `alt2.bat`
  • Пользователь может переименовать
  • Содержимое надёжнее

ПОЧЕМУ НЕ ПАРСИНГ ТОЛЬКО ПО СОДЕРЖИМОМУ:
  • Медленнее (нужно читать все файлы)
  • Иногда имя точнее (например, `outlast_trials.bat`)

【 РЕШЕНИЕ 5: Определение типа стратегии (winws, GoodbyeDPI, Zapret) 】

ОБОСНУЙ:
  • Разные типы стратегий запускаются по-разному
  • winws.exe — запускается с аргументами
  • GoodbyeDPI — отдельный .exe
  • Zapret — обёртка над winws
  • Определяем по содержимому .bat:
    - есть `winws.exe` → "winws"
    - есть `goodbyedpi.exe` → "goodbye-dpi"
    - есть `zapret` в пути → "zapret"
    - иначе → "unknown"
  • Пригодится на Этапе 6 (запуск) и Этапе 8 (инъекция доменов)

ПОЧЕМУ НЕ ОПРЕДЕЛЯТЬ ПО РАСШИРЕНИЮ:
  • Все .bat — одинаковое расширение
  • Нужно содержимое

【 РЕШЕНИЕ 6: Кэширование результатов сканирования 】

ОБОСНУЙ:
  • Сканирование 100+ файлов может занять секунду
  • Кэш: HashMap<PathBuf, (mtime, Vec<StrategyInfo>)>
  • Если mtime папки не изменился — вернуть кэш
  • Кэш в памяти (не persist)
  • Инвалидация: при изменении mtime папки или по кнопке
    «Обновить»

ПОЧЕМУ НЕ БЕЗ КЭША:
  • При переключении страниц — повторное сканирование
  • Медленно

ПОЧЕМУ НЕ PERSIST КЭШ:
  • Сложность (нужно инвалидировать при изменении файлов)
  • Сканирование не настолько медленное

【 РЕШЕНИЕ 7: Тип StrategyInfo в Rust с camelCase для serde 】

ОБОСНУЙ:
  • Rust: snake_case (идиоматично)
  • TypeScript: camelCase (идиоматично)
  • Serde переименовывает автоматически:
    #[serde(rename_all = "camelCase")]
  • Не нужны конвертеры на frontend
  • Меньше ошибок

ПОЧЕМУ НЕ КОНВЕРТИРОВАТЬ НА FRONTEND:
  • Дублирование кода
  • Легко забыть поле
  • Ошибки не видны в типах

【 РЕШЕНИЕ 8: Обработка ошибок через AppError (Этап 1) 】

ОБОСНУЙ:
  • Все ошибки типизированы
  • Ошибки сериализуются в строку для frontend
  • Frontend показывает понятное сообщение:
    «Папка не существует», «Нет прав на чтение», «Файл повреждён»
  • Не паникуем на невалидных данных

ОБРАБОТКА:
  • Папка не существует → AppError::Custom("Папка не найдена")
  • Нет прав → AppError::Io с понятным сообщением
  • Файл не UTF-8 → пропускаем файл, логируем warning
  • Файл пустой → пропускаем
  • Нет .bat файлов → пустой Vec (не ошибка)

【 РЕШЕНИЕ 9: Хук useStrategies с автообновлением стора 】

ОБОСНУЙ:
  • Хук инкапсулирует вызов Tauri-команды
  • При монтировании — сканирует папку из settings
  • Обновляет useStrategiesStore.setStrategies()
  • Возвращает { strategies, isLoading, error, refresh }
  • React-компоненты используют хук, не вызывают invoke напрямую

ПОЧЕМУ НЕ ВЫЗЫВАТЬ INVOKE ИЗ КОМПОНЕНТОВ:
  • Дублирование логики
  • Нет автоматической синхронизации со стором
  • Сложно тестировать

【 РЕШЕНИЕ 10: Empty state и Loading state в UI 】

ОБОСНУЙ:
  • Empty state:
    - Папка не выбрана → кнопка «Выбрать папку»
    - Папка выбрана, но пуста → «В папке нет .bat файлов»
    - Папка выбрана, есть файлы → список
  • Loading state:
    - Скелетоны (5–6 штук), пока идёт сканирование
    - При повторном сканировании — спиннер в углу
    - Кнопка «Обновить» блокируется на время сканирования

ПОЧЕМУ НЕ ПРОСТО ПУСТОЙ ЭКРАН:
  • Плохой UX
  • Пользователь не понимает, что происходит

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/src/constants.rs 】
Назначение: константы для парсинга стратегий.

Содержит:
  • SERVICE_KEYWORDS: HashMap<&str, Vec<&str>> — слова,
    по которым определяем сервис.
    ПОРЯДОК ПРИОРИТЕТА: сначала имя файла, потом содержимое.
    - "discord" → ["discord", "discord.com",
       "discordapp.com", "list-discord"]
    - "youtube" → ["youtube", "youtu.be", "googlevideo",
       "list-google", "list-youtube"]
    - "outlast-trials" → ["outlast", "outlasttrials",
       "list-outlast", "outlast-trials"]
    - "general" → ["general", "list-general", "baseline"]

    ВАЖНО: в текущем наборе zapret ВСЕ 22 стратегии
    содержат домены Discord (list-general.txt), поэтому
    контент-детекция пометила бы их все как discord.
    Имя файла проверяется первым, содержимое — только
    если имя не дало результата.

  • STRATEGY_TYPE_KEYWORDS:
    - "winws" → ["winws.exe", "winws "]
    - "goodbye-dpi" → ["goodbyedpi.exe", "goodbye-dpi"]
    - "zapret" → ["zapret"]

  • TECHNIQUE_KEYWORDS: HashMap<&str, Vec<&str>> — реальное
    различие между стратегиями. Именно техники, а не сервисы,
    различают эти 22 файла:
    - "faketls" → ["faketls", "fake-tls", "tls_clienthello_",
       "--dpi-desync-fake-tls"]
    - "multisplit" → ["--dpi-desync=multisplit"]
    - "split-seqovl" → ["--dpi-desync-split-seqovl="]
    - "quic-fake" → ["--dpi-desync-fake-quic="]
    - "l7-filter" → ["--filter-l7="]
    - "ipset" → ["--ipset=\""]
    - "any-protocol" → ["--dpi-desync-any-protocol"]
    - "cutoff" → ["--dpi-desync-cutoff="]
    - "fake" → ["--dpi-desync=fake"]

  • MAX_CONCURRENT_READS: usize = 8
  • MAX_FILE_SIZE_FOR_PARSE: u64 = 1024 * 1024 (1 MB)
  • DESCRIPTION_LINE_PREFIXES: Vec<&str> — префиксы для
    извлечения описания:
    ["REM", "::", "@echo off", "echo"]
  • SKIP_DESCRIPTION_PREFIXES: Vec<&str> — служебные
    комментарии, которые нужно ПРОПУСТИТЬ при поиске
    описания. Первые строки каждого .bat в zapret:
      @echo off
      chcp 65001 > nul
      :: 65001 - UTF-8
    Без этого фильтра у всех 22 стратегии описание
    «65001 - UTF-8»:
    [":: 65001", "chcp ", "@echo off", "call ", "set ",
     "cd /d", "echo:"]

【 1a. src-tauri/src/bat_env.rs (новое) 】
Назначение: разбор переменных окружения внутри .bat.

ЗАЧЕМ: стратегии zapret не содержат прямых путей. Внутри .bat:
  set "BIN=%~dp0bin\"
  set "LISTS=%~dp0lists\"
  ...
  --hostlist="%LISTS%list-general.txt"
  --ipset="%LISTS%ipset-all.txt"
Без подстановки регекс вернёт `"%LISTS%list-general.txt"` —
с кавычками и плейсхолдером. Инъекция доменов (этап 8)
в такой путь не запишет.

Функции:
  • extract_set_vars(content: &str) -> HashMap<String, String>
    — все `set "NAME=value"` и `set NAME=value`
  • expand_percent_vars(
      value: &str,
      vars: &HashMap<String, String>,
      script_dir: &Path,
    ) -> String
    — подставляет %NAME% и %~dp0, итеративно до 8 проходов
      (защита от %A% → %B% → зацикливания)
  • strip_quotes(value: &str) -> &str
    — снимает внешние парные кавычки
  • resolve_path(
      raw: &str,
      vars: &HashMap<String, String>,
      script_dir: &Path,
    ) -> Option<PathBuf>
    — полный конвейер: expand → strip_quotes → PathBuf

Требования:
  • Чистые функции, без файлового ввода-вывода
  • Без регулярных выражений, если хватает split/trim
  • Юникод-безопасные (кириллица в путях)
  • Re-export в lib.rs для использования этапом 8

【 2. src-tauri/src/commands/mod.rs 】
Назначение: регистрация всех команд.

Реализация:
  • pub mod scanner;
  • pub use scanner::{scan_strategies, get_default_strategies_path};

【 3. src-tauri/src/commands/scanner.rs 】
Назначение: основная логика сканирования.

Структуры:
  • StrategyInfo (Serialize) с полями:
    - id: String (генерируется через nanoid или hash пути)
    - name: String (читаемое имя из filename)
    - filename: String
    - path: String
    - description: String
    - services: Vec<String>
    - techniques: Vec<String>  (НОВОЕ — см. constants.rs
      TECHNIQUE_KEYWORDS; различает стратегии между собой,
      используется для редкости карт в этапе 10)
    - fileType: String ("winws" | "goodbye-dpi" | "zapret" | "unknown")
    - version: Option<String> (если найдена в файле)
    - size: u64 (размер в байтах)
    - modifiedAt: Option<u64> (Unix ms)
  • ScanError (для внутренней обработки ошибок отдельного файла)

Команды:
  • scan_strategies(folder: String) -> Result<Vec<StrategyInfo>,
    AppError>
    Логика:
    1. Проверить, что папка существует
    2. Прочитать содержимое папки (std::fs::read_dir)
    3. Отфильтровать .bat файлы (регистронезависимо)
    4. Параллельно прочитать содержимое каждого файла
       (tokio::task::JoinSet, лимит 8 одновременных)
    5. Для каждого:
       - Прочитать содержимое (до 1 MB)
       - Пропустить, если не UTF-8 (логировать warning)
       - Извлечь имя (без .bat)
       - Извлечь описание (первая строка с REM/::/echo,
         ПРОПУСКАЯ строки из SKIP_DESCRIPTION_PREFIXES)
       - Определить services: сначала по имени файла,
         только если пусто — по содержимому
       - Определить techniques по TECHNIQUE_KEYWORDS
       - Определить fileType
       - Извлечь версию (regex, если есть)
       - Получить metadata (размер, mtime)
    6. Отсортировать по имени
    7. Вернуть Vec<StrategyInfo>

  • get_default_strategies_path() -> Result<String, AppError>
    Логика:
    • Вернуть путь %APPDATA%/ZapretManager/strategies/
    • Использовать dirs::config_dir()
    • Не проверять существование (папка может быть создана
      на Этапе 16 при первом запуске)

Вспомогательные функции (private):
  • extract_name(filename: &str) -> String
    - "discord_youtube.bat" → "Discord + YouTube"
    - Заменяет "_" и "-" на пробел, capitalize
  • extract_description(content: &str) -> String
    - Ищет первую строку, начинающуюся с REM / :: / @echo
    - ПРОПУСКАЕТ строки из SKIP_DESCRIPTION_PREFIXES
      (`:: 65001 - UTF-8`, `chcp`, `call`, `set`, `cd /d`)
    - Убирает префикс
    - Ограничивает 200 символами
    - Если ничего не найдено — вернуть пустую строку,
      вызывающий код подставит имя файла

  • extract_techniques(content: &str) -> Vec<String>
    - Проверяет TECHNIQUE_KEYWORDS, возвращает уникальные
    - Источник различия между 22 стратегиями zapret
    - Порядок стабильный: TECHNIQUE_KEYWORDS задаёт порядок

  • detect_services(name: &str, content: &str) -> Vec<String>
    - ШАГ 1: проверить ключевые слова в ИМЕНИ файла
    - ШАГ 2: только если шаг 1 дал пусто — проверить
      содержимое
    - Возвращает уникальные сервисы
    - Если ничего не найдено — ["general"]
  • detect_file_type(content: &str) -> String
    - По keywords из constants.rs
  • extract_version(content: &str) -> Option<String>
    - Regex для "v1.2.3" / "version 1.2" и т.п.
    - Возвращает первый match

Требования:
  • Асинхронные команды (#[tauri::command])
  • Все ошибки через AppError (Этап 1)
  • Логирование через tracing (info/warn/error)
  • Никаких unwrap() без обоснования
  • Все строки — на русском в сообщениях об ошибках

【 4. src-tauri/src/lib.rs (обновить) 】
Назначение: зарегистрировать команды.

Изменения:
  • Добавить mod constants;
  • Добавить mod commands;
  • В invoke_handler добавить:
    - commands::scan_strategies
    - commands::get_default_strategies_path

【 5. src-tauri/Cargo.toml (обновить) 】
Назначение: добавить зависимости для сканера.

Добавить:
  • walkdir = "2.5.0" — для рекурсивного обхода (на будущее)
  • chrono = { version = "0.4.39", features = ["serde"] } —
    для работы с датами (mtime → ISO)
  • once_cell = "1.20.2" — для ленивой инициализации
    констант (HashMap)

НЕ добавлять:
  • notify — пока не нужен (слежение за изменениями папки
    будет на Этапе 12 или позже)

【 6. src/hooks/useStrategies.ts 】
Назначение: React-хук для сканирования и синхронизации со стором.

Состояние (локальное):
  • isLoading: boolean
  • error: string | null
  • lastScanAt: number | null (локальная копия для отображения)

Методы:
  • refresh(): Promise<void> — пересканировать папку из settings
  • scanFolder(path: string): Promise<void> — сканировать
    конкретную папку (для первого выбора)

Логика:
  • При mount — если settings.strategiesFolder не пуст →
    вызвать scanFolder(settings.strategiesFolder)
  • scanFolder:
    1. setLoading(true)
    2. invoke("scan_strategies", { folder: path })
    3. При успехе: useStrategiesStore.setStrategies(result),
       setLoading(false)
    4. При ошибке: setError(e.message), setLoading(false),
       addLog(error)
  • refresh — то же, но берёт путь из settings

Возвращает:
  • { isLoading, error, refresh, scanFolder }

Требования:
  • Не вызывать scanFolder при каждом ре-рендере (useEffect
    с dependencies [settings.strategiesFolder])
  • Обрабатывать ошибки через try/catch
  • Логировать успех/ошибку в useLogsStore
  • Cleanup при unmount (флаг isMounted для async)

【 7. src/hooks/useFolderPicker.ts 】
Назначение: хук для выбора папки через Tauri dialog.

Логика:
  • open() → dialog.open({ directory: true, multiple: false })
  • Если пользователь выбрал — обновить
    useSettingsStore.updateSettings({ strategiesFolder: path })
  • Вернуть выбранный путь

Возвращает:
  • { pickFolder: () => Promise<string | null> }

Требования:
  • Использовать @tauri-apps/plugin-dialog
  • Не падать при отмене (пользователь закрыл диалог)

【 8. src/pages/Strategies.tsx (реализовать полностью) 】
Назначение: страница со списком стратегий.

Структура:
  • Заголовок H1: «Стратегии»
  • Подзаголовок: «Управление .bat-файлами обхода блокировок»
  • Панель управления:
    - Кнопка «Выбрать папку» (secondary, icon FolderOpen)
    - Кнопка «Обновить» (ghost, icon RefreshCw,
      disabled при isLoading)
    - Отображение текущего пути (mono, text-xs, обрезается
      посередине)
    - Счётчик: «6 стратегий» (Badge neutral)
  • Контент:
    - isLoading && стратегий нет → Skeleton × 6
    - isLoading && стратегии есть → список + спиннер в углу
    - error → Badge error + сообщение + кнопка «Повторить»
    - empty и папка не выбрана → EmptyState с кнопкой
      «Выбрать папку»
    - empty и папка выбрана → EmptyState «В папке нет
      .bat файлов»
    - есть стратегии → сетка карточек

Карточка стратегии (компонент StrategyCard):
  • Создать src/components/strategies/StrategyCard.tsx
  • Название (Inter 600, 16px)
  • Filename (mono, text-xs, text-secondary)
  • Description (text-sm, text-secondary, обрезается 2 строками)
  • Бейджи сервисов (Discord, YouTube, Outlast Trials, General)
  • Статус-бейдж (idle — neutral, running — success с pulse)
  • Размер файла (KB) и дата изменения (relative)
  • Кнопки: Play (пока заглушка, работает на Этапе 6),
    More (dropdown на будущее)

Требования:
  • Grid: 1 колонка на mobile, 2 на md, 3 на lg
  • Gap 16px
  • Карточки — Card variant="interactive"
  • Все данные — из useStrategiesStore через useShallow
  • Не подписываться на весь стор

【 9. src/components/strategies/StrategyCard.tsx 】
Создать новый файл.

Пропсы:
  • strategy: Strategy

Рендер:
  • Card variant="interactive"
  • Header: name + Badge status
  • Filename: mono text-xs
  • Description: line-clamp-2
  • Footer: services badges + size/date

【 10. src/components/strategies/EmptyState.tsx 】
Назначение: переиспользуемый пустой экран.

Пропсы:
  • icon: ReactNode
  • title: string
  • description: string
  • action?: { label: string; onClick: () => void }

Рендер:
  • Центрированный блок
  • Иконка в круге (bg-white/5, 64x64)
  • Title (Inter 600, 18px)
  • Description (text-secondary)
  • Кнопка действия

【 11. src/components/strategies/StrategySkeleton.tsx 】
Назначение: скелетон карточки стратегии.

Рендер:
  • Card с Skeleton-элементами
  • Имитация: title, filename, description (2 строки),
    бейджи

【 12. src/lib/format.ts (создать или дополнить) 】
Назначение: форматирование данных для UI.

Функции:
  • formatFileSize(bytes: number): string — «12 KB», «1.2 MB»
  • formatRelativeTime(ms: number): string — «5 минут назад»,
    «2 часа назад», «вчера»
  • formatPath(path: string, maxLength: number): string —
    обрезает середину пути: «C:\...\strategies»
  • capitalizeService(service: ServiceType): string —
    «discord» → «Discord», «outlast-trials» →
    «Outlast Trials», «youtube» → «YouTube»

Требования:
  • Все функции — чистые, типизированные
  • Тестируемые

【 13. src/lib/serviceColors.ts 】
Назначение: цвета для бейджей сервисов.

Содержит:
  • SERVICE_COLORS: Record<ServiceType, BadgeVariant>
    - discord → "info" (синий)
    - youtube → "error" (красный)
    • outlast-trials → "accent" (неоновый)
    • general → "neutral" (серый)

【 14. src-tauri/src/commands/scanner_tests.rs (опционально) 】
Назначение: unit-тесты для парсинга (Rust).

Тесты:
  • test_extract_name — "general-00-baseline.bat" →
    "General Baseline"
  • test_extract_name_with_parens — "general (ALT2).bat" →
    "General Alt2"
  • test_detect_services_by_name — "discord_youtube" →
    ["discord", "youtube"]
  • test_detect_services_priority_name — имя "general-05-alt"
    + содержимое со словом discord → ["general"],
    а НЕ ["discord"]
  • test_detect_services_fallback_content — имя "custom-1",
    содержимое с "list-outlast.txt" → ["outlast-trials"]
  • test_detect_services_fallback_general — пустое имя
    и содержимое → ["general"]
  • test_extract_techniques_real_bat — реальный фрагмент
    general.bat с --ipset= и --filter-l7= →
    содержит "ipset" и "l7-filter"
  • test_detect_file_type — содержимое с "winws.exe" →
    "winws"
  • test_extract_description_skips_chcp — реальное начало
    general.bat (@echo off / chcp 65001 / :: 65001 - UTF-8)
    → описание НЕ равно "65001 - UTF-8"
  • test_extract_description — содержимое с
    "REM Description" → "Description"
  • test_extract_version — содержимое с "v1.2.3" →
    Some("1.2.3")
  • test_scan_empty_folder — возвращает пустой Vec
  • test_scan_nonexistent_folder — возвращает ошибку

Тесты bat_env.rs:
  • test_extract_set_vars_quoted — `set "LISTS=%~dp0lists\"`
  • test_extract_set_vars_unquoted — `set GAME=12`
  • test_expand_percent_vars — `%LISTS%list-general.txt`
    + vars{LISTS: "C:\s\"} → `C:\s\list-general.txt`
  • test_expand_percent_vars_dp0 — `%~dp0bin\` →
    путь к папке скрипта + `bin\`
  • test_expand_no_infinite_loop — `%A%` где A=%B%,
    B=%A% → обрывается после 8 проходов
  • test_strip_quotes — `"C:\path"` → `C:\path`
  • test_resolve_path_real_bat_arg —
    `--hostlist="%LISTS%list-general.txt"` → существующий
    PathBuf внутри lists/
  • test_resolve_path_cyrillic — путь с кириллицей

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создать src-tauri/src/constants.rs
  • SERVICE_KEYWORDS, STRATEGY_TYPE_KEYWORDS,
    TECHNIQUE_KEYWORDS, MAX_CONCURRENT_READS,
    MAX_FILE_SIZE_FOR_PARSE, DESCRIPTION_LINE_PREFIXES,
    SKIP_DESCRIPTION_PREFIXES
  • Использовать once_cell::sync::Lazy для HashMap

ШАГ 1a: Создать src-tauri/src/bat_env.rs
  • extract_set_vars, expand_percent_vars, strip_quotes,
    resolve_path
  • Чистые функции, тесты на реальном фрагменте general.bat
  • re-export в lib.rs

ШАГ 2: Создать src-tauri/src/commands/scanner.rs
  • Структура StrategyInfo с serde
  • Публичные команды scan_strategies и
    get_default_strategies_path
  • Приватные хелперы: extract_name, extract_description,
    detect_services, detect_file_type, extract_version

ШАГ 3: Создать src-tauri/src/commands/mod.rs
  • pub mod scanner;
  • Реэкспорт команд

ШАГ 4: Обновить src-tauri/src/lib.rs
  • Добавить mod constants;
  • Добавить mod commands;
  • Зарегистрировать команды в invoke_handler

ШАГ 5: Обновить src-tauri/Cargo.toml
  • Добавить walkdir, chrono, once_cell
  • cargo check — без warning'ов

ШАГ 6: Создать src/hooks/useStrategies.ts
  • Логика сканирования + синхронизация со стором
  • Обработка ошибок и loading
  • Логирование через useLogsStore

ШАГ 7: Создать src/hooks/useFolderPicker.ts
  • Обёртка над Tauri dialog
  • Обновление settings

ШАГ 8: Создать src/lib/format.ts
  • formatFileSize, formatRelativeTime, formatPath,
    capitalizeService

ШАГ 9: Создать src/lib/serviceColors.ts
  • Маппинг сервисов на Badge variant

ШАГ 10: Создать src/components/strategies/StrategyCard.tsx
  • Карточка с бейджами и статусом

ШАГ 11: Создать src/components/strategies/StrategySkeleton.tsx
  • Скелетон для loading state

ШАГ 12: Создать src/components/strategies/EmptyState.tsx
  • Переиспользуемый empty state

ШАГ 13: Реализовать src/pages/Strategies.tsx
  • Панель управления
  • Условный рендеринг: loading / error / empty / list
  • Сетка карточек

ШАГ 14: Подключить навигацию
  • В App.tsx заменить заглушку Strategies.tsx на реализацию
  • Проверить: клик в Sidebar → «Стратегии» → страница работает

ШАГ 15: Написать unit-тесты (Rust)
  • scanner_tests.rs с 8 тестами
  • cargo test — все проходят

ШАГ 16: Финальная проверка
  • pnpm tauri dev — запускается
  • Перейти в Strategies → выбрать папку с .bat
  • Увидеть список с корректными бейджами
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • cargo test — все тесты зелёные
  • Пройти чек-лист Части 4

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 RUST — TYPE SAFETY 】
  □ StrategyInfo с #[serde(rename_all = "camelCase")]
  □ Все ошибки через AppError, никаких паник
  □ Никаких unwrap() без обоснования (если есть — комментарий)
  □ Результаты чтения файлов — через Result
  □ Пропуск невалидных файлов через continue + tracing::warn

【 RUST — ASYNC 】
  □ scan_strategies — async fn
  □ Чтение файлов через tokio::task::JoinSet
  □ Лимит параллелизма: 8
  □ Не блокировать tokio runtime синхронными вызовами
  □ Если нужен sync-вызов — spawn_blocking

【 RUST — ЛОГИКА 】
  □ Сканирование работает на папке с 100+ файлов
  □ Невалидные .bat пропускаются без падения
  □ Файлы >1 MB пропускаются
  □ Не-UTF-8 файлы пропускаются с warning
  □ Пустая папка → пустой Vec (не ошибка)
  □ Несуществующая папка → AppError

【 RUST — ПЕРЕМЕННЫЕ .BAT (D1) 】
  □ bat_env::extract_set_vars находит `set "LISTS=%~dp0lists\"`
  □ %LISTS% подставляется из карты переменных
  □ %~dp0 раскрывается в путь к папке скрипта
  □ Внешние кавычки снимаются
  □ Подстановка не зацикливается (максимум 8 проходов)
  □ resolve_path даёт существующий PathBuf на реальном
    аргументе --hostlist из general.bat
  □ Кириллица в путях не ломает разбор

【 RUST — ОПИСАНИЕ (D2) 】
  □ Первая строка `:: 65001 - UTF-8` пропускается
  □ Описание 22 реальных стратегий НЕ одинаковое
  □ Если описания нет — берётся имя файла

【 RUST — СЕРВИСЫ И ТЕХНИКИ (D3) 】
  □ Имя файла проверяется ДО содержимого
  □ general-05-alt + содержимое со словом discord
    → ["general"], не ["discord"]
  □ Контент-fallback работает, если имя не дало результата
  □ extract_techniques находит ipset, l7-filter,
    quic-fake, multisplit на реальном general.bat
  □ Пустой techniques допустим

【 RUST — ТЕСТЫ 】
  □ 8+ unit-тестов
  □ Все проходят
  □ Покрывают edge cases (пустой файл, невалидный UTF-8,
    несуществующая папка)

【 FRONTEND — HOOKS 】
  □ useStrategies: scanFolder, refresh, isLoading, error
  □ При mount — автосканирование, если папка выбрана
  □ useFolderPicker: dialog открывается, путь обновляется
  □ Cleanup при unmount (isMounted флаг)

【 FRONTEND — STORE SYNC 】
  □ useStrategiesStore.setStrategies вызывается после скана
  □ useLogsStore.addLog при успехе/ошибке
  □ useSettingsStore.updateSettings при выборе папки

【 FRONTEND — UI 】
  □ Strategies.tsx: панель управления (3 кнопки/элемента)
  □ Loading → 6 скелетонов
  □ Empty (папка не выбрана) → empty state с кнопкой
  □ Empty (папка пуста) → empty state
  □ Error → Badge + сообщение + кнопка «Повторить»
  □ List → сетка карточек (1/2/3 колонки)
  □ StrategyCard: name, filename, description, бейджи,
    размер, дата
  □ Бейджи сервисов — цветные в соответствии с serviceColors
  □ Статус running — pulse

【 FRONTEND — FORMATTING 】
  □ formatFileSize: 1234 → «1.2 KB»
  □ formatRelativeTime: работает для секунд/минут/часов/дней
  □ formatPath: обрезает середину длинных путей
  □ capitalizeService: «youtube» → «YouTube»

【 PERFORMANCE 】
  □ Сканирование 50 файлов <500ms
  □ UI не блокируется (спиннер виден)
  □ Переключение страниц туда-обратно → скан не запускается
    повторно (кэш)
  □ Список из 100 стратегий — рендер <100ms

【 UX 】
  □ Диалог выбора папки открывается корректно
  □ Отмена диалога не ломает UI
  □ При ошибке пользователь видит понятное сообщение
  □ Нет «пустого экрана» без объяснений
  □ Все переходы состояний (loading → success/error)
    плавные

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
  □ cargo test — все зелёные
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: Tauri invoke не находит команду
  ПРИЧИНА: команда не зарегистрирована в invoke_handler или
    неправильное имя в invoke.
  ЧТО ПРОВЕРИТЬ: в lib.rs — invoke_handler с generate_handler!
    содержит commands::scan_strategies. Имя в invoke должно
    совпадать: "scan_strategies".

ГИПОТЕЗА 2: Serde не сериализует StrategyInfo
  ПРИЧИНА: поле не сериализуется из-за неправильного типа.
  ЧТО ПРОВЕРИТЬ: все поля должны быть Serialize (String, u64,
    Option<T>, Vec<T>). Если есть chrono::DateTime — feature
    "serde" обязательна.

ГИПОТЕЗА 3: Приложение падает на не-UTF-8 файлах
  ПРИЧИНА: read_to_string паникует на невалидном UTF-8.
  ЧТО ПРОВЕРИТЬ: использовать read() → Vec<u8>, потом
    String::from_utf8_lossy. Или обрабатывать Err через
    continue + tracing::warn.

ГИПОТЕЗА 4: UI замирает при сканировании
  ПРИЧИНА: команда не async или выполняется в главном потоке.
  ЧТО ПРОВЕРИТЬ: #[tauri::command] async fn. И убедиться,
    что внутри async нет блокирующих вызовов без
    spawn_blocking.

ГИПОТЕЗА 5: При переключении страниц сканирование
   запускается повторно
  ПРИЧИНА: useEffect без зависимостей или зависимости
    меняются каждый рендер.
  ЧТО ПРОВЕРИТЬ: useEffect с [settings.strategiesFolder],
    не [settings].

ГИПОТЕЗА 6: React state обновляется после unmount
  ПРИЧИНА: async-операция завершилась после unmount.
  ЧТО ПРОВЕРИТЬ: флаг isMounted в useEffect, проверка перед
    setState.

ГИПОТЕЗА 7: StrategyInfo.id генерируется каждый раз новый
  ПРИЧИНА: nanoid при каждом скане.
  ЧТО ПРОВЕРИТЬ: id должен быть детерминированным — hash от
    path. Иначе React-ключи будут меняться, будут
    ре-рендеры.

ГИПОТЕЗА 8: Диалог выбора папки не открывается
  ПРИЧИНА: разрешение dialog:allow-open не в capabilities.
  ЧТО ПРОВЕРИТЬ: capabilities/default.json содержит
  "dialog:allow-open".

ГИПОТЕЗА 9: Все стратегии получают сервис "discord"
  ПРИЧИНА: list-general.txt содержит домены Discord, и
  контент-детекция срабатывает на каждом .bat.
  ЧТО ПРОВЕРИТЬ: порядок в detect_services — сначала имя,
  содержимое только как fallback. На реальной папке
  general-05-alt должен дать ["general"].
  РЕШЕНИЕ (уже принято): приоритет имени + новое поле
  techniques[] как реальный разделитель. Формула редкости
  в этапе 10 переписана на score из техник.

ГИПОТЕЗА 10: Все описания равны "65001 - UTF-8"
  ПРИЧИНА: `::` входит в DESCRIPTION_LINE_PREFIXES, а
  строка `:: 65001 - UTF-8` идёт третьей в каждом .bat.
  ЧТО ПРОВЕРИТЬ: SKIP_DESCRIPTION_PREFIXES обрабатывается
  ДО проверки префиксов описания.
  РЕШЕНИЕ (уже принято): фильтр + fallback на имя файла.

ГИПОТЕЗА 11: Регекс находит путь, которого нет на диске
  ПРИЧИНА: `--hostlist="%LISTS%list-general.txt"` — регекс
  вернёт `"%LISTS%list-general.txt"` с кавычками и
  плейсхолдером.
  ЧТО ПРОВЕРИТЬ: bat_env::resolve_path на реальном
  аргументе из general.bat даёт существующий путь.
  РЕШЕНИЕ (уже принято): модуль bat_env, общий для
  этапов 5 и 8.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Подготовить тестовую папку:
   • Создать где угодно папку strategies-test
   • Скопировать туда 3–5 .bat файлов (например, из
     zapret-discord-youtube репозитория)
   • Один файл оставить пустым (0 байт)
   • Один файл назвать «invalid-name.bat» (без сервисов)

2. Запустить pnpm tauri dev

3. Перейти в Sidebar → «Стратегии»
   ОЖИДАНИЕ: empty state с иконкой и кнопкой «Выбрать папку»

4. Клик «Выбрать папку»
   ОЖИДАНИЕ: открывается системный диалог

5. Выбрать папку strategies-test
   ОЖИДАНИЕ: 5 скелетонов 200ms → список из 5 карточек

6. Проверить карточки:
   • discord_youtube.bat → бейджи Discord + YouTube
   • general.bat → бейдж General
   • outlast_trials.bat → бейдж Outlast Trials
   • invalid-name.bat → бейдж General (fallback)
   • Пустой .bat → НЕ в списке (пропущен)
   ОЖИДАНИЕ: 4 карточки из 5 (пустой пропущен)

7. Проверить, что описание извлекается:
   • Если в .bat первая строка REM Description —
     отображается
   • Если нет — пустое или «Нет описания»

8. Клик «Обновить»
   ОЖИДАНИЕ: спиннер на кнопке, 200ms, список тот же

9. Открыть DevTools → Console
   ОЖИДАНИЕ: нет ошибок, есть tracing-логи
   «Scanning folder: ...», «Found 4 strategies»

10. Переключиться на Dashboard, потом обратно на Strategies
    ОЖИДАНИЕ: список мгновенно (кэш), сканирование не
    запускается

11. Выбрать пустую папку (создать пустую)
    ОЖИДАНИЕ: empty state «В папке нет .bat файлов»

12. Выбрать несуществующую папку (через настройки
    напрямую — невозможно, но можно проверить в консоли
    через invoke)
    ОЖИДАНИЕ: error state с понятным сообщением

13. Проверить performance:
    • Performance → записать сканирование
    ОЖИДАНИЕ: 60 FPS, сканирование <500ms

14. Запустить cargo test
    ОЖИДАНИЕ: 8+ тестов, все зелёные

15. Запустить pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

16. Запустить cargo check
    ОЖИДАНИЕ: 0 warning'ов

17. Открыть Task Manager → RAM
    ОЖИДАНИЕ: <200 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать unwrap() в Rust
❌ Не паниковать на невалидных данных
❌ Не блокировать UI-поток синхронным сканированием
❌ Не использовать any в TypeScript
❌ Не вызывать invoke напрямую из компонентов (только
   через хук)
❌ Не подписываться на весь стор (только через селекторы)
❌ Не забывать cleanup в useEffect
❌ Не запускать сканирование при каждом ре-рендере
❌ Не забывать обрабатывать отмену диалога
❌ Не оставлять console.log
❌ Не забывать про #[serde(rename_all = "camelCase")]
❌ Не использовать chrono::DateTime без feature "serde"
❌ Не начинать Этап 6 без подтверждения
❌ Не менять конфиги Этапа 4 (типы)

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 5 завершён, если ВСЕ пункты выполнены:

✅ Rust-команда scan_strategies работает
✅ Rust-команда get_default_strategies_path работает
✅ StrategyInfo сериализуется в camelCase
✅ bat_env::resolve_path работает на реальных аргументах
   --hostlist из general.bat (без кавычек и %LISTS%)
✅ services определяются по имени файла в первую очередь
✅ techniques[] заполняется и реально различает стратегии
✅ описания 22 стратегий не одинаковые
✅ Параллельное чтение (JoinSet, лимит 8)
✅ Невалидные файлы пропускаются без падения
✅ Пустая папка → пустой Vec
✅ Несуществующая папка → понятная ошибка
✅ 8+ unit-тестов проходят
✅ useStrategies работает (scanFolder, refresh, isLoading)
✅ useFolderPicker работает (dialog + settings)
✅ useStrategiesStore синхронизируется с Rust
✅ useLogsStore получает логи о сканировании
✅ Strategies.tsx: полная реализация
✅ StrategyCard с бейджами и статусом
✅ Skeleton для loading
✅ EmptyState для пустых состояний
✅ Error state с кнопкой «Повторить»
✅ Бейджи сервисов цветные (Discord синий, YouTube
   красный, Outlast неоновый)
✅ Кэш работает (повторный скан не запускается)
✅ Сканирование 50 файлов <500ms
✅ UI не блокируется
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ cargo test — все зелёные
✅ Ни одного unwrap() без обоснования
✅ Ни одного any в TS
✅ Консоль чистая
✅ RAM <200 MB
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 5 ВЫПОЛНЕН 2026-10-06
═══════════════════════════════════════════════════════════════════════

Реализовано Rust:
  • `constants.rs` — SERVICE_KEYWORDS, STRATEGY_TYPE_KEYWORDS,
    TECHNIQUE_KEYWORDS, лимиты, префиксы описания, EXCLUDED_FILENAMES,
    акронимы имён
  • `bat_env.rs` — extract_set_vars, expand_percent_vars, strip_quotes,
    resolve_path (чистые функции, юникод-безопасны, без регулярок)
  • `commands/scanner.rs` — StrategyInfo, scan_strategies (JoinSet,
    лимит 8), get_default_strategies_path, оркестрация и async IO
  • `commands/parser.rs` — чистый парсинг: extract_name,
    extract_description, detect_services, extract_techniques,
    detect_file_type, extract_version, analyze
  • `commands/parser_tests.rs` — 16 тестов парсинга
  • `commands/scanner_tests.rs` — 4 теста сканирования (async)
  • Регистрация команд в `lib.rs`

Реализовано frontend:
  • `types/strategy.ts` — techniques/size/modifiedAt/TechniqueId
  • `lib/format.ts`, `lib/serviceColors.ts`
  • `hooks/useStrategies.ts`, `hooks/useFolderPicker.ts`
  • `components/strategies/StrategyCard`, `EmptyState`, `StrategySkeleton`
  • `pages/Strategies.tsx` — выбор папки, обновить, счётчик, skeleton,
    empty/error состояния, сетка 1/2/3

Проверено на РЕАЛЬНОМ архиве (22 .bat):
  ✅ Найдено ровно 22 стратегии, service.bat исключён
  ✅ Имена разобраны: General ALT, Alt2…Alt13, Fake TLS Auto Alt2
  ✅ techniques различаются по файлам (Multisplit / Split SeqOVL /
     FakeTLS / QUIC Fake / L7 Filter / IPSet / Any Protocol / Cutoff / Fake)
  ✅ fileType = winws, размеры 3.3–4.3 КБ, даты изменения
  ✅ Настройки прочитаны из config.json → автосканирование при старте
  ✅ Сканирование мгновенное, UI не блокируется
  ✅ 33/33 Rust-теста зелёные
  ✅ pnpm exec tsc --noEmit — 0 ошибок
  ✅ pnpm exec eslint . — 0 ошибок
  ✅ pnpm exec prettier --check . — 0 ошибок
  ✅ cargo check — 0 ошибок, 0 warning'ов
  ✅ Комментариев в коде нет

Правда об архиве (не совпадает с этим файлом):
  • все 22 файла называются `general*`, ни в одном имени нет discord /
    youtube / outlast → services у всех ["general"], различить их может
    только techniques[]. Именование делает этап 16
  • описаний в .bat нет вообще → description откатывается на имя,
    карточка не дублирует его
  • примеры имён в этом файле (discord_youtube.bat, general-00-baseline.bat,
    general-05-alt) — это целевые имена после этапа 16

Найденные и исправленные баги:
  1. **fs scope**: у Capability в Tauri 2 НЕТ поля `scope`. Ключ молча
     игнорировался → `forbidden path ... allow-exists`. Правильно:
     разрешение `fs:scope-app`. README O23
  2. **`invoke<T>` не проверяется**: Rust не отдавал `status`, TS верил
     типу, `STATUS_LABELS[undefined]` давал пустые бейджи. Добавлено
     `status: "idle"` в Rust. README O24
  3. **`Button` скрывал children при `size="icon"`** → пустые квадраты
     вместо иконок. README O25
  4. **`invoke` отклоняется строкой**, а не `Error` → реальные сообщения
     терялись. Добавлен `toErrorMessage()`. README O26
  5. **`%~dp0` не подставлялся**: в .bat у него нет закрывающего `%`, а
     парсер искал пару. Добавлена отдельная ветка + гарантированный
     слэш. Проверено тестом
  6. **`extract_name` оставлял числовой индекс**: «General 00 Baseline»
     вместо «General Baseline». Чисто числовые слова отбрасываются
  7. **путь настроек**: `appDataDir()` уже включает identifier, лишний
     сегмент `ZapretManager` удалён. README O22

Отклонения: README.md раздел 8.1, O21–O27.

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 6
═══════════════════════════════════════════════════════════════════════

После Этапа 5 у нас есть:
  • Rust-сканер .bat файлов с параллельным чтением
  • Типизированный StrategyInfo (camelCase для frontend)
  • Хук useStrategies для синхронизации со стором
  • Хук useFolderPicker для выбора папки
  • UI-страница Strategies с карточками, бейджами, статусом
  • Empty state, loading skeleton, error handling
  • Unit-тесты для парсинга

На Этапе 6 нужно будет:
  • Rust-команда run_strategy для запуска .bat с UAC
  • Перехват stdout/stderr через event system
  • Rust-команда stop_strategy (kill процесса)
  • Rust-команда check_process_status
  • Хук useStrategyRunner
  • Кнопка Play/Stop в StrategyCard
  • Логи запуска в реальном времени (интеграция с
    useLogsStore)

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 5 — СТОП.

Не начинай Этап 6. Не создавай команды run_strategy,
stop_strategy, не пиши хук useStrategyRunner, не добавляй
кнопку Play в StrategyCard (она должна быть заглушкой,
если уже добавлена).

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 6
  • "Правка: ..." — правка в Этап 5
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.