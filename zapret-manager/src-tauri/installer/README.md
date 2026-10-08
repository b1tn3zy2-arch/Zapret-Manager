# NSIS installer

Everything in this folder belongs to the Windows installer that Tauri builds
with `pnpm tauri build`. The base template comes from the Tauri CLI, so the
NSIS version is pinned by `@tauri-apps/cli` in `package.json`.

```
src-tauri/installer/
├── custom-template.nsi   Tauri installer template with the Zapret Manager changes
├── hooks.nsh             generated, single include entry point for Tauri
├── include/              installer sources, inlined into hooks.nsh
├── languages/            RU and EN strings for the custom pages
├── bitmaps/              dark theme bitmaps for MUI2
└── license.txt           license shown on the MUI license page
```

## Files

| File                                             | Purpose                                                                                                                                         |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `custom-template.nsi`                            | Tauri template. Changes: per-user default, welcome/license/finish text, options page, log init, progress steps, shortcut and autostart handling |
| `include/Variables.nsh`                          | variables shared by pages and hooks                                                                                                             |
| `include/Logging.nsh`                            | optional install log via `/LOG=<file>`                                                                                                          |
| `include/Checks.nsh`                             | Windows version, x64 and free space checks                                                                                                      |
| `include/Pages.nsh`                              | welcome, license and finish page customizations                                                                                                 |
| `include/Components.nsh`                         | installation options page                                                                                                                       |
| `include/Finish.nsh`                             | finish page helpers                                                                                                                             |
| `include/Hooks.nsh`                              | `NSIS_HOOK_PREINSTALL`, `NSIS_HOOK_POSTINSTALL`, `NSIS_HOOK_PREUNINSTALL`, `NSIS_HOOK_POSTUNINSTALL`                                            |
| `hooks.nsh`                                      | generated from the files above, do not edit                                                                                                     |
| `languages/russian.nsh`, `languages/english.nsh` | `LangString` definitions                                                                                                                        |
| `bitmaps/welcome.bmp`                            | 164x314 sidebar image for the welcome and finish pages                                                                                          |
| `bitmaps/header.bmp`                             | 150x57 header image                                                                                                                             |

## Editing the installer

`hooks.nsh` is generated, so edit the sources under `include/` and
`languages/` and rebuild it:

```
pnpm run installer:hooks
pnpm run installer:check
```

The generator is `scripts/build-installer-hooks.js`. NSIS resolves relative
`!include` paths against the directory of the rendered installer script, not
against the including file, so all sources are inlined into one file that Tauri
includes by absolute path.

Every NSIS source file must be UTF-8 with a BOM, otherwise makensis reads it
with the system codepage and Cyrillic strings break. The generator writes
`hooks.nsh` with a BOM and refuses to build when a source contains an NSIS
directive that starts with `;` instead of `!`.

## Regenerating the bitmaps

```
pnpm run installer:bitmaps
```

`scripts/build-bitmaps.js` writes both BMPs with no external dependencies and
prints the sizes inside `icons/icon.ico`. The files are committed, so a normal
build does not need this step.

## Command line switches

| Switch                      | Effect                                              |
| --------------------------- | --------------------------------------------------- |
| `/S`                        | silent install, no pages, defaults for every option |
| `/CurrentUser`, `/AllUsers` | select the install mode explicitly                  |
| `/LOG=<file>`               | write an install log as UTF-16                      |
| `/NS`                       | do not create shortcuts                             |
| `/UPDATE`, `/P`             | update and passive modes used by Tauri              |

Without `/LOG`, silent installs write `%TEMP%\ZapretManager-install.log`.

## Localization

Add a new language by adding the language name to `languages` in
`src-tauri/tauri.conf.json` and creating `languages/<name>.nsh` with the same
`LangString` names. Tauri generates the MUI2 strings for every language in the
list, only the strings of the custom pages live in this folder.

The installer shows a language selector on the first run and stores the choice
in `HKCU\Software\zapretmanager\Zapret Manager\Installer Language`.

## Testing

```
pnpm tauri build --debug
```

Silent install and uninstall round trip:

```
setup.exe /S /LOG=%TEMP%\zm.log
"%LOCALAPPDATA%\Programs\Zapret Manager\uninstall.exe" /S
```

The uninstaller keeps user data unless the checkbox on the confirm page is
checked, so a silent uninstall preserves `%APPDATA%\com.zapretmanager.app`.

## Signing

```
pnpm tauri build
pnpm run sign:windows
```

`scripts/sign-windows.js` signs the installer with `signtool.exe` and verifies
the signature afterwards. It uses `CERTIFICATE_PATH`, `CERTIFICATE_PASSWORD`,
`CERTIFICATE_TIMESTAMP_URL` and `TAURI_PROFILE` from the environment and exits
successfully without a certificate. Keystore files belong in `.signing/`, which
is ignored by git. No certificate is available in this workspace, so signing is
configured but has not been executed.

## Upgrading the Tauri CLI

The template is a copy of the template shipped with the CLI. After upgrading
`@tauri-apps/cli`, diff the CLI template against `custom-template.nsi` and port
the changes:

```
node scripts/dump-nsis-template.mjs
```

## Known limitations

- MUI2 does not expose a dark theme for the dialog body, the branding comes from
  the sidebar and header bitmaps.
- The installer is elevated in `installMode: both`, because NSIS MultiUser
  requires `Highest` for mixed mode installs. A per-user install therefore shows
  one UAC prompt on accounts that can elevate.
- `.bat` file association is not implemented, the checkbox was dropped as
  specified.
