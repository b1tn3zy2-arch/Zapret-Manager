# ЭТАП 23: ДЕПЛОЙ — РЕЛИЗ И ПУБЛИКАЦИЯ

═══════════════════════════════════════════════════════════════════════
ЭТАП 23: ДЕПЛОЙ — РЕЛИЗ И ПУБЛИКАЦИЯ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Собрать финальный релиз приложения, автоматизировать процесс
сборки и публикации через GitHub Actions, настроить подпись
.exe (если доступен сертификат), создать GitHub Release с
полным набором артефактов (.exe установщик, .msi, portable,
checksums), написать CHANGELOG и README для пользователя,
провести smoke-тест релиза на чистой системе, опубликовать
релиз и обеспечить механизм автообновления через GitHub
Releases API.

После этого этапа пользователь сможет:
  • Скачать финальный установщик с GitHub Releases
  • Установить приложение одним кликом
  • Автоматически получать уведомления об обновлениях
  • Проверить целостность скачанного файла (SHA-256)
  • Прочитать CHANGELOG и README на русском и английском
  • Сообщить о проблеме через GitHub Issues

Это финальный этап проекта. После него приложение становится
публичным продуктом, готовым к использованию реальными
пользователями. Каждый релиз должен быть безупречным:
подписан (если возможно), протестирован, снабжён документацией,
опубликован с чётким changelog.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: GitHub Releases как основной канал дистрибуции 】

ОБОСНУЙ:
  • GitHub Releases — бесплатный, надёжный, с CDN
  • Не требует своего сервера
  • Поддерживает: assets, release notes, checksums,
    подписи
  • Встроен в GitHub Actions (один workflow)
  • Уже используется для проверки обновлений (Этап 12)
  • Пользователи доверяют GitHub

ПОЧЕМУ НЕ СВОЙ САЙТ:
  • Нужен хостинг, CDN, SSL, обслуживание
  • Дороже
  • Дольше настраивать
  • GitHub уже даёт всё

ПОЧЕМУ НЕ MICROSOFT STORE:
  • Требует разработчицкий аккаунт ($19 единоразово)
  • Долгий процесс проверки
  • Ограничения на системные утилиты
  • Не подходит для Open Source проекта

ПОЧЕМУ НЕ WINGET / CHOCOLATEY:
  • Дополнительные шаги
  • Можно добавить позже (после релиза на GitHub)
  • Не приоритет для MVP

【 РЕШЕНИЕ 2: Три формата релиза: NSIS Setup, MSI, Portable ZIP 】

ОБОСНУЙ:
  • Разные пользователи — разные предпочтения:
    - NSIS Setup (.exe) — для 90% пользователей, красивый
      установщик с кастомными страницами
    - MSI — для корпоративных развёртываний
      (Group Policy, SCCM)
    - Portable ZIP — для тех, кто не хочет установку
  • Tauri 2 собирает NSIS + MSI одной командой
  • Portable — добавим вручную через скрипт

АРТЕФАКТЫ НА RELEASE:
  • ZapretManager_0.1.0_x64-setup.exe (NSIS, ~40 MB)
  • ZapretManager_0.1.0_x64_en-US.msi (MSI, ~45 MB)
  • ZapretManager_0.1.0_x64_portable.zip (~50 MB)
  • SHA256SUMS.txt (все хеши)
  • CHANGELOG.md

ПОЧЕМУ НЕ ТОЛЬКО NSIS:
  • Корпоративные пользователи хотят MSI
  • Portable — для тестирования и переносных USB

ПОЧЕМУ НЕ APPX / MSIX:
  • Требует сертификат Microsoft
  • Дорого
  • Ограничения

【 РЕШЕНИЕ 3: Автоматизация через GitHub Actions (release.yml) 】

ОБОСНУЙ:
  • Ручная сборка → ошибки, долго, не воспроизводимо
  • GitHub Actions:
    - Триггер: тег vX.Y.Z
    - Сборка на windows-latest
    - Подпись (если есть секреты)
    - Загрузка артефактов
    - Публикация Release
    - Генерация checksums
  • Воспроизводимо
  • Нет человеческого фактора

WORKFLOW:
  1. Checkout
  2. Setup Node + pnpm + Rust
  3. Install deps
  4. Run tests (unit + lint)
  5. Build (pnpm tauri build)
  6. (Опционально) Sign
  7. Generate checksums
  8. Create GitHub Release
  9. Upload assets
  10. (Опционально) Notify

ПОЧЕМУ АВТОМАТИЗАЦИЯ:
  • Release — критичный процесс
  • Ошибка → плохой UX
  • Ручная сборка = 20+ минут
  • CI = 15 минут без участия

【 РЕШЕНИЕ 4: Code Signing (опционально, для будущего) 】

ОБОСНУЙ:
  • Без подписи Windows SmartScreen показывает
    «Неизвестный издатель»
  • Пользователь должен нажать «Подробнее» → «Выполнить
    в любом случае»
  • Плохой first-run experience
  • Решение: подпись через EV-сертификат (дорого, ~$300/год)
    или OV-сертификат
  • Альтернатива: SignPath (бесплатно для Open Source)

ПЛАН:
  • На этом этапе — настраиваем pipeline для подписи
  • Секреты (CERT, PASSWORD) добавляются в GitHub Secrets
  • Если секретов нет — сборка проходит без подписи
  • В будущем — добавить сертификат

ПОЧЕМУ НЕ СЕЙЧАС:
  • Требует времени на получение сертификата
  • Для MVP достаточно без подписи
  • Механизм готов — включим когда будет

【 РЕШЕНИЕ 5: Semantic Versioning (SemVer) для версий 】

ОБОСНУЙ:
  • Формат: MAJOR.MINOR.PATCH
  • MAJOR: несовместимые изменения
  • MINOR: новые функции (обратно совместимо)
  • PATCH: баг-фиксы
  • Тег: v0.1.0 (с префиксом v)
  • Версия в 4 местах:
    - package.json
    - src-tauri/Cargo.toml
    - src-tauri/tauri.conf.json
    - CHANGELOG.md
  • Скрипт синхронизации (bump версии везде)

ПОЧЕМУ SemVer:
  • Стандарт де-факто
  • Понятно пользователям
  • Работает с npm/cargo

ПОЧЕМУ НЕ КАЛЕНДАРНЫЕ ВЕРСИИ:
  • Меньше информации
  • Не ясно, совместимо ли

【 РЕШЕНИЕ 6: CHANGELOG в формате Keep a Changelog 】

ОБОСНУЙ:
  • Формат: https://keepachangelog.com
  • Секции: Added, Changed, Deprecated, Removed, Fixed,
    Security
  • Языки: русский + английский (в одном файле)
  • Обновляется при каждом релизе
  • Публикуется в GitHub Release notes

ПРИМЕР:
```markdown
## [0.1.0] - 2026-10-05

### Added
- Управление стратегиями обхода блокировок
- Поддержка Discord, YouTube, Outlast Trials
- Переключение bat ↔ VPN (WireGuard/Amnezia)
- Визуализатор трафика в реальном времени
- Системный трей с анимациями
- Автообновление через GitHub Releases

### Security
- Валидация всех входных данных
- Защита от path traversal и command injection
- Проверка целостности ресурсов (SHA-256)
```

ПОЧЕМУ ВАЖНО:
  • Пользователь видит, что изменилось
  • Не нужно читать commits
  • Стандарт индустрии

【 РЕШЕНИЕ 7: README с быстрым стартом (RU + EN) 】

ОБОСНУЙ:
  • Первое, что видит пользователь на GitHub
  • Должен ответить на 3 вопроса:
    1. Что это? (one-liner)
    2. Как установить? (шаги)
    3. Как использовать? (скриншоты + gif)
  • RU + EN — в одном файле (переключатель)
  • Скриншоты и демо-gif — обязательны

СТРУКТУРА README:
  • Логотип + название + one-liner
  • Badges (CI, License, Version)
  • Скриншот Dashboard
  • Возможности (bullet list)
  • Установка (ссылка на Releases)
  • Быстрый старт (3 шага)
  • FAQ
  • Лицензия

ПОЧЕМУ НЕ ОТДЕЛЬНЫЙ САЙТ:
  • GitHub и так даёт страницу
  • Легко поддерживать
  • Фокус на продукте

【 РЕШЕНИЕ 8: Changelog автоматически в Release Notes 】

ОБОСНУЙ:
  • В release.yml — шаг, который извлекает секцию
    CHANGELOG для текущей версии
  • Передаётся в body GitHub Release
  • Пользователь видит полный changelog на странице
    релиза
  • Автоматизация = нет ошибок

ПАРСИНГ:
  • Regex: `## \[X.Y.Z\] - \d{4}-\d{2}-\d{2}(.*?)(?=## \[|\z)`
  • Извлечение секции

ПОЧЕМУ ВАЖНО:
  • Consistency
  • Пользователь сразу видит, что нового

【 РЕШЕНИЕ 9: Smoke-тест релиза на чистой системе 】

ОБОСНУЙ:
  • CI-сборка ≠ работает
  • Нужен smoke-тест:
    - Установить .exe на чистую Windows VM
    - Запустить приложение
    - Проверить: окно открывается, нет крашей,
      базовые операции работают
    - Проверить установку ресурсов (Этап 16)
    - Проверить трей (Этап 15)
    - Удалить — чисто
  • Автоматизация: через GitHub Actions с windows-latest
    - Устанавливаем .exe
    - Запускаем через скрипт
    - Проверяем процесс
  • Мануально: раз в major-релиз

ПОЧЕМУ ВАЖНО:
  • Ловит ошибки сборки (недостающие ресурсы,
    неправильные пути)
  • Ловит проблемы с зависимостями
  • Защита от bad release

【 РЕШЕНИЕ 10: Checksums + Release signature 】

ОБОСНУЙ:
  • SHA-256 хеши для каждого артефакта
  • Формат: SHA256SUMS.txt
  • Пользователь может проверить:
    - Linux: sha256sum -c SHA256SUMS.txt
    - Windows: certutil -hashfile file SHA256
  • Помогает проверить целостность (не подменён ли файл)

ФОРМАТ:
```
abc123... ZapretManager_0.1.0_x64-setup.exe
def456... ZapretManager_0.1.0_x64_en-US.msi
ghi789... ZapretManager_0.1.0_x64_portable.zip
```

ПОЧЕМУ ВАЖНО:
  • Доверие пользователя
  • Защита от MITM (если GitHub скомпрометирован)

【 РЕШЕНИЕ 11: Version bumping через pnpm script 】

ОБОСНУЙ:
  • Версия в 4+ файлах
  • Вручную → ошибки
  • Скрипт `scripts/bump-version.js`:
    - Читает новую версию из аргумента
    - Обновляет package.json, Cargo.toml, tauri.conf.json
    - Обновляет CHANGELOG (добавляет новую секцию)
    - Коммитит с сообщением «release: vX.Y.Z»
    - Создаёт тег

ПОЧЕМУ ВАЖНО:
  • Консистентность
  • Один источник правды
  • Меньше ошибок

【 РЕШЕНИЕ 12: Release workflow — manual trigger + tag trigger 】

ОБОСНУЙ:
  • Два способа:
    1. Push тега vX.Y.Z → автоматический релиз
    2. Manual trigger (workflow_dispatch) → релиз из
       ветки (beta/nightly)
  • Основной — tag-based
  • Manual — для hotfix без тега

ТРИГГЕР:
```yaml
on:
  push:
    tags: ["v*"]
  workflow_dispatch:
    inputs:
      version:
        description: "Версия (например, v0.1.1)"
        required: true
```

ПОЧЕМУ ОБА:
  • Tag-based — стандарт
  • Manual — гибкость

【 РЕШЕНИЕ 13: Release notes из CHANGELOG + assets с checksums 】

ОБОСНУЙ:
  • GitHub Release body = CHANGELOG секция
  • Плюс: инструкция по проверке checksums
  • Плюс: system requirements
  • Плюс: ссылки на документацию

ШАБЛОН RELEASE NOTES:
```markdown
## Что нового

[Извлечённый CHANGELOG]

## Установка

1. Скачайте `ZapretManager_X.Y.Z_x64-setup.exe`
2. Запустите установщик
3. Следуйте инструкциям

## Проверка целостности

```bash
sha256sum -c SHA256SUMS.txt
```

## Системные требования

- Windows 10 1809+ или Windows 11
- 200 MB свободного места
- WebView2 (обычно установлен)

## Ссылки

- [Документация](...)
- [Сообщить о баге](...)
- [Changelog](CHANGELOG.md)
```

【 РЕШЕНИЕ 14: Автообновление через Tauri Updater + GitHub Releases 】

ОБОСНУЙ:
  • Уже реализовано на Этапе 12 (проверка обновлений)
  • На этом этапе — настроить production endpoint
  • tauri.conf.json → plugins.updater.endpoints:
    - `https://github.com/USER/REPO/releases/latest/download/latest.json`
  • latest.json — генерируется автоматически
  • Пользователь получает обновление через 5 минут после
    публикации

АЛЬТЕРНАТИВА: использовать наш собственный updater
(Этап 12), который уже работает через GitHub API. Он проще
и не требует latest.json.

РЕШЕНИЕ: используем наш updater (Этап 12). Tauri Updater —
опционально.

【 РЕШЕНИЕ 15: Анонс в социальных сетях (опционально) 】

ОБОСНУЙ:
  • GitHub Release — основной канал
  • Дополнительно (для больших релизов):
    - Reddit (r/rust, r/zapret, r/opensource)
    - Twitter / X
    - Telegram-каналы (для ру-сообщества)
  • Не обязательно для каждого релиза
  • Только для major

РЕКОМЕНДАЦИЯ: для MVP — только GitHub. Соцсети —
отдельно по желанию.

【 РЕШЕНИЕ 16: Обратная связь — GitHub Issues с шаблонами 】

ОБОСНУЙ:
  • Bug report template
  • Feature request template
  • Автоматический вопрос про версию, ОС, логи
  • Через .github/ISSUE_TEMPLATE/

ШАБЛОНЫ:
  • bug_report.yml
  • feature_request.yml
  • config.yml (ссылки на docs, discussions)

ПОЧЕМУ ВАЖНО:
  • Качественные bug reports → быстрое решение
  • Экономит время

【 РЕШЕНИЕ 17: LICENSE и LICENSE-* для зависимостей 】

ОБОСНУЙ:
  • Своя лицензия — MIT (совместима с Tauri, React, Rust)
  • Файл LICENSE в корне
  • Сторонние лицензии — в About (Этап 16)
  • README — секция License

ПОЧЕМУ MIT:
  • Простая, разрешительная
  • Совместима со всем стеком
  • Подходит для Open Source

【 РЕШЕНИЕ 18: .editorconfig, .gitattributes для единообразия 】

ОБОСНУЙ:
  • .editorconfig — уже есть (Этап 1)
  • .gitattributes — для CRLF/LF:
    - *.sh — LF
    - *.bat — CRLF
    - *.rs — LF
    - *.ts — LF
    - *.md — LF
  • Нормализация line endings

【 РЕШЕНИЕ 19: Скрипт для локальной сборки релиза ]

ОБОСНУЙ:
  • Разработчик может собрать релиз локально
  • `scripts/release-local.sh`:
    1. Проверить чистоту git status
    2. Запустить тесты
    3. pnpm tauri build
    4. Сгенерировать checksums
    5. Показать пути к артефактам

ПОЧЕМУ ВАЖНО:
  • Тестирование перед публикацией
  • Debug проблем
  • Не требует CI

【 РЕШЕНИЕ 20: Rollback plan — возможность откатить релиз ]

ОБОСНУЙ:
  • Если после релиза обнаружен critical bug:
    1. Пометить release как pre-release
    2. Опубликовать hotfix vX.Y.Z+1
    3. В README — ссылка на предыдущую стабильную
  • GitHub позволяет:
    - Редактировать release
    - Удалять assets
    - Удалять release (но тег остаётся)
  • Не откатываем теги (плохая практика)

ПЛАН:
  • Hotfix в течение 24 часов
  • Release notes с извинениями и fix
  • Обновление документации

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/ОБНОВИТЬ
═══════════════════════════════════════════════════════════════════════

【 1. .github/workflows/release.yml (создать) 】
Назначение: автоматическая сборка и публикация релиза.

```yaml
name: Release

on:
  push:
    tags: ["v*"]
  workflow_dispatch:
    inputs:
      version:
        description: "Версия (например, v0.1.1)"
        required: true

permissions:
  contents: write

jobs:
  create-release:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      release_id: ${{ steps.create.outputs.id }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Extract version
        id: version
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "version=${{ github.event.inputs.version }}" >> $GITHUB_OUTPUT
          else
            echo "version=${{ github.ref_name }}" >> $GITHUB_OUTPUT
          fi

      - name: Extract changelog
        id: changelog
        run: |
          VERSION="${{ steps.version.outputs.version }}"
          VERSION_NO_V="${VERSION#v}"
          awk "/## \[$VERSION_NO_V\]/,/## \[/" CHANGELOG.md | \
            head -n -1 > /tmp/changelog.md || true

      - name: Create release
        id: create
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.version.outputs.version }}
          release_name: ${{ steps.version.outputs.version }}
          body_path: /tmp/changelog.md
          draft: true
          prerelease: ${{ contains(steps.version.outputs.version, '-') }}

  build:
    needs: create-release
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: windows-latest
            args: ""
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: "./src-tauri -> target"

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: |
          pnpm test
          pnpm tsc --noEmit

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Раскомментировать когда будет сертификат
          # TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          # TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          releaseId: ${{ needs.create-release.outputs.release_id }}
          args: ${{ matrix.args }}

      - name: Create portable ZIP
        if: matrix.platform == 'windows-latest'
        shell: pwsh
        run: |
          $version = "${{ needs.create-release.outputs.version }}"
          $version = $version.TrimStart('v')
          $zipName = "ZapretManager_${version}_x64_portable.zip"
          Compress-Archive -Path "src-tauri/target/release/ZapretManager.exe" -DestinationPath $zipName

      - name: Upload portable ZIP
        if: matrix.platform == 'windows-latest'
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create.outputs.upload_url }}
          asset_path: ./ZapretManager_*_x64_portable.zip
          asset_name: ZapretManager_${{ needs.create-release.outputs.version }}_x64_portable.zip
          asset_content_type: application/zip

  checksums:
    needs: [create-release, build]
    runs-on: ubuntu-latest
    steps:
      - name: Download all assets
        uses: robinraju/release-downloader@v1
        with:
          releaseId: ${{ needs.create-release.outputs.release_id }}
          out-file-path: ./artifacts

      - name: Generate checksums
        working-directory: ./artifacts
        run: |
          sha256sum * > SHA256SUMS.txt

      - name: Upload checksums
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ needs.create-release.outputs.upload_url }}
          asset_path: ./artifacts/SHA256SUMS.txt
          asset_name: SHA256SUMS.txt
          asset_content_type: text/plain
```

【 2. CHANGELOG.md (создать) 】
Назначение: changelog проекта в формате Keep a Changelog.

```markdown
# Changelog

Все значимые изменения в этом проекте документируются в этом
файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
версионирование соответствует [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

## [0.1.0] - 2026-10-05

### Added

- Управление стратегиями обхода блокировок (.bat файлы)
- Сканирование папки со стратегиями
- Запуск .bat с правами администратора (UAC)
- Перехват stdout/stderr в реальном времени
- Просмотр логов с виртуализацией (10 000+ строк)
- Фильтрация логов по уровню, источнику, стратегии
- Поиск с подсветкой
- Экспорт логов в файл
- Внедрение доменов Outlast Trials в конфиги
- Поддержка Discord, YouTube, Outlast Trials
- Игровой режим отображения стратегий («карты»)
- 3D-tilt, flip, glow-эффекты на картах
- Редкость карт (Common / Rare / Epic / Legendary)
- Dashboard с Hero-панелью и статусом подключения
- Информация о соединении (IP, страна, провайдер)
- Мини-график пинга до сервисов
- Визуализатор трафика в реальном времени
- Проверка обновлений через GitHub Releases
- Автоматическое скачивание и установка обновлений
- Полная страница Settings с 8 секциями
- Импорт/экспорт настроек
- Переключение bat ↔ VPN (WireGuard / AmneziaWG)
- Импорт .conf файлов WireGuard
- Kill Switch через Windows Firewall
- Системный трей с 5 состояниями иконки
- Динамическое контекстное меню трея
- Нативные уведомления Windows
- Встроенные ресурсы (zapret, стратегии, конфиги)
- Автоматическая распаковка при первом запуске
- Умное обновление ресурсов (без потери правок)
- Кастомный NSIS-установщик с тёмной темой
- Postprocessing-эффекты (bloom, vignette, film grain)
- Адаптивность под все разрешения и DPI
- Оптимизация (60 FPS, RAM < 150 MB, cold start < 1.5s)

### Security

- Валидация всех входных данных (Zod + Rust)
- Защита от path traversal
- Защита от command injection
- Content Security Policy
- Минимум Tauri capabilities
- Rate limiting критичных команд
- Проверка целостности ресурсов (SHA-256)
- Проверка целостности обновлений
- Отдельное логирование security-событий
- Отсутствие секретов в логах

[Unreleased]: https://github.com/USER/REPO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/USER/REPO/releases/tag/v0.1.0
```

【 3. README.md (обновить полностью) 】
Назначение: главная страница проекта.

```markdown
<div align="center">

# Zapret Manager

**Десктопное приложение для управления стратегиями обхода блокировок**

Discord · YouTube · Outlast Trials

[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/USER/REPO)](https://github.com/USER/REPO/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Скачать](https://github.com/USER/REPO/releases/latest) ·
[Документация](docs/) ·
[Сообщить о баге](https://github.com/USER/REPO/issues)

</div>

---

## Что это

Zapret Manager — это удобное приложение для управления
стратегиями обхода блокировок на основе
[zapret](https://github.com/bol-van/zapret). Оно предоставляет
графический интерфейс для запуска, мониторинга и управления
.bat-стратегиями, а также поддерживает VPN-подключения
(WireGuard/AmneziaWG).

## Возможности

- 🎮 **Игровой режим** — стратегии как «карты» с характеристиками
- 📊 **Визуализатор трафика** — живые графики в реальном времени
- 🚀 **Быстрый запуск** — одна кнопка для запуска стратегии
- 🛡️ **VPN-режим** — переключение между DPI-обходом и VPN
- 🎯 **Outlast Trials** — автоматическое добавление доменов игры
- 🔄 **Автообновление** — обновления стратегий из GitHub
- 📝 **Логи в реальном времени** — с фильтрами и экспортом
- 🎨 **Премиум-дизайн** — тёмная тема, glassmorphism, неон
- ⚡ **Быстро** — 60 FPS, холодный старт < 1.5 сек
- 🔒 **Безопасно** — валидация данных, защита от injection

## Скриншоты

![Dashboard](docs/screenshots/dashboard.png)
![Strategies](docs/screenshots/strategies.png)
![Logs](docs/screenshots/logs.png)

## Установка

### Требования

- Windows 10 (1809+) или Windows 11
- 200 MB свободного места
- WebView2 (обычно уже установлен)

### Шаги

1. Скачайте последний релиз:
   [ZapretManager_x.x.x_x64-setup.exe](https://github.com/USER/REPO/releases/latest)
2. Запустите установщик
3. Следуйте инструкциям
4. Приложение готово к работе

### Проверка целостности (опционально)

```bash
# Скачайте SHA256SUMS.txt
certutil -hashfile ZapretManager_0.1.0_x64-setup.exe SHA256
# Сравните с содержимым SHA256SUMS.txt
```

## Быстрый старт

1. **Открыть приложение** — Dashboard появится автоматически
2. **Выбрать папку со стратегиями** — Strategies → «Выбрать папку»
3. **Запустить стратегию** — клик Play на карточке
4. **Подтвердить UAC** — приложение запросит права администратора

Готово! Обход работает.

## FAQ

### Почему UAC-запрос при каждом запуске?

Это нормальное поведение Windows. UAC-запрос появляется,
потому что приложение не запускается от администратора. Вы
можете запустить приложение от администратора, и UAC не
будет появляться каждый раз.

### Можно ли использовать VPN и DPI одновременно?

Нет. Это взаимоисключающие режимы. При переключении на VPN
стратегия останавливается, и наоборот.

### Где хранятся настройки?

В `%APPDATA%\ZapretManager\`:
- `config.json` — настройки
- `strategies/` — стратегии
- `logs/` — логи
- `backups/` — бэкапы

### Как сообщить о проблеме?

Создайте [GitHub Issue](https://github.com/USER/REPO/issues/new/choose)
с описанием проблемы, шагами воспроизведения и логами
(из `%APPDATA%\ZapretManager\logs\`).

## Разработка

```bash
# Клонировать
git clone https://github.com/USER/REPO.git
cd REPO

# Установить зависимости
pnpm install

# Запустить в dev-режиме
pnpm tauri dev

# Собрать релиз
pnpm tauri build
```

## Лицензия

[MIT](LICENSE)

---

<div align="center">

Сделано с ❤️ для сообщества zapret

</div>
```

【 4. LICENSE (создать) 】
MIT License.

```
MIT License

Copyright (c) 2026 Zapret Manager Contributors

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall
be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
```

【 5. scripts/bump-version.js (создать) 】
Скрипт для синхронизации версии.

```js
#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const version = process.argv[2]
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error("Использование: node bump-version.js <X.Y.Z>")
  process.exit(1)
}

const root = path.resolve(__dirname, "..")

// package.json
const pkgPath = path.join(root, "package.json")
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
pkg.version = version
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")

// tauri.conf.json
const tauriConfPath = path.join(root, "src-tauri/tauri.conf.json")
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf-8"))
tauriConf.version = version
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n")

// Cargo.toml
const cargoPath = path.join(root, "src-tauri/Cargo.toml")
let cargo = fs.readFileSync(cargoPath, "utf-8")
cargo = cargo.replace(/^version = ".*"$/m, `version = "${version}"`)
fs.writeFileSync(cargoPath, cargo)

// CHANGELOG.md
const changelogPath = path.join(root, "CHANGELOG.md")
let changelog = fs.readFileSync(changelogPath, "utf-8")
const date = new Date().toISOString().split("T")[0]
const newSection = `## [${version}] - ${date}\n\n### Added\n\n- \n\n### Changed\n\n- \n\n### Fixed\n\n- \n\n`
changelog = changelog.replace(
  "## [Unreleased]\n",
  `## [Unreleased]\n\n${newSection}`
)
fs.writeFileSync(changelogPath, changelog)

console.log(`✅ Версия обновлена до ${version}`)
console.log("Не забудьте:")
console.log("  1. Заполнить CHANGELOG.md")
console.log("  2. git add .")
console.log(`  3. git commit -m "release: v${version}"`)
console.log(`  4. git tag v${version}`)
console.log(`  5. git push && git push --tags`)
```

【 6. scripts/release-local.sh (создать) 】
Скрипт локальной сборки релиза.

```bash
#!/bin/bash
set -e

echo "🔍 Проверка git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Есть незакоммиченные изменения"
  exit 1
fi

echo "🧪 Запуск тестов..."
pnpm test
cd src-tauri && cargo test && cd ..

echo "🔍 Проверка типов..."
pnpm tsc --noEmit

echo "🏗️ Сборка..."
pnpm tauri build

echo "📝 Генерация checksums..."
cd src-tauri/target/release/bundle/nsis
sha256sum *.exe > SHA256SUMS.txt

echo "✅ Готово!"
echo "Артефакты:"
ls -lh *.exe
```

【 7. .github/ISSUE_TEMPLATE/bug_report.yml (создать) 】
Шаблон баг-репорта.

```yaml
name: Bug Report
description: Сообщить о проблеме
title: "[Bug] "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Спасибо за сообщение о проблеме! Заполните форму ниже.
  - type: input
    id: version
    attributes:
      label: Версия приложения
      description: Из Settings → О приложении
      placeholder: "0.1.0"
    validations:
      required: true
  - type: input
    id: os
    attributes:
      label: Версия Windows
      placeholder: "Windows 11 23H2 (build 22631.4602)"
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Описание проблемы
      description: Что произошло? Что ожидалось?
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Шаги воспроизведения
      placeholder: |
        1. Открыть Strategies
        2. Кликнуть Play
        3. ...
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Логи
      description: |
        Прикрепите файл из %APPDATA%\ZapretManager\logs\
      render: shell
    validations:
      required: false
```

【 8. .github/ISSUE_TEMPLATE/feature_request.yml (создать) 】
Шаблон feature request.

【 9. .github/ISSUE_TEMPLATE/config.yml (создать) 】
Конфиг с ссылками.

【 10. .github/PULL_REQUEST_TEMPLATE.md (создать) 】
Шаблон PR.

【 11. docs/RELEASING.md (создать) 】
Гайд по релизам.

【 12. docs/INSTALL.md (создать) 】
Гайд по установке.

【 13. .gitattributes (создать) 】
```gitattributes
* text=auto eol=lf
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf
*.png binary
*.jpg binary
*.ico binary
*.icns binary
*.zip binary
*.exe binary
*.dll binary
*.sys binary
Cargo.lock -diff
pnpm-lock.yaml -diff
```

【 14. package.json (обновить) 】
Добавить scripts:
```json
"release": "tauri build",
"release:local": "bash scripts/release-local.sh",
"bump": "node scripts/bump-version.js"
```

【 15. .github/workflows/ci.yml (обновить) 】
Убедиться, что всё зелёное перед релизом.

【 16. src-tauri/tauri.conf.json (обновить) 】
Проверить:
  • `bundle.targets: ["nsis", "msi"]`
  • `bundle.publisher: "Zapret Manager Project"`
  • `bundle.copyright: "Copyright (c) 2026 Zapret Manager"`
  • `bundle.category: "Utility"`
  • `bundle.shortDescription`
  • `bundle.longDescription`
  • `bundle.homepage`
  • `bundle.windows.wix.language: ["ru-RU", "en-US"]`

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Подготовить репозиторий
  • Создать GitHub репозиторий (если не создан)
  • Настроить GitHub Secrets (если есть сертификат)
  • Включить Actions

ШАГ 2: Создать LICENSE
  • MIT License
  • Указать правильный copyright

ШАГ 3: Создать CHANGELOG.md
  • Формат Keep a Changelog
  • Секция [0.1.0] с полным списком

ШАГ 4: Создать README.md
  • Полная структура (RU + EN)
  • Скриншоты
  • Badges

ШАГ 5: Создать docs/
  • RELEASING.md
  • INSTALL.md
  • Скриншоты (docs/screenshots/)

ШАГ 6: Создать scripts/
  • bump-version.js
  • release-local.sh
  • Проверить работу локально

ШАГ 7: Создать .github/
  • ISSUE_TEMPLATE/*.yml
  • PULL_REQUEST_TEMPLATE.md
  • workflows/release.yml
  • workflows/ci.yml (уже есть)

ШАГ 8: Создать .gitattributes
  • Настроить line endings

ШАГ 9: Обновить tauri.conf.json
  • bundle.targets
  • bundle.publisher
  • bundle.copyright
  • bundle.windows.wix.language

ШАГ 10: Обновить package.json
  • version: 0.1.0
  • scripts

ШАГ 11: Локальная сборка релиза
  • `bash scripts/release-local.sh`
  • Проверить артефакты:
    - setup.exe (NSIS)
    - .msi
    - portable.zip

ШАГ 12: Smoke-тест локального релиза
  • Установить .exe на VM (или другую систему)
  • Запустить, проверить работу
  • Удалить

ШАГ 13: Создать тег v0.1.0
  • `git tag v0.1.0`
  • `git push origin v0.1.0`
  • Дождаться CI release

ШАГ 14: Проверить GitHub Release
  • Открыть https://github.com/USER/REPO/releases
  • Убедиться, что assets загружены
  • Проверить Release Notes (changelog)
  • Скачать SHA256SUMS.txt

ШАГ 15: Smoke-тест скачанного релиза
  • Скачать setup.exe с GitHub
  • Проверить checksum
  • Установить на чистую систему
  • Запустить, проверить работу

ШАГ 16: Опубликовать Release
  • Снять draft (если draft)
  • Отметить как latest

ШАГ 17: Проверить автообновление
  • Установить старую версию (0.0.9)
  • Запустить
  • Должно прийти уведомление об обновлении

ШАГ 18: Настроить upda endpoint
  • В tauri.conf.json
  • `plugins.updater.endpoints`

ШАГ 19: Написать CHANGELOG для будущих версий
  • Секция [Unreleased]
  • Формат

ШАГ 20: Финальная проверка
  • Все тесты зелёные
  • Релиз опубликован
  • Документация актуальна
  • CI release работает
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 GIT / GITHUB 】
  □ Репозиторий создан
  □ LICENSE добавлен
  □ README обновлён
  □ CHANGELOG создан
  □ .gitattributes настроен
  □ .editorconfig настроен
  □ GitHub Secrets настроены (если есть)
  □ Actions включены

【 ДОКУМЕНТАЦИЯ 】
  □ README с секциями
  □ Скриншоты в docs/screenshots/
  □ docs/RELEASING.md
  □ docs/INSTALL.md
  □ CHANGELOG в формате Keep a Changelog
  □ Badges в README

【 SCRIPTS 】
  □ scripts/bump-version.js работает
  □ scripts/release-local.sh работает
  □ Проверено на реальном релизе

【 CI 】
  □ .github/workflows/ci.yml
  □ .github/workflows/release.yml
  □ CI зелёный на main
  □ Release workflow протестирован

【 РЕЛИЗ 】
  □ bundle.targets: nsis + msi
  □ bundle.publisher указан
  □ bundle.copyright указан
  □ bundle.category: Utility
  □ bundle.windows.wix.language: ru-RU + en-US
  □ Версия 0.1.0 везде

【 АРТЕФАКТЫ 】
  □ setup.exe (NSIS) собирается
  □ .msi собирается
  □ portable.zip создаётся
  □ SHA256SUMS.txt создаётся
  □ Все checksums корректны

【 GITHUB RELEASE 】
  □ Тег v0.1.0 создан
  □ Release создан автоматически
  □ Assets загружены
  □ Release notes из CHANGELOG
  □ Draft снят

【 SMOKE-ТЕСТ 】
  □ Установка на чистую систему работает
  □ Приложение запускается
  □ Основные функции работают
  □ Ресурсы распаковываются
  □ Трей появляется
  □ Удаление чистое

【 АВТООБНОВЛЕНИЕ 】
  □ Endpoint настроен
  □ Проверка обновлений работает
  □ latest.json доступен (если используется)
  □ Уведомление приходит

【 МЕТАДАННЫЕ 】
  □ version в package.json
  □ version в Cargo.toml
  □ version в tauri.conf.json
  □ Все совпадают
  □ Тэг соответствует версии

【 SECURITY 】
  □ LICENSE совместима со стеком
  □ Сторонние лицензии учтены
  □ Приватные ключи не в репо
  □ Секреты только в GitHub Secrets
  □ .gitignore аккуратен

【 UX / ДОСТУПНОСТЬ 】
  □ README понятен новичку
  □ Установка описана пошагово
  □ FAQ отвечает на частые вопросы
  □ Ссылки на Issues/Discussions

【 CODE QUALITY 】
  □ Нет мёртвого кода
  □ Нет console.log
  □ Функции <50 строк
  □ Файлы <300 строк
  □ Комментариев в коде нет (правило проекта)

【 BUILD 】
  □ pnpm tauri build — успех
  □ Артефакты созданы
  □ Размер < 50 MB
  □ CI release зелёный
  □ Всё работает

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: CI release падает при сборке MSI
  ПРИЧИНА: WiX не установлен или проблема с языками.
  ЧТО ПРОВЕРИТЬ: Tauri автоматически скачивает WiX.
    Проверить bundle.windows.wix.language.

ГИПОТЕЗА 2: Тег создан, но release не публикуется
  ПРИЧИНА: permissions в workflow.
  ЧТО ПРОВЕРИТЬ: `permissions: contents: write` в
    release.yml.

ГИПОТЕЗА 3: Checksums не совпадают
  ПРИЧИНА: разные платформы или cache.
  ЧТО ПРОВЕРИТЬ: checksums генерируются на той же
    системе, где собраны артефакты. Использовать
    ubuntu-latest.

ГИПОТЕЗА 4: Portable ZIP пустой
  ПРИЧИНА: неправильный путь.
  ЧТО ПРОВЕРИТЬ: путь src-tauri/target/release/
    ZapretManager.exe существует.

ГИПОТЕЗА 5: Установщик падает на чистой системе
  ПРИЧИНА: отсутствует WebView2.
  ЧТО ПРОВЕРИТЬ: Tauri автоматически устанавливает
    WebView2 (webviewInstallMode: "downloadBootstrapper").

ГИПОТЕЗА 6: Auto-updater не находит обновление
  ПРИЧИНА: неправильный endpoint или формат.
  ЧТО ПРОВЕРИТЬ: в updater.rs используется правильный
    URL. GitHub API v3.

ГИПОТЕЗА 7: Release draft не снимается автоматически
  ПРИЧИНА: нужен ручной шаг.
  ЧТО ПРОВЕРИТЬ: добавить в workflow шаг «publish».

ГИПОТЕЗА 8: Иконка установщика не отображается
  ПРИЧИНА: неправильный .ico.
  ЧТО ПРОВЕРИТЬ: icon.ico содержит все размеры
    (16, 32, 48, 64, 128, 256).

ГИПОТЕЗА 9: Сборка занимает > 30 минут
  ПРИЧИНА: нет кеша Rust.
  ЧТО ПРОВЕРИТЬ: swatinem/rust-cache@v2.

ГИПОТЕЗА 10: Changelog не извлекается в Release Notes
  ПРИЧИНА: неправильный regex или формат.
  ЧТО ПРОВЕРИТЬ: awk regex соответствует формату.

ГИПОТЕЗА 11: Версия не совпадает между файлами
  ПРИЧИНА: bump-version.js не всё обновил.
  ЧТО ПРОВЕРИТЬ: grep -rn "0\.1\.0" в корне.

ГИПОТЕЗА 12: Windows SmartScreen блокирует установку
  ПРИЧИНА: нет code signing.
  ЧТО ПРОВЕРИТЬ: либо сертификат, либо инструкция
    «Подробнее → Выполнить в любом случае» в README.

ГИПОТЕЗА 13: Пользователь не может найти логи
  ПРИЧИНА: путь неочевиден.
  ЧТО ПРОВЕРИТЬ: в FAQ указан путь %APPDATA%\
    ZapretManager\logs\.

ГИПОТЕЗА 14: Некоторые пользователи скачивают .msi и
   он не работает
  ПРИЧИНА: MSI требует .NET или WiX runtime.
  ЧТО ПРОВЕРИТЬ: в README указать предпочтительный
    формат (NSIS).

ГИПОТЕЗА 15: Тег удалён, но релиз остался
  ПРИЧИНА: удаление тега не удаляет релиз.
  ЧТО ПРОВЕРИТЬ: удалить релиз через UI.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Локальная сборка:
   `pnpm tauri build`
   ОЖИДАНИЕ: артефакты созданы в target/release/bundle/

2. Проверить артефакты:
   ```bash
   ls src-tauri/target/release/bundle/nsis/
   ls src-tauri/target/release/bundle/msi/
   ```
   ОЖИДАНИЕ: setup.exe и .msi

3. Установить .exe локально:
   • Двойной клик на setup.exe
   ОЖИДАНИЕ:
   • Тёмный установщик открывается
   • Welcome → License → Components → Directory →
     Install → Finish
   • Приложение запускается после установки

4. Проверить приложение:
   ОЖИДАНИЕ:
   • Все страницы работают
   • Стратегии загружаются
   • Трей работает
   • Dashboard показывает данные

5. Удалить приложение:
   • Windows Settings → Apps → Zapret Manager → Uninstall
   ОЖИДАНИЕ:
   • Диалог про данные
   • Чистое удаление

6. Создать тег:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

7. Проверить CI:
   • Открыть GitHub Actions
   ОЖИДАНИЕ: workflow Release запустился

8. Дождаться завершения:
   ОЖИДАНИЕ:
   • Все jobs зелёные (5-15 минут)
   • Release создан

9. Проверить GitHub Release:
   • Открыть https://github.com/USER/REPO/releases
   ОЖИДАНИЕ:
   • Release v0.1.0
   • Assets:
     - ZapretManager_0.1.0_x64-setup.exe
     - ZapretManager_0.1.0_x64_en-US.msi
     - ZapretManager_0.1.0_x64_portable.zip
     - SHA256SUMS.txt
   • Release notes = CHANGELOG секция

10. Скачать setup.exe:
    ОЖИДАНИЕ: файл скачан

11. Проверить checksum:
    ```bash
    certutil -hashfile ZapretManager_0.1.0_x64-setup.exe SHA256
    # Сравнить с SHA256SUMS.txt
    ```
    ОЖИДАНИЕ: хеши совпадают

12. Установить на чистую систему (VM):
    • Windows 10 или 11
    • Без dev tools
    ОЖИДАНИЕ:
    • Установка работает
    • Приложение запускается
    • Ресурсы распаковываются
    • Стратегии видны

13. Проверить автообновление:
    • Установить версию 0.0.9 (если существует)
    • Запустить
    • Открыть About → Проверить обновления
    ОЖИДАНИЕ:
    • Обнаружено 0.1.0
    • Можно скачать и установить

14. Проверить README:
    • Открыть на GitHub
    ОЖИДАНИЕ:
    • Красивый, с badges
    • Скриншоты загружаются
    • Ссылки работают

15. Проверить Issues:
    • New issue → Bug Report
    ОЖИДАНИЕ:
    • Форма открывается
    • Все поля на месте

16. Проверить LICENSE:
    • Открыть LICENSE на GitHub
    ОЖИДАНИЕ: MIT отображается

17. Проверить CHANGELOG:
    • Открыть CHANGELOG.md
    ОЖИДАНИЕ: полный список изменений

18. Проверить bump-version:
    ```bash
    node scripts/bump-version.js 0.1.1
    git diff
    ```
    ОЖИДАНИЕ: версии обновлены везде

19. Вернуть 0.1.0:
    ```bash
    git checkout .
    ```

20. Проверить release-local.sh:
    ```bash
    bash scripts/release-local.sh
    ```
    ОЖИДАНИЕ: работает, артефакты созданы

21. Финальная проверка:
    • pnpm test — зелёные
    • pnpm tsc --noEmit — 0 ошибок
    • cargo test — зелёные
    • CI зелёный

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не публиковать релиз без smoke-теста
❌ Не публиковать релиз без CHANGELOG
❌ Не публиковать релиз без checksums
❌ Не коммитить секреты (сертификаты, ключи)
❌ Не изменять историю git (rebase) после релиза
❌ Не удалять теги после публикации
❌ Не игнорировать failed CI
❌ Не собирать релиз из грязной ветки
❌ Не забывать про .gitattributes
❌ Не забывать про LICENSE
❌ Не забывать про README
❌ Не забывать про docs/
❌ Не забывать про release notes
❌ Не забывать про portable version
❌ Не забывать про автообновление
❌ Не забывать про smoke-тест
❌ Не делать релиз в пятницу вечером (по возможности)
❌ Не начинать без подтверждения (это финальный этап)

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 23 завершён, если ВСЕ пункты выполнены:

✅ GitHub репозиторий настроен
✅ LICENSE (MIT) добавлен
✅ README.md полный (RU + EN, скриншоты, badges)
✅ CHANGELOG.md в формате Keep a Changelog
✅ docs/RELEASING.md
✅ docs/INSTALL.md
✅ scripts/bump-version.js работает
✅ scripts/release-local.sh работает
✅ .github/ISSUE_TEMPLATE/*.yml
✅ .github/PULL_REQUEST_TEMPLATE.md
✅ .github/workflows/release.yml
✅ .github/workflows/ci.yml
✅ .gitattributes настроен
✅ tauri.conf.json обновлён (bundle.targets,
   publisher, copyright)
✅ Версия 0.1.0 везде синхронизирована
✅ Локальная сборка работает
✅ setup.exe + .msi + portable.zip создаются
✅ Smoke-тест локального релиза пройден
✅ Тег v0.1.0 создан и запушен
✅ CI Release зелёный
✅ GitHub Release создан с assets
✅ Release notes из CHANGELOG
✅ SHA256SUMS.txt доступен
✅ Smoke-тест скачанного релиза пройден
✅ Автообновление работает
✅ Issues работают (bug + feature)
✅ README понятен новичку
✅ Версии совпадают везде
✅ Нет секретов в репо
✅ CI зелёный на main
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ПОСЛЕ ЗАВЕРШЕНИЯ ПРОЕКТА
═══════════════════════════════════════════════════════════════════════

После Этапа 23 проект ЗАВЕРШЁН. Приложение опубликовано,
документация готова, автообновление работает.

Дальнейшие итерации:

【 Версия 0.2.0 (планируется) 】
  • Code signing сертификат
  • Собственный updater server (опционально)
  • Улучшения UI по фидбеку
  • Новые функции (по запросам)

【 Версия 1.0.0 (major) 】
  • Поддержка Linux / macOS (если будет спрос)
  • Интеграция с Winget / Chocolatey
  • Расширенная аналитика (опционально)
  • Мультиязычность (больше языков)

【 Долгосрочное развитие 】
  • Плагины для разных DPI-обходов
  • Поддержка других игр (не только Outlast Trials)
  • Пользовательские сценарии обхода
  • Сообщество: Discord, Telegram

【 Поддержка 】
  • GitHub Issues — основной канал
  • GitHub Discussions — обсуждения
  • Документация — постоянное обновление
  • Регулярные релизы (раз в 1–2 месяца)

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: ФИНАЛ
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 23 — ПРОЕКТ ЗАВЕРШЁН.

Поздравляю! Ты прошёл путь от концепции до production-ready
приложения, которое:

  • Работает на Windows 10/11
  • Управляет стратегиями обхода блокировок
  • Поддерживает Discord, YouTube, Outlast Trials
  • Имеет игровой режим отображения стратегий
  • Показывает трафик в реальном времени
  • Переключается между DPI и VPN
  • Обновляется автоматически
  • Имеет профессиональный установщик
  • Прошло аудит безопасности
  • Покрыто тестами
  • Опубликовано на GitHub Releases

Это полноценный продукт уровня Awwwards, готовый к
использованию реальными пользователями.

Что дальше:

  • Следи за Issues на GitHub
  • Отвечай на вопросы в Discussions
  • Выпускай patch-релизы для баг-фиксов
  • Планируй 0.2.0 на основе фидбека
  • Радуйся, что сделал крутую вещь 🎉

Жди одну из команд:
  • "Правка: ..." — правка в Этап 23
  • "Покажи Этап N" — возврат к любому этапу
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее
  • "Дальше" — обсудить планы развития

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.
