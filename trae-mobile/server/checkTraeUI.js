import { exec } from 'child_process';

// 检查Trae的UI状态
const checkTraeUIStatus = async () => {
  const checkUIScript = `
    tell application "System Events"
      tell process "Trae"
        try
          set frontmost to true
          set focusedWindow to null
          set builderWindowFound to false
          
          -- 获取所有窗口信息
          repeat with w in windows
            log title of w
            if w is focused then
              set focusedWindow to w
            end if
            if title of w contains "Builder" then
              set builderWindowFound to true
            end if
          end repeat
          
          -- 检查焦点窗口是否是Builder窗口
          if focusedWindow is not null then
            log "Focused window: " & title of focusedWindow
            if title of focusedWindow contains "Builder" then
              log "Builder window is focused"
            end if
          end if
          
          -- 输出Builder窗口状态
          if builderWindowFound then
            log "Builder window exists"
          else
            log "No Builder window found"
          end if
          
        on error errorMessage
          log "Error: " & errorMessage
        end try
      end tell
    end tell
  `;

  try {
    const result = await new Promise((resolve, reject) => {
      exec(`osascript -e '${checkUIScript}'`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stderr.trim());
      });
    });

    const lines = result.split('\n').filter(line => line.trim());
    const windowInfo = {
      titles: [],
      builderExists: false,
      builderFocused: false,
      focusedWindow: null
    };

    lines.forEach(line => {
      const cleanLine = line.replace(/^[^:]+: /, '');
      
      if (cleanLine.startsWith('Error:')) {
        throw new Error(cleanLine.substring(7));
      }
      
      if (cleanLine.startsWith('Focused window:')) {
        windowInfo.focusedWindow = cleanLine.substring('Focused window:'.length).trim();
      } else if (cleanLine === 'Builder window is focused') {
        windowInfo.builderFocused = true;
      } else if (cleanLine === 'Builder window exists') {
        windowInfo.builderExists = true;
      } else if (!cleanLine.startsWith('No Builder window found')) {
        windowInfo.titles.push(cleanLine);
      }
    });
    
    console.log('Trae UI状态检查结果:');
    console.log('-------------------');
    console.log(`窗口总数: ${windowInfo.titles.length}`);
    console.log('\n窗口列表:');
    windowInfo.titles.forEach((title, index) => {
      console.log(`窗口 ${index + 1}: ${title}`);
    });
    
    console.log('\nBuilder窗口状态:');
    if (windowInfo.builderExists) {
      console.log('✓ Builder窗口已打开');
      if (windowInfo.builderFocused) {
        console.log('✓ Builder窗口当前处于焦点状态');
      } else {
        console.log('× Builder窗口未处于焦点状态');
      }
    } else {
      console.log('× 未发现Builder窗口');
    }
    
    return windowInfo;

  } catch (error) {
    console.error('执行AppleScript时出错:', error);
  }
};

// 执行UI状态检查
checkTraeUIStatus();