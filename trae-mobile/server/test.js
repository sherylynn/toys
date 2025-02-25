import { exec } from 'child_process';

// 测试脚本：使用Command+U快捷键与Trae交互
const testTraeInteraction = async () => {
  const testMessage = '这是一个测试，请忽略本条命令';

  const getClipboardContent = `
    set theClipboard to the clipboard as text
    return theClipboard
  `;

  const checkTraeUIScript = `
    tell application "System Events"
      tell process "Trae"
        try
          -- 尝试获取AI对话界面的状态
          set aiDialogWindow to window 1
          set windowTitle to title of aiDialogWindow
          -- 如果窗口标题包含特定文本，说明AI对话界面已打开
          if windowTitle contains "AI对话" then
            return "open"
          else
            return "closed"
          end if
        on error
          return "error"
        end try
      end tell
    end tell
  `;

  const sendMessageScript = `
    -- 先将消息内容存入剪贴板
    set the clipboard to "${testMessage}"
    tell application "Trae"
      activate
      delay 1
    end tell
    tell application "System Events"
      tell process "Trae"
        -- 检查AI对话界面状态
        if not (exists window 1 whose title contains "AI对话") then
          -- 如果AI对话界面未打开，使用Command+U打开
          keystroke "u" using command down
          delay 1
        end if
        -- 粘贴消息并发送
        keystroke "v" using command down
        delay 0.1
        keystroke return
        delay 0.5
        -- 获取响应内容
        keystroke "a" using command down
        delay 0.1
        keystroke "c" using command down
      end tell
    end tell
  `;

  // 首先检查Trae的UI状态
  const uiStatus = await new Promise((resolve, reject) => {
    exec(`osascript -e '${checkTraeUIScript}'`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });

  try {
    // 执行AppleScript发送消息
    await new Promise((resolve, reject) => {
      exec(`osascript -e '${sendMessageScript}'`, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    // 获取剪贴板内容（Trae的响应）
    const clipboardContent = await new Promise((resolve, reject) => {
      exec(`osascript -e '${getClipboardContent}'`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout.trim());
      });
    });

    console.log('测试消息已发送');
    console.log('Trae的响应:', clipboardContent);
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
};

// 执行测试
testTraeInteraction();