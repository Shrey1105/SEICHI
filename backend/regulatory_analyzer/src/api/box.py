"""
Box API endpoints for document storage and management
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..database.models import User, BoxDocument, BoxFolder, CompanyProfile
from ..api.auth import get_current_user
from ..services.box_service import box_service
from ..schemas import BoxDocumentResponse, BoxFolderResponse, BoxUploadResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/box", tags=["box"])

class BoxFolderCreate(BaseModel):
    name: str
    parent_folder_id: Optional[str] = None
    folder_type: Optional[str] = "regulatory_documents"
    description: Optional[str] = None

class BoxSharedLinkCreate(BaseModel):
    file_id: str
    access: str = "open"
    password: Optional[str] = None
    expires_at: Optional[str] = None

@router.get("/status")
async def get_box_status(current_user: User = Depends(get_current_user)):
    """Check Box API connection status"""
    return {
        "available": box_service.is_available(),
        "message": "Box API is connected" if box_service.is_available() else "Box API is not configured"
    }

@router.post("/folders", response_model=BoxFolderResponse)
async def create_folder(
    folder_data: BoxFolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new folder in Box"""
    if not box_service.is_available():
        raise HTTPException(status_code=503, detail="Box API is not available")
    
    try:
        # Create folder in Box
        box_folder = await box_service.create_folder(
            name=folder_data.name,
            parent_folder_id=folder_data.parent_folder_id
        )
        
        if not box_folder:
            raise HTTPException(status_code=500, detail="Failed to create folder in Box")
        
        # Save folder info to database
        db_folder = BoxFolder(
            user_id=current_user.id,
            box_folder_id=box_folder["id"],
            parent_folder_id=folder_data.parent_folder_id,
            folder_name=folder_data.name,
            folder_type=folder_data.folder_type,
            description=folder_data.description
        )
        
        db.add(db_folder)
        db.commit()
        db.refresh(db_folder)
        
        logger.info(f"Created Box folder: {folder_data.name} for user {current_user.id}")
        
        return BoxFolderResponse(
            id=db_folder.id,
            box_folder_id=db_folder.box_folder_id,
            folder_name=db_folder.folder_name,
            folder_type=db_folder.folder_type,
            description=db_folder.description,
            created_at=db_folder.created_at
        )
        
    except Exception as e:
        logger.error(f"Error creating Box folder: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create folder: {str(e)}")

@router.get("/folders", response_model=List[BoxFolderResponse])
async def list_folders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's Box folders"""
    folders = db.query(BoxFolder).filter(
        BoxFolder.user_id == current_user.id,
        BoxFolder.is_active == True
    ).all()
    
    return [
        BoxFolderResponse(
            id=folder.id,
            box_folder_id=folder.box_folder_id,
            folder_name=folder.folder_name,
            folder_type=folder.folder_type,
            description=folder.description,
            created_at=folder.created_at
        )
        for folder in folders
    ]

@router.post("/upload", response_model=BoxUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    folder_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    document_category: Optional[str] = Form("regulatory_document"),
    report_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file to Box"""
    if not box_service.is_available():
        raise HTTPException(status_code=503, detail="Box API is not available")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Upload to Box
        box_file = await box_service.upload_file(
            file_content=file_content,
            filename=file.filename,
            folder_id=folder_id,
            description=description
        )
        
        if not box_file:
            raise HTTPException(status_code=500, detail="Failed to upload file to Box")
        
        # Save file info to database
        db_document = BoxDocument(
            user_id=current_user.id,
            report_id=report_id,
            box_file_id=box_file["id"],
            box_folder_id=box_file.get("parent", {}).get("id") if "parent" in box_file else folder_id,
            filename=file.filename,
            file_type=file.content_type,
            file_size=len(file_content),
            description=description,
            shared_link=box_file.get("shared_link"),
            download_url=box_file.get("download_url"),
            document_category=document_category
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        logger.info(f"Uploaded file to Box: {file.filename} for user {current_user.id}")
        
        return BoxUploadResponse(
            id=db_document.id,
            box_file_id=db_document.box_file_id,
            filename=db_document.filename,
            file_type=db_document.file_type,
            file_size=db_document.file_size,
            shared_link=db_document.shared_link,
            download_url=db_document.download_url,
            document_category=db_document.document_category,
            created_at=db_document.created_at
        )
        
    except Exception as e:
        logger.error(f"Error uploading file to Box: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.get("/documents", response_model=List[BoxDocumentResponse])
async def list_documents(
    report_id: Optional[int] = Query(None),
    document_category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's Box documents"""
    query = db.query(BoxDocument).filter(BoxDocument.user_id == current_user.id)
    
    if report_id:
        query = query.filter(BoxDocument.report_id == report_id)
    
    if document_category:
        query = query.filter(BoxDocument.document_category == document_category)
    
    documents = query.all()
    
    return [
        BoxDocumentResponse(
            id=doc.id,
            box_file_id=doc.box_file_id,
            filename=doc.filename,
            file_type=doc.file_type,
            file_size=doc.file_size,
            description=doc.description,
            shared_link=doc.shared_link,
            download_url=doc.download_url,
            document_category=doc.document_category,
            created_at=doc.created_at
        )
        for doc in documents
    ]

@router.get("/documents/{document_id}", response_model=BoxDocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document details"""
    document = db.query(BoxDocument).filter(
        BoxDocument.id == document_id,
        BoxDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return BoxDocumentResponse(
        id=document.id,
        box_file_id=document.box_file_id,
        filename=document.filename,
        file_type=document.file_type,
        file_size=document.file_size,
        description=document.description,
        shared_link=document.shared_link,
        download_url=document.download_url,
        document_category=document.document_category,
        created_at=document.created_at
    )

@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a document from Box"""
    if not box_service.is_available():
        raise HTTPException(status_code=503, detail="Box API is not available")
    
    document = db.query(BoxDocument).filter(
        BoxDocument.id == document_id,
        BoxDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        file_content = await box_service.download_file(document.box_file_id)
        
        if not file_content:
            raise HTTPException(status_code=500, detail="Failed to download file from Box")
        
        return {
            "filename": document.filename,
            "content": file_content,
            "content_type": document.file_type
        }
        
    except Exception as e:
        logger.error(f"Error downloading document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download document: {str(e)}")

@router.post("/documents/{document_id}/shared-link")
async def create_shared_link(
    document_id: int,
    link_data: BoxSharedLinkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a shared link for a document"""
    if not box_service.is_available():
        raise HTTPException(status_code=503, detail="Box API is not available")
    
    document = db.query(BoxDocument).filter(
        BoxDocument.id == document_id,
        BoxDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        shared_link = await box_service.create_shared_link(
            file_id=document.box_file_id,
            access=link_data.access,
            password=link_data.password,
            expires_at=link_data.expires_at
        )
        
        if not shared_link:
            raise HTTPException(status_code=500, detail="Failed to create shared link")
        
        # Update document with shared link
        document.shared_link = shared_link
        db.commit()
        
        logger.info(f"Created shared link for document: {document.filename}")
        
        return {"shared_link": shared_link}
        
    except Exception as e:
        logger.error(f"Error creating shared link: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create shared link: {str(e)}")

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document from Box and database"""
    if not box_service.is_available():
        raise HTTPException(status_code=503, detail="Box API is not available")
    
    document = db.query(BoxDocument).filter(
        BoxDocument.id == document_id,
        BoxDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Delete from Box
        success = await box_service.delete_file(document.box_file_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete file from Box")
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        logger.info(f"Deleted document: {document.filename}")
        
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

@router.post("/company/{company_profile_id}/setup-folders")
async def setup_company_folders(
    company_profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set up Box folder structure for a company profile"""
    if not box_service.is_available():
        raise HTTPException(status_code=503, detail="Box API is not available")
    
    company_profile = db.query(CompanyProfile).filter(
        CompanyProfile.id == company_profile_id,
        CompanyProfile.user_id == current_user.id
    ).first()
    
    if not company_profile:
        raise HTTPException(status_code=404, detail="Company profile not found")
    
    try:
        # Create regulatory documents folder structure
        folder_id = await box_service.create_regulatory_documents_folder(
            company_profile.company_name
        )
        
        if not folder_id:
            raise HTTPException(status_code=500, detail="Failed to create company folder structure")
        
        # Save main folder to database
        db_folder = BoxFolder(
            user_id=current_user.id,
            company_profile_id=company_profile_id,
            box_folder_id=folder_id,
            folder_name=f"Regulatory Documents - {company_profile.company_name}",
            folder_type="regulatory_documents",
            description=f"Main folder for regulatory documents of {company_profile.company_name}"
        )
        
        db.add(db_folder)
        db.commit()
        
        logger.info(f"Set up Box folders for company: {company_profile.company_name}")
        
        return {
            "message": "Company folder structure created successfully",
            "folder_id": folder_id
        }
        
    except Exception as e:
        logger.error(f"Error setting up company folders: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to setup company folders: {str(e)}")

@router.get("/search")
async def search_documents(
    query: str = Query(..., description="Search query"),
    limit: int = Query(100, description="Maximum number of results"),
    current_user: User = Depends(get_current_user)
):
    """Search for documents in Box"""
    if not box_service.is_available():
        raise HTTPException(status_code=503, detail="Box API is not available")
    
    try:
        results = await box_service.search_files(query=query, limit=limit)
        
        logger.info(f"Search completed for query: {query}, found {len(results)} results")
        
        return {
            "query": query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search documents: {str(e)}")
