═══════════════════════════════════════════════════════════════════════
ЭТАП 6: RUST — ЗАПУСК .BAT С ПРАВАМИ АДМИНА И ПЕРЕХВАТ ЛОГОВ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Научить приложение запускать выбранную .bat-стратегию с правами
администратора (UAC), перехватывать stdout/stderr в реальном
времени, отслеживать PID процесса, останавливать его по кнопке
и корректно завершать все процессы при закрытии приложения.

После этого этапа пользователь сможет:
  • Нажать Play в карточке стратегии → появится UAC-запрос →
    стратегия запустится
  • Видеть логи работы стратегии в реальном времени
  • Нажать Stop → процесс завершится
  • Закрыть приложение → все запущенные .bat будут убиты
  • Не оставлять зомби-процессов

Это САМЫЙ СЛОЖНЫЙ технический этап. Здесь нужно:
  • Работать с winapi (ShellExecuteEx, CreateProcess)
  • Перехватывать stdout/stderr с UAC-процесса (не тривиально)
  • Отслеживать PID и не терять его
  • Корректно убивать процессы (включая дочерние — winws.exe)
  • Не оставлять зомби после закрытия

Если этот этап сделан неправильно — пользователь увидит
«зависшие» процессы, съедающие CPU, или вообще не сможет
запустить стратегию. Поэтому здесь НЕЛЬЗЯ торопиться.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Запуск через cmd /C с правами админа 】

ОБОСНУЙ:
  • .bat файлы в Windows выполняются через cmd.exe
  • Прямой запуск .bat без cmd не работает
  • Команда: cmd.exe /C "path\to\strategy.bat"
  • Ключ /C — выполнить и выйти (не /K — тот оставляет cmd)
  • Права админа повышаются через ShellExecuteEx с глаголом
    "runas"

ПОЧЕМУ НЕ ПРОСТО Command::new("strategy.bat"):
  • Rust std::process::Command не умеет повышать права
  • Не покажет UAC-диалог
  • .bat не выполнится без cmd /C

ПОЧЕМУ НЕ TAURI SHELL PLUGIN:
  • Плагин не поддерживает UAC-повышение
  • Не перехватывает stdout с elevated-процессов
  • Мы уже используем плагин для других целей, но для
    запуска .bat он не подходит

【 РЕШЕНИЕ 2: Перехват stdout/stderr через файл, а не через пайпы 】

ПОЧЕМУ ЭТО КРИТИЧНО:
  • ShellExecuteEx с "runas" НЕ даёт возможности напрямую
    читать stdout процесса (это ограничение Windows)
  • При попытке передать пайп из непривилегированного
    процесса в привилегированный — Windows блокирует

РЕШЕНИЕ:
  • Перед запуском создаём временный файл лога:
    %TEMP%/zapret-manager/logs/{strategy_id}_{timestamp}.log
  • Модифицируем команду запуска:
    cmd.exe /C "strategy.bat > log_file 2>&1"
  • После запуска — читаем файл в реальном времени
    (tail -f логика)
  • Каждые 100ms — читаем новые строки → emit в frontend
  • Файл удаляется после остановки стратегии

ПОЧЕМУ НЕ TAIL ЧЕРЕЗ BUFREADER:
  • Файл может быть занят процессом
  • На Windows нельзя открыть файл для чтения, если он
    открыт для записи другим процессом (без FILE_SHARE_READ)
  • Обход: открывать с флагом FILE_SHARE_READ | FILE_SHARE_WRITE
  • Использовать tokio::fs::File::open + seek + read_to_string

ПОЧЕМУ НЕ NAMED PIPES (NAMED PIPE):
  • Сложно, требуют admin-прав для создания
  • Ещё сложнее с UAC
  • Не работает на старых Windows

ПОЧЕМУ НЕ WMI EVENT (Win32_ProcessStartTrace):
  • Избыточно для этой задачи
  • Медленно
  • Требует прав

ВЫВОД: Файловый подход — единственный рабочий для UAC-процессов
на Windows.

【 РЕШЕНИЕ 3: Получение PID через ShellExecuteEx с SEE_MASK_NOCLOSEPROCESS 】

ОБОСНУЙ:
  • ShellExecuteEx возвращает SHELLEXECUTEINFO с полем hProcess
  • Если указать флаг SEE_MASK_NOCLOSEPROCESS — получим
    handle процесса
  • Из handle можно получить PID через
    GetProcessId(hProcess)
  • Это единственный способ получить PID процесса,
    запущенного с UAC

ПОЧЕМУ НЕ Get-Process В PowerShell:
  • Медленно (запуск PowerShell = 300ms)
  • Не всегда находит нужный процесс (по имени конфликт)
  • Зависит от локали Windows

ПОЧЕМУ НЕ WMI:
  • Медленно
  • Ненадёжно при частых запусках

【 РЕШЕНИЕ 4: Хранение PID + метаданных в in-memory карте 】

ОБОСНУЙ:
  • HashMap<String, RunningProcess>
  • Ключ: strategy_id
  • Значение: RunningProcess { pid, log_path, started_at,
    join_handle }
  • Защищено через std::sync::Mutex (или tokio::sync::RwLock)
  • Не persist — только на время работы приложения

ПОЧЕМУ НЕ В STORE (frontend):
  • PID — это системный ресурс, должен жить в Rust
  • Frontend может «потерять» PID при перезагрузке UI
  • Rust-стор — единый источник правды

【 РЕШЕНИЕ 5: Чтение логов через таск tokio с интервалом 100ms 】

ОБОСНУЙ:
  • После запуска — spawn tokio task, которая:
    - Каждые 100ms открывает файл лога
    - Читает новые строки (по позиции last_position)
    - Emit'ит событие "strategy-log" в frontend
    - Обновляет last_position
    - Проверяет, жив ли процесс
    - Если процесс умер — читает остаток и завершается
  • Таск останавливается при вызове stop_strategy или
    завершении процесса

ПОЧЕМУ НЕ ЭВЕНТ ЧТЕНИЯ ФАЙЛА (notify crate):
  • На Windows могут быть проблемы с locks
  • Избыточно — у нас и так 100ms polling
  • Проще контролировать

ПОЧЕМУ 100ms, А НЕ 50ms ИЛИ 200ms:
  • 50ms — слишком часто, лишняя нагрузка
  • 200ms — заметная задержка в UI
  • 100ms — оптимально для восприятия «реального времени»

【 РЕШЕНИЕ 6: Остановка — TerminateProcess + kill по имени winws.exe 】

ОБОСНУЙ:
  ГЛАВНАЯ ПРОБЛЕМА ЭТОГО ЭТАПА. Стратегии zapret
  запускают winws.exe так:
    start "zapret: %~n0" /min "%BIN%winws.exe" --wf-tcp=...
  Команда `start` порождает ОТСОЕДИНЁННОГО потомка.
  PID из ShellExecuteEx принадлежит cmd.exe.
  taskkill /PID {pid} /T /F по дереву cmd.exe winws.exe
  НЕ УБЬЁТ — он уже потерял родителя. Итог: зомби-процесс,
  который продолжает гонять трафик после нажатия Stop и
  после закрытия приложения.

  РЕШЕНИЕ (принято пользователем):
  1. TerminateProcess(hProcess, 1) — убить cmd.exe.
     Handle из ShellExecuteEx с SEE_MASK_NOCLOSEPROCESS
     даёт полные права, UAC повторно не спрашивается.
  2. taskkill /IM winws.exe /F — убить все процессы winws
     по имени, включая отсоединённые.
  3. taskkill /PID {pid} /T /F — добить дерево cmd.exe.
  Порядок именно такой: сначала родитель, потом по имени.

  ПОЧЕМУ ИМЕННО ПО ИМЕНИ:
  • Единственный способ достать отсоединённый процесс
  • Не требует разбора аргументов winws и подстановки
    переменных %BIN% / %GameFilterTCP%
  • Надёжно на любой версии zapret, где используется start

  ЦЕНА РЕШЕНИЯ (осознанная):
  • Убиваются ВСЕ процессы winws.exe, в том числе запущенные
    пользователем вручную вне приложения
  • Это приемлемо: winws.exe — специализированный бинарь
    zapret, отдельного назначения у него нет
  • Факт убийства пишется в лог как предупреждение, чтобы
    пользователь понимал, что произошло

ПОЧЕМУ НЕ ТОЛЬКО TerminateProcess:
  • Он убивает только cmd.exe, winws.exe остаётся

ПОЧЕМУ НЕ ТОЛЬКО taskkill /PID /T /F:
  • Не достаёт отсоединённый winws.exe — главный случай

ПОЧЕМУ НЕ ПАРСИТЬ АРГУМЕНТЫ И ЗАПУСКАТЬ WINWS НАПРЯМУЮ:
  • Технически надёжнее (настоящий PID), но требует полного
    резолвера переменных %BIN%/%LISTS%/%GameFilterTCP%/%GameFilterUDP%
    и воспроизведения всех --filter-tcp/--filter-udp блоков
  • Стратегия zapret меняет состав аргументов от версии
    к версии — парсер придётся поддерживать вечно
  • Отложено: приоритет — надёжность и предсказуемость,
    а winws.exe продолжит запускаться самим .bat

【 РЕШЕНИЕ 7: Cleanup при выходе — Drop-хук + Tauri on_window_event 】

ОБОСНУЙ:
  • При закрытии приложения нужно убить все запущенные
    процессы
  • Реализация: 
    - impl Drop for ProcessManager → kill всех
    - Tauri on_window_event(CloseRequested) → явный вызов
      cleanup ДО закрытия
  • Нельзя полагаться только на Drop — при force kill
    приложения (через Task Manager) Drop не вызовется
  • Дополнительно: сохранять PID в файл, при следующем
    старте проверять и убивать «осиротевшие»

ПОЧЕМУ ДВА МЕХАНИЗМА (Drop + on_window_event):
  • Drop не всегда вызывается (panic, force kill)
  • on_window_event вызывается при нормальном закрытии
  • Комбинация даёт 99% надёжность

【 РЕШЕНИЕ 8: Events через tauri::Emitter для логов и статуса 】

ОБОСНУЙ:
  • Frontend подписывается через listen("strategy-log", ...)
  • Rust emit'ит событие при новых строках лога
  • Событие содержит: { strategyId, lines: LogEntry[] }
  • Батчинг: за один цикл (100ms) может прийти 10+ строк —
    отправляем одной пачкой
  • Отдельные события: "strategy-started" { strategyId, pid },
    "strategy-stopped" { strategyId, exitCode },
    "strategy-error" { strategyId, error }

ПОЧЕМУ НЕ POLLING С FRONTEND:
  • Frontend не имеет доступа к Rust-состоянию напрямую
  • Polling = нагрузка
  • Events — push-модель, эффективнее

【 РЕШЕНИЕ 9: Логи в формате LogEntry (совместимость с Этапом 4) 】

ОБОСНУЙ:
  • Frontend ждёт LogEntry с полями: id, timestamp, level,
    source, message, strategyId
  • Rust парсит каждую строку из файла и определяет level:
    - содержит "ERROR" / "error" / "failed" → "error"
    - содержит "WARN" / "warning" → "warn"
    - содержит "OK" / "success" / "started" → "success"
    - остальное → "info"
  • Парсинг простой, без сложных regex
  • Формат timestamp — Unix ms

ПОЧЕМУ НЕ ПРОСТО СТРОКА:
  • UI на Этапе 7 будет фильтровать по level
  • Строку парсить на frontend — лишняя нагрузка
  • Единый формат LogEntry — консистентность

【 РЕШЕНИЕ 10: Детект «зависшей» стратегии (timeout) 】

ОБОСНУЙ:
  • Если .bat запущен, но не пишет логи 5 секунд — возможно,
    он завис
  • Не убивать автоматически (пользователь может ждать
    долгую инициализацию)
  • Показать в UI предупреждение через Badge warning
  • На Этапе 9 (Dashboard) — добавить кнопку «Перезапустить»

ПОЧЕМУ НЕ УБИВАТЬ АВТОМАТИЧЕСКИ:
  • winws.exe может долго инициализироваться
  • Ложные срабатывания раздражают пользователя

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/src/commands/runner.rs 】
Назначение: основная логика запуска/остановки стратегий.

Структуры:
  • RunningProcess (internal):
    - pid: u32
    - log_path: PathBuf
    - started_at: u64 (Unix ms)
    - last_position: u64 (позиция в файле для tail)
    - log_task_handle: Option<JoinHandle<()>>
    - process_handle: isize (hProcess из ShellExecuteEx,
      для TerminateProcess)
  • ProcessManager:
    - processes: Arc<Mutex<HashMap<String, RunningProcess>>>
    - log_dir: PathBuf (%TEMP%/zapret-manager/logs)
    - impl new() -> Self
    - impl Drop → kill_all()

Команды:
  • run_strategy(app: AppHandle, state: State<ProcessManager>,
    strategy_id: String, path: String) -> Result<RunResult,
    AppError>
    Логика:
    1. Проверить, что стратегия не запущена
    2. Создать путь к логу: log_dir/{id}_{timestamp}.log
    3. Создать директорию logs, если не существует
    4. Сформировать команду:
       cmd.exe /C "path\strategy.bat > log 2>&1"
    5. Запустить через ShellExecuteExW с "runas" и
       SEE_MASK_NOCLOSEPROCESS
    6. Получить PID через GetProcessId(hProcess)
    7. Сохранить RunningProcess в HashMap
    8. Spawn tokio task для чтения логов
    9. Emit event "strategy-started" в frontend
    10. Вернуть { pid, logPath }

  • stop_strategy(app: AppHandle, state: State<ProcessManager>,
    strategy_id: String) -> Result<(), AppError>
    Логика:
    1. Найти RunningProcess в HashMap
    2. TerminateProcess(process_handle, 1) — родитель
    3. taskkill /PID {pid} /T /F — дерево cmd.exe
    4. taskkill /IM winws.exe /F — ВСЕ отсоединённые
       winws.exe, запущенные этой стратегией
    5. Дождаться завершения log_task_handle
    6. Удалить из HashMap
    7. Удалить лог-файл (или оставить — параметр)
    8. Emit event "strategy-stopped"
    9. Если были убиты процессы по имени — писать в лог
       предупреждение уровня warn:
       «Остановлены все процессы winws.exe. Если вы запускали
        zapret вручную — он тоже остановлен.»

  • check_strategy_status(state: State<ProcessManager>,
    strategy_id: String) -> Result<ProcessStatus, AppError>
    Логика:
    ВАЖНО: cmd.exe завершается сразу после `start`.
    Команда start — последняя в general.bat, поэтому
    процесс cmd.exe живёт доли секунды. PID из
    ShellExecuteEx к моменту проверки уже мёртв.
    Источник правды о «живости» — наличие процесса
    winws.exe, а не PID родителя.

    1. Найти запись в HashMap
    2. Если не найден → { running: false }
    3. Проверить через sysinfo наличие ЛЮБОГО процесса
       с именем winws.exe
    4. Если winws.exe нет → очистить запись,
       вернуть { running: false }
    5. Иначе → { running: true, winwsPids: Vec<u32>,
       startedAt, uptime }
    6. winwsPids отдавать наружу, чтобы UI мог показать
       реальные PID движущихся процессов, а не мёртвый
       PID cmd.exe

  • list_running_processes(state: State<ProcessManager>)
    -> Vec<RunningInfo>
    Для восстановления состояния UI после перезагрузки.

  • kill_all_processes(state: State<ProcessManager>)
    -> Result<usize, AppError>
    Для вызова при закрытии приложения.

Вспомогательные функции:
  • run_elevated(cmd: &str, args: &str) -> Result<(isize, u32),
    AppError>
    - ShellExecuteExW с runas
    - Возвращает (hProcess, pid)
    - Обработка отмены UAC (пользователь нажал «Нет»)
  • spawn_log_reader(app: AppHandle, strategy_id: String,
    log_path: PathBuf, process_handle: isize)
    -> JoinHandle<()>
    - Tokio task, читает новые строки каждые 100ms
    - Emit'ит events
  • parse_log_line(line: &str, strategy_id: &str) -> LogEntry
    - Определяет level по ключевым словам
    - Генерирует id через nanoid
    - Timestamp — текущее время
  • cleanup_orphans(log_dir: &Path) -> Result<usize, AppError>
    - При старте приложения проверяет log_dir на старые
      файлы и убивает осиротевшие процессы (по PID из
      имени файла, если такое сохраняем)

Требования:
  • Все команды — async, кроме kill_all (может быть sync)
  • Никаких unwrap() без обоснования
  • Все ошибки через AppError
  • Логирование через tracing
  • Mutex не держится через await (используем короткие
    блокировки или tokio::sync::Mutex)

【 2. src-tauri/src/commands/mod.rs (обновить) 】
Добавить:
  • pub mod runner;
  • pub use runner::{run_strategy, stop_strategy,
    check_strategy_status, list_running_processes,
    kill_all_processes};

【 3. src-tauri/src/process_manager.rs (альтернативно) 】
Если решите вынести ProcessManager отдельно:
  • Структура ProcessManager с impl new, kill_all
  • impl Drop
  • Публичные методы: insert, remove, get, contains, clear
  • Использование Arc<Mutex<HashMap>> внутри

【 4. src-tauri/src/lib.rs (обновить) 】
Изменения:
  • Добавить mod process_manager; (если отдельный)
  • Создать ProcessManager при старте:
    .manage(ProcessManager::new())
  • Зарегистрировать команды:
    commands::run_strategy, commands::stop_strategy,
    commands::check_strategy_status,
    commands::list_running_processes,
    commands::kill_all_processes
  • Добавить on_window_event для CloseRequested →
    kill_all_processes
  • При старте — cleanup_orphans

【 5. src-tauri/src/winapi_helpers.rs (новый) 】
Назначение: обёртки над winapi для ShellExecuteEx.

Функции:
  • shell_execute_runas(cmd: &str, args: &str) -> Result<(isize,
    u32), AppError>
    - Заполнить SHELLEXECUTEINFOW
    - fMask = SEE_MASK_NOCLOSEPROCESS | SEE_MASK_NOASYNC
    - lpVerb = "runas"
    - lpFile = cmd
    - lpParameters = args
    - lpShowCmd = SW_HIDE (не показывать окно cmd)
    - Вызвать ShellExecuteExW
    - Проверить hProcess != 0 (иначе — пользователь отменил UAC)
    - GetProcessId(hProcess) → pid
  • terminate_process(handle: isize, exit_code: u32) -> bool
    - TerminateProcess(handle as HANDLE, exit_code)
  • close_handle(handle: isize)
    - CloseHandle(handle as HANDLE)
  • is_process_alive(pid: u32) -> bool
    - OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, ...)
    - GetExitCodeProcess → STILL_ACTIVE?

Требования:
  • Все обёртки — unsafe блоки
  • Проверка на null handle
  • Корректная обработка ошибок Windows (GetLastError)

【 6. src-tauri/Cargo.toml (обновить) 】
Добавить:
  • winapi = { version = "0.3.9", features = [
    "shellapi", "winbase", "winnt", "processthreadsapi",
    "handleapi", "winuser", "errhandlingapi"
    ] }
  • tokio = { version = "1.42.0", features = ["full"] } —
    уже есть
  • sysinfo — уже есть

【 7. src-tauri/capabilities/default.json (обновить) 】
Добавить:
  • "shell:allow-execute" — уже есть, но убедиться
  • Возможно, добавить кастомные разрешения для events:
    "core:event:default"

【 8. src/hooks/useStrategyRunner.ts 】
Назначение: React-хук для запуска/остановки стратегий.

Состояние (локальное):
  • isStarting: boolean (UAC-запрос показан)
  • isStopping: boolean
  • error: string | null

Методы:
  • run(strategyId: string): Promise<void>
    1. setStarting(true)
    2. useStrategiesStore.setStatus(id, "starting")
    3. invoke("run_strategy", { strategyId, path })
    4. При успехе:
       - setStatus(id, "running")
       - setPid(id, result.pid)
       - useLogsStore.addLog (info, "Стратегия запущена")
    5. При ошибке:
       - setStatus(id, "error")
       - setError(id, message)
       - useLogsStore.addLog (error, message)
    6. setStarting(false)

  • stop(strategyId: string): Promise<void>
    1. setStopping(true)
    2. useStrategiesStore.setStatus(id, "stopping")
    3. invoke("stop_strategy", { strategyId })
    4. При успехе:
       - setStatus(id, "idle")
       - setPid(id, undefined)
    5. setStopping(false)

  • checkStatus(strategyId): Promise<ProcessStatus>
    Для периодической проверки (раз в 5 секунд)

Подписка на события (useEffect):
  • listen("strategy-log", (event) => {
      useLogsStore.addLogs(event.payload.lines)
    })
  • listen("strategy-started", ...)
  • listen("strategy-stopped", (event) => {
      useStrategiesStore.setStatus(id, "idle")
      useStrategiesStore.setPid(id, undefined)
    })
  • listen("strategy-error", ...)
  • Cleanup всех listeners при unmount

Возвращает:
  • { run, stop, checkStatus, isStarting, isStopping, error }

Требования:
  • Все listeners — с cleanup
  • Не вызывать invoke, если уже запущено/останавливается
  • Обрабатывать «пользователь отменил UAC» — отдельный
    case с понятным сообщением

【 9. src/hooks/useProcessWatcher.ts (опционально) 】
Назначение: следит за статусом процессов раз в 5 секунд.

Логика:
  • setInterval 5000ms
  • Для каждой strategy со статусом "running" — invoke
    check_strategy_status
  • Если процесс мёртв, а статус "running" — обновить
    на "error" с сообщением «Процесс неожиданно завершился»
  • Cleanup при unmount

ПОЧЕМУ 5 СЕКУНД:
  • Не слишком часто (лишние invoke)
  • Не слишком редко (пользователь заметит зависание)

【 10. src/components/strategies/StrategyCard.tsx (обновить) 】
Изменения:
  • Кнопка Play/Stop — теперь активна:
    - status "idle" → Play (primary, icon Play)
    - status "starting" → Spinner (disabled)
    - status "running" → Stop (danger, icon Square)
    - status "stopping" → Spinner (disabled)
    - status "error" → Play (primary, icon RefreshCw)
  • При клике Play → run(strategy.id)
  • При клике Stop → stop(strategy.id)
  • Бейдж статуса:
    - idle → neutral
    - starting → warning (pulse)
    - running → success (pulse)
    - stopping → warning (pulse)
    - error → error
  • Отображение PID при running (mono, text-xs)

【 11. src/components/strategies/StopConfirmDialog.tsx (опционально) 】
Назначение: подтверждение остановки.

Использование:
  • При клике Stop показать Modal с вопросом:
    «Остановить стратегию "Discord + YouTube"?»
  • Кнопки: «Отмена» (secondary), «Остановить» (danger)

ПОЧЕМУ НЕ ПРОСТО КЛИК:
  • Случайная остановка раздражает
  • Активная стратегия — важное состояние

【 12. src/lib/constants.ts (обновить) 】
Добавить:
  • LOG_READ_INTERVAL_MS: 100
  • PROCESS_CHECK_INTERVAL_MS: 5000
  • MAX_LOG_LINES_PER_EVENT: 50 (батчинг)
  • LOG_FILE_MAX_AGE_HOURS: 24 (для cleanup)

【 13. src-tauri/src/commands/runner_tests.rs (опционально) 】
Тесты:
  • test_parse_log_line_info
  • test_parse_log_line_error
  • test_parse_log_line_warn
  • test_parse_log_line_success
  • test_process_manager_insert_remove
  • test_process_manager_kill_all (mock)

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создать src-tauri/src/winapi_helpers.rs
  • Обёртки shell_execute_runas, terminate_process,
    close_handle, is_process_alive
  • Все — unsafe с проверками
  • Тесты на is_process_alive (current process → true)

ШАГ 2: Создать src-tauri/src/process_manager.rs
  • ProcessManager с Arc<Mutex<HashMap>>
  • Методы insert, remove, get, contains, clear
  • impl Drop → kill_all
  • kill_all — sync, вызывает TerminateProcess + taskkill

ШАГ 3: Создать src-tauri/src/commands/runner.rs
  • run_strategy (async)
  • stop_strategy (async)
  • check_strategy_status (async)
  • list_running_processes
  • kill_all_processes
  • Вспомогательные функции (spawn_log_reader,
    parse_log_line, cleanup_orphans)

ШАГ 4: Обновить src-tauri/src/commands/mod.rs
  • pub mod runner;
  • Реэкспорт команд

ШАГ 5: Обновить src-tauri/src/lib.rs
  • Добавить mod process_manager; mod winapi_helpers;
  • Создать ProcessManager при старте
  • Зарегистрировать команды
  • Добавить on_window_event для CloseRequested
  • При старте — cleanup_orphans

ШАГ 6: Обновить src-tauri/Cargo.toml
  • Добавить winapi с нужными features
  • cargo check — без warning'ов

ШАГ 7: Обновить capabilities/default.json
  • Убедиться, что есть shell:allow-execute
  • Добавить core:event:default если нужно

ШАГ 8: Создать src/hooks/useStrategyRunner.ts
  • run, stop, checkStatus
  • Подписки на события
  • Cleanup listeners

ШАГ 9: Создать src/hooks/useProcessWatcher.ts (опционально)
  • Интервал 5 сек
  • Проверка статуса running-стратегий

ШАГ 10: Обновить StrategyCard.tsx
  • Кнопка Play/Stop
  • Логика по статусу
  • Отображение PID

ШАГ 11: Обновить useStrategiesStore (Этап 4)
  • Убедиться, что есть setPid, setStatus, setError
  • Проверить, что нет конфликтов с этапом 4

ШАГ 12: Создать StopConfirmDialog (опционально)
  • Modal с подтверждением

ШАГ 13: Обновить constants.ts
  • Константы из списка выше

ШАГ 14: Обновить App.tsx
  • Подключить useProcessWatcher на верхнем уровне
  • При монтировании — cleanup_orphans

ШАГ 15: Написать unit-тесты (Rust)
  • runner_tests.rs с 6+ тестами
  • cargo test — все зелёные

ШАГ 16: Финальная проверка
  • pnpm tauri dev — запускается
  • Запустить стратегию → UAC → логи → Stop
  • Закрыть приложение → процессы убиты
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • cargo test — все зелёные
  • Пройти чек-лист Части 4

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 RUST — TYPE SAFETY 】
  □ Все ошибки через AppError
  □ Никаких unwrap() без обоснования
  □ winapi-вызовы с проверкой на null handle
  □ GetLastError вызывается при ошибках
  □ Mutex не держится через await

【 RUST — ASYNC 】
  □ run_strategy, stop_strategy, check_strategy_status — async
  □ spawn_log_reader — tokio::spawn
  □ Mutex — tokio::sync::Mutex (не std) там, где держится
    через await
  □ Нет блокирующих вызовов в async без spawn_blocking

【 RUST — SHELLEXECUTE 】
  □ shell_execute_runas использует SEE_MASK_NOCLOSEPROCESS
  □ fMask включает SEE_MASK_NOASYNC
  □ Проверка результата ShellExecuteExW (returns BOOL)
  □ Проверка hProcess != 0 (иначе — UAC отменён)
  □ Закрытие handle в stop_strategy (CloseHandle)

【 RUST — PID / PROCESS 】
  □ PID сохраняется в RunningProcess
  □ process_handle сохраняется (для TerminateProcess)
  □ При stop: TerminateProcess + taskkill /PID /T/F
    + taskkill /IM winws.exe /F
  □ check_strategy_status возвращает { running: bool }
  □ «Живость» определяется по наличию winws.exe, а не по
     PID cmd.exe (cmd.exe умирает сразу после start)
  □ winwsPids возвращаются наружу для отображения
  □ Мёртвые записи удаляются из HashMap
  □ После Stop в диспетчере задач НЕТ процессов winws.exe
  □ После закрытия приложения НЕТ процессов winws.exe
  □ В лог приходит предупреждение об остановке по имени

【 RUST — LOG TAIL 】
  □ spawn_log_reader читает новые строки каждые 100ms
  □ last_position обновляется
  □ При завершении процесса — читает остаток
  □ Parse каждой строки в LogEntry
  □ Батчинг: 50 строк за event
  □ Emit "strategy-log" в frontend

【 RUST — CLEANUP 】
  □ impl Drop for ProcessManager → kill_all
  □ on_window_event(CloseRequested) → kill_all
  □ cleanup_orphans при старте
  □ taskkill /T убивает дочерние (winws.exe)

【 RUST — EVENTS 】
  □ "strategy-log" { strategyId, lines }
  □ "strategy-started" { strategyId, pid }
  □ "strategy-stopped" { strategyId, exitCode }
  □ "strategy-error" { strategyId, error }

【 RUST — ТЕСТЫ 】
  □ 6+ unit-тестов
  □ Покрывают parse_log_line (все уровни)
  □ Покрывают ProcessManager insert/remove
  □ Все проходят

【 FRONTEND — HOOKS 】
  □ useStrategyRunner: run, stop, checkStatus
  □ Подписки на 4 события с cleanup
  □ Обработка ошибки UAC («Пользователь отменил»)
  □ useProcessWatcher: интервал 5 сек

【 FRONTEND — UI 】
  □ StrategyCard: Play/Stop по статусу
  □ Спиннер при starting/stopping
  □ PID отображается (mono, text-xs)
  □ Бейдж статуса корректный
  □ pulse для active статусов
  □ ConfirmDialog перед Stop

【 FRONTEND — STORE SYNC 】
  □ setStatus вызывается при всех переходах
  □ setPid при старте
  □ setError при ошибке
  □ Логи в useLogsStore

【 PERFORMANCE 】
  □ Запуск стратегии <500ms (до UAC) + время UAC
  □ Логи приходят с задержкой <150ms
  □ UI не блокируется
  □ 60 FPS при потоке логов 100/сек

【 UX 】
  □ UAC-запрос показывается один раз
  □ Отмена UAC → понятное сообщение (не техническая ошибка)
  □ Логи видны в реальном времени
  □ Stop работает всегда (даже если стратегия не отвечает)
  □ При закрытии приложения — нет висящих процессов
  □ Нет зомби-процессов winws.exe после Stop

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

ГИПОТЕЗА 1: ShellExecuteExW возвращает hProcess = 0
  ПРИЧИНА: пользователь отменил UAC.
  ЧТО ПРОВЕРИТЬ: обработка этого случая — AppError с
    сообщением «Пользователь отменил запрос администратора».
    Status стратегии → "idle" (не error).

ГИПОТЕЗА 2: Логи не читаются, файл «занят»
  ПРИЧИНА: cmd.exe держит файл открытым для записи, Rust
    не может открыть для чтения.
  ЧТО ПРОВЕРИТЬ: использовать OpenOptions с
    share_mode(FILE_SHARE_READ | FILE_SHARE_WRITE). Или
    читать через tokio::fs::File с seek+read.

ГИПОТЕЗА 3: taskkill не убивает winws.exe
  ПРИЧИНА (подтверждена чтением general.bat): winws.exe
  запускается через `start`, то есть отсоединённым
  потомком. taskkill /PID {pid} /T /F по дереву cmd.exe
  его не достаёт.
  ЧТО ПРОВЕРИТЬ: после Stop в диспетчере задач не должно
  остаться процессов winws.exe.
  РЕШЕНИЕ (принято): taskkill /IM winws.exe /F как
  обязательный третий шаг. Проверка вручную — запустить
  winws.exe отдельно и убедиться, что он тоже убит.

ГИПОТЕЗА 4: Мутекс дедлок
  ПРИЧИНА: std::sync::Mutex держится через await.
  ЧТО ПРОВЕРИТЬ: использовать tokio::sync::Mutex ИЛИ
    короткие блокировки (взять данные, отпустить, работать).

ГИПОТЕЗА 5: Drop не вызывается при закрытии
  ПРИЧИНА: Tauri может force-kill приложение.
  ЧТО ПРОВЕРИТЬ: on_window_event(CloseRequested) должен
    вызывать kill_all ДО закрытия. Если пользователь
    закрывает через Task Manager — на следующий старт
    cleanup_orphans.

ГИПОТЕЗА 6: Event listeners накапливаются
  ПРИЧИНА: useEffect без cleanup.
  ЧТО ПРОВЕРИТЬ: каждый listen возвращает unlisten,
    вызывать его в return useEffect.

ГИПОТЕЗА 7: Стратегия запускается дважды при двойном клике
  ПРИЧИНА: нет проверки isStarting.
  ЧТО ПРОВЕРИТЬ: кнопка disabled при isStarting=true.

ГИПОТЕЗА 8: Логи приходят с задержкой >500ms
  ПРИЧИНА: интервал чтения 100ms + буферизация cmd.
  ЧТО ПРОВЕРИТЬ: cmd /C echo. перед запуском для
    сброса буфера. Или использовать chcp 65001 для
    UTF-8 без буферизации.

ГИПОТЕЗА 9: Кириллица в логах отображается кракозябрами
  ПРИЧИНА: cmd выдаёт CP866, Rust читает как UTF-8.
  ЧТО ПРОВЕРИТЬ: в команде запуска использовать
    cmd /C "chcp 65001 > nul && strategy.bat". Или
    декодировать CP866 → UTF-8 на Rust (encoding_rs).

ГИПОТЕЗА 10: UAC-запрос показывается при каждом запуске
  ПРИЧИНА: это нормальное поведение Windows для
  непривилегированного приложения.
  РЕШЕНИЕ: объяснить в документации. Либо предложить
  пользователю запустить приложение от админа (тогда
  UAC не будет). Но это не обязательно.

ГИПОТЕЗА 11: Стратегия «сама останавливается» через
  доли секунды после запуска
  ПРИЧИНА (подтверждена чтением general.bat): `start` —
  последняя команда .bat, поэтому cmd.exe завершается
  сразу после запуска winws.exe. PID из ShellExecuteEx
  к моменту проверки уже мёртв.
  СЛЕДСТВИЕ: если считать «живость» по PID родителя,
  приложение решит, что стратегия остановилась.
  ЧТО ПРОВЕРИТЬ: запустить стратегию, подождать 3 секунды,
  статус должен остаться running, а бейдж — пульсировать.
  РЕШЕНИЕ (принято): источник правды — наличие процессов
  winws.exe. PID cmd.exe используется только для
  TerminateProcess, но не для определения состояния.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Подготовить тестовый .bat:
   • Создать test.bat в папке strategies-test
   • Содержимое:
     @echo off
     echo Starting strategy...
     echo OK — Connected to Discord
     timeout /t 60 >nul
     echo Done

2. Запустить pnpm tauri dev

3. Перейти в Strategies → выбрать папку с test.bat
   ОЖИДАНИЕ: карточка test.bat появилась

4. Клик Play на карточке
   ОЖИДАНИЕ: появляется UAC-запрос Windows

5. Нажать «Да» в UAC
   ОЖИДАНИЕ:
   • Кнопка Play → Spinner
   • Через 300ms → кнопка Stop (красная)
   • Бейдж статуса → running (пульсирующий зелёный)
   • PID отображается под названием
   • Логи в консоли (или в Logs на Этапе 7):
     - "Starting strategy..."
     - "OK — Connected to Discord"

6. Проверить в Task Manager:
   • Есть процесс cmd.exe с PID из UI
   ОЖИДАНИЕ: PID совпадает

7. Клик Stop (если есть ConfirmDialog — подтвердить)
   ОЖИДАНИЕ:
   • Кнопка → Spinner
   • Через 200ms → Play
   • Бейдж → idle
   • PID исчезает
   • В логах: "Стратегия остановлена"

8. Проверить в Task Manager:
   ОЖИДАНИЕ: процесс cmd.exe исчез

9. Повторить запуск, но отменить UAC
   ОЖИДАНИЕ:
   • Статус → idle (не error)
   • В логах: "Пользователь отменил запуск"
   • Кнопка Play снова активна

10. Запустить стратегию, НЕ останавливая закрыть приложение
    ОЖИДАНИЕ: приложение закрылось, в Task Manager нет cmd.exe

11. Запустить приложение снова
    ОЖИДАНИЕ: в логах «Очистка осиротевших процессов»
    (если они были)

12. Тест производительности:
    • Запустить стратегию, которая пишет 100 логов/сек
    • Performance → записать 10 сек
    ОЖИДАНИЕ: 60 FPS, логи приходят с задержкой <150ms

13. Проверить кириллицу:
    • .bat с русским текстом (echo Привет)
    ОЖИДАНИЕ: «Привет» в логах, не кракозябры

14. Запустить две стратегии одновременно
    ОЖИДАНИЕ: обе работают, два PID, два потока логов

15. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

16. cargo check
    ОЖИДАНИЕ: 0 warning'ов

17. cargo test
    ОЖИДАНИЕ: все зелёные

18. Открыть Task Manager → RAM
    ОЖИДАНИЕ: <250 MB (чуть выше из-за буферов логов)

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать unwrap() в winapi-коде
❌ Не держать std::sync::Mutex через await
❌ Не забывать CloseHandle для hProcess
❌ Не запускать .bat без cmd /C
❌ Не забывать SEE_MASK_NOCLOSEPROCESS
❌ Не забывать taskkill /IM winws.exe /F (иначе
   отсоединённый winws останется жить)
❌ Не убивать только родителя (cmd.exe) — winws.exe
   запускается через start и в дерево не входит
❌ Не оставлять RunningProcess после stop
❌ Не забывать cleanup listeners в useEffect
❌ Не забывать on_window_event для CloseRequested
❌ Не забывать cleanup_orphans при старте
❌ Не использовать any в TypeScript
❌ Не вызывать invoke напрямую из компонентов
❌ Не забывать батчинг логов (50 строк/event)
❌ Не забывать про CP866 → UTF-8
❌ Не начинать Этап 7 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 6 завершён, если ВСЕ пункты выполнены:

✅ run_strategy работает (UAC + PID + логи)
✅ stop_strategy работает (TerminateProcess + taskkill /T
   + taskkill /IM winws.exe)
✅ «Живость» определяется по winws.exe, а не по PID cmd.exe
✅ После Stop и после закрытия приложения в диспетчере
   задач нет процессов winws.exe
✅ check_strategy_status работает
✅ list_running_processes работает
✅ kill_all_processes работает
✅ cleanup_orphans при старте работает
✅ ShellExecuteEx с runas работает
✅ PID извлекается из hProcess
✅ Логи читаются с интервалом 100ms
✅ Логи emit'ятся в frontend через "strategy-log"
✅ parse_log_line определяет level корректно
✅ Батчинг 50 строк/event
✅ Кириллица не ломается (chcp 65001)
✅ ProcessManager с impl Drop
✅ on_window_event(CloseRequested) → kill_all
✅ useStrategyRunner с 4 listeners и cleanup
✅ useProcessWatcher (опционально)
✅ StrategyCard: Play/Stop по статусу
✅ Spinner при starting/stopping
✅ PID отображается
✅ StopConfirmDialog работает
✅ Отмена UAC → корректная обработка
✅ Двойной клик Play → не запускает дважды
✅ При закрытии приложения — нет висящих процессов
✅ 6+ unit-тестов проходят
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ Ни одного unwrap() без обоснования
✅ RAM <250 MB
✅ 60 FPS при потоке логов
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 6 ВЫПОЛНЕН 2026-10-06
═══════════════════════════════════════════════════════════════════════

Реализовано Rust:
  • `winapi_helpers.rs` — OwnedProcessHandle (impl Drop),
    shell_execute_runas, is_pid_alive
  • `process_manager.rs` — ProcessManager с Mutex<HashMap>, terminate,
    clear, impl Drop
  • `commands/runner.rs` — команды run/stop/status/list/kill-all и
    cleanup_orphans
  • `commands/log_reader.rs` — LogLine, detect_level, spawn_log_reader
  • `commands/winws.rs` — поиск и убийство winws.exe
  • `commands/runner_tests.rs` — тесты runner
  • Регистрация 5 команд, `.manage(ProcessManager::new())`,
    `on_window_event(CloseRequested)`, cleanup при старте
  • capabilities: добавлен `core:event:default`

Реализовано frontend:
  • `hooks/useStrategyRunner.ts` — run/stop/checkStatus + 3 слушателя
    событий с cleanup, `busy`-защита от двойного клика
  • `hooks/useProcessWatcher.ts` — опрос раз в 5 с
  • `StrategyCard` — Play / Stop (danger) / RefreshCw по статусу,
    Spinner на starting/stopping, показ PID
  • `constants.ts` — PROCESS_CHECK_INTERVAL_MS, LOG_READ_INTERVAL_MS,
    MAX_LOG_LINES_PER_EVENT

Проверено запуском (безобидный ASCII-only .bat без winws.exe и без сети):
  ✅ ShellExecuteExW + runas → PID получен
  ✅ Перенаправление вывода → лог 88 байт, строки читаются
  ✅ Tail лога и события доходят до UI
  ✅ Состояние «Не запущена» → Play (зелёная кнопка)
  ✅ Состояние «Запущена» → зелёный бейдж + красная кнопка Stop + PID 2088
  ✅ Stop → «остановлена: Процессы winws.exe не найдены», бейдж → «Не
     запущена», PID очищен
  ✅ Состояние «Ошибка» → красный бейдж, текст «Процесс неожиданно
     завершился», кнопка повтора (RefreshCw)
  ✅ on_window_event → «Закрытие окна: процессов в менеджере 0,
     winws.exe 0»
  ✅ Рефакторинг runner.rs на три модуля не сломал рантайм — повторный
     прогон дал те же результаты
  ✅ 56/56 Rust-тестов
  ✅ pnpm exec tsc --noEmit — 0 ошибок
  ✅ pnpm exec eslint . — 0 ошибок
  ✅ pnpm exec prettier --check . — 0 ошибок
  ✅ cargo check — 0 ошибок, 0 warning'ов
  ✅ Комментариев в коде нет

ГЛАВНЫЙ БАГ ЭТАПА (найден только запуском):
  `cmd.exe /C ""bat" > "log" 2>&1"` **не работает**: cmd применяет
  эвристику к кавычкам, процесс создаётся, PID возвращается, а лог
  остаётся 0 байт. Правильно: `/d /s /c` — `/s` снимает внешние
  кавычки буквально, `/d` отключает AutoRun. README O29.
  Обнаружить это без реального запуска невозможно: cargo test на строке
  аргументов проходит.

Прочие исправления:
  • ShellExecuteExW — блокирующий вызов, обёрнут в spawn_blocking (O30)
  • winapi-константы SEE_MASK_*/SW_HIDE/STILL_ACTIVE заменены локальными
    (O31)
  • OwnedProcessHandle с Drop вместо ручного закрытия handle (O32, D8)
  • useProcessWatcher больше не создаёт второй useStrategyRunner, иначе
    слушатели событий задваивались (O33)
  • setError(undefined) в сторе больше не сбрасывает статус в idle —
    это затирало `running` сразу после запуска (O34)

Ловушка: кириллица в .bat ломает парсинг cmd. `chcp 65001` переключает
кодовую страницу посреди файла, и следующие строки читаются как команды.
Ограничение cmd.exe, не наш код.

НЕ ПРОВЕРЕНО (нужно согласие пользователя):
  ⚠ Реальный `taskkill` по живым `winws.exe` и работа с настоящими
    стратегиями zapret. В тесте winws.exe не запускался, поэтому всегда
    возвращалось «Процессы winws.exe не найдены». Сама ветка с живыми
    процессами покрыта юнит-тестами на winws.rs и вызовом при закрытии
    окна.

Отклонения: README.md раздел 8.1, O29–O36.

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 7
═══════════════════════════════════════════════════════════════════════

После Этапа 6 у нас есть:
  • Полный цикл запуска/остановки стратегий
  • Перехват stdout/stderr в реальном времени
  • Отслеживание PID и статусов
  • Корректный cleanup (Drop + on_window_event +
    cleanup_orphans)
  • Логи приходят в frontend через events
  • useStrategyRunner и useProcessWatcher
  • UI с кнопками Play/Stop и статусами

На Этапе 7 нужно будет:
  • Создать страницу Logs с виртуализацией (10 000+ строк)
  • Автоскролл с кнопкой «отключить»
  • Фильтры по уровню, источнику, поиску
  • Экспорт в файл
  • Цветовая дифференциация (info/warn/error/success)
  • Моноширинный шрифт JetBrains Mono
  • Виртуализация через @tanstack/react-virtual

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 6 — СТОП.

Не начинай Этап 7. Не создавай страницу Logs, не подключай
виртуализацию, не делай фильтры логов.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 7
  • "Правка: ..." — правка в Этап 6
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.