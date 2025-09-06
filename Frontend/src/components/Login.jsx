import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, DollarOutlined } from '@ant-design/icons';
import { login, register } from '../services/api';

const { Title } = Typography;

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const userData = await login(values.email, values.password);
      message.success('Login successful!');
      onLogin(userData);
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const userData = await register(
        values.name,
        values.email,
        values.password,
        values.confirmPassword
      );
      message.success('Registration successful!');
      onLogin(userData);
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const LoginForm = () => (
    <Form onFinish={handleLogin} layout="vertical" size="large">
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="Email" 
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="Password" 
        />
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          block
          size="large"
        >
          Login
        </Button>
      </Form.Item>
    </Form>
  );

  const RegisterForm = () => (
    <Form onFinish={handleRegister} layout="vertical" size="large">
      <Form.Item
        name="name"
        rules={[{ required: true, message: 'Please enter your name' }]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Full Name" 
        />
      </Form.Item>
      
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="Email" 
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please enter your password' },
          { min: 6, message: 'Password must be at least 6 characters' }
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="Password" 
        />
      </Form.Item>
      
      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="Confirm Password" 
        />
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          block
          size="large"
        >
          Register
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <DollarOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={2} style={{ margin: '12px 0 0 0' }}>
            Finance Tracker
          </Title>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'login',
              label: 'Login',
              children: <LoginForm />
            },
            {
              key: 'register',
              label: 'Register',
              children: <RegisterForm />
            }
          ]}
        />
      </Card>
    </div>
  );
}

export default Login;