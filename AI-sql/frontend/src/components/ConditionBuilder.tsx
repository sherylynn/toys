
import React, { useState } from 'react';
import { Form, Select, Input, Button, Space, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

interface QueryCondition {
  column: string;
  operator: string;
  value: string;
}

interface Props {
  initialConditions?: QueryCondition[];
  onChange: (conditions: QueryCondition[]) => void;
}

const ConditionBuilder: React.FC<Props> = ({ initialConditions = [], onChange }) => {
  const [form] = Form.useForm();

  const onValuesChange = () => {
    const conditions = form.getFieldsValue().conditions || [];
    onChange(conditions);
  };

  return (
    <Card title="Query Conditions" style={{ marginTop: 16 }}>
      <Form form={form} name="condition_builder" onValuesChange={onValuesChange} initialValues={{ conditions: initialConditions }} autoComplete="off">
        <Form.List name="conditions">
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
                    name={[name, 'operator']}
                    rules={[{ required: true, message: 'Missing operator' }]}
                  >
                    <Select placeholder="Operator" style={{ width: 120 }}>
                      <Option value="=">Equals (=)</Option>
                      <Option value="!=">Not Equals (!=)</Option>
                      <Option value=">">Greater Than (>)</Option>
                      <Option value="<">Less Than (<)</Option>
                      <Option value=">=">Greater Than or Equals (>=)</Option>
                      <Option value="<=">Less Than or Equals (<=)</Option>
                      <Option value="LIKE">Like (LIKE)</Option>
                      {/* Add more operators as needed */}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    rules={[{ required: true, message: 'Missing value' }]}
                  >
                    <Input placeholder="Value" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Condition
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Card>
  );
};

export default ConditionBuilder;
