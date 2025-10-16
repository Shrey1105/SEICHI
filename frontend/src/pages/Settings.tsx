import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Tabs, Switch, Select, Divider, Space, Alert } from 'antd';
import { UserOutlined, BellOutlined, SafetyOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateUser } from '../store/slices/authSlice';
import { fetchCompanyProfiles, createCompanyProfile, updateCompanyProfile, deleteCompanyProfile } from '../store/slices/companyProfilesSlice';
import { CompanyProfileCreate, CompanyProfileUpdate } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: userLoading } = useSelector((state: RootState) => state.auth);
  const { profiles, loading: profilesLoading } = useSelector((state: RootState) => state.companyProfiles);
  
  const [profileForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [editingProfile, setEditingProfile] = useState<number | null>(null);

  const handleUpdateUser = async (values: any) => {
    try {
      const result = await dispatch(updateUser(values));
      if (result.type.endsWith('/fulfilled')) {
        console.log('User updated successfully');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleCreateProfile = async (values: CompanyProfileCreate) => {
    try {
      const result = await dispatch(createCompanyProfile(values));
      if (result.type.endsWith('/fulfilled')) {
        profileForm.resetFields();
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleUpdateProfile = async (profileId: number, values: CompanyProfileUpdate) => {
    try {
      const result = await dispatch(updateCompanyProfile({ profileId, profileData: values }));
      if (result.type.endsWith('/fulfilled')) {
        setEditingProfile(null);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (window.confirm('Are you sure you want to delete this company profile?')) {
      try {
        await dispatch(deleteCompanyProfile(profileId));
      } catch (error) {
        console.error('Failed to delete profile:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="text-gray-900 mb-2">
          Settings
        </Title>
        <Text className="text-gray-600">
          Manage your account settings and company profiles
        </Text>
      </div>

      <Tabs defaultActiveKey="profile" size="large">
        <TabPane tab={<span><UserOutlined />Profile</span>} key="profile">
          <Card title="User Profile">
            <Form
              form={userForm}
              layout="vertical"
              initialValues={user || {}}
              onFinish={handleUpdateUser}
              disabled={userLoading}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please input your username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="full_name"
                label="Full Name"
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={userLoading}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><DatabaseOutlined />Company Profiles</span>} key="profiles">
          <div className="space-y-6">
            <Card title="Add New Company Profile">
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleCreateProfile}
                disabled={profilesLoading}
              >
                <Form.Item
                  name="company_name"
                  label="Company Name"
                  rules={[{ required: true, message: 'Please input company name!' }]}
                >
                  <Input placeholder="Enter company name" />
                </Form.Item>

                <Form.Item
                  name="industry"
                  label="Industry"
                >
                  <Select placeholder="Select industry">
                    <Option value="technology">Technology</Option>
                    <Option value="finance">Finance</Option>
                    <Option value="healthcare">Healthcare</Option>
                    <Option value="manufacturing">Manufacturing</Option>
                    <Option value="retail">Retail</Option>
                    <Option value="energy">Energy</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="jurisdiction"
                  label="Jurisdiction"
                >
                  <Select placeholder="Select jurisdiction">
                    <Option value="US">United States</Option>
                    <Option value="EU">European Union</Option>
                    <Option value="UK">United Kingdom</Option>
                    <Option value="CA">Canada</Option>
                    <Option value="AU">Australia</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="company_size"
                  label="Company Size"
                >
                  <Select placeholder="Select company size">
                    <Option value="small">Small (1-50 employees)</Option>
                    <Option value="medium">Medium (51-500 employees)</Option>
                    <Option value="large">Large (500+ employees)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea rows={3} placeholder="Describe your company and its regulatory environment" />
                </Form.Item>

                <Form.Item
                  name="keywords"
                  label="Keywords"
                >
                  <Select
                    mode="tags"
                    placeholder="Add relevant keywords for regulatory monitoring"
                  />
                </Form.Item>

                <Form.Item
                  name="trusted_sources"
                  label="Trusted Sources"
                >
                  <Select
                    mode="tags"
                    placeholder="Add trusted regulatory sources (URLs)"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={profilesLoading}>
                    Create Profile
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Card title="Existing Company Profiles">
              {profiles.length === 0 ? (
                <Alert
                  message="No company profiles"
                  description="Create your first company profile to start monitoring regulatory changes."
                  type="info"
                  showIcon
                />
              ) : (
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <Card key={profile.id} size="small" className="border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Title level={5} className="mb-2">
                            {profile.company_name}
                          </Title>
                          <div className="space-y-1">
                            <Text className="block text-sm text-gray-600">
                              Industry: {profile.industry || 'Not specified'}
                            </Text>
                            <Text className="block text-sm text-gray-600">
                              Jurisdiction: {profile.jurisdiction || 'Not specified'}
                            </Text>
                            <Text className="block text-sm text-gray-600">
                              Size: {profile.company_size || 'Not specified'}
                            </Text>
                            {profile.description && (
                              <Text className="block text-sm text-gray-600">
                                {profile.description}
                              </Text>
                            )}
                          </div>
                        </div>
                        <Space>
                          <Button
                            size="small"
                            onClick={() => setEditingProfile(editingProfile === profile.id ? null : profile.id)}
                          >
                            {editingProfile === profile.id ? 'Cancel' : 'Edit'}
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={() => handleDeleteProfile(profile.id)}
                          >
                            Delete
                          </Button>
                        </Space>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabPane>

        <TabPane tab={<span><BellOutlined />Notifications</span>} key="notifications">
          <Card title="Notification Preferences">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Text strong>Email Notifications</Text>
                  <br />
                  <Text className="text-gray-600">Receive email notifications for new regulatory changes</Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <div>
                  <Text strong>Analysis Complete</Text>
                  <br />
                  <Text className="text-gray-600">Get notified when analysis is completed</Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <div>
                  <Text strong>High Risk Alerts</Text>
                  <br />
                  <Text className="text-gray-600">Immediate notifications for high-risk regulatory changes</Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <div>
                  <Text strong>Weekly Summary</Text>
                  <br />
                  <Text className="text-gray-600">Weekly summary of all regulatory activities</Text>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyOutlined />Security</span>} key="security">
          <Card title="Security Settings">
            <div className="space-y-4">
              <div>
                <Text strong className="block mb-2">Change Password</Text>
                <Button type="primary" ghost>
                  Change Password
                </Button>
              </div>
              
              <Divider />
              
              <div>
                <Text strong className="block mb-2">Two-Factor Authentication</Text>
                <Text className="block text-gray-600 mb-2">
                  Add an extra layer of security to your account
                </Text>
                <Button type="primary" ghost>
                  Enable 2FA
                </Button>
              </div>
              
              <Divider />
              
              <div>
                <Text strong className="block mb-2">API Keys</Text>
                <Text className="block text-gray-600 mb-2">
                  Manage your API keys for programmatic access
                </Text>
                <Button type="primary" ghost>
                  Manage API Keys
                </Button>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
