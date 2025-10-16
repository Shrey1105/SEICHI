import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/schedules',
      icon: <ClockCircleOutlined />,
      label: 'Schedules',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="bg-gray-900 shadow-lg"
      width={250}
      collapsedWidth={80}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700">
          {!collapsed ? (
            <div className="text-center">
              <div className="text-white text-lg font-bold mb-1">S</div>
              <div className="text-white text-sm">Seichi by Supervity</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-white text-lg font-bold">S</div>
            </div>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none bg-transparent mt-4"
          style={{ flex: 1 }}
          theme="dark"
        />
      </div>
    </Sider>
  );
};

export default Sidebar;