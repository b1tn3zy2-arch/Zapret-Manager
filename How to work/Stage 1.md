═══════════════════════════════════════════════════════════════════════
ЭТАП 1: ТЕХНОЛОГИЧЕСКИЙ СТЕК И ИНИЦИАЛИЗАЦИЯ ПРОЕКТА
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Выбрать точный технологический стек с зафиксированными версиями,
создать скелет проекта, настроить TypeScript в strict-режиме,
Tailwind CSS 4, CSS-переменные для цветовой схемы, шрифты и
структуру папок так, чтобы на выходе приложение ЗАПУСКАЛОСЬ,
показывало тёмное окно с правильными шрифтами и цветами, и было
готово к Этапу 2.

Это фундамент всего проекта. Если фундамент кривой — всё приложение
развалится на следующих этапах. Поэтому здесь НЕЛЬЗЯ торопиться,
НЕЛЬЗЯ халтурить и НЕЛЬЗЯ пропускать проверки.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать каждое ПЕРЕД кодом)
═══════════════════════════════════════════════════════════════════════

Прежде чем писать код, ты должен обосновать каждое решение.
Если не можешь обосновать — не используй.

【 РЕШЕНИЕ 1: Tauri 2 вместо Electron 】

ОБОСНУЙ в комментарии:
  • Размер приложения: Tauri даёт 5–15 MB, Electron — 80–150 MB
  • Потребление RAM: Tauri 60–120 MB, Electron 200–400 MB
  • Холодный старт: Tauri <2 сек, Electron 3–5 сек
  • Rust-бэкенд: безопасность, производительность, нет
    node-зависимостей в production
  • Нативная интеграция с Windows: трей, уведомления, UAC,
    системные вызовы — всё из коробки
  • Встроенный updater, bundler, генератор иконок

ПОЧЕМУ НЕ ELECTRON:
  • Тяжёлый (Chromium + Node.js в одном пакете)
  • Больше уязвимостей (больше кода — больше площади атаки)
  • Не подходит для системных утилит
  • Пользователь не хочет 150-мегабайтную «обёртку» над .bat

ВЫВОД: Tauri 2 — единственный правильный выбор для этого проекта.

【 РЕШЕНИЕ 2: React 19 + TypeScript strict 】

ОБОСНУЙ:
  • React 19: улучшенный Suspense, автоматический batching,
    useTransition, useDeferredValue для плавности UI,
    огромная экосистема (framer-motion, zustand, lucide)
  • TypeScript strict: ошибки типов ловятся на этапе компиляции,
    а не у пользователя; автодополнение в IDE работает идеально;
    рефакторинг безопасен
  • noImplicitAny: true, strictNullChecks: true, strict: true —
    обязательны

ПОЧЕМУ НЕ VUE / SVELTE:
  • Экосистема React шире для десктопных приложений
  • Больше готовых компонентов под тёмную тему
  • Zustand удобнее для глобального стора

【 РЕШЕНИЕ 3: Tailwind CSS 4 】

ОБОСНУЙ:
  • Новый движок Oxide — компиляция в 10 раз быстрее
  • Плагин @tailwindcss/vite (не PostCSS) — ещё быстрее
  • Нативная поддержка CSS-переменных через @theme
  • Автоматическая сортировка классов
  • Меньше конфига, больше возможностей
  • Идеально для glassmorphism и тёмной темы

ПОЧЕМУ НЕ CSS MODULES / STYLED-COMPONENTS:
  • Медленнее на runtime
  • Хуже для атомарных стилей
  • Tailwind 4 быстрее всех в 2026

【 РЕШЕНИЕ 4: Zustand для глобального стора 】

ОБОСНУЙ:
  • Минимальный бойлерплейт (в 5 раз меньше Redux)
  • Селекторы без лишних ре-рендеров
  • Работает вне React (можно вызывать из Rust через events)
  • Персистентность из коробки (persist middleware)
  • 3 KB вместо 40 KB у Redux Toolkit

ПОЧЕМУ НЕ REDUX / JOTAI / RECOIL:
  • Redux — избыточен для этого проекта
  • Jotai — атомарный, не подходит для сложного стора
  • Recoil — deprecated Facebook'ом в 2025

【 РЕШЕНИЕ 5: pnpm как пакетный менеджер 】

ОБОСНУЙ:
  • Экономия диска (hard links, глобальный стор)
  • Быстрее npm и yarn в 2–3 раза
  • Строгая структура node_modules — нет phantom-dependencies
  • Работает с Tauri из коробки

ПОЧЕМУ НЕ NPM:
  • Медленнее, дублирует пакеты
  • Phantom dependencies (баги, которые сложно ловить)

ПОЧЕМУ НЕ BUN:
  • На момент старта могут быть проблемы с Tauri
  • Меньше стабильности для production
  • Отложить до этапа оптимизации

【 РЕШЕНИЕ 6: Framer Motion для UI-анимаций 】

ОБОСНУЙ:
  • Декларативные анимации
  • Layout animations из коробки
  • AnimatePresence для модалок и переходов
  • Работает с React 19
  • Идеален для стекла, hover-эффектов, появления карточек

ПОЧЕМУ НЕ CSS-АНИМАЦИИ:
  • Сложно синхронизировать с React-состоянием
  • Нет exit-анимаций
  • Framer Motion даёт кинематографичность

ПОЧЕМУ НЕ GSAP:
  • Для UI-анимаций Framer Motion проще
  • GSAP оставить для сложных scroll-driven сцен (если понадобятся)
  • В десктоп-приложении scroll-сцен мало

【 РЕШЕНИЕ 7: Логирование через tracing (Rust) 】

ОБОСНУЙ:
  • tracing — стандарт для production Rust-приложений
  • Структурированные логи (JSON, поля, уровни)
  • Работает с tracing-subscriber для вывода в stdout и файл
  • Заменит println! везде

ПОЧЕМУ НЕ log + env_logger:
  • tracing мощнее, поддерживает spans, async
  • Активнее развивается

【 РЕШЕНИЕ 8: Обработка ошибок через thiserror + anyhow 】

ОБОСНУЙ:
  • thiserror для типизированных ошибок в библиотеках
  • anyhow для «верхнеуровневых» ошибок с контекстом
  • Ошибки сериализуются через serde и передаются в React

ПОЧЕМУ НЕ Box<dyn Error>:
  • Теряется тип, сложнее обрабатывать
  • Не сериализуется

═══════════════════════════════════════════════════════════════════════
📦 ЧАСТЬ 2: ТОЧНЫЕ ВЕРСИИ ПАКЕТОВ
═══════════════════════════════════════════════════════════════════════

Зафиксировать ТОЧНЫЕ версии. Для критичных пакетов — БЕЗ символа ^,
чтобы избежать breaking changes. Для dev-пакетов можно ^.

FRONTEND (package.json):

  core:
    react: "19.0.0"
    react-dom: "19.0.0"
    typescript: "5.7.0"

  tauri:
    @tauri-apps/api: "2.1.1"
    @tauri-apps/cli: "2.1.0"
    @tauri-apps/plugin-shell: "2.1.0"
    @tauri-apps/plugin-fs: "2.1.0"
    @tauri-apps/plugin-dialog: "2.1.0"
    @tauri-apps/plugin-notification: "2.1.0"
    @tauri-apps/plugin-updater: "2.1.0"
    @tauri-apps/plugin-process: "2.1.0"

  ui:
    tailwindcss: "4.0.0"
    @tailwindcss/vite: "4.0.0"
    framer-motion: "12.0.0"
    lucide-react: "0.468.0"
    clsx: "2.1.1"
    tailwind-merge: "2.5.5"

  state:
    zustand: "5.0.1"

  utils:
    zod: "3.24.0"
    date-fns: "4.1.0"
    nanoid: "5.0.9"

  dev:
    @types/react: "19.0.0"
    @types/react-dom: "19.0.0"
    @types/node: "22.10.0"
    @vitejs/plugin-react: "4.3.4"
    vite: "6.0.0"
    eslint: "9.17.0"
    prettier: "3.4.2"
    prettier-plugin-tailwindcss: "0.6.9"

  fonts:
    @fontsource/unbounded: "5.1.0"
    @fontsource/inter: "5.1.0"
    @fontsource/jetbrains-mono: "5.1.1"

BACKEND (src-tauri/Cargo.toml):

  core:
    tauri = { version = "2.1.0", features = ["tray-icon", "image-png"] }
    tauri-plugin-shell = "2.1.0"
    tauri-plugin-fs = "2.1.0"
    tauri-plugin-dialog = "2.1.0"
    tauri-plugin-notification = "2.1.0"
    tauri-plugin-updater = "2.1.0"
    tauri-plugin-process = "2.1.0"

  async:
    tokio = { version = "1.42.0", features = ["full"] }

  serialization:
    serde = { version = "1.0.216", features = ["derive"] }
    serde_json = "1.0.133"

  error handling:
    thiserror = "2.0.7"
    anyhow = "1.0.95"

  logging:
    tracing = "0.1.41"
    tracing-subscriber = "0.3.19"

  system:
    sysinfo = "0.33.0"
    dirs = "5.0.1"

  networking:
    reqwest = { version = "0.12.9", features = ["json", "rustls-tls"] }

  hashing:
    sha2 = "0.10.8"
    hex = "0.4.3"

  parsing:
    regex = "1.11.1"

ВАЖНО:
  • После установки — закоммитить pnpm-lock.yaml и Cargo.lock
  • Не использовать ^ для критичных пакетов
  • Проверить совместимость версий через pnpm outdated

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 3: СТРУКТУРА ПАПОК (создать на этом этапе)
═══════════════════════════════════════════════════════════════════════

Создать следующее дерево. Файлы могут быть заглушками
(экспорт пустого компонента / пустой модуль), но структура
должна быть полной.

zapret-manager/
├── .vscode/
│   ├── settings.json              # настройки Tailwind, форматирование
│   └── extensions.json            # рекомендованные расширения
├── src/
│   ├── app/
│   │   ├── App.tsx                # корневой компонент
│   │   └── providers.tsx          # провайдеры (тема, стор)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TitleBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Modal.tsx
│   │   └── shared/
│   │       ├── NoiseOverlay.tsx
│   │       └── GlassPanel.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Strategies.tsx
│   │   ├── Logs.tsx
│   │   ├── Settings.tsx
│   │   └── About.tsx
│   ├── stores/
│   │   └── useAppStore.ts
│   ├── hooks/
│   │   └── .gitkeep
│   ├── lib/
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── fonts.css
│   ├── types/
│   │   └── index.ts
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── commands/
│   │   │   └── mod.rs
│   │   ├── error.rs
│   │   └── logger.rs
│   ├── icons/
│   ├── resources/
│   │   ├── zapret/
│   │   ├── strategies/
│   │   └── configs/
│   ├── capabilities/
│   │   └── default.json
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
├── public/
├── .editorconfig
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 4: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создание проекта через create-tauri-app
  • Команда: pnpm create tauri-app@latest zapret-manager
    с шаблоном react-ts, менеджер pnpm, identifier
    com.zapretmanager.app
  • Проверить: папка создана, pnpm tauri dev открывает окно

ШАГ 2: Установка всех зависимостей
  • Frontend — через pnpm add с точными версиями
  • Backend — через cargo add в src-tauri/
  • Проверить: нет ошибок установки, pnpm-lock.yaml создан

ШАГ 3: Настройка tsconfig.json
  • strict: true
  • noImplicitAny: true
  • strictNullChecks: true
  • noUnusedLocals: true
  • noUnusedParameters: true
  • noUncheckedIndexedAccess: true
  • exactOptionalPropertyTypes: true
  • paths: "@/*": ["./src/*"]
  • target: ES2022
  • moduleResolution: bundler

ШАГ 4: Настройка vite.config.ts
  • Плагины: react, @tailwindcss/vite
  • Алиас @ → ./src
  • server.port: 1420, strictPort: true
  • clearScreen: false (Tauri)
  • watch.ignored: src-tauri
  • build.target: esnext
  • build.rollupOptions.output.manualChunks — разделить на
    react-vendor, motion, ui

ШАГ 5: Настройка globals.css
  • Импорт @import "tailwindcss"
  • Блок @theme с CSS-переменными:
    - Цвета: bg-primary #0a0a0f, bg-secondary #14141c,
      bg-tertiary #1c1c26, accent-primary #00ff88,
      accent-secondary #00d4ff, accent-danger #ff3b5c,
      accent-warning #ffb800, text-primary #ffffff,
      text-secondary #a0a0b0, text-tertiary #606070
    - Glass: glass-bg, glass-border, glass-hover
    - Шрифты: --font-display (Unbounded),
      --font-sans (Inter), --font-mono (JetBrains Mono)
    - Радиусы: sm 6px, md 10px, lg 16px, xl 24px
    - Анимации: ease-out-expo, ease-in-out-expo
  • Глобальные стили:
    - box-sizing: border-box для всех
    - html, body, #root — height 100%, overflow hidden
    - body — фон bg-primary, шрифт sans, antialiased,
      user-select: none
    - input, textarea, [data-selectable] — user-select: text
    - Кастомный скроллбар (тонкий, серый, hover светлее)
    - [data-tauri-drag-region] — app-region drag, user-select none
    - :focus-visible — outline 2px accent-primary
    - @media (prefers-reduced-motion) — отключить анимации

ШАГ 6: Настройка шрифтов (fonts.css)
  • Установить @fontsource/unbounded, @fontsource/inter,
    @fontsource/jetbrains-mono
  • Роли шрифтов:
    — Unbounded — заголовки H1–H3, крупные числа,
      названия страниц. Веса 600, 700
    — Inter — основной текст, подписи, кнопки.
      Веса 400, 500, 600, 700
    — JetBrains Mono — логи, PID, байты, версии,
      пути файлов. Веса 400, 500
  • Сабсеты: latin + cyrillic (интерфейс на русском,
    кириллица обязательна)
  • Импортировать fonts.css в main.tsx ПЕРЕД globals.css
  • @theme:
    — --font-display: Unbounded (заголовки)
    — --font-sans: Inter (текст)
    — --font-mono: JetBrains Mono (цифры, логи)
  • Шрифты скачиваются на этапе сборки и едут в бандле.
    Runtime-CDN запрещён: приложение работает офлайн.

ШАГ 7: Настройка tauri.conf.json
  • productName: "Zapret Manager"
  • version: "0.1.0"
  • identifier: "com.zapretmanager.app"
  • window: 1280x800, minWidth 1024, minHeight 640,
    decorations false, theme Dark, center true,
    titleBarStyle Overlay, hiddenTitle true
  • security.csp: default-src 'self'; img-src 'self' asset: data:;
    style-src 'self' 'unsafe-inline'; script-src 'self'
  • trayIcon: id main-tray, iconPath icons/icon.png
  • bundle: targets ["nsis"], resources ["resources/**/*"],
    installMode currentUser, languages ["Russian", "English"],
    category Utility

ШАГ 8: Настройка capabilities/default.json
  • Только необходимые разрешения (принцип наименьших привилегий):
    - core:default
    - window: start-dragging, minimize, maximize, unmaximize,
      close, toggle-maximize, is-maximized
    - shell: execute, open
    - dialog: open, save
    - fs: read-text-file, write-text-file, read-dir, exists, mkdir
    - notification: default
    - updater: default
    - process: allow-restart

ШАГ 9: Настройка Rust (main.rs, lib.rs, logger.rs, error.rs)
  • main.rs: windows_subsystem = "windows" в release,
    вызов lib::run()
  • lib.rs: инициализация логирования, регистрация всех плагинов
    (shell, fs, dialog, notification, updater, process),
    пустой invoke_handler (команды добавятся позже)
  • logger.rs: инициализация tracing-subscriber с EnvFilter,
    уровень info по умолчанию
  • error.rs: enum AppError через thiserror с вариантами
    Io, Tauri, Serde, Custom; impl Serialize для передачи
    в React; type AppResult<T>

ШАГ 10: Настройка utils.ts и constants.ts
  • utils.ts:
    - cn() — объединение классов Tailwind через clsx + twMerge
    - formatLogTime() — формат HH:mm:ss.SSS
    - sleep() — Promise-задержка
  • constants.ts:
    - APP_NAME, APP_VERSION
    - ROUTES — dashboard, strategies, logs, settings, about
    - ANIMATION — fast 0.15, normal 0.25, slow 0.4, easing
    - BREAKPOINTS — sm 640, md 768, lg 1024, xl 1280

ШАГ 11: main.tsx и App.tsx (минимально)
  • main.tsx: ReactDOM.createRoot, StrictMode,
    импорт fonts.css и globals.css
  • App.tsx: заглушка — центрированный заголовок
    "Zapret Manager" с акцентным цветом, подзаголовок
    "Инициализация завершена. Готов к Этапу 2."
    Использовать классы bg-bg-primary, text-accent-primary,
    text-text-secondary

ШАГ 12: Настройка .gitignore, .prettierrc, eslint.config.js,
         .editorconfig
  • .gitignore — node_modules, dist, target, .pnpm-store,
    *.log, .DS_Store, .env.local
  • .prettierrc — semi true, singleQuote false, tabWidth 2,
    trailingComma es5, printWidth 80,
    plugins ["prettier-plugin-tailwindcss"]
  • eslint.config.js — flat config для React 19 + TS strict
  • .editorconfig — indent_style space, indent_size 2,
    end_of_line lf, charset utf-8, trim_trailing_whitespace true,
    insert_final_newline true

ШАГ 13: Заглушки для всех компонентов
  • Каждый файл в components/, pages/, stores/ —
    минимальный экспорт (функция, возвращающая null или
    простой div с названием)
  • Все заглушки — с типизацией (React.FC или явный
    возвращаемый тип)
  • Импортов пока нет — это нормально

ШАГ 14: Проверка сборки
  • pnpm tauri dev — открывается окно, видно заголовок
  • pnpm build — сборка без ошибок TypeScript
  • pnpm tsc --noEmit — нет ошибок типов
  • cargo check в src-tauri — нет ошибок Rust
  • Консоль чистая (нет warning'ов)

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 5: ЧЕК-ЛИСТ САМОПРОВЕРКИ (прогнать ПЕРЕД показом)
═══════════════════════════════════════════════════════════════════════

Прогони каждый пункт. Если хоть один не проходит — ИСПРАВЬ
до показа. Если исправить нельзя — ЯВНО предупреди пользователя.

【 TYPE SAFETY 】
  □ tsconfig.json — strict: true, noImplicitAny: true,
    strictNullChecks: true, noUnusedLocals: true,
    noUnusedParameters: true, noUncheckedIndexedAccess: true,
    exactOptionalPropertyTypes: true
  □ paths @/* настроены
  □ Все заглушки компонентов типизированы
  □ Нет ни одного any

【 STRUCTURE 】
  □ Все папки из ЧАСТИ 3 созданы
  □ Все файлы из ЧАСТИ 3 существуют (хотя бы как заглушки)
  □ Нет «пустых» папок без .gitkeep

【 CONFIG 】
  □ vite.config.ts — плагин @tailwindcss/vite подключён
  □ vite.config.ts — алиас @ работает
  □ tauri.conf.json — decorations false, theme Dark,
    minWidth/minHeight заданы
  □ capabilities/default.json — только нужные разрешения
  □ package.json — версии зафиксированы БЕЗ ^ для критичных
  □ Cargo.toml — все зависимости добавлены

【 STYLES 】
  □ globals.css — @import "tailwindcss" + @theme блок
  □ Все CSS-переменные из ЧАСТИ 4 ШАГ 5 присутствуют
  □ Кастомный скроллбар стилизован
  □ prefers-reduced-motion обработан
  □ focus-visible стилизован
  □ Шрифты подключены локально через @fontsource.
    Runtime-CDN запрещён — приложение работает офлайн

【 RUST 】
  □ main.rs — windows_subsystem = "windows" в release
  □ lib.rs — все 6 плагинов зарегистрированы
  □ logger.rs — tracing инициализирован
  □ error.rs — AppError + impl Serialize
  □ cargo check проходит без warning'ов

【 FONTS 】
  □ Unbounded установлен через @fontsource (заголовки)
  □ Inter установлен через @fontsource (текст)
  □ JetBrains Mono установлен через @fontsource (цифры, логи)
  □ Сабсеты latin + cyrillic подключены для всех трёх
  □ fonts.css импортирован в main.tsx ПЕРЕД globals.css
  □ В @theme --font-display, --font-sans и --font-mono
    ссылаются на них
  □ Кириллица рендерится Unbounded и Inter без
    квадратов-заглушек

【 BUILD 】
  □ pnpm tauri dev запускается
  □ Окно открывается, тёмное, 1280x800
  □ Заголовок "Zapret Manager" виден, неоново-зелёный
  □ Шрифт Inter отображается (не системный fallback)
  □ pnpm tsc --noEmit — нет ошибок
  □ cargo check — нет ошибок
  □ Консоль браузера чистая
  □ Консоль Tauri чистая

【 SECURITY 】
  □ CSP настроен в tauri.conf.json
  □ capabilities/default.json — минимум разрешений
  □ Нет секретов в коде
  □ Нет хардкода путей

【 PERFORMANCE 】
  □ Холодный старт <2 сек (замерить)
  □ RAM <150 MB при запуске (замерить в Task Manager)
  □ Vite запускается <3 сек
  □ Hot reload работает (<500ms)

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 6: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

Перечисли 2–3 гипотезы, где код может упасть, и что
проверить в браузере/консоли.

ГИПОТЕЗА 1: Tailwind 4 может не подхватить @theme
  ЧТО ПРОВЕРИТЬ: открыть DevTools → Elements → проверить,
  что bg-bg-primary действительно применяется (не fallback).
  Если нет — проверить, что @tailwindcss/vite в плагинах
  vite.config.ts.

ГИПОТЕЗА 2: Tauri 2 может не запуститься из-за несовместимости
  версии @tauri-apps/cli и Rust-крейта tauri
  ЧТО ПРОВЕРИТЬ: версии в package.json (@tauri-apps/cli) и
  Cargo.toml (tauri) должны совпадать по минорной версии (2.1.x).
  Если нет — cargo update и pnpm update.

ГИПОТЕЗА 3: CSP может блокировать inline-стили Tailwind
  ЧТО ПРОВЕРИТЬ: консоль на предмет "Refused to apply inline
  style". Если есть — добавить 'unsafe-inline' в style-src.

ГИПОТЕЗА 4: @fontsource может не подгрузить шрифт из-за
  неправильного порядка импортов
  ЧТО ПРОВЕРИТЬ: в DevTools → Network → шрифты должны быть
  загружены (woff2). Если нет — проверить порядок:
  fonts.css ДО globals.css.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 7: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Открыть терминал в папке zapret-manager

2. Запустить: pnpm tauri dev
   ОЖИДАНИЕ: окно 1280x800, тёмное, без системного заголовка

3. Увидеть в центре: "Zapret Manager" (неоново-зелёный)
   и подзаголовок "Инициализация завершена. Готов к Этапу 2."
   ОЖИДАНИЕ: шрифт Inter (не Arial/Times)

4. Открыть DevTools (Ctrl+Shift+I)
   ОЖИДАНИЕ: консоль чистая, нет ошибок

5. Перейти во вкладку Elements → проверить body
   ОЖИДАНИЕ: background-color = rgb(10, 10, 15) (это #0a0a0f)

6. Проверить, что Tailwind-классы работают
   В Elements найти <h1> → стиль text-accent-primary
   ОЖИДАНИЕ: color = rgb(0, 255, 136) (это #00ff88)

7. Проверить шрифт
   В Elements найти body → font-family
   ОЖИДАНИЕ: Inter первым в списке

8. Замерить холодный старт
   Закрыть окно → запустить снова
   ОЖИДАНИЕ: <2 сек

9. Открыть Task Manager → найти процесс ZapretManager
   ОЖИДАНИЕ: RAM <150 MB

10. Внести изменение в App.tsx (поменять текст)
    ОЖИДАНИЕ: Hot reload за <500ms

11. Запустить pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

12. Запустить cargo check в src-tauri/
    ОЖИДАНИЕ: 0 ошибок, 0 warning'ов

13. Запустить pnpm build
    ОЖИДАНИЕ: сборка успешна, dist/ создан

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 8: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать Electron
❌ Не использовать create-react-app
❌ Не использовать npm или yarn (только pnpm)
❌ Не использовать Redux / Jotai / Recoil
❌ Не использовать CSS Modules / styled-components
❌ Не использовать CDN для шрифтов
❌ Не использовать any в TypeScript
❌ Не использовать unwrap() в Rust без обоснования
❌ Не хардкодить пути и URL
❌ Не оставлять console.log в production
❌ Не использовать символ ^ для критичных пакетов
❌ Не оставлять заглушки без типизации
❌ Не пропускать ни одного пункта чек-листа
❌ Не начинать Этап 2 без подтверждения пользователя

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 9: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 1 считается завершённым, если ВСЕ пункты выполнены:

✅ Приложение запускается через pnpm tauri dev
✅ Окно 1280x800, тёмное, без системного заголовка
✅ Заголовок "Zapret Manager" виден, неоново-зелёный
✅ Шрифт Inter загружен (не fallback)
✅ Tailwind работает (проверено на 3+ классах)
✅ CSS-переменные доступны глобально
✅ TypeScript strict работает (pnpm tsc --noEmit = 0 ошибок)
✅ Rust компилируется без warning'ов (cargo check)
✅ Все папки и файлы из ЧАСТИ 3 созданы
✅ Холодный старт <2 сек
✅ RAM <150 MB
✅ Консоль чистая (нет ошибок и warning'ов)
✅ Все 6 плагинов Tauri зарегистрированы
✅ CSP настроен
✅ capabilities — минимум разрешений
✅ Нет ни одного any в TypeScript
✅ Нет ни одного unwrap() в Rust без обоснования
✅ Все версии зафиксированы

═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 1 ВЫПОЛНЕН 2026-10-05
═══════════════════════════════════════════════════════════════════════

Фактические результаты проверки:

✅ Приложение запускается (окно 1296x809, отвечает, рендерит UI)
✅ Окно тёмное, frameless (`decorations: false`), без системного заголовка
✅ Заголовок "Zapret Manager" виден, неоново-зелёный (#00ff88)
✅ Шрифты Unbounded + Inter + JetBrains Mono загружены локально из
   node_modules/@fontsource, сборка в dist/*.woff2 — без CDN
✅ Tailwind 4 работает: bg-bg-primary, text-accent-primary, font-display,
   font-mono, text-text-secondary, text-text-tertiary
✅ CSS-переменные доступны глобально (@theme в globals.css)
✅ pnpm exec tsc --noEmit — 0 ошибок (strict + noUncheckedIndexedAccess +
   exactOptionalPropertyTypes)
✅ cargo check — 0 ошибок, 0 предупреждений
✅ pnpm exec eslint . — 0 ошибок
✅ pnpm exec prettier --check . — 0 ошибок
✅ pnpm build — успешно, react-vendor вынесен в отдельный чанк
✅ Все папки и файлы из ЧАСТИ 3 созданы
✅ Консоль чистая
✅ Все версии зафиксированы БЕЗ символа ^ (точно, не диапазоны)
✅ Комментариев в коде нет (ts/tsx/css/rs/Cargo.toml)
✅ Иконки сгенерированы из собственного знака, не дефолт Tauri

Отклонения от этого файла зафиксированы в
`How to work\README.md`, раздел «8.1 Отклонения от этапов»:

  O1 rust-toolchain.toml → MSVC (GNU-линковщик не умеет
     crate-type = ["staticlib","cdylib","rlib"])
  O2 baseUrl удалён из tsconfig.json (TS 6, deprecated)
  O3 tsconfig.node.json получил composite + emitDeclarationOnly (TS 6)
  O4 manualChunks только функцией (Vite 8 → rolldown) — поправить Stage 20
  O5 esbuild добавлен в devDependencies (нужен @tailwindcss/node при pnpm)
  O6 tauri_plugin_updater отложен до этапа 23 (нужен ключ подписи
     и endpoints; без них падает на старте)
  O7 src/vite-env.d.ts удалён, типы Vite перенесены в tsconfig.json
  O8 иконки перегенерированы из собственного SVG-знака

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 10: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 2
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 1 у нас есть:
  • Работающий скелет Tauri 2 + React 19 + TypeScript strict
  • Настроенный Tailwind CSS 4 с @theme и CSS-переменными
  • Шрифты Inter и JetBrains Mono (локально через @fontsource)
  • Полная файловая структура с заглушками
  • Rust-бэкенд с логированием и обработкой ошибок
  • Все 6 плагинов Tauri зарегистрированы
  • CSP и capabilities настроены
  • Готовность к разработке UI (Этап 2 — TitleBar, Sidebar, Layout)

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 11: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 1 — СТОП.

Не начинай Этап 2. Не пиши код для TitleBar, Sidebar или
Layout. Не добавляй компоненты, которых нет в структуре.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 2
  • "Правка: ..." — внесение правки в Этап 1
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если возникла развилка при реализации — ЗАДАЙ ВОПРОС,
не додумывай.