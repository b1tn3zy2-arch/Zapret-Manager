## Что изменено

<!-- краткое описание -->

## Как проверить

<!-- шаги или сценарий, который нужно повторить -->

## Чек-лист

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test:coverage`
- [ ] `pnpm e2e` (для изменений в UI)
- [ ] `pnpm lint:dead`
- [ ] `cargo test --manifest-path zapret-manager/src-tauri/Cargo.toml`
- [ ] `cargo clippy --manifest-path zapret-manager/src-tauri/Cargo.toml --all-targets -- -D warnings`
- [ ] `node scripts/security-audit.mjs` (для изменений в IPC, валидации, путях)

## Скриншоты

<!-- если изменился интерфейс -->

## Связанные задачи

<!-- номера issues, если есть -->
