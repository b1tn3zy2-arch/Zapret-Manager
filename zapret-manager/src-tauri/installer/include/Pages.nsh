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