import React, { useState, useEffect } from 'react';
import { Card, Input, Button, message, Descriptions } from 'antd';
import { API_ENDPOINTS } from '../config/api';

const ChatInterface = ({ patientId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 获取患者信息
  useEffect(() => {
    if (patientId) {
      fetch(`${API_ENDPOINTS.PATIENT_INFO}/${patientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setPatientInfo(data.data);
          }
        })
        .catch(error => {
          console.error('获取患者信息失败:', error);
          message.error('获取患者信息失败');
        });
    }
  }, [patientId]);

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DIAGNOSIS_ANALYZE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          symptoms: inputValue,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessages(prev => [
          ...prev,
          { type: 'user', content: inputValue },
          { 
            type: 'system', 
            content: data.data.recommendation,
            diseases: data.data.possible_diseases
          }
        ]);
        setInputValue('');
      } else {
        message.error(data.message || '分析失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      {patientInfo && (
        <Card className="patient-info" size="small">
          <Descriptions title="患者信息" column={3}>
            <Descriptions.Item label="姓名">{patientInfo.name}</Descriptions.Item>
            <Descriptions.Item label="年龄">{patientInfo.age}岁</Descriptions.Item>
            <Descriptions.Item label="性别">{patientInfo.gender}</Descriptions.Item>
            <Descriptions.Item label="病史" span={3}>
              {patientInfo.medical_history || '无'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="content">{msg.content}</div>
            {msg.diseases && (
              <div className="diseases">
                <h4>可能的疾病：</h4>
                <ul>
                  {JSON.parse(msg.diseases).map((disease, i) => (
                    <li key={i}>{disease}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="input-area">
        <Input.TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="请描述您的症状..."
          autoSize={{ minRows: 2, maxRows: 6 }}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          type="primary" 
          onClick={handleSend} 
          loading={loading}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;