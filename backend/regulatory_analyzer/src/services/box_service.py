"""
Box API Service for document storage and management
"""
import logging
from typing import Optional, List, Dict, Any, BinaryIO
from boxsdk import OAuth2, Client
from boxsdk.exception import BoxAPIException
from ..config import (
    BOX_CLIENT_ID, 
    BOX_CLIENT_SECRET, 
    BOX_ACCESS_TOKEN, 
    BOX_REFRESH_TOKEN,
    BOX_ENTERPRISE_ID,
    BOX_FOLDER_ID
)

logger = logging.getLogger(__name__)

class BoxService:
    """Service for interacting with Box API"""
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Box client with OAuth2 authentication"""
        try:
            if not all([BOX_CLIENT_ID, BOX_CLIENT_SECRET]):
                logger.warning("Box API credentials not configured. Box integration disabled.")
                return
            
            # Initialize OAuth2
            oauth = OAuth2(
                client_id=BOX_CLIENT_ID,
                client_secret=BOX_CLIENT_SECRET,
                access_token=BOX_ACCESS_TOKEN,
                refresh_token=BOX_REFRESH_TOKEN
            )
            
            # Initialize client
            self.client = Client(oauth)
            
            # Test connection
            user = self.client.user().get()
            logger.info(f"Box API connected successfully. User: {user.name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Box client: {e}")
            self.client = None
    
    def is_available(self) -> bool:
        """Check if Box service is available"""
        return self.client is not None
    
    async def create_folder(self, name: str, parent_folder_id: str = None) -> Optional[Dict[str, Any]]:
        """Create a new folder in Box"""
        if not self.client:
            logger.error("Box client not initialized")
            return None
        
        try:
            parent_id = parent_folder_id or BOX_FOLDER_ID
            folder = self.client.folder(parent_id).create_subfolder(name)
            
            logger.info(f"Created Box folder: {name} (ID: {folder.id})")
            return {
                "id": folder.id,
                "name": folder.name,
                "type": folder.type,
                "created_at": folder.created_at,
                "modified_at": folder.modified_at,
                "size": folder.size
            }
        except BoxAPIException as e:
            logger.error(f"Failed to create Box folder {name}: {e}")
            return None
    
    async def upload_file(
        self, 
        file_content: BinaryIO, 
        filename: str, 
        folder_id: str = None,
        description: str = None
    ) -> Optional[Dict[str, Any]]:
        """Upload a file to Box"""
        if not self.client:
            logger.error("Box client not initialized")
            return None
        
        try:
            parent_id = folder_id or BOX_FOLDER_ID
            uploaded_file = self.client.folder(parent_id).upload_stream(
                file_content, 
                filename,
                file_description=description
            )
            
            logger.info(f"Uploaded file to Box: {filename} (ID: {uploaded_file.id})")
            return {
                "id": uploaded_file.id,
                "name": uploaded_file.name,
                "type": uploaded_file.type,
                "size": uploaded_file.size,
                "created_at": uploaded_file.created_at,
                "modified_at": uploaded_file.modified_at,
                "download_url": uploaded_file.get_download_url(),
                "shared_link": uploaded_file.get_shared_link()
            }
        except BoxAPIException as e:
            logger.error(f"Failed to upload file {filename} to Box: {e}")
            return None
    
    async def download_file(self, file_id: str) -> Optional[bytes]:
        """Download a file from Box"""
        if not self.client:
            logger.error("Box client not initialized")
            return None
        
        try:
            file_content = self.client.file(file_id).content()
            logger.info(f"Downloaded file from Box: {file_id}")
            return file_content
        except BoxAPIException as e:
            logger.error(f"Failed to download file {file_id} from Box: {e}")
            return None
    
    async def get_file_info(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get file information from Box"""
        if not self.client:
            logger.error("Box client not initialized")
            return None
        
        try:
            file_info = self.client.file(file_id).get()
            return {
                "id": file_info.id,
                "name": file_info.name,
                "type": file_info.type,
                "size": file_info.size,
                "created_at": file_info.created_at,
                "modified_at": file_info.modified_at,
                "download_url": file_info.get_download_url(),
                "shared_link": file_info.get_shared_link()
            }
        except BoxAPIException as e:
            logger.error(f"Failed to get file info {file_id} from Box: {e}")
            return None
    
    async def delete_file(self, file_id: str) -> bool:
        """Delete a file from Box"""
        if not self.client:
            logger.error("Box client not initialized")
            return False
        
        try:
            self.client.file(file_id).delete()
            logger.info(f"Deleted file from Box: {file_id}")
            return True
        except BoxAPIException as e:
            logger.error(f"Failed to delete file {file_id} from Box: {e}")
            return False
    
    async def create_shared_link(
        self, 
        file_id: str, 
        access: str = "open",
        password: str = None,
        expires_at: str = None
    ) -> Optional[str]:
        """Create a shared link for a file"""
        if not self.client:
            logger.error("Box client not initialized")
            return None
        
        try:
            shared_link = self.client.file(file_id).create_shared_link(
                access=access,
                password=password,
                unshared_at=expires_at
            )
            logger.info(f"Created shared link for file: {file_id}")
            return shared_link.url
        except BoxAPIException as e:
            logger.error(f"Failed to create shared link for file {file_id}: {e}")
            return None
    
    async def list_folder_contents(self, folder_id: str = None) -> List[Dict[str, Any]]:
        """List contents of a folder"""
        if not self.client:
            logger.error("Box client not initialized")
            return []
        
        try:
            parent_id = folder_id or BOX_FOLDER_ID
            items = self.client.folder(parent_id).get_items()
            
            contents = []
            for item in items:
                contents.append({
                    "id": item.id,
                    "name": item.name,
                    "type": item.type,
                    "size": getattr(item, 'size', 0),
                    "created_at": item.created_at,
                    "modified_at": item.modified_at
                })
            
            logger.info(f"Listed {len(contents)} items from Box folder: {parent_id}")
            return contents
        except BoxAPIException as e:
            logger.error(f"Failed to list folder contents {folder_id}: {e}")
            return []
    
    async def search_files(self, query: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Search for files in Box"""
        if not self.client:
            logger.error("Box client not initialized")
            return []
        
        try:
            results = self.client.search().query(
                query=query,
                limit=limit,
                offset=0
            )
            
            files = []
            for item in results:
                if item.type == 'file':
                    files.append({
                        "id": item.id,
                        "name": item.name,
                        "type": item.type,
                        "size": item.size,
                        "created_at": item.created_at,
                        "modified_at": item.modified_at,
                        "path": getattr(item, 'path_collection', {}).get('entries', [])
                    })
            
            logger.info(f"Found {len(files)} files matching query: {query}")
            return files
        except BoxAPIException as e:
            logger.error(f"Failed to search files with query {query}: {e}")
            return []
    
    async def create_regulatory_documents_folder(self, company_name: str) -> Optional[str]:
        """Create a dedicated folder for regulatory documents"""
        if not self.client:
            logger.error("Box client not initialized")
            return None
        
        try:
            # Create main regulatory folder if it doesn't exist
            regulatory_folder_name = f"Regulatory Documents - {company_name}"
            folder = await self.create_folder(regulatory_folder_name)
            
            if folder:
                # Create subfolders for different document types
                subfolders = [
                    "Compliance Reports",
                    "Regulatory Changes",
                    "Policy Documents",
                    "Audit Reports"
                ]
                
                for subfolder_name in subfolders:
                    await self.create_folder(subfolder_name, folder["id"])
                
                logger.info(f"Created regulatory documents folder structure for: {company_name}")
                return folder["id"]
            
            return None
        except Exception as e:
            logger.error(f"Failed to create regulatory documents folder for {company_name}: {e}")
            return None

# Global instance
box_service = BoxService()
