═══════════════════════════════════════════════════════════════════════
ЭТАП 8: ВНЕДРЕНИЕ ДОМЕНОВ OUTLAST TRIALS В КОНФИГИ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Научить приложение автоматически добавлять домены, IP-диапазоны
и порты игры Outlast Trials в конфигурационные файлы выбранной
стратегии ПЕРЕД её запуском. Делать бэкап оригинальных конфигов,
восстанавливать их при выключении. Предоставить пользователю UI
для управления списком доменов (добавление, редактирование,
импорт из файла, сброс к дефолтным).

⚠️ ВАЖНО: Outlast Trials — это игра (The Outlast Trials от
Red Barrels), использующая BattlEye античит и серверы GameLift.
Точные домены/IP серверов игры НЕ публичны официально. В промпте
предусмотреть:
  • Базовый список известных доменов (Steam, Epic, BattlEye,
    GameLift) как «стартовый набор»
  • Возможность пользователю добавить свои домены через UI
  • Возможность импорта из текстового файла
  • Автоопределение через мониторинг сетевой активности
    (это будет на Этапе 11 — визуализатор трафика)

После этого этапа пользователь сможет:
  • Включить галку «Поддержка Outlast Trials» в настройках
  • Добавить/удалить домены игры через UI
  • Импортировать список доменов из .txt файла
  • Запустить стратегию → приложение автоматически добавит
    домены в её конфиг → игра будет работать
  • Остановить стратегию → конфиг вернётся к оригиналу
  • Видеть бейдж «+ Outlast» на карточках стратегий, к
    которым применена инъекция

Это критичный этап для игроков Outlast Trials. Если инъекция
сломает конфиг — игра не запустится. Если не восстановит
бэкап — оригинальные настройки потеряются. Поэтому бэкап,
дедупликация и восстановление — обязательны.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Инъекция на уровне файлов конфигов, не .bat 】

ОБОСНУЙ:
  • .bat файлы содержат команду запуска winws.exe с
    аргументами --hostlist=list-*.txt, --ipset=ipset-*.txt
  • Менять .bat — плохо (пользователь может редактировать)
  • Конфиги (list-*.txt, ipset-*.txt) — данные, их безопасно
    дополнять
  • Изменения видны в конфиге → легко проверить
  • Откат = восстановление бэкапа файла

ПОЧЕМУ НЕ МЕНЯТЬ .BAT:
  • Пользователь может вручную редактировать .bat
  • Наши изменения потеряются при обновлении zapret
  • Сложнее откатывать

ПОЧЕМУ НЕ ПЕРЕДАВАТЬ ЧЕРЕЗ АРГУМЕНТЫ КОМАНДНОЙ СТРОКИ:
  • Ограничение длины командной строки Windows (8191 символов)
  • winws.exe ожидает файлы, а не inline-списки
  • Невозможно динамически без перезаписи .bat

【 РЕШЕНИЕ 2: Определение типа стратегии → выбор файла для инъекции 】

ОБОСНУЙ:
  • Разные стратегии используют разные конфиги
  • winws.exe (zapret) → list-general.txt, ipset-all.txt
  • GoodbyeDPI → аргументы в .bat (редко) или
    goodbyedpi.conf
  • Нужно парсить .bat, чтобы понять, какие файлы он использует
  • Из .bat извлекаем пути к list-*.txt и ipset-*.txt через
    regex
  • Если файл не существует — создать

ПОЧЕМУ НЕ ОДИН УНИВЕРСАЛЬНЫЙ ФАЙЛ:
  • Стратегии могут иметь разные наборы конфигов
  • Наша инъекция должна добавлять в СУЩЕСТВУЮЩИЕ списки, не
    создавать новые
  • Иначе winws.exe их не подхватит

АЛГОРИТМ:
  1. Прочитать .bat
  2. Найти все пути list-*.txt через regex:
     --hostlist=([^\s]+)
     --hostlist-domains=([^\s]+)
  3. Найти все пути ipset-*.txt:
     --ipset=([^\s]+)
  4. Для каждого найденного файла — добавить домены/IP
  5. Если ни один не найден — fallback на list-general.txt
     в той же папке, что .bat

【 РЕШЕНИЕ 3: Бэкап перед инъекцией — копия файла с суффиксом .bak.{timestamp} 】

ОБОСНУЙ:
  • Перед изменением list-*.txt — копируем в
    list-general.txt.bak.1730798400
  • Timestamp в имени — можно откатить к любой версии
  • Не перезаписывать старые бэкапы (сохраняем историю)
  • Хранить не более 10 последних бэкапов (ротация)
  • При восстановлении — берём самый свежий .bak

ПОЧЕМУ НЕ ЕДИНЫЙ BACKUP ДИРЕКТОРИЙ:
  • Проще найти бэкап рядом с оригиналом
  • Работает, если пользователь перемещает папку
  • Легко вручную восстановить

ПОЧЕМУ TIMESTAMP В ИМЕНИ:
  • Можно увидеть, когда был сделан бэкап
  • Если что-то сломалось через несколько инъекций — можно
    откатиться к конкретной
  • Ротация по mtime

【 РЕШЕНИЕ 4: Дедупликация — не добавлять то, что уже есть 】

ОБОСНУЙ:
  • Если домен уже в файле — не добавлять повторно
  • Иначе файл распухнет с каждой инъекцией
  • Сравнение — регистронезависимое (домены)
  • Для IP — точное совпадение
  • Использовать HashSet для быстрой проверки

ПОЧЕМУ НЕ ПРОСТО APPEND:
  • При каждом запуске стратегии файл растёт
  • winws.exe может тормозить на большом файле
  • Пользователь увидит дубликаты

【 РЕШЕНИЕ 5: Секция-маркер в файле для отката 】

ОБОСНУЙ:
  • Добавлять домены в специальную секцию:
    # === ZAPRET MANAGER: OUTLAST TRIALS (start) ===
    domain1.com
    domain2.com
    # === ZAPRET MANAGER: OUTLAST TRIALS (end) ===
  • При восстановлении — удалять блок между маркерами
  • Не восстанавливать весь файл из бэкапа (пользователь
    мог сам что-то добавить)
  • Это сохраняет пользовательские правки

ПОЧЕМУ НЕ ПРОСТО ВОССТАНОВИТЬ ИЗ БЭКАПА:
  • Пользователь мог добавить свои домены после инъекции
  • Потеряются его правки
  • Секция-маркер — точечное удаление только нашего блока

ПОЧЕМУ МАРКЕРЫ:
  • Легко найти в файле
  • Легко проверить наличие
  • Не конфликтует с комментариями zapret (там # или ;)

【 РЕШЕНИЕ 6: Дефолтный список доменов Outlast Trials 】

ОБОСНУЙ:
  • Точные домены игры не публичны, но есть известные:
    Steam, Epic, BattlEye, GameLift, Red Barrels
  • Стартовый список — приблизительный, но лучше, чем ничего
  • Пользователь может дополнить

ДЕФОЛТНЫЙ СПИСОК (примерный, для старта):
  Steam-инфраструктура:
    - steampowered.com
    - steamcontent.com
    - steamcommunity.com
    - steamstatic.com
    - steamusercontent.com

  Epic (если игра в Epic):
    - epicgames.com
    - unrealengine.com
    - easyanticheat.net (если используется)

  BattlEye античит:
    - battleye.com
    - battleye.net

  Amazon GameLift (серверы игры):
    - gamelift.amazonaws.com
    - gams-live.com

  Red Barrels (разработчик):
    - redbarrelsgames.com
    - outlasttrials.com

  AWS (серверы игры):
    - amazonaws.com
    - cloudfront.net

ВАЖНО: это НЕ полный список. Точные домены серверов матчей
определяются динамически через GameLift и могут меняться.
Настоящее решение — мониторинг сетевой активности игры (Этап 11)
с автоматическим добавлением найденных доменов.

【 РЕШЕНИЕ 7: Формат файлов конфигов (list-*.txt) 】

ОБОСНУЙ:
  • zapret использует plain text: одна строка = один домен
  • Комментарии начинаются с # или ;
  • Пустые строки игнорируются
  • Регистр не важен (winws.exe приводит к нижнему)

ФОРМАТ ИНЪЕКЦИИ:
существующие домены
discord.com
youtube.com

=== ZAPRET MANAGER: OUTLAST TRIALS (start) ===
Автоматически добавлено 2026-10-05 14:30:22
Источник: Zapret Manager v0.1.0
steampowered.com
steamcontent.com
battleye.com
...

=== ZAPRET MANAGER: OUTLAST TRIALS (end) ===
text

ПОЧЕМУ ВКЛЮЧАЕМ ВРЕМЯ И ВЕРСИЮ:
• Отладка
• Пользователь видит, откуда взялись домены
• Версия помогает при баг-репортах

【 РЕШЕНИЕ 8: UI в настройках — секция «Outlast Trials» 】

ОБОСНУЙ:
• Отдельная секция в Settings (Этап 13 сделает полную
  страницу Settings, здесь — только базовая часть для
  Outlast Trials)
• Или вынести в отдельную подсекцию «Игровые сервисы»

КОМПОНЕНТЫ:
• Toggle «Включить поддержку Outlast Trials»
• Список доменов (редактируемый):
  - Каждый домен — строка с input + кнопка удалить
  - Кнопка «+ Добавить домен»
• Список IP-диапазонов (опционально, аналогично)
• Список портов (опционально)
• Кнопки:
  - «Импорт из файла» (dialog.open → .txt)
  - «Экспорт в файл»
  - «Сбросить к дефолтным»
• Индикатор «Применено к N стратегиям»

ПОЧЕМУ РЕДАКТИРУЕМЫЙ СПИСОК:
• Дефолтный список не полный
• Пользователь может добавить свои домены
• Продвинутые пользователи оценят

【 РЕШЕНИЕ 9: Применение инъекции при запуске стратегии 】

ОБОСНУЙ:
• Не применять инъекцию при каждом сканировании
• Применять ТОЛЬКО перед запуском стратегии
• Так пользователь контролирует, когда его конфиги меняются
• После остановки — восстанавливать (или нет — по настройке)

ЛОГИКА В useStrategyRunner.run():
1. Получить strategy.path
2. Если settings.outlastTrials.enabled:
   a. invoke("inject_outlast", { strategyPath, domains,
      ips, ports, backup: true })
   b. Если успех — продолжить запуск
   c. Если ошибка — прервать, показать ошибку
3. invoke("run_strategy", ...)

ЛОГИКА В useStrategyRunner.stop():
1. invoke("stop_strategy", ...)
2. Если settings.outlastTrials.autoRestore:
   invoke("restore_backup", { strategyPath })

ПОЧЕМУ НЕ АВТООТКАТ:
• Некоторые пользователи хотят оставить конфиги
  модифицированными
• Параметр autoRestore в настройках (по умолчанию true)

【 РЕШЕНИЕ 10: Бейдж «+ Outlast» на карточке стратегии 】

ОБОСНУЙ:
• Визуальная индикация, что к стратегии применена инъекция
• Только если settings.outlastTrials.enabled = true
• Badge variant="accent" с иконкой Gamepad2
• Tooltip: «Домены Outlast Trials будут добавлены при
  запуске»

ПОЧЕМУ ПОЛЕЗНО:
• Пользователь видит, что настройка активна
• Не забывает выключить, если не нужно

【 РЕШЕНИЕ 11: Проверка целостности бэкапа при восстановлении 】

ОБОСНУЙ:
• Бэкап может быть повреждён (диск, вирус, случайное
  удаление)
• При восстановлении — проверить, что файл не пустой
• Если пустой — предупредить пользователя, не восстанавливать

ЛОГИКА:
1. Найти самый свежий .bak
2. Прочитать размер — если 0 байт, отказ
3. Заменить оригинал бэкапом
4. Удалить использованный бэкап (или пометить как
   использованный)

【 РЕШЕНИЕ 12: Логирование всех операций инъекции 】

ОБОСНУЙ:
• Каждая инъекция → запись в useLogsStore:
  - «Outlast Trials: добавлено 15 доменов в list-general.txt»
  - «Бэкап создан: list-general.txt.bak.1730798400»
• Каждое восстановление → запись
• Ошибки → error-логи с деталями

ПОЧЕМУ ВАЖНО:
• Пользователь видит, что происходит
• Легко отладить проблемы
• Можно экспортировать логи для баг-репорта

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/src/commands/injector.rs (создать) 】
Назначение: логика инъекции доменов в конфиги.

Структуры:
• InjectionReport:
  - filesModified: Vec<String> (пути изменённых конфигов)
  - domainsAdded: usize
  - ipsAdded: usize
  - backupsCreated: Vec<String>
  - skipped: usize (дубликаты)
• BackupInfo:
  - originalPath: String
  - backupPath: String
  - createdAt: u64
  - size: u64

Команды:
• inject_outlast(strategy_path: String, domains: Vec<String>,
  ips: Vec<String>, ports: Vec<u16>, create_backup: bool)
  -> Result<InjectionReport, AppError>
  Логика:
  1. Прочитать .bat файл (strategy_path)
  2. Извлечь пути к list-*.txt и ipset-*.txt через regex
  3. Для каждого файла:
     a. Если create_backup — создать .bak.{timestamp}
     b. Прочитать содержимое
     c. Удалить старую секцию маркера (если есть)
     d. Прочитать существующие домены (HashSet)
     e. Отфильтровать новые домены (не в существующих)
     f. Добавить секцию маркера с новыми доменами
     g. Записать файл
  4. Вернуть InjectionReport

• restore_backup(strategy_path: String) -> Result<usize,
  AppError>
  Логика:
  1. Прочитать .bat файл
  2. Извлечь пути к list-*.txt и ipset-*.txt
  3. Для каждого файла:
     a. Прочитать содержимое
     b. Удалить секцию маркера (между start и end)
     c. Записать файл
  4. Вернуть количество изменённых файлов

• restore_from_backup(strategy_path: String, backup_timestamp:
  Option<u64>) -> Result<(), AppError>
  Логика:
  1. Найти .bak файлы
  2. Выбрать нужный (по timestamp или самый свежий)
  3. Заменить оригинал бэкапом
  4. Удалить использованный .bak (опционально — оставить
     для истории)

• list_backups(strategy_path: String) -> Result<Vec<BackupInfo>,
  AppError>
  Для UI: показать список бэкапов с датами.

• extract_config_paths(bat_path: String) -> Result<Vec<String>,
  AppError>
  Отдельная команда для отладки — какие конфиги использует
  стратегия.

Вспомогательные функции (private):
• parse_config_paths(bat_content: &str, bat_dir: &Path)
  -> Vec<PathBuf>
  - regex для --hostlist=, --ipset=, --hostlist-domains=
  - Разрешение относительных путей относительно папки .bat
  - Дедупликация
• create_backup(path: &Path) -> Result<PathBuf, AppError>
  - Копировать файл в path.bak.{unix_timestamp}
  - Ротация: удалить старые, если >10
• remove_marker_section(content: &str) -> String
  - Удалить блок между START и END маркерами
• append_marker_section(content: &str, domains: &[String])
  -> String
  - Добавить новую секцию с маркерами
• read_existing_entries(content: &str) -> HashSet<String>
  - Собрать все домены из файла (кроме комментариев)
• normalize_domain(domain: &str) -> String
  - Trim, lowercase, убрать trailing dot
• is_valid_domain(domain: &str) -> bool
  - Базовая валидация (длина, допустимые символы)
• rotate_backups(dir: &Path, base_name: &str, max: usize)
  - Оставить только N свежих бэкапов

Требования:
• Все команды — async
• Ошибки через AppError
• Логирование через tracing
• Никаких unwrap() без обоснования
• Работа с кириллическими путями

【 2. src-tauri/src/constants.rs (обновить) 】
Добавить:
• MARKER_START: &str = "# === ZAPRET MANAGER: OUTLAST TRIALS (start) ==="
• MARKER_END: &str = "# === ZAPRET MANAGER: OUTLAST TRIALS (end) ==="
• DEFAULT_OUTLAST_DOMAINS: Vec<&str> — стартовый список
  (steampowered.com, battleye.com, gamelift.amazonaws.com,
  redbarrelsgames.com, outlasttrials.com, cloudfront.net,
  steamcontent.com, steamcommunity.com, steamstatic.com,
  steamusercontent.com, epicgames.com)
• DEFAULT_OUTLAST_IPS: Vec<&str> — пустой (пользователь
  добавит сам)
• DEFAULT_OUTLAST_PORTS: Vec<u16> — [27015, 27016, 27017,
  27018, 27019, 27020, 27031, 27036, 3478, 4379, 4380]
  (Steam + GameLift)
• MAX_BACKUPS_PER_FILE: usize = 10
• HOSTLIST_REGEX: &str = r"--hostlist(?:-domains)?=([^\s]+)"
• IPSET_REGEX: &str = r"--ipset=([^\s]+)"

【 3. src-tauri/src/commands/mod.rs (обновить) 】
Добавить:
• pub mod injector;
• pub use injector::{inject_outlast, restore_backup,
  restore_from_backup, list_backups, extract_config_paths};

【 4. src-tauri/src/lib.rs (обновить) 】
Зарегистрировать команды:
• commands::inject_outlast
• commands::restore_backup
• commands::restore_from_backup
• commands::list_backups
• commands::extract_config_paths

【 5. src/types/settings.ts (обновить) 】
Дополнить OutlastTrialsSettings:
• enabled: boolean
• domains: string[]
• ipRanges: string[]
• ports: number[]
• autoRestore: boolean (восстанавливать после остановки)
• createBackup: boolean (создавать бэкап перед инъекцией)

Добавить тип:
• InjectionReport — с полями из Rust-структуры

【 6. src/types/index.ts (обновить) 】
Экспортировать InjectionReport, BackupInfo.

【 7. src/lib/defaults.ts (обновить) 】
Обновить DEFAULT_OUTLAST_TRIALS:
• enabled: false (по умолчанию выключено)
• domains: DEFAULT_OUTLAST_DOMAINS (из constants)
• ipRanges: []
• ports: DEFAULT_OUTLAST_PORTS
• autoRestore: true
• createBackup: true

【 8. src/hooks/useOutlastInjector.ts (создать) 】
Назначение: React-хук для работы с инъекцией.

Методы:
• inject(strategyPath: string): Promise<InjectionReport | null>
  - Проверить settings.outlastTrials.enabled
  - invoke("inject_outlast", {
      strategyPath,
      domains: settings.outlastTrials.domains,
      ips: settings.outlastTrials.ipRanges,
      ports: settings.outlastTrials.ports,
      createBackup: settings.outlastTrials.createBackup
    })
  - Обработка результата:
    - Успех → лог info «Добавлено N доменов в M файлов»
    - Ошибка → лог error + возврат null
  - Вернуть report

• restore(strategyPath: string): Promise<number>
  - invoke("restore_backup", { strategyPath })
  - Лог info

• listBackups(strategyPath: string): Promise<BackupInfo[]>
• restoreFromBackup(strategyPath, timestamp?)

Возвращает:
• { inject, restore, listBackups, restoreFromBackup,
  isInjecting }

Требования:
• Использовать useLogsStore для логирования
• Обработка ошибок
• Не блокировать UI

【 9. src/hooks/useStrategyRunner.ts (обновить) 】
Интегрировать useOutlastInjector:

В run(strategyId):
• Перед invoke("run_strategy"):
  - if settings.outlastTrials.enabled → await inject(strategy.path)
  - Если inject вернул null → прервать запуск

В stop(strategyId):
• После invoke("stop_strategy"):
  - if settings.outlastTrials.autoRestore → await restore(strategy.path)

【 10. src/pages/Settings.tsx (создать базовую версию) 】
Назначение: страница настроек (полная версия на Этапе 13).

Для Этапа 8 — только секция «Outlast Trials»:
• Заголовок H1: «Настройки»
• Секция «Outlast Trials»:
  - Card с заголовком «Поддержка игры Outlast Trials»
  - Toggle «Включить поддержку»
  - Toggle «Восстанавливать конфиги после остановки»
  - Toggle «Создавать бэкап перед изменением»
  - Список доменов (editable):
    - Каждый домен — строка Input + кнопка удалить
    - Кнопка «+ Добавить домен»
  - Список IP-диапазонов (аналогично)
  - Список портов (Input number)
  - Кнопки:
    - «Импорт из файла» (dialog.open → .txt)
    - «Экспорт в файл»
    - «Сбросить к дефолтным»

ПРИМЕЧАНИЕ: Остальные секции Settings добавятся на Этапе 13.

Требования:
• Сохранение в settings.outlastTrials через
  useSettingsStore
• Debounce сохранения 500ms (через useSettingsSync из
  Этапа 4)
• Валидация доменов (regex)
• Валидация портов (1–65535)

【 11. src/components/settings/OutlastTrialsSection.tsx (создать) 】
Назначение: переиспользуемая секция настроек Outlast Trials.

Props: отсутствуют (работает со стором напрямую).

Компоненты:
• Card с заголовком
• 3 Toggle (enabled, autoRestore, createBackup)
• EditableList для доменов
• EditableList для IP
• EditableList для портов
• Ряд кнопок (Импорт / Экспорт / Сброс)

【 12. src/components/settings/EditableList.tsx (создать) 】
Назначение: переиспользуемый компонент редактируемого списка.

Props:
• items: string[]
• onChange: (items: string[]) => void
• placeholder: string
• validate?: (value: string) => string | null (возвращает
  ошибку или null)
• addLabel: string (текст кнопки добавления)
• emptyMessage: string

Рендер:
• Список строк с Input + кнопка удалить (X)
• Кнопка «+ AddLabel» внизу
• Валидация при вводе
• Пустое состояние

【 13. src/components/strategies/StrategyCard.tsx (обновить) 】
Добавить:
• Если settings.outlastTrials.enabled → Badge «+ Outlast»
  (variant="accent", icon Gamepad2)
• Tooltip: «Домены Outlast Trials будут добавлены при
  запуске»

【 14. src/lib/validators.ts (создать или дополнить) 】
Функции:
• isValidDomain(domain: string): boolean
  - Проверка: длина ≤253, есть хотя бы одна точка,
    только [a-z0-9.-], не начинается/заканчивается на
    дефис или точку
• isValidIpRange(ip: string): boolean
  - Проверка CIDR (IPv4 + IPv6)
  - Использовать простой regex
• isValidPort(port: number): boolean
  - 1 ≤ port ≤ 65535

【 15. src/lib/parseImport.ts (создать) 】
Назначение: парсинг импортируемого .txt файла.

Функции:
• parseDomainsFromText(text: string): string[]
  - Каждая строка = домен
  - Пропускать комментарии (# / ;)
  - Пропускать пустые
  - Валидация через isValidDomain
  - Дедупликация
• parseIpsFromText(text: string): string[]
• parsePortsFromText(text: string): number[]

【 16. src-tauri/capabilities/default.json (обновить) 】
Убедиться, что есть:
• fs:allow-read-text-file
• fs:allow-write-text-file
• dialog:allow-open
• dialog:allow-save

【 17. src-tauri/src/commands/injector_tests.rs (опционально) 】
Тесты:
• test_parse_config_paths — из .bat с --hostlist=...
• test_normalize_domain — «Discord.COM » → «discord.com»
• test_is_valid_domain — валидные / невалидные
• test_remove_marker_section — удаление блока
• test_append_marker_section — добавление блока
• test_read_existing_entries — парсинг существующих доменов
• test_inject_skip_duplicates — не добавлять дубликаты

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Обновить constants.rs
• Добавить MARKER_START/END, DEFAULT_OUTLAST_*, regex-ы,
  MAX_BACKUPS_PER_FILE

ШАГ 2: Создать injector.rs
• Структуры InjectionReport, BackupInfo
• Команды inject_outlast, restore_backup,
  restore_from_backup, list_backups, extract_config_paths
• Вспомогательные функции
• Все async, ошибки через AppError

ШАГ 3: Обновить commands/mod.rs и lib.rs
• Зарегистрировать команды

ШАГ 4: Написать unit-тесты (Rust)
• injector_tests.rs
• cargo test — зелёные

ШАГ 5: Обновить типы
• src/types/settings.ts — OutlastTrialsSettings расширен
• src/types/index.ts — экспорт InjectionReport, BackupInfo
• src/lib/defaults.ts — DEFAULT_OUTLAST_TRIALS

ШАГ 6: Создать useOutlastInjector
• src/hooks/useOutlastInjector.ts
• inject, restore, listBackups, restoreFromBackup

ШАГ 7: Обновить useStrategyRunner
• Интегрировать inject/restore в run/stop

ШАГ 8: Создать валидаторы
• src/lib/validators.ts
• src/lib/parseImport.ts

ШАГ 9: Создать EditableList
• src/components/settings/EditableList.tsx

ШАГ 10: Создать OutlastTrialsSection
• src/components/settings/OutlastTrialsSection.tsx
• Использует EditableList для 3 списков

ШАГ 11: Создать базовую Settings.tsx
• src/pages/Settings.tsx
• Пока только секция OutlastTrialsSection

ШАГ 12: Обновить StrategyCard
• Бейдж «+ Outlast» при включённой настройке

ШАГ 13: Обновить App.tsx
• Заменить заглушку Settings.tsx на реализацию

ШАГ 14: Обновить capabilities/default.json
• Убедиться, что все разрешения есть

ШАГ 15: Финальная проверка
• pnpm tauri dev — запускается
• Включить Outlast Trials → добавить домены → запустить
  стратегию → проверить конфиг
• Остановить → проверить восстановление
• pnpm tsc --noEmit — 0 ошибок
• cargo check — 0 warning'ов
• cargo test — зелёные
• Пройти чек-лист Части 4

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 RUST — TYPE SAFETY 】
□ InjectionReport, BackupInfo сериализуются
□ Все ошибки через AppError
□ Никаких unwrap() без обоснования
□ Regex компилируется один раз (lazy static)

【 RUST — ЛОГИКА 】
□ parse_config_paths находит list-*.txt и ipset-*.txt
□ Относительные пути разрешаются от папки .bat
□ Бэкап создаётся перед изменением
□ Ротация бэкапов работает (max 10)
□ Дедупликация работает (нет дубликатов)
□ Секция-маркер удаляется при восстановлении
□ Пользовательские правки сохраняются
□ Невалидные домены отбрасываются
□ Кириллические пути работают

【 RUST — ТЕСТЫ 】
□ 7+ тестов
□ Все зелёные
□ Покрывают edge cases (пустой файл, дубликаты,
  невалидные домены)

【 FRONTEND — HOOKS 】
□ useOutlastInjector: inject, restore, listBackups
□ Интеграция в useStrategyRunner
□ Логи в useLogsStore при инъекции и восстановлении

【 FRONTEND — SETTINGS 】
□ Settings.tsx: секция Outlast Trials
□ 3 Toggle (enabled, autoRestore, createBackup)
□ EditableList для доменов, IP, портов
□ Валидация при вводе
□ Импорт из файла
□ Экспорт в файл
□ Сброс к дефолтным
□ Сохранение в settings (через useSettingsStore)
□ Debounce 500ms

【 FRONTEND — UI 】
□ StrategyCard: бейдж «+ Outlast» при enabled
□ Tooltip на бейдже

【 UX 】
□ Пользователь понимает, что произошло (логи)
□ Бэкап создаётся автоматически (если настроено)
□ Восстановление после остановки (если настроено)
□ Ошибки инъекции прерывают запуск с понятным
  сообщением
□ Нет сценария, где конфиг сломан и не восстановлен

【 PERFORMANCE 】
□ Инъекция <50ms для 15 доменов
□ Не блокирует запуск стратегии (async)

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

ГИПОТЕЗА 1: Regex не находит пути к конфигам
ПРИЧИНА: в .bat пути в кавычках, разные форматы.
ЧТО ПРОВЕРИТЬ: regex должен поддерживать кавычки:
  --hostlist="([^"]+)" ИЛИ --hostlist=([^\s"]+)

ГИПОТЕЗА 2: Относительные пути не разрешаются
ПРИЧИНА: .bat может использовать переменную %~dp0.
ЧТО ПРОВЕРИТЬ: если путь начинается с %~dp0 —
  заменить на папку .bat. Или использовать текущую
  папку процесса.

ГИПОТЕЗА 3: Бэкап не создаётся
ПРИЧИНА: нет прав на запись в папку.
ЧТО ПРОВЕРИТЬ: логировать ошибку создания бэкапа,
  прерывать инъекцию (не менять файл без бэкапа).

ГИПОТЕЗА 4: Маркер не удаляется при восстановлении
ПРИЧИНА: разные концы строк (CRLF vs LF).
ЧТО ПРОВЕРИТЬ: нормализовать концы строк при чтении,
  писать с CRLF (Windows).

ГИПОТЕЗА 5: Дубликаты появляются
ПРИЧИНА: normalize_domain не приводит к нижнему регистру.
ЧТО ПРОВЕРИТЬ: все домены в нижнем регистре при
  сравнении.

ГИПОТЕЗА 6: Инъекция ломает winws.exe
ПРИЧИНА: спецсимволы в доменах (например, юникод).
ЧТО ПРОВЕРИТЬ: валидация доменов через regex
  [a-z0-9.-]+ перед добавлением.

ГИПОТЕЗА 7: Пользователь случайно удалил бэкап
ПРИЧИНА: вручную.
ЧТО ПРОВЕРИТЬ: при восстановлении — если бэкапа нет,
  только удалять маркер (не восстанавливать весь файл).

ГИПОТЕЗА 8: settings.outlastTrials.domains пустой
ПРИЧИНА: пользователь очистил список.
ЧТО ПРОВЕРИТЬ: если пусто — использовать
  DEFAULT_OUTLAST_DOMAINS ИЛИ пропустить инъекцию
  с предупреждением.

ГИПОТЕЗА 9: Конфиг winws.exe требует lowercase
ПРИЧИНА: разные версии.
ЧТО ПРОВЕРИТЬ: всегда писать lowercase для доменов.

ГИПОТЕЗА 10: Восстановление удаляет пользовательские домены
ПРИЧИНА: если пользователь добавил свои домены ПОСЛЕ
  инъекции, но ДО восстановления.
ЧТО ПРОВЕРИТЬ: маркер должен точно ограничивать наш
  блок. Всё, что вне маркера — не трогать.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Подготовить тестовую папку со стратегиями:
 • Скопировать стратегии zapret-discord-youtube
 • Один .bat должен использовать --hostlist=list-general.txt
   и --ipset=ipset-all.txt
 • Создать list-general.txt с 2–3 доменами
 • Создать ipset-all.txt с 1–2 IP

2. Запустить pnpm tauri dev

3. Перейти в Settings → секция «Outlast Trials»
 ОЖИДАНИЕ: toggle выключен, список доменов показывает
 дефолтные (steampowered.com, battleye.com, и т.д.)

4. Включить toggle «Включить поддержку»
 ОЖИДАНИЕ: список становится редактируемым

5. Клик «+ Добавить домен», ввести «custom-test.com»
 ОЖИДАНИЕ: добавлен в список

6. Ввести невалидный домен «not_a_domain!»
 ОЖИДАНИЕ: ошибка валидации (красный бордер + текст)

7. Проверить, что Settings сохраняются:
 • Закрыть приложение
 • Открыть — настройки на месте
 ОЖИДАНИЕ: сохранено

8. Перейти в Strategies
 ОЖИДАНИЕ: на карточках бейдж «+ Outlast» (accent цвет)

9. Запустить стратегию
 ОЖИДАНИЕ: в логах:
 • «Outlast Trials: добавлено N доменов в list-general.txt»
 • «Бэкап создан: list-general.txt.bak.{timestamp}»

10. Проверить файл list-general.txt вручную:
  ОЖИДАНИЕ: в конце файла секция:
=== ZAPRET MANAGER: OUTLAST TRIALS (start) ===
Автоматически добавлено ...
steampowered.com
battleye.com
custom-test.com
...

=== ZAPRET MANAGER: OUTLAST TRIALS (end) ===
text

11. Проверить наличие бэкапа:
ОЖИДАНИЕ: файл list-general.txt.bak.{timestamp} существует

12. Остановить стратегию
ОЖИДАНИЕ:
• В логах «Outlast Trials: конфиги восстановлены»
• Секция-маркер удалена из list-general.txt
• Бэкап остался

13. Запустить стратегию ещё раз
ОЖИДАНИЕ: не появляются дубликаты (дедупликация)

14. Импорт из файла:
• Создать test-domains.txt с 10 доменами
• Клик «Импорт из файла» → выбрать файл
ОЖИДАНИЕ: домены добавились в список

15. Экспорт:
• Клик «Экспорт» → сохранить в файл
ОЖИДАНИЕ: файл содержит все текущие домены

16. Сброс к дефолтным:
• Клик «Сбросить» → подтвердить
ОЖИДАНИЕ: список = DEFAULT_OUTLAST_DOMAINS

17. Выключить toggle «Включить поддержку»
ОЖИДАНИЕ: бейдж «+ Outlast» исчезает с карточек

18. Запустить стратегию с выключенным Outlast
ОЖИДАНИЕ: инъекция не выполняется

19. Запустить стратегию с невалидным путём к .bat
ОЖИДАНИЕ: ошибка в логах, но приложение не падает

20. cargo test
ОЖИДАНИЕ: 7+ тестов, зелёные

21. pnpm tsc --noEmit
ОЖИДАНИЕ: 0 ошибок

22. cargo check
ОЖИДАНИЕ: 0 warning'ов

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не менять .bat файлы (только конфиги)
❌ Не менять конфиг без бэкапа (если createBackup=true)
❌ Не добавлять дубликаты
❌ Не добавлять невалидные домены
❌ Не трогать пользовательские правки вне маркера
❌ Не удалять бэкапы при восстановлении (только
опционально)
❌ Не паниковать на отсутствующем конфиге
❌ Не использовать unwrap() в Rust
❌ Не использовать any в TypeScript
❌ Не хардкодить пути
❌ Не забывать lowercase для доменов
❌ Не забывать про кириллические пути
❌ Не забывать cleanup в useEffect
❌ Не забывать валидацию в UI
❌ Не начинать Этап 9 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 8 завершён, если ВСЕ пункты выполнены:

✅ injector.rs реализован (5 команд)
✅ Парсинг .bat для извлечения путей к конфигам
✅ Бэкап создаётся (.bak.{timestamp})
✅ Ротация бэкапов (max 10)
✅ Дедупликация работает
✅ Секция-маркер добавляется и удаляется
✅ Пользовательские правки сохраняются
✅ 7+ unit-тестов проходят
✅ useOutlastInjector реализован
✅ Интеграция в useStrategyRunner
✅ Settings.tsx с секцией Outlast Trials
✅ OutlastTrialsSection + EditableList
✅ 3 Toggle + 3 списка
✅ Импорт/Экспорт/Сброс работают
✅ Валидация доменов/IP/портов
✅ Бейдж «+ Outlast» на StrategyCard
✅ Дефолтный список доменов (Steam, BattlEye, GameLift,
Red Barrels)
✅ Логи инъекции/восстановления в useLogsStore
✅ Ошибки инъекции прерывают запуск
✅ settings.outlastTrials сохраняются (persist)
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ cargo test — зелёные
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 8 ВЫПОЛНЕН 2026-10-06
═══════════════════════════════════════════════════════════════════════

Реализовано Rust:
  • commands/injector.rs          — 5 команд, отчёт инъекции
  • commands/injector_core.rs     — валидация доменов/IP, разбор .bat
  • commands/injector_text.rs     — маркеры, дедупликация, метка времени
  • commands/injector_backup.rs   — бэкапы, ротация, восстановление
  • commands/injector_tests.rs    — 19 тестов
  • constants.rs                  — MARKER_START/END, BACKUP_SUFFIX,
                                    HOSTLIST_REGEX, IPSET_REGEX, MAX_PORT

Команды: inject_outlast, restore_backup, restore_from_backup,
list_backups, extract_config_paths

Реализовано frontend:
  • hooks/useOutlastInjector.ts    — inject, restore, listBackups,
                                    restoreFromBackup, логирование
  • components/settings/EditableList.tsx
  • components/settings/OutlastTrialsSection.tsx
  • pages/Settings.tsx
  • lib/validators.ts, lib/parseImport.ts
  • StrategyCard — бейдж «+ Outlast» с Tooltip
  • useStrategyRunner — inject перед run, restore после stop

Изменено по сравнению со спецификацией:
  • useSettingsStore + storage.ts — глубокое слияние секций с дефолтами.
    Старый config.json без новых полей (autoRestore, createBackup)
    ломал UI: undefined превращался в неконтролируемый input

Проверено запуском (временная тестовая папка с .bat):
  ✅ Клик Play при enabled → 13 доменов в list-general.txt
  ✅ Секция между маркерами с меткой времени
  ✅ Бэкапы созданы: list-general.txt.bak.1791242527116 = 45 Б
  ✅ Инъекция в ipset-all.txt (8.8.8.0/24)
  ✅ ipset-exclude.txt НЕ тронут
  ✅ --hostlist-domains=discord.media НЕ тронут
  ✅ list-general-user.txt НЕ тронут
  ✅ Restore: маркер удалён, ^dns.google и cloudflare-ech.com целы,
     файл совпал с исходным
  ✅ Повторная инъекция: дубликаты пропущены, второй маркер не создан
  ✅ Ротация: 14 бэкапов → 10 самых свежих
  ✅ Пустой бэкап → восстановление отклонено
  ✅ Невалидный домен отклонён, регистр и пробелы нормализованы
  ✅ UI: 3 Toggle, 3 EditableList, импорт/экспорт/сброс
  ✅ Бейдж «+ Outlast» на карточке
  ✅ 80/80 Rust-тестов
  ✅ tsc 0, eslint 0, prettier 0, build 0
  ✅ cargo check — 0 ошибок, 0 warning'ов
  ✅ Нет any, TODO/FIXME, комментариев
  ✅ Файлы < 300 строк

ГЛАВНОЕ ОТКЛОНЕНИЕ ОТ СПЕЦИФИКАЦИИ:
  Регулярка `--hostlist(?:-domains)?=` из спецификации опасна. В реальных
  .bat есть `--hostlist-domains=discord.media` — это inline-домен, а не
  путь к файлу. Такая регулярка создала бы файл `discord.media` рядом с
  .bat. Реализовано только `--hostlist=` и `--ipset=`, что автоматически
  исключает -exclude и -domains варианты. README O41.

Также исключены `*-user.txt`: их перезаписывает service.bat
load_user_lists при каждом запуске, инъекция была бы стёрта. README O42.

Порты не пишутся в конфиги: winws берёт их из аргументов .bat, который
менять запрещено. Валидируются и логируются как неприменённые. README O43.

Пути разрешаются через bat_env::resolve_path — в .bat пути идут через
`%LISTS%`-переменные с `%~dp0`, свой резолвер их бы не понял. README O44.

ПРЕФИКС ^ В СПИСКАХ:
  В list-general.txt реальные строки вида `^dns.google`. Это синтаксис
  zapret для «обязательный хост», а не часть домена. normalize_domain
  срезает его перед сравнением, иначе ^dns.google и dns.google считались
  бы разными и файл разрастался бы.

НЕ ПРОВЕРЕНО:
  ⚠ Реальная игра Outlast Trials: работают ли эти домены на практике.
    Списки серверов матчей динамические (GameLift) и официально не
    опубликованы. Точный набор появится после Этапа 11 (мониторинг
    трафика).
  ⚠ Авто-восстановление после kill_all_processes при завершении
    приложения: on_window_event не вызывает restore_backup. Конфиги
    останутся с секцией, но бэкапы позволят вернуть вручную.

Отклонения: README.md раздел «Отклонения этапа 8», O41–O45.

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 9
═══════════════════════════════════════════════════════════════════════

После Этапа 8 у нас есть:
• Механизм инъекции доменов в конфиги стратегий
• Бэкап + восстановление + ротация
• Дедупликация и валидация
• Секция настроек Outlast Trials (UI)
• Импорт/Экспорт/Сброс
• Интеграция в запуск/остановку стратегий
• Бейдж «+ Outlast» на карточках

На Этапе 9 нужно будет:
• Создать Dashboard — главный экран приложения
• Hero-панель со статусом подключения (большой
пульсирующий индикатор)
• IP-адрес и страна (через ipapi.co)
• Кнопка быстрого запуска последней стратегии
• Сетка карточек: последние логи, активная стратегия,
быстрые действия
• Красивое оформление, соответствие Awwwards-уровню

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 8 — СТОП.

Не начинай Этап 9. Не создавай Dashboard, не делай Hero-панель
со статусом, не добавляй карточки быстрых действий.

Жди одну из команд:
• "ОК, дальше" — переход к Этапу 9
• "Правка: ..." — правка в Этап 8
• "Покажи Этап N" — возврат
• "Проверка" — повторная самопроверка
• "Объясни" — раскрыть решение подробнее

Если развилка (например, точные домены Outlast Trials) —
ЗАДАЙ ВОПРОС, не додумывай.