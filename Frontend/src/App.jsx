import { useState, useEffect } from 'react';
import { Layout, Button, message } from 'antd';
import { LogoutOutlined, DollarOutlined } from '@ant-design/icons';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import { getCurrentUser } from './services/api';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        message.error('Session expired. Please login again.');
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('Logged out successfully');
  };

  const handleDataUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#001529',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <DollarOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
          <h2 style={{ color: 'white', margin: 0 }}>Finance Tracker</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'white' }}>Welcome, {user.name}</span>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Dashboard refreshTrigger={refreshTrigger} />
          <div style={{ marginTop: '24px' }}>
            <TransactionList onDataUpdate={handleDataUpdate} />
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default App;