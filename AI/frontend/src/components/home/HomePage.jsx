import React from 'react';
import { Typography, Card, Row, Col, Space } from 'antd';
import { MedicineBoxOutlined, TeamOutlined, RobotOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const features = [
    {
      icon: <MedicineBoxOutlined style={{ fontSize: '2em', color: '#1890ff' }} />,
      title: '智能预诊',
      description: '基于本地大模型的智能预诊系统，通过分析患者症状提供初步诊断建议。'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '2em', color: '#52c41a' }} />,
      title: '医患互动',
      description: '提供医生与患者之间的高效沟通渠道，实现诊前预判和诊后跟踪。'
    },
    {
      icon: <RobotOutlined style={{ fontSize: '2em', color: '#722ed1' }} />,
      title: '本地部署',
      description: '采用本地部署的大模型，确保数据安全性的同时提供高效的智能服务。'
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: '2em', color: '#fa8c16' }} />,
      title: '隐私保护',
      description: '严格的数据保护机制，确保患者信息安全，符合医疗数据保护规范。'
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <Typography>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          医疗预诊智能问答系统
        </Title>
        
        <Card style={{ marginBottom: '2rem' }}>
          <Paragraph style={{ fontSize: '16px' }}>
            本系统是一个基于本地大模型的医疗预诊智能问答系统，旨在通过人工智能技术辅助医疗诊断流程，
            提高医疗资源利用效率，为患者提供更便捷的就医体验。
          </Paragraph>
        </Card>

        <Title level={3} style={{ marginBottom: '1.5rem' }}>
          核心功能特性
        </Title>
        
        <Row gutter={[16, 16]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                style={{ height: '100%' }}
                hoverable
              >
                <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
                  {feature.icon}
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph>{feature.description}</Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Title level={3} style={{ margin: '2rem 0 1rem' }}>
          系统工作流程
        </Title>
        
        <Card>
          <ol style={{ fontSize: '16px', lineHeight: '2' }}>
            <li>患者提交症状描述和基本信息</li>
            <li>系统进行智能分析，生成初步诊断建议</li>
            <li>推荐合适的就诊科室和就医建议</li>
            <li>医生查看系统分析结果，进行专业诊断</li>
            <li>形成完整的诊疗闭环，提供诊后建议</li>
          </ol>
        </Card>

        <Title level={3} style={{ margin: '2rem 0 1rem' }}>
          技术特点
        </Title>
        
        <Card>
          <ul style={{ fontSize: '16px', lineHeight: '2' }}>
            <li>采用本地部署的大模型，保证数据安全性和响应速度</li>
            <li>模块化设计，支持灵活扩展和功能定制</li>
            <li>前后端分离架构，确保系统的可维护性和可扩展性</li>
            <li>完整的数据存储和分析体系，支持医疗数据的长期积累和分析</li>
          </ul>
        </Card>
      </Typography>
    </div>
  );
};

export default HomePage;