# ЭТАП 21: БЕЗОПАСНОСТЬ — АУДИТ И ЗАЩИТА

═══════════════════════════════════════════════════════════════════════
ЭТАП 21: БЕЗОПАСНОСТЬ — АУДИТ И ЗАЩИТА
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Провести полный аудит безопасности приложения и закрыть все
векторы атак, критичные для desktop-утилиты, которая работает
с файловой системой, запускает .bat файлы с правами администратора
и загружает данные из интернета. Обеспечить защиту от path
traversal, command injection, symlink-атак, подмены ресурсов,
XSS в WebView, MITM при загрузке обновлений, утечки секретов
в логи, эксплуатируемых уязвимостей в зависимостях.

После этого этапа приложение можно публиковать без опасений:
каждое потенциально опасное действие валидируется, каждое
взаимодействие с ОС проверяется, каждое внешнее данное
санитизируется, каждая зависимость проверена на CVE. Аудит
покрывает как frontend (TypeScript/React/WebView), так и backend
(Rust/Tauri/Windows API), включая IPC между ними.

Это критичный этап перед релизом. Уязвимость в приложении,
которое запускает произвольный код с правами администратора
и имеет доступ к файловой системе пользователя — это
недопустимо.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Модель угроз (STRIDE) для Zapret Manager 】

ОБОСНУЙ:
  • Прежде чем защищать — нужно понять, от кого и что
  • STRIDE-модель:
    - Spoofing: подмена приложения, ресурсов, обновлений
    - Tampering: модификация config.json, .bat, list-*.txt
    - Repudiation: отсутствие логов (не критично)
    - Information disclosure: утечка IP, домены, пути
    - Denial of Service: краш приложения, зависание UI
    - Elevation of privilege: запуск произвольного кода
      с admin-правами

АКТИВЫ (что защищаем):
  • Файловая система пользователя (%APPDATA%, папка
    стратегий)
  • Процессы ОС (не запускать произвольные)
  • Сетевое соединение (VPN, DNS)
  • Настройки (config.json, settings)
  • Логи (не содержат лишнего)

УГРОЗЫ (от кого):
  • Локальный пользователь с ограниченными правами (не
    защищаемся — сам хозяин)
  • Вредоносное ПО на машине (защищаемся частично)
  • Внешние атаки через сеть (MITM при обновлениях)
  • Вредоносные .bat файлы в папке стратегий
    (пользователь скачал откуда-то)
  • Вредоносные list-*.txt (SQL-инъекция не применима,
    но парсинг должен быть безопасен)
  • XSS через логи (пользователь вставил в .bat
    HTML/JS)
  • Path traversal через имена файлов

ВНЕ ОБЛАСТИ ЗАЩИТЫ:
  • Атаки с правами admin (считаем компрометацию ОС
    вне зоны)
  • Физический доступ
  • Атаки на Windows kernel

【 РЕШЕНИЕ 2: Path traversal protection в Rust 】

ОБОСНУЙ:
  • Пользователь может передать путь к папке стратегий
  • Внутри этой папки — файлы .bat
  • Атакующий может создать symlink или передать
    "../../Windows/System32/..."
  • Решение:
    - canonicalize() всех путей
    - Проверка, что canonicalize(path).starts_with(
      canonicalize(base_dir))
    - Отказ, если выходит за пределы base_dir
  • Применяется ко всем командам, работающим с путями

ФУНКЦИЯ:
```rust
fn safe_path(base: &Path, candidate: &Path) -> Result<PathBuf, AppError>
```

ПОЧЕМУ ВАЖНО:
  • Path traversal — OWASP Top 10 #1 (Broken Access Control)
  • Через него — чтение/запись произвольных файлов
  • Через него — запуск произвольных .exe из bundle

【 РЕШЕНИЕ 3: Command injection protection при запуске .bat 】

ОБОСНУЙ:
  • Приложение запускает: `cmd.exe /C "path\to\strategy.bat > log 2>&1"`
  • Если path содержит `& del C:\...` → command injection
  • Решение:
    - Никогда не конкатенировать строки для команды
    - Использовать аргументы через API (не через shell)
    - Для cmd.exe /C: экранировать кавычками + escape
      специальных символов (`^`, `&`, `|`, `<`, `>`, `%`)
    - Или использовать array args (Rust: Command::args)
  • Для ShellExecuteEx (runas) — lpParameters — строка,
    экранировать через двойные кавычки + escape кавычек

ЭКРАНИРОВАНИЕ:
  • Путь оборачивается в двойные кавычки: "path"
  • Внутренние `"` → `""` (удвоение)
  • Спецсимволы `%`, `&`, `^`, `|` — экранировать через `^`
    (только в cmd.exe)

ПОЧЕМУ ВАЖНО:
  • Command injection → запуск произвольных команд
  • С правами admin (UAC) — критично

【 РЕШЕНИЕ 4: Валидация всех входных данных через zod (TS) + serde (Rust) 】

ОБОСНУЙ:
  • Любое данное от пользователя — потенциально опасное
  • Типы в TS не защищают в runtime
  • Zod — runtime-валидация JSON/объектов
  • Serde в Rust — десериализация с проверками
  • Кастомные валидаторы для домена/пути/порта

ГДЕ ВАЛИДИРОВАТЬ:
  • IPC: аргументы Tauri-команд (Rust: #[serde]
    кастомные deserializers)
  • Файлы: config.json, .conf VPN, list-*.txt
  • UI-формы: before invoke → Zod, before write → Zod
  • URL: только https://, только whitelisted домены

ПРАВИЛА:
  • Строки: max length, allowed chars, trim
  • Пути: canonicalize + base check
  • Числа: range check
  • Enum: строгая проверка
  • URL: парсинг + whitelist

【 РЕШЕНИЕ 5: Content Security Policy (CSP) в Tauri 】

ОБОСНУЙ:
  • CSP защищает WebView от XSS, загрузки внешних скриптов
  • Уже настроен в tauri.conf.json (Этап 1)
  • Усилить для production:
    ```
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: asset:;
    font-src 'self';
    connect-src 'self' ipc: http://ipc.localhost;
    media-src 'none';
    object-src 'none';
    frame-src 'none';
    base-uri 'none';
    form-action 'none';
    ```
  • 'unsafe-inline' для style — нужно для Tailwind
  • Никаких 'unsafe-eval', 'unsafe-inline' для script

ПОЧЕМУ ВАЖНО:
  • Логи могут содержать HTML/JS (из .bat файлов)
  • Без CSP — XSS через логи
  • CSP = defense in depth

【 РЕШЕНИЕ 6: XSS protection — никогда не использовать dangerouslySetInnerHTML 】

ОБОСНУЙ:
  • Уже запрещено в Этапе 3
  • Проверить всю кодовую базу
  • Логи рендерятся через HighlightText (без
    dangerouslySetInnerHTML)
  • Markdown — через react-markdown (безопасный)
  • Ссылки в markdown — только https://

ЕСЛИ НАЙДЕНО:
  • Заменить на безопасную альтернативу
  • Или sanitize через DOMPurify (если правда нужен HTML)

【 РЕШЕНИЕ 7: Secure IPC — проверка команд на Rust-стороне 】

ОБОСНУЙ:
  • Tauri IPC — invoke("command_name", args)
  • Любая команда доступна из frontend
  • Но frontend может быть скомпрометирован (XSS)
  • Защита:
    - Валидация аргументов
    - Проверка прав (некоторые команды — только для
      авторизованных окон)
    - Ограничение частоты (rate limit)
  • Каждая команда в Rust — self-contained, не доверяет
    входу

СПИСОК КРИТИЧНЫХ КОМАНД:
  • run_strategy — запуск .bat с admin
  • inject_outlast — модификация конфигов
  • install_update — установка новой версии
  • enable_kill_switch — правила firewall
  • switch_to_vpn — запуск VPN
  • import_vpn_config — копирование .conf

ВСЕ ДОЛЖНЫ:
  • Валидировать аргументы
  • Работать только с разрешёнными путями
  • Логировать операции

【 РЕШЕНИЕ 8: Проверка целостности обновлений (hash + HTTPS) 】

ОБОСНУЙ:
  • Обновления скачиваются с GitHub Releases
  • Защита:
    - Только HTTPS (reqwest с rustls-tls)
    - Проверка SHA-256 (если указан в release)
    - Проверка подписи (если есть)
    - Никогда не выполнять код из архива автоматически
  • После скачивания — распаковка в temp, проверка
    структуры, копирование только известных файлов

ПОЧЕМУ ВАЖНО:
  • MITM-атака → подмена update на malicious
  • Даже с HTTPS — если GitHub скомпрометирован

【 РЕШЕНИЕ 9: Защита от symlink-атак при работе с файлами 】

ОБОСНУЙ:
  • Атакующий может создать symlink в папке стратегий
  • list-general.txt → C:\Windows\System32\config\SAM
  • При чтении/записи — атака
  • Решение:
    - При чтении: canonicalize, проверка base_dir
    - При записи: создать новый файл, а не открывать
      существующий по symlink
    - Использовать O_NOFOLLOW где возможно (не в std,
      через winapi)
  • Или: работать только с файлами, которые сами создали

ПРАКТИКА:
  • Rust std::fs::canonicalize решает symlink автоматически
  • После canonicalize — проверка префикса
  • Для создания: File::create с новым путём

【 РЕШЕНИЕ 10: Никаких секретов в логах и конфигах 】

ОБОСНУЙ:
  • В config.json — настройки, но НЕ пароли VPN
  • В логах — пути, но не содержимое .conf
  • В багрепортах — system info без секретов
  • В трее — название конфига, но не PrivateKey

ПРАВИЛА:
  • Никогда не логировать: содержимое .conf, .json
    с секретами, пароли, PrivateKey
  • Пути — ок
  • Названия файлов — ок
  • Содержимое — только если whitelisted (например,
    list-*.txt)

РЕАЛИЗАЦИЯ:
  • Функция sanitize_log(message) — удаляет
    потенциальные секреты
  • В log-обёртке: проверка на паттерны (PrivateKey =,
    password =, token =)

【 РЕШЕНИЕ 11: Аудит зависимостей (cargo audit, pnpm audit) 】

ОБОСНУЙ:
  • 80% уязвимостей — в зависимостях
  • cargo-audit — проверка Cargo.lock против RustSec
    Advisory Database
  • pnpm audit — проверка package.json против npm
    advisories
  • В CI — блокировка merge, если есть critical/high
  • Регулярное обновление (dependabot)

ПОЧЕМУ ВАЖНО:
  • log4j — пример катастрофы
  • Уязвимая зависимость = уязвимое приложение

РЕАЛИЗАЦИЯ:
  • `cargo install cargo-audit`
  • `cargo audit`
  • `pnpm audit --audit-level=high`
  • В .github/workflows/audit.yml

【 РЕШЕНИЕ 12: Ограничение capabilities Tauri до минимума 】

ОБОСНУЙ:
  • Tauri capabilities определяют, что frontend может
    вызывать
  • Принцип наименьших привилегий
  • В нашем приложении:
    - fs: только чтение/запись в %APPDATA%
    - shell: только конкретные команды
    - dialog: open/save
    - notification: default
    - updater: default
    - process: allow-restart
  • Никаких shell:allow-execute с wildcard
  • Никаких fs:allow-write-file в произвольные места

ПРОВЕРКА:
  • capabilities/default.json — минимальный набор
  • Каждое разрешение обосновано

【 РЕШЕНИЕ 13: WebView sandbox (Tauri настройки) 】

ОБОСНУЙ:
  • Tauri WebView — Chromium (WebView2)
  • Настройки безопасности:
    - `windows.allowlist` — только то, что нужно
    - Отключить devtools в production
    - Отключить контекстное меню в production
    - Отключить drag-n-drop файлов (если не нужно)
    - Отключить devtools на production
  • WebView2 — sandbox process (Windows)

НАСТРОЙКИ:
  • `devtools: false` в bundle.windows
  • `disableContextMenu` (если есть)
  • CSP (см. Решение 5)
  • HTTPS-only для сетевых запросов

【 РЕШЕНИЕ 14: Логирование security-событий отдельно 】

ОБОСНУЙ:
  • Все security-события — в отдельный лог
  • Примеры:
    - Попытка path traversal (отказ)
    - Попытка command injection (санитизация)
    - Попытка загрузки с не-HTTPS URL (отказ)
    - Ошибка проверки hash обновления
    - Попытка запуска .bat вне папки стратегий
  • Для аудита и разбора инцидентов

РЕАЛИЗАЦИЯ:
  • tracing с target: "security"
  • Отдельный файл logs/security.log
  • Не отправляется никуда (privacy)

【 РЕШЕНИЕ 15: Защита от DoS (rate limit, max sizes) 】

ОБОСНУЙ:
  • Даже локально — можно устроить DoS
  • Ограничения:
    - Размер файла .bat: max 10 MB (уже)
    - Размер логов: 10 000 строк (уже)
    - Размер config.json: max 1 MB
    - Размер VPN .conf: max 100 KB
    - Частота invoke команд: rate limit 100/сек
  • При превышении — отказ + лог

ПОЧЕМУ ВАЖНО:
  • Пользователь может случайно сломать приложение
  • Вредоносный .bat не должен вешать систему

【 РЕШЕНИЕ 16: Безопасность unsafe — через типы и линты, не через комментарии 】

ОБОСНУЙ:
  Исходный вариант требовал комментарий «// SAFETY»
  над каждым unsafe и grep по нему в security-audit.sh.
  Комментарии в этом проекте запрещены полностью.
  Грепать по тексту — проверка, которую человек может
  забыть или обойти.

  ЗАМЕНЯЕМ КОММЕНТАРИЙ КОНСТРУКЦИЕЙ КОДА:
  1. Ресурс, который надо освободить → тип-владелец.
     OwnedProcessHandle с impl Drop → CloseHandle
     вызывается автоматически при выходе из скоупа.
     Забыть невозможно — это проверяет компилятор,
     а не дисциплина автора.
  2. Внешний вызов, который может не получиться →
     Result, не unwrap.
  3. Указатель, который может быть нулевым →
     проверка внутри функции, возвращающей Result.
  4. Всё, что выразимо типами, выражаем типами:
     NonNull<T> вместо сырого ptr, AsRawHandle вместо
     isize для HANDLE, срез с длиной вместо ручной
     арифметики по буферу.

  МАШИННАЯ ПРОВЕРКА ВМЕСТО ГРЕПА:
    cargo clippy -- -D clippy::unwrap_used
                 -D clippy::expect_used
                 -D clippy::panic
                 -D clippy::indexing_slicing
  Проверяет ВЕСЬ код, а не только помеченное.
  Строже и надёжнее комментария.

ЧЕК-ЛИСТ ДЛЯ unsafe (без комментариев в коде):
  • Есть ли проверка на null?
  • Освобождается ли HANDLE через impl Drop?
  • Не допускает ли код race condition?
  • Правильные ли типы (AsRawHandle, а не isize)?
  • Есть ли тест на ошибочный путь?

【 РЕШЕНИЕ 17: Защита от подмены bundle-ресурсов 】

ОБОСНУЙ:
  • Пользователь может подменить файлы в
    src-tauri/resources/ (если найдет)
  • При init_resources мы копируем их
  • Проверка:
    - SHA-256 по manifest.json
    - Если hash не совпадает — warning + отказ
    - Или восстановить из установщика
  • В production — файлы в Program Files (нельзя
    редактировать без admin)
  • В dev — свой риск

ПОЧЕМУ ВАЖНО:
  • Подменённый winws.exe = произвольный код с admin
  • Signed bundle (Этап 17) даёт защиту на уровне ОС

【 РЕШЕНИЕ 18: Безопасность сетевых запросов (reqwest) 】

ОБОСНУЙ:
  • Все HTTP-запросы — только HTTPS
  • Только whitelisted домены:
    - api.github.com (обновления)
    - ipwho.is, ipapi.co (network info)
    - github.com, raw.githubusercontent.com
  • Timeout 30 сек
  • User-Agent обязателен
  • Ограничение размера ответа (max 10 MB)

ПОЧЕМУ ВАЖНО:
  • SSRF (Server-Side Request Forgery) — если URL
    приходит от пользователя
  • Проверка домена перед запросом
  • HTTPS-only

【 РЕШЕНИЕ 19: Отключение логирования в релизе (кроме ошибок) 】

ОБОСНУЙ:
  • В release — level: info (не debug)
  • В release — консольные логи отключены
  • Ошибки — в файл
  • Секреты — никогда не логируются

НАСТРОЙКА:
  • tracing: EnvFilter::new("info") по умолчанию
  • Можно повысить через env var для debug

【 РЕШЕНИЕ 20: Audit checklist + automated checks в CI 】

ОБОСНУЙ:
  • Ручной аудит — хорошо
  • Автоматизация — лучше
  • CI-скрипты:
    - cargo audit — уязвимости Rust
    - pnpm audit — уязвимости npm
    - clippy с security lints
    - eslint-plugin-security
    - grep на запрещённые паттерны
      (dangerouslySetInnerHTML, eval, unwrap)

ПОЧЕМУ В CI:
  • Не забыть перед релизом
  • Раннее обнаружение

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/ОБНОВИТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/src/security/mod.rs (создать) 】
Назначение: модуль безопасности.

Содержит:
  • pub mod paths;
  • pub mod sanitize;
  • pub mod rate_limit;
  • pub mod url_validator;

【 2. src-tauri/src/security/paths.rs (создать) 】
Функции:
  • safe_path(base: &Path, candidate: &Path)
    -> Result<PathBuf, AppError>
    - canonicalize оба пути
    - Проверка: candidate начинается с base
    - Возврат canonical candidate

  • safe_filename(name: &str) -> Result<String, AppError>
    - Проверка на `..`, `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`
    - Максимум 255 символов
    - Не пустая

  • is_within(path: &Path, base: &Path) -> bool
    - Быстрая проверка без canonicalize

Тесты:
  • test_safe_path_normal
  • test_safe_path_traversal_rejected
  • test_safe_path_symlink_rejected
  • test_safe_filename_valid
  • test_safe_filename_invalid

【 3. src-tauri/src/security/sanitize.rs (создать) 】
Функции:
  • escape_for_cmd(s: &str) -> String
    - Оборачивает в двойные кавычки
    - Экранирует внутренние `"` как `""`
    - Экранирует `^`, `&`, `|`, `<`, `>`, `%`

  • escape_for_powershell(s: &str) -> String
    - Для PowerShell команд (если будут)

  • sanitize_log_message(msg: &str) -> String
    - Удаляет паттерны PrivateKey, password, token
    - Regex-based

  • validate_domain(domain: &str) -> Result<(), AppError>
    - Regex: `^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$`
    - Максимум 253 символа

  • validate_port(port: u16) -> Result<(), AppError>
  • validate_username(s: &str) -> Result<(), AppError>

Тесты для каждой функции.

【 4. src-tauri/src/security/rate_limit.rs (создать) 】
Структуры:
  • RateLimiter:
    - window: Duration
    - max_requests: usize
    - state: Arc<Mutex<HashMap<String, Vec<Instant>>>>

  • impl RateLimiter:
    - new(window, max) -> Self
    - check(key: &str) -> Result<(), AppError>

Использование:
  • Глобальный limiter для критичных команд
  • Например, run_strategy: 10 запусков / минуту
  • install_update: 1 раз в 5 минут

Тесты:
  • test_rate_limit_allows
  • test_rate_limit_blocks
  • test_rate_limit_window_reset

【 5. src-tauri/src/security/url_validator.rs (создать) 】
Функции:
  • validate_https_url(url: &str, allowed_hosts: &[&str])
    -> Result<url::Url, AppError>
    - Проверка scheme = "https"
    - Проверка host в whitelist
    - Парсинг через url crate

  • ALLOWED_HOSTS: &[&str] — константа:
    - "api.github.com"
    - "github.com"
    - "objects.githubusercontent.com"
    - "ipwho.is"
    - "ipapi.co"

Тесты.

【 6. src-tauri/Cargo.toml (обновить) 】
Добавить:
  • `url = "2.5.4"` — для парсинга URL
  • `regex = "1.11.1"` — уже есть
  • `subtle = "2.6.1"` — для constant-time сравнения хешей
  • `zeroize = "1.8.1"` — для затирания чувствительных данных

DevDeps:
  • (нет новых)

【 7. src-tauri/src/commands/runner.rs (обновить) 】
Изменения:
  • Использовать `paths::safe_path` для strategy_path
  • Использовать `sanitize::escape_for_cmd` для аргументов
  • НЕ конкатенировать строки вручную
  • Логировать security-события
  • Rate limit: max 10 запусков / минуту

【 8. src-tauri/src/commands/injector.rs (обновить) 】
Изменения:
  • Валидация strategy_path через safe_path
  • Валидация каждого домена через validate_domain
  • Валидация портов через validate_port
  • Проверка размера config-файла (max 1 MB)
  • Проверка размера записываемого контента

【 9. src-tauri/src/commands/updater.rs (обновить) 】
Изменения:
  • validate_https_url для download_url
  • Проверка SHA-256 (если есть в manifest)
  • Ограничение размера скачиваемого (max 200 MB)
  • Timeout 10 минут
  • User-Agent обязателен

【 10. src-tauri/src/commands/vpn.rs (обновить) 】
Изменения:
  • Валидация config_path через safe_path
  • Проверка размера .conf (max 100 KB)
  • Парсинг .conf с ограничениями (max строк, max
    длина)
  • Никогда не логировать содержимое .conf
  • Rate limit: switch_to_vpn max 5 / минуту

【 11. src-tauri/src/commands/resources.rs (обновить) 】
Изменения:
  • При restore — проверка SHA-256 всех файлов
  • При init — проверка структуры
  • Отказ от копирования файлов > 50 MB
  • Логирование security-событий

【 12. src-tauri/src/lib.rs (обновить) 】
Изменения:
  • mod security;
  • tracing с отдельным файлом для security-событий

【 13. src-tauri/src/logger.rs (обновить) 】
Изменения:
  • Второй subscriber для security-событий
  • Файл: `%APPDATA%/ZapretManager/logs/security.log`
  • Ротация (max 7 дней)
  • Отдельный формат (JSON или key=value)

【 14. src-tauri/capabilities/default.json (обновить) 】
Убедиться, что capabilities — минимум:
```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-start-dragging",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-unmaximize",
    "core:window:allow-close",
    "core:window:allow-toggle-maximize",
    "core:window:allow-is-maximized",
    "core:window:allow-set-fullscreen",
    "core:window:allow-is-fullscreen",
    "dialog:allow-open",
    "dialog:allow-save",
    "notification:default",
    "process:allow-restart",
    "updater:default"
  ]
}
```

Убрать любые wildcards (`*`).

【 15. src-tauri/tauri.conf.json (обновить) 】
В bundle.windows:
  • `"devtools": false` в production
  • `"allowDowngrades": false`
  • Проверить CSP (уже есть)
  • `"windows"`:
    - `"devtools": false` в production
    - `"resizable": true`
    - `"fullscreen": false`

В app.security:
  • `"capabilities"` — массив (default)

【 16. src/lib/schema.ts (создать или обновить) 】
Zod-схемы для валидации:

  • AppSettingsSchema
  • StrategySchema
  • VpnConfigSchema
  • DomainSchema
  • PortSchema
  • IpRangeSchema
  • UpdateInfoSchema

Все с `.strict()` — запрет неожиданных полей.

【 17. src/lib/sanitize.ts (создать) 】
Функции для frontend:
  • escapeHtml(s: string): string
  • escapeRegex(s: string): string — уже есть в format.ts
  • validateDomain(domain: string): string | null
  • validatePort(port: number): string | null
  • validateIpRange(ip: string): string | null
  • validateFilePath(path: string): string | null

【 18. src/hooks/useSecureInvoke.ts (создать) 】
Обёртка над invoke:

  • Валидирует аргументы через Zod перед вызовом
  • Проверяет rate limit
  • Логирует ошибки
  • Возвращает типизированный результат

【 19. src/components/settings/SecuritySection.tsx (создать, опционально) 】
Настройки безопасности:

  • Toggle «Показывать security-логи»
  • Кнопка «Открыть security.log»
  • Кнопка «Проверить целостность ресурсов»
  • Отображение статуса (все проверки OK)

Расположение: Settings → Продвинутые.

【 20. scripts/security-audit.sh (создать) 】
Скрипт аудита:

```bash
#!/bin/bash
set -e

echo "🔒 Rust audit..."
cargo audit --deny warnings

echo "🔒 Rust lints..."
cargo clippy -- -D warnings \
  -D clippy::unwrap_used \
  -D clippy::expect_used \
  -D clippy::panic \
  -D clippy::indexing_slicing

echo "🔒 NPM audit..."
pnpm audit --audit-level=high --prod

echo "🔒 Grep for dangerous patterns..."
if grep -rn "dangerouslySetInnerHTML\|eval(\|new Function(" src/ | grep -v test; then
  echo "❌ Found dangerous pattern"
  exit 1
fi

echo "❌ No unwrap() or expect() outside tests"
if grep -rn "\.unwrap()\|\.expect(" src-tauri/src/ | grep -v "#\[cfg(test)\]"; then
  echo "Found unwrap/expect in production Rust code"
  exit 1
fi
echo "   clippy already enforces this machine-wide"

echo "✅ All security checks passed"
```

【 21. .github/workflows/security.yml (создать) 】
CI pipeline для аудита:

```yaml
name: Security
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo install cargo-audit
      - run: cargo audit
      - uses: pnpm/action-setup@v2
      - run: pnpm audit --audit-level=high
      - run: bash scripts/security-audit.sh
```

【 22. docs/SECURITY.md (создать) 】
Документация:
  • Модель угроз
  • Что защищаем и как
  • Политика security-обновлений
  • Как сообщить об уязвимости
  • Список проверок

【 23. .eslintrc / eslint.config.js (обновить) 】
Добавить:
  • `eslint-plugin-security`
  • Правила:
    - `security/detect-eval-with-expression`
    - `security/detect-non-literal-fs-filename`
    - `security/detect-object-injection`
    - `security/detect-unsafe-regex`
  • `no-eval`, `no-implied-eval`, `no-new-func`

【 24. src-tauri/src/security/audit_tests.rs (создать) 】
Тесты:
  • test_escape_for_cmd_injection
  • test_path_traversal_rejected
  • test_rate_limit_enforced
  • test_url_validator_https_only
  • test_url_validator_whitelist
  • test_domain_validation
  • test_sanitize_log_private_key
  • test_max_file_size

【 25. SECURITY_AUDIT.md (создать) 】
Отчёт аудита:

  • Дата
  • Список проверенных векторов
  • Найденные проблемы
  • Исправления
  • Список зависимостей с CVE
  • Ссылки на CVE

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Определить модель угроз
  • Записать в docs/SECURITY.md
  • STRIDE
  • Активы
  • Вне области

ШАГ 2: Аудит существующего кода
  • Пройти по списку OWASP Top 10
  • Проверить каждую Tauri-команду на валидацию
  • Проверить каждое место, где конкатенируются пути
  • Записать найденное в SECURITY_AUDIT.md

ШАГ 3: Создать security-модуль в Rust
  • paths.rs, sanitize.rs, rate_limit.rs,
    url_validator.rs
  • Все функции с тестами

ШАГ 4: Обновить runner.rs
  • safe_path
  • escape_for_cmd
  • Rate limit

ШАГ 5: Обновить injector.rs
  • Валидация доменов
  • Проверка размеров
  • safe_path

ШАГ 6: Обновить updater.rs
  • URL validation
  • Hash check
  • Size limit

ШАГ 7: Обновить vpn.rs
  • safe_path
  • Size limit
  • No logging contents

ШАГ 8: Обновить resources.rs
  • SHA-256 проверка
  • Ограничения

ШАГ 9: Настроить security-логирование
  • Отдельный файл
  • Ротация
  • Без секретов

ШАГ 10: Обновить CSP
  • Ужесточить для production
  • Убрать unsafe-* где возможно

ШАГ 11: Обновить capabilities
  • Минимум разрешений
  • Убрать wildcards

ШАГ 12: Обновить tauri.conf.json
  • devtools: false в production

ШАГ 13: Создать Zod-схемы
  • schema.ts
  • Все .strict()

ШАГ 14: Создать sanitize.ts
  • Валидаторы для frontend

ШАГ 15: Создать useSecureInvoke
  • Обёртка с валидацией

ШАГ 16: Обновить eslint
  • Плагин security
  • Правила

ШАГ 17: Аудит зависимостей
  • cargo audit
  • pnpm audit
  • Обновить уязвимые
  • Записать в SECURITY_AUDIT.md

ШАГ 18: Создать scripts/security-audit.sh
  • Все проверки

ШАГ 19: Создать CI workflow
  • .github/workflows/security.yml

ШАГ 20: Аудит unsafe блоков
  • Пройти по каждому unsafe
  • Обоснование переносить в конструкцию кода,
    а не в комментарии (см. Решение 16)
  • Проверить на null

ШАГ 21: Проверка утечек секретов
  • grep на PrivateKey, password, token в коде
  • Проверить логи
  • Проверить бэкапы

ШАГ 22: Тесты безопасности
  • Все unit-тесты зелёные
  • Пентест-кейсы (path traversal, injection)

ШАГ 23: Документация
  • SECURITY.md
  • SECURITY_AUDIT.md

ШАГ 24: Финальная проверка
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • cargo test — все зелёные
  • cargo audit — нет critical/high
  • pnpm audit — нет critical/high
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 МОДЕЛЬ УГРОЗ 】
  □ STRIDE составлена
  □ Активы определены
  □ Вне области — задокументировано
  □ docs/SECURITY.md создан

【 PATH TRAVERSAL 】
  □ safe_path во всех командах
  □ Проверка base_dir
  □ Symlink-защита через canonicalize
  □ Тесты покрывают traversal
  □ Пути с кириллицей работают

【 COMMAND INJECTION 】
  □ escape_for_cmd работает
  □ Нет конкатенации строк для команд
  □ Использование array args где возможно
  □ Тесты на injection
  □ Все cmd.exe вызовы проверены

【 ВАЛИДАЦИЯ 】
  □ Zod-схемы для всех внешних данных
  □ .strict() везде
  □ Кастомные валидаторы (domain, port, ip)
  □ Валидация на Rust тоже
  □ Ошибки валидации — понятны

【 CSP 】
  □ default-src 'self'
  □ script-src 'self' (без unsafe)
  □ style-src 'self' 'unsafe-inline' (Tailwind)
  □ img-src 'self' data: asset:
  □ connect-src ipc: http://ipc.localhost
  □ object-src 'none'
  □ frame-src 'none'
  □ base-uri 'none'

【 XSS 】
  □ Нет dangerouslySetInnerHTML
  □ Нет eval, new Function
  □ Логи рендерятся безопасно
  □ Markdown через react-markdown

【 IPC 】
  □ Все команды валидируют аргументы
  □ Rate limit на критичных командах
  □ Ошибки логируются
  □ Security-логи в отдельном файле

【 ОБНОВЛЕНИЯ 】
  □ HTTPS-only
  □ Whitelist доменов
  □ Проверка SHA-256
  □ Ограничение размера
  □ Timeout

【 SYMLINK 】
  □ canonicalize везде
  □ Проверка base_dir
  □ Тесты

【 СЕКРЕТЫ 】
  □ Нет в логах
  □ Нет в config
  □ Нет в бэкапах
  □ sanitize_log_message

【 ЗАВИСИМОСТИ 】
  □ cargo audit — чисто
  □ pnpm audit — чисто
  □ Нет critical/high
  □ Обновлено, где нужно
  □ Записано в SECURITY_AUDIT.md

【 CAPABILITIES 】
  □ Минимум разрешений
  □ Нет wildcards
  □ Каждое обосновано

【 WEBVIEW 】
  □ devtools: false в production
  □ CSP применён
  □ Sandbox активен

【 RATE LIMIT 】
  □ run_strategy: 10/мин
  □ install_update: 1/5мин
  □ switch_to_vpn: 5/мин
  □ Другие критичные

【 UNSAFE 】
  □ Каждый unsafe ресурс обёрнут в тип-владелец
    (impl Drop), а не «не забудь CloseHandle»
  □ HANDLE хранится как AsRawHandle, не как isize
  □ Указатели — NonNull<T>, не сырой ptr
  □ Проверки на null — внутри функции, не снаружи
  □ cargo clippy с unwrap_used/expect_used/panic проходит
  □ Для каждой функции с unsafe есть тест на ошибочный путь
  □ Комментариев «// SAFETY» в коде нет (запрещены)

【 DDoS 】
  □ Max file size
  □ Max log lines
  □ Max config size
  □ Max VPN .conf

【 CI 】
  □ .github/workflows/security.yml
  □ scripts/security-audit.sh
  □ Все проверки в CI

【 ESLINT 】
  □ eslint-plugin-security
  □ Правила включены
  □ Нет violations

【 ДОКУМЕНТАЦИЯ 】
  □ SECURITY.md
  □ SECURITY_AUDIT.md
  □ Политика сообщения об уязвимостях

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
  □ cargo audit — чисто
  □ pnpm audit — чисто
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: safe_path ломает работу с относительными путями
  ПРИЧИНА: canonicalize требует существующий файл.
  ЧТО ПРОВЕРИТЬ: для несуществующих — создавать
    parent + canonicalize + join filename.

ГИПОТЕЗА 2: escape_for_cmd ломает пути с пробелами
  ПРИЧИНА: неправильное экранирование.
  ЧТО ПРОВЕРИТЬ: путь "C:\My Folder\test.bat" должен
    работать → "C:\My Folder\test.bat" (кавычки).

ГИПОТЕЗА 3: Rate limit блокирует обычную работу
  ПРИЧИНА: слишком строгие лимиты.
  ЧТО ПРОВЕРИТЬ: 10 запусков/мин достаточно. Если
    пользователь перезапускает быстро — увеличить.

ГИПОТЕЗА 4: CSP блокирует Tailwind inline-стили
  ПРИЧИНА: 'unsafe-inline' для style обязателен.
  ЧТО ПРОВЕРИТЬ: если не работает — добавить
    'unsafe-inline' к style-src.

ГИПОТЕЗА 5: URL validator блокирует ipwho.is
  ПРИЧИНА: домен не в whitelist.
  ЧТО ПРОВЕРИТЬ: добавить в ALLOWED_HOSTS.

ГИПОТЕЗА 6: zod .strict() ломает совместимость
  ПРИЧИНА: старый config.json содержит лишние поля.
  ЧТО ПРОВЕРИТЬ: при чтении — strip unknown fields
    (не strict) + warning.

ГИПОТЕЗА 7: cargo audit находит уязвимости
  ПРИЧИНА: старая зависимость.
  ЧТО ПРОВЕРИТЬ: обновить до последней версии. Если
    нельзя — заменить.

ГИПОТЕЗА 8: capabilities минимум ломает работу
  ПРИЧИНА: что-то нужное убрали.
  ЧТО ПРОВЕРИТЬ: логи. Добавить только нужное.

ГИПОТЕЗА 9: Отдельный security.log не создаётся
  ПРИЧИНА: неправильный путь или права.
  ЧТО ПРОВЕРИТЬ: %APPDATA% доступен.

ГИПОТЕЗА 10: Проверка hash в updater блокирует
   валидные обновления
  ПРИЧИНА: хеш не совпадает из-за загрузки частями.
  ЧТО ПРОВЕРИТЬ: считать хеш после полной загрузки
    файла, не потока.

ГИПОТЕЗА 11: Rate limit не работает
  ПРИЧИНА: ключ не уникален.
  ЧТО ПРОВЕРИТЬ: использовать command name + args
    hash как ключ.

ГИПОТЕЗА 12: sanitize_log_message удаляет нужное
  ПРИЧИНА: слишком агрессивный regex.
  ЧТО ПРОВЕРИТЬ: только точные паттерны (PrivateKey =,
    password =). Остальное — оставить.

ГИПОТЕЗА 13: ESLint-plugin-security ложно срабатывает
  ПРИЧИНА: detect-object-injection слишком параноидален.
  ЧТО ПРОВЕРИТЬ: отключить конкретное правило для
    файла или вообще.

ГИПОТЕЗА 14: Symlink в Windows требует admin
  ПРИЧИНА: обычный пользователь не создаёт symlink.
  ЧТО ПРОВЕРИТЬ: для тестов — использовать admin.
    Или symlink в dev-режиме.

ГИПОТЕЗА 15: CI падает на cargo audit
  ПРИЧИНА: старая база данных.
  ЧТО ПРОВЕРИТЬ: cargo install --force cargo-audit
    перед запуском.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить scripts/security-audit.sh
   ОЖИДАНИЕ: все проверки зелёные

2. cargo audit
   ОЖИДАНИЕ: 0 vulnerabilities

3. pnpm audit --audit-level=high
   ОЖИДАНИЕ: 0 high/critical

4. cargo clippy -- -D clippy::unwrap_used
   ОЖИДАНИЕ: 0 issues

5. Проверить path traversal:
   • В DevTools → invoke("scan_strategies",
     { folder: "../../Windows/System32" })
   ОЖИДАНИЕ: ошибка «Вне разрешённой папки»

6. Проверить command injection:
   • Создать .bat с именем "test&del.bat"
   • Запустить
   ОЖИДАНИЕ: запускается как есть, `del` не выполняется

7. Проверить rate limit:
   • Вызвать run_strategy 20 раз подряд
   ОЖИДАНИЕ: после 10 — ошибка «Слишком часто»

8. Проверить URL validation:
   • В updater — подставить http://evil.com
   ОЖИДАНИЕ: ошибка «Только HTTPS»

9. Проверить whitelist:
   • Подставить https://evil.com
   ОЖИДАНИЕ: ошибка «Домен не в whitelist»

10. Проверить CSP:
    • Открыть DevTools → Console
    • Попробовать eval("alert(1)")
    ОЖИДАНИЕ: блокируется CSP

11. Проверить XSS:
    • В .bat добавить `echo <script>alert(1)</script>`
    • Запустить, посмотреть в Logs
    ОЖИДАНИЕ: текст отображается как есть, не
    выполняется

12. Проверить symlink-защиту:
    • Создать symlink (admin) list-general.txt →
      C:\Windows\System32\drivers\etc\hosts
    • Запустить inject
    ОЖИДАНИЕ: отказ

13. Проверить unsafe блоки:
    • grep -rn "unsafe" src-tauri/src/
    • Каждый unsafe ресурс в типе-владельце (impl Drop)
    ОЖИДАНИЕ: все обоснованы

14. Проверить секреты в логах:
    • Импортировать VPN .conf
    • Посмотреть логи
    ОЖИДАНИЕ: содержимое НЕ логируется

15. Проверить capabilities:
    • Открыть capabilities/default.json
    ОЖИДАНИЕ: минимальный список

16. Проверить WebView devtools:
    • pnpm tauri build
    • Запустить .exe
    • F12 не открывает devtools
    ОЖИДАНИЕ: отключено

17. Проверить security.log:
    • Открыть %APPDATA%/ZapretManager/logs/security.log
    ОЖИДАНИЕ: файл существует, есть security-события

18. Проверить rate limit logs:
    • Посмотреть в security.log
    ОЖИДАНИЕ: событие rate_limit_exceeded

19. cargo test
    ОЖИДАНИЕ: все тесты зелёные (включая
    security_tests)

20. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

21. cargo check
    ОЖИДАНИЕ: 0 warning'ов

22. Проверить SECURITY_AUDIT.md
    ОЖИДАНИЕ: полностью заполнен

23. CI workflow:
    • Push в ветку
    ОЖИДАНИЕ: workflow security запущен, зелёный

24. Открыть docs/SECURITY.md
    ОЖИДАНИЕ: полная документация

25. Собрать релиз
    • pnpm tauri build
    ОЖИДАНИЕ: успешно, все security проверки пройдены

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать unwrap() в production-коде
   (обоснование даёт конструкция через Result,
   а не комментарий)
❌ Не использовать eval, new Function, dangerouslySetInnerHTML
❌ Не конкатенировать строки для команд (только escape)
❌ Не доверять входным данным (валидировать всё)
❌ Не логировать секреты (PrivateKey, password, token)
❌ Не хардкодить секреты
❌ Не использовать http:// (только https://)
❌ Не загружать с произвольных доменов
❌ Не выполнять код из архива обновлений
❌ Не забывать canonicalize для путей
❌ Не забывать rate limit
❌ Не забывать CSP
❌ Не забывать минимум capabilities
❌ Не забывать devtools: false в prod
❌ Не забывать cargo audit в CI
❌ Не забывать pnpm audit в CI
❌ Не забывать security-логирование
❌ Не забывать SHA-256 проверку обновлений
❌ Не забывать размерные лимиты
❌ Не забывать про симлинки
❌ Не начинать Этап 22 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 21 завершён, если ВСЕ пункты выполнены:

✅ STRIDE-модель задокументирована
✅ SECURITY.md создан
✅ security/mod.rs, paths.rs, sanitize.rs,
   rate_limit.rs, url_validator.rs
✅ safe_path работает
✅ escape_for_cmd работает
✅ validate_domain, validate_port, validate_ip
✅ RateLimiter работает
✅ validate_https_url работает
✅ runner.rs обновлён (safe_path, escape, rate limit)
✅ injector.rs обновлён (валидация)
✅ updater.rs обновлён (HTTPS, hash, size)
✅ vpn.rs обновлён (safe_path, no logging)
✅ resources.rs обновлён (SHA-256)
✅ CSP ужесточён
✅ XSS-protection (dangerouslySetInnerHTML проверен)
✅ Zod-схемы для всех данных
✅ useSecureInvoke обёртка
✅ capabilities минимизированы
✅ devtools: false в production
✅ Security-логирование в отдельный файл
✅ sanitize_log_message работает
✅ Тесты безопасности (10+)
✅ cargo audit — чисто
✅ pnpm audit — чисто
✅ eslint-plugin-security подключён
✅ scripts/security-audit.sh работает
✅ CI workflow создан
✅ SECURITY_AUDIT.md заполнен
✅ Rate limit работает
✅ Проверка SHA-256 обновлений
✅ Ни одного unwrap() в production-коде
✅ Каждый unsafe ресурс в типе-владельце с impl Drop
✅ Ни одного eval/Function/dangerouslySetInnerHTML
✅ Ни одного секрета в логах
✅ cargo test — все зелёные
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ Консоль чистая
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 22
═══════════════════════════════════════════════════════════════════════

После Этапа 21 у нас есть:
  • Полный аудит безопасности
  • Защита от path traversal, command injection, XSS
  • Rate limit на критичных командах
  • Валидация всех входных данных (Zod + Rust)
  • Минимум capabilities
  • Строгий CSP
  • Security-логирование
  • Аудит зависимостей (cargo + pnpm)
  • CI security pipeline
  • Готовность к Этапу 22 — «Тесты и аудит»

На Этапе 22 нужно будет:
  • Создать полный набор E2E-тестов через Playwright
  • Тесты на основные сценарии (запуск, стоп, VPN,
    обновления, Settings)
  • Unit-тесты для всех критичных функций
  • Проверка консоли (нет ошибок, нет warning'ов)
  • Аудит кода (мёртвый код, дубликаты)
  • Проверка на утечки памяти
  • Проверка UX (нет «тупиков»)
  • Финальная проверка чек-листа проекта

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 21 — СТОП.

Не начинай Этап 22. Не создавай E2E-тесты, не делай
финальный аудит кода, не проверяй на утечки памяти.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 22
  • "Правка: ..." — правка в Этап 21
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.

---
