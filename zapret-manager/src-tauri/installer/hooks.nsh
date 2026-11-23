; Zapret Manager - NSIS installer hooks and custom pages.
; GENERATED FILE - do not edit it, edit the sources and run `pnpm run installer:hooks`.
; Sources:
;   languages\russian.nsh
;   languages\english.nsh
;   include\Variables.nsh
;   include\Logging.nsh
;   include\Checks.nsh
;   include\Pages.nsh
;   include\Components.nsh
;   include\Finish.nsh
;   include\Hooks.nsh
;
; Tauri includes this single file by absolute path (bundle > windows > nsis > installerHooks).
; NSIS resolves relative !include paths against the directory of the rendered installer
; script, not against this file, so every installer source is inlined here.
; ---------------------------------------------------------------- languages\russian.nsh
LangString ZM_WELCOME_TITLE ${LANG_RUSSIAN} "Добро пожаловать в Zapret Manager"
LangString ZM_LICENSE_TITLE ${LANG_RUSSIAN} "Условия использования"
LangString ZM_FINISH_TITLE ${LANG_RUSSIAN} "Установка завершена!"
LangString ZM_FINISH_SUBTITLE ${LANG_RUSSIAN} "Zapret Manager готов к работе. Нажмите «Готово», чтобы закрыть установщик."
LangString ZM_WELCOME_SUBTITLE ${LANG_RUSSIAN} "Установка займёт меньше минуты"
LangString ZM_WELCOME_FEATURES ${LANG_RUSSIAN} "Приложение для сканирования, запуска и мониторинга стратегий обхода блокировок: Discord, YouTube, Outlast Trials.$\r$\nВ установку входят:$\r$\n• 22 встроенные стратегии обхода$\r$\n• winws.exe и WinDivert для перенаправления трафика$\r$\n• встроенное ядро Xray для VPN-режима$\r$\n• автозапуск, ярлыки и системный трей$\r$\n• работа без Node.js, Rust и Visual C++ Redistributable"
LangString ZM_WELCOME_FEATURES_TITLE ${LANG_RUSSIAN} "Что будет установлено"
LangString ZM_LICENSE_SUMMARY ${LANG_RUSSIAN} "Условия использования Zapret Manager приведены на следующей странице. Установка означает согласие с ними."
LangString ZM_OPTIONS_TITLE ${LANG_RUSSIAN} "Параметры установки"
LangString ZM_OPTIONS_SUBTITLE ${LANG_RUSSIAN} "Выберите ярлыки и автозапуск"
LangString ZM_OPT_DESKTOP ${LANG_RUSSIAN} "Создать ярлык на рабочем столе"
LangString ZM_OPT_STARTMENU ${LANG_RUSSIAN} "Создать ярлык в меню «Пуск»"
LangString ZM_OPT_AUTOSTART ${LANG_RUSSIAN} "Запускать Zapret Manager при старте Windows"
LangString ZM_OPT_LAUNCH ${LANG_RUSSIAN} "Запустить Zapret Manager после установки"
LangString ZM_OPT_TARGET ${LANG_RUSSIAN} "Папка установки: $INSTDIR"
LangString ZM_FINISH_OPENFOLDER ${LANG_RUSSIAN} "Открыть папку установки"
LangString ZM_STEP_CHECK ${LANG_RUSSIAN} "Проверка системы..."
LangString ZM_STEP_EXTRACT ${LANG_RUSSIAN} "Извлечение файлов приложения..."
LangString ZM_STEP_RESOURCES ${LANG_RUSSIAN} "Копирование ресурсов и стратегий..."
LangString ZM_STEP_UNINSTALLER ${LANG_RUSSIAN} "Создание деинсталлятора..."
LangString ZM_STEP_REGISTER ${LANG_RUSSIAN} "Регистрация в списке установленных программ..."
LangString ZM_STEP_SHORTCUTS ${LANG_RUSSIAN} "Создание ярлыков..."
LangString ZM_STEP_AUTOSTART ${LANG_RUSSIAN} "Настройка автозапуска..."
LangString ZM_ERROR_OS ${LANG_RUSSIAN} "Zapret Manager требует Windows 10 версии 1809 или новее."
LangString ZM_ERROR_ARCH ${LANG_RUSSIAN} "Zapret Manager поддерживает только 64-разрядную версию Windows (x64)."
LangString ZM_ERROR_DISK ${LANG_RUSSIAN} "Недостаточно свободного места: требуется минимум 200 МБ."
LangString ZM_ERROR_ROOT ${LANG_RUSSIAN} "Не удалось определить диск для папки установки."

; ---------------------------------------------------------------- languages\english.nsh
LangString ZM_WELCOME_TITLE ${LANG_ENGLISH} "Welcome to Zapret Manager"
LangString ZM_LICENSE_TITLE ${LANG_ENGLISH} "Terms of use"
LangString ZM_FINISH_TITLE ${LANG_ENGLISH} "Installation complete"
LangString ZM_FINISH_SUBTITLE ${LANG_ENGLISH} "Zapret Manager is ready to use. Press Finish to close the installer."
LangString ZM_WELCOME_SUBTITLE ${LANG_ENGLISH} "Installation takes less than a minute"
LangString ZM_WELCOME_FEATURES ${LANG_ENGLISH} "Desktop application to scan, run and monitor DPI bypass strategies for Discord, YouTube and Outlast Trials.$\r$\nThis installation includes:$\r$\n• 22 bundled bypass strategies$\r$\n• winws.exe and WinDivert for traffic redirection$\r$\n• a bundled Xray core for VPN mode$\r$\n• autostart, shortcuts and system tray$\r$\n• no Node.js, Rust or Visual C++ Redistributable required"
LangString ZM_WELCOME_FEATURES_TITLE ${LANG_ENGLISH} "What will be installed"
LangString ZM_LICENSE_SUMMARY ${LANG_ENGLISH} "The Zapret Manager terms of use are shown on the next page. Installing means that you accept them."
LangString ZM_OPTIONS_TITLE ${LANG_ENGLISH} "Installation options"
LangString ZM_OPTIONS_SUBTITLE ${LANG_ENGLISH} "Choose shortcuts and autostart"
LangString ZM_OPT_DESKTOP ${LANG_ENGLISH} "Create a desktop shortcut"
LangString ZM_OPT_STARTMENU ${LANG_ENGLISH} "Create a Start menu shortcut"
LangString ZM_OPT_AUTOSTART ${LANG_ENGLISH} "Start Zapret Manager when Windows boots"
LangString ZM_OPT_LAUNCH ${LANG_ENGLISH} "Launch Zapret Manager after installation"
LangString ZM_OPT_TARGET ${LANG_ENGLISH} "Install folder: $INSTDIR"
LangString ZM_FINISH_OPENFOLDER ${LANG_ENGLISH} "Open the install folder"
LangString ZM_STEP_CHECK ${LANG_ENGLISH} "Checking the system..."
LangString ZM_STEP_EXTRACT ${LANG_ENGLISH} "Extracting application files..."
LangString ZM_STEP_RESOURCES ${LANG_ENGLISH} "Copying resources and strategies..."
LangString ZM_STEP_UNINSTALLER ${LANG_ENGLISH} "Creating the uninstaller..."
LangString ZM_STEP_REGISTER ${LANG_ENGLISH} "Registering in the installed programs list..."
LangString ZM_STEP_SHORTCUTS ${LANG_ENGLISH} "Creating shortcuts..."
LangString ZM_STEP_AUTOSTART ${LANG_ENGLISH} "Configuring autostart..."
LangString ZM_ERROR_OS ${LANG_ENGLISH} "Zapret Manager requires Windows 10 version 1809 or newer."
LangString ZM_ERROR_ARCH ${LANG_ENGLISH} "Zapret Manager only supports 64-bit Windows (x64)."
LangString ZM_ERROR_DISK ${LANG_ENGLISH} "Not enough free disk space: at least 200 MB is required."
LangString ZM_ERROR_ROOT ${LANG_ENGLISH} "Could not determine the drive of the install folder."

; ---------------------------------------------------------------- include\Variables.nsh
; Zapret Manager — variables shared by the installer pages and hooks.

!ifndef ZM_VARIABLES_INCLUDED
!define ZM_VARIABLES_INCLUDED

Var ZMDesktopShortcut
Var ZMStartMenuShortcut
Var ZMAutoStart
Var ZMDesktopCheckbox
Var ZMStartMenuCheckbox
Var ZMAutoStartCheckbox
Var ZMLogPath
Var ZMLogHandle

!ifndef SHCTX
  !define SHCTX HKCU
!endif

!endif

; ---------------------------------------------------------------- include\Logging.nsh
; Zapret Manager — optional install log.
; Enabled with `setup.exe /LOG=<file>`, silent installs default to $TEMP\ZapretManager-install.log.
; NSIS logging cannot be used here: LogSet requires the NSIS_CONFIG_LOG build flag,
; and the Tauri bundler does not pass it.

!ifndef ZM_LOGGING_INCLUDED
!define ZM_LOGGING_INCLUDED

!macro ZM_LogInit
  StrCpy $ZMLogPath ""
  StrCpy $ZMLogHandle ""

  ${GetOptions} $CMDLINE "/LOG=" $0
  ${IfNot} ${Errors}
    StrCpy $ZMLogPath "$0"
  ${Else}
    ${If} ${Silent}
      StrCpy $ZMLogPath "$TEMP\ZapretManager-install.log"
    ${EndIf}
  ${EndIf}

  ${If} $ZMLogPath != ""
    ClearErrors
    FileOpen $ZMLogHandle $ZMLogPath a
    ${If} ${Errors}
      StrCpy $ZMLogPath ""
    ${Else}
      FileWriteUTF16LE $ZMLogHandle "---- ${PRODUCTNAME} ${VERSION}$\r$\n"
      FileWriteUTF16LE $ZMLogHandle "---- $ZMLogPath$\r$\n"
    ${EndIf}
  ${EndIf}
!macroend

!macro ZM_Log message
  ${If} $ZMLogHandle != ""
    FileWriteUTF16LE $ZMLogHandle "${message}$\r$\n"
  ${EndIf}
!macroend

!macro ZM_LogClose
  ${If} $ZMLogHandle != ""
    FileClose $ZMLogHandle
    StrCpy $ZMLogHandle ""
  ${EndIf}
!macroend

!endif

; ---------------------------------------------------------------- include\Checks.nsh
; Zapret Manager — installer system checks.
; Included from hooks.nsh, executed by NSIS_HOOK_PREINSTALL before any file is copied.

!ifndef ZM_CHECKS_INCLUDED
!define ZM_CHECKS_INCLUDED

!include WinVer.nsh

; Aborts the installation with a readable message.
; In silent mode there is no window to show a MessageBox, so the reason goes to the log/console.
!macro ZM_Fatal message
  ${If} ${Silent}
    System::Call 'kernel32::AttachConsole(i -1)i.r0'
    ${If} $0 <> 0
      System::Call 'kernel32::GetStdHandle(i -11)i.r0'
      System::Call 'kernel32::SetConsoleTextAttribute(i r0, i 0x0004)'
      FileWrite $0 "${message}"
      FileWrite $0 "$\r$\n"
    ${EndIf}
  ${Else}
    MessageBox MB_OK|MB_ICONSTOP "${message}"
  ${EndIf}
  Abort
!macroend

!macro ZM_CheckWindowsVersion
  ${IfNot} ${AtLeastWin10}
    !insertmacro ZM_Fatal "$(ZM_ERROR_OS)"
  ${EndIf}
!macroend

!macro ZM_CheckArchitecture
  ${IfNot} ${RunningX64}
    !insertmacro ZM_Fatal "$(ZM_ERROR_ARCH)"
  ${EndIf}
!macroend

!macro ZM_CheckDiskSpace
  ${GetRoot} "$INSTDIR" $0
  ${If} $0 == ""
    !insertmacro ZM_Fatal "$(ZM_ERROR_ROOT)"
  ${EndIf}
  ${DriveSpace} "$0\" "/D=F /S=M" $1
  ${If} $1 == ""
    !insertmacro ZM_Fatal "$(ZM_ERROR_ROOT)"
  ${EndIf}
  ${If} $1 < 200
    !insertmacro ZM_Fatal "$(ZM_ERROR_DISK)"
  ${EndIf}
!macroend

!endif

; ---------------------------------------------------------------- include\Pages.nsh
; Zapret Manager — page customizations.
; The MUI welcome and license pages keep their branded bitmaps, only their own
; title and text controls are reused so the localized strings replace MUI defaults.

!ifndef ZM_PAGES_INCLUDED
!define ZM_PAGES_INCLUDED

Function ZM_WelcomeShow
  SendMessage $mui.WelcomePage.Title ${WM_SETTEXT} 0 "STR:$(ZM_WELCOME_TITLE)"
  SendMessage $mui.WelcomePage.Text ${WM_SETTEXT} 0 "STR:$(ZM_WELCOME_FEATURES)"
FunctionEnd

Function ZM_LicenseShow
  !insertmacro MUI_HEADER_TEXT "$(ZM_LICENSE_TITLE)" "$(ZM_LICENSE_SUMMARY)"
FunctionEnd

Function ZM_FinishShow
  SendMessage $mui.FinishPage.Title ${WM_SETTEXT} 0 "STR:$(ZM_FINISH_TITLE)"
  SendMessage $mui.FinishPage.Text ${WM_SETTEXT} 0 "STR:$(ZM_FINISH_SUBTITLE)"
FunctionEnd

!endif

; ---------------------------------------------------------------- include\Components.nsh
; Zapret Manager — installation options page (shortcuts and autostart).

!ifndef ZM_COMPONENTS_INCLUDED
!define ZM_COMPONENTS_INCLUDED

Function ZM_PageOptions
  !insertmacro MUI_HEADER_TEXT "$(ZM_OPTIONS_TITLE)" "$(ZM_OPTIONS_SUBTITLE)"

  nsDialogs::Create 1018
  Pop $0
  ${If} $(^RTL) = 1
    nsDialogs::SetRTL $(^RTL)
  ${EndIf}

  ${NSD_CreateCheckBox} 0 0u 100% 10u "$(ZM_OPT_DESKTOP)"
  Pop $ZMDesktopCheckbox
  ${NSD_SetState} $ZMDesktopCheckbox $ZMDesktopShortcut
  ${NSD_OnClick} $ZMDesktopCheckbox ZM_DesktopToggled

  ${NSD_CreateCheckBox} 0 16u 100% 10u "$(ZM_OPT_STARTMENU)"
  Pop $ZMStartMenuCheckbox
  ${NSD_SetState} $ZMStartMenuCheckbox $ZMStartMenuShortcut
  ${NSD_OnClick} $ZMStartMenuCheckbox ZM_StartMenuToggled

  ${NSD_CreateCheckBox} 0 32u 100% 10u "$(ZM_OPT_AUTOSTART)"
  Pop $ZMAutoStartCheckbox
  ${NSD_SetState} $ZMAutoStartCheckbox $ZMAutoStart
  ${NSD_OnClick} $ZMAutoStartCheckbox ZM_AutoStartToggled

  ${NSD_CreateLabel} 0 56u 100% 10u "$(ZM_OPT_TARGET)"
  Pop $1

  nsDialogs::Show
FunctionEnd

Function ZM_DesktopToggled
  ${NSD_GetState} $ZMDesktopCheckbox $ZMDesktopShortcut
FunctionEnd

Function ZM_StartMenuToggled
  ${NSD_GetState} $ZMStartMenuCheckbox $ZMStartMenuShortcut
FunctionEnd

Function ZM_AutoStartToggled
  ${NSD_GetState} $ZMAutoStartCheckbox $ZMAutoStart
FunctionEnd

!endif

; ---------------------------------------------------------------- include\Finish.nsh
; Zapret Manager — finish page helpers.
; The MUI finish page is kept for its branded bitmap, its "Run" checkbox is reused
; and the "Show readme" checkbox is repurposed as "Open the install folder".

!ifndef ZM_FINISH_INCLUDED
!define ZM_FINISH_INCLUDED

Function ZM_OpenInstallFolder
  DetailPrint "$(ZM_FINISH_OPENFOLDER)"
  ExecShell open "$INSTDIR"
FunctionEnd

!endif

; ---------------------------------------------------------------- include\Hooks.nsh
; Zapret Manager — NSIS installer lifecycle hooks.
; PREINSTALL runs before any file is copied, POSTINSTALL after the app data is
; written, the UNINSTALL pair keeps the autostart entry and shortcuts clean.

!ifndef ZM_HOOKS_INCLUDED
!define ZM_HOOKS_INCLUDED

!macro NSIS_HOOK_PREINSTALL
  !insertmacro ZM_Log "$(ZM_STEP_CHECK)"
  DetailPrint "$(ZM_STEP_CHECK)"
  !insertmacro ZM_CheckWindowsVersion
  !insertmacro ZM_CheckArchitecture
  !insertmacro ZM_CheckDiskSpace
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ${If} $ZMDesktopShortcut = 1
    DetailPrint "$(ZM_STEP_SHORTCUTS)"
    !insertmacro ZM_Log "$(ZM_STEP_SHORTCUTS)"
  ${EndIf}
  ${If} $ZMAutoStart = 1
    DetailPrint "$(ZM_STEP_AUTOSTART)"
    !insertmacro ZM_Log "$(ZM_STEP_AUTOSTART)"
    WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCTNAME}" "$\"$INSTDIR\${MAINBINARYNAME}.exe$\""
  ${Else}
    DeleteRegValue SHCTX "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCTNAME}"
  ${EndIf}
  !insertmacro ZM_Log "install dir: $INSTDIR"
  !insertmacro ZM_Log "install mode: $MultiUser.InstallMode"
  !insertmacro ZM_LogClose
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro ZM_LogInit
  !insertmacro ZM_Log "uninstall started: $INSTDIR"
  DeleteRegValue SHCTX "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCTNAME}"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$DESKTOP\${PRODUCTNAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCTNAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCTNAME}"
  !insertmacro ZM_Log "uninstall finished"
  !insertmacro ZM_LogClose
!macroend

!endif
