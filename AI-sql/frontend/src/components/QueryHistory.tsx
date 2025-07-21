
import React, { useState, useEffect } from 'react';
import { Table, Card, message, Spin } from 'antd';
import apiClient from '../api/apiClient';

interface QueryHistoryEntry {
  ID: number;
  DatabaseID: string;
  QueryJSON: string;
  SQL: string;
  CreatedAt: string;
}

const QueryHistory: React.FC = () => {
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/query/history');
      setHistory(response.data);
    } catch (error) {
      message.error('Failed to fetch query history.');
      console.error('Fetch query history error:', error);
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
      title: 'Database ID',
      dataIndex: 'DatabaseID',
      key: 'DatabaseID',
    },
    {
      title: 'SQL Query',
      dataIndex: 'SQL',
      key: 'SQL',
      render: (text: string) => <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{text}</pre>,
    },
    {
      title: 'Created At',
      dataIndex: 'CreatedAt',
      key: 'CreatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  if (loading) {
    return <Spin tip="Loading query history..." />;
  }

  return (
    <Card title="Query History" style={{ marginTop: 16 }}>
      <Table dataSource={history} columns={columns} rowKey="ID" />
    </Card>
  );
};

export default QueryHistory;
