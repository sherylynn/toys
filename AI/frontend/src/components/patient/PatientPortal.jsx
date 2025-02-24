import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Card, message, List, Avatar } from 'antd';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import './PatientPortal.css';

const { Option } = Select;
const { TextArea } = Input;

const PatientPortal = () => {
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatMode, setChatMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:1.5b');
  const [patientInfo, setPatientInfo] = useState(null); // 添加患者信息状态

  useEffect(() => {
    // 临时科室数据
    const tempDepartments = [
      { id: 1, name: '皮肤科' },
      { id: 2, name: '发热门诊' }
    ];
    setDepartments(tempDepartments);

    // 添加初始欢迎消息
    setMessages([
      {
        author: 'AI助手',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
        content: '您好！我是您的智能医疗助手。请告诉我您的症状，我会帮您进行初步诊断。',
        datetime: new Date().toLocaleString()
      }
    ]);

    // 设置表单默认值
    form.setFieldsValue({
      name: '张三',
      phone: '13800138000',
      department_id: 1,
      age: '35',
      gender: 'male',
      symptoms: '最近三天出现发热症状，体温38.5度，伴有咳嗽和头痛。',
      medical_history: '有轻度高血压病史，平时服用降压药物。'
    });
  }, [form]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // 添加用户消息
    const userMessage = {
      author: '患者',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg',
      content: inputMessage,
      datetime: new Date().toLocaleString()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');

    // 添加AI思考中的消息
    const thinkingMessage = {
      author: 'AI助手',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 8 }}>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div>AI正在思考中...</div>
        </div>
      ),
      datetime: new Date().toLocaleString(),
      isLoading: true
    };

    setMessages(prevMessages => [...prevMessages, thinkingMessage]);

    try {
      // 使用状态中保存的患者信息
      if (!patientInfo || !patientInfo.patient_id) {
        console.error('患者信息不完整:', patientInfo);
        message.error('患者信息不完整，请重新提交问诊');
        return;
      }
      
      // 构建完整的诊断请求数据
      const diagnosisData = {
        patient_id: patientInfo.patient_id,
        symptoms: inputMessage,
        model: selectedModel,
        age: patientInfo.age,
        gender: patientInfo.gender,
        medical_history: patientInfo.medical_history
      };
      
      console.log('发送诊断请求，患者信息:', diagnosisData);
      
      // 调用后端API进行症状分析
      const response = await axios.post(API_ENDPOINTS.DIAGNOSIS_ANALYZE, diagnosisData);

      if (response.data.status === 'success' && response.data.data) {
        const { possible_diseases, recommendation } = response.data.data;
        
        // 移除加载消息并添加AI回复
        setMessages(prevMessages => {
          const filteredMessages = prevMessages.filter(msg => !msg.isLoading);
          return [...filteredMessages, {
            author: 'AI助手',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
            content: (
              <div>
                <div><strong>可能的疾病：</strong></div>
                <ul>
                  {possible_diseases.map((disease, index) => (
                    <li key={index}>{disease}</li>
                  ))}
                </ul>
                <div><strong>建议：</strong></div>
                <div style={{ whiteSpace: 'pre-line' }}>{recommendation}</div>
              </div>
            ),
            datetime: new Date().toLocaleString()
          }];
        });
      } else {
        throw new Error('返回数据格式不正确');
      }
    } catch (error) {
      console.error('AI分析失败:', error);
      // 移除加载消息并显示错误提示
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => !msg.isLoading);
        return [...filteredMessages];
      });
      message.error('无法获取AI回复，请稍后重试');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 只提交患者基本信息
      const response = await axios.post(API_ENDPOINTS.PATIENT_INFO, {
        name: values.name,
        phone: values.phone,
        age: values.age,
        gender: values.gender,
        symptoms: values.symptoms,
        medical_history: values.medical_history,
        department_id: values.department_id
      });

      // 如果患者信息提交成功
      if (response.data && response.data.status === 'success') {
        message.success('患者信息提交成功，即将进入智能问诊');
        const patientId = response.data.data.patient_id;
        // 保存患者信息到状态
        setPatientInfo({
          patient_id: patientId,
          ...values
        });
        form.setFieldsValue({ patient_id: patientId });
        setChatMode(true);
      } else {
        throw new Error(response.data?.message || '提交患者信息失败');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '提交失败，请稍后重试');
      console.error('提交患者信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {chatMode ? (
        <Card title="智能问诊对话">
          {patientInfo && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <h4 style={{ marginBottom: 8 }}>患者信息</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div>姓名：{patientInfo.name}</div>
                <div>年龄：{patientInfo.age}岁</div>
                <div>性别：{patientInfo.gender === 'male' ? '男' : '女'}</div>
              </div>
              {patientInfo.medical_history && (
                <div style={{ marginTop: 8 }}>
                  <strong>既往病史：</strong>{patientInfo.medical_history}
                </div>
              )}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              style={{ width: 200 }}
            >
              <Option value="deepseek-r1:1.5b">DeepSeek-1.5B</Option>
              <Option value="qwen2.5:1.5b">Qwen-1.5B</Option>
            </Select>
          </div>
          <div style={{ height: '400px', overflowY: 'auto', marginBottom: 16 }}>
            <List
              itemLayout="horizontal"
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={msg.avatar} />}
                    title={<span>{msg.author} - {msg.datetime}</span>}
                    description={msg.content}
                  />
                </List.Item>
              )}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input.TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="请描述您的症状..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ flex: 1 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button type="primary" onClick={handleSendMessage}>
              发送
            </Button>
          </div>
        </Card>
      ) : (
        <Card title="患者挂号">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="department_id"
              label="就诊科室"
              rules={[{ required: true, message: '请选择就诊科室' }]}
            >
              <Select placeholder="请选择科室">
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="age"
              label="年龄"
              rules={[{ required: true, message: '请输入年龄' }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Select>
                <Option value="male">男</Option>
                <Option value="female">女</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="symptoms"
              label="症状描述"
              rules={[{ required: true, message: '请描述您的症状' }]}
            >
              <TextArea rows={4} placeholder="请详细描述您的症状和不适情况" />
            </Form.Item>

            <Form.Item
              name="medical_history"
              label="既往病史"
            >
              <TextArea rows={3} placeholder="如有既往病史，请在此说明" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                提交问诊
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default PatientPortal;