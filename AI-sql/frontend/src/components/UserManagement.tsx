
import React, { useState, useEffect } from 'react';
import { Table, Card, message, Spin } from 'antd';
import apiClient from '../api/apiClient';

interface User {
  ID: number;
  Username: string;
  Role: string;
  CreatedAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to fetch users.');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'ID',
    },
    {
      title: 'Username',
      dataIndex: 'Username',
      key: 'Username',
    },
    {
      title: 'Role',
      dataIndex: 'Role',
      key: 'Role',
    },
    {
      title: 'Created At',
      dataIndex: 'CreatedAt',
      key: 'CreatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    // Add actions like edit/delete later
  ];

  if (loading) {
    return <Spin tip="Loading users..." />;
  }

  return (
    <Card title="User Management" style={{ marginTop: 16 }}>
      <Table dataSource={users} columns={columns} rowKey="ID" />
    </Card>
  );
};

export default UserManagement;
