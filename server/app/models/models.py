from sqlalchemy import (
    Column,
    Integer,
    String,
    UniqueConstraint,
    Text,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class User(Base):
    """User model for authentication and profile data"""

    # Explicitly set table name to avoid PostgreSQL reserved keyword
    __tablename__ = "app_users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    documents = relationship("Document", back_populates="user")

    __table_args__ = (UniqueConstraint("clerk_user_id", name="uq_clerk_user_id"),)

    def __str__(self):
        return f"{self.name or self.email}"


class DocumentCategory(Base):
    """Document categories for legal document classification"""

    __tablename__ = "document_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    keywords = Column(JSON, nullable=True)  # Store relevant keywords for classification
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    documents = relationship("Document", back_populates="category")


class Document(Base):
    """Main document model with LLM-powered classification"""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("document_categories.id"), nullable=True)

    # File information
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)

    # Content and processing
    extracted_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    key_entities = Column(JSON, nullable=True)  # Store extracted entities
    metadata = Column(JSON, nullable=True)  # Store additional metadata

    # LLM Classification results
    classification_confidence = Column(Float, nullable=True)
    classification_reasoning = Column(Text, nullable=True)
    suggested_categories = Column(
        JSON, nullable=True
    )  # Alternative categories with scores

    # Processing status
    processing_status = Column(
        String, default="pending"
    )  # pending, processing, completed, failed
    processing_error = Column(Text, nullable=True)

    # Vector embeddings
    embedding_id = Column(String, nullable=True)  # Reference to vector store

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="documents")
    category = relationship("DocumentCategory", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")


class DocumentChunk(Base):
    """Document chunks for vector storage and retrieval"""

    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)

    # Chunk information
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    chunk_type = Column(String, nullable=True)  # paragraph, section, table, etc.

    # Vector information
    embedding_id = Column(String, nullable=True)

    # Metadata
    metadata = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    document = relationship("Document", back_populates="chunks")


class ProcessingJob(Base):
    """Track document processing jobs"""

    __tablename__ = "processing_jobs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)

    # Job information
    job_type = Column(String, nullable=False)  # classification, embedding, extraction
    status = Column(String, default="pending")  # pending, running, completed, failed
    progress = Column(Float, default=0.0)

    # Results and errors
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)


class QueryHistory(Base):
    """Store user queries and responses for learning"""

    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)

    # Query information
    query_text = Column(Text, nullable=False)
    query_type = Column(String, nullable=True)  # search, analysis, comparison

    # Response information
    response_text = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    source_documents = Column(JSON, nullable=True)  # Referenced document IDs

    # Feedback
    user_rating = Column(Integer, nullable=True)  # 1-5 rating
    user_feedback = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
