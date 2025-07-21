
import React, { useState } from 'react';
import { Layout, Row, Col, Card, Button, message } from 'antd';
import DatabaseExplorer from './DatabaseExplorer';
import QueryCanvas from './QueryCanvas';
import ConditionBuilder from './ConditionBuilder';
import OrderByLimit from './OrderByLimit';
import QueryResultPreview from './QueryResultPreview';
import apiClient from '../api/apiClient';

const { Content } = Layout;

interface QueryCondition {
  column: string;
  operator: string;
  value: string;
}

interface QueryRequest {
  database_id: string;
  tables: string[];
  columns: { table: string; column: string }[];
  conditions: QueryCondition[];
  order_by: { column: string; direction: string }[];
  limit: number;
}

const QueryPage: React.FC = () => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [orderBy, setOrderBy] = useState<{ column: string; direction: 'ASC' | 'DESC' }[]>([]);
  const [limit, setLimit] = useState<number>(100);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleTablesDrop = (tableName: string) => {
    setSelectedTables((prev) => {
      if (!prev.includes(tableName)) {
        return [...prev, tableName];
      }
      return prev;
    });
  };

  const handleBuildQuery = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/query/build', queryRequest);
      setQueryResult(response.data);
      message.success('Query built successfully!');
    } catch (error) {
      message.error('Failed to build query.');
      console.error('Query build error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportQuery = async () => {
    setExportLoading(true);
    try {
      const response = await apiClient.post('/api/query/export', queryRequest, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for file downloads
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query_results.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success('Export successful!');
    } catch (error) {
      message.error('Failed to export query.');
      console.error('Query export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card title="Database Explorer">
              <DatabaseExplorer />
            </Card>
          </Col>
          <Col span={18}>
            <QueryCanvas onDropTable={handleTablesDrop} droppedTables={selectedTables} />
            <ConditionBuilder onChange={setConditions} />
            <OrderByLimit onChangeOrderBy={setOrderBy} onChangeLimit={setLimit} />
            <Button type="primary" onClick={handleBuildQuery} loading={loading} style={{ marginTop: 16, marginRight: 8 }}>
              Build Query
            </Button>
            <Button type="default" onClick={handleExportQuery} loading={exportLoading} style={{ marginTop: 16 }}>
              Export to Excel
            </Button>
            {queryResult && queryResult.data && (
              <QueryResultPreview columns={queryResult.columns} data={queryResult.data} />
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default QueryPage;
