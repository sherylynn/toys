
import React, { useState, useEffect } from 'react';
import { Tree, Spin } from 'antd';
import apiClient from '../api/apiClient';
import DraggableTable from './DraggableTable';

const { DirectoryTree } = Tree;

interface Table {
  name: string;
  columns: any[]; // Replace with a proper type
}

interface Database {
  id: string;
  name: string;
  tables: Table[];
}

const DatabaseExplorer: React.FC = () => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/api/databases');
        const dbs: Database[] = response.data;

        const newTreeData = await Promise.all(
          dbs.map(async (db) => {
            const tablesResponse = await apiClient.get(`/api/databases/${db.id}/tables`);
            const tables = tablesResponse.data.tables;

            return {
              title: db.name,
              key: db.id,
              children: tables.map((table: string) => ({
                title: <DraggableTable name={table} />,
                key: `${db.id}-${table}`,
                isLeaf: true,
              })),
            };
          })
        );

        setTreeData(newTreeData);
      } catch (error) {
        console.error('Failed to fetch database schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spin />;
  }

  return (
    <DirectoryTree
      multiple
      defaultExpandAll
      treeData={treeData}
    />
  );
};

export default DatabaseExplorer;
