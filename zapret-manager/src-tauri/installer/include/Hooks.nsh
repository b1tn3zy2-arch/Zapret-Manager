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