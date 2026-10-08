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