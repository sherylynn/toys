import { useState, useEffect, useCallback } from 'react';
import { Box, TextField, IconButton, Paper, Container, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  height: 'calc(100vh - 120px)',
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

const InputContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  '@media (max-width: 600px)': {
    position: 'sticky',
    bottom: 0,
    zIndex: 1000,
    transform: 'translateZ(0)',
    willChange: 'transform'
  }
}));

const Message = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  maxWidth: '80%',
  wordBreak: 'break-word',
}));

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);

  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.response) {
        setMessages(prev => [...prev, { text: data.response, isUser: false }]);
      } else if (data.error) {
        console.error('Error from server:', data.error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleSend = useCallback(() => {
    if (message.trim() && ws && ws.readyState === WebSocket.OPEN) {
      setMessages(prev => [...prev, { text: message, isUser: true }]);
      ws.send(JSON.stringify({ message: message.trim() }));
      setMessage('');
    }
  }, [message, ws]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', padding: 0 }}>
      <MessageContainer>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <Message
              elevation={1}
              sx={{
                backgroundColor: msg.isUser ? '#e3f2fd' : '#f5f5f5',
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
            </Message>
          </Box>
        ))}
      </MessageContainer>
      <InputContainer>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!message.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </InputContainer>
    </Container>
  );
}

export default App;