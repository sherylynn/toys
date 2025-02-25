import React, { useState, useEffect } from 'react';
import { Table, Card, Modal, Form, Input, Button, Tag, message } from 'antd';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const { TextArea } = Input;

const DoctorPortal = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);
  const [form] = Form.useForm();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.DOCTOR_PATIENTS}`);
      // 确保从正确的数据结构中获取数据
      const patientsData = response.data?.data || [];
      
      // 处理每个诊断记录的数据
      const processedData = patientsData.map(diagnosis => ({
        key: `diagnosis_${diagnosis.id}_patient_${diagnosis.patient_id || 'unknown'}`,
        id: diagnosis.id,
        name: diagnosis.name,
        age: diagnosis.age,
        gender: diagnosis.gender,
        symptoms: diagnosis.symptoms,
        medical_history: diagnosis.medical_history,
        possible_diseases: Array.isArray(diagnosis.possible_diseases) ? 
          diagnosis.possible_diseases : 
          (typeof diagnosis.possible_diseases === 'string' ? 
            JSON.parse(diagnosis.possible_diseases) : 
            []),
        recommendation: diagnosis.recommendation,
        status: diagnosis.status || 'pending',
        created_at: diagnosis.created_at || new Date().toISOString(),
        doctor_notes: diagnosis.doctor_notes,
        patient: {
          id: diagnosis.patient_id,
          name: diagnosis.name,
          age: diagnosis.age,
          gender: diagnosis.gender,
          symptoms: diagnosis.symptoms,
          medical_history: diagnosis.medical_history
        }
      }));
      
      setPatients(processedData);
    } catch (error) {
      console.error('获取患者列表失败:', error);
      message.error('获取患者列表失败');
      setPatients([]); // 发生错误时设置为空数组
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
    // 定期刷新患者列表
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDiagnosis = (record) => {
    setCurrentDiagnosis(record);
    form.setFieldsValue({
      doctor_notes: record.doctor_notes || ''
    });
    setModalVisible(true);
  };

  const handleSubmitNotes = async (values) => {
    try {
      await axios.post(`http://localhost:8000/doctor/diagnosis/${currentDiagnosis.id}/notes`, values);
      message.success('诊断意见已提交');
      setModalVisible(false);
      fetchPatients();
    } catch (error) {
      message.error('提交失败，请重试');
    }
  };

  const columns = [
    {
      title: '患者姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => gender === 'male' ? '男' : '女'
    },
    {
      title: '症状描述',
      dataIndex: 'symptoms',
      key: 'symptoms',
      ellipsis: true
    },
    {
      title: 'AI诊断建议',
      dataIndex: 'recommendation',
      key: 'recommendation',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'gold',
          reviewed: 'blue',
          completed: 'green'
        };
        const texts = {
          pending: '待处理',
          reviewed: '已查看',
          completed: '已完成'
        };
        return <Tag color={colors[status]}>{texts[status]}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDiagnosis(record)}>
          查看详情
        </Button>
      )
    }
  ];

  return (
    <div>
      <Card title="患者诊断列表">
        <Table
          loading={loading}
          dataSource={patients}
          columns={columns}
          rowKey="id"
        />
      </Card>

      <Modal
        title="诊断详情"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        {currentDiagnosis && (
          <div>
            <Card title="患者信息" style={{ marginBottom: 16 }}>
              <p><strong>姓名：</strong>{currentDiagnosis.patient.name}</p>
              <p><strong>年龄：</strong>{currentDiagnosis.patient.age}</p>
              <p><strong>性别：</strong>{currentDiagnosis.patient.gender === 'male' ? '男' : '女'}</p>
              <p><strong>症状描述：</strong>{currentDiagnosis.patient.symptoms}</p>
              {currentDiagnosis.patient.medical_history && (
                <p><strong>既往病史：</strong>{currentDiagnosis.patient.medical_history}</p>
              )}
            </Card>

            <Card title="AI诊断结果" style={{ marginBottom: 16 }}>
              <p><strong>可能的疾病：</strong></p>
              <ul>
                {currentDiagnosis.possible_diseases.map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))}
              </ul>
              <p><strong>建议：</strong>{currentDiagnosis.recommendation}</p>
            </Card>

            <Card title="医生诊断意见">
              <Form
                form={form}
                onFinish={handleSubmitNotes}
                layout="vertical"
              >
                <Form.Item
                  name="doctor_notes"
                  label="补充说明"
                  rules={[{ required: true, message: '请输入诊断意见' }]}
                >
                  <TextArea rows={4} placeholder="请输入您的诊断意见和建议" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    提交诊断意见
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPortal;