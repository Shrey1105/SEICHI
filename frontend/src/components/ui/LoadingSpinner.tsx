import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'default', 
  tip = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;
