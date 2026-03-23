!macro customUnInstall
  ; Check if application is running
  nsExec::ExecToLog 'tasklist /FI "IMAGENAME eq Promptly AI.exe" /NH'
  
  Pop $0
  StrCmp $0 "" done
  
  MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
    "Promptly AI is currently running.$\n$\nPlease close the application before continuing with uninstallation." \
    IDOK check_again
    Abort
    
  check_again:
  nsExec::ExecToLog 'tasklist /FI "IMAGENAME eq Promptly AI.exe" /NH'
  Pop $0
  StrCmp $0 "" done
  
  MessageBox MB_YESNO|MB_ICONEXCLAMATION \
    "Application is still running.$\n$\nDo you want to force close it?" \
    IDYES force_close
    Abort
    
  force_close:
  ExecWait 'taskkill /F /IM "Promptly AI.exe"'
  
  done:
!macroend
