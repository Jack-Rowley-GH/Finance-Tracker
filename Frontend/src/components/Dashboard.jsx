import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined, ReloadOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { getTransactionSummary } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const { Title } = Typography;

function Dashboard({ refreshTrigger }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [refreshTrigger]); 

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await getTransactionSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ReloadOutlined spin style={{ fontSize: '24px' }} />
          <div style={{ marginTop: '16px' }}>Loading dashboard...</div>
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Failed to load dashboard data
        </div>
      </Card>
    );
  }


  const pieData = summary.categoryBreakdown
    ? summary.categoryBreakdown
        .filter(item => item.amount > 0)
        .map(item => ({
          type: item.category,
          value: Number(item.amount),
        }))
    : [];


  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.4,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{value}',
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
    tooltip: {
      formatter: (data) => {
        return {
          name: data.type,
          value: formatCurrency(data.value),
        };
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>
        Financial Overview - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Income"
              value={summary.totalIncome}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={summary.totalExpenses}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Balance"
              value={summary.balance}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ 
                color: summary.balance >= 0 ? '#3f8600' : '#cf1322' 
              }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {pieData.length > 0 && (
        <Card title="Expenses by Category">
          <Pie {...pieConfig} height={300} />
        </Card>
      )}
      
      {pieData.length === 0 && (
        <Card title="Expenses by Category">
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#999' 
          }}>
            No expense data to display. Start adding expense transactions!
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;