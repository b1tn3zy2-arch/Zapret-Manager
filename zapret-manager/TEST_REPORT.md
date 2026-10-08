# TEST_REPORT

Отчёт по этапу 22 (тестирование и аудит). Дата: 2026-10-08.

## Сводка

| Метрика                           | Значение                                                           |
| --------------------------------- | ------------------------------------------------------------------ |
| Unit-тесты frontend               | 240 (16 файлов)                                                    |
| Покрытие `src/lib` + `src/stores` | statements 75.5 %, branches 64.7 %, functions 75.7 %, lines 76.0 % |
| Unit-тесты Rust                   | 396                                                                |
| Интеграционные тесты Rust         | 14 (`src-tauri/tests/integration.rs`)                              |
| E2E-сценарии Playwright           | 30 (6 файлов)                                                      |
| clippy                            | 0 warning'ов (`--all-targets --all-features -- -D warnings`)       |
| cargo audit                       | 0 уязвимостей (577 зависимостей в `Cargo.lock`)                    |
| knip                              | 0 неиспользуемых файлов и экспортов                                |
| pnpm audit                        | уязвимостей нет (включая `--prod`)                                 |
| security-аудит проекта            | все проверки пройдены (CSP, capabilities, panic-конструкции)       |
| tsc / ESLint / Prettier           | 0 ошибок                                                           |
| Консоль на всех страницах         | чистая (проверяется в каждом E2E-сценарии)                         |

## Unit-тесты frontend

Файлы: `src/lib/{format,formatting,parseImport,validators,rarity,bloom,settings,telemetry,utils,sanitize}.test.ts`,
`src/stores/{stores,strategiesStore,settingsStore}.test.ts`, `src/hooks/useAdaptiveSidebar.test.ts`,
`src/components/ui/Button.test.tsx`.

Покрытые области: форматирование, безопасность (sanitize), импорт доменов/IP/портов, редкость и
статы карточек, bloom-токены, схема и экспорт настроек, трафик и ping, VPN-утилиты, snapshot,
geo, логи трея, zustand-сторы (app, logs, settings, strategies, update, vpn), адаптивный сайдбар,
компонент Button (клик, disabled, loading, aria-label, клавиатура).

## E2E-сценарии

| Файл                     | Сценариев | Что проверяет                                                                                                             |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `e2e/first-run.spec.ts`  | 4         | загрузка Dashboard, провайдер/пинг, чистая консоль на всех страницах, модалка первого запуска                             |
| `e2e/navigation.spec.ts` | 5         | старт без ошибок, шесть разделов, коллекция карт, оборотная сторона карточки, модалка обновления и Escape                 |
| `e2e/strategies.spec.ts` | 6         | пустое состояние с CTA, переключение карточек/списка, фильтр редкости, поиск, запуск стратегии с логом, закрытие карточки |
| `e2e/logs.spec.ts`       | 4         | панель фильтров и счётчики, записи запущенной стратегии, поиск и пустое состояние, очистка через диалог подтверждения     |
| `e2e/settings.spec.ts`   | 5         | переключение секций, сворачивание сайдбара, смена языка RU→EN и обратно, модалка лицензий                                 |
| `e2e/adaptive.spec.ts`   | 6         | пять viewport (800×600, 1280×800, 1920×1080, 2560×1440, 420×900) и поведение меню на узком экране                         |

## Rust-тесты

- 396 unit-тестов: scanner, injector, updater, security (`sanitize`, `paths`, `rate_limit`), system, vpn, tray.
- 14 интеграционных тестов (`src-tauri/tests/integration.rs`): разбор `.bat` (set-переменные, кавычки,
  `%VAR%`), `resolve_path`, экранирование cmd, валидация домена/порта/IP-диапазона, редактирование
  секретов в логах, обход каталога через `validate_strategy_id`/`safe_path`/`is_within`/`safe_filename`,
  разбор состояний трея, чтение реального `.bat` из временной директории.

## Аудит кода

- Удалены неиспользуемые файлы: `StrategySkeleton.tsx`, `useMotionBlur.ts`, `useNotifications.ts`, `motionBlur.ts`.
- Удалены мёртвые константы и функции (knip + tsc `noUnusedLocals`).
- Удалены неиспользуемые зависимости: `@tauri-apps/plugin-notification`, `plugin-opener`,
  `plugin-process`, `plugin-shell`, `date-fns`. Плагины остаются на стороне Rust
  (`tauri-plugin-*` в `Cargo.toml`, регистрация в `lib.rs`), JS-обёртки не использовались.
- Схемы IPC (`src/types/ipcSchemas.ts`) подключены к командам VPN и системной информации,
  ответы проверяются через `secureInvokeValidated`.

## Найденные и исправленные дефекты

| Дефект                                                                                                                           | Где                                                                                                                               | Исправление                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Вложенная кнопка `UpdateBadge` внутри кнопки навигации (React `validateDOMNesting`, невалидный HTML)                             | `src/components/layout/Sidebar.tsx`, `src/components/updates/UpdateBadge.tsx`                                                     | бейдж стал декоративным `<span aria-hidden>`, параметр `onClick` удалён                                    |
| Автосворачивание сайдбара не работало при старте на узком экране: эффект использовал `toggle()` и дважды срабатывал в StrictMode | `src/hooks/useAdaptiveSidebar.ts`                                                                                                 | авто-режим переведён на идемпотентный `setSidebarCollapsed`, добавлен селектор `selectSetSidebarCollapsed` |
| `formatBytes` показывал «3.00 ГБ» вместо «3 ГБ»                                                                                  | `src/lib/trafficUtils.ts`                                                                                                         | обрезка хвостовых нулей во всех единицах                                                                   |
| `buildTextFile([])` возвращал лишний перевод строки                                                                              | `src/lib/parseImport.ts`                                                                                                          | пустой результат возвращается как пустая строка                                                            |
| `scan_strategies` в E2E-моке возвращал поле `country`/`countryName` вместо `countryCode` — падал `CountryFlag`                   | `e2e/mock-tauri.ts`                                                                                                               | ответ приведён к контракту Rust (`countryCode`)                                                            |
| 12 замечаний clippy (`-D warnings`)                                                                                              | `injector.rs`, `injector_backup.rs`, `updater_backup.rs`, `resources_fs.rs`, `system.rs`, `sanitize.rs`, `tray/runtime.rs`, тесты | `sort_by_key`, схлопывание `if`, снятие лишнего `MAX_PORT`, `needless_borrow`, `bool_comparison`           |

## Утечки памяти

Прогон `scripts/soak-check.mjs` (`pnpm e2e:soak`) выполняет циклы по всем разделам с запуском
стратегии, принудительно собирает мусор через CDP `HeapProfiler.collectGarbage` и меряет
`Runtime.getHeapUsage`.

- Короткий прогон (1 мин, 8 циклов): рост heap 5.3 MB, ошибок консоли 0 — PASS.
- Полный прогон (30 мин, **229 циклов**): baseline 23.5 MB, пик 31.0 MB, **рост 7.5 MB**,
  ошибок консоли **0** — PASS (бюджет 20 MB).
- Динамика стабилизируется: 5.3 MB на 8 циклах, 6.2 MB на 120 циклах, 7.5 MB на 229 циклах,
  то есть рост замедляется и не выходит на линейную утечку.

Ограничения: замер идёт в браузере (Vite), а не в WebView2, и на одной физической модели;
реальный multi-monitor DPI soak не выполнялся (один монитор).

## Локализация

- Словари `src/i18n/ru.ts` и `src/i18n/en.ts` покрывают настройки, первый запуск, обновления, ресурсы.
- Смена языка мгновенная и проверена E2E-тестом (`settings.spec.ts`).
- Хардкодов русских строк вне словарей, констант и тестов: **305**. `pnpm lint:i18n` фиксирует
  эту цифру как базовую линию и падает при росте — полный перенос строк в словари вынесен
  за пределы этапа 22 и требует отдельного этапа.

## Известные ограничения

- Реальный WireGuard (connect/disconnect/killswitch) не проверялся: WireGuard не установлен в системе.
- Реальный multi-monitor DPI soak невозможен на одной физической модели.
- Консоль проверяется в браузерном окружении с моками Tauri, поведение WebView2 проверено только
  косвенно (сборка и ручной прогон приложения на этапах 19–21).
- Полный перенос локализации не завершён (см. выше).

## CI

`.github/workflows/ci.yml`: jobs `lint`, `test-frontend` (Vitest + coverage), `test-rust`
(cargo test + clippy на windows-latest), `e2e` (Playwright + Chromium), плюс существующий
`.github/workflows/security.yml` (cargo-audit, security-аудит проекта).

## Как проверить локально

```bash
pnpm test:coverage
pnpm e2e
cd src-tauri && cargo test && cargo clippy --all-targets -- -D warnings
cd .. && pnpm lint:dead && pnpm typecheck && pnpm lint && pnpm format:check
```
