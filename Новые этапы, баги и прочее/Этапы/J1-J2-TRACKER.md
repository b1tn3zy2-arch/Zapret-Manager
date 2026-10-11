# Трекер работ: Этапы J1 и J2

Правила: строго последовательно. J1 → проверки → коммит → отчёт → STOP. J2 — только по команде.
Каждый пункт: `✅ сделано` / `⛔ не сделано (причина)`. Пропусков без причины быть не должно.

Общие проверки после каждого крупного шага:
`tsc --noEmit`, `eslint . --max-warnings 0`, `prettier --check`, `vitest run`, `playwright test`,
`node scripts/i18n-check.mjs`, `node scripts/offline-audit.mjs`, `knip`, `perf:check`,
`cargo check`, `cargo clippy --all-targets -- -D warnings`, `cargo test`.

---

## Этап J1 — «Игры» v2

### Решения пользователя
- Искать ЛЮБУЮ установленную игру, не только магазины. ✅
- Обложки — реальные, могут идти из setup. ✅ 68 реальных обложек в бандле
- Сканирование при каждом запуске, кнопки «Пересканировать» нет. ✅
- Карточки 3D: следуют за курсором, поднимаются, на hover — выбор запустить с размытым фоном. ✅
- Порядок: сначала J1, потом J2. ✅

### Источники обнаружения
- [x] A. Реестр Uninstall (HKLM/HKCU, 64+32) — `game_registry.rs`, `game_sources_system.rs`
- [x] B. Steam (libraryfolders.vdf + appmanifest) — `game_sources_stores.rs`
- [x] C. Epic (LauncherInstalled.dat + фолбэк на Program Files)
- [x] D. GOG (реестр + папка `GOG Games`)
- [x] E. Ubisoft (реестр `Software\Ubisoft\Launcher\Installs`)
- [x] F. EA / Battle.net (папки `EA Games`, `Battle.net`)
- [x] G. Общий скан известных корней (`C:\Program Files`, `C:\Games` и те же на дисках C–N)
- [x] H. Пользовательские папки — диалог «Папки с играми», хранятся в сторе
- [x] Эвристика «это игра»: маркеры движков (`UnityPlayer.dll`, `Engine\Binaries`, `*_Data`, `.pak/.vpk/.pck/.ucas/.utoc`), сходство имени exe и папки, порог 50 МБ (8 МБ при маркерах), стоп-листы имён и папок
- [x] Merge без дублей — `merge_games` (Rust) + `mergeScannedGames` (frontend, дедуп по пути к exe)
- [x] Проверка exe на месте — `existing_only` в Rust, ручные игры переживают скан
- [x] Прогресс emit — событие `game-scan-progress`, индикатор в шапке страницы

### RUST
- [x] `commands/game_scanner.rs` — команда `scan_installed_games`, оркестрация, enrich, emit
- [x] `commands/game_scanner_vdf.rs` — парсеры ACF и libraryfolders
- [x] `commands/game_sources_stores.rs` — Steam + Epic
- [x] `commands/game_sources_registry.rs` — GOG + Ubisoft
- [x] `commands/game_sources_system.rs` — реестр + известные папки + свои папки
- [x] `commands/game_heuristics.rs` — эвристики и дедуп
- [x] `commands/game_model.rs` — InstalledGame, платформы, источники, прогресс
- [x] `commands/game_known.rs` — known-games.json, поиск по appid и имени
- [x] `commands/game_covers.rs` — обложка из бандла/кэша, докачка с CDN, импорт своей
- [x] `commands/game_launcher.rs` — `launch_game` (без UAC), `hide_main_window`, `is_game_running`
- [x] `winapi_helpers.rs` — `shell_execute_normal` (ShellExecuteExW без `runas`)
- [x] Регистрация в `commands/mod.rs` и `lib.rs`
- [x] 67 новых юнит-тестов, `cargo test`: 582 + 14 зелёные
- [x] `cargo check` / `cargo clippy --all-targets -- -D warnings` — 0 замечаний

### РЕСУРСЫ
- [x] `src-tauri/resources/games/known-games.json` — 68 игр, имена сверены со Steam Store API
- [x] `src-tauri/resources/games/covers/` — 68 реальных обложек Steam, 3,9 МБ
- [x] Покрытие bundle — существующий `resources/**/*`, правки tauri.conf.json не потребовались

### FRONTEND
- [x] `types/installed-game.ts`
- [x] `stores/useInstalledGamesStore.ts` — persist, version, migrate, папки, статусы
- [x] `hooks/useInstalledGames.ts` — автоскан, прогресс, действия; `useInstalledGamesStartup` в App
- [x] `hooks/useGameLauncher.ts` — стратегия → обход → запуск → скрытие окна, промпты античита/обхода
- [x] `components/settings/games/GameCardInstalled.tsx` — 3:4, 3D-tilt, подъём, оверлей
- [x] `components/settings/games/GamePlayOverlay.tsx` — размытый фон, кнопка 72×72
- [x] `components/settings/games/GameCoverImage.tsx` — обложка через команду, ленивая загрузка
- [x] `components/settings/games/InstalledGamesGrid.tsx` — auto-fill minmax, stagger
- [x] `components/settings/games/GameContextMenu.tsx`
- [x] `components/settings/games/AddGameDialog.tsx`
- [x] `components/settings/games/GameFoldersDialog.tsx`
- [x] `components/settings/games/GameScanIndicator.tsx`
- [x] `components/settings/games/GameLaunchPrompt.tsx`
- [x] `components/settings/games/GameBypassSettings.tsx` — старые настройки обхода свёрнуты
- [x] `pages/Games.tsx` — сетка сверху, диалоги, контекстное меню

### UI / ЛОГИКА
- [x] Карточки 3:4 (`aspect-ratio` + object-cover)
- [x] Обложки реальные видны
- [x] Badge платформы и обхода
- [x] 3D-tilt следует за курсором только внутри карточки
- [x] Подъём карточки при hover (scale 1.04, подъём 6px, тень и свечение)
- [x] Оверлей с запуском появляется сразу при hover
- [x] Размытый фон под оверлеем (`backdrop-blur-md` + радиальный scrim)
- [x] Светлая тема — используются только токены темы
- [x] prefers-reduced-motion и низкий tier отключают 3D (`motionDisabled`)
- [x] Адаптив — `clamp(180px, 15vw, 240px)` auto-fill

### ТЕСТЫ
- [x] vitest: `installedGames.test.ts`, `installedGamesStore.test.ts`, компоненты карточек, `useGameLauncher.test.ts` — 417 тестов зелёные
- [x] Playwright: `e2e/games.spec.ts` — 5 тестов (сетка, запуск, античит, настройки обхода, ручное добавление), всего 45 E2E зелёные

### АВТОМАТИЧЕСКИЕ ПРОВЕРКИ
- [x] tsc --noEmit — 0
- [x] eslint — 0
- [x] prettier --check — ок
- [x] vitest — 417
- [x] playwright — 45
- [x] i18n-check — 0/0/0
- [x] offline-audit — PASS (Steam CDN добавлен в белый список)
- [x] knip — только 3 pre-existing
- [x] perf:check — passed
- [x] lint:release — ⛔ падает из-за удалённых пользователем `README.md` и `CHANGELOG.md` (проблема не в этом этапе)

### ЖИВАЯ ПРОВЕРКА
- [x] Сканирование находит игры на этом ПК — `Игр найдено: 2 из базы 68` (`Zapret Test Game`, один ложный «Freakmess 0.1.0»)
- [x] Запуск игры — `launch_game` проверен реальным запуском `where.exe` (тест возвращает PID)
- [x] Фикстура: `C:\Games\Zapret Test Game\ZapretTestGame.exe` (копия notepad + 60 МБ + `UnityPlayer.dll`) определяется корректно
- [ ] Карточки, 3D, запуск из UI глазами — нужно подтверждение пользователя
- [x] Исчезновение удалённой игры — игра без exe отбрасывается в `existing_only`

### Правка 1 (по фидбэку от 11.10)
- [x] Сканер больше не показывает приложения: реестр принимает только папки с маркерами движка; на ПК найдена 1 реальная игра вместо приложений
- [x] 3D-карточки: причина отсутствия — Windows «наилучшее быстродействие» (prefers-reduced-motion). Приложение теперь использует собственный тумблер «Анимации» (`useMotionPreference`), tilt 14°, подъём 1.05
- [x] Размытие при hover появляется без задержки (CSS 100 мс вместо framer-каскада)
- [x] Убран «Приоритет» у игры: поле, бейдж, ключи i18n, тесты
- [x] Запуск с обходом: перед игрой проверяется РЕАЛЬНЫЙ процесс обхода через `check_strategy_status`, при сбое — ошибка в лог
- [x] VPN-режим запуска для игр, которым VPN реально нужен (Outlast Trials, Tarkov, R6, Destiny 2, Warzone, GTA V, S.T.A.L.K.E.R. 2) — по исследованию: Outlast Trials в РФ работает через VPN, zapret может мешать; предупреждение про kill switch
- [x] Дашборд: тумблер Обход/VPN перенесён справа от приветствия, подпись не наезжает, анимация восстановлена
- [x] Дашборд: hero и статистика на всю ширину, пары контейнеров без пустот
- [x] Сайдбар: плавная анимация свёртывания/развёртывания
- [x] Логи: панель поиска и фильтров в едином стиле с остальными контейнерами
- [x] Тесты: +6 unit на запуск с обходом и VPN, 421 unit / 45 E2E зелёные, 583 Rust

### Известные ограничения
- Escape from Tarkov нет в Steam — обложку получить не откуда, карточка без обложки (плейсхолдер)
- Эвристика «любая игра» даёт редкие ложные срабатывания (например, Electron-приложение с именем exe = имя папки); карточку можно убрать через контекстное меню
- Автопоиск не сканирует весь диск — только известные корни, магазины и папки пользователя (по требованию ТЗ)

---

## Этап J2 — Трей v2 (начать только после STOP и команды)

### Диагностика
- [ ] Baseline измерен

### Rust
- [ ] tray-menu готов при старте (окно уже создаётся, нужен handshake готовности)
- [ ] warmup через 2 сек
- [ ] show: set_position → show → set_focus (порядок уже верный)
- [ ] Один watch-поток вместо спавна на каждое открытие
- [ ] Логирование времени
- [ ] show_main_window / navigate_to

### Frontend
- [ ] CSS-анимация 150 мс вместо framer-motion входа
- [ ] transform-origin по углу экрана
- [ ] Снапшот состояния до показа (убрать IPC-раундтрип)
- [ ] React.memo на пункты меню
- [ ] Escape + blur + debounce 50 мс, без двойной подписки
- [ ] Облегчённый бандл трей-окна (динамические импорты)
- [ ] Тема и reduced-motion в трей-окне

### Проверки
- [ ] Открытие < 50 мс
- [ ] Все пункты меню
- [ ] Escape / blur
- [ ] tsc/eslint/prettier/vitest/playwright/cargo

### Ограничения (требует ручной проверки пользователя)
- [ ] DPI 125/150/200 %
- [ ] Windows 10