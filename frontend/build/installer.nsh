; VaultBuddy NSIS Installer Script
; Detects and handles existing installations

!macro customInit
  ; Check if VaultBuddy is already installed
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VaultBuddy" "InstallLocation"
  ${If} $0 != ""
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "VaultBuddy is already installed at:$\n$\n$0$\n$\nClick OK to uninstall the previous version first, or Cancel to abort installation." IDOK uninstall
    Quit
    uninstall:
      ; Run the uninstaller
      ExecWait '"$0\Uninstall VaultBuddy.exe" /S _?=$0'
      Delete "$0\Uninstall VaultBuddy.exe"
      RMDir $0
  ${EndIf}
!macroend

!macro customInstall
  ; Register installation location
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VaultBuddy" "InstallLocation" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Remove registration
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\VaultBuddy"
!macroend

