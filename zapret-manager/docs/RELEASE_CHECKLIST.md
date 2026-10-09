# Чек-лист сборки релиза

Приложение никуда не публикуется: сборки делаются локально и передаются вручную.
Ни шага про `git push`, ни шага про публикацию релиза на GitHub здесь нет.

## 1. Проверить состояние рабочей копии

```bash
git status             # дерево чистое
git log --oneline -1
```

## 2. Прогнать проверки локально

```bash
cd zapret-manager
pnpm release:check:full
```

Это единая цепочка: tsc, ESLint, Prettier, knip, контроль хардкодов локализации,
метаданные релиза, unit-тесты, cargo test, cargo check, Playwright E2E, сборка
фронтенда с замером производительности, проверка ссылок в бандле и сборка NSIS/MSI.

## 3. Проверить артефакты

```bash
cd zapret-manager
pnpm release:artifacts
pnpm exec node scripts/verify-portable.mjs
cat release/SHA256SUMS.txt
```

Ожидаются три файла: NSIS `.exe`, MSI `.msi`, portable `.zip`.
`verify-portable.mjs` распаковывает архив во временный каталог, запускает приложение
и убеждается, что распакованы все 23 стратегии.

## 4. Smoke-тест на чистой машине

На VM без Visual Studio Build Tools и Rust:

1. сверить SHA-256 установщика с `SHA256SUMS.txt`;
2. установить, убедиться, что приложение запускается;
3. убедиться, что распакованы 23 стратегии и появился трей;
4. запустить и остановить стратегию, проверить логи;
5. удалить приложение и проверить, что установка чистая.

## 5. Передать сборки

Передать три файла из `zapret-manager/release/` и `SHA256SUMS.txt` тем, кто будет
устанавливать. Получатель сверяет сумму перед установкой:

```bash
sha256sum -c SHA256SUMS.txt          # Linux/macOS/Git Bash
certutil -hashfile ZapretManager_0.1.0_x64-setup.exe SHA256   # Windows
```

## Сторонние компоненты

Дистрибутив содержит файлы zapret (MIT), Cygwin runtime и WinDivert (LGPL). Сверьтесь
с `../../THIRD_PARTY_NOTICES.md` и отметьте пункты «Перед публикацией».

## Что должно быть зелёным

| Проверка                     | Что проверяет                                          |
| ---------------------------- | ------------------------------------------------------ |
| `pnpm lint` и `format:check` | ESLint, Prettier                                       |
| `pnpm lint:dead`             | knip: мёртвые файлы, экспорты и зависимости            |
| `pnpm lint:i18n`             | контроль роста хардкодов локализации                   |
| `pnpm lint:release`          | согласованность версий, CHANGELOG, ссылки в документах |
| `pnpm test`                  | Vitest с порогами покрытия                             |
| `pnpm lint:bundle`           | ссылки в собранном бандле не ведут в никуда            |
| `cargo test`                 | unit и интеграционные тесты Rust                       |
| `cargo clippy`               | `-D warnings`                                          |
| `pnpm e2e`                   | 30 сценариев, чистая консоль                           |
| `pnpm build:check`           | сборка фронтенда и бюджет производительности           |
| `pnpm tauri build`           | сборка NSIS + MSI                                      |
| `pnpm release:artifacts`     | portable-архив и `SHA256SUMS.txt`                      |
