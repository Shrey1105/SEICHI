import React, { useState, useCallback } from 'react';
import { Upload, FileText, FolderOpen, Download, Share2, Trash2, Eye } from 'lucide-react';
import { Button, Card, Progress, Alert, Modal, Input, Select, message } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';

interface BoxFileUploadProps {
  reportId?: number;
  folderId?: string;
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: string) => void;
}

interface BoxDocument {
  id: number;
  box_file_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  description: string;
  shared_link: string;
  download_url: string;
  document_category: string;
  created_at: string;
}

const BoxFileUpload: React.FC<BoxFileUploadProps> = ({
  reportId,
  folderId,
  onUploadSuccess,
  onUploadError
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<BoxDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BoxDocument | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [description, setDescription] = useState('');
  const [documentCategory, setDocumentCategory] = useState('regulatory_document');

  const documentCategories = [
    { value: 'regulatory_document', label: 'Regulatory Document' },
    { value: 'compliance_report', label: 'Compliance Report' },
    { value: 'policy_document', label: 'Policy Document' },
    { value: 'audit_report', label: 'Audit Report' }
  ];

  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folder_id', folderId);
      if (description) formData.append('description', description);
      if (documentCategory) formData.append('document_category', documentCategory);
      if (reportId) formData.append('report_id', reportId.toString());

      const response = await fetch('/api/box/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();
      setDocuments(prev => [result, ...prev]);
      message.success('File uploaded successfully!');
      onUploadSuccess?.(result);
      setDescription('');
      setDocumentCategory('regulatory_document');

    } catch (error) {
      console.error('Upload error:', error);
      message.error(`Upload failed: ${error.message}`);
      onUploadError?.(error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [folderId, description, documentCategory, reportId, onUploadSuccess, onUploadError]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportId) params.append('report_id', reportId.toString());
      if (documentCategory) params.append('document_category', documentCategory);

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
    } finally {
      setLoading(false);
    }
  }, [reportId, documentCategory]);

  const handleDownload = async (document: BoxDocument) => {
    try {
      const response = await fetch(`/api/box/documents/${document.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      message.error('Download failed');
    }
  };

  const handleCreateShareLink = async (document: BoxDocument) => {
    setSelectedDocument(document);
    setShareModalVisible(true);
  };

  const createShareLink = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/box/documents/${selectedDocument.id}/shared-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          access: 'open',
          expires_at: null
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShareLink(result.shared_link);
        message.success('Shared link created!');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      message.error('Failed to create share link');
    }
  };

  const handleDeleteDocument = async (document: BoxDocument) => {
    try {
      const response = await fetch(`/api/box/documents/${document.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== document.id));
        message.success('Document deleted successfully');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Delete failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card title="Upload Document to Box" className="shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter document description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={documentCategory}
                onChange={setDocumentCategory}
                className="w-full"
                options={documentCategories}
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600 mb-4">
              <label className="cursor-pointer">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  disabled={uploading}
                />
              </label>
              <span className="ml-2">or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">
              PDF, DOC, DOCX, TXT files up to 10MB
            </p>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress percent={uploadProgress} status="active" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          )}
        </div>
      </Card>

      {/* Documents List */}
      <Card title="Documents" className="shadow-sm">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.filename}</h4>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      icon={<Eye />}
                      size="small"
                      onClick={() => window.open(doc.download_url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      icon={<Download />}
                      size="small"
                      onClick={() => handleDownload(doc)}
                    >
                      Download
                    </Button>
                    <Button
                      icon={<Share2 />}
                      size="small"
                      onClick={() => handleCreateShareLink(doc)}
                    >
                      Share
                    </Button>
                    <Button
                      icon={<Trash2 />}
                      size="small"
                      danger
                      onClick={() => handleDeleteDocument(doc)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Share Link Modal */}
      <Modal
        title="Create Shared Link"
        open={shareModalVisible}
        onCancel={() => {
          setShareModalVisible(false);
          setShareLink('');
        }}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" onClick={createShareLink}>
            Create Link
          </Button>
        ]}
      >
        {selectedDocument && (
          <div className="space-y-4">
            <p>
              <strong>File:</strong> {selectedDocument.filename}
            </p>
            {shareLink ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shared Link
                </label>
                <Input
                  value={shareLink}
                  readOnly
                  addonAfter={
                    <Button
                      size="small"
                      onClick={() => navigator.clipboard.writeText(shareLink)}
                    >
                      Copy
                    </Button>
                  }
                />
              </div>
            ) : (
              <p className="text-gray-600">
                Click "Create Link" to generate a shareable link for this document.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BoxFileUpload;
