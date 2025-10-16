import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, BarChartOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginForm) => {
    try {
      const result = await login(values);
      if (result.type.endsWith('/fulfilled')) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BarChartOutlined className="text-5xl text-blue-600 mb-4" />
          <Title level={2} className="text-gray-900 mb-2">
            Regulatory Intelligence Platform
          </Title>
          <Text className="text-gray-600">
            AI-powered regulatory change monitoring and analysis
          </Text>
        </div>

        <Card className="shadow-lg">
          <Title level={3} className="text-center mb-6">
            Sign In
          </Title>

          {error && (
            <Alert
              message="Login Failed"
              description={error}
              type="error"
              className="mb-4"
              showIcon
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={loading}
                size="large"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="text-center">
            <Text className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800">
                Sign up here
              </Link>
            </Text>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Text className="text-sm text-gray-500">
            Demo credentials: admin / password
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
