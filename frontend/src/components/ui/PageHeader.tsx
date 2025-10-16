import React from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  extra 
}) => {
  const breadcrumbItems = [
    {
      title: <HomeOutlined />,
      href: '/dashboard',
    },
    ...breadcrumbs.map(breadcrumb => ({
      title: breadcrumb.title,
      href: breadcrumb.href,
    })),
  ];

  return (
    <div className="mb-6">
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <Title level={2} className="text-gray-900 mb-2">
            {title}
          </Title>
          {subtitle && (
            <Text className="text-gray-600">
              {subtitle}
            </Text>
          )}
        </div>
        
        {extra && (
          <div>
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
