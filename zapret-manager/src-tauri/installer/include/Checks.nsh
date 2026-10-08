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