
import React from 'react';
import { Form, Select, InputNumber, Button, Space, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

interface OrderByClause {
  column: string;
  direction: 'ASC' | 'DESC';
}

interface OrderByLimitProps {
  initialOrderBy?: OrderByClause[];
  initialLimit?: number;
  onChangeOrderBy: (orderBy: OrderByClause[]) => void;
  onChangeLimit: (limit: number) => void;
}

const OrderByLimit: React.FC<OrderByLimitProps> = ({ initialOrderBy = [], initialLimit = 100, onChangeOrderBy, onChangeLimit }) => {
  const [form] = Form.useForm();

  const onValuesChange = () => {
    const values = form.getFieldsValue();
    onChangeOrderBy(values.orderBy || []);
    onChangeLimit(values.limit || 0);
  };

  return (
    <Card title="Order By & Limit" style={{ marginTop: 16 }}>
      <Form form={form} name="order_by_limit" onValuesChange={onValuesChange} initialValues={{ orderBy: initialOrderBy, limit: initialLimit }} autoComplete="off">
        <Form.List name="orderBy">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'column']}
                    rules={[{ required: true, message: 'Missing column' }]}
                  >
                    <Input placeholder="Column Name" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'direction']}
                    rules={[{ required: true, message: 'Missing direction' }]}
                  >
                    <Select placeholder="Direction" style={{ width: 120 }}>
                      <Option value="ASC">ASC</Option>
                      <Option value="DESC">DESC</Option>
                    </Select>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Order By
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item label="Limit" name="limit">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OrderByLimit;
