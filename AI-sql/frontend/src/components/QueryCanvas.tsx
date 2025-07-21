
import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './DraggableTable';
import { Card, Tag } from 'antd';

interface QueryCanvasProps {
  onDropTable: (tableName: string) => void;
  droppedTables: string[];
}

const QueryCanvas: React.FC<QueryCanvasProps> = ({ onDropTable, droppedTables }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.TABLE,
    drop: (item: { name: string }) => {
      onDropTable(item.name);
    },
  }));

  return (
    <Card
      title="Query Canvas"
      ref={drop}
      style={{
        minHeight: '200px',
        border: '1px dashed #ccc',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      {droppedTables.length === 0 ? (
        <p>Drag tables here to start building your query</p>
      ) : (
        <div>
          {droppedTables.map((table) => (
            <Tag key={table} closable onClose={() => { /* Implement removal later */ }}>
              {table}
            </Tag>
          ))}
        </div>
      )}
    </Card>
  );
};

export default QueryCanvas;
