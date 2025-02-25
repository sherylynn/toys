tell application "System Events"
  tell process "Trae"
    try
      -- 获取所有窗口信息
      set windowCount to count of windows
      log "窗口总数: " & windowCount
      log "-------------------"
      log "窗口列表:"
      
      repeat with i from 1 to windowCount
        set currentWindow to window i
        set windowTitle to title of currentWindow
        log "窗口 " & i & ": " & windowTitle
        
        if windowTitle contains "Builder" then
          log "发现Builder窗口"
        end if
        if windowTitle contains "AI对话" then
          log "发现AI对话窗口"
        end if
      end repeat
      
    on error errorMessage
      log "错误: " & errorMessage
    end try
  end tell
end tell