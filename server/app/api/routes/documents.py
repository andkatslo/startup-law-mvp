import asyncio
import logging
from typing import List, Optional
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    BackgroundTasks,
)
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.llm_service import llm_service
from app.core.document_processor import document_processor
from app.models.models import (
    User,
    Document,
    DocumentCategory,
    ProcessingJob,
    DocumentChunk,
)
from app.schemas.document import (
    Document as DocumentSchema,
    DocumentCreate,
    DocumentUpdate,
    DocumentProcessingStatus,
    DocumentClassificationResult,
    QueryRequest,
    QueryResponse,
    DocumentStats,
    BulkUploadResponse,
    DocumentCategory as DocumentCategorySchema,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a single document for processing"""
    try:
        # Read file content
        file_content = await file.read()

        # Validate file
        is_valid, error_message = document_processor.validate_file(
            file.filename, len(file_content), file.content_type
        )

        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        # Save file to disk
        file_info = await document_processor.save_uploaded_file(
            file_content, file.filename, current_user.id
        )

        # Create document record
        document_data = DocumentCreate(user_id=current_user.id, **file_info)

        db_document = Document(**document_data.model_dump())
        db.add(db_document)
        db.commit()
        db.refresh(db_document)

        # Start background processing
        background_tasks.add_task(
            process_document_async,
            db_document.id,
            file_info["file_path"],
            file_info["mime_type"],
            file.filename,
        )

        logger.info(f"Document uploaded: {file.filename} (ID: {db_document.id})")
        return db_document

    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload/bulk", response_model=BulkUploadResponse)
async def upload_documents_bulk(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload multiple documents for processing"""
    try:
        uploaded_files = []
        failed_files = []
        processing_jobs = []

        for file in files:
            try:
                # Read file content
                file_content = await file.read()

                # Validate file
                is_valid, error_message = document_processor.validate_file(
                    file.filename, len(file_content), file.content_type
                )

                if not is_valid:
                    failed_files.append(
                        {"filename": file.filename, "error": error_message}
                    )
                    continue

                # Save file to disk
                file_info = await document_processor.save_uploaded_file(
                    file_content, file.filename, current_user.id
                )

                # Create document record
                document_data = DocumentCreate(user_id=current_user.id, **file_info)

                db_document = Document(**document_data.model_dump())
                db.add(db_document)
                db.commit()
                db.refresh(db_document)

                uploaded_files.append(file.filename)
                processing_jobs.append(db_document.id)

                # Start background processing
                background_tasks.add_task(
                    process_document_async,
                    db_document.id,
                    file_info["file_path"],
                    file_info["mime_type"],
                    file.filename,
                )

            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {str(e)}")
                failed_files.append({"filename": file.filename, "error": str(e)})

        return BulkUploadResponse(
            uploaded_files=uploaded_files,
            failed_files=failed_files,
            processing_jobs=processing_jobs,
            total_files=len(files),
            success_count=len(uploaded_files),
            failure_count=len(failed_files),
        )

    except Exception as e:
        logger.error(f"Error in bulk upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk upload failed: {str(e)}")


@router.get("/", response_model=List[DocumentSchema])
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's documents with optional filtering"""
    try:
        query = db.query(Document).filter(Document.user_id == current_user.id)

        if category_id:
            query = query.filter(Document.category_id == category_id)

        if status:
            query = query.filter(Document.processing_status == status)

        documents = query.offset(skip).limit(limit).all()
        return documents

    except Exception as e:
        logger.error(f"Error fetching documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")


@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific document"""
    try:
        document = (
            db.query(Document)
            .filter(Document.id == document_id, Document.user_id == current_user.id)
            .first()
        )

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        return document

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch document")


@router.get("/{document_id}/status", response_model=DocumentProcessingStatus)
async def get_document_status(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get document processing status"""
    try:
        document = (
            db.query(Document)
            .filter(Document.id == document_id, Document.user_id == current_user.id)
            .first()
        )

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Calculate progress based on status
        progress_map = {
            "pending": 0.0,
            "processing": 0.5,
            "completed": 1.0,
            "failed": 0.0,
        }

        classification_result = None
        if document.processing_status == "completed" and document.category:
            classification_result = DocumentClassificationResult(
                category_id=document.category_id,
                category_name=document.category.name if document.category else None,
                confidence=document.classification_confidence or 0.0,
                reasoning=document.classification_reasoning,
                suggested_categories=document.suggested_categories,
                key_entities=document.key_entities,
                summary=document.summary,
            )

        return DocumentProcessingStatus(
            document_id=document.id,
            status=document.processing_status,
            progress=progress_map.get(document.processing_status, 0.0),
            error_message=document.processing_error,
            classification_result=classification_result,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document status {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch document status")


@router.post("/query", response_model=QueryResponse)
async def query_documents(
    query_request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Query documents using natural language"""
    try:
        # Get user's documents
        query = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.processing_status == "completed",
        )

        # Filter by specific documents if requested
        if query_request.document_ids:
            query = query.filter(Document.id.in_(query_request.document_ids))

        # Filter by categories if requested
        if query_request.category_ids:
            query = query.filter(Document.category_id.in_(query_request.category_ids))

        documents = query.all()

        if not documents:
            return QueryResponse(
                query=query_request.query,
                response="No documents found to query. Please upload and process documents first.",
                confidence_score=0.0,
                source_documents=[],
                reasoning="No documents available for analysis",
            )

        # Get document chunks for context
        context_chunks = []
        source_docs = []

        for doc in documents[:5]:  # Limit to 5 documents for context
            if doc.extracted_text:
                # Use first 2000 characters as context
                context_chunks.append(doc.extracted_text[:2000])
                source_docs.append(
                    {
                        "id": doc.id,
                        "filename": doc.original_filename,
                        "category": (
                            doc.category.name if doc.category else "Uncategorized"
                        ),
                    }
                )

        # Query using LLM
        llm_response = await llm_service.query_documents(
            query_request.query, context_chunks
        )

        return QueryResponse(
            query=query_request.query,
            response=llm_response.get("answer", "No response generated"),
            confidence_score=llm_response.get("confidence", 0.0),
            source_documents=source_docs,
            reasoning=llm_response.get("reasoning"),
            suggestions=llm_response.get("suggestions", []),
        )

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Query processing failed: {str(e)}"
        )


@router.get("/categories/", response_model=List[DocumentCategorySchema])
async def get_categories(db: Session = Depends(get_db)):
    """Get all document categories"""
    try:
        categories = db.query(DocumentCategory).all()
        return categories
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories")


@router.get("/stats", response_model=DocumentStats)
async def get_document_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get document statistics for the user"""
    try:
        # Total documents
        total_docs = (
            db.query(Document).filter(Document.user_id == current_user.id).count()
        )

        # Documents by category
        category_counts = {}
        categories = db.query(DocumentCategory).all()
        for category in categories:
            count = (
                db.query(Document)
                .filter(
                    Document.user_id == current_user.id,
                    Document.category_id == category.id,
                )
                .count()
            )
            category_counts[category.name] = count

        # Processing status counts
        status_counts = {}
        for status in ["pending", "processing", "completed", "failed"]:
            count = (
                db.query(Document)
                .filter(
                    Document.user_id == current_user.id,
                    Document.processing_status == status,
                )
                .count()
            )
            status_counts[status] = count

        # Recent uploads
        recent_docs = (
            db.query(Document)
            .filter(Document.user_id == current_user.id)
            .order_by(Document.created_at.desc())
            .limit(5)
            .all()
        )

        # Average confidence
        completed_docs = (
            db.query(Document)
            .filter(
                Document.user_id == current_user.id,
                Document.processing_status == "completed",
                Document.classification_confidence.isnot(None),
            )
            .all()
        )

        avg_confidence = None
        if completed_docs:
            confidences = [
                doc.classification_confidence
                for doc in completed_docs
                if doc.classification_confidence
            ]
            if confidences:
                avg_confidence = sum(confidences) / len(confidences)

        return DocumentStats(
            total_documents=total_docs,
            documents_by_category=category_counts,
            processing_status_counts=status_counts,
            recent_uploads=recent_docs,
            average_confidence=avg_confidence,
        )

    except Exception as e:
        logger.error(f"Error fetching document stats: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to fetch document statistics"
        )


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document"""
    try:
        document = (
            db.query(Document)
            .filter(Document.id == document_id, Document.user_id == current_user.id)
            .first()
        )

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete file from disk
        await document_processor.delete_file(document.file_path)

        # Delete from database
        db.delete(document)
        db.commit()

        return {"message": "Document deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete document")


async def process_document_async(
    document_id: int, file_path: str, mime_type: str, filename: str
):
    """Background task to process document with LLM"""
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        # Get document
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            logger.error(f"Document {document_id} not found for processing")
            return

        # Update status to processing
        document.processing_status = "processing"
        db.commit()

        # Extract text
        extracted_text = await document_processor.extract_text(file_path, mime_type)
        document.extracted_text = extracted_text

        # Classify document
        classification_result = await llm_service.classify_document(
            extracted_text, filename
        )

        # Find or create category
        category = None
        if classification_result.get("category_name"):
            category = (
                db.query(DocumentCategory)
                .filter(DocumentCategory.name == classification_result["category_name"])
                .first()
            )

            if category:
                document.category_id = category.id

        # Update document with classification results
        document.classification_confidence = classification_result.get(
            "confidence", 0.0
        )
        document.classification_reasoning = classification_result.get("reasoning")
        document.suggested_categories = classification_result.get(
            "suggested_categories", []
        )
        document.key_entities = classification_result.get("key_entities", [])
        document.summary = classification_result.get("summary")
        document.processing_status = "completed"
        document.processed_at = datetime.utcnow()

        db.commit()

        logger.info(f"Successfully processed document {document_id}")

    except Exception as e:
        logger.error(f"Error processing document {document_id}: {str(e)}")

        # Update document with error
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.processing_status = "failed"
            document.processing_error = str(e)
            db.commit()

    finally:
        db.close()
