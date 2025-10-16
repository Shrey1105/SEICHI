import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoxFileUpload, BoxFolderManager } from '../components/Box';
import { Card, Tabs, Alert, Button, Space } from 'antd';
import { FolderOpen, Upload, Settings, Info } from 'lucide-react';

const BoxDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [boxStatus, setBoxStatus] = useState<{ available: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();

  useEffect(() => {
    checkBoxStatus();
  }, []);

  const checkBoxStatus = async () => {
    try {
      const response = await fetch('/api/box/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBoxStatus(data);
      }
    } catch (error) {
      console.error('Error checking Box status:', error);
      setBoxStatus({ available: false, message: 'Failed to check Box status' });
    } finally {
      setLoading(false);
    }
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  const handleUploadSuccess = (file: any) => {
    console.log('File uploaded successfully:', file);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking Box integration status...</p>
        </div>
      </div>
    );
  }

  if (!boxStatus?.available) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-sm">
            <div className="text-center py-12">
              <Info className="mx-auto h-16 w-16 text-yellow-500 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Box Integration Not Available
              </h2>
              <p className="text-gray-600 mb-6">
                {boxStatus?.message || 'Box API is not configured or not available.'}
              </p>
              <Alert
                message="Box API Configuration Required"
                description={
                  <div className="text-left">
                    <p className="mb-2">To use Box document management, you need to configure the following environment variables:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><code>BOX_CLIENT_ID</code> - Your Box application client ID</li>
                      <li><code>BOX_CLIENT_SECRET</code> - Your Box application client secret</li>
                      <li><code>BOX_ACCESS_TOKEN</code> - Your Box access token</li>
                      <li><code>BOX_REFRESH_TOKEN</code> - Your Box refresh token</li>
                      <li><code>BOX_ENTERPRISE_ID</code> - Your Box enterprise ID (optional)</li>
                    </ul>
                    <p className="mt-3 text-sm">
                      Please contact your administrator to configure Box API integration.
                    </p>
                  </div>
                }
                type="warning"
                showIcon
                className="text-left"
              />
              <div className="mt-6">
                <Button onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Box Document Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your regulatory documents with Box cloud storage
              </p>
            </div>
            <Space>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </Space>
          </div>
        </div>

        <Alert
          message="Box Integration Active"
          description="Your Box API integration is working properly. You can now upload, manage, and share regulatory documents."
          type="success"
          showIcon
          className="mb-6"
        />

        <Tabs
          defaultActiveKey="folders"
          items={[
            {
              key: 'folders',
              label: (
                <span>
                  <FolderOpen className="inline h-4 w-4 mr-2" />
                  Folder Manager
                </span>
              ),
              children: (
                <BoxFolderManager
                  onFolderSelect={handleFolderSelect}
                />
              )
            },
            {
              key: 'upload',
              label: (
                <span>
                  <Upload className="inline h-4 w-4 mr-2" />
                  Upload Documents
                </span>
              ),
              children: (
                <BoxFileUpload
                  folderId={selectedFolder}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default BoxDocuments;
