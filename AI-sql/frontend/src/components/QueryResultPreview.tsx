
import React from 'react';
import { Table, Card } from 'antd';

interface QueryResultPreviewProps {
  columns: string[];
  data: Record<string, any>[];
}

const QueryResultPreview: React.FC<QueryResultPreviewProps> = ({ columns, data }) => {
  const tableColumns = columns.map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
  }));

  return (
    <Card title="Query Result" style={{ marginTop: 16 }}>
      <Table
        dataSource={data}
        columns={tableColumns}
        rowKey={(record, index) => `row-${index}`}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};

export default QueryResultPreview;
