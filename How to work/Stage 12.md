═══════════════════════════════════════════════════════════════════════
ЭТАП 12: ПРОВЕРКА ОБНОВЛЕНИЙ ЧЕРЕЗ GITHUB RELEASES
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Научить приложение автоматически проверять обновления
zapret-discord-youtube через GitHub Releases API, сравнивать
версии по semver, показывать пользователю уведомление о
доступном обновлении и автоматически скачивать + распаковывать
новую версию стратегий в папку пользователя с сохранением его
настроек и конфигов.

После этого этапа пользователь сможет:
  • Видеть в Sidebar бейдж «Доступно обновление» (если есть)
  • Нажать на бейдж → открывается модалка с деталями:
    - Текущая версия → Новая версия
    - Release notes (changelog с GitHub)
    - Дата публикации
    - Размер загрузки
  • Нажать «Обновить» → скачивание с прогресс-баром →
    автоматическая распаковка → перезапуск (опционально)
  • Настроить автообновление:
    - Проверять при старте (вкл/выкл)
    - Проверять каждые N часов
    - Уведомлять через трей (Этап 15)
  • Отложить обновление («Позже») — приложение не будет
    напоминать до следующего запуска
  • Игнорировать конкретную версию
  • Видеть историю версий (опционально)

Это критичный этап для долгосрочной работы приложения. Zapret —
активный проект, обновления выходят часто (раз в 1–2 недели).
Если пользователь не может обновиться из приложения — он
скачивает вручную и ломает конфиги.

ВАЖНО: при обновлении НЕЛЬЗЯ потерять:
  • Пользовательские настройки (settings.json)
  • Пользовательские домены (Outlast Trials)
  • Пользовательские правки в конфигах (вне секций-маркеров)
  • Логи

Перед обновлением — обязательный бэкап всей папки стратегий.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Источник обновлений — GitHub Releases API zapret-discord-youtube 】

ОБОСНУЙ:
  • Основной источник стратегий — репозиторий zapret-discord-youtube
    (или его форк, если оригинал недоступен)
  • GitHub Releases API даёт:
    - tag_name (версия)
    - name (название релиза)
    - body (changelog в markdown)
    - published_at (дата)
    - assets[] (файлы для скачивания)
  • Endpoint: GET /repos/{owner}/{repo}/releases/latest
  • Авторизация не нужна (публичный репо)
  • Лимит: 60 запросов/час без токена (нам хватит с запасом)
  • User-Agent обязателен (иначе 403)

АЛЬТЕРНАТИВНЫЕ ИСТОЧНИКИ:
  • zapret-discord-youtube (основной, если существует)
  • Flowseal/zapret-discord-youtube (популярный форк)
  • Bol-van/zapret (оригинальный zapret, без обёртки)

РЕКОМЕНДАЦИЯ: конфигурируемый источник (owner/repo) в настройках.
По умолчанию — Flowseal/zapret-discord-youtube.

【 РЕШЕНИЕ 2: Проверка версий через semver, не по дате 】

ОБОСНУЙ:
  • Версии — семантические (1.2.3, 1.2.4, 2.0.0)
  • Сравнение по semver корректнее даты:
    - Дата может быть одинаковой у разных версий
    - Даты могут быть неправильно установлены
    - Semver учитывает мажор/минор/патч
  • Использовать крейт `semver` в Rust
  • Если версия не semver (например, «v1.9.5b») —
    нормализовать или fallback на дату

ПОЧЕМУ НЕ ПРОСТО СТРОКОВОЕ СРАВНЕНИЕ:
  • «1.10.0» < «1.9.0» лексикографически, но это неверно
  • Semver решает эту проблему

【 РЕШЕНИЕ 3: Скачивание через reqwest с прогрессом ]

ОБОСНУЙ:
  • Release содержит assets — обычно .zip архив
  • reqwest с feature "stream" позволяет скачивать по
    чанкам
  • Прогресс: подсчёт скачанных байт / total
  • Emit события "update-download-progress" каждые 100ms
  • Докачка (resume) — опционально, отложить

ПОЧЕМУ НЕ ПРОСТО reqwest::get().bytes():
  • Нет прогресса
  • Загрузка всего в память (может быть 100+ MB)

ПОЧЕМУ НЕ КАСТОМНЫЙ HTTP-КЛИЕНТ:
  • reqwest уже подключён (Этап 1)
  • Стандарт для Rust

【 РЕШЕНИЕ 4: Распаковка через zip-крейт в Rust ]

ОБОСНУЙ:
  • Архив — .zip или .7z (в зависимости от релиза)
  • Для .zip — крейт `zip`
  • Для .7z — крейт `sevenz-rust` (если понадобится)
  • Распаковка в временную папку
  • Затем — копирование файлов в папку пользователя с
    бэкапом старых

ПОЧЕМУ НЕ РАСПАКОВКА В JS:
  • JSZip +50 KB
  • Медленнее на больших архивах
  • Не имеет доступа к файловой системе напрямую

ПОЧЕМУ НЕ через 7zip CLI:
  • Зависимость от внешней программы
  • Пользователь может не иметь 7zip

【 РЕШЕНИЕ 5: Backup перед обновлением — обязателен ]

ОБОСНУЙ:
  • Перед заменой файлов — копия всей папки strategies в
    backup/{timestamp}/
  • Не atomic — если что-то упадёт, бэкап останется
  • Хранить последние 3 бэкапа (ротация)
  • При успешном обновлении — оставить бэкап на случай
    отката (кнопка «Вернуться к предыдущей версии»)

ПОЧЕМУ ВСЮ ПАПКУ:
  • Отдельные файлы могут потеряться
  • Проще откатить
  • Место не критично (стратегии <10 MB)

【 РЕШЕНИЕ 6: Умный merge конфигов — сохранить пользовательские правки ]

ОБОСНУЙ:
  • Пользователь мог добавить свои домены в list-*.txt
  • Пользователь мог изменить настройки в settings.json
  • При обновлении нельзя потерять эти правки

ЛОГИКА MERGE:
  1. Найти все list-*.txt, ipset-*.txt в новой версии
  2. Найти те же файлы в старой версии
  3. Для каждого файла:
     a. Извлечь пользовательские строки (не в секциях-маркерах
        и не стандартные)
     b. Добавить их в новый файл после стандартных
  4. Если файл только у пользователя — оставить
  5. Если файл только в новой версии — добавить

ПОЧЕМУ СЛОЖНО:
  • Нет чёткого способа отличить «пользовательское» от
    «стандартного»
  • Эвристика: строки, которых нет в старой стандартной
    версии

УПРОЩЕНИЕ (рекомендация):
  • Сохранить всю папку strategies пользователя
  • Заменить только .bat файлы и zapret/*.exe
  • Конфиги (list-*.txt) — сделать merge через маркеры:
    пользовательские домены добавляются в конец с маркером
    «# ZAPRET MANAGER: USER DOMAINS»

【 РЕШЕНИЕ 7: Проверка обновлений при старте + раз в N часов ]

ОБОСНУЙ:
  • При старте приложения — проверка через 3 секунды (после
    полной загрузки UI)
  • Затем — раз в N часов (по умолчанию 24, настраивается)
  • Фоновая задача через tokio::spawn
  • Не блокирует UI

ПОЧЕМУ 3 СЕКУНДЫ ПРИ СТАРТЕ:
  • UI должен загрузиться сначала
  • Пользователь не должен ждать проверку обновлений
  • 3 секунды — комфортно

ПОЧЕМУ 24 ЧАСА:
  • Zapret обновляется раз в 1–2 недели
  • Каждый час — избыточно
  • 24 часа — баланс

【 РЕШЕНИЕ 8: Версия приложения vs версия стратегий — раздельно ]

ОБОСНУЙ:
  • Версия самого приложения (Zapret Manager) — из Cargo.toml
  • Версия стратегий (zapret-discord-youtube) — из GitHub
    Releases
  • Это ДВЕ разные вещи
  • Обновление стратегий — не требует перезапуска
    приложения
  • Обновление приложения — через tauri-plugin-updater
    (если настроено на Этапе 23)

ПОЧЕМУ РАЗДЕЛЬНО:
  • Пользователь может обновить стратегии, не обновляя
    приложение
  • Разные циклы релизов

ВАЖНО: ОТКЛЮЧИТЬ ШТАТНЫЙ АПДЕЙТ ZAPRET
  В service.bat есть собственный механизм проверки
  обновлений:
    if "%~1"=="check_updates" (
      if defined NO_UPDATE_CHECK exit /b
      if exist "%~dp0utils\check_updates.enabled" (...)
    )
  Каждая стратегия вызывает его при старте:
    call service.bat check_updates

  Если оставить включённым — пользователь получит ДВА
  конкурирующих апдейта: наш (через GitHub Releases API)
  и штатный zapret. Это путает и может сломать конфиги
  в середине работы.

  РЕШЕНИЕ:
  • Перед запуском стратегии выставлять NO_UPDATE_CHECK=1
    в окружении процесса cmd.exe
  • utils/check_updates.enabled в бандле НЕ включать
  • Наш updater — единственный источник обновлений
    стратегий
  • Пользователю показывать бейдж обновления в Sidebar
    (уже запланировано в Решении 10)

【 РЕШЕНИЕ 9: Хранение текущей версии стратегий в config.json ]

ОБОСНУЙ:
  • При первом сканировании папки — определить версию
    стратегий (из имени файла или из .version файла)
  • Сохранить в settings.strategiesVersion
  • При проверке — сравнить с GitHub
  • Если локальная версия неизвестна — показать «—» и
    предложить обновить

ОПРЕДЕЛЕНИЕ ВЕРСИИ:
  • Файл .version в папке стратегий (создаём при первом
    скачивании)
  • Или из имени .bat (например, discord_youtube_v1.9.5.bat)
  • Или из README.md (regex)

РЕКОМЕНДАЦИЯ: файл .version в корне папки стратегий.
Создаём при первом обновлении, при последующих — читаем.

【 РЕШЕНИЕ 10: UI — бейдж в Sidebar + модалка с деталями ]

ОБОСНУЙ:
  • Бейдж в Sidebar (рядом с пунктом «Настройки» или
    отдельный пункт «Обновления»)
  • Если обновление доступно → pulse-точка + счётчик
  • Клик → модалка с деталями
  • Кнопки в модалке: «Обновить», «Позже», «Игнорировать
    эту версию»

ПОЧЕМУ В SIDEBAR:
  • Всегда на виду
  • Не отвлекает
  • Стандарт для приложений с автообновлением

ПОЧЕМУ НЕ TOAST:
  • Toast исчезает
  • Пользователь может не успеть нажать
  • Бейдж постоянный

【 РЕШЕНИЕ 11: Changelog в модалке — рендер markdown ]

ОБОСНУЙ:
  • GitHub возвращает body как markdown
  • Нужен рендер markdown → HTML
  • Использовать библиотеку: react-markdown + remark-gfm
  • Стилизовать под тёмную тему
  • Не использовать dangerouslySetInnerHTML

ПОЧЕМУ НЕ ОБЫЧНЫЙ TEXT:
  • Changelog содержит списки, ссылки, код
  • Markdown читается лучше

ПОЧЕМУ react-markdown:
  • Безопасен (не выполняет HTML)
  • Поддерживает GFM (таблицы, чек-боксы)
  • +30 KB в бандл — приемлемо

【 РЕШЕНИЕ 12: Кнопка «Вернуться к предыдущей версии» (rollback) ]

ОБОСНУЙ:
  • Если после обновления что-то сломалось — пользователь
    должен откатиться
  • Использовать бэкап backup/{timestamp}/
  • Кнопка в настройках → «История обновлений» → «Откатить»
  • После отката — перезапуск сканирования стратегий

ПОЧЕМУ ВАЖНО:
  • Новая версия может сломать обход
  • Пользователь не должен остаться без рабочего
    приложения

ОПЦИОНАЛЬНО:
  • Если времени мало — отложить на Этап 18

【 РЕШЕНИЕ 13: Проверка целостности скачанного архива ]

ОБОСНУЙ:
  • GitHub Release может содержать checksums (SHA-256)
  • Если есть — проверить после скачивания
  • Если не совпадает — отменить обновление
  • Если checksums нет — проверить, что архив открывается
    (zip::ZipArchive::new)

ПОЧЕМУ ВАЖНО:
  • Защита от повреждённой загрузки
  • Защита от MITM (маловероятно, но возможно)

【 РЕШЕНИЕ 14: Уважение к пользовательскому выбору ]

ОБОСНУЙ:
  • Если пользователь нажал «Позже» — не напоминать до
    следующего запуска приложения
  • Если пользователь нажал «Игнорировать эту версию» —
    не показывать для этой версии, пока не выйдет новая
  • Хранить в settings.ignoredVersions: string[]

ПОЧЕМУ ВАЖНО:
  • Уважение к пользователю
  • Не раздражает

【 РЕШЕНИЕ 15: Логирование всех операций обновления ]

ОБОСНУЙ:
  • Проверка → лог info: «Проверка обновлений: текущая
    1.9.5, доступна 1.9.6»
  • Скачивание → лог info с прогрессом (не каждые 100ms,
    а раз в 10%): «Скачано 30%... 60%... 100%»
  • Распаковка → info
  • Успех → success: «Обновление установлено: 1.9.6»
  • Ошибка → error с деталями

ПОЧЕМУ ВАЖНО:
  • Пользователь видит, что происходит
  • Легко отладить

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/src/commands/updater.rs (создать) 】
Назначение: логика проверки и установки обновлений.

Структуры:
  • UpdateInfo (Serialize, camelCase):
    - available: bool
    - currentVersion: String
    - latestVersion: String
    - releaseName: String
    - releaseNotes: String
    - publishedAt: String (ISO)
    - downloadUrl: String
    - assetName: String
    - size: u64
    - isNewer: bool
  • DownloadProgress (Serialize):
    - downloaded: u64
    - total: u64
    - percent: f32
    - speed: u64 (bytes/sec)
    - eta: Option<u64> (секунды)
  • UpdateState:
    - current_version: Arc<Mutex<Option<String>>>
    - ignored_versions: Arc<Mutex<Vec<String>>>
    - is_downloading: Arc<AtomicBool>
    - cancel_flag: Arc<AtomicBool>

Команды:
  • check_for_updates(state: State<UpdateState>,
    repo: Option<String>) -> Result<UpdateInfo, AppError>
    Логика:
    1. GET https://api.github.com/repos/{repo}/releases/latest
       (repo по умолчанию: Flowseal/zapret-discord-youtube)
    2. Парсинг JSON в структуру
    3. Извлечь tag_name → latestVersion
    4. Прочитать текущую версию из settings или файла .version
    5. Сравнить через semver
    6. Найти asset с расширением .zip или .7z (первый)
    7. Вернуть UpdateInfo

  • download_update(url: String, dest: String, app: AppHandle,
    state: State<UpdateState>) -> Result<(), AppError>
    Логика:
    1. Установить is_downloading = true
    2. reqwest::get(url).await
    3. Стриминг с прогрессом:
       - Каждые 100ms emit "update-download-progress"
       - Проверка cancel_flag
    4. Сохранить в dest (временная папка)
    5. Проверить checksum (если есть)
    6. is_downloading = false
    7. Вернуть Ok

  • install_update(archive_path: String, strategies_dir:
    String, app: AppHandle) -> Result<(), AppError>
    Логика:
    1. Backup текущей папки strategies
    2. Распаковать архив во временную папку
    3. Merge конфигов (сохранить пользовательские домены)
    4. Заменить .bat и бинарники
    5. Обновить .version
    6. Пересканировать стратегии (вызвать scan_strategies)
    7. Emit "update-installed"

  • cancel_download(state: State<UpdateState>)
    -> Result<(), AppError>
    Логика:
    • Установить cancel_flag = true

  • get_current_version() -> Result<String, AppError>
    Логика:
    • Прочитать .version из папки strategies
    • Если нет — вернуть «unknown»

  • set_current_version(version: String) -> Result<(), AppError>
    Для записи после успешного обновления.

  • list_backups(strategies_dir: String)
    -> Result<Vec<BackupInfo>, AppError>
    Возвращает список бэкапов для rollback.

  • rollback(backup_path: String, strategies_dir: String)
    -> Result<(), AppError>
    Восстановить из бэкапа.

Вспомогательные функции:
  • fetch_latest_release(repo: &str) -> Result<GitHubRelease,
    AppError>
    - reqwest с User-Agent "Zapret-Manager/0.1.0"
    - Парсинг JSON через serde_json
  • compare_versions(current: &str, latest: &str) -> bool
    - semver::Version::parse
    - Нормализация: убрать ведущий "v", заменить суффиксы
  • create_backup(strategies_dir: &Path) -> Result<PathBuf,
    AppError>
    - Копировать всю папку в backup/{unix_timestamp}/
    - Ротация: хранить max 3
  • merge_configs(old_dir: &Path, new_dir: &Path)
    -> Result<MergeReport, AppError>
    - Извлечь пользовательские домены (строки не в
      стандартных списках)
    - Добавить в новые файлы
    - Вернуть отчёт: сколько строк сохранено
  • extract_archive(archive: &Path, dest: &Path)
    -> Result<(), AppError>
    - zip::ZipArchive::new
    - Распаковка с сохранением структуры

Требования:
  • Все команды — async
  • Ошибки через AppError
  • Логирование через tracing
  • Никаких unwrap() без обоснования
  • User-Agent обязателен для GitHub API

【 2. src-tauri/src/commands/mod.rs (обновить) 】
Добавить:
  • pub mod updater;
  • pub use updater::{check_for_updates, download_update,
    install_update, cancel_download, get_current_version,
    set_current_version, list_backups, rollback};

【 3. src-tauri/src/lib.rs (обновить) 】
Зарегистрировать команды updater
Инициализировать UpdateState через .manage()
Создать фоновую задачу проверки обновлений при старте:
  • tokio::spawn с задержкой 3 секунды
  • Проверка + emit "update-available" если есть

【 4. src-tauri/Cargo.toml (обновить) 】
Добавить:
  • semver = "1.0.23"
  • zip = "2.2.0"
  • (опционально) sevenz-rust = "0.6.1" если нужен .7z

【 5. src/types/update.ts (создать) 】
Назначение: типы для обновлений (расширить с Этапа 4).

Типы:
  • UpdateInfo:
    - available: boolean
    - currentVersion: string
    - latestVersion: string
    - releaseName: string
    - releaseNotes: string
    - publishedAt: string
    - downloadUrl: string
    - assetName: string
    - size: number
    - isNewer: boolean
  • DownloadProgress:
    - downloaded: number
    - total: number
    - percent: number
    - speed: number
    - eta: number | null
  • UpdateStatus — union: "idle" | "checking" | "available" |
    "downloading" | "extracting" | "installing" | "ready" |
    "error" | "up-to-date"
  • BackupInfo:
    - path: string
    - timestamp: number
    - size: number
    - version: string

【 6. src/types/settings.ts (обновить) 】
Добавить в AppSettings:
  • updates: UpdateSettings
  • UpdateSettings:
    - autoCheck: boolean (проверять при старте)
    - checkIntervalHours: number (по умолчанию 24)
    - autoDownload: boolean (скачивать автоматически)
    - autoInstall: boolean (устанавливать автоматически —
      опасно, по умолчанию false)
    - githubRepo: string (по умолчанию
      "Flowseal/zapret-discord-youtube")
    - ignoredVersions: string[] (какие версии игнорировать)
    - lastCheckAt: number | null

【 7. src/lib/defaults.ts (обновить) 】
Обновить DEFAULT_SETTINGS.updates:
  • autoCheck: true
  • checkIntervalHours: 24
  • autoDownload: false
  • autoInstall: false
  • githubRepo: "Flowseal/zapret-discord-youtube"
  • ignoredVersions: []
  • lastCheckAt: null

【 8. src/hooks/useUpdater.ts (создать) 】
Назначение: React-хук для управления обновлениями.

Состояние:
  • status: UpdateStatus
  • info: UpdateInfo | null
  • progress: DownloadProgress | null
  • error: string | null

Методы:
  • check(): Promise<void>
    - setStatus("checking")
    - invoke("check_for_updates")
    - Если available → setStatus("available") + setInfo
    - Иначе → setStatus("up-to-date")
  • download(): Promise<void>
    - setStatus("downloading")
    - invoke("download_update")
    - Подписка на "update-download-progress"
  • install(): Promise<void>
    - setStatus("installing")
    - invoke("install_update")
    - После успеха:
      - setStatus("ready")
      - Обновить current version
      - Пересканировать стратегии
  • cancel(): Promise<void>
  • rollback(backupPath): Promise<void>
  • dismiss(): void — «Позже» (не показывать до перезапуска)
  • ignoreVersion(version): Promise<void>
  • resetError(): void

Подписки (useEffect):
  • listen("update-available", ...) — от фоновой проверки
  • listen("update-download-progress", ...)
  • listen("update-installed", ...)
  • listen("update-error", ...)
  • Cleanup всех listeners

Возвращает:
  • { status, info, progress, error, check, download,
    install, cancel, rollback, dismiss, ignoreVersion }

Требования:
  • Все listeners с cleanup
  • Не дёргать check при каждом рендере
  • Обработка ошибок

【 9. src/hooks/useAutoUpdateCheck.ts (создать) 】
Назначение: фоновый чек обновлений.

Логика:
  • useEffect при mount
  • Если settings.updates.autoCheck:
    - setTimeout 3 сек → check()
    - setInterval checkIntervalHours * 3600 * 1000 → check()
  • Cleanup обоих

Сигнатура:
  • useAutoUpdateCheck(): void (side-effect only)

Требования:
  • Уважение к settings.updates.autoCheck
  • Не спамить check при быстрых перезапусках

【 10. src/stores/useUpdateStore.ts (создать) 】
Назначение: глобальное состояние обновлений.

Состояние:
  • status: UpdateStatus
  • info: UpdateInfo | null
  • progress: DownloadProgress | null
  • error: string | null
  • dismissedUntilRestart: boolean

Методы:
  • setStatus, setInfo, setProgress, setError
  • setDismissed(value: boolean)

ПОЧЕМУ ОТДЕЛЬНЫЙ СТОР:
  • Бейдж в Sidebar должен видеть состояние
  • Модалка — тоже
  • Отдельный стор = нет prop drilling

【 11. src/components/updates/UpdateBadge.tsx (создать) 】
Назначение: бейдж «Доступно обновление» в Sidebar.

Props: нет (использует useUpdateStore).

Логика:
  • Если status === "available" && !dismissedUntilRestart →
    показать бейдж
  • Pulse-точка + счётчик

Рендер:
  • Маленький кружок с числом или pulse-точка
  • Цвет: accent-primary
  • При клике → открыть модалку (через useModalStore или
    напрямую)

【 12. src/components/updates/UpdateModal.tsx (создать) 】
Назначение: модалка с деталями обновления.

Props:
  • open: boolean
  • onClose: () => void

Структура:
  • Header: «Доступно обновление» + close
  • Body:
    - Сравнение версий: «1.9.5 → 1.9.6» (старая серая,
      новая accent)
    - Метаданные: дата публикации, размер
    - Changelog (react-markdown)
    - Прогресс-бар (если downloading)
  • Footer:
    - Кнопка «Позже» (ghost)
    - Кнопка «Игнорировать» (ghost, danger)
    - Кнопка «Обновить» (primary)
    - При downloading: «Отменить» (danger)

Требования:
  • Markdown стилизован под тёмную тему
  • Прогресс-бар с анимацией
  • Форматирование размера и даты

【 13. src/components/updates/UpdateProgress.tsx (создать) 】
Назначение: прогресс-бар скачивания.

Props:
  • progress: DownloadProgress

Рендер:
  • Полоса с процентом
  • Скорость: «1.2 MB/s»
  • ETA: «осталось ~15 сек»
  • Скачано / всего

Требования:
  • Плавная анимация ширины
  • Форматирование через formatBytes

【 14. src/components/updates/ChangelogRenderer.tsx (создать) 】
Назначение: рендер markdown changelog.

Props:
  • markdown: string

Логика:
  • Использовать react-markdown + remark-gfm
  • Стилизовать через Tailwind (prose-стили)
  • Ссылки — открывать в браузере (через shell.open)

Требования:
  • Установить: pnpm add react-markdown@9.0.1 remark-gfm@4.0.0
  • Не использовать dangerouslySetInnerHTML
  • Безопасные ссылки (target="_blank" rel="noopener")

【 15. src/components/updates/BackupHistory.tsx (опционально) 】
Назначение: список бэкапов для rollback.

Props: нет (использует invoke list_backups).

Рендер:
  • Список карточек с датой, версией, размером
  • Кнопка «Восстановить»

Расположение: в Settings → секция «Обновления».

【 16. src/pages/Settings.tsx (обновить) 】
Добавить секцию «Обновления»:
  • Toggle «Проверять обновления при старте»
  • Input «Проверять каждые N часов»
  • Input «GitHub репозиторий»
  • Toggle «Скачивать автоматически»
  • Toggle «Устанавливать автоматически» (с предупреждением)
  • Кнопка «Проверить сейчас»
  • Информация о текущей версии
  • Список игнорированных версий (с кнопкой «Разблокировать»)
  • Кнопка «История обновлений» → открывает BackupHistory

Требования:
  • Валидация githubRepo (regex owner/repo)
  • Валидация checkIntervalHours (1–168)
  • Сохранение через useSettingsStore

【 17. src/components/layout/Sidebar.tsx (обновить) 】
Добавить:
  • Бейдж обновления рядом с пунктом «Настройки» (или
    отдельный пункт «Обновления»)
  • Пульсирующая точка если доступно

【 18. src/app/App.tsx (обновить) 】
Добавить:
  • useAutoUpdateCheck() на верхнем уровне
  • Глобальный UpdateModal (рендерится всегда, открывается
    через useUpdateStore)
  • Обработка listen("update-available") → показать модалку

【 19. src/lib/constants.ts (обновить) 】
Добавить:
  • DEFAULT_GITHUB_REPO = "Flowseal/zapret-discord-youtube"
  • UPDATE_CHECK_DELAY_MS = 3000
  • UPDATE_DOWNLOAD_PROGRESS_INTERVAL_MS = 100
  • MAX_BACKUPS = 3
  • VERSION_FILE_NAME = ".version"
  • USER_AGENT = "Zapret-Manager/0.1.0"

【 20. src/lib/updateUtils.ts (создать) 】
Назначение: утилиты для обновлений.

Функции:
  • formatVersion(version: string): string
    - «v1.9.5» → «1.9.5»
  • formatReleaseDate(iso: string): string
    - «5 октября 2026»
  • isVersionIgnored(version: string, ignored: string[]):
    boolean
  • normalizeVersion(version: string): string
    - Убирает «v», суффиксы pre-release

【 21. src-tauri/capabilities/default.json (обновить) 】
Убедиться, что разрешены:
  • http:default (для GitHub API через reqwest — не нужно,
    reqwest напрямую)
  • fs:allow-read-text-file
  • fs:allow-write-text-file
  • core:event:default

【 22. src-tauri/src/commands/updater_tests.rs (опционально) 】
Тесты:
  • test_compare_versions (semver)
  • test_normalize_version
  • test_merge_configs (пользовательские домены)
  • test_extract_archive (mock zip)

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Добавить зависимости
  • Cargo: semver, zip, (опционально sevenz-rust)
  • pnpm: react-markdown, remark-gfm

ШАГ 2: Создать updater.rs
  • Структуры UpdateInfo, DownloadProgress, UpdateState
  • 8 команд
  • Вспомогательные функции (fetch_latest_release,
    compare_versions, create_backup, merge_configs,
    extract_archive)

ШАГ 3: Обновить commands/mod.rs и lib.rs
  • Зарегистрировать команды
  • Инициализировать UpdateState
  • Фоновая проверка при старте (tokio::spawn + 3 сек)

ШАГ 4: Расширить types/update.ts и settings.ts
  • UpdateInfo, DownloadProgress, UpdateStatus, BackupInfo
  • UpdateSettings

ШАГ 5: Обновить defaults.ts
  • DEFAULT_SETTINGS.updates

ШАГ 6: Создать useUpdateStore
  • Глобальный стор

ШАГ 7: Создать useUpdater
  • check, download, install, cancel, rollback, dismiss,
    ignoreVersion
  • Подписки на 4 события

ШАГ 8: Создать useAutoUpdateCheck
  • 3 сек + интервал

ШАГ 9: Создать updateUtils.ts
  • formatVersion, formatReleaseDate, isVersionIgnored,
    normalizeVersion

ШАГ 10: Создать UpdateBadge
  • Бейдж в Sidebar

ШАГ 11: Создать ChangelogRenderer
  • react-markdown + remark-gfm

ШАГ 12: Создать UpdateProgress
  • Прогресс-бар с ETA

ШАГ 13: Создать UpdateModal
  • Модалка с деталями

ШАГ 14: Создать BackupHistory
  • Список бэкапов (опционально)

ШАГ 15: Обновить Settings.tsx
  • Секция «Обновления»

ШАГ 16: Обновить Sidebar
  • Бейдж

ШАГ 17: Обновить App.tsx
  • useAutoUpdateCheck + UpdateModal

ШАГ 18: Обновить constants.ts
  • Константы

ШАГ 19: Написать unit-тесты (Rust)
  • compare_versions, normalize_version, merge_configs
  • cargo test — зелёные

ШАГ 20: Финальная проверка
  • pnpm tauri dev — запускается
  • Проверка обновлений работает
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 RUST — TYPE SAFETY 】
  □ UpdateInfo, DownloadProgress с serde camelCase
  □ Все ошибки через AppError
  □ Никаких unwrap() без обоснования
  □ GitHubRelease — собственный struct для парсинга JSON

【 RUST — ASYNC 】
  □ check_for_updates — async
  □ download_update — стриминг с прогрессом
  □ install_update — async (распаковка + merge)
  □ cancel_download через AtomicBool
  □ Mutex не держится через await

【 RUST — ЛОГИКА 】
  □ GitHub API с User-Agent
  □ semver сравнение корректно (1.10.0 > 1.9.5)
  □ Backup перед установкой
  □ Merge конфигов сохраняет пользовательские домены
  □ Распаковка zip сохраняет структуру
  □ .version обновляется после установки
  □ Ротация бэкапов (max 3)

【 RUST — ТЕСТЫ 】
  □ 3+ теста
  □ Все зелёные
  □ Покрывают edge cases (невалидная версия, отсутствие
    assets)

【 FRONTEND — HOOKS 】
  □ useUpdater: check, download, install, cancel, rollback
  □ Подписки на 4 события с cleanup
  □ useAutoUpdateCheck: 3 сек + интервал
  □ Обработка ошибок

【 FRONTEND — STORE 】
  □ useUpdateStore глобальный
  □ Бейдж и модалка синхронизированы

【 FRONTEND — UI 】
  □ UpdateBadge в Sidebar
  □ UpdateModal с деталями
  □ ChangelogRenderer с markdown
  □ UpdateProgress с ETA
  □ BackupHistory (опционально)
  □ Settings: секция «Обновления»

【 UX 】
  □ Проверка при старте (через 3 сек)
  □ Штатный check_updates из service.bat отключён
    через NO_UPDATE_CHECK=1 — при запуске стратегии
    в логах нет строки о проверке обновлений zapret
  □ utils/check_updates.enabled отсутствует в бандле
  □ Проверка каждые N часов
  □ «Позже» — не напоминать до перезапуска
  □ «Игнорировать версию» — не показывать
  □ Прогресс скачивания виден
  □ Отмена скачивания работает
  □ После установки — пересканирование стратегий
  □ При ошибке — понятное сообщение

【 ДАННЫЕ 】
  □ Настройки пользователя сохраняются
  □ Пользовательские домены Outlast сохраняются
  □ Пользовательские правки в конфигах сохраняются
  □ Бэкап создаётся
  □ Rollback работает (опционально)

【 ПРОИЗВОДИТЕЛЬНОСТЬ 】
  □ Проверка не блокирует UI
  □ Скачивание с прогрессом плавное
  □ Не дёргать GitHub API чаще 1 раза/час

【 БЕЗОПАСНОСТЬ 】
  □ User-Agent обязателен
  □ Checksum проверяется (если есть)
  □ Не выполнять произвольный код из архива
  □ Валидация githubRepo (regex)

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

ГИПОТЕЗА 1: GitHub API возвращает 403
  ПРИЧИНА: нет User-Agent или rate limit.
  ЧТО ПРОВЕРИТЬ: reqwest с .header("User-Agent",
    "Zapret-Manager/0.1.0"). Кэшировать ответ на 1 час.

ГИПОТЕЗА 2: semver::Version::parse падает на «v1.9.5»
  ПРИЧИНА: префикс «v».
  ЧТО ПРОВЕРИТЬ: normalize_version перед парсингом.

ГИПОТЕЗА 3: Распаковка zip падает
  ПРИЧИНА: архив повреждён или имеет пароль.
  ЧТО ПРОВЕРИТЬ: обработка ошибок zip::result::ZipError.

ГИПОТЕЗА 4: Merge конфигов удаляет пользовательские домены
  ПРИЧИНА: эвристика неверна.
  ЧТО ПРОВЕРИТЬ: писать пользовательские домены в отдельный
    файл user-domains.txt с маркером, который сохраняется
    всегда.

ГИПОТЕЗА 5: Backup не создаётся
  ПРИЧИНА: нет прав.
  ЧТО ПРОВЕРИТЬ: если бэкап не удался — прервать установку.

ГИПОТЕЗА 6: UI не обновляется после установки
  ПРИЧИНА: событие "update-installed" не emit'ится.
  ЧТО ПРОВЕРИТЬ: emit после успешной установки.

ГИПОТЕЗА 7: Модалка открывается на каждом старте
  ПРИЧИНА: dismissedUntilRestart не сбрасывается.
  ЧТО ПРОВЕРИТЬ: сбрасывать при старте приложения.

ГИПОТЕЗА 8: react-markdown ломает стили
  ПРИЧИНА: prose-стили не подключены.
  ЧТО ПРОВЕРИТЬ: использовать @tailwindcss/typography или
    свои стили для markdown.

ГИПОТЕЗА 9: Скачивание 100 MB падает на 99%
  ПРИЧИНА: таймаут reqwest.
  ЧТО ПРОВЕРИТЬ: увеличить таймаут до 10 минут, поддержка
    докачки (опционально).

ГИПОТЕЗА 10: Проверка при старте блокирует UI
  ПРИЧИНА: синхронная команда.
  ЧТО ПРОВЕРИТЬ: async + задержка 3 сек после старта.

ГИПОТЕЗА 11: Пользователь потерял свои правки после
   обновления
  ПРИЧИНА: merge не сработал.
  ЧТО ПРОВЕРИТЬ: тест на реальном кейсе — добавить домен в
    list-general.txt → обновить → проверить, что домен
    остался.

ГИПОТЕЗА 12: Название репозитория изменилось
  ПРИЧИНА: апстрим переименован.
  ЧТО ПРОВЕРИТЬ: githubRepo в настройках — конфигурируем.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev

2. Подождать 3–5 секунд после открытия
   ОЖИДАНИЕ:
   • В логах: «Проверка обновлений: текущая X, доступна Y»
   • Если есть обновление — бейдж в Sidebar
   • Если нет — бейдж не появляется

3. Клик на бейдж
   ОЖИДАНИЕ: открывается модалка с деталями:
   • Сравнение версий
   • Changelog (markdown отрендерен)
   • Дата, размер
   • Кнопки: Позже, Игнорировать, Обновить

4. Клик «Позже»
   ОЖИДАНИЕ:
   • Модалка закрывается
   • Бейдж исчезает до следующего запуска

5. Перезапустить приложение
   ОЖИДАНИЕ: бейдж снова появился

6. Клик «Игнорировать»
   ОЖИДАНИЕ:
   • Версия добавлена в ignoredVersions
   • Модалка закрылась
   • Бейдж не появляется для этой версии
   • В Settings → Обновления → Игнорированные: версия видна

7. Клик «Обновить» в модалке (перезапустить, чтобы
   разблокировать версию)
   ОЖИДАНИЕ:
   • Модалка переключается в режим прогресса
   • Прогресс-бар заполняется
   • Скорость отображается
   • ETA показывается
   • Файл скачивается в %TEMP%

8. Клик «Отменить» во время скачивания
   ОЖИДАНИЕ: скачивание отменяется, модалка возвращается

9. Снова «Обновить», дождаться 100%
   ОЖИДАНИЕ:
   • Прогресс достигает 100%
   • Начинается распаковка
   • Бэкап создаётся (проверить папку backup/)
   • Merge конфигов
   • Установка
   • Модалка показывает «Обновление установлено»
   • Стратегии пересканируются
   • Версия обновилась

10. Проверить папку strategies
    ОЖИДАНИЕ:
    • Файлы обновились
    • .version содержит новую версию
    • Пользовательские домены Outlast Trials остались
      (если были)

11. Проверить папку backup
    ОЖИДАНИЕ: одна папка с timestamp

12. Проверить Settings → Обновления
    ОЖИДАНИЕ: текущая версия = новая

13. Проверить работу стратегий
    ОЖИДАНИЕ: обход работает (запустить, проверить
    Discord/YouTube)

14. Проверить, что бейдж исчез
    ОЖИДАНИЕ: нет бейджа (обновлено)

15. Проверить rollback (если реализовано):
    • Settings → История обновлений → выбрать бэкап
    • Клик «Восстановить»
    ОЖИДАНИЕ: файлы вернулись к предыдущей версии

16. Проверить автообновление:
    • Settings → включить autoCheck
    • Установить интервал 1 час
    • Подождать (или проверить через логи, что таймер
      установлен)

17. Проверить проверку при выключенном autoCheck
    ОЖИДАНИЕ: проверка не запускается

18. Изменить githubRepo на несуществующий
    ОЖИДАНИЕ: ошибка «Репозиторий не найден», понятное
    сообщение

19. Проверить кэширование:
    • Проверить 2 раза подряд
    ОЖИДАНИЕ: второй запрос использует кэш (не дёргает API)

20. Открыть Performance → записать 30 сек
    ОЖИДАНИЕ:
    • Проверка не тормозит UI
    • 60 FPS

21. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

22. cargo check
    ОЖИДАНИЕ: 0 warning'ов

23. cargo test
    ОЖИДАНИЕ: все зелёные

24. Task Manager → RAM
    ОЖИДАНИЕ: <300 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать any
❌ Не дёргать GitHub API без User-Agent
❌ Не дёргать API чаще 1 раза/час (кэш)
❌ Не делать строковое сравнение версий (только semver)
❌ Не устанавливать обновление без бэкапа
❌ Не терять пользовательские домены при merge
❌ Не выполнять произвольный код из архива
❌ Не блокировать UI при проверке
❌ Не забывать cleanup listeners
❌ Не забывать про cancel_flag
❌ Не использовать dangerouslySetInnerHTML (react-markdown
   безопасен)
❌ Не забывать про rate limit GitHub (60/час)
❌ Не забывать про normalize_version (убрать «v»)
❌ Не забывать про ротацию бэкапов
❌ Не начинать Этап 13 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 12 завершён, если ВСЕ пункты выполнены:

✅ updater.rs с 8 командами
✅ GitHub API работает (User-Agent, кэш)
✅ semver сравнение корректно
✅ Backup перед установкой (max 3)
✅ Merge конфигов сохраняет пользовательские домены
✅ Распаковка zip работает
✅ .version обновляется
✅ 3+ unit-теста проходят
✅ useUpdateStore глобальный
✅ useUpdater: check, download, install, cancel,
   rollback, dismiss, ignoreVersion
✅ useAutoUpdateCheck: 3 сек + интервал
✅ UpdateBadge в Sidebar (pulse)
✅ UpdateModal с деталями
✅ ChangelogRenderer с markdown
✅ UpdateProgress с ETA
✅ BackupHistory (опционально)
✅ Settings: секция «Обновления»
✅ Фоновая проверка при старте (3 сек)
✅ Проверка каждые N часов
✅ «Позже» — до перезапуска
✅ «Игнорировать версию» работает
✅ Отмена скачивания работает
✅ После установки — пересканирование стратегий
✅ Пользовательские настройки сохраняются
✅ Пользовательские домены сохраняются
✅ Стратегии работают после обновления
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ cargo test — зелёные
✅ Консоль чистая
✅ RAM <300 MB
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 13
═══════════════════════════════════════════════════════════════════════

После Этапа 12 у нас есть:
  • Полный механизм проверки обновлений через GitHub
  • Скачивание с прогрессом
  • Бэкап + merge + установка
  • Rollback (опционально)
  • UI: бейдж, модалка, changelog, прогресс
  • Автопроверка при старте и по интервалу
  • Готовность к Этапу 13

На Этапе 13 нужно будет:
  • Создать полноценную страницу Settings
  • Секции: Общие, Стратегии, Outlast Trials (уже есть),
    VPN, Обновления (уже есть), Продвинутые, О приложении
  • Все настройки рабочие (не заглушки)
  • Сохранение в файл + localStorage
  • Импорт/экспорт настроек
  • Сброс к дефолтным

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 12 — СТОП.

Не начинай Этап 13. Не создавай полную страницу Settings,
не добавляй секции «Общие», «VPN», «Продвинутые».

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 13
  • "Правка: ..." — правка в Этап 12
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.