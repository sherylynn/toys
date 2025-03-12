import { useState } from 'react'
import { Table, Button, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import './App.css'

interface NetworkInterface {
  name: string;
  status: string;
  ipAddress: string;
  macAddress: string;
}

function App() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([])
  const [loading, setLoading] = useState(false)

  const columns = [
    {
      title: '网卡名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'MAC地址',
      dataIndex: 'macAddress',
      key: 'macAddress',
    },
  ]

  const refreshInterfaces = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/network');
      const data = await response.json();
      setInterfaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch network interfaces:', error)
      setInterfaces([]);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>虚拟网卡管理</h1>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={refreshInterfaces}
            loading={loading}
          >
            刷新
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={interfaces}
          rowKey="name"
          loading={loading}
        />
      </Space>
    </div>
  )
}

export default App
