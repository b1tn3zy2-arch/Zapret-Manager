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