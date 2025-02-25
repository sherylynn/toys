tell application "System Events"
  tell process "Trae"
    try
      set frontmost to true
      set focusedWindow to null
      set builderWindowFound to false
      set builderWindowIndex to 0
      
      -- 获取所有窗口信息
      set windowCount to count of windows
      log "窗口总数: " & windowCount
      log "-------------------"
      
      repeat with i from 1 to windowCount
        set currentWindow to window i
        set windowTitle to title of currentWindow
        log "窗口 " & i & ": " & windowTitle
        
        -- 检查是否是Builder窗口
        if windowTitle contains "Builder" then
          set builderWindowFound to true
          set builderWindowIndex to i
          
          -- 检查窗口属性
          log "Builder窗口属性:"
          log "位置: " & position of currentWindow
          log "大小: " & size of currentWindow
          
          -- 检查焦点状态
          if currentWindow is focused then
            log "Builder窗口处于焦点状态"
          else
            log "Builder窗口未处于焦点状态"
          end if
          
          -- 检查窗口层级
          if currentWindow is frontmost then
            log "Builder窗口在最前面"
          else
            log "Builder窗口不在最前面"
          end if
        end if
      end repeat
      
      -- 输出Builder窗口状态摘要
      if builderWindowFound then
        log "发现Builder窗口，索引: " & builderWindowIndex
      else
        log "未发现Builder窗口"
      end if
      
    on error errorMessage
      log "错误: " & errorMessage
    end try
  end tell
end tell