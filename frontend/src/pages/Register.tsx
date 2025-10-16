import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BarChartOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RegisterForm } from '../types';
import { validateEmail, validatePassword } from '../utils';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterForm) => {
    try {
      const result = await register(values);
      if (result.type.endsWith('/fulfilled')) {
        navigate('/login');
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
            Create Account
          </Title>

          {error && (
            <Alert
              message="Registration Failed"
              description={error}
              type="error"
              className="mb-4"
              showIcon
            />
          )}

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { validator: (_, value) => validateEmail(value) ? Promise.resolve() : Promise.reject('Please enter a valid email!') },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                type="email"
              />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please input your username!' },
                { min: 3, message: 'Username must be at least 3 characters!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your username"
              />
            </Form.Item>

            <Form.Item
              name="full_name"
              label="Full Name"
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your full name"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { validator: (_, value) => {
                  const validation = validatePassword(value);
                  return validation.isValid ? Promise.resolve() : Promise.reject(validation.errors[0]);
                }},
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Passwords do not match!');
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm your password"
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
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="text-center">
            <Text className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Sign in here
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
