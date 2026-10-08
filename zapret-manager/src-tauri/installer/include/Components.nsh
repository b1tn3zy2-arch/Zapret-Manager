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