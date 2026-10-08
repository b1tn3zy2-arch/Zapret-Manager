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