import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import Header from './Header';
import Sidebar from './Sidebar';

const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AntLayout className="min-h-screen">
      <Sidebar collapsed={collapsed} />
      <AntLayout>
        <Content className="bg-gray-50">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
