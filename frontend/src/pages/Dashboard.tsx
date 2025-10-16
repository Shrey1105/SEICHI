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

  // Mock data for recent reports matching the screenshot
  const recentReports = [
    { id: 1, name: "Frontend Table Fix T", status: "Completed", date: "2024-01-15" },
    { id: 2, name: "new", status: "Running", date: "2024-01-14" },
    { id: 3, name: "electric regulations r", status: "Running", date: "2024-01-13" },
    { id: 4, name: "Automotive Safety S", status: "Completed", date: "2024-01-12" },
    { id: 5, name: "Environmental Regul", status: "Running", date: "2024-01-11" },
  ];

  const handleCreateAnalysis = () => {
    setIsCreateAnalysisModalVisible(true);
  };

  const handleCreateAnalysisSubmit = async (values: any) => {
    try {
      console.log('Creating Analysis:', values);
      
      // Prepare the request data
      const analysisData = {
        title: values.title || 'New Analysis',
        categories: values.categories || 'General',
        target_product_path: values.targetProductPath || '',
        start_date: values.startDate ? values.startDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        end_date: values.endDate ? values.endDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        notification_emails: values.notificationEmails || [],
        trusted_websites: values.trustedWebsites || [],
        languages: values.languages || ['English'],
        target_country: values.targetCountry || 'United States',
        guardrails: values.guardrails || ''
      };

      // Call the backend API
      const response = await fetch('http://localhost:8000/api/analysis/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(analysisData)
      });

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
        alert(`Failed to create analysis: ${error.detail || 'Unknown error'}`);
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
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'Completed' ? 'bg-green-100 text-green-800' :
          status === 'Running' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={1} className="mb-2 text-4xl font-bold text-gray-900">Regulatory</Title>
          <Text type="secondary" className="text-lg text-gray-600">Monitor regulatory com</Text>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateAnalysis}
            className="bg-green-500 border-green-500 hover:bg-green-600"
          >
            + Create Analysis
          </Button>
          <div className="relative">
            <BellOutlined className="text-2xl text-gray-600" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </div>
          <div className="flex items-center space-x-2">
            <UserOutlined className="text-xl text-gray-600" />
            <Text className="text-lg font-medium text-gray-800">{user?.full_name || "Demo User"}</Text>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChartOutlined className="text-3xl text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">3</div>
            <div className="text-gray-600">Active Analyses</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <PlusOutlined className="text-3xl text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">12</div>
            <div className="text-gray-600">New Regulations</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ClockCircleOutlined className="text-3xl text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">2</div>
            <div className="text-gray-600">Processing Reports</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <EyeOutlined className="text-3xl text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">47</div>
            <div className="text-gray-600">Total Reports</div>
          </Card>
        </Col>
      </Row>

      {/* Recent Reports */}
      <Card title="Recent Reports" className="mb-6">
        <Table 
          dataSource={recentReports} 
          columns={recentReportsColumns}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Create Analysis Modal */}
      <Modal
        title="Create New Analysis"
        open={isCreateAnalysisModalVisible}
        onCancel={() => setIsCreateAnalysisModalVisible(false)}
        footer={null}
        width={800}
        className="create-analysis-modal"
      >
        <Form
          form={createAnalysisForm}
          layout="vertical"
          onFinish={handleCreateAnalysisSubmit}
          initialValues={{
            title: "Electric Regulations",
            categories: "electron",
            startDate: dayjs("2025-09-01"),
            endDate: dayjs("2025-09-24"),
            targetCountry: "India",
            languages: ["English", "Spanish"],
            guardrails: "give me the analysis in table for"
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
            label="Target Product Folder Path *"
            rules={[{ required: true, message: 'Please enter target product path' }]}
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
          >
            <div>
              <div className="mb-2">
                <Tag closable>vrushali@supervity.ai</Tag>
              </div>
              <Input placeholder="Add another email..." />
              <Text type="secondary" className="text-xs">
                SMS notifications will be sent to: vrushali@supervity.ai Press Enter after typing each email address to add it. These emails will receive SMS notifications when the analysis completes.
              </Text>
            </div>
          </Form.Item>

          <Form.Item
            name="trustedWebsites"
            label="Trusted Websites"
          >
            <div>
              <Input placeholder="Enter website URL and press Enter (e.g., iec.ch)" />
              <Text type="secondary" className="text-xs">
                Press Enter after typing each website URL to add it. These websites will be prioritized during research.
              </Text>
            </div>
          </Form.Item>

          <Form.Item
            name="languages"
            label="Analysis Languages"
          >
            <div>
              <div className="mb-2">
                <Tag closable>English</Tag>
                <Tag closable>Spanish (Español)</Tag>
              </div>
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
              <Text type="secondary" className="text-xs">
                Select one or more languages for the analysis
              </Text>
            </div>
          </Form.Item>

          <Form.Item
            name="targetCountry"
            label="Target Country"
          >
            <div>
              <Select defaultValue="India" className="w-full">
                <Option value="India">India</Option>
                <Option value="United States">United States</Option>
                <Option value="United Kingdom">United Kingdom</Option>
                <Option value="Germany">Germany</Option>
                <Option value="France">France</Option>
              </Select>
              <Text type="secondary" className="text-xs">
                The analysis will focus on regulatory changes in this country and global changes that affect it
              </Text>
            </div>
          </Form.Item>

          <Form.Item
            name="guardrails"
            label="Guardrails (Most Important Instructions)"
          >
            <div>
              <TextArea rows={4} placeholder="Enter your most important instructions..." />
              <Text type="secondary" className="text-xs">
                These instructions will be prioritized above all other requirement: the analysis
              </Text>
            </div>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsCreateAnalysisModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-green-500 border-green-500 hover:bg-green-600">
              Start Analysis
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;