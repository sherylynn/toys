import express from 'express';
import { WebSocketServer } from 'ws';
import { exec } from 'child_process';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ port: 8080 });

// WebSocket 连接处理
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // 在这里添加与 Trae 程序交互的逻辑
      // 可以使用 applescript 或其他自动化工具来模拟键盘输入
      
      // 示例：使用 applescript 发送消息到 Trae
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
        set the clipboard to "${data.message}"
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

      const maxRetries = 3;
      let retryCount = 0;

      const executeWithRetry = async () => {
        try {
          await new Promise((resolve, reject) => {
            exec(`osascript -e '${sendMessageScript}'`, (error) => {
              if (error) {
                reject(error);
                return;
              }
              resolve();
            });
          });

          const clipboardContent = await new Promise((resolve, reject) => {
            exec(`osascript -e '${getClipboardContent}'`, (error, stdout) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(stdout.trim());
            });
          });

          if (clipboardContent) {
            ws.send(JSON.stringify({
              response: clipboardContent
            }));
          } else {
            throw new Error('No response from Trae');
          }
        } catch (error) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retry attempt ${retryCount}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return executeWithRetry();
          }
          throw error;
        }
      };

      try {
        await executeWithRetry();
      } catch (error) {
        console.error(`Error after ${maxRetries} retries:`, error);
        ws.send(JSON.stringify({ error: error.message }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// HTTP 路由
app.post('/send-message', async (req, res) => {
  try {
    const { message } = req.body;
    // 这里可以添加额外的消息处理逻辑
    res.json({ success: true, message: 'Message received' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});