
import React from 'react';
import { useDrag } from 'react-dnd';

export const ItemTypes = {
  TABLE: 'table',
};

interface DraggableTableProps {
  name: string;
}

const DraggableTable: React.FC<DraggableTableProps> = ({ name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TABLE,
    item: { name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px',
        margin: '4px',
        border: '1px dashed gray',
        cursor: 'move',
      }}
    >
      {name}
    </div>
  );
};

export default DraggableTable;
