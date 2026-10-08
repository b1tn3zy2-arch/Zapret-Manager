═══════════════════════════════════════════════════════════════════════
ЭТАП 25: ФИНАЛЬНЫЙ АУДИТ И РЕЛИЗ — «ОТПРАВКА В ПРОДАКШН»
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Провести тотальный аудит всего проекта — от кода до UX, от
безопасности до производительности. Найти и исправить ВСЕ
критические баги, утечки памяти, проблемы безопасности, места,
где нарушены best practices. После этого этапа приложение
должно быть готово к публикации на GitHub Releases как
production-ready v1.0.0.

Это последний шанс поймать проблемы до того, как их увидит
пользователь. Здесь нельзя пропускать ни одного пункта. Аудит
проводится по 12 категориям:
  1. Code Quality (структура, читаемость, дубликаты)
  2. Type Safety (TS + Rust)
  3. Memory & Leaks (утечки, неосвобождённые ресурсы)
  4. Performance (FPS, CPU, RAM, время отклика)
  5. Security (валидация, инъекции, права, секреты)
  6. Accessibility (a11y)
  7. UX (edge cases, empty states, error handling)
  8. Cross-platform (Windows 10/11, разные DPI)
  9. Dependencies (устаревшие, уязвимые, лишние)
  10. Documentation (README, комментарии, changelog)
  11. Testing (unit, integration, manual QA)
  12. Release Readiness (сборка, подпись, установщик)

После аудита — исправить найденное, собрать финальный .exe,
создать GitHub Release с changelog, обновить документацию.

⚠️ ВАЖНО: этот этап ДОЛЖЕН идти последним. Все предыдущие
этапы (1–24) — реализация. Этот — контроль качества и упаковка.
Нельзя начинать аудит, если хотя бы один функциональный этап
не завершён.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: МЕТОДОЛОГИЯ АУДИТА
═══════════════════════════════════════════════════════════════════════

【 ПРИНЦИП 1: Аудит — это НЕ «пробежаться глазами» 】

ОБОСНУЙ:
  • Каждая категория проверяется по чёткому чек-листу
  • Каждая проблема фиксируется в отчёт (даже мелкая)
  • Каждая проблема классифицируется по severity:
    - 🔴 Critical — блокирует релиз
    - 🟠 High — исправить до релиза
    - 🟡 Medium — исправить, если возможно
    - 🟢 Low — в бэклог на v1.1
  • После аудита — исправление 🔴 и 🟠, остальное — в TODO

【 ПРИНЦИП 2: Автоматизация везде, где можно 】

ОБОСНУЙ:
  • Не проверять вручную то, что проверяет линтер
  • Не проверять вручную то, что проверяет тест
  • Не проверять вручную то, что проверяет CI
  • Ручной аудит — только для того, что нельзя
    автоматизировать (UX, edge cases)

ИНСТРУМЕНТЫ:
  • pnpm tsc --noEmit — типы
  • pnpm eslint — стиль и ошибки
  • pnpm prettier --check — форматирование
  • cargo clippy -- -D warnings — Rust-линтер
  • cargo audit — уязвимости в зависимостях
  • pnpm audit — уязвимости в npm-зависимостях
  • cargo test — unit-тесты
  • pnpm vitest — unit-тесты frontend
  • Playwright — E2E-тесты
  • Lighthouse — производительность
  • Trivy — сканирование контейнера (опционально)

【 ПРИНЦИП 3: Отчёт — структурированный документ 】

ОБОСНУЙ:
  • После аудита создаётся файл AUDIT_REPORT.md
  • Каждая проблема: категория, severity, описание, файл,
    строка, рекомендация
  • Статистика: сколько 🔴 / 🟠 / 🟡 / 🟢
  • План исправления: что, когда, кем (в одну сессию)
  • Финальный вердикт: «Готов к релизу» / «Нужно исправить
    X»

【 ПРИНЦИП 4: Тестирование на «чистой» системе ]

ОБОСНУЙ:
  • Все тесты на машине разработчика — недостаточно
  • Нужна чистая Windows (виртуалка):
    - Без Node.js, Rust, Tauri
    - Без установленного zapret
    - Без WireGuard
    - Без антивируса (или со стандартным Defender)
  • Проверить, что установщик работает «с нуля»
  • Проверить, что приложение не падает при первом запуске

【 ПРИНЦИП 5: Не только «работает», но и «не работает правильно» ]

ОБОСНУЙ:
  • Что если папка стратегий удалена?
  • Что если .bat файл повреждён?
  • Что если WireGuard не установлен?
  • Что если нет прав админа?
  • Что если интернет отключён?
  • Что если пользователь ввёл невалидный домен?
  • Что если два экземпляра приложения запущены?
  • Что если обновление скачано наполовину?
  • Проверить ВСЕ эти сценарии

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: 12 КАТЕГОРИЙ АУДИТА — ДЕТАЛЬНЫЕ ЧЕК-ЛИСТЫ
═══════════════════════════════════════════════════════════════════════

【 КАТЕГОРИЯ 1: CODE QUALITY 】

Проверки:
  □ Нет мёртвого кода (unused exports, функции,
    переменные)
    - Команда: pnpm eslint --rule "no-unused-vars: error"
    - Команда: cargo clippy -- -W unused
  □ Нет закомментированных блоков кода
    - Поиск: grep -r "^//\s*[a-zA-Z]" src/
  □ Нет console.log / println! в production-коде
    - Поиск: grep -r "console.log" src/
    - Поиск: grep -r "println!" src-tauri/src/
    - Разрешить только tracing::info/debug
  □ Нет TODO / FIXME без issue-ссылки
    - Поиск: grep -r "TODO\|FIXME" src/ src-tauri/
    - Каждый TODO должен иметь ссылку на GitHub issue
  □ Нет дубликатов кода (DRY)
    - Проверить: одинаковые функции в разных файлах
    - Проверить: одинаковые CSS-классы в разных компонентах
  □ Функции < 50 строк
    - Скрипт: найти функции > 50 строк
  □ Файлы < 300 строк
    - Скрипт: найти файлы > 300 строк
  □ Осмысленные имена
    - Нет: a, b, x, temp, data1, doStuff
    - Есть: strategy, userInput, fetchStrategies
  □ Одна ответственность на функцию
    - Нет функций, которые и читают файл, и парсят, и пишут
  □ Комментарии объясняют «почему», не «что»
    - Плохо: // Увеличиваем i
    - Хорошо: // Пропускаем первую строку — она всегда
      заголовок

ИНСТРУМЕНТЫ:
  • ESLint с strict-конфигом
  • Clippy с -D warnings
  • jscpd (поиск дубликатов) — опционально
  • Типизация строгая (см. категорию 2)

【 КАТЕГОРИЯ 2: TYPE SAFETY 】

Проверки TypeScript:
  □ tsconfig.json: strict: true
  □ Ни одного any
    - grep -rn ": any\|<any>\|as any" src/
  □ Ни одного @ts-ignore / @ts-expect-error без обоснования
    - grep -rn "@ts-" src/
  □ Все пропсы компонентов типизированы (interface)
  □ Все event handlers типизированы
  □ useRef<T>(null) с generic
  □ Promise<void> явный return type у async-функций
  □ Union-типы вместо boolean-флагов где возможно
  □ noUncheckedIndexedAccess: true
  □ exactOptionalPropertyTypes: true

Проверки Rust:
  □ cargo clippy -- -D warnings — 0 warnings
  □ Никаких unwrap() без комментария-обоснования
    - grep -rn "\.unwrap()" src-tauri/src/
    - Каждый unwrap — с комментарием почему безопасен
  □ Никаких .expect("...") без обоснования
  □ Result<T, E> для всех fallible операций
  □ Custom error types через thiserror
  □ Нет panic! в production-коде
  □ Нет todo!() / unimplemented!()

ИНСТРУМЕНТЫ:
  • pnpm tsc --noEmit
  • cargo clippy --all-targets -- -D warnings
  • cargo check --all-features

【 КАТЕГОРИЯ 3: MEMORY & LEAKS 】

Проверки:
  □ dispose() для Three.js: geometry, material, texture,
    renderer
    - Проверить все компоненты с Canvas (нет на этом
      проекте, но если есть 3D-визуализации)
  □ Cleanup в useEffect:
    - removeEventListener
    - cancelAnimationFrame
    - clearTimeout / clearInterval
    - unsubscribe (Zustand, Tauri listen)
    - abortController.abort()
  □ ResizeObserver disconnect в cleanup
  □ Отписка от Tauri listen при unmount
    - Проверить: все listen() имеют unlisten в return
  □ Нет циклических ссылок в сторах
  □ Нет подписок без отписки
  □ AbortController для fetch при unmount
  □ Rust: join handles дожидаются, Mutex не остаются
    залоченными

ПРОВЕРКА:
  • Chrome DevTools → Memory → Heap Snapshot
    - Сделать snapshot → навигация по всем страницам →
      вернуться → snapshot
    - Разница должна быть минимальной (< 5 MB)
  • Chrome DevTools → Performance Monitor
    - Открыть, работать 10 минут, следить за JS heap
    - Не должно расти постоянно
  • Windows Task Manager → RAM приложения
    - После 30 минут работы: < 400 MB
    - После открытия/закрытия 10 страниц: не растёт

ИНСТРУМЕНТЫ:
  • Chrome DevTools Memory Profiler
  • Windows Performance Monitor
  • Rust: cargo instruments (опционально)

【 КАТЕГОРИЯ 4: PERFORMANCE 】

Проверки:
  □ Холодный старт < 2 сек
    - Замер: от запуска .exe до готового UI
  □ Переключение страниц < 100ms
    - Замер: через Performance API
  □ 60 FPS на всех анимациях
    - Chrome DevTools → Performance → записать
    - Проверить: нет long tasks > 50ms
  □ 60 FPS при скролле списка 10 000 строк
  □ 60 FPS при resize окна
  □ CPU < 5% в idle
    - Windows Task Manager → 30 сек наблюдения
  □ CPU < 15% при активной стратегии + монитор
  □ RAM < 400 MB после 30 мин работы
  □ RAM < 500 MB при 10 000 логов
  □ График Монитора — 60 FPS
  □ Виртуализация логов — 60 FPS при потоке 100/сек
  □ Нет утечек памяти (см. категорию 3)
  □ Нет дублирующихся сетевых запросов
  □ Все изображения оптимизированы (WebP, SVG)
  □ Шрифты локальные (не CDN)
  □ Lazy loading для тяжёлых модулей (Monitor, Settings)
  □ Code splitting (React.lazy)

ЗАМЕРЫ:
  • Chrome DevTools → Performance
  • Chrome DevTools → Lighthouse
  • Windows Performance Monitor
  • Rust: cargo flamegraph (для CPU-тяжёлых мест)

ЦЕЛЕВЫЕ ЗНАЧЕНИЯ:
  • FCP: < 1 sec
  • TTI: < 2 sec
  • Холодный старт: < 2 sec
  • Bundle size: < 3 MB (gzip)
  • Финальный .exe: < 50 MB

【 КАТЕГОРИЯ 5: SECURITY 】

Проверки:
  □ Валидация ВСЕХ входных данных
    - Rust: Result<T, E> для каждого парсинга
    - TS: zod-схемы для форм
  □ Защита от path traversal
    - Проверка: не выйти за пределы папки приложения
    - Rust: canonicalize() + проверка префикса
  □ Защита от инъекций в командах
    - Не передавать пользовательский ввод в cmd/netsh
      без экранирования
    - Использовать массивы аргументов, не конкатенацию
  □ Нет eval / Function() / dangerouslySetInnerHTML
    - grep -rn "eval\|Function(\|dangerouslySetInnerHTML"
      src/
  □ Секреты не в коде
    - Нет API-ключей, токенов, паролей в репозитории
    - Все секреты — в env
  □ CSP настроен в tauri.conf.json
  □ Capabilities — только необходимые разрешения
  □ UAC-повышение только когда нужно
  □ Нет хранения чувствительных данных в plaintext
  □ Логи не содержат чувствительной информации
    - Не логировать: пароли, PrivateKey из WireGuard
  □ Обновления проверяются через HTTPS
  □ Установщик не требует ненужных прав
  □ Нет выполнения произвольного кода из архива
    - При обновлении не запускать .bat из архива
    - Только копировать в папку

ИНСТРУМЕНТЫ:
  • cargo audit — уязвимости в Rust-зависимостях
  • pnpm audit — уязвимости в npm-зависимостях
  • Trivy — сканирование (опционально)
  • Ручная проверка критичных мест

【 КАТЕГОРИЯ 6: ACCESSIBILITY (a11y) 】

Проверки:
  □ Все интерактивные элементы доступны с клавиатуры
    - Tab-навигация проходит по всем
    - Enter / Space активируют
    - Escape закрывает модалки/dropdown
  □ focus-visible стилизован на всех интерактивных
  □ aria-label на всех icon-only кнопках
  □ aria-busy на кнопках с loading
  □ role="switch" + aria-checked на Toggle
  □ role="dialog" + aria-modal + aria-labelledby на
    Modal
  □ aria-invalid + aria-describedby на Input с ошибкой
  □ aria-live для динамического контента (логи)
  □ Семантические теги (h1-h6, nav, main, aside)
  □ Контраст текста ≥ 4.5:1
    - Проверить через WebAIM Contrast Checker
  □ prefers-reduced-motion учтён
    - Отключить или упростить анимации
  □ Screen reader-friendly
    - Проверить через NVDA (Windows)
  □ Нет auto-play видео/аудио без кнопки выключения
  □ Размер интерактивных элементов ≥ 44×44px на touch

ИНСТРУМЕНТЫ:
  • Lighthouse → Accessibility
  • axe DevTools (расширение)
  • NVDA (бесплатный screen reader)
  • WebAIM Contrast Checker

ЦЕЛЕВОЙ SCORE:
  • Lighthouse Accessibility ≥ 95

【 КАТЕГОРИЯ 7: UX — EDGE CASES 】

Проверки:
  □ Что если папка стратегий удалена во время работы?
    - Ожидание: понятная ошибка, приложение не падает
  □ Что если .bat файл пустой?
    - Ожидание: пропущен в списке
  □ Что если .bat содержит невалидные пути?
    - Ожидание: ошибка с деталями
  □ Что если WireGuard не установлен?
    - Ожидание: сообщение + ссылка на скачивание
  □ Что если нет прав админа?
    - Ожидание: понятное сообщение при попытке
  □ Что если интернет отключён?
    - Ожидание: работа offline, ошибка при проверке
      обновлений
  □ Что если пользователь ввёл невалидный домен?
    - Ожидание: валидация, красный бордер, сообщение
  □ Что если два экземпляра приложения запущены?
    - Ожидание: фокус на первом, второй закрывается
    - Или: разрешено, но с предупреждением
  □ Что если обновление скачано наполовину?
    - Ожидание: можно докачать или отменить
  □ Что если конфиг WireGuard повреждён?
    - Ожидание: валидация при импорте, ошибка
  □ Что если во время запуска стратегии приложение
     закрыто?
    - Ожидание: все процессы убиваются
  □ Что если во время switch DPI → VPN приложение
     закрыто?
    - Ожидание: корректное завершение или откат
  □ Empty states для всех списков
  □ Error states для всех async-операций
  □ Loading states для всех async-операций
  □ Понятные сообщения об ошибках (не «Error 0x8000...»)
  □ Кнопки disabled во время операций

ТЕСТИРОВАНИЕ:
  • Ручной прогон каждого сценария
  • Отметить: PASS / FAIL / PARTIAL
  • FAIL — исправить

【 КАТЕГОРИЯ 8: CROSS-PLATFORM (Windows) 】

Проверки:
  □ Windows 10 (1809+)
    - Тест на виртуалке
  □ Windows 11 (21H2+)
    - Основная платформа
  □ Windows Server 2019/2022 (опционально)
  □ DPI 100%, 125%, 150%, 175%, 200%
    - UI не размытый
    - Canvas чёткий
  □ Разные разрешения: 1366×768, 1920×1080, 2560×1440,
     3840×2160
  □ Ultrawide (3440×1440, 5120×1440)
  □ Мультимониторы с разным DPI
  □ Touch-устройства (Surface)
  □ Разные антивирусы:
    - Windows Defender
    - Kaspersky
    - ESET
    - Bitdefender
    - Не блокируют запуск .bat, UAC, netsh
  □ Разные языки системы:
    - Русский
    - Английский
    - Немецкий (проверка кодировки)
  □ Разные раскладки клавиатуры
  □ Приложение работает без установленного WebView2?
    - Tauri требует WebView2 (встроен в Win 11, в Win 10
      может отсутствовать)
    - Решение: bootstrapper или fallback

ИНСТРУМЕНТЫ:
  • VMware / VirtualBox с чистой Windows
  • Разные физические машины (если доступны)

【 КАТЕГОРИЯ 9: DEPENDENCIES 】

Проверки:
  □ Нет устаревших пакетов
    - pnpm outdated — проверить
    - cargo outdated — проверить
    - Обновить patch-версии
    - Major-версии — только если критические уязвимости
  □ Нет уязвимых пакетов
    - pnpm audit — 0 high/critical
    - cargo audit — 0 vulnerabilities
  □ Нет лишних пакетов
    - Проверить каждую зависимость в package.json
    - Проверить каждую в Cargo.toml
    - Удалить неиспользуемые
  □ Все версии зафиксированы (lock-файлы)
    - pnpm-lock.yaml — в git
    - Cargo.lock — в git
  □ Лицензии совместимы
    - Проверить: все MIT / Apache 2.0 / BSD
    - Нет GPL (если проект MIT)
    - Инструмент: license-checker
  □ Нет deprecated API
    - Проверить: React 19, Tauri 2, Tailwind 4
  □ Bundle size проанализирован
    - npx vite-bundle-visualizer
    - Проверить: нет дублирующихся библиотек
    - Проверить: нет больших пакетов без необходимости

ИНСТРУМЕНТЫ:
  • pnpm audit
  • cargo audit
  • pnpm outdated
  • cargo outdated
  • license-checker
  • vite-bundle-visualizer
  • bundlephobia.com (для проверки размера пакетов)

【 КАТЕГОРИЯ 10: DOCUMENTATION 】

Проверки:
  □ README.md — полный:
    - Описание проекта
    - Скриншоты (2–5 штук)
    - Установка (Windows, Mac, Linux — если поддерживается)
    - Быстрый старт
    - Основные функции
    - FAQ
    - Лицензия
    - Контакты
  □ CHANGELOG.md — история версий
    - Формат: Keep a Changelog
    - Каждая версия: Added / Changed / Fixed / Removed
  □ LICENSE — MIT или Apache 2.0
  □ CONTRIBUTING.md (если open-source)
  □ CODE_OF_CONDUCT.md (опционально)
  □ Комментарии в коде — на русском, объясняют «почему»
  □ JSDoc для публичных функций (опционально)
  □ Rustdoc для публичных функций
  □ GitHub Issue templates (bug, feature)
  □ GitHub PR template
  □ GitHub Actions workflow (CI)
  □ Скриншоты в /docs/screenshots/
  □ Демо-видео (опционально, для релиза)

ИНСТРУМЕНТЫ:
  • markdownlint
  • Проверка: открыть README в GitHub Preview

【 КАТЕГОРИЯ 11: TESTING 】

Проверки:
  □ Unit-тесты (Rust):
    - Парсинг .bat (5+)
    - Парсинг WireGuard .conf (3+)
    - Сравнение версий (3+)
    - Merge конфигов (2+)
    - Netsh-команды (1+)
    - Итого: 15+ тестов
    - Покрытие: > 60%
  □ Unit-тесты (Frontend, Vitest):
    - Утилиты (formatBytes, formatTime)
    - Селекторы (Zustand)
    - Валидаторы (isValidDomain)
    - Итого: 20+ тестов
  □ Integration-тесты (Rust):
    - Scan + parse + return
    - Inject + backup + restore
    - Update check + download (mock)
  □ E2E-тесты (Playwright):
    - Открытие приложения
    - Переключение страниц
    - Запуск стратегии (mock)
    - Изменение настроек
    - Импорт/экспорт
    - Итого: 10+ сценариев
  □ Ручное QA:
    - Прогон всех edge cases (см. категорию 7)
    - Тест на чистой Windows
    - Тест на разных DPI
    - Тест с антивирусом
  □ Тесты проходят в CI
  □ Тесты быстрые (< 2 мин total)

ИНСТРУМЕНТЫ:
  • cargo test
  • pnpm vitest
  • Playwright
  • cargo tarpaulin (покрытие Rust)
  • vitest --coverage (покрытие frontend)

ЦЕЛИ:
  • Rust: ≥ 15 тестов, 60%+ покрытие
  • Frontend: ≥ 20 тестов
  • E2E: ≥ 10 сценариев
  • Все зелёные

【 КАТЕГОРИЯ 12: RELEASE READINESS 】

Проверки:
  □ Версия обновлена (0.1.0 → 1.0.0)
    - package.json
    - Cargo.toml
    - tauri.conf.json
  □ CHANGELOG актуален для 1.0.0
  □ Иконки всех размеров:
    - 16×16, 32×32, 48×48, 64×64, 128×128, 256×256,
      512×512
    - .ico для Windows
    - .icns для macOS (если нужно)
    - .png для Linux (если нужно)
  □ Установщик NSIS собран:
    - installMode: currentUser
    - Языки: RU + EN
    - Иконки
    - Метаданные (Publisher, DisplayName)
  □ Цифровая подпись (опционально):
    - EV-сертификат (если есть)
    - Иначе — предупреждение SmartScreen
  □ Portable версия (.zip без установки)
  □ Проверка на VirusTotal:
    - Загрузить .exe
    - 0/70 детектов
    - Если детекты — разобраться почему
  □ GitHub Release:
    - Tag: v1.0.0
    - Title: «Zapret Manager v1.0.0 — [name]»
    - Description: changelog + скриншоты
    - Assets: .exe установщик, portable .zip, checksums
    - SHA-256 для каждого asset
  □ Автообновление настроено:
    - Endpoint указывает на GitHub Releases
    - pubkey для проверки подписи
  □ Автоматизация релиза:
    - GitHub Actions workflow
    - Сборка на push в tag
    - Загрузка assets в Release
  □ Документация релиза:
    - INSTALL.md (как установить)
    - UNINSTALL.md (как удалить)
    - TROUBLESHOOTING.md (частые проблемы)

ИНСТРУМЕНТЫ:
  • pnpm tauri build
  • signtool (для подписи)
  • VirusTotal
  • GitHub CLI (gh release create)
  • GitHub Actions

═══════════════════════════════════════════════════════════════════════
📋 ЧАСТЬ 3: ПРОЦЕСС АУДИТА (пошагово)
═══════════════════════════════════════════════════════════════════════

ФАЗА 1: ПОДГОТОВКА

ШАГ 1.1: Создать ветку audit/final
  • git checkout -b audit/final
  • Всё исправление — в этой ветке
  • После — merge в main

ШАГ 1.2: Установить инструменты
  • pnpm add -D vitest @vitest/coverage-v8
  • pnpm add -D @playwright/test
  • pnpm add -D eslint-plugin-import
  • cargo install cargo-audit cargo-outdated
  • cargo install cargo-tarpaulin

ШАГ 1.3: Настроить CI
  • .github/workflows/ci.yml — lint + test + build
  • .github/workflows/release.yml — сборка релиза на tag

ШАГ 1.4: Запустить автоматические проверки
  • pnpm tsc --noEmit → сохранить отчёт
  • pnpm eslint → сохранить отчёт
  • cargo clippy -- -D warnings → сохранить отчёт
  • cargo audit → сохранить
  • pnpm audit → сохранить
  • Собрать все отчёты в AUDIT_REPORT.md

ФАЗА 2: РУЧНОЙ АУДИТ

ШАГ 2.1: Пройти чек-листы категорий 1–12
  • По каждой — отметить PASS / FAIL
  • FAIL — записать в отчёт

ШАГ 2.2: Тестирование на чистой Windows
  • Виртуалка / отдельный ПК
  • Установить .exe
  • Пройти все сценарии использования
  • Записать найденное

ШАГ 2.3: Тестирование edge cases
  • Пройти все из категории 7
  • Записать найденное

ШАГ 2.4: Memory Profiling
  • Chrome DevTools → Memory
  • 30 мин работы → snapshot → diff
  • Записать рост heap

ШАГ 2.5: Performance Profiling
  • Chrome DevTools → Performance
  • Lighthouse
  • Windows Performance Monitor
  • Записать метрики

ШАГ 2.6: Accessibility Audit
  • Lighthouse → Accessibility
  • axe DevTools
  • NVDA screen reader
  • Записать проблемы

ФАЗА 3: ИСПРАВЛЕНИЕ

ШАГ 3.1: Классифицировать проблемы
  • 🔴 Critical — блокирует релиз
  • 🟠 High — исправить сейчас
  • 🟡 Medium — исправить, если возможно
  • 🟢 Low — в бэклог

ШАГ 3.2: Исправить 🔴 и 🟠
  • Каждое исправление — отдельный commit
  • Сообщение: «fix: [краткое описание] (audit)»
  • После каждого — прогнать тесты

ШАГ 3.3: Повторный аудит
  • После исправлений — снова пройти чек-листы
  • Убедиться, что всё PASS

ШАГ 3.4: Обновить AUDIT_REPORT.md
  • Отметить, что исправлено
  • Оставить список 🟡 и 🟢 для будущих версий

ФАЗА 4: ФИНАЛЬНАЯ СБОРКА

ШАГ 4.1: Обновить версии
  • package.json: "version": "1.0.0"
  • Cargo.toml: version = "1.0.0"
  • tauri.conf.json: "version": "1.0.0"

ШАГ 4.2: Обновить CHANGELOG.md
  • Добавить секцию [1.0.0]
  • Перечислить всё, что сделано

ШАГ 4.3: Собрать финальный .exe
  • pnpm tauri build
  • Проверить размер (< 50 MB)
  • Проверить, что запускается

ШАГ 4.4: Тест финальной сборки
  • Установить на чистую Windows
  • Пройти все сценарии
  • Убедиться, что всё работает

ШАГ 4.5: Проверка на VirusTotal
  • Загрузить .exe
  • 0/70 детектов

ШАГ 4.6: Создать GitHub Release
  • Tag: v1.0.0
  • Title: «Zapret Manager v1.0.0»
  • Description: changelog + скриншоты
  • Assets: .exe, portable .zip, SHA-256
  • Pre-release: false

ШАГ 4.7: Merge audit/final → main
  • После успешного релиза
  • Tag уже на нужном commit

ШАГ 4.8: Объявление
  • Post в GitHub Discussions
  • Обновить README с бейджем «v1.0.0»
  • Обновить sitemap, если есть сайт

═══════════════════════════════════════════════════════════════════════
📄 ЧАСТЬ 4: ФОРМАТ AUDIT_REPORT.md
═══════════════════════════════════════════════════════════════════════

Файл в корне проекта: AUDIT_REPORT.md

Структура:
```markdown
# Audit Report — Zapret Manager v1.0.0

Дата: 2026-XX-XX
Версия: 1.0.0
Аудитор: [имя / AI-агент]

## Сводка

- 🔴 Critical: 3 → исправлено 3
- 🟠 High: 8 → исправлено 8
- 🟡 Medium: 15 → исправлено 10, в бэклог 5
- 🟢 Low: 22 → в бэклог 22

**Вердикт: Готов к релизу.**

## Категория 1: Code Quality

### 🔴 [CQ-001] Функция scan_strategies > 100 строк
- **Файл:** src-tauri/src/commands/scanner.rs:45
- **Описание:** Функция делает слишком много: читает
  папку, парсит .bat, определяет сервисы.
- **Рекомендация:** разбить на 3 функции.
- **Исправлено:** ✅ в commit abc1234

### 🟠 [CQ-002] ...
...

## Категория 2: Type Safety
...

## Категория 3: Memory & Leaks
...

## ... (все 12 категорий)

## Тестирование на чистой Windows
- Windows 10 22H2: PASS
- Windows 11 23H2: PASS
- DPI 100% / 125% / 150% / 200%: PASS
- Antivirus (Defender, Kaspersky): PASS

## Memory Profiling
- JS heap после 30 мин: 180 MB (не растёт)
- Rust memory: 120 MB (стабильно)
- Итого: 300 MB

## Performance
- Холодный старт: 1.4 сек
- Переключение страниц: 45 ms
- FPS при скролле 10 000 логов: 60
- CPU idle: 1.2%
- CPU active: 8.5%

## Accessibility
- Lighthouse: 97
- axe DevTools: 0 critical issues
- NVDA: корректно читает все элементы

## Релиз
- .exe размер: 38 MB
- VirusTotal: 0/70
- Установка на чистую Windows: PASS
- Автообновление: PASS

## Осталось в бэклог (v1.1)
- 🟡 [CQ-005] Разбить большой файл компонента
- 🟡 [UX-012] Добавить keyboard shortcuts для навигации
- 🟢 [CQ-018] Заменить устаревшие иконки
- ...