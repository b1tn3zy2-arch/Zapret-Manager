═══════════════════════════════════════════════════════════════════════
ЭТАП 24: АДАПТИВНОСТЬ — ЛЮБЫЕ ЭКРАНЫ, ОКНА И DPI
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Сделать приложение по-настоящему адаптивным под ВСЕ возможные
конфигурации: от минимального окна 900×600 на старом ноутбуке
1366×768 с DPI 125% до ultrawide-монитора 5120×1440 с DPI 200%,
планшетов Windows и тач-устройств. Пользователь не должен видеть
ни обрезанного контента, ни размытых шрифтов, ни сломанных
сеток — ни при каком размере окна и DPI.

После этого этапа:
  • Окно любого размера (от 900×600 до 8K) — layout не ломается
  • Любой DPI (100%, 125%, 150%, 175%, 200%, 250%) — всё чёткое
  • Ultrawide (21:9, 32:9) — используется разумно, не растягивается
  • Планшеты Windows (Surface) — работает с тач-вводом
  • Мультимониторные конфигурации — перенос окна между экранами
    с разным DPI работает без перезапуска
  • Минимальное окно 900×600 — всё доступно через скролл,
    Sidebar сворачивается автоматически
  • Максимальное окно (развёрнуто на 4K) — контент центрируется,
    не растягивается на всю ширину
  • Zoom (Ctrl + / Ctrl -) — работает корректно
  • Все анимации плавные на любом размере

Это финальная полировка UX перед релизом. Без неё приложение
выглядит «сырым» на нестандартных конфигурациях.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Классификация размеров — 6 брейкпоинтов, а не 3 ]

ОБОСНУЙ:
  • Web-стандарт (sm/md/lg/xl) не подходит для десктоп-приложения
  • Окно может быть от 900×600 до 5120×1440 — это огромный диапазон
  • Нужны более точные брейкпоинты:

КЛАССИФИКАЦИЯ:
  • "xs" — окно < 1024px ширины (минимальное окно)
  • "sm" — 1024–1279px (ноутбук 1366×768 при DPI 125%)
  • "md" — 1280–1439px (стандартный ноутбук 1920×1080 при DPI 150%)
  • "lg" — 1440–1919px (Full HD при 100%)
  • "xl" — 1920–2559px (2K-монитор)
  • "2xl" — ≥ 2560px (4K, ultrawide)

ПОЧЕМУ ТАК:
  • 1024 — граница, где Sidebar мешает
  • 1280 — стандарт для 1080p при DPI 150%
  • 1440 — комфортный десктоп
  • 1920 — Full HD
  • 2560 — 4K и ultrawide

ПОЧЕМУ НЕ WEB-БРЕЙКПОИНТЫ:
  • 640/768 — не имеет смысла для десктоп-окна
  • В Tauri окно не может быть уже 900px (minWidth)

【 РЕШЕНИЕ 2: DPI-scaling — через Tauri API + CSS ]

ОБОСНУЙ:
  • Windows может масштабировать приложение (125%, 150%, 200%)
  • Если не обрабатывать — шрифты размытые, элементы мелкие
  • Tauri даёт window.scaleFactor() — текущий DPI
  • Использовать:
    - CSS: rem-единицы (1rem = 16px, масштабируется)
    - Tauri: физические пиксели для canvas (Этап 11)
    - Логика: определять DPI и менять плотность UI

РЕАЛИЗАЦИЯ:
  • useDpi() hook:
    - const scale = await getCurrentWindow().scaleFactor()
    - Отслеживание onScaleChanged через listen()
    - Возвращает { scale, tier: "normal" | "high" | "ultra" }
  • tier:
    - normal: 1.0–1.25
    - high: 1.25–1.75
    - ultra: > 1.75

ПОЧЕМУ ВАЖНО:
  • На Surface (DPI 200%) без обработки — всё микроскопическое
  • На старом мониторе (DPI 100%) — иначе нормально

【 РЕШЕНИЕ 3: Плотность UI — три режима + авто ]

ОБОСНУЙ:
  • Compact — для маленьких экранов (1024–1279px)
  • Normal — стандарт (1280–1919px)
  • Comfy — для больших (≥1920px)
  • Auto — выбирать по размеру окна

РЕАЛИЗАЦИЯ:
  • data-density на <body>
  • CSS-переменные меняются:
    --spacing-row: 12px / 16px / 20px
    --font-size-base: 13px / 14px / 15px
    --padding-card: 12px / 16px / 24px
  • Компоненты используют переменные, не хардкод

ПОЧЕМУ ВАЖНО:
  • На 1024px Sidebar + контент не помещаются при Normal
  • На 4K всё выглядит мелко при Compact

【 РЕШЕНИЕ 4: Sidebar — auto-collapse при узком окне ]

ОБОСНУЙ:
  • При ширине < 1280px — Sidebar автоматически сворачивается
    в иконки (72px)
  • При < 1024px — Sidebar превращается в overlay (выезжает
    поверх контента по клику на гамбургер)
  • Пользователь может вручную развернуть (override)

РЕАЛИЗАЦИЯ:
  • useSidebarMode() hook:
    - "expanded" (> 1280px, не collapsed пользователем)
    - "collapsed" (1024–1280px или вручную)
    - "overlay" (< 1024px)
  • При resize — пересчёт автоматически
  • Ручное управление сохраняется в localStorage

ПОЧЕМУ OVERLAY НА МАЛЕНЬКИХ:
  • 240px Sidebar + 700px контент = мало места
  • Overlay даёт контенту всю ширину
  • Стандарт для VS Code, Slack

【 РЕШЕНИЕ 5: Сетки — auto-fit и minmax, не фиксированные ]

ОБОСНУЙ:
  • Не: grid-template-columns: repeat(3, 1fr)
  • Да: grid-template-columns: repeat(auto-fit,
    minmax(280px, 1fr))
  • Автоматически выбирает количество колонок по ширине
  • На 4K — 6 колонок
  • На 1024px — 2 колонки
  • Без медиа-запросов

ПРИМЕРЫ:
  • Strategies cards: minmax(280px, 1fr)
  • Logs rows: фиксированные колонки (90/60/80/1fr)
  • Settings sections: max-w-[900px] центр
  • Dashboard widgets: minmax(320px, 1fr)

ПОЧЕМУ ЛУЧШЕ МЕДИА-ЗАПРОСОВ:
  • Плавно адаптируется
  • Меньше кода
  • Не нужно думать про все брейкпоинты

【 РЕШЕНИЕ 6: Максимальная ширина контента — max-w для читаемости ]

ОБОСНУЙ:
  • На 4K-мониторе строка текста 3000px — нечитаемая
  • Ограничивать ширину контента:
    - Логи, карты, списки: max-w-[1600px]
    - Текстовые секции (Settings, About): max-w-[900px]
    - Hero/Dashboard: max-w-[1400px]
  • Центрировать с mx-auto

ПОЧЕМУ ВАЖНО:
  • Читаемость (оптимум 60–80 символов в строке)
  • Не растягивается на ultrawide
  • Стандарт для Linear, Notion, Vercel

【 РЕШЕНИЕ 7: Минимальный размер окна — 900×600 ]

ОБОСНУЙ:
  • Tauri позволяет задать minWidth/minHeight
  • 900×600 — разумный минимум:
    - Sidebar collapsed (72) + контент (828) — влезает
    - По высоте: TitleBar (36) + панель (80) + контент (484)
  • Меньше — UX ломается (нельзя показать карточку + детали)

РЕАЛИЗАЦИЯ:
  • tauri.conf.json:
    "minWidth": 900, "minHeight": 600
  • При попытке уменьшить — Windows не даёт
  • Все компоненты рассчитаны на 900px минимум

ПОЧЕМУ НЕ 800 ИЛИ 700:
  • 800 — карты уже не помещаются 2 в ряд
  • 700 — Sidebar + контент сливаются
  • 900 — комфортный минимум

【 РЕШЕНИЕ 8: Размытость на нестандартных DPI — devicePixelRatio ]

ОБОСНУЙ:
  • Windows масштабирует UI при DPI ≠ 100%
  • WebView2 может рендерить в физических или логических
    пикселях
  • На DPI 150% — контент может быть размытым
  • Решение:
    - CSS: использовать целочисленные размеры где возможно
    - Canvas: canvas.width = width × devicePixelRatio
    - Изображения: srcset с @2x, @3x

РЕАЛИЗАЦИЯ:
  • Утилита useDpr() → devicePixelRatio
  • Для canvas (Монитор) — умножать на DPR
  • Для изображений — использовать SVG (масштабируется)
  • Для границ (border 1px) — использовать
    outline + transform: scale на retina (трюк)

ПОЧЕМУ ВАЖНО:
  • Размытые шрифты = «дешёвое» приложение
  • Чёткость = премиум-ощущение

【 РЕШЕНИЕ 9: Тач-устройства — pointer events, а не mouse ]

ОБОСНУЙ:
  • Surface, планшеты Windows, тач-мониторы
  • Mouse-события (onMouseMove) не работают корректно
  • Использовать pointer events:
    - onPointerMove, onPointerDown, onPointerUp
  • Определять тип ввода через matchMedia("(pointer: coarse)")

ПРАВИЛА:
  • Если pointer: coarse → отключить:
    - 3D-tilt на картах (нет курсора)
    - Hover-эффекты (не работает)
    - Tooltips по hover (только tap)
  • Увеличить размер интерактивных элементов:
    - Кнопки: минимум 44×44px (Apple HIG)
    - Строки логов: 32px вместо 24px
  • Добавить ripple-эффект на кнопках для тач

ПОЧЕМУ ВАЖНО:
  • На Surface без этого — карты не работают
  • Приложение должно быть usable на тач

【 РЕШЕНИЕ 10: Ultrawide (21:9, 32:9) — специальная обработка ]

ОБОСНУЙ:
  • На 5120×1440 контент растягивается в тонкую полосу
  • Решения:
    - Dashboard: 2 колонки → 3 колонки (виджеты)
    - Strategies: 4 карты → 6 карт в ряд
    - Монитор: графики в ряд (In/Out + Ping сбоку)
    - Settings: nav + контент + превью (3 колонки)

РЕАЛИЗАЦИЯ:
  • Медиа-запрос для aspect-ratio > 2:
    @media (min-aspect-ratio: 2/1) { ... }
  • Или через JS: window.innerWidth / window.innerHeight > 2

ПОЧЕМУ ВАЖНО:
  • Ultrawide-мониторы популярны у геймеров
  • Без этого — приложение смотрится глупо

【 РЕШЕНИЕ 11: Мультимониторы — отслеживание смены экрана ]

ОБОСНУЙ:
  • Пользователь перетаскивает окно между мониторами с
    разным DPI
  • Windows меняет scaleFactor
  • Без обработки — UI ломается

РЕАЛИЗАЦИЯ:
  • Rust: on_window_event(ScaleFactorChanged) → emit
    "dpi-changed"
  • Frontend: listen("dpi-changed") → обновить useDpi
  • Пересчёт плотности UI, canvas, размеров

ПОЧЕМУ ВАЖНО:
  • Ноутбук + внешний монитор — стандарт
  • Без этого — перетаскивание ломает интерфейс

【 РЕШЕНИЕ 12: Zoom (Ctrl + / Ctrl -) — встроенная поддержка ]

ОБОСНУЙ:
  • Пользователи ожидают зум как в браузере
  • WebView2 поддерживает zoom
  • Реализация:
    - Rust: getCurrentWebview().setZoom(zoom)
    - Keyboard shortcuts: Ctrl+= / Ctrl+- / Ctrl+0
    - Сохранение в localStorage
  • Диапазон: 0.75–1.5

ПОЧЕМУ ВАЖНО:
  • Пользователь с плохим зрением хочет крупнее
  • Пользователь с 4K хочет мельче (больше информации)

【 РЕШЕНИЕ 13: Адаптивные шрифты — clamp() ]

ОБОСНУЙ:
  • Не фиксированные размеры (16px)
  • clamp(min, preferred, max):
    font-size: clamp(13px, 1vw + 10px, 16px)
  • На 1024px — 13px
  • На 1920px — 14–15px
  • На 4K — 16px

ПРИМЕРЫ:
  • H1: clamp(24px, 2vw + 16px, 36px)
  • H2: clamp(20px, 1.5vw + 14px, 28px)
  • Body: clamp(13px, 0.3vw + 12px, 15px)

ПОЧЕМУ ВАЖНО:
  • Не нужно менять вручную для каждого брейкпоинта
  • Плавно адаптируется
  • Читаемо на всех размерах

【 РЕШЕНИЕ 14: ResizeObserver вместо window.resize ]

ОБОСНУЙ:
  • Компоненты, зависящие от размера родителя
    (canvas Монитора, виртуализация логов)
  • window.resize не срабатывает при изменении родителя
  • ResizeObserver даёт точный размер элемента
  • Cleanup обязателен

ПРИМЕНЕНИЕ:
  • TrafficCanvas — перерисовка при resize
  • LogList — пересчёт виртуализации
  • PingSparkline — пересчёт SVG
  • StrategyGameCard — пересчёт tilt-области

ПОЧЕМУ ВАЖНО:
  • Без этого canvas будет размытым при resize
  • Виртуализация сломается

【 РЕШЕНИЕ 15: Skeleton при resize — не мигаем ]

ОБОСНУЙ:
  • При resize не должно быть «мигания» контента
  • Skeleton только при загрузке данных, не при resize
  • Использовать useMemo для вычисляемых размеров
  • Не пересоздавать компоненты при resize

РЕАЛИЗАЦИЯ:
  • Ключи (key) не меняются при resize
  • CSS-переходы для плавного изменения
  • Никаких условных рендеров «loading» при resize

ПОЧЕМУ ВАЖНО:
  • Мигание = «дешёвое» приложение

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/ОБНОВИТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src/hooks/useBreakpoint.ts (создать) 】
Назначение: определение текущего брейкпоинта.

Сигнатура:
  • useBreakpoint(): "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

Логика:
  • useSyncExternalStore с resize listener
  • Или ResizeObserver на document.body
  • Кэшировать значение
  • Debounce 100ms (не пересчитывать на каждый пиксель)

Требования:
  • Не ре-рендерить компонент, если breakpoint не изменился
  • Возвращает конкретный union-type

【 2. src/hooks/useDpi.ts (создать) 】
Назначение: определение DPI и scale factor.

Сигнатура:
  • useDpi(): {
      scale: number,
      tier: "normal" | "high" | "ultra",
      dpr: number
    }

Логика:
  • На mount: const scale = await getCurrentWindow()
    .scaleFactor()
  • Подписка на "dpi-changed" от Rust
  • Возврат tier по scale

Требования:
  • Async-safe (не падать, если API недоступно)
  • Cleanup

【 3. src/hooks/useDensity.ts (создать) 】
Назначение: управление плотностью UI.

Сигнатура:
  • useDensity(): {
      density: "compact" | "normal" | "comfy",
      setDensity: (d) => void,
      isAuto: boolean
    }

Логика:
  • Если settings.appearance.density === "auto":
    - Авто по breakpoint: xs/sm → compact, md/lg → normal,
      xl/2xl → comfy
  • Иначе — из settings
  • Применяет data-density на <body> через useEffect
  • setDensity обновляет settings

【 4. src/hooks/useSidebarMode.ts (создать) 】
Назначение: режим Sidebar.

Сигнатура:
  • useSidebarMode(): {
      mode: "expanded" | "collapsed" | "overlay",
      isOverlayOpen: boolean,
      openOverlay: () => void,
      closeOverlay: () => void,
      toggleCollapsed: () => void
    }

Логика:
  • mode вычисляется из breakpoint + пользовательское
    предпочтение
  • overlay: отдельное состояние (открыт/закрыт)
  • При переходе с overlay на expanded → закрыть overlay
  • Persist предпочтения

【 5. src/hooks/usePointerType.ts (создать) 】
Назначение: определение типа ввода.

Сигнатура:
  • usePointerType(): "mouse" | "touch" | "pen"

Логика:
  • matchMedia("(pointer: coarse)") → touch
  • matchMedia("(pointer: fine)") → mouse
  • matchMedia("(any-pointer: pen)") → pen
  • Подписка на изменения

Использование:
  • Отключать hover-эффекты, tilt
  • Увеличивать touch-targets

【 6. src/hooks/useResizeObserver.ts (создать) 】
Назначение: наблюдение за размером элемента.

Сигнатура:
  • useResizeObserver<T extends HTMLElement>():
    [ref: RefObject<T>, size: { width, height }]

Логика:
  • useRef на элемент
  • ResizeObserver в useEffect
  • Cleanup disconnect
  • Throttle через requestAnimationFrame

【 7. src/hooks/useResponsiveValue.ts (создать) 】
Назначение: выбор значения по breakpoint.

Сигнатура:
  • useResponsiveValue<T>(values: Partial<Record<
    Breakpoint, T>> & { default: T }): T

Пример:
  const cols = useResponsiveValue({
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    "2xl": 6,
  });

Логика:
  • useBreakpoint → текущий
  • Найти ближайшее значение ≤ текущего

【 8. src/lib/breakpoints.ts (создать) 】
Назначение: константы брейкпоинтов + утилиты.

Содержит:
  • BREAKPOINTS: { xs: 0, sm: 1024, md: 1280, lg: 1440,
    xl: 1920, "2xl": 2560 }
  • getBreakpoint(width: number): Breakpoint
  • isBreakpointAtLeast(a: Breakpoint, b: Breakpoint): boolean
  • BREAKPOINT_ORDER: Breakpoint[]

【 9. src/lib/responsiveUtils.ts (создать) 】
Назначение: утилиты для адаптива.

Функции:
  • getGridCols(breakpoint, itemType): number
  • getMaxContentWidth(breakpoint, contentType): number
  • getSpacing(breakpoint): { sm, md, lg }
  • getFontSize(breakpoint, level): string (clamp)
  • computeDensity(breakpoint): Density

【 10. src/styles/globals.css (обновить) 】
Добавить:
  • CSS-переменные для плотностей:
    [data-density="compact"] {
      --spacing-row: 8px;
      --spacing-card: 12px;
      --font-size-base: 13px;
      --row-height: 24px;
      --padding-section: 16px;
    }
    [data-density="normal"] {
      --spacing-row: 12px;
      --spacing-card: 16px;
      --font-size-base: 14px;
      --row-height: 28px;
      --padding-section: 24px;
    }
    [data-density="comfy"] {
      --spacing-row: 16px;
      --spacing-card: 24px;
      --font-size-base: 15px;
      --row-height: 32px;
      --padding-section: 32px;
    }

  • Адаптивные шрифты через clamp():
    h1 { font-size: clamp(24px, 2vw + 16px, 36px); }
    h2 { font-size: clamp(20px, 1.5vw + 14px, 28px); }
    h3 { font-size: clamp(16px, 1vw + 12px, 20px); }
    body { font-size: var(--font-size-base); }

  • Ultrawide медиа-запросы:
    @media (min-aspect-ratio: 2/1) {
      .ultrawide-grid { grid-template-columns: repeat(3, 1fr); }
    }

  • Touch-устройства:
    @media (pointer: coarse) {
      button { min-height: 44px; min-width: 44px; }
      .no-touch-hover:hover { background: transparent; }
    }

【 11. src/components/layout/Layout.tsx (обновить) 】
Дополнить:
  • Использовать useSidebarMode
  • Overlay для Sidebar при < 1024px
  • Backdrop при открытом overlay
  • Плавные переходы между режимами
  • max-w-[1600px] mx-auto для main content

【 12. src/components/layout/Sidebar.tsx (обновить) 】
Дополнить:
  • Три режима: expanded / collapsed / overlay
  • При overlay — position: fixed, slide-in animation
  • Гамбургер в TitleBar при overlay
  • Закрытие по клику на backdrop или Escape
  • Уважение к usePointerType (для тач — крупнее)

【 13. src/components/layout/TitleBar.tsx (обновить) 】
Дополнить:
  • Гамбургер-кнопка (Menu) при overlay-режиме Sidebar
  • Уменьшение названия при узком окне (только логотип)
  • Скрытие бейджа режима при ширине < 1100px

【 14. src/components/dashboard/Dashboard.tsx (обновить) 】
Дополнить:
  • useResponsiveValue для колонок:
    - xs: 1 колонка
    - sm/md: 2 колонки
    - lg/xl: 2 колонки (Hero широкий)
    - 2xl: 3 колонки
  • Ultrawide: Hero + 2 виджета справа

【 15. src/components/dashboard/DashboardStats.tsx (обновить) 】
Дополнить:
  • Grid: auto-fit minmax(180px, 1fr)
  • Compact на xs — 2 колонки

【 16. src/components/strategies/game/StrategyGameCard.tsx (обновить) 】
Дополнить:
  • Отключать tilt при pointer: coarse
  • Размер карты адаптивный:
    - xs: 240×340
    - md: 280×400
    - xl: 320×460
  • На тач — ripple-эффект при tap

【 17. src/pages/Strategies.tsx (обновить) 】
Дополнить:
  • Grid: repeat(auto-fit, minmax(var(--card-min-width), 1fr))
  • --card-min-width: 240/280/320px по брейкпоинту
  • Панель фильтров: wrap при узком окне
  • Скролл фильтров горизонтальный на xs

【 18. src/pages/Logs.tsx (обновить) 】
Дополнить:
  • Высота строки: 24/28/32px по плотности
  • Скрывать колонки Source/Level при xs (показывать
    только message)
  • Панель фильтров: стекается вертикально на xs
  • Кнопки «Экспорт», «Очистить» — иконки без текста на xs

【 19. src/pages/Settings.tsx (обновить) 】
Дополнить:
  • Nav: слева (≥1024px) / горизонтальные табы (<1024px)
  • Контент: max-w-[900px]
  • На ultrawide: nav + контент + превью (3 колонки)
  • SettingRow: label + control стекаются на xs

【 20. src/pages/Monitor.tsx (обновить) 】
Дополнить:
  • Графики In/Out:
    - xs: вертикально
    - md+: горизонтально
    - ultrawide: рядом + пинг сбоку
  • PingMonitor: 2 колонки на xs, 4 на lg
  • Canvas: ResizeObserver для перерисовки

【 21. src/components/monitor/TrafficChart.tsx (обновить) 】
Дополнить:
  • ResizeObserver для canvas
  • canvas.width = cssWidth × devicePixelRatio
  • ctx.scale(dpr, dpr) для чёткости
  • Высота графика адаптивная: 100/120/160px

【 22. src/components/logs/LogRow.tsx (обновить) 】
Дополнить:
  • Высота из CSS-переменной --row-height
  • На xs — скрывать source и level (показывать в tooltip)
  • Touch-target ≥ 32px

【 23. src/components/ui/Button.tsx (обновить) 】
Дополнить:
  • На pointer: coarse — min-height 44px
  • Ripple-эффект для тач
  • Отключать whileTap: scale на тач (использовать opacity)

【 24. src/components/ui/Modal.tsx (обновить) 】
Дополнить:
  • Размер адаптивный: max-w-[90vw] + max-h-[90vh]
  • На xs — fullscreen modal
  • Padding адаптивный

【 25. src/components/ui/Tooltip.tsx (обновить) 】
Дополнить:
  • На pointer: coarse — не показывать (только tap)
  • Или показывать по долгому тапу

【 26. src-tauri/src/lib.rs (обновить) 】
Дополнить:
  • on_window_event для ScaleFactorChanged:
    .on_window_event(|window, event| match event {
      WindowEvent::ScaleFactorChanged { scale_factor, .. } => {
        window.emit("dpi-changed", scale_factor).ok();
      }
      _ => {}
    })

【 27. src-tauri/src/commands/window.rs (создать) 】
Назначение: управление окном.

Команды:
  • set_zoom(zoom: f64) -> Result<(), AppError>
    - getCurrentWebview().setZoom(zoom)
  • get_zoom() -> Result<f64, AppError>
  • set_min_size(width: u32, height: u32) -> Result<(),
    AppError>
  • get_current_monitor_info() -> Result<MonitorInfo,
    AppError>
    - Возвращает: width, height, scaleFactor, name
    - Для отладки DPI-проблем

【 28. src/hooks/useZoom.ts (создать) 】
Назначение: управление зумом.

Сигнатура:
  • useZoom(): {
      zoom: number,
      setZoom: (z) => void,
      zoomIn: () => void,
      zoomOut: () => void,
      reset: () => void
    }

Логика:
  • Диапазон 0.75–1.5, шаг 0.1
  • Keyboard shortcuts: Ctrl+= / Ctrl+- / Ctrl+0
  • Persist в localStorage
  • Apply через invoke set_zoom

【 29. src/lib/constants.ts (обновить) 】
Добавить:
  • BREAKPOINTS
  • DENSITY_MAP: { xs: "compact", sm: "compact",
    md: "normal", lg: "normal", xl: "comfy", "2xl": "comfy" }
  • MIN_WINDOW_SIZE = { width: 900, height: 600 }
  • MAX_CONTENT_WIDTH = { settings: 900, dashboard: 1400,
    strategies: 1600, logs: 2000 }
  • ZOOM_RANGE = { min: 0.75, max: 1.5, step: 0.1,
    default: 1.0 }

【 30. src-tauri/tauri.conf.json (обновить) 】
Дополнить:
  • minWidth: 900
  • minHeight: 600
  • resizable: true
  • maximizable: true
  • fullscreen: false (не нужен)
  • zoomHotkeysEnabled: true (встроенная поддержка)

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создать breakpoints.ts
  • BREAKPOINTS, getBreakpoint, BREAKPOINT_ORDER

ШАГ 2: Создать responsiveUtils.ts
  • Утилиты для сеток, размеров, отступов

ШАГ 3: Создать useBreakpoint
  • useSyncExternalStore + resize listener
  • Debounce 100ms

ШАГ 4: Создать useDpi
  • invoke scaleFactor + listen dpi-changed

ШАГ 5: Создать useDensity
  • settings + breakpoint → density
  • Применение data-density

ШАГ 6: Создать useSidebarMode
  • expanded / collapsed / overlay
  • Overlay state

ШАГ 7: Создать usePointerType
  • matchMedia

ШАГ 8: Создать useResizeObserver
  • ResizeObserver + rAF

ШАГ 9: Создать useResponsiveValue
  • Выбор по breakpoint

ШАГ 10: Создать useZoom
  • Zoom + shortcuts + persist

ШАГ 11: Обновить globals.css
  • CSS-переменные плотностей
  • clamp() шрифты
  • Ultrawide медиа-запросы
  • Touch медиа-запросы

ШАГ 12: Обновить Layout
  • useSidebarMode + overlay + backdrop

ШАГ 13: Обновить Sidebar
  • 3 режима + slide-in для overlay

ШАГ 14: Обновить TitleBar
  • Гамбургер при overlay
  • Адаптивное название

ШАГ 15: Обновить Dashboard
  • useResponsiveValue для колонок

ШАГ 16: Обновить DashboardStats
  • auto-fit minmax

ШАГ 17: Обновить StrategyGameCard
  • Отключение tilt на тач
  • Адаптивный размер

ШАГ 18: Обновить Strategies.tsx
  • auto-fit grid
  • Wrap фильтров

ШАГ 19: Обновить Logs.tsx
  • Адаптивные колонки
  • Скрытие на xs

ШАГ 20: Обновить Settings.tsx
  • Nav → табы на xs

ШАГ 21: Обновить Monitor.tsx
  • Адаптивные графики

ШАГ 22: Обновить TrafficChart
  • ResizeObserver + DPR

ШАГ 23: Обновить LogRow
  • CSS-переменная высоты
  • Touch-target

ШАГ 24: Обновить Button
  • Touch min-height
  • Ripple

ШАГ 25: Обновить Modal
  • Fullscreen на xs

ШАГ 26: Обновить Tooltip
  • Не показывать на тач

ШАГ 27: Создать window.rs
  • set_zoom, get_zoom, get_current_monitor_info

ШАГ 28: Обновить lib.rs
  • on_window_event(ScaleFactorChanged)

ШАГ 29: Обновить tauri.conf.json
  • minWidth, minHeight, zoomHotkeysEnabled

ШАГ 30: Финальная проверка
  • Тесты на разных размерах окна
  • Тесты на разных DPI
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 BREAKPOINTS 】
  □ 6 брейкпоинтов (xs–2xl)
  □ useBreakpoint работает
  □ Не ре-рендерит при неизменном breakpoint

【 DPI 】
  □ useDpi работает
  □ Определяет normal / high / ultra
  □ Отслеживает смену DPI через Rust event
  □ Canvas использует DPR

【 DENSITY 】
  □ 3 плотности + auto
  □ data-density применяется к body
  □ CSS-переменные меняются
  □ Переключение мгновенное

【 SIDEBAR 】
  □ 3 режима: expanded / collapsed / overlay
  □ Auto-collapse при < 1280px
  □ Overlay при < 1024px
  □ Гамбургер в TitleBar для overlay
  □ Escape закрывает overlay
  □ Backdrop кликабелен

【 GRID 】
  □ auto-fit minmax везде
  □ Нет фиксированных колонок
  □ 6 колонок на 4K, 2 на 1024px

【 MAX-WIDTH 】
  □ Settings max-w-[900px]
  □ Dashboard max-w-[1400px]
  □ Strategies max-w-[1600px]
  □ Logs max-w-[2000px]
  □ mx-auto для центрирования

【 MIN WINDOW 】
  □ minWidth 900, minHeight 600
  □ Windows не даёт уменьшить
  □ Всё доступно при 900×600

【 DPI ЧЁТКОСТЬ 】
  □ Canvas: width × DPR
  □ ctx.scale(DPR, DPR)
  □ Шрифты не размытые на 150%
  □ Border 1px не «толстый» на retina

【 TOUCH 】
  □ onPointer вместо onMouse
  □ Tilt отключён при pointer: coarse
  □ Кнопки ≥ 44×44px
  □ Tooltip не по hover
  □ Ripple на тач

【 ULTRAWIDE 】
  □ aspect-ratio > 2 → 3 колонки в Dashboard
  □ 6 карт Strategies
  □ Графики рядом в Мониторе

【 МУЛЬТИМОНИТОР 】
  □ Перетаскивание между мониторами не ломает UI
  □ DPI пересчитывается автоматически
  □ Canvas перерисовывается

【 ZOOM 】
  □ Ctrl+= / Ctrl+- / Ctrl+0
  □ Диапазон 0.75–1.5
  □ Persist в localStorage

【 FONTS 】
  □ clamp() для h1/h2/h3
  □ CSS-переменная --font-size-base
  □ Читаемость на всех размерах

【 RESIZE OBSERVER 】
  □ TrafficChart
  □ LogList
  □ PingSparkline
  □ Cleanup disconnect

【 NO FLICKER 】
  □ При resize — нет мигания
  □ Ключи (key) не меняются
  □ Skeleton только при загрузке данных

【 UX 】
  □ Пользователь не видит обрезанного контента
  □ Все действия доступны на любом размере
  □ Анимации плавные
  □ Нет горизонтального overflow

【 CODE QUALITY 】
  □ Нет мёртвого кода
  □ Нет console.log
  □ Функции <50 строк
  □ Файлы <300 строк
  □ Комментарии на русском

【 BUILD 】
  □ pnpm tauri dev — запускается
  □ pnpm tsc --noEmit — 0 ошибок
  □ cargo check — 0 warning'ов
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: useBreakpoint ре-рендерит всё приложение
  ПРИЧИНА: контекст + без мемоизации.
  ЧТО ПРОВЕРИТЬ: использовать useSyncExternalStore с
    подпиской только на изменение breakpoint, не на каждый
    resize.

ГИПОТЕЗА 2: DPI не пересчитывается при перетаскивании
  ПРИЧИНА: Rust event не emit'ится.
  ЧТО ПРОВЕРИТЬ: on_window_event(ScaleFactorChanged)
    → window.emit("dpi-changed").

ГИПОТЕЗА 3: Canvas размытый на DPI 150%
  ПРИЧИНА: canvas.width = cssWidth без × DPR.
  ЧТО ПРОВЕРИТЬ: canvas.width = width * devicePixelRatio.
    ctx.scale(DPR, DPR).

ГИПОТЕЗА 4: Sidebar overlay не закрывается по Escape
  ПРИЧИНА: нет keydown listener.
  ЧТО ПРОВЕРИТЬ: useEffect с keydown + cleanup.

ГИПОТЕЗА 5: Tilt работает на Surface
  ПРИЧИНА: usePointerType не подключён к StrategyGameCard.
  ЧТО ПРОВЕРИТЬ: disabled={pointerType !== "mouse"}.

ГИПОТЕЗА 6: Zoom ломает layout
  ПРИЧИНА: zoom через transform: scale ломает fixed
    элементы.
  ЧТО ПРОВЕРИТЬ: использовать WebView2 setZoom (это
    нативный zoom, не CSS).

ГИПОТЕЗА 7: При resize логи мигают
  ПРИЧИНА: key меняется.
  ЧТО ПРОВЕРИТЬ: key={log.id} (не index, не размер).

ГИПОТЕЗА 8: На 4K всё мелкое
  ПРИЧИНА: density = normal, не comfy.
  ЧТО ПРОВЕРИТЬ: автоопределение density по breakpoint.

ГИПОТЕЗА 9: Font clamp() даёт неправильные размеры
  ПРИЧИНА: vw в clamp для десктопа работает не так, как
    ожидается.
  ЧТО ПРОВЕРИТЬ: clamp(13px, 0.3vw + 12px, 15px) — vw
    относительно viewport ширины, а не окна Tauri.

РЕШЕНИЕ: использовать container queries или
  медиа-запросы вместо vw для Tauri.

ГИПОТЕЗА 10: Ultrawide media query не работает
  ПРИЧИНА: min-aspect-ratio не поддерживается WebView2.
  ЧТО ПРОВЕРИТЬ: использовать JS-определение через
    window.innerWidth / window.innerHeight.

ГИПОТЕЗА 11: minWidth 900 не соблюдается
  ПРИЧИНА: tauri.conf.json не применён.
  ЧТО ПРОВЕРИТЬ: перезапуск после изменения config.

ГИПОТЕЗА 12: Overlay Sidebar не блокирует клики под ним
  ПРИЧИНА: z-index или pointer-events.
  ЧТО ПРОВЕРИТЬ: backdrop с pointer-events: auto и
    высоким z-index.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev

2. Проверить минимальное окно:
   • Уменьшить окно до минимума (900×600)
   ОЖИДАНИЕ:
   • Окно не уменьшается меньше
   • Sidebar → overlay
   • Гамбургер в TitleBar
   • Контент не обрезан
   • Нет горизонтального скролла

3. Открыть Sidebar (клик на гамбургер)
   ОЖИДАНИЕ:
   • Sidebar выезжает слева
   • Backdrop затемняет контент
   • Клик по backdrop — закрывает
   • Escape — закрывает

4. Увеличить окно до 1280×720
   ОЖИДАНИЕ:
   • Sidebar → collapsed (иконки)
   • Больше места для контента

5. Увеличить до 1440×900
   ОЖИДАНИЕ:
   • Sidebar → expanded
   • Dashboard: 2 колонки

6. Увеличить до 1920×1080
   ОЖИДАНИЕ:
   • Dashboard: 2 колонки, виджеты шире
   • Strategies: 4 карты в ряд
   • Logs: все колонки видны

7. Увеличить до 2560×1440 (если монитор позволяет)
   ОЖИДАНИЕ:
   • Dashboard: 3 колонки
   • Strategies: 5–6 карт
   • Монитор: графики рядом

8. Ultrawide (если есть):
   • 3440×1440 или 5120×1440
   ОЖИДАНИЕ:
   • Aspect ratio > 2 → 3 колонки
   • Контент не растягивается на всю ширину
   • max-w работает

9. Тест DPI:
   • Закрыть приложение
   • ПКМ на .exe → Свойства → Совместимость →
     Изменить параметры DPI
   • Установить «Переопределить масштабирование»
     → 150%
   • Запустить
   ОЖИДАНИЕ:
   • UI не размытый
   • Canvas чёткий
   • Шрифты правильные

10. Тест смены DPI:
    • Перетащить окно между мониторами с разным DPI
    ОЖИДАНИЕ:
    • UI пересчитывается
    • Не нужно перезапускать

11. Тест zoom:
    • Ctrl+= → увеличить
    • Ctrl+- → уменьшить
    • Ctrl+0 → сбросить
    ОЖИДАНИЕ:
    • Работает
    • Persist после перезапуска

12. Тест touch (если Surface):
    • Открыть Strategies
    ОЖИДАНИЕ:
    • Tilt отключён
    • Карты реагируют на tap
    • Кнопки ≥ 44px
    • Ripple-эффект

13. Тест плотности:
    • Settings → Внешний вид → Плотность
    • Compact / Normal / Comfy
    ОЖИДАНИЕ:
    • Row height меняется
    • Padding меняется
    • Font size меняется

14. Тест resize canvas:
    • Открыть Монитор
    • Изменить размер окна
    ОЖИДАНИЕ:
    • Canvas перерисовывается
    • Не размытый
    • График не «прыгает»

15. Проверить отсутствие flicker:
    • Открыть Logs с потоком логов
    • Изменить размер окна
    ОЖИДАНИЕ:
    • Нет мигания
    • Логи не перезагружаются

16. Проверить max-width:
    • Развернуть окно на 4K
    ОЖИДАНИЕ:
    • Settings: контент max 900px по центру
    • Dashboard: max 1400px
    • Не растягивается на 3000px

17. Проверить auto-fit сетки:
    • Strategies на разных размерах
    ОЖИДАНИЕ:
    • 1 / 2 / 3 / 4 / 5 / 6 карт по ширине
    • Плавно, без медиа-запросов

18. Открыть DevTools → Elements
    • Проверить body[data-density]
    • Проверить CSS-переменные
    ОЖИДАНИЕ: всё применяется

19. Проверить на маленьком ноутбуке
    (или с эмуляцией):
    • 1366×768, DPI 125%
    ОЖИДАНИЕ:
    • UI читаем
    • Sidebar collapsed
    • Всё доступно

20. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

21. cargo check
    ОЖИДАНИЕ: 0 warning'ов

22. Открыть Performance → resize
    ОЖИДАНИЕ:
    • 60 FPS при resize
    • Нет long tasks

23. Task Manager → RAM
    ОЖИДАНИЕ: <350 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать any
❌ Не использовать фиксированные колонки в grid (только
   auto-fit minmax)
❌ Не использовать onMouseMove (только onPointerMove)
❌ Не забывать DPR для canvas
❌ Не забывать cleanup ResizeObserver
❌ Не забывать cleanup resize listeners
❌ Не использовать vw для font-size в Tauri
❌ Не забывать minWidth/minHeight в tauri.conf.json
❌ Не забывать про overlay Sidebar при < 1024px
❌ Не забывать про Escape для overlay
❌ Не забывать про pointer: coarse
❌ Не забывать про ultrawide
❌ Не забывать про max-width контента
❌ Не забывать про плотности
❌ Не менять key компонентов при resize
❌ Не использовать CSS transform: scale для zoom
❌ Не начинать Этап 17 без подтверждения

