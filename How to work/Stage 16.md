# ЭТАП 16: БАНДЛИНГ РЕСУРСОВ

═══════════════════════════════════════════════════════════════════════
ЭТАП 16: БАНДЛИНГ РЕСУРСОВ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Упаковать все внешние ресурсы (бинарники zapret, winws.exe, .bat
стратегии, конфигурационные файлы list-*.txt и ipset-*.txt) внутрь
установщика Tauri. Обеспечить автоматическую распаковку этих
ресурсов в папку пользователя при первом запуске приложения,
механизм проверки целостности, обновления ресурсов при выходе
новых версий и защиту пользовательских правок от перезаписи.

После этого этапа пользователь сможет:
  • Установить приложение одним .exe-файлом — все стратегии
    и бинарники zapret будут внутри установщика
  • Запустить приложение — при первом старте ресурсы
    автоматически распакуются в %APPDATA%/ZapretManager/
  • Видеть все встроенные стратегии сразу в Strategies
  • Не искать вручную папку с zapret и .bat-файлами
  • Обновлять приложение — при этом пользовательские правки
    в конфигах сохраняются, а новые ресурсы добавляются
  • Восстанавливать повреждённые ресурсы через кнопку
    «Восстановить встроенные стратегии» в Settings

Это критичный этап для «коробочного» распространения приложения.
Без него пользователь вынужден вручную скачивать zapret, искать
совместимые версии, копировать .bat-файлы. С ним — установил,
запустил, работает.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Tauri bundle.resources вместо хардкода в Rust 】

ОБОСНУЙ:
  • Tauri 2 поддерживает `bundle.resources` в tauri.conf.json —
    список файлов/папок, которые упаковываются в установщик
  • В runtime ресурсы доступны через `app.path().resource_dir()`
  • Работает на всех платформах (Windows, macOS, Linux)
  • В dev-режиме ресурсы читаются из исходной папки
    (src-tauri/resources/)
  • В production — из папки рядом с .exe

ПОЧЕМУ НЕ ХАРДКОД В RUST (include_bytes!):
  • Бинарники zapret весят 5–15 MB
  • Вкомпилировать их в .exe → раздутый бинарник, долгая сборка
  • Обновление ресурсов требовало бы пересборки .exe
  • bundle.resources позволяет обновлять ресурсы отдельно

ПОЧЕМУ НЕ СКАЧИВАНИЕ ПРИ ПЕРВОМ ЗАПУСКЕ:
  • Зависимость от интернета при первом старте
  • Не работает офлайн
  • Медленнее (пользователь ждёт загрузку)
  • Риск подмены (без проверки подписи)

【 РЕШЕНИЕ 2: Плоская структура resources — как в оригинале zapret 】

ОБОСНУЙ:
  Каждая стратегия самостоятельно определяет свои пути
  относительно СВОЕЙ папки:
    cd /d "%~dp0"
    call service.bat status_zapret
    set "BIN=%~dp0bin\"
    set "LISTS=%~dp0lists\"

  Из этого следует жёсткое требование: service.bat,
  bin/ и lists/ обязаны лежать В ТОЙ ЖЕ папке, что и
  стратегии. Если вынести их на уровень выше, `call
  service.bat` не найдёт диспетчер и стратегия не
  запустится вообще.

  Значит повторяем исходную раскладку zapret один в
  один, а не изобретаем новую.

СТРУКТУРА:
```
src-tauri/resources/
└── zapret/
    ├── bin/                        ← из bin/ архива zapret
    │   ├── winws.exe
    │   ├── WinDivert.dll
    │   ├── WinDivert64.sys
    │   ├── cygwin1.dll
    │   ├── stun.bin
    │   ├── stun2.bin
    │   ├── ACTIVE_DISCORD_UDP.bin
    │   ├── ACTIVE_GAME_UDP.bin
    │   ├── quic_initial_*.bin      (7 файлов)
    │   └── tls_clienthello_*.bin   (7 файлов)
    │
    ├── lists/                      ← из lists/ архива zapret
    │   ├── list-general.txt
    │   ├── list-google.txt
    │   ├── list-exclude.txt
    │   ├── ipset-exclude.txt
    │   └── ipset-all.txt           ← ВОССТАНОВИТЬ из
    │                                  ipset-all.txt.backup
    │
    ├── utils/
    │   └── targets.txt
    │
    ├── service.bat                 ← СЛУЖЕБНЫЙ, НЕ переименовывать,
    │                                  вызывается каждым .bat
    │
    ├── general-00-baseline.bat
    ├── general-01-alt.bat
    ├── general-02-alt.bat
    ├── general-03-alt.bat
    ├── general-04-alt.bat
    ├── general-05-alt.bat
    ├── general-06-alt.bat
    ├── general-07-alt.bat
    ├── general-08-alt.bat
    ├── general-09-alt.bat
    ├── general-10-alt.bat
    ├── general-11-alt.bat
    ├── general-12-alt.bat
    ├── general-13-alt.bat
    ├── general-14-experimental.bat
    ├── general-15-simple-fake.bat
    ├── general-16-simple-fake-alt.bat
    ├── general-17-simple-fake-alt2.bat
    ├── general-18-faketls-auto.bat
    ├── general-19-faketls-auto-alt.bat
    ├── general-20-faketls-auto-alt2.bat
    ├── general-21-faketls-auto-alt3.bat
    │
    ├── outlast/
    │   └── default-domains.txt
    │
    ├── LICENSE-zapret.txt          ← ДОБАВИТЬ, в архиве НЕТ
    ├── README-zapret.md            ← ДОБАВИТЬ, в архиве НЕТ
    └── manifest.json
```

ТАБЛИЦА ПЕРЕИМЕНОВАНИЯ (полная, 22 файла):

| Исходное имя | Имя в бандле |
|---|---|
| `general.bat` | `general-00-baseline.bat` |
| `general (ALT).bat` | `general-01-alt.bat` |
| `general (ALT2).bat` | `general-02-alt.bat` |
| `general (ALT3).bat` | `general-03-alt.bat` |
| `general (ALT4).bat` | `general-04-alt.bat` |
| `general (ALT5).bat` | `general-05-alt.bat` |
| `general (ALT6).bat` | `general-06-alt.bat` |
| `general (ALT7).bat` | `general-07-alt.bat` |
| `general (ALT8).bat` | `general-08-alt.bat` |
| `general (ALT9).bat` | `general-09-alt.bat` |
| `general (ALT10).bat` | `general-10-alt.bat` |
| `general (ALT11).bat` | `general-11-alt.bat` |
| `general (ALT12).bat` | `general-12-alt.bat` |
| `general (ALT13).bat` | `general-13-alt.bat` |
| `general (EXP).bat` | `general-14-experimental.bat` |
| `general (SIMPLE FAKE).bat` | `general-15-simple-fake.bat` |
| `general (SIMPLE FAKE ALT).bat` | `general-16-simple-fake-alt.bat` |
| `general (SIMPLE FAKE ALT2).bat` | `general-17-simple-fake-alt2.bat` |
| `general (FAKE TLS AUTO).bat` | `general-18-faketls-auto.bat` |
| `general (FAKE TLS AUTO ALT).bat` | `general-19-faketls-auto-alt.bat` |
| `general (FAKE TLS AUTO ALT2).bat` | `general-20-faketls-auto-alt2.bat` |
| `general (FAKE TLS AUTO ALT3).bat` | `general-21-faketls-auto-alt3.bat` |
| `service.bat` | `service.bat` — БЕЗ ИЗМЕНЕНИЙ |

ПОЧЕМУ ПЕРЕИМЕНОВЫВАТЬ:
  • Пробелы и скобки в именах ломают сортировку,
    пути в NSIS-скриптах и cmd-экранирование
  • Имена вида `general (ALT10).bat` сортируются
    лексикографически как ALT10 < ALT2 — неудобно
  • Читаемое имя — часть премиум-восприятия (карточки
    стратегий, этап 10)

ПОЧЕМУ НЕ ВЫНОСИТЬ bin/ и lists/ НАВЕРХ:
  • См. требование `%~dp0` выше. Нарушение = стратегии
    не запускаются.

【 РЕШЕНИЕ 3: Распаковка при первом запуске, НЕ при установке 】

ОБОСНУЙ:
  • Tauri-установщик (NSIS) копирует resources в папку рядом
    с приложением
  • Но пользовательская папка стратегий должна быть в
    %APPDATA%/ZapretManager/strategies/ (изменяемая)
  • При первом запуске приложение:
    1. Проверяет наличие маркера «первый запуск» (файл
       .initialized в %APPDATA%/ZapretManager/)
    2. Если нет — копирует resources/strategies/ и
       resources/zapret/ в %APPDATA%/ZapretManager/
    3. Создаёт маркер .initialized
    4. Сохраняет в settings путь к распакованной папке
    5. Открывает Strategies
  • При последующих запусках — проверяет только целостность

ПОЧЕМУ НЕ ПРИ УСТАНОВКЕ:
  • NSIS-скрипт на Rust/NSIS — сложнее
  • Пользователь может не иметь прав на запись в %APPDATA%
    на этапе установки (UAC)
  • Приложение лучше контролирует процесс
  • Легко показать прогресс распаковки

ПОЧЕМУ НЕ В ПАПКУ УСТАНОВКИ:
  • C:\Program Files\ требует admin-прав на запись
  • Пользователь не может изменить .bat файлы
  • Обновление = переустановка

【 РЕШЕНИЕ 4: Маркер .initialized с версией ресурсов 】

ОБОСНУЙ:
  • Файл %APPDATA%/ZapretManager/.initialized
  • Содержит JSON:
    {
      "version": "0.1.0",
      "initializedAt": 1730798400000,
      "resourcesVersion": "1.9.5",
      "strategiesCount": 7
    }
  • Проверяется при каждом старте
  • Если версия ресурсов изменилась (обновление приложения) —
    запустить «умное обновление» ресурсов
  • Если файла нет — первый запуск

ПОЧЕМУ JSON, А НЕ ПРОСТО ФЛАГ:
  • Хранит метаданные (версию, дату, количество)
  • Легко расширить в будущем
  • Полезно для отладки

【 РЕШЕНИЕ 5: Умное обновление ресурсов — не перезаписывать пользовательские правки 】

ОБОСНУЙ:
  • При обновлении приложения ресурсы могут измениться
    (новые стратегии, обновлённый winws.exe)
  • Пользователь мог:
    - Добавить свои домены в list-*.txt
    - Создать свои .bat файлы
    - Изменить существующие .bat
  • Нельзя просто перезаписать всё — потеряются правки

АЛГОРИТМ УМНОГО ОБНОВЛЕНИЯ:
  1. Сравнить версию resourcesVersion в .initialized
     с текущей версией из bundle
  2. Если равна — ничего не делать
  3. Если меньше:
     a. Создать бэкап текущей папки стратегий в
        %APPDATA%/ZapretManager/backups/update-{timestamp}/
     b. Для каждой папки:
        - zapret/ → перезаписать полностью (бинарники — наши)
        - strategies/ → добавить новые .bat, НЕ перезаписывать
          существующие (пользователь мог изменить)
        - configs/ → merge: сохранить пользовательские
          строки, обновить стандартные (по маркерам)
     c. Обновить .initialized
     d. Показать уведомление «Ресурсы обновлены»

ПОЧЕМУ НЕ ВСЕГДА ПЕРЕЗАПИСЫВАТЬ:
  • Пользователь потеряет свои .bat
  • Пользователь потеряет свои домены в конфигах

ПОЧЕМУ НЕ НИКОГДА НЕ ПЕРЕЗАПИСЫВАТЬ:
  • Новые стратегии не появятся
  • Обновлённый winws.exe не установится
  • Смысл обновления теряется

【 РЕШЕНИЕ 6: Проверка целостности ресурсов по хешам 】

ОБОСНУЙ:
  • Ресурсы могут быть повреждены (вирус, диск, случайное
    удаление)
  • В bundle — файл manifest.json с SHA-256 хешами всех
    критичных файлов
  • При старте (или по кнопке «Проверить ресурсы») —
    сравнение
  • Если хеш не совпадает — предупреждение + кнопка
    «Восстановить»

MANIFEST.JSON:
```json
{
  "version": "1.9.5",
  "generatedAt": 1730798400000,
  "files": {
    "zapret/winws.exe": "sha256:abc123...",
    "zapret/WinDivert.dll": "sha256:def456...",
    "strategies/discord_youtube.bat": "sha256:...",
    "configs/list-general.txt": "sha256:..."
  }
}
```

ПОЧЕМУ SHA-256:
  • Быстро
  • Криптостойкий
  • Стандарт де-факто

ПОЧЕМУ НЕ ПОЛНАЯ ПРОВЕРКА КАЖДЫЙ РАЗ:
  • Долго для 15 MB бинарников
  • Проверяем только при: первом запуске, смене версии,
    ручной проверке

【 РЕШЕНИЕ 7: Кнопка «Восстановить встроенные стратегии» в Settings 】

ОБОСНУЙ:
  • Если пользователь случайно удалил .bat или повредил
    конфиг — должен быть способ восстановить
  • Кнопка в Settings → Продвинутые
  • Показывает Modal с подтверждением:
    «Это перезапишет ваши изменения в стандартных стратегиях.
     Ваши добавленные .bat останутся. Продолжить?»
  • Восстанавливает только стандартные файлы из bundle
  • Пользовательские .bat (не в manifest) не трогает

ПОЧЕМУ ВАЖНО:
  • Пользователь может «сломать» конфиг экспериментами
  • Восстановление из приложения — быстро
  • Не нужно переустанавливать

【 РЕШЕНИЕ 8: Копирование с прогрессом через events 】

ОБОСНУЙ:
  • Копирование 15 MB (zapret + стратегии) занимает 1–3 сек
  • Нужно показать прогресс: «Распаковка ресурсов... 45%»
  • Rust emit'ит "resource-extract-progress" события каждые
    100ms
  • Frontend показывает модалку с прогресс-баром на первом
    запуске
  • После завершения — модалка закрывается автоматически

ПОЧЕМУ НЕ БЕЗ ПРОГРЕССА:
  • Пользователь думает, что приложение зависло
  • Плохой first-run experience

【 РЕШЕНИЕ 9: Асинхронная распаковка, не блокирует UI 】

ОБОСНУЙ:
  • Копирование 15 MB — I/O-bound задача
  • Асинхронно через tokio::fs
  • Не блокирует главный поток
  • UI показывает модалку с прогрессом
  • Параллельное копирование файлов (лимит 4)

ПОЧЕМУ НЕ SYNC:
  • UI замёрзнет на 2–3 сек
  • Плохой UX

【 РЕШЕНИЕ 10: Fallback — если resources не найдены 】

ОБОСНУЙ:
  • В dev-режиме resources могут отсутствовать (только
    начали разработку)
  • Приложение должно работать и без них:
    - Показать empty state в Strategies
    - Показать в Settings кнопку «Импортировать стратегии»
    - Не падать
  • Логировать warning «Ресурсы не найдены»

ПОЧЕМУ ВАЖНО:
  • Разработчик должен запускать приложение с пустой
    resources/
  • Не должно быть краша

【 РЕШЕНИЕ 11: Лицензия zapret — отдельный файл, доступный из UI 】

ОБОСНУЙ:
  • zapret распространяется под лицензией MIT / GPL
    (в зависимости от компонента)
  • Мы упаковываем бинарники — обязаны соблюдать лицензию
  • Файл LICENSE-zapret.txt в resources/
  • Кнопка в Settings → О приложении → «Лицензии»
  • Показывает содержимое в модалке

ПОЧЕМУ ВАЖНО:
  • Юридическая безопасность
  • Уважение к авторам zapret
  • Стандарт Open Source

【 РЕШЕНИЕ 12: Отдельная команда для сканирования bundle-стратегий 】

ОБОСНУЙ:
  • На Этапе 5 scan_strategies сканирует папку пользователя
  • Нужно также знать, какие стратегии есть в bundle
    (для сравнения и восстановления)
  • Команда list_bundled_strategies() → Vec<StrategyInfo>
  • Используется для:
    - Проверки целостности
    - Восстановления стандартных
    - Определения «новых» стратегий при обновлении

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src-tauri/resources/zapret/ (папка с ресурсами) 】
Создать структуру точно по Решению 2.

Источники файлов:
  • bin/*        ← копировать из bin/ архива zapret
  • lists/*      ← копировать из lists/ архива zapret
  • utils/*      ← копировать из utils/ архива zapret
  • *.bat        ← копировать из корня архива zapret
                    и переименовать по таблице из Решения 2
  • service.bat  ← копировать БЕЗ ПЕРЕИМЕНОВАНИЯ

Обязательные ручные правки:
  1. ipset-all.txt
     В архиве лежит заглушка 18 байт:
       203.0.113.113/32
     Полный список — в ipset-all.txt.backup (556 КБ).
     Заглушка убьёт инъекцию по ipset (этап 8) и
     не даст работать фильтрам по IP-адресам.
     ДЕЙСТВИЕ: заменить содержимое содержимым .backup

  2. LICENSE-zapret.txt
     В архиве ОТСУТСТВУЕТ. Мы упаковываем winws.exe,
     WinDivert.dll и WinDivert64.sys — их лицензии
     обязаны быть в бандле.
     ДЕЙСТВИЕ: взять из upstream zapret
     (https://github.com/bol-van/zapret) файл LICENSE,
     добавить NOTICE с указанием источника и версии.

  3. README-zapret.md
     В архиве ОТСУТСТВУЕТ. Описывает, что внутри,
     откуда взято, как обновлять.
     ДЕЙСТВИЕ: написать самим.

  4. utils/check_updates.enabled
     В бандле НЕ включать (см. этап 12, Решение 8 —
     отключаем штатный апдейт zapret).
     Вместо него всегда ставим NO_UPDATE_CHECK=1
     при запуске стратегии.

  5. Версия ресурсов
     Берётся из строки 2 файла service.bat:
       set "LOCAL_VERSION=1.10.3"
     Записать 1.10.3 в manifest.json и .initialized.

Требования:
  • Все .bat — рабочие копии, содержимое не меняется
  • manifest.json генерируется скриптом (SHA-256 хеши)

【 2. src-tauri/resources/manifest.json 】
Назначение: манифест ресурсов с хешами.

Формат:
```json
{
  "version": "1.9.5",
  "generatedAt": 1730798400000,
  "files": {
    "zapret/winws.exe": "sha256:...",
    "zapret/WinDivert.dll": "sha256:...",
    "strategies/general.bat": "sha256:...",
    ...
  }
}
```

Генерируется скриптом scripts/generate-manifest.js.

【 3. scripts/generate-manifest.js (создать) 】
Назначение: скрипт для генерации manifest.json.

Логика:
  • Обходит src-tauri/resources/
  • Считает SHA-256 для каждого файла
  • Пишет manifest.json
  • Использование: `node scripts/generate-manifest.js`

Требования:
  • Node.js стандартные модули (fs, path, crypto)
  • Без внешних зависимостей

【 4. src-tauri/tauri.conf.json (обновить) 】
Добавить в bundle:

```json
"bundle": {
  "resources": [
    "resources/**/*"
  ],
  ...
}
```

Проверить, что resources не игнорируется в .gitignore.

【 5. src-tauri/src/commands/resources.rs (создать) 】
Назначение: управление ресурсами.

Структуры:
  • ResourcesManifest (Deserialize):
    - version: String
    - generatedAt: u64
    - files: HashMap<String, String>
  • InitMarker (Serialize, Deserialize):
    - version: String
    - initializedAt: u64
    - resourcesVersion: String
    - strategiesCount: usize
  • IntegrityReport (Serialize, camelCase):
    - total: usize
    - missing: Vec<String>
    - modified: Vec<String>
    - ok: bool
  • RestoreReport (Serialize, camelCase):
    - restored: usize
    - skipped: usize (пользовательские, не трогаем)

Команды:
• init_resources(app: AppHandle)
    -> Result<InitReport, AppError>
    Логика:
    1. Получить путь к ресурсам: app.path().resource_dir()
       В dev: src-tauri/resources/ (через
       cfg!(debug_assertions)), в prod: resource_dir()/
    2. Получить путь к %APPDATA%/ZapretManager/
    3. Проверить наличие .initialized
    4. Если нет — первый запуск:
       a. Создать папки: strategies/, vpn/configs/, logs/,
          backups/, cache/
       b. Скопировать resources/zapret/ ЦЕЛИКОМ в
          %APPDATA%/ZapretManager/strategies/
          ВНИМАНИЕ: содержимое zapret/ копируется как есть,
          плоско. service.bat, bin/ и lists/ обязаны
          оказаться РЯДО со стратегиями, иначе
          `call service.bat` не найдёт диспетчер.
       c. Emit прогресс каждые 100ms
       d. Создать .initialized
       e. Вернуть InitReport { firstRun: true, ... }
    5. Если есть — прочитать .initialized
    6. Если resourcesVersion изменился — умное обновление:
       a. Бэкап текущих файлов
       b. Добавить новые .bat, не перезаписывать существующие
       c. Merge конфигов (по маркерам)
       d. Обновить .initialized
       e. Вернуть InitReport { updated: true, ... }
    7. Иначе — вернуть InitReport { firstRun: false }

  • check_resources_integrity(app: AppHandle)
    -> Result<IntegrityReport, AppError>
    Логика:
    1. Прочитать manifest.json из ресурсов
    2. Для каждого файла в manifest:
       - Проверить наличие в %APPDATA%/ZapretManager/
       - Проверить SHA-256
    3. Вернуть IntegrityReport

  • restore_bundled_strategies(app: AppHandle)
    -> Result<RestoreReport, AppError>
    Логика:
    1. Прочитать manifest.json
    2. Для каждого .bat и config из manifest:
       - Скопировать из ресурсов в %APPDATA%
       - Перезаписать (это восстановление)
    3. Файлы, которых нет в manifest (пользовательские) —
       не трогать
    4. Вернуть RestoreReport

  • list_bundled_strategies(app: AppHandle)
    -> Result<Vec<StrategyInfo>, AppError>
    Логика:
    • Вызвать scan_strategies на папке ресурсов
    • Вернуть список

  • get_resources_version() -> Result<String, AppError>
    • Читает версию из manifest.json

  • read_license_text(license_name: String)
    -> Result<String, AppError>
    • Читает LICENSE-zapret.txt или README-zapret.md
    • Возвращает содержимое

Вспомогательные функции:
  • get_config_dir() -> PathBuf
    - Возвращает %APPDATA%/ZapretManager/
    - Создаёт, если не существует
  • copy_dir_with_progress(src, dst, app)
    - Рекурсивное копирование
    - Emit "resource-extract-progress" с percent
  • verify_file_hash(path, expected_hash) -> bool
  • smart_update_resources(src, dst, app)
    - Умное обновление (см. Решение 5)
  • create_backup_dir() -> PathBuf
    - Создаёт backups/update-{timestamp}/

Требования:
  • Все команды async
  • Ошибки через AppError
  • Логирование через tracing
  • Никаких unwrap() без обоснования

【 6. src-tauri/src/commands/mod.rs (обновить) 】
  • pub mod resources;
  • pub use resources::{init_resources, check_resources_integrity,
    restore_bundled_strategies, list_bundled_strategies,
    get_resources_version, read_license_text};

【 7. src-tauri/src/lib.rs (обновить) 】
  • Зарегистрировать команды resources
  • В setup() — вызвать init_resources после создания трея

【 8. src-tauri/Cargo.toml (обновить) 】
Добавить:
  • sha2 = "0.10.8" — уже есть
  • hex = "0.4.3" — уже есть
  • walkdir = "2.5.0" — уже есть

【 9. src/types/resources.ts (создать) 】
Типы:
  • InitReport:
    - firstRun: boolean
    - updated: boolean
    - strategiesCount: number
    - resourcesVersion: string
    - extractedBytes: number
  • InitProgress:
    - stage: string ("copying-zapret" | "copying-strategies" |
      "copying-configs" | "finalizing")
    - percent: number
    - currentFile: string
  • IntegrityReport:
    - total: number
    - missing: string[]
    - modified: string[]
    - ok: boolean
  • RestoreReport:
    - restored: number
    - skipped: number

【 10. src/types/index.ts (обновить) 】
  • Экспортировать InitReport, InitProgress, IntegrityReport,
    RestoreReport

【 11. src/hooks/useResourceInit.ts (создать) 】
Назначение: хук для инициализации ресурсов.

Логика:
  • При mount — invoke("init_resources")
  • Подписка на "resource-extract-progress" во время
    инициализации
  • setState для прогресса
  • После успеха:
    - Если firstRun — показать welcome modal
    - Обновить settings.strategiesFolder
    - Запустить сканирование стратегий
  • Cleanup

Состояние:
  • isInitializing: boolean
  • progress: InitProgress | null
  • error: string | null
  • isFirstRun: boolean (после успеха)
  • report: InitReport | null

Требования:
  • Инициализация только один раз за сессию (флаг в ref)
  • Все listeners с cleanup

【 12. src/components/first-run/FirstRunModal.tsx (создать) 】
Назначение: модалка первого запуска.

Показывается когда:
  • report.firstRun === true
  • Пользователь впервые запустил приложение

Структура:
  • Иконка приложения (большая)
  • Заголовок: «Добро пожаловать в Zapret Manager»
  • Описание: «Мы распаковали встроенные стратегии для
    Discord, YouTube и Outlast Trials. Вы можете начать
    работу прямо сейчас.»
  • Список распакованных компонентов:
    - ✓ 7 стратегий
    - ✓ winws.exe + WinDivert
    - ✓ Конфиги
  • Кнопка «Начать работу» (primary, большая)

Анимация:
  • Появление: fade + scale (400ms ease-out-expo)
  • Иконка: пульсация входящего свечения

【 13. src/components/first-run/InitProgressModal.tsx (создать) 】
Назначение: модалка с прогрессом распаковки.

Показывается во время init_resources.

Структура:
  • Заголовок: «Первый запуск»
  • Текущая стадия: «Копирование winws.exe...»
  • Прогресс-бар (большой)
  • Процент (Inter 700, 24px)

Требования:
  • Нельзя закрыть (backdrop не кликается)
  • Escape заблокирован
  • Плавная анимация прогресса

【 14. src/components/settings/ResourcesSection.tsx (создать) 】
Назначение: секция управления ресурсами в Settings.

Расположение: внутри AdvancedSection.

Содержимое:
  • Заголовок: «Встроенные ресурсы»
  • Информация:
    - Версия ресурсов: 1.9.5
    - Расположение: %APPDATA%/ZapretManager/
    - Кнопка «Открыть папку»
  • Кнопка «Проверить целостность»
    - Показывает IntegrityReport
    - Если есть проблемы → красный badge + список
  • Кнопка «Восстановить встроенные стратегии»
    - Modal подтверждения
    - После успеха — toast «Восстановлено N файлов»

【 15. src/components/settings/LicensesModal.tsx (создать) 】
Назначение: модалка с лицензиями.

Содержимое:
  • Список лицензий:
    - zapret (MIT)
    - Tauri (MIT/Apache)
    - React (MIT)
    - lucide-react (ISC)
    - framer-motion (MIT)
  • Клик на любую → показывает содержимое (для zapret
    через read_license_text)
  • Для сторонних — ссылка на GitHub

【 16. src/components/settings/AboutSection.tsx (обновить) 】
Добавить:
  • Кнопка «Лицензии» → открывает LicensesModal
  • Показать версию ресурсов: «Ресурсы: 1.9.5»

【 17. src/lib/constants.ts (обновить) 】
Добавить:
  • CONFIG_DIR_NAME = "ZapretManager"
  • INIT_MARKER_FILE = ".initialized"
  • MANIFEST_FILE = "manifest.json"
  • RESOURCE_PROGRESS_THROTTLE_MS = 100
  • RESOURCE_COPY_CONCURRENCY = 4

【 18. src/lib/resources.ts (создать) 】
Функции:
  • formatResourceVersion(version: string): string
  • describeIntegrityReport(report: IntegrityReport): string
    — «Все файлы на месте» / «5 файлов повреждено»
  • getResourcePathDescription(): string — «%APPDATA%\
    ZapretManager\»

【 19. .gitignore (обновить) 】
Добавить:
  • src-tauri/resources/zapret/*.exe (опционально — если
    не хотим хранить в git)
  • src-tauri/resources/zapret/*.dll
  • src-tauri/resources/zapret/*.sys

Решение: либо хранить в git (проще для разработки), либо
скачивать скриптом. Рекомендуется хранить в git (5–10 MB).

【 20. scripts/download-zapret.js (опционально) 】
Назначение: скачивание последней версии zapret из GitHub.

Логика:
  • Проверяет GitHub Releases flowseal/zapret-discord-youtube
  • Скачивает .zip
  • Распаковывает в src-tauri/resources/
  • Запускает generate-manifest.js

Требования:
  • Только для разработки
  • Не включается в билд

【 21. src-tauri/src/commands/resources_tests.rs (создать) 】
Тесты:
  • test_verify_file_hash — правильный хеш → true
  • test_verify_file_hash_invalid — неправильный → false
  • test_get_config_dir — путь корректен
  • test_parse_manifest — парсинг JSON
  • test_smart_update_adds_new_files — новые .bat добавляются
  • test_smart_update_preserves_user_files — пользовательские
    остаются

【 22. src-tauri/capabilities/default.json (обновить) 】
Проверить наличие:
  • fs:allow-read-text-file
  • fs:allow-write-text-file
  • fs:allow-exists
  • fs:allow-mkdir
  • fs:allow-read-dir
  • fs:allow-copy-file
  • dialog:allow-open

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Подготовить ресурсы
  • Скопировать bin/* в src-tauri/resources/zapret/bin/
  • Скопировать lists/* в src-tauri/resources/zapret/lists/
    и ЗАМЕНИТЬ ipset-all.txt содержимым ipset-all.txt.backup
  • Скопировать utils/targets.txt в .../zapret/utils/
    utils/check_updates.enabled НЕ копировать
  • Скопировать service.bat в .../zapret/ без переименования
  • Скопировать все 22 стратегии в .../zapret/ и
    переименовать по таблице из Решения 2
  • Создать outlast/default-domains.txt
  • Добавить LICENSE-zapret.txt и README-zapret.md
    (в архиве zapret их НЕТ — написать/скачать самим)
  • Проставить версию 1.10.3 из service.bat

ШАГ 2: Создать скрипт generate-manifest.js
  • Обход resources/
  • SHA-256 для каждого файла
  • Запись manifest.json

ШАГ 3: Сгенерировать manifest.json
  • `node scripts/generate-manifest.js`

ШАГ 4: Обновить tauri.conf.json
  • Добавить "resources/**/*" в bundle.resources

ШАГ 5: Создать resources.rs в Rust
  • Структуры: ResourcesManifest, InitMarker, InitReport,
    IntegrityReport, RestoreReport
  • Команды: init_resources, check_resources_integrity,
    restore_bundled_strategies, list_bundled_strategies,
    get_resources_version, read_license_text
  • Хелперы: get_config_dir, copy_dir_with_progress,
    verify_file_hash, smart_update_resources, create_backup_dir

ШАГ 6: Зарегистрировать команды
  • commands/mod.rs
  • lib.rs
  • Вызвать init_resources в setup()

ШАГ 7: Создать типы
  • src/types/resources.ts
  • Обновить src/types/index.ts

ШАГ 8: Создать useResourceInit
  • Инициализация при mount
  • Подписка на прогресс
  • Cleanup

ШАГ 9: Создать FirstRunModal
  • Модалка приветствия

ШАГ 10: Создать InitProgressModal
  • Модалка прогресса

ШАГ 11: Обновить App.tsx
  • Подключить useResourceInit
  • Показать модалки при необходимости

ШАГ 12: Создать ResourcesSection
  • Секция в Settings → Продвинутые

ШАГ 13: Обновить AdvancedSection
  • Подключить ResourcesSection

ШАГ 14: Создать LicensesModal
  • Модалка лицензий

ШАГ 15: Обновить AboutSection
  • Кнопка «Лицензии»
  • Версия ресурсов

ШАГ 16: Обновить constants.ts
  • Константы

ШАГ 17: Создать resources_tests.rs
  • 6 тестов
  • cargo test — зелёные

ШАГ 18: Финальная проверка
  • Удалить %APPDATA%/ZapretManager/ для теста
  • pnpm tauri dev → первый запуск → прогресс →
    welcome modal → Strategies с 7 стратегиями
  • Проверить целостность
  • Восстановить
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • cargo test — зелёные
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 RUST — TYPE SAFETY 】
  □ Все структуры с serde camelCase
  □ Все ошибки через AppError
  □ Никаких unwrap() без обоснования
  □ HashMap<String, String> для manifest.files

【 RUST — ASYNC 】
  □ init_resources async
  □ Копирование через tokio::fs
  □ Emit прогресс каждые 100ms
  □ Параллельное копирование (лимит 4)
  □ Не блокировать runtime

【 RUST — ЛОГИКА 】
  □ init_resources определяет первый запуск по .initialized
  □ Копирование сохраняет структуру
  □ Прогресс корректен (0–100%)
  □ Умное обновление: новые .bat добавляются, существующие
    не перезаписываются
  □ Пользовательские .bat не в manifest — не трогаются
  □ verify_file_hash работает
  □ Бэкап создаётся при обновлении
  □ Маркер .initialized обновляется

【 RUST — ТЕСТЫ 】
  □ 6+ тестов
  □ Все зелёные
  □ Покрывают edge cases

【 FRONTEND — HOOKS 】
  □ useResourceInit: init при mount, подписка на прогресс
  □ Cleanup listeners
  □ Инициализация только один раз

【 FRONTEND — UI 】
  □ FirstRunModal показывается при первом запуске
  □ InitProgressModal показывается во время распаковки
  □ ResourcesSection в AdvancedSection
  □ LicensesModal работает
  □ AboutSection показывает версию ресурсов
  □ Прогресс-бар плавный

【 UX 】
  □ Первый запуск: прогресс → welcome → работа
  □ Прогресс не «дёргается»
  □ Welcome modal не мешает, информативен
  □ Проверка целостности понятна
  □ Восстановление с подтверждением
  □ Ошибки понятны

【 ДАННЫЕ 】
  □ Ресурсы упакованы в bundle
  □ Распаковка в %APPDATA%/ZapretManager/strategies/
  □ service.bat лежит РЯДО со стратегиями (иначе
    `call service.bat` не найдёт диспетчер)
  □ bin/ и lists/ — подпапки папки со стратегиями
  □ Все 22 стратегии переименованы по таблице
  □ Пробелов и скобок в именах стратегий нет
  □ ipset-all.txt восстановлен из .backup (не 18 байт)
  □ LICENSE-zapret.txt и README-zapret.md в бандле
  □ utils/check_updates.enabled НЕ в бандле
  □ Маркер .initialized создан, версия ресурсов 1.10.3
  □ manifest.json с хешами
  □ Умное обновление сохраняет пользовательские файлы
  □ Бэкап перед обновлением

【 ПРОИЗВОДИТЕЛЬНОСТЬ 】
  □ Первый запуск: распаковка 15 MB < 3 сек
  □ Сканирование bundle-стратегий <200ms
  □ Проверка целостности <500ms
  □ RAM <300 MB

【 ЮРИДИЧЕСКОЕ 】
  □ LICENSE-zapret.txt в bundle
  □ Доступен из UI (LicensesModal)
  □ README-zapret.md с указанием источника

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

ГИПОТЕЗА 1: Ресурсы не находятся в runtime
  ПРИЧИНА: неправильный путь или bundle.resources не настроен.
  ЧТО ПРОВЕРИТЬ: app.path().resource_dir() возвращает путь
    к папке рядом с .exe. В dev — src-tauri/target/debug/.
    Убедиться, что resources скопированы.

ГИПОТЕЗА 2: .initialized не создаётся
  ПРИЧИНА: нет прав на запись в %APPDATA%.
  ЧТО ПРОВЕРИТЬ: get_config_dir() создаёт папку с
    create_dir_all. Обработать ошибку.

ГИПОТЕЗА 3: Прогресс не обновляется
  ПРИЧИНА: emit не вызывается или listener не подписан.
  ЧТО ПРОВЕРИТЬ: emit("resource-extract-progress",
    payload) в copy_dir_with_progress. listen в
    useResourceInit.

ГИПОТЕЗА 4: Первый запуск выполняется каждый раз
  ПРИЧИНА: .initialized не создаётся или не читается.
  ЧТО ПРОВЕРИТЬ: файл создаётся после успешной распаковки.
    При следующем запуске — читается, firstRun=false.

ГИПОТЕЗА 5: Умное обновление удаляет пользовательские
   файлы
  ПРИЧИНА: перезаписывает всю папку strategies/.
  ЧТО ПРОВЕРИТЬ: для strategies/ — только добавление новых
    файлов. Существующие — сравнить hash с manifest.
    Если отличается — пользовательский, не трогать.

ГИПОТЕЗА 6: SHA-256 не совпадает при проверке
  ПРИЧИНА: разные переводы строк (CRLF vs LF) или
    кодировки.
  ЧТО ПРОВЕРИТЬ: manifest.json генерируется на тех же
    файлах, что и bundle. Не должно быть расхождений.

ГИПОТЕЗА 7: Модалка прогресса не закрывается
  ПРИЧИНА: state не обновляется после завершения.
  ЧТО ПРОВЕРИТЬ: useResourceInit.setIsInitializing(false)
    после invoke.

ГИПОТЕЗА 8: Первый запуск в dev-режиме не работает
  ПРИЧИНА: resource_dir() в dev указывает на target/debug.
  ЧТО ПРОВЕРИТЬ: использовать cfg!(debug_assertions) для
    разных путей. В dev — src-tauri/resources/. В prod —
    resource_dir().

ГИПОТЕЗА 9: Приложение падает, если resources/ пуста
  ПРИЧИНА: unwrap() на чтении manifest.
  ЧТО ПРОВЕРИТЬ: если manifest не найден — вернуть
    InitReport { firstRun: false, strategiesCount: 0 }
    с логированием warning.

ГИПОТЕЗА 10: Лицензия не читается
  ПРИЧИНА: файл не в bundle или неправильный путь.
  ЧТО ПРОВЕРИТЬ: LICENSE-zapret.txt в resources/. Путь
    через resource_dir().join("LICENSE-zapret.txt").

ГИПОТЕЗА 11: Бэкап занимает слишком много места
  ПРИЧИНА: копируется вся папка, включая бинарники.
  ЧТО ПРОВЕРИТЬ: копировать только strategies/ и configs/.
    zapret/ — восстанавливается из bundle.

ГИПОТЕЗА 12: Копирование 15 MB блокирует UI
  ПРИЧИНА: sync tokio::fs::copy в цикле.
  ЧТО ПРОВЕРИТЬ: spawn_blocking для больших файлов
    (>1 MB), или tokio::fs::copy (async).

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Удалить %APPDATA%/ZapretManager/ (бэкап предыдущих
   настроек, если нужно)

2. Запустить pnpm tauri dev
   ОЖИДАНИЕ:
   • Модалка InitProgressModal появляется
   • Прогресс-бар плавно идёт от 0% до 100%
   • Стадии сменяются: «Копирование winws.exe...»,
     «Копирование стратегий...», «Финализация...»
   • Через 2–3 сек — модалка закрывается

3. Появляется FirstRunModal
   ОЖИДАНИЕ:
   • Иконка + приветствие
   • Список: 7 стратегий, winws.exe, конфиги
   • Кнопка «Начать работу»

4. Клик «Начать работу»
   ОЖИДАНИЕ:
   • Модалка закрывается
   • Переход на Dashboard (или Strategies)

5. Перейти в Strategies
   ОЖИДАНИЕ:
   • 7 стратегий в списке
   • Бейджи сервисов корректны

6. Проверить файловую систему:
   • Открыть %APPDATA%/ZapretManager/
   ОЖИДАНИЕ:
   • Папки: strategies/, zapret/, configs/, backups/
   • Файл .initialized
   • 7 .bat в strategies/
   • winws.exe в zapret/

7. Перезапустить приложение
   ОЖИДАНИЕ:
   • НЕТ модалки прогресса
   • НЕТ welcome
   • Сразу работает
   • Стратегии на месте

8. Settings → Продвинутые → Встроенные ресурсы
   ОЖИДАНИЕ:
   • Версия ресурсов: 1.9.5
   • Кнопки: «Проверить», «Восстановить», «Открыть папку»

9. Клик «Проверить целостность»
   ОЖИДАНИЕ: «Все файлы на месте» (зелёный badge)

10. Удалить вручную один .bat (например, general.bat)
    ОЖИДАНИЕ: стратегия исчезает из списка

11. Клик «Проверить целостность» снова
    ОЖИДАНИЕ: красный badge, «1 файл отсутствует»

12. Клик «Восстановить встроенные стратегии» →
    подтверждение
    ОЖИДАНИЕ:
    • Modal подтверждения
    • После — general.bat восстановлен
    • Toast «Восстановлен 1 файл»

13. Проверить, что пользовательские .bat не тронуты:
    • Создать my_custom.bat вручную
    • Клик «Восстановить»
    ОЖИДАНИЕ: my_custom.bat на месте

14. Изменить list-general.txt (добавить свой домен)
    • Settings → Восстановить
    ОЖИДАНИЕ: изменения сохранены? Или перезаписаны?

15. Симулировать обновление:
    • Изменить version в .initialized на "1.9.4"
    • Перезапустить приложение
    ОЖИДАНИЕ:
    • Запускается умное обновление
    • Бэкап создан в backups/
    • Новые .bat добавлены
    • Существующие не перезаписаны

16. Открыть Settings → О приложении
    ОЖИДАНИЕ:
    • Версия ресурсов: 1.9.5
    • Кнопка «Лицензии»

17. Клик «Лицензии»
    ОЖИДАНИЕ:
    • Модалка со списком
    • Клик на «zapret» → содержимое LICENSE-zapret.txt
    • Ссылка на GitHub для остальных

18. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

19. cargo check
    ОЖИДАНИЕ: 0 warning'ов

20. cargo test
    ОЖИДАНИЕ: 6+ тестов, все зелёные

21. Открыть Task Manager → RAM
    ОЖИДАНИЕ: <300 MB

22. Собрать production-сборку: pnpm tauri build
    ОЖИДАНИЕ:
    • Сборка успешна
    • Установщик .exe создан
    • Размер .exe 30–50 MB (с ресурсами)

23. Установить .exe на чистую систему (или виртуалку)
    ОЖИДАНИЕ: работает как в dev

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать unwrap() в Rust
❌ Не блокировать UI при распаковке
❌ Не перезаписывать пользовательские .bat при обновлении
❌ Не терять пользовательские домены в конфигах
❌ Не забывать про бэкап перед обновлением
❌ Не забывать про прогресс-бар
❌ Не хардкодить путь к %APPDATA%
❌ Не забывать про cfg!(debug_assertions) для dev/prod
❌ Не оставлять welcome modal навсегда (только первый
   запуск)
❌ Не забывать про лицензии zapret
❌ Не забывать про manifest.json с хешами
❌ Не использовать any в TypeScript
❌ Не забывать cleanup listeners
❌ Не забывать throttle для emit прогресса
❌ Не забывать про fallback при отсутствии resources/
❌ Не начинать Этап 17 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 16 завершён, если ВСЕ пункты выполнены:

✅ resources/zapret/ со всей структурой (Решение 2)
✅ 22 стратегии переименованы, service.bat не тронут
✅ ipset-all.txt восстановлен из ipset-all.txt.backup
✅ LICENSE-zapret.txt и README-zapret.md добавлены
✅ utils/check_updates.enabled исключён из бандла
✅ Версия ресурсов 1.10.3 из service.bat
✅ manifest.json с SHA-256 хешами
✅ scripts/generate-manifest.js работает
✅ tauri.conf.json → bundle.resources
✅ resources.rs с 6 командами
✅ init_resources определяет первый запуск
✅ Прогресс emit'ится каждые 100ms
✅ Копирование с прогрессом и параллелизмом
✅ .initialized создаётся
✅ Умное обновление сохраняет пользовательские файлы
✅ Бэкап создаётся перед обновлением
✅ check_resources_integrity работает
✅ restore_bundled_strategies работает
✅ list_bundled_strategies работает
✅ read_license_text работает
✅ 6+ unit-тестов проходят
✅ useResourceInit работает
✅ FirstRunModal показывается
✅ InitProgressModal показывается
✅ ResourcesSection в Settings
✅ LicensesModal работает
✅ AboutSection показывает версию ресурсов
✅ Первый запуск: 2–3 сек
✅ Повторный запуск: без модалок
✅ Восстановление работает
✅ Лицензии доступны
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ cargo test — зелёные
✅ Консоль чистая
✅ RAM <300 MB
✅ pnpm tauri build работает
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 17
═══════════════════════════════════════════════════════════════════════

После Этапа 16 у нас есть:
  • Полностью самодостаточное приложение
  • Ресурсы упакованы в установщик
  • Автоматическая распаковка при первом запуске
  • Прогресс + welcome modal
  • Умное обновление ресурсов
  • Проверка целостности по хешам
  • Восстановление встроенных стратегий
  • Доступ к лицензиям
  • Готовность к Этапу 17 — «Кастомный установщик»

На Этапе 17 нужно будет:
  • Создать красивый NSIS/WiX-установщик с анимациями
  • Настроить tauri.conf.json → bundle.windows.nsis
  • Добавить кастомные страницы установщика (приветствие,
    выбор папки, прогресс)
  • Встроить иконку приложения в установщик
  • Настроить создание ярлыков (Desktop, Start Menu)
  • Опции: «Запустить после установки», «Создать ярлык
    на рабочем столе»
  • Проверить установку на чистой системе

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 16 — СТОП.

Не начинай Этап 17. Не настраивай кастомный NSIS-установщик,
не добавляй кастомные страницы, не настраивай ярлыки.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 17
  • "Правка: ..." — правка в Этап 16
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.
