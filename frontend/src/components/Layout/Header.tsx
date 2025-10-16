import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="bg-white shadow-sm border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="text-gray-600 hover:text-gray-900"
        />
        <div className="ml-4">
          <Text strong className="text-lg text-gray-900">
            Regulatory Intelligence Platform
          </Text>
        </div>
      </div>

      <div className="flex items-center">
        <Space>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar 
                icon={<UserOutlined />} 
                className="bg-blue-500"
              />
              <div className="ml-2 hidden sm:block">
                <Text strong className="text-sm text-gray-900">
                  {user?.full_name || user?.username}
                </Text>
                <br />
                <Text className="text-xs text-gray-500">
                  {user?.email}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;
