# ЭТАП 20: ОПТИМИЗАЦИЯ — FPS, RAM, УТЕЧКИ

═══════════════════════════════════════════════════════════════════════
ЭТАП 20: ОПТИМИЗАЦИЯ — FPS, RAM, УТЕЧКИ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Провести полный аудит производительности приложения и довести
все ключевые метрики до production-стандарта: холодный старт
< 1.5 сек, FPS ≥ 60 в любой точке приложения, RAM < 150 MB
в покое и < 250 MB при активной работе, отсутствие утечек
памяти при многократном переключении страниц и открытии модалок,
размер JS-бандла < 400 KB gzip, размер установщика < 25 MB.
Оптимизировать загрузку шрифтов, tree-shake зависимости, применить
code splitting, устранить layout thrashing, убрать ненужные
ре-рендеры React и утечки из Rust-стороны.

После этого этапа приложение будет работать быстро и стабильно
на любом компьютере, включая слабые офисные ПК и ноутбуки
5–7-летней давности. Никаких «подвисаний», «долгих стартов»,
«растущей памяти». Приложение выглядит и работает как премиум-продукт
уровня Awwwards.

Это финальный технический этап перед безопасностью и релизом.
После него — только аудит, тесты, и публикация.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Метрики-цели до начала оптимизации 】

ОБОСНУЙ:
  • «Оптимизация без цели» — это хобби, не инженерия
  • Устанавливаем конкретные измеримые цели:
    - Холодный старт: < 1.5 сек (от запуска .exe до
      появления Dashboard)
    - Warm start: < 800 ms
    - FPS: ≥ 60 везде (≥ 30 на low-tier)
    - RAM: < 150 MB idle, < 250 MB при 10 000 логов
      и активной стратегии
    - Bundle: < 400 KB gzip (JS + CSS)
    - Установщик: < 25 MB (без zapret) / < 50 MB (с zapret)
    - TTI (Time to Interactive): < 2 сек
    - First Paint: < 300 ms
  • Замеры ДО оптимизации — baseline
  • Замеры ПОСЛЕ — сравнение

ПОЧЕМУ ЦЕЛИ, А НЕ «СДЕЛАЙ БЫСТРЕЕ»:
  • Понятно, когда остановиться
  • Измеримо
  • Можно проверить в CI

【 РЕШЕНИЕ 2: Профилирование ПЕРЕД оптимизацией (baseline) 】

ОБОСНУЙ:
  • 90% времени разработчика тратится на 10% кода
  • Оптимизировать «на глаз» — путь в никуда
  • Правильный подход:
    1. Замерить baseline (current state)
    2. Найти узкие места через профайлер
    3. Оптимизировать ИМЕННО их
    4. Замерить результат
  • Инструменты:
    - React DevTools Profiler (компоненты)
    - Chrome DevTools Performance (CPU, layout)
    - Chrome DevTools Memory (утечки)
    - Rust: `cargo flamegraph` (для горячих путей)
    - Windows Task Manager (RAM, CPU)

ПОЧЕМУ ВАЖНО:
  • Преждевременная оптимизация — корень всех зол
  • Оптимизация без замера — трата времени

【 РЕШЕНИЕ 3: Code splitting через dynamic import для страниц и модалок 】

ОБОСНУЙ:
  • Одна большая JS-сборка → медленный старт
  • Разбиение:
    - Каждая страница — отдельный chunk (lazy import)
    - Тяжёлые модалки (LicensesModal, UpdateModal) —
      lazy import
    - framer-motion — отдельный chunk
  • React.lazy + Suspense
  • Загрузка чанка только когда пользователь открывает
    страницу/модалку
  • Стартовый bundle уменьшается на 40–60%

ПОЧЕМУ НЕ ВСЁ СРАЗУ:
  • Пользователь 90% времени на Dashboard и Strategies
  • Logs, Settings, About — загружаются по требованию
  • Модалки — только при открытии

ПОЧЕМУ НЕ ВСЁ LAZY:
  • Dashboard и Strategies — стартовые, они в основном bundle
  • Слишком много чанков → много HTTP-запросов (в Tauri —
    из file://, быстро, но всё же)

ПРИМЕНЕНИЕ:
  • `const Logs = lazy(() => import("@/pages/Logs"))`
  • `<Suspense fallback={<PageSkeleton />}>`
  • Каждая модалка — lazy

【 РЕШЕНИЕ 4: Tree shaking для lucide-react (только нужные иконки) 】

ОБОСНУЙ:
  • lucide-react экспортирует 1000+ иконок
  • Даже с ESM tree shaking могут подтягиваться лишние
  • Проверка: analyze bundle
  • Если lucide-react добавляет > 50 KB — перейти на
    прямой импорт:
    `import { Play } from "lucide-react/icons/play"`
  • Или использовать unplugin-icons (по требованию)

ПОЧЕМУ ВАЖНО:
  • Иконки — самая частая причина раздутого bundle
  • 200 иконок × 2 KB = 400 KB

РЕАЛИЗАЦИЯ:
  • Vite + rollup автоматически tree-shake'ит lucide-react
  • Но проверяем через `rollup-plugin-visualizer`

【 РЕШЕНИЕ 5: React.memo + useCallback для тяжёлых компонентов 】

ОБОСНУЙ:
  • Каждый ре-рендер родителя → ре-рендер детей
  • В StrategyGameCard, LogRow, Dashboard widgets —
    это дорого
  • React.memo предотвращает ре-рендер при неизменных пропсах
  • useCallback для колбэков, передаваемых в memo-компоненты
  • useMemo для тяжёлых вычислений

ГДЕ ПРИМЕНЯТЬ:
  • LogRow — memo (рендерится 1000+ раз)
  • StrategyGameCard — memo (дорогая анимация)
  • Dashboard widgets — memo
  • Sidebar пункты — memo
  • useShallow для селекторов Zustand

ГДЕ НЕ ПРИМЕНЯТЬ:
  • Простые компоненты (Button, Badge) — memo дороже
    самого рендера
  • Компоненты без пропсов
  • Родители с частыми изменениями

ПОЧЕМУ ВАЖНО:
  • Logs: 10 000 строк, каждая — LogRow
  • Без memo — 10 000 ре-рендеров при добавлении одной строки

【 РЕШЕНИЕ 6: Виртуализация уже есть (Этап 7) — проверить ]

ОБОСНУЙ:
  • Logs — virtualized через @tanstack/react-virtual
  • Strategies — НЕ virtualized (пока 10–50 карт, ок)
  • Если станет 200+ карт — добавить
  • Dashboard — не нужна виртуализация

ПОЧЕМУ ПРОВЕРИТЬ:
  • Может быть конфигурация с overscan слишком большим
  • Или renderItem — тяжёлый

【 РЕШЕНИЕ 7: Throttle/debounce для частых событий 】

ОБОСНУЙ:
  • Resize окна → много событий в секунду
  • Mousemove (для glow) → 60+ событий/сек
  • Scroll → 60+ событий/сек
  • Все три нужно throttle:
    - Resize: throttle 100ms
    - Mousemove: requestAnimationFrame
    - Scroll: passive + throttle 50ms

ПРИМЕНЕНИЕ:
  • useWindowResize — throttle 100ms
  • useCardTilt — rAF для mousemove
  • LogList scroll — passive listener

【 РЕШЕНИЕ 8: Оптимизация Zustand (селекторы + shallow) 】

ОБОСНУЙ:
  • Zustand ре-рендерит подписчиков при ЛЮБОМ изменении стора
  • Если компонент подписан на весь стор — ре-рендер при
    каждом изменении
  • Правильные селекторы + useShallow:
    ```ts
    const { a, b } = useStore(useShallow(state => ({
      a: state.a, b: state.b
    })))
    ```
  • Для одиночных значений — селектор возвращает примитив
  • Для массивов — useShallow по элементам

ГДЕ ПРОВЕРИТЬ:
  • useLogsStore — самое «горячее» место
  • useStrategiesStore — при обновлении статусов
  • useSettingsStore — редко, ок

ПОЧЕМУ ВАЖНО:
  • 1000 логов/сек → 1000 set-вызовов → 1000 ре-рендеров
  • Если Logs-страница подписана на весь стор — умрёт

РЕШЕНИЕ ДЛЯ ЛОГОВ:
  • Страница Logs подписана ТОЛЬКО на:
    - filteredLogs (через useFilteredLogs)
    - filter (объект)
  • Не на весь стор

【 РЕШЕНИЕ 9: Проверка утечек памяти через heap snapshots 】

ОБОСНУЙ:
  • Утечки в React-приложениях — обычное дело
  • Симптомы:
    - RAM растёт при переключении страниц
    - Скорость падает через час работы
    - Приложение крашится на 2 GB RAM
  • Проверка:
    1. Открыть приложение → baseline snapshot
    2. 20 раз переключить страницы
    3. 20 раз открыть/закрыть модалку
    4. Snapshot → сравнить
  • Если heap вырос > 10 MB — утечка

ГДЕ ИСКАТЬ:
  • setInterval без cleanup (usePing, useUptime)
  • addEventListener без removeEventListener
  • Tauri listen() без unlisten
  • Closures захватывают большие объекты
  • Framer Motion: незавершённые анимации

ПРИМЕНЕНИЕ:
  • Chrome DevTools → Memory → Heap Snapshot
  • Сравнение двух snapshots

【 РЕШЕНИЕ 10: Оптимизация шрифтов (font-display: swap, subset) 】

ОБОСНУЙ:
  • @fontsource/inter — 12 весов × 2 языка × 3 формата = 72 файла
  • Нужны только 3–4 веса, только кириллица + латиница
  • font-display: swap — текст рендерится сразу системным
    шрифтом, потом меняется
  • Subset — только нужные символы (600 глифов вместо 3000)
  • Экономия: 500 KB → 80 KB

РЕАЛИЗАЦИЯ:
  • Импортировать только:
    - Inter: 400, 500, 600, 700
    - JetBrains Mono: 400, 500
  • Использовать subset: latin, cyrillic
  • `font-display: swap` через @fontsource настройки

【 РЕШЕНИЕ 11: Vite build оптимизации 】

ОБОСНУЙ:
  • Vite по умолчанию хорош, но можно лучше:
    - `build.target: "esnext"` — современный код без полифилов
    - `build.minify: "esbuild"` — быстро + эффективно
    - `build.sourcemap: false` в prod
    - `build.cssMinify: true`
    - `build.rollupOptions.output.manualChunks` — разделение
      vendor/react/motion/ui
    - `build.chunkSizeWarningLimit: 500` — предупреждение
      при > 500 KB
  • Проверка через `rollup-plugin-visualizer`

MANUAL CHUNKS:
  • react-vendor: react, react-dom
  • motion: framer-motion
  • ui: все компоненты ui/
  • stores: zustand + наши сторы
  • utils: zod, date-fns, nanoid

ПОЧЕМУ ВАЖНО:
  • Меньше чанк → быстрее загрузка
  • Параллельная загрузка
  • Кеширование (react-vendor меняется редко)

【 РЕШЕНИЕ 12: Rust оптимизации (release profile) 】

ОБОСНУЙ:
  • Cargo по умолчанию медленный в release
  • Оптимизации:
    ```toml
    [profile.release]
    lto = "fat"
    codegen-units = 1
    opt-level = "s"  # или "z" для минимального размера
    panic = "abort"
    strip = true
    ```
  • lto: fat — максимальная оптимизация
  • codegen-units: 1 — медленнее сборка, быстрее/меньше код
  • opt-level: "s" — размер, или "3" — скорость
  • panic: abort — без unwinding (мы не используем catch_unwind)
  • strip: true — удалить символы

ПОЧЕМУ ВАЖНО:
  • Бинарник может уменьшиться с 25 MB до 8 MB
  • Старт быстрее

【 РЕШЕНИЕ 13: Оптимизация анимаций (transform/opacity, will-change) 】

ОБОСНУЙ:
  • Анимировать только transform и opacity (GPU)
  • НЕ анимировать width, height, top, left, margin, padding
    (layout thrashing)
  • will-change: transform — только на время анимации
  • Убирать will-change после завершения

ГДЕ ПРОВЕРИТЬ:
  • Sidebar collapse — width → transform scaleX? (или
    переделать на transform)
  • Карты — flip через rotateY (ок)
  • Пульсации — scale (ок)
  • Glow — filter или opacity (ок)

ПРОБЛЕМА:
  • Sidebar collapse на width — layout thrashing
  • Решение: анимировать width, но с `contain: layout style`
    на контейнере, чтобы ограничить layout

【 РЕШЕНИЕ 14: Оптимизация событий Tauri (батчинг) 】

ОБОСНУЙ:
  • Каждое emit из Rust → invoke в JS → ре-рендер
  • Если Rust emit'ит 1000 событий/сек — плохо
  • Решение: батчинг на Rust-стороне
  • Например, network-stats emit'ит раз в 100ms с накопленными
    данными

ГДЕ ПРОВЕРИТЬ:
  • strategy-log: уже батчинг (Этап 6)
  • network-stats: раз в 100ms
  • resource-progress: throttle 100ms

【 РЕШЕНИЕ 15: Lazy loading для тяжёлых ресурсов (иконки трея, шрифты) 】

ОБОСНУЙ:
  • Иконки трея (10 PNG) — загружаются только в Rust, ок
  • Шрифты — @fontsource, подключены через Vite
  • Картинки Dashboard (если есть) — lazy load
  • На текущий момент: критичных ресурсов нет, всё ок

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/ОБНОВИТЬ
═══════════════════════════════════════════════════════════════════════

【 1. vite.config.ts (обновить) 】
Добавить оптимизации:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { port: 1420, strictPort: true, watch: { ignored: ["**/src-tauri/**"] } },
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    cssMinify: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
            return "motion";
          }

          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return "react-vendor";
          }

          if (/[\\/]node_modules[\\/](zustand|use-sync-external-store)[\\/]/.test(id)) {
            return "stores";
          }

          return undefined;
        }
      }
    }
  }
})
```

ВАЖНО: Vite 8 использует **rolldown**, а не classic rollup.
`manualChunks` там принимает ТОЛЬКО функцию. Объектная форма падает со
`TypeError: manualChunks is not a function`. Проверено на этапе 1
(`README.md`, отклонение O4). Не возвращать объектную форму.
Также в `devDependencies` должен быть `esbuild` — его импортирует
`@tailwindcss/node` и в строгом `node_modules` pnpm он иначе не резолвится
(отклонение O5).

【 2. src-tauri/Cargo.toml (обновить) 】
Оптимизации release:

```toml
[profile.release]
lto = "fat"
codegen-units = 1
opt-level = "s"
panic = "abort"
strip = true
incremental = false
```

【 3. src/app/App.tsx (обновить) 】
Lazy loading страниц:

```tsx
import { lazy, Suspense } from "react"

const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Strategies = lazy(() => import("@/pages/Strategies"))
const Logs = lazy(() => import("@/pages/Logs"))
const Settings = lazy(() => import("@/pages/Settings"))
const About = lazy(() => import("@/pages/About"))

// Внутри switch:
case "logs":
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Logs />
    </Suspense>
  )
```

【 4. src/components/shared/PageSkeleton.tsx (создать) 】
Скелетон для fallback Suspense:

  • H1 Skeleton
  • Несколько GlassPanel с Skeleton

【 5. src/components/ui/Modal.tsx (обновить) 】
Для lazy: экспортировать как default:

```tsx
export default function Modal(...) { ... }
```

Или использовать lazy только для специализированных модалок
(LicensesModal, UpdateModal).

【 6. src/components/logs/LogRow.tsx (обновить) 】
Добавить React.memo:

```tsx
export const LogRow = memo(function LogRow(props: LogRowProps) {
  // ...
}, (prev, next) => {
  return prev.entry.id === next.entry.id &&
    prev.query === next.query &&
    prev.isEven === next.isEven
})
```

【 7. src/components/strategies/game/StrategyGameCard.tsx (обновить) 】
React.memo + useCallback для onClick.

【 8. src/components/layout/Sidebar.tsx (обновить) 】
React.memo для NavItem.

【 9. src/stores/useLogsStore.ts (обновить) 】
Оптимизации:

  • Селектор selectFilteredLogs — мемоизированный
  • useLogLevelCounts — useMemo через useShallow
  • addLog добавляет в pendingBatch (уже есть)
  • flush через requestIdleCallback (вместо setTimeout) —
    не блокирует UI

【 10. src/stores/selectors/useLogSelectors.ts (обновить) 】
  • Использовать useShallow
  • Мемоизация результатов

Пример:
```ts
export function useLogLevelCounts() {
  return useLogsStore(
    useShallow((state) => {
      const counts = { info: 0, warn: 0, error: 0, success: 0, debug: 0 }
      for (const log of state.logs) counts[log.level]++
      return counts
    })
  )
}
```

【 11. src/hooks/usePing.ts (обновить) 】
Проверить cleanup:

  • clearInterval в return useEffect
  • AbortController для in-flight запросов
  • Проверка document.hidden

【 12. src/hooks/useUptime.ts (обновить) 】
  • clearInterval в cleanup
  • Использовать requestAnimationFrame вместо setInterval
    для точности?

【 13. src/hooks/useTray.ts (обновить) 】
  • Throttle update_tray_state (уже есть)
  • Cleanup всех listen

【 14. src/hooks/useCardTilt.ts (обновить) 】
  • requestAnimationFrame для mousemove
  • Убрать listener при unmount

【 15. src/hooks/useWindowResize.ts (создать/обновить) 】
  • Throttle 100ms
  • passive: true

【 16. src/main.tsx (обновить) 】
Шрифты — только нужные веса:

```ts
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/jetbrains-mono/400.css"
import "@fontsource/jetbrains-mono/500.css"
```

Вместо импорта всего пакета.

【 17. src/styles/fonts.css (создать) 】
```css
@font-face {
  font-family: "Inter";
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  font-display: swap;
}
```

Или настроить через @fontsource options.

【 18. scripts/analyze-bundle.js (создать) 】
Скрипт для анализа bundle:

```js
// Запускает build + визуализацию
```

Установить `rollup-plugin-visualizer` в devDeps.

【 19. package.json (обновить) 】
Добавить скрипты:
```json
"scripts": {
  "analyze": "vite build --mode analyze",
  "perf:check": "node scripts/perf-check.js"
}
```

devDependencies:
  • `rollup-plugin-visualizer`
  • `@playwright/test` (для perf-тестов)

【 20. scripts/perf-check.js (создать) 】
Скрипт для проверки метрик:

  • Запускает Vite dev
  • Использует Playwright
  • Замеряет:
    - Time to First Paint
    - Time to Interactive
    - JS bundle size
  • Выводит отчёт
  • Падает если превышены лимиты

【 21. tests/performance.spec.ts (создать) 】
Playwright тесты производительности:

  • Холодный старт < 1.5 сек
  • 1000 логов < 500ms
  • Переключение страниц < 100ms
  • Открытие модалки < 200ms
  • FPS через requestAnimationFrame
  • RAM через performance.memory (если доступно)

【 22. src/lib/perf.ts (создать) 】
Утилиты для замера:

  • mark(name: string): void — performance.mark
  • measure(name: string, start: string): number
  • reportMetrics(): void — отправляет в консоль в dev

【 23. src-tauri/src/commands/perf.rs (создать, опционально) 】
Команда get_process_memory():

  • Возвращает RSS приложения (МБ)
  • Для мониторинга в dev
  • Использует sysinfo

【 24. src/components/dev/PerfMonitor.tsx (создать) 】
Dev-компонент для мониторинга:

  • Показывает FPS, RAM, размер heap
  • Только в DEV
  • Fixed в углу
  • Можно скрыть

【 25. src/stores/mocks/logs.ts (обновить) 】
  • generateMockLogs — оптимизировать для 10 000+ записей
  • Использовать Array.from вместо push в цикле

【 26. src/lib/constants.ts (обновить) 】
Добавить:
  • PERF_TARGETS = {
      coldStartMs: 1500,
      warmStartMs: 800,
      fps: 60,
      ramIdleMb: 150,
      ramActiveMb: 250,
      bundleKb: 400,
    }
  • THROTTLE_RESIZE_MS = 100
  • THROTTLE_MOUSEMOVE_MS = 16
  • LOG_FLUSH_IDLE_TIMEOUT_MS = 100

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Замер baseline
  • Запустить pnpm tauri dev
  • Замерить:
    - Холодный старт (с) — Task Manager
    - RAM idle (MB) — Task Manager
    - RAM с 10 000 логов (MB)
    - FPS на Dashboard / Strategies / Logs (Chrome DevTools)
    - Размер JS bundle (dist/assets)
    - Размер .exe (release build)
  • Записать в PERF_BASELINE.md

ШАГ 2: Профилирование CPU
  • Chrome DevTools → Performance
  • Записать 10 сек на каждой странице
  • Найти горячие функции
  • Записать в PERF_BASELINE.md

ШАГ 3: Профилирование памяти
  • Chrome DevTools → Memory
  • Baseline snapshot
  • 20× переключить страницы
  • 20× открыть/закрыть модалки
  • Snapshot после
  • Найти утечки

ШАГ 4: Оптимизация Vite build
  • Обновить vite.config.ts
  • manualChunks
  • Проверить размер через analyze

ШАГ 5: Оптимизация Cargo release
  • Обновить Cargo.toml
  • `cargo build --release`
  • Замерить размер .exe

ШАГ 6: Lazy loading страниц
  • Обновить App.tsx
  • React.lazy для Logs, Settings, About
  • Создать PageSkeleton
  • Suspense fallback

ШАГ 7: Lazy loading модалок
  • LicensesModal, UpdateModal, FirstRunModal —
    lazy
  • Проверить, что не ломает UX

ШАГ 8: React.memo
  • LogRow
  • StrategyGameCard
  • NavItem (Sidebar)
  • Dashboard widgets
  • Замерить FPS до/после

ШАГ 9: useCallback и useMemo
  • В местах, где передаются колбэки в memo-компоненты
  • В тяжёлых вычислениях

ШАГ 10: Оптимизация Zustand
  • useShallow для объектов
  • Точечные селекторы
  • Проверить через React DevTools Profiler

ШАГ 11: Оптимизация шрифтов
  • Импортировать только нужные веса
  • font-display: swap
  • Замерить размер bundle

ШАГ 12: Throttle событий
  • useWindowResize — 100ms
  • useCardTilt — rAF
  • LogList scroll — passive

ШАГ 13: Оптимизация анимаций
  • Проверить, что анимируются только transform/opacity
  • will-change правильно
  • Убрать лишние

ШАГ 14: Оптимизация Rust
  • Батчинг emit (проверить)
  • Profiling через flamegraph (опционально)
  • Убрать лишние аллокации

ШАГ 15: Создать PerfMonitor (dev)
  • FPS counter
  • RAM counter
  • Только в DEV

ШАГ 16: Playwright perf-тесты
  • tests/performance.spec.ts
  • Тесты на метрики

ШАГ 17: Повторный замер
  • Все те же метрики
  • Сравнение с baseline
  • Записать в PERF_RESULTS.md

ШАГ 18: Финальная проверка
  • Все метрики в цели
  • Нет регрессий
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 BASELINE 】
  □ Все метрики замерены ДО оптимизации
  □ Профайлер CPU запущен
  □ Heap snapshots сняты
  □ Baseline сохранён

【 BUILD 】
  □ vite.config.ts с manualChunks
  □ build.target: esnext
  □ build.minify: esbuild
  □ build.sourcemap: false
  □ Cargo release profile
  □ LTO включён
  □ panic: abort
  □ strip: true

【 BUNDLE 】
  □ JS bundle < 400 KB gzip
  □ CSS < 50 KB gzip
  □ Основной chunk < 200 KB
  □ Vendor chunks разделены
  □ Нет дублирования зависимостей

【 LAZY LOADING 】
  □ Logs — lazy
  □ Settings — lazy
  □ About — lazy
  □ LicensesModal — lazy
  □ UpdateModal — lazy
  □ PageSkeleton fallback
  □ Suspense не «мигает»

【 REACT MEMO 】
  □ LogRow — memo
  □ StrategyGameCard — memo
  □ NavItem — memo
  □ Dashboard widgets — memo
  □ useCallback в местах с memo
  □ useMemo для тяжёлых вычислений

【 ZUSTAND 】
  □ Все селекторы точечные
  □ useShallow для объектов
  □ Нет подписок на весь стор
  □ Logs — только через useFilteredLogs

【 ШРИФТЫ 】
  □ Только нужные веса
  □ font-display: swap
  □ Subset (latin, cyrillic)
  □ Размер < 100 KB

【 СОБЫТИЯ 】
  □ Resize throttle 100ms
  □ Mousemove rAF
  □ Scroll passive
  □ Tauri listeners с cleanup

【 АНИМАЦИИ 】
  □ Только transform/opacity
  □ will-change правильно
  □ Framer Motion — variants
  □ Нет layout thrashing

【 RUST 】
  □ Батчинг emit
  □ Release profile настроен
  □ Нет лишних аллокаций
  □ Бинарник < 15 MB

【 МЕТРИКИ — ФИНАЛ 】
  □ Холодный старт < 1.5 сек
  □ Warm start < 800 ms
  □ FPS ≥ 60 на Dashboard
  □ FPS ≥ 60 на Strategies
  □ FPS ≥ 60 на Logs (с 10 000)
  □ RAM idle < 150 MB
  □ RAM active < 250 MB
  □ Bundle < 400 KB gzip
  □ TTI < 2 сек
  □ First Paint < 300 ms

【 УТЕЧКИ 】
  □ Heap не растёт после 20× переключений
  □ Нет «detached DOM nodes»
  □ setInterval с cleanup
  □ addEventListener с remove
  □ Tauri listen с unlisten

【 DEV MONITOR 】
  □ PerfMonitor только в DEV
  □ Показывает FPS, RAM
  □ Не мешает в prod

【 ТЕСТЫ 】
  □ Playwright perf-тесты
  □ Все зелёные
  □ Работают в CI

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
  □ pnpm build — успех
  □ pnpm tauri build — успех

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: Lazy loading ломает переходы страниц
  ПРИЧИНА: Suspense fallback мерцает.
  ЧТО ПРОВЕРИТЬ: PageSkeleton должен быть «похож» на
    страницу. Или предзагружать чанк при hover на
    Sidebar-пункт.

ГИПОТЕЗА 2: React.memo не помогает
  ПРИЧИНА: пропсы всё равно меняются (объекты, функции).
  ЧТО ПРОВЕРИТЬ: стабилизировать пропсы через useCallback
    и useMemo. Или кастомный comparator.

ГИПОТЕЗА 3: Bundle не уменьшается после tree shaking
  ПРИЧИНА: динамический импорт lucide или неправильные
    imports.
  ЧТО ПРОВЕРИТЬ: rollup-plugin-visualizer. Найти
    виновника.

ГИПОТЕЗА 4: RAM растёт после каждого переключения страниц
  ПРИЧИНА: утечка в одном из сторов или слушателей.
  ЧТО ПРОВЕРИТЬ: heap snapshot diff. Найти растущий
    объект.

ГИПОТЕЗА 5: Оптимизация анимаций ломает визуал
  ПРИЧИНА: замена width на transform scaleX — меняет
    размер текста внутри.
  ЧТО ПРОВЕРИТЬ: wrapper с overflow: hidden. Или
    оставить width, но с contain.

ГИПОТЕЗА 6: Cargo release падает при panic: abort
  ПРИЧИНА: какой-то код использует catch_unwind.
  ЧТО ПРОВЕРИТЬ: grep catch_unwind. Если есть —
    убрать.

ГИПОТЕЗА 7: font-display: swap показывает «прыжок»
   шрифта
  ПРИЧИНА: FOIT/FOUT.
  ЧТО ПРОВЕРИТЬ: критичный текст — сразу с нужным
    font-family fallback. Или preload.

ГИПОТЕЗА 8: Throttle resize ломает адаптив
  ПРИЧИНА: 100ms — заметно при быстром изменении.
  ЧТО ПРОВЕРИТЬ: 50ms или rAF.

ГИПОТЕЗА 9: Playwright не запускается в CI
  ПРИЧИНА: Tauri требует native.
  ЧТО ПРОВЕРИТЬ: тестируем только web (pnpm dev).
    Достаточно для большинства метрик.

ГИПОТЕЗА 10: manualChunks ломает порядок загрузки
  ПРИЧИНА: circular deps.
  ЧТО ПРОВЕРИТЬ: не разделять то, что сильно связано.
    react-vendor — безопасно.

ГИПОТЕЗА 11: Rust LTO увеличивает время сборки
  ПРИЧИНА: lto: fat — медленно.
  ЧТО ПРОВЕРИТЬ: для dev использовать без LTO.
    В profile.dev: opt-level = 1.

ГИПОТЕЗА 12: Memory leak из framer-motion
  ПРИЧИНА: незавершённые анимации.
  ЧТО ПРОВЕРИТЬ: AnimatePresence с корректным key.
    Cleanup при unmount.

ГИПОТЕЗА 13: Моками 10 000 логов тест не проходит
  ПРИЧИНА: слишком быстрая генерация блокирует UI.
  ЧТО ПРОВЕРИТЬ: generateMockLogs с requestIdleCallback
    или Web Worker.

ГИПОТЕЗА 14: Vite build падает на памяти
  ПРИЧИНА: большое дерево модулей.
  ЧТО ПРОВЕРИТЬ: NODE_OPTIONS=--max-old-space-size=4096

ГИПОТЕЗА 15: ZIP релиза > 50 MB
  ПРИЧИНА: ресурсы не сжаты, debug-инфо в exe.
  ЧТО ПРОВЕРИТЬ: strip: true. compression: lzma.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm dev (Vite)
2. Открыть Chrome DevTools
3. Замерить cold start:
   • Закрыть приложение
   • Запустить pnpm tauri dev
   • Замерить время от запуска до Dashboard
   ОЖИДАНИЕ: < 1.5 сек в release, < 2 сек в dev

4. Открыть Task Manager → RAM
   ОЖИДАНИЕ: < 150 MB idle

5. Загрузить 10 000 моковых логов
   ОЖИДАНИЕ: RAM < 250 MB

6. FPS на Dashboard:
   • DevTools → Performance
   • Записать 10 сек
   ОЖИДАНИЕ: 60 FPS

7. FPS на Strategies (карты):
   • Записать scroll + hover
   ОЖИДАНИЕ: 60 FPS

8. FPS на Logs (с 10 000 логов):
   • Scroll
   ОЖИДАНИЕ: 60 FPS

9. Открытие модалки:
   • Замерить время от клика до видимой модалки
   ОЖИДАНИЕ: < 200 ms

10. Переключение страниц:
    • Sidebar → Logs → Strategies → Dashboard
    ОЖИДАНИЕ: < 100 ms каждая

11. Heap snapshot test:
    • Baseline snapshot
    • 20× переключить страницы
    • Snapshot после
    ОЖИДАНИЕ: < 5 MB роста

12. Heap + модалки:
    • 20× открыть/закрыть модалку
    ОЖИДАНИЕ: < 5 MB роста

13. Bundle size:
    • pnpm build
    • Проверить dist/assets/*.js
    ОЖИДАНИЕ: основной < 200 KB, vendor chunks
    отдельно

14. Bundle analyzer:
    • pnpm analyze
    • Открыть stats.html
    ОЖИДАНИЕ: нет «гигантских» модулей

15. Размер .exe:
    • pnpm tauri build
    • Проверить src-tauri/target/release/
    ОЖИДАНИЕ: < 15 MB

16. Размер установщика:
    • Проверить bundle/nsis/*.exe
    ОЖИДАНИЕ: < 25 MB (без ресурсов) / < 50 MB

17. Playwright perf:
    • pnpm playwright test tests/performance
    ОЖИДАНИЕ: все зелёные

18. PerfMonitor (dev):
    • Открыть приложение
    ОЖИДАНИЕ: FPS и RAM отображаются в углу

19. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

20. cargo check
    ОЖИДАНИЕ: 0 warning'ов

21. cargo build --release
    ОЖИДАНИЕ: успех, .exe < 15 MB

22. Проверить на слабом ПК (симуляция):
    • DevTools → Performance → CPU 6x slowdown
    • Открыть приложение
    ОЖИДАНИЕ: работает, 30+ FPS

23. Проверить утечки Rust:
    • Открыть приложение на 1 час
    • Проверить RAM
    ОЖИДАНИЕ: не растёт > 10 MB

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не оптимизировать без замера
❌ Не использовать any
❌ Не забывать cleanup (interval, listener)
❌ Не забывать React.memo там, где нужно
❌ Не забывать useCallback для memo-детей
❌ Не подписываться на весь стор
❌ Не использовать useState в animation loop
❌ Не анимировать width/height без contain
❌ Не забывать про lazy loading
❌ Не забывать про sourcemap: false в prod
❌ Не забывать про LTO в Cargo release
❌ Не забывать про font-display: swap
❌ Не забывать про PerfMonitor только в DEV
❌ Не забывать про Playwright perf-тесты
❌ Не забывать про baseline ДО оптимизации
❌ Не начинать Этап 21 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 20 завершён, если ВСЕ пункты выполнены:

✅ Baseline замерен и сохранён в PERF_BASELINE.md
✅ Профайлер CPU проведён
✅ Heap snapshots сняты
✅ vite.config.ts с manualChunks
✅ Cargo.toml с release profile
✅ Lazy loading для Logs, Settings, About
✅ Lazy loading для модалок
✅ React.memo для LogRow, StrategyGameCard, NavItem
✅ useCallback в нужных местах
✅ Zustand селекторы оптимизированы
✅ Шрифты — только нужные веса
✅ font-display: swap
✅ Throttle resize/mousemove/scroll
✅ Только transform/opacity в анимациях
✅ Rust batched emit
✅ PerfMonitor (dev-only)
✅ Playwright perf-тесты
✅ Финальные метрики:
   - Холодный старт < 1.5 сек
   - Warm start < 800 ms
   - FPS ≥ 60 везде
   - RAM idle < 150 MB
   - RAM active < 250 MB
   - Bundle < 400 KB gzip
   - TTI < 2 сек
   - .exe < 15 MB
   - Установщик < 25 MB
✅ Нет утечек памяти
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ cargo build --release — успех
✅ Консоль чистая
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 21
═══════════════════════════════════════════════════════════════════════

После Этапа 20 у нас есть:
  • Оптимизированное приложение с метриками в цели
  • Bundle < 400 KB, установщик < 25 MB
  • Холодный старт < 1.5 сек
  • RAM < 150 MB idle
  • FPS ≥ 60
  • Playwright perf-тесты в CI
  • Готовность к Этапу 21 — «Безопасность»

На Этапе 21 нужно будет:
  • Аудит безопасности: path traversal, injection
  • Валидация всех входных данных (Rust + TS)
  • CSP-заголовки в Tauri
  • Защита от подмены ресурсов
  • Безопасная работа с файлами (права, symlinks)
  • Аудит зависимостей (cargo audit, pnpm audit)
  • Защита от command injection в runner
  • Sandbox для запуска .bat
  • Логирование ошибок без секретов

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 20 — СТОП.

Не начинай Этап 21. Не делай аудит безопасности, не
добавляй CSP, не проверяй зависимости на уязвимости.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 21
  • "Правка: ..." — правка в Этап 20
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.

---

