# ЭТАП 22: ТЕСТЫ И АУДИТ

═══════════════════════════════════════════════════════════════════════
ЭТАП 22: ТЕСТЫ И АУДИТ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Провести финальный технический аудит приложения: покрыть
критичные пользовательские сценарии end-to-end тестами через
Playwright, добить unit-тесты в Rust до разумного покрытия,
прогнать статический анализ (clippy, eslint, tsc strict),
проверить отсутствие ошибок и warning'ов в консоли, найти и
удалить мёртвый код и дубликаты, проверить отсутствие утечек
памяти и «зависших» слушателей, убедиться что все UX-пути
имеют завершение (нет «тупиков»). После этого этапа
приложение считается стабильным и готовым к релизу.

После этого этапа:
  • Все ключевые пользовательские сценарии покрыты E2E
    тестами (запуск/остановка стратегии, VPN, Outlast,
    обновления, Settings, трей, логи, карты)
  • Rust-код покрыт unit-тестами на критичных путях
  • Ни одной ошибки и warning'а в консоли браузера
  • Ни одного warning'а в cargo check/clippy
  • Ни одного any в TypeScript
  • Ни одного unwrap() в production-коде (обоснование
    через конструкцию, не через комментарий)
  • Нет мёртвого кода, нет дубликатов
  • Нет утечек памяти при 30+ минутах активной работы
  • Все UX-пути завершены (нет висящих состояний)

Это последний технический этап. После него — только сборка
релиза и деплой (Этап 23).

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Пирамида тестов — unit > integration > E2E 】

ОБОСНУЙ:
  • Классическая пирамида: много unit, меньше integration,
    немного E2E
  • Для desktop-приложения:
    - Unit (Rust): парсинг, валидация, хеши, semver — 70%
    - Integration (Rust): сканер, инжектор, updater — 20%
    - E2E (Playwright): пользовательские сценарии — 10%
  • E2E — дорогие, медленные, хрупкие
  • Unit — быстрые, надёжные

ПОЧЕМУ НЕ ТОЛЬКО E2E:
  • 50 E2E тестов × 30 сек = 25 минут CI
  • E2E хрупкие (timing, race conditions)
  • Не показывают точное место проблемы

ПОЧЕМУ НЕ ТОЛЬКО UNIT:
  • Не ловят интеграционные проблемы
  • Не проверяют UX

【 РЕШЕНИЕ 2: Playwright для E2E — работает с web-версией Vite 】

ОБОСНУЙ:
  • Tauri-приложение — это WebView, но для тестов достаточно
    запустить Vite dev server + Playwright (Chromium)
  • Tauri-specific API (invoke, listen) — мокаются
  • Так проще, быстрее, стабильнее
  • Для тестирования реального Tauri — отдельные smoke-тесты
    через `tauri-driver` (опционально, только на CI Windows)

МОКИРОВАНИЕ:
  • `page.addInitScript` — подменяет `window.__TAURI__` на mock
  • Mock возвращает заранее заготовленные данные
  • Реальные операции (fs, shell) — не выполняются

ПОЧЕМУ НЕ TAURI-DRIVER КАК ОСНОВНОЙ:
  • Требует native Windows runner (дорого)
  • Медленнее (реальный запуск приложения)
  • Сложнее отлаживать
  • Оставляем для smoke-тестов

【 РЕШЕНИЕ 3: Vitest для unit-тестов frontend 】

ОБОСНУЙ:
  • Vitest — быстрый, работает с Vite из коробки
  • Тестируем: чистые функции (format, validate, rarity,
    bloom, chromatic, buildSparklinePath)
  • Не тестируем UI-компоненты через unit (это E2E)
  • Не тестируем сторы (сложно, мало пользы)

ПОЧЕМУ НЕ JEST:
  • Медленнее
  • Другая конфигурация (не интегрирован с Vite)
  • Vitest быстрее в 5–10 раз

ЧТО ТЕСТИРУЕМ:
  • formatFileSize, formatRelativeTime, formatLogTime
  • validateDomain, validatePort, validateIpRange
  • computeRarity, computeCardStats
  • escapeRegExp, escapeHtml
  • parseDomainsFromText
  • buildSparklinePath
  • formatBytes, formatSpeed

【 РЕШЕНИЕ 4: Rust-тесты — 3 уровня 】

ОБОСНУЙ:
  • Unit tests (#[cfg(test)] mod tests) — внутри файлов
  • Integration tests (tests/) — отдельные файлы
  • Doc-tests — для публичных API (опционально)

ЧТО ТЕСТИРУЕМ В RUST:
  • parse_log_line — все уровни
  • extract_name, extract_description, detect_services
  • parse_config_paths, normalize_domain, is_valid_domain
  • compare_versions (semver)
  • escape_for_cmd, safe_path, validate_domain
  • verify_file_hash
  • parse_wg_show_output
  • sanitize_log_message

ПОКРЫТИЕ:
  • Не гонимся за 100%
  • Целимся в 70%+ для критичных модулей
  • Не тестируем тривиальные getter/setter
  • Не тестируем winapi-обёртки (требуют окружения)

【 РЕШЕНИЕ 5: Сценарии E2E — только happy path + критичные edge cases 】

ОБОСНУЙ:
  • E2E — дорогие, не нужно дублировать все unit-кейсы
  • Покрываем:
    1. Первый запуск: пустое состояние → выбор папки →
       скан
    2. Запуск стратегии: клик Play → UAC (mock) → running
    3. Остановка стратегии: клик Stop → idle
    4. Переключение страниц: все 5 разделов открываются
    5. Логи: логи отображаются, фильтры работают
    6. Карты: переключение режима, flip, запуск
    7. Настройки: изменение сохраняется
    8. Outlast: включить, добавить домен
    9. VPN: импорт конфига (mock), переключение
    10. Обновления: проверка (mock)
    11. Трей: клик (skip — не работает в web)
    12. Адаптив: разные размеры viewport

ПОЧЕМУ НЕ БОЛЬШЕ:
  • 12 сценариев × 20 сек = 4 минуты CI
  • Достаточно для регрессии

【 РЕШЕНИЕ 6: CI pipeline — полный прогон на каждый PR 】

ОБОСНУЙ:
  • GitHub Actions:
    - Job 1: Lint (eslint + tsc + cargo clippy)
    - Job 2: Unit tests (vitest + cargo test)
    - Job 3: E2E (Playwright)
    - Job 4: Build (pnpm tauri build)
    - Job 5: Security (cargo audit + pnpm audit)
  • Каждый PR — полный прогон
  • Мерж только если всё зелёное

ПОЧЕМУ ВСЁ:
  • Каждый этап мог сломать что-то
  • CI ловит регрессии рано

【 РЕШЕНИЕ 7: Статический анализ — clippy pedantic + eslint strict 】

ОБОСНУЙ:
  • Clippy с pedantic — строгие проверки Rust
  • ESLint с typescript-eslint strict + security
  • TypeScript strict (уже включён с Этапа 1)
  • Все warning'ы — как ошибки в CI

CLIPPY LINTS:
  • clippy::all
  • clippy::pedantic (с исключениями)
  • clippy::unwrap_used — запрещён
  • clippy::expect_used — запрещён
  • clippy::panic — запрещён

ESLINT:
  • typescript-eslint/recommended-type-checked
  • react-hooks
  • security

【 РЕШЕНИЕ 8: Аудит мёртвого кода — grep + инструменты 】

ОБОСНУЙ:
  • Мёртвый код — техдолг
  • Инструменты:
    - Rust: cargo +nightly udeps (или cargo machete)
    - TS: ts-prune, knip
  • Также grep на:
    - Закомментированные блоки
    - TODO/FIXME (должны быть решены)
    - console.log
    - import без использования

ПОЧЕМУ ВАЖНО:
  • Чистая кодовая база = меньше багов
  • Легче поддерживать

【 РЕШЕНИЕ 9: Проверка консоли — ни одного warning'а в runtime 】

ОБОСНУЙ:
  • Playwright может отслеживать console events
  • Ошибка в консоли → тест падает
  • Warning тоже → тест падает (в strict mode)
  • Проверяем на каждой странице, во всех модалках

РЕАЛИЗАЦИЯ:
  • page.on('console', msg => { if (msg.type() === 'error') throw })
  • page.on('pageerror', err => throw)

【 РЕШЕНИЕ 10: Проверка утечек памяти — 30-минутный прогон 】

ОБОСНУЙ:
  • 30 минут активной работы (переключение страниц,
    открытие модалок, генерация логов)
  • Heap snapshot до и после
  • Рост > 20 MB — утечка
  • Мониторинг: Chrome DevTools Memory

ЧТО ПРОВЕРЯЕМ:
  • Растёт ли heap при переключении страниц
  • Растёт ли количество listeners
  • Растёт ли количество node'ов
  • Растёт ли RAM процесса (Task Manager)

【 РЕШЕНИЕ 11: Проверка UX — все пути завершены 】

ОБОСНУЙ:
  • Каждый экран должен иметь «выход»
  • Каждая операция должна иметь завершение (успех/ошибка)
  • Нет «тупиков» (пользователь не знает что делать)

ЧЕК-ЛИСТ UX:
  • Каждая модалка закрывается (крестик, Escape,
    backdrop)
  • Каждая форма имеет отмену
  • Каждая ошибка имеет действие («Повторить»)
  • Каждый пустой экран имеет CTA
  • Каждый long-running процесс показывает прогресс
  • Каждая операция показывает результат (toast)

【 РЕШЕНИЕ 12: Snapshot-тесты для критичных компонентов (опционально) 】

ОБОСНУЙ:
  • Не обязательно для desktop-приложения
  • Но полезно для:
    - Button (все варианты)
    - Badge
    - Card
  • Playwright имеет встроенный toHaveScreenshot()
  • Baseline сохраняется в репо

РЕКОМЕНДАЦИЯ: сделать для 3-4 компонентов, не больше.

【 РЕШЕНИЕ 13: Проверка совместимости с Windows 10 / 11 】

ОБОСНУЙ:
  • Windows 10 21H2+ — минимум
  • Windows 11 — основной
  • Проверка через GitHub Actions: windows-2022 runner
  • Smoke-тест: приложение запускается, открывается
    окно, базовые команды работают

ПОЧЕМУ ВАЖНО:
  • 90% пользователей — Win 10 / 11
  • Некоторые API отличаются

【 РЕШЕНИЕ 14: Отчёт о тестировании — TEST_REPORT.md 】

ОБОСНУЙ:
  • Документация, что было протестировано
  • Покрытие (грубое)
  • Список сценариев
  • Известные проблемы
  • Ссылки на CI runs

ПОЧЕМУ ВАЖНО:
  • Аудит для следующих разработчиков
  • Доказательство качества

【 РЕШЕНИЕ 15: Проверка локализации (RU / EN) 】

ОБОСНУЙ:
  • Все строки в словарях
  • Никаких хардкодов на русском в компонентах
  • Проверка: смена языка меняет ВСЁ
  • E2E-тест на переключение языка

ЧТО ПРОВЕРЯЕМ:
  • Кнопки, заголовки, placeholder'ы
  • Tooltip'ы
  • Уведомления
  • Сообщения об ошибках

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/ОБНОВИТЬ
═══════════════════════════════════════════════════════════════════════

【 1. package.json (обновить) 】
Добавить devDependencies:
  • `vitest` — unit-тесты
  • `@vitest/ui` — UI для тестов
  • `@playwright/test` — E2E
  • `@testing-library/react` — тесты React-компонентов
  • `@testing-library/jest-dom` — матчеры
  • `@testing-library/user-event` — симуляция событий
  • `jsdom` — окружение для Vitest
  • `ts-prune` — поиск мёртвого кода
  • `knip` — поиск неиспользуемых экспортов

Добавить scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage",
"e2e": "playwright test",
"e2e:ui": "playwright test --ui",
"e2e:headed": "playwright test --headed",
"lint:dead": "knip",
"lint:all": "pnpm lint && pnpm tsc --noEmit && pnpm lint:dead",
"audit:all": "pnpm audit --audit-level=high && cargo audit"
```

【 2. vitest.config.ts (создать) 】
```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/mocks/**",
        "**/types/**"
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    }
  }
})
```

【 3. tests/setup.ts (создать) 】
```ts
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})
```

【 4. playwright.config.ts (создать) 】
```ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:1420",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:1420",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
})
```

【 5. e2e/setup/mock-tauri.ts (создать) 】
Назначение: mock Tauri API для E2E.

```ts
import type { Page } from "@playwright/test"

export async function mockTauri(page: Page) {
  await page.addInitScript(() => {
    ;(window as any).__TAURI_INTERNALS__ = {
      invoke: async (cmd: string, args?: any) => {
        const handlers: Record<string, any> = {
          scan_strategies: () => [
            {
              id: "s1",
              name: "Discord + YouTube",
              filename: "discord_youtube.bat",
              path: "C:\\test\\discord_youtube.bat",
              description: "Discord + YouTube",
              services: ["discord", "youtube"],
              fileType: "zapret",
              size: 1024,
              modifiedAt: Date.now()
            }
          ],
          get_default_strategies_path: () => "C:\\test",
          check_for_updates: () => ({
            available: false,
            currentVersion: "0.1.0",
            latestVersion: "0.1.0",
            isNewer: false
          }),
          init_resources: () => ({
            firstRun: false,
            updated: false,
            strategiesCount: 1,
            resourcesVersion: "1.9.5",
            extractedBytes: 0
          }),
          get_network_stats: () => ({
            bytesIn: 0,
            bytesOut: 0,
            speedIn: 0,
            speedOut: 0,
            packetsIn: 0,
            packetsOut: 0,
            connections: 0,
            timestamp: Date.now()
          }),
          ping_hosts: () => []
        }

        const handler = handlers[cmd]
        if (handler) return handler(args)
        return null
      },
      transformCallback: (cb: any) => cb
    }
  })
}
```

【 6. e2e/first-run.spec.ts (создать) 】
```ts
import { test, expect } from "@playwright/test"
import { mockTauri } from "./setup/mock-tauri"

test.beforeEach(async ({ page }) => {
  await mockTauri(page)
})

test("открывается Dashboard", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /главная/i })).toBeVisible()
})

test("нет ошибок в консоли", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(err.message))

  await page.goto("/")
  await page.waitForTimeout(2000)
  expect(errors).toEqual([])
})
```

【 7. e2e/navigation.spec.ts (создать) 】
```ts
import { test, expect } from "@playwright/test"
import { mockTauri } from "./setup/mock-tauri"

test.beforeEach(async ({ page }) => {
  await mockTauri(page)
  await page.goto("/")
})

test("переключение между всеми страницами", async ({ page }) => {
  const pages = [
    { name: /стратегии/i, heading: /стратегии/i },
    { name: /логи/i, heading: /логи/i },
    { name: /настройки/i, heading: /настройки/i },
    { name: /о приложении/i, heading: /о приложении/i }
  ]

  for (const p of pages) {
    await page.getByRole("link", { name: p.name }).click()
    await expect(page.getByRole("heading", { name: p.heading })).toBeVisible()
  }
})
```

【 8. e2e/strategies.spec.ts (создать) 】
Тесты для страницы Strategies.

【 9. e2e/logs.spec.ts (создать) 】
Тесты для Logs.

【 10. e2e/settings.spec.ts (создать) 】
Тесты для Settings.

【 11. e2e/adaptive.spec.ts (создать) 】
Тесты адаптивности (разные viewport).

【 12. src/lib/format.test.ts (создать) 】
Unit-тесты для format.ts.

```ts
import { describe, it, expect } from "vitest"
import { formatFileSize, formatRelativeTime, formatLogTime } from "./format"

describe("formatFileSize", () => {
  it("форматирует байты", () => {
    expect(formatFileSize(500)).toBe("500 B")
  })
  it("форматирует KB", () => {
    expect(formatFileSize(1024)).toBe("1 KB")
  })
  it("форматирует MB", () => {
    expect(formatFileSize(1_500_000)).toBe("1.4 MB")
  })
})
```

【 13. src/lib/validators.test.ts (создать) 】
Тесты валидаторов.

【 14. src/lib/rarity.test.ts (создать) 】
Тесты computeRarity и computeCardStats.

【 15. src/lib/parseImport.test.ts (создать) 】
Тесты парсинга импорта доменов.

【 16. src/lib/bloom.test.ts (создать) 】
Тесты генерации bloom.

【 17. src-tauri/tests/integration.rs (создать) 】
Интеграционные тесты Rust.

```rust
use std::fs;
use tempfile::tempdir;

#[test]
fn test_scan_strategies_with_real_folder() {
    let dir = tempdir().unwrap();
    let bat_path = dir.path().join("test.bat");
    fs::write(&bat_path, "@echo off\nREM Test\necho Hello").unwrap();

    let result = scan_strategies(dir.path().to_str().unwrap().to_string());
    assert!(result.is_ok());
}
```

【 18. src-tauri/src/commands/scanner_tests.rs (обновить) 】
Добавить тесты если не все.

【 19. src-tauri/src/commands/injector_tests.rs (обновить) 】
Убедиться, что все edge cases покрыты.

【 20. src-tauri/src/security/audit_tests.rs (обновить) 】
Тесты безопасности.

【 21. .github/workflows/ci.yml (создать) 】
```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm tsc --noEmit
      - run: pnpm lint:dead

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  test-rust:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo test --manifest-path src-tauri/Cargo.toml
      - run: cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm e2e

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo install cargo-audit
      - run: cargo audit --manifest-path src-tauri/Cargo.toml
```

【 22. knip.json (создать) 】
Конфиг для поиска мёртвого кода.

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": [
    "src/main.tsx",
    "src-tauri/**/*.rs"
  ],
  "project": [
    "src/**/*.{ts,tsx}",
    "src-tauri/**/*.rs"
  ],
  "ignore": [
    "src/lib/mocks/**",
    "src/components/dev/**"
  ],
  "ignoreDependencies": [
    "@tauri-apps/plugin-updater"
  ]
}
```

【 23. TEST_REPORT.md (создать) 】
Отчёт о тестировании.

Содержит:
  • Дата
  • Список E2E сценариев
  • Unit-тесты (count)
  • Rust-тесты (count)
  • Покрытие
  • Известные проблемы
  • Ссылки на CI runs

【 24. docs/TESTING.md (создать) 】
Гайд по тестированию.

  • Как запускать тесты локально
  • Как писать новые тесты
  • Соглашения

【 25. src/components/ui/Button.test.tsx (создать, опционально) 】
Component-тест для Button.

```tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./Button"

describe("Button", () => {
  it("вызывает onClick", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByText("Click"))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("disabled блокирует клик", async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByText("Click"))
    expect(onClick).not.toHaveBeenCalled()
  })
})
```

【 26. tsconfig.json (обновить) 】
Добавить paths для тестов:
```json
"paths": {
  "@/*": ["./src/*"],
  "@tests/*": ["./tests/*"]
}
```

【 27. .gitignore (обновить) 】
Добавить:
  • `coverage/`
  • `playwright-report/`
  • `test-results/`
  • `.vitest/`

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Установить зависимости
  • pnpm add -D vitest @vitest/ui @testing-library/react
    @testing-library/jest-dom @testing-library/user-event
    jsdom @playwright/test ts-prune knip
  • pnpm exec playwright install

ШАГ 2: Настроить Vitest
  • vitest.config.ts
  • tests/setup.ts
  • tsconfig paths

ШАГ 3: Настроить Playwright
  • playwright.config.ts
  • e2e/setup/mock-tauri.ts

ШАГ 4: Написать unit-тесты (frontend)
  • format.test.ts
  • validators.test.ts
  • rarity.test.ts
  • parseImport.test.ts
  • bloom.test.ts
  • Button.test.tsx

ШАГ 5: Написать unit-тесты (Rust)
  • Проверить покрытие в scanner.rs
  • Проверить покрытие в injector.rs
  • Проверить в security/*.rs
  • Добавить недостающие

ШАГ 6: Написать интеграционные тесты Rust
  • tests/integration.rs
  • tempfile для директорий

ШАГ 7: Написать E2E-тесты
  • first-run.spec.ts
  • navigation.spec.ts
  • strategies.spec.ts
  • logs.spec.ts
  • settings.spec.ts
  • adaptive.spec.ts

ШАГ 8: Настроить CI
  • .github/workflows/ci.yml
  • Проверить, что локально всё зелёное

ШАГ 9: Аудит мёртвого кода
  • pnpm lint:dead
  • Удалить неиспользуемое
  • Убедиться, что нет TODO/FIXME

ШАГ 10: Проверка консоли
  • Запустить pnpm tauri dev
  • Открыть DevTools
  • Пройти все страницы
  • Записать ошибки/warning'ы
  • Исправить

ШАГ 11: Проверка утечек памяти
  • Открыть приложение
  • Baseline snapshot
  • 30 минут активности
  • Snapshot после
  • Если рост > 20 MB — искать утечку

ШАГ 12: Проверка UX-путей
  • Пройти по чек-листу UX (см. Решение 11)
  • Найти «тупики»
  • Исправить

ШАГ 13: Проверка локализации
  • Сменить язык на EN
  • Пройти все страницы
  • Найти хардкоды на русском
  • Исправить

ШАГ 14: Написать TEST_REPORT.md
  • Собрать метрики
  • Список сценариев
  • Известные проблемы

ШАГ 15: Написать docs/TESTING.md
  • Гайд для разработчиков

ШАГ 16: Финальная проверка
  • pnpm test — зелёные
  • pnpm e2e — зелёные
  • cargo test — зелёные
  • pnpm tsc --noEmit — 0 ошибок
  • pnpm lint — 0 ошибок
  • cargo clippy — 0 warning'ов
  • pnpm lint:dead — ничего не найдено
  • Консоль чистая
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 UNIT-ТЕСТЫ (FRONTEND) 】
  □ vitest.config.ts настроен
  □ tests/setup.ts настроен
  □ format.test.ts (5+ тестов)
  □ validators.test.ts (10+ тестов)
  □ rarity.test.ts (5+ тестов)
  □ parseImport.test.ts (5+ тестов)
  □ bloom.test.ts (3+ тестов)
  □ Button.test.tsx (3+ тестов)
  □ Покрытие > 60% для утилит

【 UNIT-ТЕСТЫ (RUST) 】
  □ scanner.rs — extract_name, detect_services,
    detect_file_type
  □ injector.rs — parse_config_paths, normalize_domain,
    is_valid_domain, marker-секции
  □ updater.rs — compare_versions
  □ security/*.rs — safe_path, escape_for_cmd,
    validate_domain, rate_limit
  □ Все тесты зелёные
  □ cargo test проходит

【 ИНТЕГРАЦИОННЫЕ ТЕСТЫ 】
  □ tests/integration.rs создан
  □ Использует tempfile
  □ Покрывает сканер + инжектор end-to-end

【 E2E ТЕСТЫ 】
  □ playwright.config.ts
  □ mock-tauri.ts
  □ first-run.spec.ts — открытие Dashboard, нет ошибок
  □ navigation.spec.ts — переходы по всем страницам
  □ strategies.spec.ts — список, выбор папки
  □ logs.spec.ts — отображение, фильтры
  □ settings.spec.ts — изменение, сохранение
  □ adaptive.spec.ts — 5 размеров viewport
  □ Все тесты зелёные

【 CI 】
  □ .github/workflows/ci.yml создан
  □ 5 jobs: lint, test-frontend, test-rust, e2e, security
  □ Все проходят на push
  □ Все проходят на PR

【 МЁРТВЫЙ КОД 】
  □ knip.json создан
  □ knip не находит неиспользуемого
  □ Нет TODO/FIXME
  □ Нет закомментированных блоков
  □ Нет неиспользуемых импортов

【 КОНСОЛЬ 】
  □ DevTools → Console чистая
  □ Нет ошибок на всех страницах
  □ Нет warning'ов
  □ Нет React warnings (keys, hooks)
  □ Нет Tauri errors

【 УТЕЧКИ ПАМЯТИ 】
  □ 30-минутный прогон
  □ Heap snapshot до / после
  □ Рост < 20 MB
  □ Нет detached nodes
  □ Нет растущих listeners

【 UX ПУТИ 】
  □ Все модалки закрываются
  □ Escape работает
  □ Backdrop закрывает
  □ Все формы имеют отмену
  □ Все ошибки имеют действие
  □ Все пустые состояния имеют CTA
  □ Все long-running — с прогрессом
  □ Все операции — с результатом

【 ЛОКАЛИЗАЦИЯ 】
  □ Смена языка мгновенная
  □ Все строки из словарей
  □ Нет хардкодов на русском
  □ Нет хардкодов на английском
  □ Placeholder'ы локализованы
  □ Уведомления локализованы

【 СТАТИЧЕСКИЙ АНАЛИЗ 】
  □ tsc --noEmit — 0 ошибок
  □ eslint — 0 ошибок
  □ cargo clippy — 0 warning'ов
  □ cargo clippy с pedantic — 0 критичных
  □ Нет any в TS
  □ Нет unwrap() в production-коде

【 ДОКУМЕНТАЦИЯ 】
  □ TEST_REPORT.md
  □ docs/TESTING.md
  □ Соглашения о написании тестов

【 CODE QUALITY 】
  □ Нет мёртвого кода
  □ Нет console.log (кроме dev)
  □ Функции <50 строк
  □ Файлы <300 строк
  □ Комментариев в коде нет (правило проекта)
  □ Осмысленные имена

【 BUILD 】
  □ pnpm test — зелёные
  □ pnpm e2e — зелёные
  □ cargo test — зелёные
  □ pnpm tsc --noEmit — 0 ошибок
  □ pnpm lint — 0 ошибок
  □ cargo clippy — 0 warning'ов
  □ pnpm build — успешно
  □ pnpm tauri build — успешно
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: Playwright не находит элементы
  ПРИЧИНА: selectors слишком специфичны или UI меняется.
  ЧТО ПРОВЕРИТЬ: использовать data-testid атрибуты
    вместо CSS-классов.

ГИПОТЕЗА 2: Моки Tauri не работают
  ПРИЧИНА: window.__TAURI__ структура изменилась в Tauri 2.
  ЧТО ПРОВЕРИТЬ: смотреть исходники @tauri-apps/api. Или
    использовать реальный Tauri в тестах (медленнее).

ГИПОТЕЗА 3: Vitest не резолвит @-алиасы
  ПРИЧИНА: vitest.config.ts не наследует vite.config.ts.
  ЧТО ПРОВЕРИТЬ: добавить resolve.alias в vitest.config.ts.

ГИПОТЕЗА 4: E2E падают на CI, но зелёные локально
  ПРИЧИНА: timing, окружение, шрифты.
  ЧТО ПРОВЕРИТЬ: увеличить timeout, использовать waitFor.
    Отключить анимации через CSS на тестах.

ГИПОТЕЗА 5: cargo test падает на Windows
  ПРИЧИНА: пути с backslash, tempfile.
  ЧТО ПРОВЕРИТЬ: использовать PathBuf, не String.
    tempfile на Windows работает.

ГИПОТЕЗА 6: Покрытие не достигает 60%
  ПРИЧИНА: слишком мало тестов.
  ЧТО ПРОВЕРИТЬ: снизить порог или добавить тесты.
    Не все файлы нужно покрывать.

ГИПОТЕЗА 7: knip находит ложные срабатывания
  ПРИЧИНА: динамические импорты.
  ЧТО ПРОВЕРИТЬ: добавить в ignore.

ГИПОТЕЗА 8: React warning о key
  ПРИЧИНА: список без стабильного key.
  ЧТО ПРОВЕРИТЬ: key={strategy.id} везде.

ГИПОТЕЗА 9: useEffect warning о зависимостях
  ПРИЧИНА: не все зависимости указаны.
  ЧТО ПРОВЕРИТЬ: eslint-react-hooks/exhaustive-deps.

ГИПОТЕЗА 10: Утечка в framer-motion
  ПРИЧИНА: анимации не завершены при unmount.
  ЧТО ПРОВЕРИТЬ: AnimatePresence с key. Cleanup.

ГИПОТЕЗА 11: Утечка в Tauri listen
  ПРИЧИНА: unlisten не вызывается.
  ЧТО ПРОВЕРИТЬ: в useEffect возврат unlisten.

ГИПОТЕЗА 12: Хардкод на русском остался
  ПРИЧИНА: пропустили при локализации.
  ЧТО ПРОВЕРИТЬ: grep -rn "а-яА-Я" src/ | grep -v test.

ГИПОТЕЗА 13: Snapshot-тесты хрупкие
  ПРИЧИНА: разные ОС, шрифты.
  ЧТО ПРОВЕРИТЬ: отключить или использовать tolerance.

ГИПОТЕЗА 14: CI занимает слишком долго
  ПРИЧИНА: e2e медленные.
  ЧТО ПРОВЕРИТЬ: параллелизация, кеширование.

ГИПОТЕЗА 15: Приложение не запускается на CI
  ПРИЧИНА: нет WebView2 на ubuntu runner.
  ЧТО ПРОВЕРИТЬ: только web (Vite) на CI, не Tauri.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Установить зависимости:
   `pnpm install && pnpm exec playwright install chromium`

2. Запустить unit-тесты:
   `pnpm test`
   ОЖИДАНИЕ: все зелёные, покрытие > 60%

3. Запустить Rust-тесты:
   `cd src-tauri && cargo test`
   ОЖИДАНИЕ: все зелёные

4. Запустить E2E:
   `pnpm e2e`
   ОЖИДАНИЕ: все зелёные

5. Запустить E2E в UI:
   `pnpm e2e:ui`
   ОЖИДАНИЕ: интерактивный просмотр

6. Проверить типы:
   `pnpm tsc --noEmit`
   ОЖИДАНИЕ: 0 ошибок

7. Проверить линтер:
   `pnpm lint`
   ОЖИДАНИЕ: 0 ошибок

8. Проверить мёртвый код:
   `pnpm lint:dead`
   ОЖИДАНИЕ: ничего не найдено

9. Проверить Rust:
   `cd src-tauri && cargo clippy -- -D warnings`
   ОЖИДАНИЕ: 0 warning'ов

10. Открыть приложение:
    `pnpm tauri dev`
    ОЖИДАНИЕ: запускается

11. Открыть DevTools → Console
    ОЖИДАНИЕ: чистая, никаких errors/warnings

12. Пройти по всем страницам:
    • Dashboard → Strategies → Logs → Settings → About
    ОЖИДАНИЕ: везде чистая консоль

13. Открыть все модалки:
    • Licenses, Update, FirstRun, Stop Confirm
    ОЖИДАНИЕ: открываются, закрываются, консоль чистая

14. Проверить утечки (30 мин):
    • Открыть приложение
    • Baseline snapshot
    • Переключать страницы, открывать модалки
    • Snapshot после
    ОЖИДАНИЕ: рост < 20 MB

15. Проверить UX-пути:
    • Каждая модалка закрывается (Escape, крестик, backdrop)
    • Каждая ошибка имеет «Повторить»
    • Все пустые состояния с CTA
    ОЖИДАНИЕ: всё завершено

16. Проверить локализацию:
    • Сменить язык на EN
    • Пройти по страницам
    ОЖИДАНИЕ: всё на английском

17. Запустить CI локально (опционально):
    `act -j lint` (если установлен act)
    ОЖИДАНИЕ: зелёный

18. Push в GitHub:
    ОЖИДАНИЕ: CI запускается, все jobs зелёные

19. Проверить TEST_REPORT.md
    ОЖИДАНИЕ: заполнен, актуален

20. Проверить docs/TESTING.md
    ОЖИДАНИЕ: гайд для разработчиков

21. Финальная проверка:
    • pnpm build — успешно
    • pnpm tauri build — успешно
    ОЖИДАНИЕ: релизные бинарники

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не писать тесты «для галочки»
❌ Не тестировать внутренние детали реализации
❌ Не использовать sleep в тестах (только waitFor)
❌ Не хардкодить таймауты больше 10 сек
❌ Не оставлять .only в тестах
❌ Не оставлять .skip без причины
❌ Не игнорировать failed tests
❌ Не использовать any в тестах
❌ Не забывать cleanup в setup
❌ Не забывать mock reset между тестами
❌ Не оставлять закомментированный код
❌ Не оставлять console.log
❌ Не оставлять TODO/FIXME
❌ Не оставлять мёртвый код
❌ Не забывать про CI
❌ Не начинать Этап 23 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 22 завершён, если ВСЕ пункты выполнены:

✅ vitest.config.ts настроен
✅ playwright.config.ts настроен
✅ setup.ts настроен
✅ mock-tauri.ts работает
✅ Unit-тесты (frontend) — 30+ тестов
✅ Unit-тесты (Rust) — 40+ тестов
✅ Интеграционные тесты Rust
✅ E2E тесты — 6+ файлов, 15+ сценариев
✅ Все тесты зелёные
✅ Покрытие frontend > 60%
✅ CI workflow создан
✅ CI зелёный на GitHub
✅ knip.json настроен
✅ Нет мёртвого кода
✅ Нет TODO/FIXME
✅ Console чистая на всех страницах
✅ Нет React warnings
✅ Нет Tauri errors
✅ 30-мин прогон: рост heap < 20 MB
✅ UX-пути завершены
✅ Локализация RU/EN без хардкодов
✅ tsc --noEmit — 0 ошибок
✅ eslint — 0 ошибок
✅ cargo clippy — 0 warning'ов
✅ cargo clippy pedantic — 0 критичных
✅ Нет any
✅ Нет unwrap() в production-коде
✅ TEST_REPORT.md заполнен
✅ docs/TESTING.md создан
✅ pnpm build — успешно
✅ pnpm tauri build — успешно
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 23
═══════════════════════════════════════════════════════════════════════

После Этапа 22 у нас есть:
  • Полный набор тестов (unit, integration, E2E)
  • CI pipeline (5 jobs)
  • Чистая консоль везде
  • Нет мёртвого кода
  • Нет утечек памяти
  • UX-пути завершены
  • Локализация работает
  • TEST_REPORT.md
  • Готовность к Этапу 23 — «Деплой»

На Этапе 23 нужно будет:
  • Финальная сборка релиза (.exe + .msi + setup.exe)
  • Подпись .exe (если есть сертификат)
  • GitHub Release с assets
  • Автоматизация через GitHub Actions
  • Проверка установки на чистой системе
  • Публикация на сайте / GitHub Releases
  • Smoke-тест релиза
  • Changelog для релиза
  • README для пользователей

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 22 — СТОП.

Не начинай Этап 23. Не собирай релиз, не создавай GitHub
Release, не публикуй.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 23
  • "Правка: ..." — правка в Этап 22
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.

---
