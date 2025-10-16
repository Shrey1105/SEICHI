import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Input, Button, Typography, Alert, Progress, Steps, Space, Divider, Row, Col } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { startAnalysis, setCurrentAnalysis, clearCurrentAnalysis } from '../store/slices/analysisSlice';
import { fetchCompanyProfiles } from '../store/slices/companyProfilesSlice';
import { useSocket } from '../hooks/useSocket';
import { AnalysisRequest } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Analysis: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, loading: profilesLoading } = useSelector((state: RootState) => state.companyProfiles);
  const { currentAnalysis, loading: analysisLoading } = useSelector((state: RootState) => state.analysis);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Socket connection for real-time updates
  const { connected } = useSocket({
    enabled: true,
    onConnect: () => console.log('Connected to analysis updates'),
    onDisconnect: () => console.log('Disconnected from analysis updates'),
  });

  useEffect(() => {
    dispatch(fetchCompanyProfiles({}));
  }, [dispatch]);

  const handleStartAnalysis = async (values: AnalysisRequest) => {
    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      const result = await dispatch(startAnalysis(values)).unwrap();
      
      // Set current analysis for real-time tracking
      dispatch(setCurrentAnalysis({
        report_id: result.id,
        status: result.status,
        progress_percentage: 0,
        current_stage: 'initializing',
        message: 'Analysis started successfully'
      }));
      
    } catch (error) {
      console.error('Failed to start analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStopAnalysis = () => {
    dispatch(clearCurrentAnalysis());
    setIsAnalyzing(false);
  };

  const getStepStatus = (step: number) => {
    if (!currentAnalysis) return 'wait';
    
    const progress = currentAnalysis.progress_percentage;
    if (progress >= step * 25) return 'finish';
    if (progress >= (step - 1) * 25) return 'process';
    return 'wait';
  };

  const getCurrentStep = () => {
    if (!currentAnalysis) return 0;
    return Math.floor(currentAnalysis.progress_percentage / 25);
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="text-gray-900 mb-2">
          Regulatory Analysis
        </Title>
        <Text className="text-gray-600">
          Start a new regulatory analysis to monitor changes and assess compliance requirements
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Start New Analysis" className="h-fit">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStartAnalysis}
              disabled={isAnalyzing || analysisLoading}
            >
              <Form.Item
                name="company_profile_id"
                label="Company Profile"
                rules={[{ required: true, message: 'Please select a company profile!' }]}
              >
                <Select
                  placeholder="Select a company profile"
                  loading={profilesLoading}
                  size="large"
                >
                  {profiles.map((profile) => (
                    <Option key={profile.id} value={profile.id}>
                      {profile.company_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="analysis_type"
                label="Analysis Type"
                rules={[{ required: true, message: 'Please select analysis type!' }]}
                initialValue="comprehensive"
              >
                <Select size="large">
                  <Option value="comprehensive">Comprehensive Analysis</Option>
                  <Option value="targeted">Targeted Analysis</Option>
                  <Option value="monitoring">Monitoring Analysis</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="scope"
                label="Analysis Scope"
                rules={[{ required: true, message: 'Please describe the analysis scope!' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe what specific areas or regulations you want to analyze..."
                />
              </Form.Item>

              <Form.Item
                name="keywords"
                label="Keywords (Optional)"
              >
                <Select
                  mode="tags"
                  placeholder="Add keywords to focus the analysis"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlayCircleOutlined />}
                    loading={isAnalyzing || analysisLoading}
                    size="large"
                  >
                    Start Analysis
                  </Button>
                  {isAnalyzing && (
                    <Button onClick={handleStopAnalysis} size="large">
                      Stop Analysis
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Analysis Progress" className="h-fit">
            {!currentAnalysis ? (
              <div className="text-center py-8">
                <ClockCircleOutlined className="text-4xl text-gray-400 mb-4" />
                <Text className="text-gray-600">
                  No analysis in progress. Start a new analysis to see progress here.
                </Text>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Progress</Text>
                    <Text>{currentAnalysis.progress_percentage}%</Text>
                  </div>
                  <Progress
                    percent={currentAnalysis.progress_percentage}
                    status={currentAnalysis.status === 'failed' ? 'exception' : 'active'}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>

                <div>
                  <Text strong className="block mb-2">Current Stage</Text>
                  <Text className="text-gray-600">{currentAnalysis.current_stage}</Text>
                </div>

                <div>
                  <Text strong className="block mb-2">Status</Text>
                  <Text className="text-gray-600">{currentAnalysis.message}</Text>
                </div>

                <Divider />

                <div>
                  <Text strong className="block mb-4">Analysis Steps</Text>
                  <Steps
                    direction="vertical"
                    size="small"
                    current={getCurrentStep()}
                    items={[
                      {
                        title: 'Query Generation',
                        description: 'Generating targeted search queries',
                        status: getStepStatus(1),
                        icon: <CheckCircleOutlined />,
                      },
                      {
                        title: 'Data Acquisition',
                        description: 'Acquiring regulatory data from sources',
                        status: getStepStatus(2),
                        icon: <CheckCircleOutlined />,
                      },
                      {
                        title: 'Content Filtering',
                        description: 'Filtering and ranking relevant content',
                        status: getStepStatus(3),
                        icon: <CheckCircleOutlined />,
                      },
                      {
                        title: 'AI Analysis',
                        description: 'Analyzing changes and generating insights',
                        status: getStepStatus(4),
                        icon: <CheckCircleOutlined />,
                      },
                    ]}
                  />
                </div>

                {!connected && (
                  <Alert
                    message="Real-time updates unavailable"
                    description="Connection to real-time updates is not available. Progress will be updated when you refresh."
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {analysisResult && (
        <Card title="Analysis Results" className="mt-6">
          <Alert
            message="Analysis Completed"
            description="Your regulatory analysis has been completed successfully. View the detailed results in the Reports section."
            type="success"
            showIcon
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analysisResult.regulatory_changes?.length || 0}
              </div>
              <div className="text-sm text-blue-800">Regulatory Changes Found</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analysisResult.high_risk_count || 0}
              </div>
              <div className="text-sm text-green-800">High Risk Items</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {analysisResult.action_items?.length || 0}
              </div>
              <div className="text-sm text-yellow-800">Action Items</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analysis;
