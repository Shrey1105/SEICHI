import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Typography, Tag, Space, Input, Select, DatePicker, Row, Col, Statistic } from 'antd';
import { EyeOutlined, DownloadOutlined, SearchOutlined, FilterOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchReports, deleteReport } from '../store/slices/reportsSlice';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Report {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  analysis_type: string;
  scope?: string;
  created_at: string;
  completed_at?: string;
  company_profile: string;
  languages: string[];
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { reports, loading } = useSelector((state: RootState) => state.reports);
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Mock data for historical reports
  const historicalReports: Report[] = [
    {
      id: 1,
      title: "Q4 2024 Regulatory Changes Analysis",
      status: "completed",
      analysis_type: "comprehensive",
      scope: "Financial services sector regulatory changes",
      created_at: "2024-01-15T10:00:00Z",
      completed_at: "2024-01-15T14:30:00Z",
      company_profile: "TechCorp Solutions",
      languages: ["English", "Spanish"]
    },
    {
      id: 2,
      title: "Environmental Regulations Update",
      status: "completed",
      analysis_type: "targeted",
      scope: "Environmental compliance requirements",
      created_at: "2024-01-14T09:00:00Z",
      completed_at: "2024-01-14T11:15:00Z",
      company_profile: "GreenEnergy Ltd",
      languages: ["English"]
    },
    {
      id: 3,
      title: "Labor Law Changes Analysis",
      status: "in_progress",
      analysis_type: "comprehensive",
      scope: "Labor regulations and compliance",
      created_at: "2024-01-13T08:00:00Z",
      company_profile: "TechCorp Solutions",
      languages: ["English", "French"]
    },
    {
      id: 4,
      title: "Automotive Safety Standards",
      status: "completed",
      analysis_type: "targeted",
      scope: "Vehicle safety regulations",
      created_at: "2024-01-12T07:00:00Z",
      completed_at: "2024-01-12T09:45:00Z",
      company_profile: "TechCorp Solutions",
      languages: ["English", "German"]
    },
    {
      id: 5,
      title: "Data Protection Compliance Review",
      status: "completed",
      analysis_type: "monitoring",
      scope: "GDPR and data privacy regulations",
      created_at: "2024-01-11T06:00:00Z",
      completed_at: "2024-01-11T08:20:00Z",
      company_profile: "TechCorp Solutions",
      languages: ["English"]
    },
    {
      id: 6,
      title: "Cybersecurity Framework Analysis",
      status: "pending",
      analysis_type: "comprehensive",
      scope: "Cybersecurity regulations and standards",
      created_at: "2024-01-10T05:00:00Z",
      company_profile: "TechCorp Solutions",
      languages: ["English", "Spanish"]
    }
  ];

  useEffect(() => {
    dispatch(fetchReports({}));
  }, [dispatch]);

  const handleViewReport = (reportId: number) => {
    navigate(`/report/${reportId}`);
  };

  const handleDeleteReport = async (reportId: number) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      console.log('Delete report:', reportId);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    console.log('Download report:', reportId);
  };

  const filteredReports = historicalReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         report.scope?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || report.status === statusFilter;
    const matchesType = !typeFilter || report.analysis_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'analysis_type',
      key: 'analysis_type',
      width: '12%',
      render: (type: string) => (
        <Tag color="blue">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Company Profile',
      dataIndex: 'company_profile',
      key: 'company_profile',
      width: '15%',
    },
    {
      title: 'Languages',
      dataIndex: 'languages',
      key: 'languages',
      width: '10%',
      render: (languages: string[]) => (
        <div>
          {languages.map((lang, index) => (
            <Tag key={index} className="mb-1 text-xs">
              {lang}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '12%',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '9%',
      render: (_: any, record: Report) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record.id)}
            className="bg-green-500 border-green-500 hover:bg-green-600"
          >
            View
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadReport(record.id)}
            disabled={record.status !== 'completed'}
          >
            PDF
          </Button>
        </Space>
      ),
    },
  ];

  const completedReports = historicalReports.filter(r => r.status === 'completed').length;
  const inProgressReports = historicalReports.filter(r => r.status === 'in_progress').length;
  const totalReports = historicalReports.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2">Reports</Title>
        <Text type="secondary">Historical access to all generated regulatory analysis reports</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Reports"
              value={totalReports}
              prefix={<FileTextOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedReports}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={inProgressReports}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={Math.round((completedReports / totalReports) * 100)}
              suffix="%"
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <Search
              placeholder="Search reports..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} lg={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              className="w-full"
            >
              <Option value="completed">Completed</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="pending">Pending</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} lg={4}>
            <Select
              placeholder="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              className="w-full"
            >
              <Option value="comprehensive">Comprehensive</Option>
              <Option value="targeted">Targeted</Option>
              <Option value="monitoring">Monitoring</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} lg={6}>
            <RangePicker className="w-full" />
          </Col>
        </Row>
      </Card>

      {/* Reports Table */}
      <Card title="Historical Reports">
        <Table
          dataSource={filteredReports}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reports`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default Reports;