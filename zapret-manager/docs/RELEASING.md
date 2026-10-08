# Релизный процесс

Документ описывает, как собрать и опубликовать релиз Zapret Manager.

## 1. Подготовка

### Один источник версии

Версия `0.1.0` хранится в четырёх местах и должна совпадать:

| Файл                                       | Поле                             |
| ------------------------------------------ | -------------------------------- |
| `zapret-manager/package.json`              | `version`                        |
| `zapret-manager/src-tauri/Cargo.toml`      | `version` в секции `[package]`   |
| `zapret-manager/src-tauri/tauri.conf.json` | `version`                        |
| `zapret-manager/src/lib/constants.ts`      | `APP_VERSION`                    |
| `CHANGELOG.md`                             | секция `## [X.Y.Z] - YYYY-MM-DD` |

### Смена версии

```bash
cd zapret-manager
pnpm bump 0.1.1
```

Скрипт `scripts/bump-version.mjs` обновляет все четыре файла и добавляет пустую секцию
в `CHANGELOG.md`. Дальше заполните секцию, закомми changes и создайте тег.

## 2. Проверки перед релизом

```bash
cd zapret-manager
pnpm typecheck          # tsc --noEmit
pnpm lint               # ESLint
pnpm format:check       # Prettier
pnpm lint:dead          # knip
pnpm lint:i18n          # контроль хардкодов локализации
pnpm test:coverage      # unit + покрытие
pnpm e2e                # Playwright
cd src-tauri && cargo test && cargo clippy --all-targets -- -D warnings && cargo audit
```

`node scripts/security-audit.mjs` проверяет CSP, capabilities и отсутствие опасных конструкций.

Короткие варианты той же последовательности:

```bash
pnpm release:check        # типы, линтер, формат, knip, i18n, метаданные, unit, cargo
pnpm release:check:full   # плюс E2E, сборка фронтенда и NSIS/MSI
```

`pnpm release:check` останавливается на `pnpm lint:release`, пока в метаданных
не указан адрес своего репозитория. Подставить его одной командой:

```bash
pnpm release:repo <owner/name>
```

Состав дистрибутива и лицензии сторонних компонентов (zapret, Cygwin, WinDivert) —
`../THIRD_PARTY_NOTICES.md`.

## 3. Локальная сборка релиза

```bash
cd zapret-manager
pnpm release:local            # проверки + сборка + артефакты + контрольные суммы
pnpm release:local -- --skip-tests   # только сборка
```

Скрипт выполняет:

1. проверки типов, линтера, форматирования, мёртвого кода, unit-тестов, `cargo test`, `cargo clippy`;
2. `pnpm tauri build` (NSIS + MSI);
3. `scripts/release-artifacts.mjs`: копирует установщики в `release/`, собирает portable ZIP
   и пишет `release/SHA256SUMS.txt`.

Результат:

```
release/
  Zapret Manager_0.1.0_x64-setup.exe
  Zapret Manager_0.1.0_x64_ru-RU.msi
  ZapretManager_0.1.0_x64_portable.zip
  SHA256SUMS.txt
```

Ограничение WiX: MSI собирается в локализации ru-RU. Смешанные базы 1251 и 1252 в одном пакете
WiX 3.x не поддерживает (`LGHT0311`), поэтому английская установка идёт через двуязычный NSIS.
Текст лицензии для установщика (`src-tauri/installer/license.txt`) должен содержать только
символы cp1251 — длинные тире, стрелки и типографские кавычки приводят к падению линковки.

## 4. Smoke-тест

Обязательно перед публикацией:

1. Установить приложение из `release/` (или на чистой Windows VM).
2. Запустить: окно открывается, все страницы работают, консоль без ошибок.
3. Проверить распаковку ресурсов и появление трея.
4. Запустить и остановить стратегию, убедиться, что логи пишутся.
5. Удалить приложение и убедиться, что установка чистая.

В CI smoke-тест выполняется на `windows-latest` в workflow `ci.yml` (сборка) и
`release.yml` (артефакты публикуются только после успешной сборки).

## 5. Публикация

```bash
git tag v0.1.0
git push origin main --tags
```

Workflow `.github/workflows/release.yml`:

1. создаёт черновик релиза с секцией из `CHANGELOG.md`;
2. собирает приложение на `windows-latest` (тесты → сборка);
3. создаёт portable ZIP и `SHA256SUMS.txt`;
4. загружает все артефакты в черновик релиза.

Дальше вручную: проверить черновик, снять флаг draft, отметить релиз как latest.

Ручной запуск: `workflow_dispatch` с параметром `version` (например `v0.1.1`) — для hotfix без тега.

## 6. Подпись кода

Без подписи Windows SmartScreen показывает «Неизвестный издатель».

Механизм подготовлен: в `release.yml` есть закомментированные переменные
`TAURI_SIGNING_PRIVATE_KEY` и `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Когда сертификат появится:

1. добавить secrets в репозиторий;
2. раскомментировать переменные в `release.yml`;
3. локально подписать сборку: `pnpm sign:windows`.

Секреты не коммитятся и хранятся только в GitHub Secrets.

## 7. Откат релиза

Если после публикации найден критичный баг:

1. пометить релиз как pre-release (release → Edit → Pre-release);
2. выпустить hotfix `vX.Y.Z+1` с описанием проблемы и исправления;
3. не удалять теги — это ломает историю и автообновление.

Рекомендуемое время реакции: 24 часа.

## 8. Контрольный список публикации

- [ ] Все проверки зелёные (раздел 2)
- [ ] Версия одинакова во всех файлах
- [ ] Секция в `CHANGELOG.md` заполнена
- [ ] Smoke-тест пройден
- [ ] `SHA256SUMS.txt` создан и проверен
- [ ] Артефакты собраны: NSIS, MSI, portable
- [ ] Черновик релиза создан автоматически
- [ ] Draft снят, релиз отмечен как latest
- [ ] Ссылки в README работают
