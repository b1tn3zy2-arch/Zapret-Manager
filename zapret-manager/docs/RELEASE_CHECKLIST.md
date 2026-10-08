# Чек-лист публикации релиза

Всё, кроме шагов 1–4, выполняется автоматически в CI. Локально артефакты уже собраны
и проверены (см. [SMOKE_TEST.md](SMOKE_TEST.md)).

## 0. Указать адрес своего репозитория

APP_REPOSITORY_URL в src/lib/constants.ts и ссылки USER/zapret-manager в README.md
и CHANGELOG.md — плейсхолдеры. Проверка:

`ash
cd zapret-manager
pnpm lint:release
`

Она падает, пока в метаданных есть плейсхолдер или если баг-репорты уходят в upstream-репозиторий
zapret. Замените плейсхолдер на адрес своего репозитория и повторите проверку.

## 1. Проверить удалённый репозиторий

```bash
git remote -v          # должен быть origin
git status             # дерево чистое
git log --oneline -1
git tag --points-at HEAD
```

## 2. Прогнать проверки локально

```bash
cd zapret-manager
pnpm typecheck && pnpm lint && pnpm format:check
pnpm lint:dead && pnpm lint:i18n
pnpm test:coverage
pnpm e2e
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

## 3. Проверить артефакты

```bash
cd zapret-manager
pnpm release:artifacts
cat release/SHA256SUMS.txt
```

Ожидаются три файла: NSIS `.exe`, MSI `.msi`, portable `.zip`.

## 4. Smoke-тест на чистой машине

На VM без Visual Studio Build Tools и Rust:

1. сверить SHA-256 установщика с `SHA256SUMS.txt`;
2. установить, убедиться, что приложение запускается;
3. убедиться, что распакованы 23 стратегии и появился трей;
4. запустить и остановить стратегию, проверить логи;
5. удалить приложение и проверить, что установка чистая.

## 5. Опубликовать

```bash
git push origin main --tags
```

`release.yml` создаст **черновик** релиза с артефактами. Дальше вручную:

1. открыть Releases → черновик;
2. проверить тело релиза (секция из CHANGELOG), имена файлов и `SHA256SUMS.txt`;
3. нажать **Publish release**;
4. отметить релиз как latest.

## 6. Проверить после публикации

```bash
# суммы скачанного релиза
sha256sum -c SHA256SUMS.txt          # Linux/macOS/Git Bash
certutil -hashfile ZapretManager_0.1.0_x64-setup.exe SHA256   # Windows
```

- открыть страницу релиза, проверить загрузку всех файлов;
- скачать релиз на чистую VM и установить;
- проверить автообновление: установить предыдущую версию, дождаться проверки обновлений;
- проверить иконку трея и нативные уведомления.

## 7. Откат, если что-то пошло не так

1. Releases → Edit → отметить релиз как pre-release;
2. выпустить hotfix `vX.Y.Z+1` с описанием проблемы;
3. теги не удалять.

## Что должно быть зелёным в CI

| Job                   | Что проверяет                                          |
| --------------------- | ------------------------------------------------------ |
| `Lint and types`      | tsc, ESLint, Prettier, knip, контроль хардкодов        |
| `Frontend unit tests` | Vitest с порогами покрытия                             |
| `Rust tests`          | cargo test + clippy `-D warnings`                      |
| `Playwright E2E`      | 30 сценариев, чистая консоль                           |
| `Bundle build`        | сборка NSIS + MSI, артефакты, проверка portable и сумм |
| `Release`             | черновик релиза по тегу `v*`                           |
| `Security`            | cargo-audit, security-аудит проекта                    |
