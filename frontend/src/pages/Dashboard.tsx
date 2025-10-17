import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Button, Table, Space, Modal, Form, Input, DatePicker, Select, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
  BarChartOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  BellOutlined,
  UserOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchReports } from '../store/slices/reportsSlice';
import { fetchCompanyProfiles } from '../store/slices/companyProfilesSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { reports, loading: reportsLoading } = useSelector((state: RootState) => state.reports);
  const { profiles, loading: profilesLoading } = useSelector((state: RootState) => state.companyProfiles);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isCreateAnalysisModalVisible, setIsCreateAnalysisModalVisible] = useState(false);
  const [createAnalysisForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchReports({}));
    dispatch(fetchCompanyProfiles({}));
  }, [dispatch]);

  const loading = reportsLoading || profilesLoading;

  // Use real reports data from Redux store
  const recentReports = reports.map(report => ({
    id: report.id,
    name: report.title,
    status: report.status === 'completed' ? 'Completed' : 
            report.status === 'in_progress' ? 'Running' : 
            report.status === 'pending' ? 'Pending' : 'Failed',
    date: new Date(report.created_at).toISOString().split('T')[0]
  }));

  const handleCreateAnalysis = () => {
    setIsCreateAnalysisModalVisible(true);
  };

  const handleCreateAnalysisSubmit = async (values: any) => {
    try {
      console.log('Creating Analysis - Form Values:', values);
      
      // Prepare the request data
      const analysisData = {
        title: values.title || 'New Analysis',
        categories: values.categories || 'General',
        target_product_path: values.targetProductPath || '',
        start_date: values.startDate ? values.startDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        end_date: values.endDate ? values.endDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        notification_emails: Array.isArray(values.notificationEmails) ? values.notificationEmails : [],
        trusted_websites: Array.isArray(values.trustedWebsites) ? values.trustedWebsites : [],
        languages: Array.isArray(values.languages) ? values.languages : ['English'],
        target_country: values.targetCountry || 'United States',
        guardrails: values.guardrails || ''
      };

      console.log('Sending request data:', JSON.stringify(analysisData, null, 2));

      // Call the backend API
      const response = await fetch('http://localhost:8000/api/analysis/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(analysisData)
      });

      console.log('Response status:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Analysis created successfully:', result);
        
        // Show success message
        alert(`Analysis started successfully! Report ID: ${result.report_id}`);
        
        // Close modal and reset form
        setIsCreateAnalysisModalVisible(false);
        createAnalysisForm.resetFields();
        
        // Refresh the reports data
        dispatch(fetchReports({}));
      } else {
        const error = await response.json();
        console.error('Failed to create analysis:', error);
        
        // Better error message handling
        let errorMessage = 'Unknown error';
        if (error.detail) {
          if (Array.isArray(error.detail)) {
            // Handle validation errors array
            errorMessage = error.detail.map((err: any) => {
              const field = err.loc?.join('.') || 'unknown';
              const message = err.msg || JSON.stringify(err);
              const type = err.type || '';
              return `Field "${field}": ${message} (type: ${type})`;
            }).join('\n');
          } else if (typeof error.detail === 'string') {
            errorMessage = error.detail;
          } else {
            errorMessage = JSON.stringify(error.detail, null, 2);
          }
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = JSON.stringify(error, null, 2);
        }
        
        console.error('Full error object:', error);
        alert(`Failed to create analysis:\n\n${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating analysis:', error);
      alert('Error creating analysis. Please try again.');
    }
  };

  const handleViewReport = (reportId: number) => {
    navigate(`/report/${reportId}`);
  };

  const handleDeleteReport = (reportId: number) => {
    console.log('Delete report:', reportId);
  };

  const recentReportsColumns = [
    {
      title: 'Report Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="font-medium text-gray-900">{text}</div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <div className="text-gray-600">{new Date(date).toLocaleDateString()}</div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === 'Completed' ? 'bg-green-100 text-green-800' :
          status === 'Running' ? 'bg-blue-100 text-blue-800' :
          status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
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
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteReport(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={1} className="mb-2 text-4xl font-bold text-gray-900">Regulatory Intelligence</Title>
          <Text type="secondary" className="text-lg text-gray-600">Monitor regulatory compliance and changes</Text>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateAnalysis}
            className="bg-green-500 border-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            + Create Analysis
          </Button>
          <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors duration-200">
            <BellOutlined className="text-2xl text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">3</span>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <UserOutlined className="text-white text-sm" />
            </div>
            <div>
              <Text className="text-sm font-medium text-gray-800 block">{user?.full_name || "Demo User"}</Text>
              <Text className="text-xs text-gray-500">Administrator</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
            <div className="flex items-center justify-center mb-2">
              <BarChartOutlined className="text-3xl text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{reports.filter(r => r.status === 'in_progress').length}</div>
            <div className="text-gray-600">Active Analyses</div>
            <div className="text-xs text-green-600 mt-1">Currently running</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-center mb-2">
              <PlusOutlined className="text-3xl text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{reports.filter(r => r.status === 'completed').length}</div>
            <div className="text-gray-600">Completed Reports</div>
            <div className="text-xs text-blue-600 mt-1">Ready for review</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-center mb-2">
              <ClockCircleOutlined className="text-3xl text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{reports.filter(r => r.status === 'pending').length}</div>
            <div className="text-gray-600">Pending Reports</div>
            <div className="text-xs text-orange-600 mt-1">Waiting to start</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-center mb-2">
              <EyeOutlined className="text-3xl text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{reports.length}</div>
            <div className="text-gray-600">Total Reports</div>
            <div className="text-xs text-purple-600 mt-1">All time</div>
          </Card>
        </Col>
      </Row>

      {/* Recent Reports */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Recent Reports</span>
            <Button 
              type="link" 
              onClick={() => navigate('/reports')}
              className="text-blue-500 hover:text-blue-700"
            >
              View All
            </Button>
          </div>
        }
        className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {recentReports.length > 0 ? (
          <Table 
            dataSource={recentReports} 
            columns={recentReportsColumns}
            pagination={false}
            size="small"
            className="recent-reports-table"
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChartOutlined className="text-4xl mb-4 text-gray-300" />
            <p className="text-lg mb-2">No reports yet</p>
            <p className="text-sm">Create your first analysis to get started</p>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateAnalysis}
              className="mt-4 bg-green-500 border-green-500 hover:bg-green-600"
            >
              Create Analysis
            </Button>
          </div>
        )}
      </Card>

      {/* Create Analysis Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <PlusOutlined className="text-green-500" />
            <span className="text-lg font-semibold">Create New Analysis</span>
          </div>
        }
        open={isCreateAnalysisModalVisible}
        onCancel={() => setIsCreateAnalysisModalVisible(false)}
        footer={null}
        width={900}
        className="create-analysis-modal"
        destroyOnClose
      >
        <Form
          form={createAnalysisForm}
          layout="vertical"
          onFinish={handleCreateAnalysisSubmit}
          initialValues={{
            targetCountry: "United States",
            languages: ["English"]
          }}
        >
          <Form.Item
            name="title"
            label="Title *"
            rules={[{ required: true, message: 'Please enter analysis title' }]}
          >
            <Input placeholder="Enter analysis title" />
          </Form.Item>

          <Form.Item
            name="categories"
            label="Categories & Regulation Paths *"
            rules={[{ required: true, message: 'Please enter regulation paths' }]}
          >
            <Input placeholder="Regulation folder path (e.g., /IEC/EI...)" />
          </Form.Item>

          <Form.Item
            name="targetProductPath"
            label="Target Product Folder Path"
          >
            <Input placeholder="Enter Box folder path for target products (e.g., NECPF_Products)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date *"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date *"
                rules={[{ required: true, message: 'Please select end date' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notificationEmails"
            label="Notification Email Addresses"
            help="Press Enter after typing each email address to add it. These emails will receive SMS notifications when the analysis completes."
          >
            <Select
              mode="tags"
              placeholder="Add email addresses..."
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="trustedWebsites"
            label="Trusted Websites"
            help="Press Enter after typing each website URL to add it. These websites will be prioritized during research."
          >
            <Select
              mode="tags"
              placeholder="Enter website URLs (e.g., iec.ch)"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="languages"
            label="Analysis Languages"
            help="Select one or more languages for the analysis"
          >
            <Select
              mode="multiple"
              placeholder="Select languages"
              className="w-full"
            >
              <Option value="English">English</Option>
              <Option value="Spanish">Spanish (Español)</Option>
              <Option value="French">French (Français)</Option>
              <Option value="German">German (Deutsch)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="targetCountry"
            label="Target Country"
            help="The analysis will focus on regulatory changes in this country and global changes that affect it"
          >
            <Select className="w-full">
              <Option value="India">India</Option>
              <Option value="United States">United States</Option>
              <Option value="United Kingdom">United Kingdom</Option>
              <Option value="Germany">Germany</Option>
              <Option value="France">France</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="guardrails"
            label="Guardrails (Most Important Instructions)"
            help="These instructions will be prioritized above all other requirements for the analysis"
          >
            <TextArea rows={4} placeholder="Enter your most important instructions..." />
          </Form.Item>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Button 
              onClick={() => setIsCreateAnalysisModalVisible(false)}
              size="large"
              className="px-8"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              className="bg-green-500 border-green-500 hover:bg-green-600 px-8"
              icon={<PlusOutlined />}
            >
              Start Analysis
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;