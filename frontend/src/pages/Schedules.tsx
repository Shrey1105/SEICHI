import React, { useState } from 'react';
import { Card, Typography, Button, Table, Space, Modal, Form, Input, Select, Switch, Tag, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Schedule {
  id: number;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  analysisType: string;
  companyProfile: string;
  isActive: boolean;
  lastRun: string;
  nextRun: string;
  created: string;
}

const Schedules: React.FC = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Mock data for schedules
  const schedules: Schedule[] = [
    {
      id: 1,
      name: "Daily Electronics Monitoring",
      frequency: "daily",
      analysisType: "Comprehensive",
      companyProfile: "TechCorp Solutions",
      isActive: true,
      lastRun: "2024-01-15 09:00",
      nextRun: "2024-01-16 09:00",
      created: "2024-01-01"
    },
    {
      id: 2,
      name: "Weekly Environmental Check",
      frequency: "weekly",
      analysisType: "Targeted",
      companyProfile: "GreenEnergy Ltd",
      isActive: true,
      lastRun: "2024-01-14 10:00",
      nextRun: "2024-01-21 10:00",
      created: "2024-01-05"
    },
    {
      id: 3,
      name: "Monthly Labor Law Review",
      frequency: "monthly",
      analysisType: "Comprehensive",
      companyProfile: "TechCorp Solutions",
      isActive: false,
      lastRun: "2023-12-15 11:00",
      nextRun: "2024-02-15 11:00",
      created: "2023-12-01"
    },
    {
      id: 4,
      name: "Quarterly Financial Regulations",
      frequency: "quarterly",
      analysisType: "Monitoring",
      companyProfile: "TechCorp Solutions",
      isActive: true,
      lastRun: "2023-12-31 12:00",
      nextRun: "2024-03-31 12:00",
      created: "2023-10-01"
    }
  ];

  const handleCreateSchedule = () => {
    setIsCreateModalVisible(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    editForm.setFieldsValue(schedule);
    setIsEditModalVisible(true);
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    console.log('Delete schedule:', scheduleId);
  };

  const handleToggleActive = (scheduleId: number) => {
    console.log('Toggle active for schedule:', scheduleId);
  };

  const handleCreateSubmit = (values: any) => {
    console.log('Create schedule:', values);
    setIsCreateModalVisible(false);
    createForm.resetFields();
  };

  const handleEditSubmit = (values: any) => {
    console.log('Edit schedule:', values);
    setIsEditModalVisible(false);
    setEditingSchedule(null);
    editForm.resetFields();
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'green';
      case 'weekly': return 'blue';
      case 'monthly': return 'orange';
      case 'quarterly': return 'purple';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency: string) => (
        <Tag color={getFrequencyColor(frequency)}>
          {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Analysis Type',
      dataIndex: 'analysisType',
      key: 'analysisType',
    },
    {
      title: 'Company Profile',
      dataIndex: 'companyProfile',
      key: 'companyProfile',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRun',
      key: 'nextRun',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Schedule) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggleActive(record.id)}
            className={record.isActive ? 'bg-orange-500 border-orange-500 hover:bg-orange-600' : 'bg-green-500 border-green-500 hover:bg-green-600'}
          >
            {record.isActive ? 'Pause' : 'Start'}
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSchedule(record)}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSchedule(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const activeSchedules = schedules.filter(s => s.isActive).length;
  const totalSchedules = schedules.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-2">Schedules</Title>
          <Text type="secondary">Manage automated regulatory monitoring reports</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateSchedule}
          className="bg-green-500 border-green-500 hover:bg-green-600"
        >
          Create Schedule
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Schedules"
              value={activeSchedules}
              prefix={<PlayCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Schedules"
              value={totalSchedules}
              prefix={<ClockCircleOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Daily Reports"
              value={schedules.filter(s => s.frequency === 'daily' && s.isActive).length}
              prefix={<ClockCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Weekly Reports"
              value={schedules.filter(s => s.frequency === 'weekly' && s.isActive).length}
              prefix={<ClockCircleOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Schedules Table */}
      <Card title="Scheduled Reports">
        <Table
          dataSource={schedules}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Schedule Modal */}
      <Modal
        title="Create New Schedule"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="name"
            label="Schedule Name"
            rules={[{ required: true, message: 'Please enter schedule name' }]}
          >
            <Input placeholder="Enter schedule name" />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="Frequency"
            rules={[{ required: true, message: 'Please select frequency' }]}
          >
            <Select placeholder="Select frequency">
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="analysisType"
            label="Analysis Type"
            rules={[{ required: true, message: 'Please select analysis type' }]}
          >
            <Select placeholder="Select analysis type">
              <Option value="comprehensive">Comprehensive</Option>
              <Option value="targeted">Targeted</Option>
              <Option value="monitoring">Monitoring</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="companyProfile"
            label="Company Profile"
            rules={[{ required: true, message: 'Please select company profile' }]}
          >
            <Select placeholder="Select company profile">
              <Option value="TechCorp Solutions">TechCorp Solutions</Option>
              <Option value="GreenEnergy Ltd">GreenEnergy Ltd</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsCreateModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-green-500 border-green-500 hover:bg-green-600">
              Create Schedule
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Schedule Modal */}
      <Modal
        title="Edit Schedule"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="name"
            label="Schedule Name"
            rules={[{ required: true, message: 'Please enter schedule name' }]}
          >
            <Input placeholder="Enter schedule name" />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="Frequency"
            rules={[{ required: true, message: 'Please select frequency' }]}
          >
            <Select placeholder="Select frequency">
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="analysisType"
            label="Analysis Type"
            rules={[{ required: true, message: 'Please select analysis type' }]}
          >
            <Select placeholder="Select analysis type">
              <Option value="comprehensive">Comprehensive</Option>
              <Option value="targeted">Targeted</Option>
              <Option value="monitoring">Monitoring</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="companyProfile"
            label="Company Profile"
            rules={[{ required: true, message: 'Please select company profile' }]}
          >
            <Select placeholder="Select company profile">
              <Option value="TechCorp Solutions">TechCorp Solutions</Option>
              <Option value="GreenEnergy Ltd">GreenEnergy Ltd</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsEditModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-green-500 border-green-500 hover:bg-green-600">
              Update Schedule
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Schedules;
