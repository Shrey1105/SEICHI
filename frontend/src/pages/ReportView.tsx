import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Row, Col, Table, Space, Input, Avatar, Divider, Tag, Tabs } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface RegulatoryChange {
  id: number;
  newRegulation: string;
  oldRegulation: string;
  source: string;
  impact: string;
  affectedProducts: string[];
}

interface ChatMessage {
  id: number;
  type: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

const ReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'assistant',
      message: 'Hello! I\'m your Regulatory Analysis Assistant. I can help you understand the findings in this report, answer questions about compliance, or provide recommendations. What would you like to know?',
      timestamp: new Date().toISOString()
    }
  ]);

  // Mock data for the report
  const reportData = {
    title: "Electric Regulations Analysis",
    date: "2024-01-15",
    status: "Completed",
    languages: ["English", "Spanish"],
    summary: "This analysis covers recent changes in electrical safety regulations affecting consumer electronics and industrial equipment.",
    affectedProducts: ["Smart Home Devices", "Industrial Controllers", "Power Supplies"],
    regulatoryChanges: [
      {
        id: 1,
        newRegulation: "IEC 62368-1:2023 - Audio/video, information and communication technology equipment",
        oldRegulation: "IEC 62368-1:2018",
        source: "International Electrotechnical Commission",
        impact: "Enhanced safety requirements for power supplies and thermal management",
        affectedProducts: ["Smart Home Devices", "Power Supplies"]
      },
      {
        id: 2,
        newRegulation: "EU Directive 2024/1234 - Digital Product Passport",
        oldRegulation: "Previous CE marking requirements",
        source: "European Commission",
        impact: "Mandatory digital product passports for all electronic products",
        affectedProducts: ["Smart Home Devices", "Industrial Controllers"]
      },
      {
        id: 3,
        newRegulation: "FCC Part 15.247 - Unlicensed Radio Frequency Devices",
        oldRegulation: "FCC Part 15.247 (2022)",
        source: "Federal Communications Commission",
        impact: "Updated testing procedures for wireless communication devices",
        affectedProducts: ["Smart Home Devices"]
      }
    ]
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: chatMessages.length + 2,
        type: 'assistant',
        message: "Based on the regulatory changes in this report, I can see that the new IEC 62368-1:2023 standard will require updates to your power supply designs. Would you like me to provide specific compliance recommendations for your affected products?",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleDownloadPDF = () => {
    // Mock PDF download
    console.log('Downloading PDF report...');
  };

  const regulatoryChangesColumns = [
    {
      title: 'New Regulation',
      dataIndex: 'newRegulation',
      key: 'newRegulation',
      width: '25%',
    },
    {
      title: 'Old Regulation',
      dataIndex: 'oldRegulation',
      key: 'oldRegulation',
      width: '20%',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: '20%',
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      width: '25%',
    },
    {
      title: 'Affected Product(s)',
      dataIndex: 'affectedProducts',
      key: 'affectedProducts',
      width: '10%',
      render: (products: string[]) => (
        <div>
          {products.map((product, index) => (
            <Tag key={index} color="blue" className="mb-1">
              {product}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
            className="flex items-center"
          >
            Back to Dashboard
          </Button>
          <div>
            <Title level={2} className="mb-2">{reportData.title}</Title>
            <Text type="secondary">Report ID: {id} • {reportData.date} • {reportData.status}</Text>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleDownloadPDF}
          className="bg-blue-500 border-blue-500 hover:bg-blue-600"
        >
          Download PDF
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Report Content */}
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="english" className="bg-white rounded-lg shadow-sm">
            <TabPane tab="English" key="english">
              <div className="p-6">
                <Card title="Regulatory Framework Analysis" className="mb-6">
                  <Paragraph>
                    {reportData.summary}
                  </Paragraph>
                  
                  <div className="mt-4">
                    <Title level={4}>Product Identification</Title>
                    <div className="flex flex-wrap gap-2">
                      {reportData.affectedProducts.map((product, index) => (
                        <Tag key={index} color="green" className="text-sm">
                          {product}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card title="Regulatory Changes Comparison">
                  <Table
                    dataSource={reportData.regulatoryChanges}
                    columns={regulatoryChangesColumns}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1200 }}
                  />
                </Card>
              </div>
            </TabPane>
            
            <TabPane tab="Spanish (Español)" key="spanish">
              <div className="p-6">
                <Card title="Análisis del Marco Regulatorio" className="mb-6">
                  <Paragraph>
                    Este análisis cubre los cambios recientes en las regulaciones de seguridad eléctrica que afectan a la electrónica de consumo y equipos industriales.
                  </Paragraph>
                  
                  <div className="mt-4">
                    <Title level={4}>Identificación de Productos</Title>
                    <div className="flex flex-wrap gap-2">
                      {reportData.affectedProducts.map((product, index) => (
                        <Tag key={index} color="green" className="text-sm">
                          {product}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card title="Comparación de Cambios Regulatorios">
                  <Table
                    dataSource={reportData.regulatoryChanges}
                    columns={regulatoryChangesColumns}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1200 }}
                  />
                </Card>
              </div>
            </TabPane>
          </Tabs>
        </Col>

        {/* AI Assistant Chat */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <RobotOutlined className="text-blue-500" />
                <span>Report Assistant</span>
              </div>
            }
            className="h-full"
          >
            <div className="flex flex-col h-96">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <Avatar 
                        size="small" 
                        icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                        className={message.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'}
                      />
                      <div className={`px-3 py-2 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <Text className={message.type === 'user' ? 'text-white' : 'text-gray-800'}>
                          {message.message}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="border-t pt-4">
                <div className="flex space-x-2">
                  <TextArea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about the report findings, recommendations, or compliance status..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="bg-blue-500 border-blue-500 hover:bg-blue-600"
                  />
                </div>
                <Text type="secondary" className="text-xs mt-2 block">
                  Press Enter to send, Shift+Enter for new line
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportView;
