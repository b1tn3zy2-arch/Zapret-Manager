# Гайд по тестированию

Документ описывает, как запускать тесты локально и как писать новые.

## Стек

| Слой            | Инструмент               | Команда                                                     |
| --------------- | ------------------------ | ----------------------------------------------------------- |
| Unit (frontend) | Vitest + Testing Library | `pnpm test`                                                 |
| Покрытие        | Vitest + v8              | `pnpm test:coverage`                                        |
| E2E             | Playwright (Chromium)    | `pnpm e2e`                                                  |
| E2E UI-режим    | Playwright               | `pnpm e2e:ui`                                               |
| Soak (30 мин)   | Playwright + CDP         | `pnpm e2e:soak`                                             |
| Rust            | cargo test               | `cd src-tauri && cargo test`                                |
| Rust lint       | clippy                   | `cd src-tauri && cargo clippy --all-targets -- -D warnings` |
| Мёртвый код     | knip                     | `pnpm lint:dead`                                            |
| Локализация     | scripts/i18n-check.mjs   | `pnpm lint:i18n`                                            |
| Типы            | tsc                      | `pnpm typecheck`                                            |
| Линтер          | ESLint                   | `pnpm lint`                                                 |
| Форматирование  | Prettier                 | `pnpm format:check`                                         |

## Требования

- Node.js 22 + pnpm 10
- Rust stable с компонентом `clippy`
- Playwright: `pnpm exec playwright install chromium`
- Windows для полного Rust-прогона (тесты используют Windows-пути)

## Структура

```
src/**/*.test.ts          unit-тесты логики (lib, stores, hooks)
src/**/*.test.tsx         компонентные тесты
e2e/*.spec.ts             Playwright-сценарии
e2e/mock-tauri.ts         мок Tauri IPC и событий
e2e/helpers.ts            общие хелперы (bootstrap, sidebar, settingsNav)
tests/setup.ts            jsdom-подготовка и cleanup
src-tauri/tests/          интеграционные тесты Rust
src-tauri/tests/fixtures/ фикстуры внешних API (например, ответ GitHub Releases)
scripts/soak-check.mjs    soak-прогон с замером heap
scripts/i18n-check.mjs    контроль хардкодов локализации
scripts/check-release-metadata.mjs  версии, ссылки и плейсхолдеры релиза
scripts/extract-changelog.mjs        извлечение секции CHANGELOG для релиза
scripts/verify-portable.mjs          проверка portable-архива
```

## Локальный запуск

```bash
pnpm install
pnpm exec playwright install chromium

pnpm test            # unit
pnpm test:coverage   # unit + пороги покрытия
pnpm e2e             # E2E, сам поднимает vite
pnpm e2e:ui          # интерактивный UI-режим Playwright
```

E2E-тесты не требуют Tauri: `e2e/mock-tauri.ts` подменяет `window.__TAURI_INTERNALS__.invoke`,
события (`plugin:event|listen`) и плагины `path`, `fs`, `dialog`, `window`, `autostart`.

## Написание unit-тестов

- Импортируем `describe`, `it`, `expect` из `vitest` явными импортами.
- Один `describe` на функцию или группу функций, имена тестов — на русском, описывают поведение.
- Никаких `any`, `skip` и `.only`; проверяем поведение, а не внутренние детали.
- Модули, работающие с Tauri IPC, мокаем через `vi.mock("@/lib/storage", ...)` и подобные.
- Zustand-сторы проверяем через `useStore.setState(...)` + `getState()` с предварительным сбросом.

Пример:

```ts
import { describe, expect, it } from "vitest";

import { formatBytes } from "@/lib/trafficUtils";

describe("formatBytes", () => {
  it("перебирает единицы", () => {
    expect(formatBytes(512)).toBe("512 Б");
  });
});
```

## Написание E2E-тестов

- Один файл на раздел приложения (`first-run`, `navigation`, `strategies`, `logs`, `settings`, `adaptive`).
- `bootstrap(page, options)` поднимает мок и возвращает сборщик ошибок консоли; в конце теста
  проверяем `expect(errors).toEqual([])` — это гарантия чистой консоли.
- Локаторы — по ролям и доступным именам (`getByRole`), без CSS-классов и `data-testid`.
- Для навигации используем `sidebar(page, name)` и `settingsNav(page)`, чтобы не путать
  пункт сайдбара «О приложении» с секцией настроек.
- Не используем `waitForTimeout` как способ ожидания результата: сначала `expect(...).toBeVisible()`,
  паузы — только там, где нет наблюдаемого состояния.
- Обновление обновлений (`check_for_updates`) в моке умеет возвращать `available: true`;
  в этом случае приложение само открывает модалку релиза — это проверяется в `navigation.spec.ts`.

## Rust-тесты

```bash
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

403 unit-теста и 14 интеграционных. Логика обновления стратегий проверяется на настоящем
ответе GitHub API: фикстура `src-tauri/tests/fixtures/upstream_release_1.10.3.json` содержит
реальный релиз upstream (rar, tar.gz, zip) и проверяет, что выбирается zip, а также корректность
размера, ссылки, даты, отсутствия предложения при актуальной версии и учёта списка игнора.

## Покрытие

Пороги заданы в `vitest.config.ts`: statements 65, branches 55, functions 60, lines 65.
В отчёт входят `src/lib/**` и `src/stores/**`. IPC-адаптеры (`*Commands.ts`, `storage.ts`,
`secureInvoke.ts`, `systemInfo.ts`, `trayActions.ts`, `resources.ts`) исключены: они проверяются
E2E-сценариями и Rust-тестами.

## Soak-прогон

```bash
pnpm dev            # в отдельном терминале
pnpm e2e:soak       # 30 минут по умолчанию
```

Переменные: `SOAK_MINUTES`, `SOAK_MAX_GROWTH_MB`, `SOAK_URL`. Скрипт переключает все разделы,
запускает стратегию, принудительно собирает мусор через CDP и меряет JS heap. Падает, если рост
больше бюджета или в консоли появились ошибки.

## Локализация

`pnpm lint:i18n` считает русские строки, зашитые в код (словари, константы и тесты исключены).
Скрипт падает, если количество выросло относительно базовой линии (`I18N_BASELINE` в CI).
Полный перенос оставшихся строк в словари — отдельная задача, текущая линия зафиксирована
в `TEST_REPORT.md`.
