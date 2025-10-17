import React, { useState, useCallback, useEffect } from 'react';
import { FolderPlus, FolderOpen, Folder, Plus, Search, Settings } from 'lucide-react';
import { Button, Card, Input, Modal, Form, Select, message, Tree, Space, Popconfirm } from 'antd';
import { DataNode } from 'antd/es/tree';

interface BoxFolderManagerProps {
  companyProfileId?: number;
  onFolderSelect?: (folderId: string) => void;
}

interface BoxFolder {
  id: number;
  box_folder_id: string;
  folder_name: string;
  folder_type: string;
  description: string;
  parent_folder_id?: string;
  company_profile_id?: number;
  is_active: boolean;
  created_at: string;
}

interface BoxDocument {
  id: number;
  box_file_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  document_category: string;
  created_at: string;
}

const BoxFolderManager: React.FC<BoxFolderManagerProps> = ({
  companyProfileId,
  onFolderSelect
}) => {
  const [folders, setFolders] = useState<BoxFolder[]>([]);
  const [documents, setDocuments] = useState<BoxDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [setupModalVisible, setSetupModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [form] = Form.useForm();

  const folderTypes = [
    { value: 'regulatory_documents', label: 'Regulatory Documents' },
    { value: 'compliance_reports', label: 'Compliance Reports' },
    { value: 'policy_documents', label: 'Policy Documents' },
    { value: 'audit_reports', label: 'Audit Reports' },
    { value: 'general', label: 'General' }
  ];

  const loadFolders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/box/folders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      message.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDocuments = useCallback(async (folderId?: string) => {
    try {
      const params = new URLSearchParams();
      if (folderId) params.append('folder_id', folderId);

      const response = await fetch(`/api/box/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }, []);

  const handleCreateFolder = async (values: any) => {
    try {
      const response = await fetch('/api/box/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: values.name,
          folder_type: values.folder_type,
          description: values.description,
          parent_folder_id: selectedFolder
        })
      });

      if (response.ok) {
        const newFolder = await response.json();
        setFolders(prev => [...prev, newFolder]);
        message.success('Folder created successfully!');
        setCreateModalVisible(false);
        form.resetFields();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Failed to create folder: ${errorMessage}`);
    }
  };

  const handleSetupCompanyFolders = async () => {
    if (!companyProfileId) {
      message.error('Company profile ID is required');
      return;
    }

    try {
      const response = await fetch(`/api/box/company/${companyProfileId}/setup-folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        message.success('Company folder structure created successfully!');
        setSetupModalVisible(false);
        loadFolders();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to setup folders');
      }
    } catch (error) {
      console.error('Error setting up company folders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Failed to setup folders: ${errorMessage}`);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments(selectedFolder || undefined);
      return;
    }

    try {
      const response = await fetch(`/api/box/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.results || []);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      message.error('Search failed');
    }
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolder(folderId);
    onFolderSelect?.(folderId);
    loadDocuments(folderId);
  };

  const buildTreeData = (folders: BoxFolder[]): DataNode[] => {
    const folderMap = new Map<string, BoxFolder>();
    const rootFolders: BoxFolder[] = [];

    // Create a map of folders by ID
    folders.forEach(folder => {
      folderMap.set(folder.box_folder_id, folder);
    });

    // Find root folders (no parent or parent not in our list)
    folders.forEach(folder => {
      if (!folder.parent_folder_id || !folderMap.has(folder.parent_folder_id)) {
        rootFolders.push(folder);
      }
    });

    const buildNode = (folder: BoxFolder): DataNode => {
      const children = folders
        .filter(f => f.parent_folder_id === folder.box_folder_id)
        .map(buildNode);

      return {
        title: (
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Folder className="h-4 w-4 mr-2 text-blue-600" />
              {folder.folder_name}
            </span>
            <span className="text-xs text-gray-500">{folder.folder_type}</span>
          </div>
        ),
        key: folder.box_folder_id,
        children: children.length > 0 ? children : undefined,
        isLeaf: children.length === 0
      };
    };

    return rootFolders.map(buildNode);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    if (selectedFolder) {
      loadDocuments(selectedFolder);
    }
  }, [selectedFolder, loadDocuments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Box Document Manager</h2>
          <p className="text-gray-600">Manage your regulatory documents and folders</p>
        </div>
        <Space>
          {companyProfileId && (
            <Button
              icon={<Settings />}
              onClick={() => setSetupModalVisible(true)}
            >
              Setup Company Folders
            </Button>
          )}
          <Button
            type="primary"
            icon={<Plus />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Folder
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folders Tree */}
        <Card title="Folders" className="shadow-sm">
          <div className="space-y-4">
            <Button
              className="w-full"
              icon={<FolderOpen />}
              onClick={() => handleFolderSelect('0')}
            >
              Root Folder
            </Button>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading folders...</p>
              </div>
            ) : (
              <Tree
                showLine
                defaultExpandAll
                treeData={buildTreeData(folders)}
                onSelect={(keys) => {
                  if (keys.length > 0) {
                    handleFolderSelect(keys[0] as string);
                  }
                }}
                selectedKeys={selectedFolder ? [selectedFolder] : []}
              />
            )}
          </div>
        </Card>

        {/* Documents List */}
        <Card title="Documents" className="lg:col-span-2 shadow-sm">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex space-x-2">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<Search className="h-4 w-4 text-gray-400" />}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Documents */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {searchQuery ? 'No documents found' : 'No documents in this folder'}
                  </p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.filename}</h4>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(doc.file_size)} • {doc.document_category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="small">View</Button>
                      <Button size="small">Download</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Create Folder Modal */}
      <Modal
        title="Create New Folder"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateFolder}
        >
          <Form.Item
            name="name"
            label="Folder Name"
            rules={[{ required: true, message: 'Please enter folder name' }]}
          >
            <Input placeholder="Enter folder name" />
          </Form.Item>

          <Form.Item
            name="folder_type"
            label="Folder Type"
            rules={[{ required: true, message: 'Please select folder type' }]}
          >
            <Select placeholder="Select folder type" options={folderTypes} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              placeholder="Enter folder description"
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Folder
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Setup Company Folders Modal */}
      <Modal
        title="Setup Company Folder Structure"
        open={setupModalVisible}
        onCancel={() => setSetupModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSetupModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="setup" type="primary" onClick={handleSetupCompanyFolders}>
            Setup Folders
          </Button>
        ]}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This will create a structured folder hierarchy for your company with the following folders:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Regulatory Documents - [Company Name]</li>
            <li>Compliance Reports</li>
            <li>Regulatory Changes</li>
            <li>Policy Documents</li>
            <li>Audit Reports</li>
          </ul>
          <p className="text-sm text-gray-500">
            This action will create the main folder and subfolders in your Box account.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default BoxFolderManager;
