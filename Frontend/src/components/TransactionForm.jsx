import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { createTransaction, updateTransaction, getCategories } from '../services/api';

const { Option } = Select;

function TransactionForm({ visible, transaction, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (visible) {
      loadCategories();
      if (transaction) {
        form.setFieldsValue({
          ...transaction,
          date: dayjs(transaction.date),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          date: dayjs(),
          type: 2, 
        });
      }
    }
  }, [visible, transaction, form]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([
        'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
        'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
        'Salary', 'Business', 'Investments', 'Other'
      ]);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const transactionData = {
        ...values,
        date: values.date.toISOString(),
      };

      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
        message.success('Transaction updated successfully');
      } else {
        await createTransaction(transactionData);
        message.success('Transaction created successfully');
      }
      
      onSubmit();
    } catch (error) {
      message.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={transaction ? 'Edit Transaction' : 'Add Transaction'}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select transaction type' }]}
        >
          <Select placeholder="Select type">
            <Option value={1}>Income</Option>
            <Option value={2}>Expense</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <Input placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Please enter amount' },
            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter amount"
            precision={2}
            min={0.01}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select or enter category' }]}
        >
          <Select
            placeholder="Select or type a new category"
            allowClear
            showSearch
            mode="combobox"
            filterOption={false}
            notFoundContent="Type to add new category"
          >
            {categories.map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default TransactionForm;