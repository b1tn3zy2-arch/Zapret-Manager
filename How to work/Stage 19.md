# ЭТАП 19: АДАПТИВНОСТЬ — РАЗМЕРЫ, DPI, МУЛЬТИМОНИТОР

═══════════════════════════════════════════════════════════════════════
ЭТАП 19: АДАПТИВНОСТЬ — РАЗМЕРЫ, DPI, МУЛЬТИМОНИТОР
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Обеспечить безупречную работу приложения на всём спектре
разрешений, масштабов системы и конфигураций мониторов:
от 1280×720 на старых ноутбуках до 4K на больших мониторах,
при DPI scaling от 100% до 200%, при работе с несколькими
мониторами с разными DPI, в оконном, развёрнутом и
полноэкранном режимах, при соотношениях сторон 16:9, 16:10,
21:9 и 4:3. Ни один элемент интерфейса не должен «плыть»,
обрезаться, терять пропорции или становиться
нечитаемым. Сетки карт и списки должны перестраиваться
плавно, без «прыжков», а переход между мониторами не должен
требовать перезапуска приложения.

После этого этапа пользователь сможет:
  • Запустить приложение на ноутбуке 1366×768 — всё
    помещается, ничего не обрезается
  • Развернуть окно на 4K-мониторе — интерфейс читается,
    элементы не «микроскопические»
  • Изменить системный DPI на 150% — UI масштабируется
    корректно, шрифты остаются чёткими
  • Перетащить окно с монитора 100% DPI на монитор 200% DPI —
    окно пересчитывает масштаб без артефактов
  • Работать в узком окне (800×600) — сайдбар сворачивается,
    сетка карт становится 1-колоночной
  • Работать в полноэкранном режиме (F11) — статусбар и
    заголовок ведут себя корректно
  • Видеть консистентный интерфейс на всех конфигурациях

Это финальный этап перед оптимизацией. После него приложение
готово работать на «любом» Windows-компьютере.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: CSS clamp() для типографики вместо фиксированных px 】

ОБОСНУЙ:
  • Шрифты фиксированного размера (16px) выглядят крошечно
    на 4K и раздуто на 1366×768
  • `clamp(min, preferred, max)` — «жидкая» типографика
  • Пример: `font-size: clamp(14px, 0.9rem + 0.2vw, 18px)`
    → 14px на узких экранах, 18px на широких, между —
    плавный переход
  • Работает без JS, без медиазапросов
  • Плавно при resize окна

ПОЧЕМУ НЕ МЕДИАЗАПРОСЫ ДЛЯ ШРИФТОВ:
  • Резкие скачки на границах (16px → 18px)
  • Много кода для каждой комбинации
  • clamp() — одна строка

ПОЧЕМУ НЕ REM С JS-ФИКСАЦИЕЙ:
  • JS-пересчёт при resize — нагрузка
  • Нет плавности без requestAnimationFrame
  • clamp() нативно

ПРИМЕНЕНИЕ В globals.css:
  • --font-size-base: clamp(0.875rem, 0.8rem + 0.3vw, 1rem)
  • --font-size-h1: clamp(1.5rem, 1.2rem + 1.2vw, 2.5rem)
  • И так далее

【 РЕШЕНИЕ 2: Container queries вместо media queries для компонентов 】

ОБОСНУЙ:
  • Media queries смотрят на размер окна, не на размер
    контейнера
  • Компонент в узком контейнере (например, карточка в
    сайдбаре) должен адаптироваться к контейнеру, а не
    к окну
  • Container queries (`@container`) — современный стандарт
  • Поддержка в WebView2 (Chromium 105+)
  • Пример:
    ```css
    .card-container { container-type: inline-size; }
    @container (max-width: 300px) {
      .card { flex-direction: column; }
    }
    ```

ПОЧЕМУ НЕ MEDIA QUERIES:
  • Не работают для компонентного подхода
  • Нужно знать контекст, в котором компонент находится
  • Хрупко при рефакторинге

ПОЧЕМУ НЕ РЕЗИНОВАЯ ВЁРСТКА БЕЗ QUERIES:
  • Не всегда достаточно
  • Иногда компонент должен перестраиваться кардинально

ПРИМЕНЕНИЕ:
  • StrategyGameCard — адаптация под 1/2/3/4 колонки
  • LogRow — скрытие колонок на узких
  • Dashboard widgets — переключение layout

【 РЕШЕНИЕ 3: CSS-переменные для отступов и радиусов с clamp() 】

ОБОСНУЙ:
  • padding 24px на 1366×768 — комфортно
  • padding 24px на 4K — слишком мало
  • padding 48px на 1366×768 — съедает контент
  • Решение: `--padding-lg: clamp(16px, 1.5vw, 32px)`
  • Все отступы — через переменные

ПЕРЕМЕННЫЕ:
  • --space-xs: clamp(4px, 0.5vw, 8px)
  • --space-sm: clamp(8px, 0.8vw, 12px)
  • --space-md: clamp(12px, 1vw, 16px)
  • --space-lg: clamp(16px, 1.5vw, 24px)
  • --space-xl: clamp(24px, 2vw, 48px)
  • --radius-md: clamp(6px, 0.5vw, 10px)
  • --radius-lg: clamp(10px, 0.8vw, 16px)

ПОЧЕМУ НЕ ФИКСИРОВАННЫЕ:
  • Один размер не работает для всех разрешений
  • Скачки на границах media queries

ПОЧЕМУ НЕ БОЛЬШИЕ ПЕРЕМЕННЫЕ ДЛЯ КАЖДОГО РАЗМЕРА:
  • 20+ переменных → сложно
  • clamp() с vw решает задачу

【 РЕШЕНИЕ 4: Grid с auto-fill / auto-fit для карт стратегий 】

ОБОСНУЙ:
  • На 4K хочется 5–6 карт в ряд
  • На 1366×768 — 3 карты в ряд
  • На 800×600 — 1 карта
  • Решение:
    ```css
    grid-template-columns: repeat(
      auto-fill,
      minmax(clamp(200px, 20vw, 320px), 1fr)
    );
    ```
  • Автоматическое количество колонок без JS
  • minmax() задаёт диапазон ширины карты

ПОЧЕМУ НЕ ФИКСИРОВАННОЕ ЧИСЛО КОЛОНОК:
  • При resize — пустое место или обрезка
  • Нужно много media queries

ПОЧЕМУ auto-fill (не auto-fit):
  • auto-fill сохраняет пустые колонки (лучше для
    визуальной сетки)
  • auto-fit растягивает последнюю колонку
  • Для карт — auto-fill

【 РЕШЕНИЕ 5: Обработка DPI scaling через Tauri window API 】

ОБОСНУЙ:
  • Windows позволяет пользователю устанавливать DPI
    scaling (100%, 125%, 150%, 175%, 200%)
  • Tauri WebView автоматически масштабирует (devicePixelRatio)
  • Но:
    - Некоторые браузерные API дают неправильные размеры
    - Иконки в трее нужны разных размеров
    - Окно с фиксированными px может «плыть»
  • Решение:
    - Все размеры — через rem/em (относительные)
    - Иконки — SVG (векторные, масштабируются)
    - Растровые иконки — только для tray (16/32 PNG)
  • При смене DPI (перетаскивание окна) — пересчёт
    через `window.devicePixelRatio`

ОТСЛЕЖИВАНИЕ DPI:
  • Rust: получить текущий monitor для окна
  • Frontend: `window.devicePixelRatio` + подписка на
    `tauri://scale-factor-changed`

ПОЧЕМУ НЕ ФИКСИРОВАННЫЕ px:
  • На 150% DPI все элементы будут крошечными
  • Нужно умножать вручную

ПОЧЕМУ НЕ browser zoom:
  • Не контролируется приложением
  • Пользователь может случайно изменить

【 РЕШЕНИЕ 6: Отслеживание перетаскивания окна между мониторами 】

ОБОСНУЙ:
  • При перетаскивании окна на другой монитор:
    - Меняется DPI (если у мониторов разный scaling)
    - Меняется размер (физический)
    - Меняется максимальный размер
  • Tauri emit'ит событие `tauri://scale-factor-changed`
  • Frontend пересчитывает layout автоматически (CSS
    реагирует на размер окна)
  • Rust: обновить иконку трея под новый DPI

РЕАЛИЗАЦИЯ:
  • В TitleBar — подписка на событие
  • При смене — emit "dpi-changed" в frontend
  • Компоненты, зависящие от DPI, пересчитываются

ПОЧЕМУ ВАЖНО:
  • Пользователи с двумя мониторами (ноутбук + внешний)
    часто меняют DPI
  • Без обработки — UI «ломается» при перетаскивании

【 РЕШЕНИЕ 7: Минимальный размер окна — 800×600 ]

ОБОСНУЙ:
  • Очень маленькое окно → всё ломается
  • Ниже 800×600 — не имеет смысла для приложения
  • Установлено в tauri.conf.json: minWidth: 800, minHeight: 600
  • Но 800×600 — это крайний случай:
    - Sidebar → collapsed (72px)
    - Сетка карт → 1 колонка
    - Dashboard → столбиком
  • Пользователь может работать, но некомфортно

ПОЧЕМУ НЕ 1024×768 (стандарт 2000-х):
  • Некоторые нетбуки 1366×768 (реально 1280×720 при
    масштабировании)
  • 800×600 — крайний минимум

ПОЧЕМУ НЕ 640×480:
  • Не имеет смысла
  • Лучше не запускать

【 РЕШЕНИЕ 8: Адаптив Sidebar — 4 состояния ]

ОБОСНУЙ:
  • Sidebar должен адаптироваться к ширине окна:
    - \> 1440px: expanded 240px
    - 1024–1440px: expanded 240px (с auto-collapse?)
    - 800–1024px: collapsed 72px (автоматически)
    - < 800px: не поддерживаем (min 800)
  • Авто-переключение при resize
  • Пользователь может переопределить вручную (toggle)
  • Состояние сохраняется в сторе

ЛОГИКА:
  • useEffect на window.resize (throttle 100ms)
  • Если width < 1024 → collapse
  • Если width > 1440 → expand
  • Если пользователь вручную toggle → override до следующего
    resize

ПОЧЕМУ АВТО:
  • Пользователь не должен думать о sidebar
  • На узком окне — больше места контенту

ПОЧЕМУ НЕ ВСЕГДА AUTO:
  • Пользователь может хотеть expanded даже на 1000px
  • Override сохраняется до следующего resize

【 РЕШЕНИЕ 9: Адаптив Dashboard — 3 / 2 / 1 колонки ]

ОБОСНУЙ:
  • Dashboard с 4 карточками статистики + Hero + Connection
    + Ping + Recent Logs
  • На 1920+: 3 колонки (Hero + Stats | Connection + Ping |
    Recent Logs + Quick Actions)
  • На 1440–1920: 2 колонки
  • На 1024–1440: 2 колонки (сжато)
  • На 800–1024: 1 колонка (стопкой)

РЕАЛИЗАЦИЯ:
  • CSS Grid: `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`
  • Но для Dashboard лучше явный контроль:
    - @container (max-width: 700px) → 1 колонка
    - @container (max-width: 1100px) → 2 колонки
    - @container (> 1100px) → 3 колонки

ПОЧЕМУ НЕ auto-fit ВЕЗДЕ:
  • Dashboard — особый layout
  • Нужен явный контроль над группировкой

【 РЕШЕНИЕ 10: Плавающая кнопка «Вверх/Вниз» с учётом viewport ]

ОБОСНУЙ:
  • Плавающие кнопки (ScrollToBottom в Logs) должны:
    - Всегда быть видны
    - Не перекрывать контент
    - Учитывать safe-area (если есть)
  • Позиция: `fixed bottom: max(24px, env(safe-area-inset-bottom))`
  • На маленьком экране — меньше (16px)

ПОЧЕМУ НЕ ФИКСИРОВАННАЯ ПОЗИЦИЯ:
  • На маленьких экранах может перекрыть контент
  • На больших — слишком далеко от края

【 РЕШЕНИЕ 11: Логи — адаптация колонок через container queries ]

ОБОСНУЙ:
  • LogRow имеет колонки: timestamp, level, source, message
  • На узком экране (600px контейнера) — timestamp скрывается
  • На 400px — source скрывается
  • На 300px — level становится иконкой
  • Реализация через container queries

ЛОГИКА:
  • Container = область логов
  • @container (max-width: 800px) → timestamp text-xs
  • @container (max-width: 600px) → timestamp hidden
  • @container (max-width: 400px) → source hidden

ПОЧЕМУ НЕ VIRTUAL SCROLL БЕЗ АДАПТАЦИИ:
  • На маленьком экране 4 колонки не помещаются
  • Обрезка контента — плохо

【 РЕШЕНИЕ 12: Модалки — max-width с clamp() ]

ОБОСНУЙ:
  • Модалка width: 500px на 4K — крошечная
  • На 1280×720 — нормально
  • Решение: `max-width: min(clamp(400px, 40vw, 700px), 90vw)`
  • Работает для всех размеров

ПОЧЕМУ НЕ ФИКСИРОВАННЫЕ sm/md/lg/xl:
  • Размеры не адаптируются
  • На 4K выглядят микроскопически

ПОЧЕМУ НЕ 100% ШИРИНА:
  • На широких экранах — растянуто
  • Плохо для читаемости

【 РЕШЕНИЕ 13: Полноэкранный режим — скрытие TitleBar по F11 ]

ОБОСНУЙ:
  • Пользователь может хотеть полный экран (без TitleBar)
  • F11 (стандарт) → toggle fullscreen
  • В fullscreen:
    - TitleBar скрывается (или превращается в auto-hide)
    - Sidebar остаётся (это часть UI)
    - Escape → выход из fullscreen
  • Кнопка в TitleBar для fullscreen

РЕАЛИЗАЦИЯ:
  • Tauri: `window.setFullscreen(bool)`
  • Обработка клавиши F11 через keyboard event
  • Escape → если fullscreen, exit

ПОЧЕМУ НЕ ВСЕГДА FULLSCREEN:
  • Пользователь может хотеть видеть другие окна
  • Опция для медиа-контента, не для всех

【 РЕШЕНИЕ 14: Тестирование на матрице конфигураций ]

ОБОСНУЙ:
  • Невозможно вручную проверить все комбинации
  • Автоматическое тестирование через Playwright:
    - Разные viewport sizes
    - Разные deviceScaleFactor
  • Проверяем: нет overflow, нет обрезания, кнопки кликабельны

МАТРИЦА:
  • 1280×720 @ 1x
  • 1366×768 @ 1x
  • 1920×1080 @ 1x, 1.25x, 1.5x
  • 2560×1440 @ 1x, 1.5x, 2x
  • 3840×2160 @ 1x, 2x
  • 800×600 @ 1x (минимум)

ПОЧЕМУ ВАЖНО:
  • Регрессии легче ловить автоматически
  • Матрица документирует поддержку

【 РЕШЕНИЕ 15: Учет safe-area-inset (на будущее для macOS) ]

ОБОСНУЙ:
  • На macOS есть notch на новых MacBook
  • CSS: `padding: env(safe-area-inset-top)`
  • Сейчас Windows, но задел на будущее
  • Не мешает

ПОЧЕМУ СРАЗУ:
  • Одна строка CSS
  • Легко забыть потом

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src/styles/globals.css (обновить) 】
Добавить CSS-переменные для адаптивности:

```css
@theme {
  /* Типографика (fluid) */
  --font-size-xs: clamp(0.7rem, 0.65rem + 0.15vw, 0.75rem);
  --font-size-sm: clamp(0.8rem, 0.75rem + 0.2vw, 0.875rem);
  --font-size-base: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
  --font-size-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-xl: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
  --font-size-2xl: clamp(1.35rem, 1.1rem + 1vw, 1.75rem);
  --font-size-3xl: clamp(1.65rem, 1.3rem + 1.5vw, 2.25rem);

  /* Отступы (fluid) */
  --space-xs: clamp(4px, 0.3vw + 2px, 8px);
  --space-sm: clamp(8px, 0.5vw + 4px, 12px);
  --space-md: clamp(12px, 0.8vw + 6px, 18px);
  --space-lg: clamp(16px, 1.2vw + 8px, 28px);
  --space-xl: clamp(24px, 1.8vw + 12px, 44px);
  --space-2xl: clamp(32px, 2.5vw + 16px, 64px);

  /* Радиусы (fluid) */
  --radius-sm: clamp(4px, 0.3vw + 2px, 6px);
  --radius-md: clamp(6px, 0.4vw + 4px, 10px);
  --radius-lg: clamp(10px, 0.6vw + 6px, 16px);
  --radius-xl: clamp(16px, 0.8vw + 10px, 24px);

  /* Layout */
  --sidebar-width: clamp(72px, 12vw, 240px);
  --titlebar-height: clamp(32px, 3vh, 40px);

  /* Модалки */
  --modal-width-sm: min(clamp(320px, 30vw, 400px), 90vw);
  --modal-width-md: min(clamp(400px, 40vw, 540px), 90vw);
  --modal-width-lg: min(clamp(500px, 55vw, 720px), 92vw);
  --modal-width-xl: min(clamp(600px, 70vw, 960px), 94vw);
}

/* Предотвращение обрезки текста */
body {
  font-size: var(--font-size-base);
  min-width: 800px;
  min-height: 600px;
}

/* Все иконки — SVG, векторные */
svg {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
```

【 2. src/hooks/useViewport.ts (создать) 】
Назначение: хук для отслеживания размера viewport.

Сигнатура:
  • useViewport() → {
      width: number;
      height: number;
      devicePixelRatio: number;
      aspectRatio: number;
      breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
      orientation: "portrait" | "landscape";
    }

Логика:
  • useState для размеров
  • useEffect с window.addEventListener("resize", throttled)
  • Обновление при mount
  • Подписка на "tauri://scale-factor-changed" (DPI)
  • Cleanup

Требования:
  • Throttle 100ms (не чаще)
  • Никаких ре-рендеров без реального изменения размеров
  • Мемоизация значения

BREAKPOINTS:
  • xs: < 640
  • sm: 640–800
  • md: 800–1024
  • lg: 1024–1280
  • xl: 1280–1536
  • 2xl: >= 1536

【 3. src/hooks/useMediaQuery.ts (создать) 】
Назначение: хук для media queries.

Сигнатура:
  • useMediaQuery(query: string) → boolean

Логика:
  • useState(window.matchMedia(query).matches)
  • useEffect — подписка на изменение
  • Cleanup

ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ:
  • useMediaQuery("(min-width: 1024px)")
  • useMediaQuery("(prefers-reduced-motion: reduce)")
  • useMediaQuery("(min-resolution: 2dppx)") — Retina

【 4. src/hooks/useAdaptiveSidebar.ts (создать) 】
Назначение: авто-управление Sidebar при resize.

Логика:
  • Читает useViewport
  • Читает sidebarCollapsed из useAppStore
  • Читает userOverride (useState)
  • useEffect на [breakpoint]:
    - Если breakpoint < md (1024px) и !userOverride →
      setSidebarCollapsed(true)
    - Если breakpoint >= xl (1280px) и !userOverride →
      setSidebarCollapsed(false)
  • Экспорт: { isCollapsed, toggle }

ПОЧЕМУ userOverride:
  • Пользователь может вручную toggle
  • Override действует до следующего «значимого» resize
    (смена breakpoint)

【 5. src/hooks/useDpiChange.ts (создать) 】
Назначение: отслеживание смены DPI (перетаскивание между мониторами).

Логика:
  • useEffect — listen("tauri://scale-factor-changed",
    handler)
  • При смене:
    - Обновить CSS-переменные (если нужно)
    - Emit событие "dpi-changed" для компонентов
  • Cleanup

ВОЗВРАЩАЕТ:
  • { currentScale: number }

【 6. src/lib/breakpoints.ts (создать) 】
Назначение: константы breakpoints.

Содержит:
  • BREAKPOINTS = {
      xs: 0,
      sm: 640,
      md: 800,
      lg: 1024,
      xl: 1280,
      "2xl": 1536,
    }
  • getBreakpoint(width: number): keyof typeof BREAKPOINTS

【 7. src/components/layout/Sidebar.tsx (обновить) 】
Изменения:
  • Использовать useAdaptiveSidebar
  • Ширина: var(--sidebar-width) через inline-style
  • На breakpoint < md — auto-collapse
  • Иконки: text-xl (масштабируются через rem)

【 8. src/components/layout/TitleBar.tsx (обновить) 】
Изменения:
  • Высота: var(--titlebar-height)
  • Добавить кнопку fullscreen (F11)
  • При fullscreen — TitleBar auto-hide (вариант)
  • Обработка F11 и Escape

【 9. src/components/layout/Layout.tsx (обновить) 】
Изменения:
  • padding main: var(--space-xl)
  • Учесть safe-area-inset на будущее
  • Проверить отсутствие overflow

【 10. src/pages/Dashboard.tsx (обновить) 】
Изменения:
  • Grid через container queries:
    ```
    .dashboard-grid {
      container-type: inline-size;
      display: grid;
      gap: var(--space-lg);
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
    @container (max-width: 700px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
    ```

【 11. src/pages/Strategies.tsx (обновить) 】
Изменения:
  • Сетка карт:
    ```
    grid-template-columns: repeat(
      auto-fill,
      minmax(clamp(240px, 22vw, 340px), 1fr)
    );
    ```
  • Панель управления — flex-wrap

【 12. src/components/logs/LogList.tsx (обновить) 】
Изменения:
  • Container queries на LogRow
  • На узком экране (max-width: 600px) — скрыть timestamp
  • На очень узком (max-width: 400px) — скрыть source

【 13. src/components/ui/Modal.tsx (обновить) 】
Изменения:
  • Использовать CSS-переменные --modal-width-*
  • Класс `max-h-[85vh]` — гибкая высота
  • На мобильных (max-width 800px) — модалка на всю ширину

【 14. src/components/dashboard/StatusOrb.tsx (обновить) 】
Изменения:
  • Размер через clamp(80px, 12vw, 140px)

【 15. src/components/strategies/game/StrategyGameCard.tsx (обновить) 】
Изменения:
  • Ширина карты — flex-based, не fixed
  • Aspect ratio 0.7 (7:10)
  • На узком контейнере — меньше font-size

【 16. src/lib/constants.ts (обновить) 】
Добавить:
  • VIEWPORT_THROTTLE_MS = 100
  • MIN_WINDOW_WIDTH = 800
  • MIN_WINDOW_HEIGHT = 600
  • DEFAULT_ASPECT_RATIO = 16 / 9

【 17. src/hooks/useWindowResize.ts (создать) 】
Назначение: throttled resize listener.

Сигнатура:
  • useWindowResize(callback: () => void, throttleMs: number) → void

Логика:
  • useEffect с throttled callback
  • requestAnimationFrame для плавности
  • Cleanup

【 18. src-tauri/tauri.conf.json (обновить) 】
Изменения:
  • window.minWidth: 800
  • window.minHeight: 600
  • window.resizable: true
  • window.maximizable: true
  • window.fullscreen: false

【 19. src-tauri/src/commands/window.rs (создать, опционально) 】
Назначение: команды для управления окном.

Команды:
  • toggle_fullscreen(window: Window) -> Result<bool, AppError>
  • get_monitor_info(window: Window) -> Result<MonitorInfo, AppError>
    - name, scale_factor, size, position

【 20. tests/adaptive.spec.ts (создать) 】
Назначение: Playwright-тесты для разных разрешений.

Тесты:
  • Для каждого размера:
    - Открыть приложение
    - Проверить отсутствие horizontal overflow
    - Проверить видимость всех ключевых элементов
    - Скриншот для визуальной регрессии

МАТРИЦА:
  • 1280×720, 1366×768, 1920×1080, 2560×1440, 3840×2160
  • С deviceScaleFactor 1, 1.25, 1.5, 2

【 21. src/styles/container-queries.css (создать) 】
Назначение: общие container queries для компонентов.

Содержит:
  • .log-container с container-type
  • .card-container с container-type
  • .dashboard-container с container-type
  • Media rules для каждого

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Обновить globals.css
  • CSS-переменные для fluid typography
  • CSS-переменные для spacing
  • CSS-переменные для radius
  • CSS-переменные для modal widths
  • min-width/min-height на body

ШАГ 2: Создать breakpoints.ts
  • Константы BREAKPOINTS
  • getBreakpoint()

ШАГ 3: Создать useViewport
  • Размер + devicePixelRatio
  • Throttled resize
  • Подписка на scale-factor-changed

ШАГ 4: Создать useMediaQuery
  • Generic хук

ШАГ 5: Создать useWindowResize
  • Throttled listener

ШАГ 6: Создать useDpiChange
  • Подписка на tauri event
  • Emit "dpi-changed"

ШАГ 7: Создать useAdaptiveSidebar
  • Авто-collapse на узких экранах
  • Override от пользователя

ШАГ 8: Обновить Sidebar
  • Использовать adaptive хук
  • Ширина через CSS-переменную

ШАГ 9: Обновить TitleBar
  • Кнопка fullscreen
  • Обработка F11 / Escape
  • Высота через переменную

ШАГ 10: Обновить Layout
  • Padding через переменные
  • Safe-area

ШАГ 11: Обновить Dashboard
  • Container queries для grid
  • Адаптив 3/2/1

ШАГ 12: Обновить Strategies
  • Grid с auto-fill
  • minmax с clamp

ШАГ 13: Обновить LogList
  • Container queries
  • Скрытие колонок на узких

ШАГ 14: Обновить Modal
  • CSS-переменные для ширины

ШАГ 15: Обновить StatusOrb
  • Размер через clamp

ШАГ 16: Обновить StrategyGameCard
  • Flex-based ширина
  • Aspect ratio

ШАГ 17: Создать window.rs (Rust, опционально)
  • toggle_fullscreen
  • get_monitor_info

ШАГ 18: Обновить tauri.conf.json
  • minWidth/minHeight
  • resizable/maximizable/fullscreen

ШАГ 19: Обновить constants.ts
  • Константы

ШАГ 20: Создать Playwright-тесты
  • tests/adaptive.spec.ts
  • Матрица размеров

ШАГ 21: Финальная проверка
  • Изменение размера окна — плавно
  • DPI 150% — всё корректно
  • Мультимонитор — работает
  • Fullscreen — работает
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Playwright — все тесты зелёные
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 TYPE SAFETY 】
  □ useViewport с полной типизацией
  □ useMediaQuery generic
  □ Breakpoint union-тип
  □ Ни одного any

【 CSS ПЕРЕМЕННЫЕ 】
  □ Fluid typography (clamp)
  □ Fluid spacing
  □ Fluid radius
  □ Modal widths через clamp
  □ Sidebar/titlebar через переменные
  □ body min-width/min-height

【 HOOKS 】
  □ useViewport работает
  □ useMediaQuery работает
  □ useWindowResize throttled
  □ useDpiChange подписан на tauri event
  □ useAdaptiveSidebar авто-collapse
  □ Cleanup во всех хуках

【 LAYOUT 】
  □ Sidebar авто-collapse при < 1024px
  □ Sidebar auto-expand при >= 1280px
  □ User override работает
  □ TitleBar с fullscreen кнопкой
  □ Layout padding через переменные
  □ Нет горизонтального overflow

【 DASHBOARD 】
  □ 3 колонки на >= 1440px
  □ 2 колонки на 1024–1440px
  □ 1 колонка на < 1024px
  □ Container queries работают

【 STRATEGIES 】
  □ Auto-fill grid
  □ 5–6 карт в ряд на 4K
  □ 3 карты на 1920
  □ 2 карты на 1366
  □ 1 карта на < 800px

【 LOGS 】
  □ Container queries
  □ Скрытие timestamp на < 600px
  □ Скрытие source на < 400px
  □ Message остаётся всегда

【 MODAL 】
  □ CSS-переменные для размера
  □ max-h-[85vh]
  □ На мобильных — full width

【 DPI 】
  □ devicePixelRatio отслеживается
  □ scale-factor-changed подписка
  □ Иконки трея переключаются
  □ При перетаскивании между мониторами — работает

【 FULLSCREEN 】
  □ F11 toggle
  □ Escape exit
  □ Кнопка в TitleBar
  □ TitleBar корректно прячется/появляется

【 ПРОИЗВОДИТЕЛЬНОСТЬ 】
  □ Resize без lag
  □ Container queries не грузят CPU
  □ 60 FPS при resize
  □ Нет перерисовок всей страницы

【 ТЕСТЫ 】
  □ Playwright тесты для 5+ размеров
  □ Скриншоты для визуальной регрессии
  □ Все зелёные

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
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: clamp() не работает в WebView2
  ПРИЧИНА: старая версия Chromium.
  ЧТО ПРОВЕРИТЬ: Chrome 79+ поддерживает clamp.
    WebView2 (Chromium 105+) — работает.

ГИПОТЕЗА 2: Container queries не работают
  ПРИЧИНА: WebView2 с Chromium < 105.
  ЧТО ПРОВЕРИТЬ: chrome://version в WebView2.
    Chrome 105+ поддерживает. WebView2 в Windows 10 —
    обновляется автоматически.

ГИПОТЕЗА 3: Sidebar не сворачивается автоматически
  ПРИЧИНА: useEffect не срабатывает при resize.
  ЧТО ПРОВЕРИТЬ: useViewport обновляется. useEffect
    зависит от breakpoint.

ГИПОТЕЗА 4: DPI scaling не пересчитывает layout
  ПРИЧИНА: CSS в px вместо rem.
  ЧТО ПРОВЕРИТЬ: все размеры через rem/em.

ГИПОТЕЗА 5: Перетаскивание между мониторами ломает окно
  ПРИЧИНА: окно остаётся того же размера в px, DPI меняется.
  ЧТО ПРОВЕРИТЬ: подписка на scale-factor-changed
    пересчитывает CSS. Возможно, нужен явный resize.

ГИПОТЕЗА 6: Модалка не помещается в маленькое окно
  ПРИЧИНА: фиксированная высота.
  ЧТО ПРОВЕРИТЬ: max-h-[85vh] + overflow-auto.

ГИПОТЕЗА 7: F11 не работает
  ПРИЧИНА: обработчик не привязан.
  ЧТО ПРОВЕРИТЬ: keydown listener на window. Или
    Tauri accelerator.

ГИПОТЕЗА 8: Fullscreen не выходит по Escape
  ПРИЧИНА: Escape обрабатывается в других местах
    (модалки, dropdown).
  ЧТО ПРОВЕРИТЬ: приоритет: модалка → fullscreen.

ГИПОТЕЗА 9: На 4K всё крошечное
  ПРИЧИНА: px вместо rem.
  ЧТО ПРОВЕРИТЬ: root font-size 16px (default). clamp()
    адаптируется.

ГИПОТЕЗА 10: Overflow появляется на 800×600
  ПРИЧИНА: фиксированные минимальные ширины компонентов.
  ЧТО ПРОВЕРИТЬ: min-width убраны, всё через flex/grid.

ГИПОТЕЗА 11: Playwright не запускается
  ПРИЧИНА: не установлен или Tauri требует native.
  ЧТО ПРОВЕРИТЬ: тестируем только web-версию через
    `pnpm dev` (Vite dev server). Playwright работает
    с web.

ГИПОТЕЗА 12: Container queries вызывают layout thrashing
  ПРИЧИНА: слишком частая переоценка.
  ЧТО ПРОВЕРИТЬ: Chrome DevTools → Performance →
    Layout. Должно быть < 16ms per frame.

ГИПОТЕЗА 13: Текст обрезается на 125% DPI
  ПРИЧИНА: line-height в px.
  ЧТО ПРОВЕРИТЬ: line-height unitless (1.5), не px.

ГИПОТЕЗА 14: Кнопки TitleBar выходят за пределы окна
  ПРИЧИНА: фиксированная высота, overflow hidden.
  ЧТО ПРОВЕРИТЬ: flex-shrink: 0 на кнопках.

ГИПОТЕЗА 15: На узком экране Dashboard не помещается
  ПРИЧИНА: 3 колонки без адаптива.
  ЧТО ПРОВЕРИТЬ: container queries переключают на 1
    колонку < 700px.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev

2. Изменить размер окна от 800×600 до 3840×2160
   ОЖИДАНИЕ:
   • Sidebar авто-collapse при < 1024
   • Sidebar auto-expand при >= 1280
   • Сетка карт перестраивается
   • Нет горизонтального скролла
   • Нет обрезания контента
   • Плавно, без лагов

3. На 800×600:
   • Sidebar collapsed
   • Strategies — 1 колонка карт
   • Dashboard — 1 колонка
   • Logs — timestamp скрыт
   • Modal — на всю ширину

4. На 1366×768:
   • Sidebar collapsed (auto)
   • Strategies — 2–3 колонки
   • Logs — всё видно

5. На 1920×1080:
   • Sidebar expanded
   • Strategies — 3–4 колонки
   • Dashboard — 2–3 колонки

6. На 2560×1440 и 4K:
   • Sidebar expanded
   • Strategies — 4–6 колонок
   • Шрифты крупнее (clamp)
   • Отступы больше

7. Изменить системный DPI на 150%:
   • Windows Settings → Дисплей → Масштаб 150%
   • Перезапустить приложение
   ОЖИДАНИЕ:
   • Всё пропорционально увеличилось
   • Читаемо
   • Нет артефактов

8. DPI 200%:
   ОЖИДАНИЕ: то же самое, крупнее

9. DPI 100% обратно

10. Мультимонитор (если есть):
    • Перетащить окно на монитор с другим DPI
    ОЖИДАНИЕ:
    • Layout пересчитывается
    • Иконка в трее обновляется
    • Ничего не ломается

11. Полноэкранный режим:
    • Нажать F11
    ОЖИДАНИЕ:
    • TitleBar скрывается
    • Sidebar остаётся
    • Escape → выход
    • Всё работает

12. Открыть модалку в fullscreen
    ОЖИДАНИЕ: закрывается Escape (модалка, потом
    fullscreen)

13. Проверить Container Queries в DevTools:
    • Открыть Logs
    • DevTools → Elements → LogRow → проверить @container

14. Resize окна с открытой модалкой
    ОЖИДАНИЕ: модалка адаптируется

15. Проверить Performance:
    • Открыть Performance
    • Записать resize окна
    ОЖИДАНИЕ:
    • 60 FPS
    • Нет long tasks > 50ms
    • Нет layout thrashing

16. Проверить на 4K + 200% DPI (если доступно):
    ОЖИДАНИЕ: интерфейс как на 1080p + 100%

17. Запустить Playwright:
    • pnpm playwright test
    ОЖИДАНИЕ: все тесты зелёные

18. Открыть скриншоты:
    • Проверить визуально
    ОЖИДАНИЕ: нет обрезаний, всё аккуратно

19. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

20. cargo check
    ОЖИДАНИЕ: 0 warning'ов

21. Открыть Task Manager → RAM
    ОЖИДАНИЕ: <200 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать фиксированные px для шрифтов (только rem/clamp)
❌ Не использовать фиксированные px для отступов
❌ Не забывать min-width/min-height на body
❌ Не забывать про container-type на контейнерах
❌ Не забывать про @container queries для компонентов
❌ Не забывать про throttle на resize
❌ Не забывать про cleanup listeners
❌ Не забывать про prefers-reduced-motion
❌ Не забывать про safe-area-inset
❌ Не забывать про minWidth/minHeight в tauri.conf
❌ Не забывать про F11 / Escape
❌ Не забывать про DPI scale-factor-changed
❌ Не забывать про Playwright тесты
❌ Не забывать про визуальную регрессию
❌ Не забывать про aspect-ratio
❌ Не использовать any
❌ Не начинать Этап 20 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 19 завершён, если ВСЕ пункты выполнены:

✅ Fluid typography через clamp()
✅ Fluid spacing через clamp()
✅ Fluid radius через clamp()
✅ CSS-переменные для modal widths
✅ breakpoints.ts с константами
✅ useViewport работает
✅ useMediaQuery работает
✅ useWindowResize throttled
✅ useDpiChange подписан
✅ useAdaptiveSidebar работает
✅ Sidebar авто-collapse/expand
✅ TitleBar с fullscreen кнопкой
✅ F11 / Escape работают
✅ Layout padding через переменные
✅ Dashboard 3/2/1 колонки
✅ Strategies auto-fill grid
✅ LogList container queries
✅ Modal через переменные
✅ StatusOrb через clamp
✅ StrategyGameCard flex-based
✅ tauri.conf.json с minWidth/minHeight
✅ DPI scaling работает
✅ Мультимонитор работает
✅ Fullscreen работает
✅ Playwright тесты зелёные
✅ Нет overflow на 800×600
✅ Нет обрезаний на 4K
✅ 60 FPS при resize
✅ RAM <200 MB
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ Консоль чистая
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 20
═══════════════════════════════════════════════════════════════════════

После Этапа 19 у нас есть:
  • Полная адаптивность под все разрешения
  • Fluid typography через clamp()
  • Container queries для компонентов
  • DPI scaling + мультимонитор
  • Fullscreen режим
  • Playwright тесты для размеров
  • Готовность к Этапу 20 — «Оптимизация»

На Этапе 20 нужно будет:
  • Замерить текущие FPS, RAM, CPU
  • Оптимизировать узкие места (если есть)
  • Code splitting (lazy loading модалок, страниц)
  • Оптимизация re-render (React.memo, useMemo, useCallback)
  • Оптимизация bundle (tree shaking, minification)
  • Проверить утечки памяти (heap snapshots)
  • Оптимизация загрузки шрифтов (font-display: swap)
  • Финальная проверка FPS ≥ 60 везде

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 19 — СТОП.

Не начинай Этап 20. Не оптимизируй bundle, не делай
code splitting, не проверяй утечки памяти.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 20
  • "Правка: ..." — правка в Этап 19
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.

---
