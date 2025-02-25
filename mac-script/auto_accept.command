#!/bin/zsh

# 创建AppleScript来监控和点击按钮
osascript <<EOD
on isButtonVisible()
    tell application "System Events"
        try
            tell process "Trae"
                # 输出窗口信息
                log "正在检查窗口..."
                set windowList to every window
                repeat with w in windowList
                    log "找到窗口: " & name of w
                    # 输出窗口中的所有UI元素
                    log "窗口中的UI元素:"
                    set uiElements to every UI element of w
                    repeat with elem in uiElements
                        try
                            log "元素类型: " & class of elem & ", 名称: " & name of elem
                            if class of elem is button then
                                log "按钮属性:"
                                log "  - 可见性: " & visible of elem
                                log "  - 启用状态: " & enabled of elem
                                log "  - 位置: " & position of elem
                                log "  - 大小: " & size of elem
                            end if
                        end try
                    end repeat
                end repeat
                
                # 检查特定按钮
                set targetButton to button "全部接受" of window 1
                log "目标按钮信息:"
                log "  - 类型: " & class of targetButton
                log "  - 名称: " & name of targetButton
                log "  - 可见性: " & visible of targetButton
                log "  - 启用状态: " & enabled of targetButton
                
                return exists targetButton
            end tell
        on error errMsg
            log "错误: " & errMsg
            return false
        end try
    end tell
end isButtonVisible

on clickButton()
    tell application "System Events"
        tell process "Trae"
            try
                set targetButton to button "全部接受" of window 1
                log "尝试点击按钮..."
                click targetButton
                log "按钮点击成功"
            on error errMsg
                log "点击按钮时出错: " & errMsg
            end try
        end tell
    end tell
end clickButton

# 主循环
repeat
    if isButtonVisible() then
        clickButton()
        delay 1
    end if
    delay 0.5
end repeat
EOD