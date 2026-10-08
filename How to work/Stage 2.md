═══════════════════════════════════════════════════════════════════════
ЭТАП 2: СТРУКТУРА ПРИЛОЖЕНИЯ И LAYOUT
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Создать полноценный Layout приложения: кастомный TitleBar
(frameless окно с кнопками управления), Sidebar с навигацией,
переиспользуемый GlassPanel, NoiseOverlay и Layout-обёртку.
Приложение должно выглядеть как премиум-продукт уровня Awwwards
уже на этом этапе: тёмное стекло, неоновые акценты, плавные
hover-эффекты, аккуратная типографика.

После этого этапа окно приложения должно:
  • Иметь кастомный заголовок с логотипом, кнопками свернуть/
    развернуть/закрыть и рабочей drag-областью
  • Иметь боковое меню с 5 разделами (Dashboard, Strategies,
    Logs, Settings, About)
  • Уметь сворачивать Sidebar в компактный режим (72px)
  • Переключать активный раздел через Zustand
  • Показывать статус-индикатор подключения внизу Sidebar
  • Выглядеть «дорого»: стекло, blur, свечение, плавные
    переходы 200ms

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Frameless окно + кастомный TitleBar 】

ОБОСНУЙ:
  • В tauri.conf.json уже стоит decorations: false — стандартный
    заголовок Windows отсутствует
  • Это даёт полный контроль над внешним видом (как у Discord,
    VS Code, Figma, Linear)
  • Кастомный TitleBar содержит: логотип, название, drag-область,
    кнопки управления окном
  • Drag реализуется через data-tauri-drag-region (уже настроено
    в CSS на Этапе 1)
  • Кнопки управления вызывают Tauri API:
    getCurrentWindow().minimize() / toggleMaximize() / close()

ПОЧЕМУ НЕ СТАНДАРТНЫЙ TITLEBAR:
  • Скучно, серо, отличается от темы приложения
  • Не даёт контроля над брендингом
  • Стандарт Windows 11 «жирный» и отвлекает

【 РЕШЕНИЕ 2: Sidebar фиксированной ширины с collapse-режимом 】

ОБОСНУЙ:
  • Развёрнутый: 240px — комфортно для навигации с иконками
    и текстом
  • Свёрнутый: 72px — только иконки, экономит место для
    контента (например, страницы Logs)
  • Анимация: framer-motion с width transition 250ms ease-out-expo
  • Состояние collapse хранится в Zustand (persist в localStorage)
  • Кнопка toggle — в TitleBar или в верхней части Sidebar

ПОЧЕМУ НЕ ВЕРХНЕЕ МЕНЮ (как в браузере):
  • Приложение-утилита — нужна вертикальная навигация
  • Sidebar — стандарт для десктопных утилит (VS Code, Discord,
    Slack, Linear)

ПОЧЕМУ НЕ ТАБЫ ВВЕРХУ:
  • Секций 5, табы будут тесными
  • Нет места для статус-индикатора
  • Sidebar визуально «богаче»

【 РЕШЕНИЕ 3: GlassPanel как переиспользуемый компонент 】

ОБОСНУЙ:
  • Glassmorphism — ключевой элемент визуала (backdrop-blur-xl,
    bg-white/5, border-white/10)
  • Используется многократно: карточки, модалки, тултипы,
    панели логов, настройки
  • Единый компонент даёт консистентность стиля
  • Пропсы: className, children, variant (default / interactive /
    outlined), padding, rounded

ПОЧЕМУ НЕ INLINE-СТИЛИ:
  • Дублирование кода
  • Сложно менять глобально
  • Нет типизации вариантов

【 РЕШЕНИЕ 4: NoiseOverlay поверх всего приложения 】

ОБОСНУЙ:
  • SVG-шум добавляет «плёночную» текстуру — признак премиум-дизайна
  • Opacity 0.03, mix-blend-mode overlay
  • position fixed, pointer-events none, z-index максимальный
  • Не мешает кликам, но делает фон «живым»
  • Работает без потери FPS (статичный SVG)

ПОЧЕМУ НЕ PNG-шум:
  • Больше веса
  • Хуже масштабируется
  • SVG генерируется кодом — ноль ассетов

【 РЕШЕНИЕ 5: Роутинг через Zustand, не React Router 】

ОБОСНУЙ:
  • В десктоп-приложении 5 экранов — React Router избыточен
  • URL не нужен (нет адресной строки)
  • Zustand: activePage: "dashboard" | "strategies" | "logs" |
    "settings" | "about"
  • Переключение — setActivePage(page)
  • App.tsx рендерит нужный экран через switch
  • Позже (если нужно) можно заменить на TanStack Router

ПОЧЕМУ НЕ REACT ROUTER:
  • +30 KB в бандл без пользы
  • Сложнее с Tauri (нет истории браузера)
  • Избыточная абстракция для 5 экранов

【 РЕШЕНИЕ 6: Анимации через Framer Motion 】

ОБОСНУЙ:
  • Плавные переходы между страницами (AnimatePresence + fade/slide)
  • Collapse Sidebar (width animate)
  • Hover-эффекты на пунктах меню (scale, glow)
  • Активный индикатор (layoutId для «переезда» между пунктами)
  • Никакого CSS-transition вручную — всё декларативно

ПОЧЕМУ НЕ CSS-АНИМАЦИИ:
  • Collapse Sidebar требует синхронного изменения ширины и
    перепозиционирования контента — CSS неудобно
  • layoutId — killer feature для индикатора

【 РЕШЕНИЕ 7: Статус-индикатор внизу Sidebar 】

ОБОСНУЙ:
  • Показывает: Connected (зелёный пульс) / Disconnected (серый) /
    Connecting (жёлтый) / VPN (голубой)
  • Минимум информации, но всегда на виду
  • Клик → переход на Dashboard
  • В свёрнутом Sidebar — только точка-индикатор с tooltip

ПОЧЕМУ НЕ В TITLEBAR:
  • TitleBar занят кнопками окна
  • Внизу Sidebar — стандарт для приложений (Discord, Slack)

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

Все файлы уже существуют как заглушки с Этапа 1. На этом этапе
их нужно реализовать полностью.

【 1. src/stores/useAppStore.ts 】
Назначение: глобальное состояние приложения (UI-часть).

Состояние:
  • activePage: "dashboard" | "strategies" | "logs" | "settings" |
    "about" — по умолчанию "dashboard"
  • sidebarCollapsed: boolean — по умолчанию false
  • connectionStatus: "connected" | "disconnected" | "connecting" |
    "vpn" — по умолчанию "disconnected"

Методы:
  • setActivePage(page) — переключение страницы
  • toggleSidebar() — свернуть/развернуть
  • setSidebarCollapsed(collapsed) — явная установка
  • setConnectionStatus(status) — обновление статуса

Требования:
  • Использовать persist middleware (localStorage)
  • Персистить ТОЛЬКО sidebarCollapsed и activePage
  • connectionStatus — НЕ персистить (это runtime-состояние)
  • Селекторы — точечные (не подписываться на весь стор)

【 2. src/components/layout/TitleBar.tsx 】
Назначение: кастомный заголовок окна.

Структура (слева направо):
  • Слева: логотип (иконка щита или молнии, 20x20,
    неоново-зелёный) + название "Zapret Manager" (Inter 600,
    14px, text-primary)
  • Центр: пустая drag-область (data-tauri-drag-region),
    занимает всё свободное место
  • Справа: кнопки управления окном:
    — Свернуть (Minus), 32x32, hover bg-white/5
    — Развернуть (Square), 32x32, hover bg-white/5
    — Закрыть (X), 32x32, hover bg-red-500, иконка белая

Поведение:
  • Кнопки вызывают Tauri API через getCurrentWindow()
  • Кнопка «Развернуть» меняет иконку на «Восстановить»
    (два квадрата) при maximized — использовать
    onResized listener для отслеживания
  • Drag работает через data-tauri-drag-region на всей
    области TitleBar (кроме кнопок)
  • Высота: 36px
  • Фон: прозрачный, без границы (граница будет на Layout)

Требования:
  • Никаких inline-стилей
  • Иконки — из lucide-react
  • aria-label на каждой кнопке
  • focus-visible стилизован

【 3. src/components/layout/Sidebar.tsx 】
Назначение: боковая навигация.

Структура (сверху вниз):
  • Верхняя часть: кнопка toggle collapse (ChevronLeft/Right),
    выровнена по правому краю
  • Центр: навигационные пункты (5 штук):
    — Dashboard (LayoutDashboard) → "Главная"
    — Strategies (Layers или Zap) → "Стратегии"
    — Logs (Terminal или ScrollText) → "Логи"
    — Settings (Settings) → "Настройки"
    — About (Info) → "О приложении"
  • Низ: статус-индикатор (точка + текст «Подключено» /
    «Отключено» / «VPN»)

Каждый пункт:
  • Высота 44px
  • Отступ слева 12px, иконка 20x20, текст 14px
  • Border-radius 10px
  • Hover: bg-white/5, лёгкий сдвиг вправо на 2px
  • Active: bg-white/10 + неоновый индикатор слева
    (полоска 3px, layoutId="active-indicator" через
    framer-motion — переезжает между пунктами)
  • При collapsed: только иконка по центру + tooltip с
    названием при hover

Поведение:
  • Клик → setActivePage(route)
  • Активный пункт определяется activePage из стора
  • Collapse: width анимируется от 240px до 72px (framer-motion)
  • При collapsed — текст плавно исчезает (opacity 0 + width 0)

Фон Sidebar:
  • Прозрачный (не стекло — стекло будет на Layout)
  • Border-right 1px solid rgba(255,255,255,0.06)

【 4. src/components/shared/GlassPanel.tsx 】
Назначение: переиспользуемая стеклянная панель.

Props:
  • children: ReactNode
  • variant?: "default" | "interactive" | "outlined"
  • padding?: "none" | "sm" | "md" | "lg"
  • rounded?: "md" | "lg" | "xl"
  • className?: string

Стили:
  • default: bg-white/5, backdrop-blur-xl, border 1px solid
    rgba(255,255,255,0.1)
  • interactive: как default + hover: bg-white/8,
    border-white/15, лёгкий scale 1.01, transition 200ms
  • outlined: только border, без фона и blur
  • padding: sm 12px, md 16px, lg 24px
  • rounded: md 10px, lg 16px, xl 24px
  • Использовать cn() для объединения классов

Требования:
  • forwardRef не нужен — простой functional component
  • Типизация строгая, без any
  • Дефолтные значения: variant="default", padding="md",
    rounded="lg"

【 5. src/components/shared/NoiseOverlay.tsx 】
Назначение: SVG-шум поверх приложения.

Реализация:
  • position: fixed, inset: 0
  • pointer-events: none
  • z-index: 9999
  • opacity: 0.03
  • mix-blend-mode: overlay
  • SVG с feTurbulence (baseFrequency 0.8, numOctaves 4)
  • Размер: 100% x 100%

Требования:
  • Никаких внешних файлов — SVG генерируется inline
  • Не мешает кликам
  • Не влияет на FPS (статичный)

【 6. src/components/layout/Layout.tsx 】
Назначение: корневая обёртка приложения.

Структура:
  • flex flex-col h-screen w-screen
  • Сверху: <TitleBar />
  • Ниже: flex flex-row flex-1 (занимает всё оставшееся место)
    — <Sidebar />
    — main: flex-1, overflow-y-auto, содержит children
  • Поверх всего: <NoiseOverlay />

Требования:
  • Layout принимает children (это будет текущая страница)
  • main имеет padding 24px (или 32px — выбрать)
  • Фон всего Layout: bg-bg-primary
  • Не должно быть горизонтального скролла
  • main скроллится вертикально, TitleBar и Sidebar — нет

【 7. src/app/App.tsx 】
Назначение: корневой компонент, рендерит Layout + текущую страницу.

Логика:
  • Читает activePage из useAppStore
  • Switch по activePage → рендерит нужный компонент из pages/
  • Оборачивает всё в <Layout>
  • Использует AnimatePresence + motion.div для плавного
    перехода между страницами (fade + лёгкий slide)
  • key на motion.div = activePage (для корректной анимации)

Требования:
  • Никаких условных рендеров вида «if page === "dashboard"
    return <Dashboard />» без обёртки motion
  • Каждая страница должна рендериться в стабильном контейнере

【 8. Заглушки страниц (src/pages/*.tsx) 】
Все 5 страниц (Dashboard, Strategies, Logs, Settings, About)
должны быть минимально реализованы:

Каждая страница:
  • Заголовок <h1> (Inter 700, 28px, text-primary)
  • Подзаголовок <p> (Inter 400, 14px, text-secondary)
  • Заглушка-панель GlassPanel с текстом «Здесь будет [название]»
  • Никаких «TODO» — просто плейсхолдер

Пример для Dashboard:
  • H1: «Главная»
  • P: «Управление подключением и обзор состояния»
  • GlassPanel: «Здесь будет Dashboard (Этап 9)»

Пример для Strategies:
  • H1: «Стратегии»
  • P: «Управление .bat-файлами обхода блокировок»
  • GlassPanel: «Здесь будет список стратегий (Этап 5)»

Аналогично для остальных.

【 9. src/main.tsx 】
Обновить:
  • Обернуть <App /> в <React.StrictMode>
  • Импорты fonts.css и globals.css уже есть
  • Ничего больше не нужно

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Реализовать useAppStore
  • Открыть src/stores/useAppStore.ts
  • Написать полный Zustand-стор с persist middleware
  • Типизировать состояние через interface
  • Селекторы для точечных подписок (setActivePage не
    должен ре-рендерить весь App)
  • Проверить: localStorage сохраняет sidebarCollapsed

ШАГ 2: Реализовать GlassPanel
  • Открыть src/components/shared/GlassPanel.tsx
  • Написать компонент с props (variant, padding, rounded)
  • Использовать cn() из lib/utils
  • Проверить в DevTools: backdrop-filter работает

ШАГ 3: Реализовать NoiseOverlay
  • Открыть src/components/shared/NoiseOverlay.tsx
  • Inline SVG с feTurbulence
  • position fixed, z-index 9999, pointer-events none
  • Проверить: шум виден на тёмном фоне, но не мешает кликам

ШАГ 4: Реализовать TitleBar
  • Открыть src/components/layout/TitleBar.tsx
  • Логотип + название слева
  • Drag-область по центру (data-tauri-drag-region)
  • 3 кнопки справа (Minus, Square, X)
  • Логика maximize ↔ restore через listen("tauri://resize")
  • Проверить: перетаскивание работает, кнопки работают

ШАГ 5: Реализовать Sidebar
  • Открыть src/components/layout/Sidebar.tsx
  • 5 nav-пунктов с иконками lucide-react
  • Активный индикатор через layoutId (framer-motion)
  • Collapse: width 240px ↔ 72px
  • Нижний статус-индикатор (пульсирующая точка)
  • Проверить: переключение страниц работает,
    collapse плавный

ШАГ 6: Реализовать Layout
  • Открыть src/components/layout/Layout.tsx
  • Flex-структура: TitleBar / (Sidebar + main) / NoiseOverlay
  • main — overflow-y-auto, padding 24–32px
  • Проверить: нет горизонтального overflow

ШАГ 7: Обновить App.tsx
  • Открыть src/app/App.tsx
  • Switch по activePage
  • AnimatePresence + motion.div для fade-перехода
  • Проверить: переходы между страницами плавные

ШАГ 8: Реализовать заглушки страниц
  • Открыть 5 файлов в src/pages/
  • Каждая — h1 + p + GlassPanel с плейсхолдером
  • Проверить: при переключении страниц контент меняется

ШАГ 9: Финальная проверка сборки
  • pnpm tauri dev — запускается
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Пройти весь чек-лист из Части 4

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

Прогони ПЕРЕД показом. Если хоть один пункт не проходит —
ИСПРАВЬ. Если исправить нельзя — ЯВНО предупреди.

【 TYPE SAFETY 】
  □ Все компоненты типизированы (props через interface)
  □ Ни одного any
  □ Zustand-стор типизирован полностью
  □ Селекторы возвращают конкретные типы, не весь стор
  □ Event handlers в TitleBar типизированы

【 MEMORY / LEAKS 】
  □ Все Tauri listen() имеют cleanup в useEffect
  □ Нет подписок на window events без отписки
  □ Framer Motion не оставляет «висящих» анимаций при unmount

【 STRUCTURE 】
  □ TitleBar, Sidebar, Layout реализованы полностью
  □ GlassPanel и NoiseOverlay — переиспользуемые
  □ App.tsx рендерит нужную страницу через switch
  □ Все 5 страниц имеют заглушки
  □ Zustand persist работает

【 UI / UX 】
  □ TitleBar: drag работает, кнопки работают
  □ Maximize меняет иконку на Restore
  □ Sidebar: 5 пунктов, active индикатор переезжает
  □ Collapse плавный (250ms, ease-out-expo)
  □ При collapsed Sidebar — tooltips работают
  □ Статус-индикатор внизу пульсирует
  □ NoiseOverlay виден, не мешает кликам
  □ Нет горизонтального overflow
  □ main скроллится вертикально, TitleBar и Sidebar — нет

【 PERFORMANCE 】
  □ Переключение страниц <100ms
  □ Collapse Sidebar — 60 FPS (проверить в Performance)
  □ Нет layout shift при collapse
  □ Cold start по-прежнему <2 сек
  □ RAM <150 MB

【 ACCESSIBILITY 】
  □ Все кнопки имеют aria-label
  □ Tab-навигация проходит по TitleBar → Sidebar → main
  □ focus-visible виден на всех интерактивных элементах
  □ Escape не нужен пока (нет модалок)
  □ Contrast текста ≥4.5:1

【 CODE QUALITY 】
  □ Нет мёртвого кода
  □ Нет закомментированных блоков
  □ Нет console.log
  □ Функции <50 строк
  □ Файлы <300 строк
  □ Комментариев в коде нет (правило проекта)

【 BUILD 】
  □ pnpm tauri dev — запускается
  □ pnpm tsc --noEmit — 0 ошибок
  □ cargo check — 0 warning'ов
  □ Консоль браузера чистая
  □ Консоль Tauri чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: Tauri API недоступен на верхнем уровне
  ПРИЧИНА: getCurrentWindow() импортируется из
    @tauri-apps/api/window, но если импортировать в модуле,
    который рендерится в SSR — будет ошибка. Для Tauri SSR
    не актуален, но в Vite HMR может быть warning.
  ЧТО ПРОВЕРИТЬ: импорт внутри обработчиков событий, а не
    на верхнем уровне компонента.

ГИПОТЕЗА 2: data-tauri-drag-region не работает из-за вложенности
  ПРИЧИНА: если внутри drag-области есть кнопки без
    pointer-events явного «стоп», drag может перехватывать
    клики.
  ЧТО ПРОВЕРИТЬ: на кнопках добавить data-tauri-drag-region
    не нужно — Tauri автоматически исключает их. Если не
    работает — добавить onMouseDown={(e) => e.stopPropagation()}.

ГИПОТЕЗА 3: layoutId в framer-motion конфликтует при collapsed
  ПРИЧИНА: если Sidebar collapse меняет DOM-структуру,
    layoutId может «прыгать».
  ЧТО ПРОВЕРИТЬ: индикатор должен быть только на развёрнутом
    Sidebar. В collapsed — не рендерить.

ГИПОТЕЗА 4: AnimatePresence не запускает exit-анимацию
  ПРИЧИНА: если у motion.div нет уникального key, React
    переиспользует компонент.
  ЧТО ПРОВЕРИТЬ: key={activePage} обязательно.

ГИПОТЕЗА 5: persist Zustand не подхватывает localStorage
  ПРИЧИНА: если стор создаётся до инициализации localStorage
    (редко, но бывает в Tauri).
  ЧТО ПРОВЕРИТЬ: в DevTools → Application → Local Storage
    есть ключ с настройками.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev
   ОЖИДАНИЕ: окно 1280x800, тёмное, без системного заголовка

2. Увидеть кастомный TitleBar сверху:
   • Слева — логотип и «Zapret Manager»
   • Справа — 3 кнопки (Свернуть, Развернуть, Закрыть)

3. Проверить drag:
   • Зажать ЛКМ в центре TitleBar → перетащить окно
   ОЖИДАНИЕ: окно двигается

4. Проверить кнопки:
   • Клик «Свернуть» → окно минимизируется
   • Клик «Развернуть» → окно на весь экран, иконка
     меняется на «Восстановить»
   • Клик «Восстановить» → окно возвращается к 1280x800
   • Клик «Закрыть» → приложение закрывается

5. Открыть снова, посмотреть на Sidebar:
   • 5 пунктов: Главная, Стратегии, Логи, Настройки, О приложении
   • Каждый с иконкой слева и текстом
   • Первый пункт (Главная) — активный, с неоновой
     полоской слева

6. Клик по «Стратегии»
   ОЖИДАНИЕ: индикатор плавно переезжает, контент меняется
   на страницу Strategies

7. Клик по «Логи»
   ОЖИДАНИЕ: индикатор переезжает, видим H1 «Логи»

8. Клик по toggle-collapse (шеврон вверху Sidebar)
   ОЖИДАНИЕ: Sidebar сужается до 72px за 250ms, текст исчезает,
   остаются только иконки

9. Навести на иконку в collapsed Sidebar
   ОЖИДАНИЕ: tooltip с названием

10. Клик по toggle снова
    ОЖИДАНИЕ: Sidebar разворачивается до 240px

11. Посмотреть внизу Sidebar
    ОЖИДАНИЕ: статус-индикатор — серая точка + «Отключено»
    (пульсация только у Connected)

12. Открыть DevTools → Elements → найти NoiseOverlay
    ОЖИДАНИЕ: div с SVG, opacity 0.03, pointer-events none

13. Проверить вертикальный скролл в main
    ОЖИДАНИЕ: если контент большой — скроллится только main,
    TitleBar и Sidebar на месте

14. Проверить переход между страницами
    ОЖИДАНИЕ: fade + лёгкий slide (250ms), без «мигания»

15. Изменить размер окна
    ОЖИДАНИЕ: layout адаптируется, minWidth 1024 соблюдается

16. Перезапустить приложение
    ОЖИДАНИЕ: sidebarCollapsed и activePage сохранились

17. Запустить pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

18. Запустить cargo check в src-tauri/
    ОЖИДАНИЕ: 0 warning'ов

19. Открыть Performance в DevTools → записать collapse Sidebar
    ОЖИДАНИЕ: 60 FPS, нет dropped frames

20. Открыть Task Manager → проверить RAM
    ОЖИДАНИЕ: <150 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать React Router или другой роутер
❌ Не использовать shadcn/ui или готовые библиотеки компонентов
❌ Не использовать inline-стили
❌ Не использовать any
❌ Не оставлять console.log
❌ Не забывать cleanup в useEffect (Tauri listen)
❌ Не забывать aria-label на иконках-кнопках
❌ Не забывать data-tauri-drag-region на TitleBar
❌ Не делать layout с фиксированными высотами в px (кроме TitleBar)
❌ Не забывать про prefers-reduced-motion (анимации Sidebar)
❌ Не оставлять заглушки без типизации
❌ Не начинать Этап 3 без подтверждения
❌ Не менять конфиги из Этапа 1 без причины
❌ Не добавлять функциональность, которой нет в задании

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 2 завершён, если ВСЕ пункты выполнены:

✅ TitleBar: логотип, название, drag, 3 кнопки работают
✅ Maximize меняет иконку на Restore и обратно
✅ Sidebar: 5 пунктов, иконки, активный индикатор переезжает
✅ Collapse Sidebar работает (240px ↔ 72px, 250ms)
✅ Tooltips в collapsed режиме работают
✅ Статус-индикатор внизу Sidebar (пульсирует при Connected)
✅ GlassPanel переиспользуется (используется в Layout и страницах)
✅ NoiseOverlay виден, не мешает кликам
✅ Layout корректно распределяет пространство
✅ main скроллится, TitleBar и Sidebar — нет
✅ App.tsx переключает страницы через Zustand
✅ AnimatePresence даёт плавные переходы между страницами
✅ Все 5 страниц имеют заглушки (H1 + P + GlassPanel)
✅ Zustand persist сохраняет sidebarCollapsed и activePage
✅ Нет горизонтального overflow при любом размере окна
✅ TypeScript strict — 0 ошибок
✅ Rust — 0 warning'ов
✅ Консоль браузера и Tauri чистая
✅ Холодный старт <2 сек
✅ RAM <150 MB
✅ Collapse Sidebar — 60 FPS
✅ Все aria-label на месте
✅ focus-visible работает

═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 2 ВЫПОЛНЕН 2026-10-05
═══════════════════════════════════════════════════════════════════════

Реализовано:
  • useAppStore: persist, partialize только activePage + sidebarCollapsed,
    точечные селекторы
  • TitleBar: логотип-щит, название, drag-область, 3 кнопки окна,
    отслеживание maximized через onResized + cleanup
  • Sidebar: 5 пунктов, layoutId-индикатор, collapse 240↔72 (250ms,
    ease-out-expo, уважает prefers-reduced-motion), тултипы,
    статус-индикатор с пульсацией
  • GlassPanel: variant/padding/rounded через cn()
  • NoiseOverlay: inline SVG feTurbulence, z-9999, pointer-events none
  • Layout: TitleBar / (Sidebar + main) / NoiseOverlay
  • App.tsx: PAGE_COMPONENTS + AnimatePresence mode="wait", key=activePage
  • 5 страниц-заглушек (H1 + подзаголовок + GlassPanel)

Проверено фактическим запуском (клики + скриншоты):
  ✅ Переключение страниц, индикатор переезжает
  ✅ Collapse 240 → 72px, подписи исчезают
  ✅ Тултип «Стратегии» появляется в collapsed-режиме
  ✅ Maximize 1296 → 2576 (монитор 2576×1440), IsZoomed = true
  ✅ Restore: иконка Square ↔ Copy, 2576 → 1296
  ✅ Minimize и Close работают
  ✅ Persist: после перезапуска Sidebar свёрнут, активна «Логи»
  ✅ RAM 35 МБ (лимит 150)
  ✅ pnpm exec tsc --noEmit — 0 ошибок
  ✅ pnpm exec eslint . — 0 ошибок
  ✅ pnpm exec prettier --check . — 0 ошибок
  ✅ cargo check — 0 ошибок, 0 warning'ов
  ✅ Комментариев в коде нет
  ✅ Sidebar.tsx — 217 строк (лимит 300)

Исправленный баг:
  overflow-hidden на <aside> резал тултип по краю Sidebar. Убран;
  подпись режется сама через truncate + w-0. См. README O9.

Отклонения от этого файла: README.md раздел 8.1, O9 и O10.

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 3
═══════════════════════════════════════════════════════════════════════

После Этапа 2 у нас есть:
  • Работающий Layout с TitleBar, Sidebar, GlassPanel
  • Готовая навигация между 5 страницами через Zustand
  • Zustand persist для UI-состояния
  • NoiseOverlay и стилистическая база
  • Заглушки страниц, готовые к наполнению
  • Основа для дизайн-системы (Этап 3 — кнопки, карточки,
    тоглы, инпуты, модалки)

На Этапе 3 нужно будет создать полноценную дизайн-систему
(Button, Card, Toggle, Input, Badge, Modal, Skeleton, Tooltip,
Spinner) — все компоненты, которые будут использоваться
на всех страницах.

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 2 — СТОП.

Не начинай Этап 3. Не пиши код для Button, Card, Toggle
или любых других UI-компонентов, кроме тех, что указаны
в этом этапе (GlassPanel уже создан).

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 3
  • "Правка: ..." — правка в Этап 2
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.