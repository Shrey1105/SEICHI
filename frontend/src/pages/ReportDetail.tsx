import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Space, Row, Col, List, Alert, Spin, Divider } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchReport, fetchRegulatoryChanges } from '../store/slices/reportsSlice';
import { formatDate, getRiskLevelBadgeColor, getConfidenceScoreColor, formatConfidenceScore } from '../utils';
import { RegulatoryChange } from '../types';

const { Title, Text, Paragraph } = Typography;

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentReport, regulatoryChanges, loading } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    if (id) {
      dispatch(fetchReport(parseInt(id)));
      dispatch(fetchRegulatoryChanges(parseInt(id)));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentReport) {
    return (
      <Alert
        message="Report not found"
        description="The requested report could not be found."
        type="error"
        showIcon
      />
    );
  }

  const handleExportReport = () => {
    // TODO: Implement report export functionality
    console.log('Export report:', currentReport.id);
  };

  const handleShareReport = () => {
    // TODO: Implement report sharing functionality
    console.log('Share report:', currentReport.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/reports')}
          >
            Back to Reports
          </Button>
          <div>
            <Title level={2} className="text-gray-900 mb-2">
              {currentReport.title}
            </Title>
            <Space>
              <Tag color={getRiskLevelBadgeColor(currentReport.status)}>
                {currentReport.status.toUpperCase()}
              </Tag>
              <Text className="text-gray-600">
                Created {formatDate(currentReport.created_at)}
              </Text>
            </Space>
          </div>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportReport}>
            Export
          </Button>
          <Button icon={<ShareAltOutlined />} onClick={handleShareReport}>
            Share
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Report Overview" className="mb-6">
            <div className="space-y-4">
              <div>
                <Text strong className="block mb-2">Analysis Type</Text>
                <Text>{currentReport.analysis_type}</Text>
              </div>
              
              {currentReport.scope && (
                <div>
                  <Text strong className="block mb-2">Scope</Text>
                  <Paragraph>{currentReport.scope}</Paragraph>
                </div>
              )}
              
              <div>
                <Text strong className="block mb-2">Status</Text>
                <Tag color={getRiskLevelBadgeColor(currentReport.status)}>
                  {currentReport.status.toUpperCase()}
                </Tag>
              </div>
              
              <div>
                <Text strong className="block mb-2">Created</Text>
                <Text>{formatDate(currentReport.created_at)}</Text>
              </div>
              
              {currentReport.completed_at && (
                <div>
                  <Text strong className="block mb-2">Completed</Text>
                  <Text>{formatDate(currentReport.completed_at)}</Text>
                </div>
              )}
            </div>
          </Card>

          <Card title="Regulatory Changes" className="mb-6">
            {regulatoryChanges.length === 0 ? (
              <Alert
                message="No regulatory changes found"
                description="This report did not identify any regulatory changes."
                type="info"
                showIcon
              />
            ) : (
              <List
                dataSource={regulatoryChanges}
                renderItem={(change: RegulatoryChange) => (
                  <List.Item className="!block">
                    <Card size="small" className="mb-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <Title level={5} className="mb-2">
                            {change.title}
                          </Title>
                          <Space>
                            <Tag color={getRiskLevelBadgeColor(change.risk_level || 'medium')}>
                              {change.risk_level?.toUpperCase() || 'MEDIUM'}
                            </Tag>
                            <Tag color={getConfidenceScoreColor(change.confidence_score || 0.5)}>
                              {formatConfidenceScore(change.confidence_score || 0.5)}
                            </Tag>
                          </Space>
                        </div>
                        
                        {change.summary && (
                          <div>
                            <Text strong className="block mb-1">Summary</Text>
                            <Paragraph className="text-gray-700">
                              {change.summary}
                            </Paragraph>
                          </div>
                        )}
                        
                        {change.impact_assessment && (
                          <div>
                            <Text strong className="block mb-1">Impact Assessment</Text>
                            <Paragraph className="text-gray-700">
                              {change.impact_assessment}
                            </Paragraph>
                          </div>
                        )}
                        
                        {change.compliance_requirements && (
                          <div>
                            <Text strong className="block mb-1">Compliance Requirements</Text>
                            <Paragraph className="text-gray-700">
                              {change.compliance_requirements}
                            </Paragraph>
                          </div>
                        )}
                        
                        {change.implementation_timeline && (
                          <div>
                            <Text strong className="block mb-1">Implementation Timeline</Text>
                            <Text className="text-gray-700">{change.implementation_timeline}</Text>
                          </div>
                        )}
                        
                        {change.affected_areas && change.affected_areas.length > 0 && (
                          <div>
                            <Text strong className="block mb-1">Affected Areas</Text>
                            <Space wrap>
                              {change.affected_areas.map((area, index) => (
                                <Tag key={index}>{area}</Tag>
                              ))}
                            </Space>
                          </div>
                        )}
                        
                        {change.action_items && change.action_items.length > 0 && (
                          <div>
                            <Text strong className="block mb-1">Action Items</Text>
                            <List
                              size="small"
                              dataSource={change.action_items}
                              renderItem={(item) => (
                                <List.Item>
                                  <Text className="text-gray-700">• {item}</Text>
                                </List.Item>
                              )}
                            />
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-gray-200">
                          <Text className="text-sm text-gray-500">
                            Source: <a href={change.source_url} target="_blank" rel="noopener noreferrer">
                              {change.source_url}
                            </a>
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Report Statistics" className="mb-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {regulatoryChanges.length}
                </div>
                <div className="text-sm text-blue-800">Total Changes</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {regulatoryChanges.filter(c => c.risk_level === 'critical').length}
                </div>
                <div className="text-sm text-red-800">Critical Risk</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {regulatoryChanges.filter(c => c.risk_level === 'high').length}
                </div>
                <div className="text-sm text-orange-800">High Risk</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {regulatoryChanges.filter(c => c.risk_level === 'low').length}
                </div>
                <div className="text-sm text-green-800">Low Risk</div>
              </div>
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button block onClick={handleExportReport}>
                Export Report
              </Button>
              <Button block onClick={handleShareReport}>
                Share Report
              </Button>
              <Button block type="dashed">
                Schedule Follow-up
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportDetail;
