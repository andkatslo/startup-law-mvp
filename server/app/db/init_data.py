"""
Initialize database with default data
"""

import logging
from sqlalchemy.orm import Session

from app.models.models import DocumentCategory

logger = logging.getLogger(__name__)


def init_document_categories(db: Session) -> None:
    """Initialize default document categories"""

    default_categories = [
        {
            "name": "Formation",
            "description": "Documents related to company formation and incorporation",
            "keywords": [
                "articles of incorporation",
                "certificate of incorporation",
                "bylaws",
                "operating agreement",
                "partnership agreement",
                "LLC agreement",
                "charter",
                "formation",
                "incorporation",
            ],
        },
        {
            "name": "Governance",
            "description": "Corporate governance documents including board resolutions and policies",
            "keywords": [
                "board resolution",
                "board meeting",
                "minutes",
                "governance policy",
                "committee charter",
                "director",
                "shareholder agreement",
                "voting",
            ],
        },
        {
            "name": "Directors & Officers",
            "description": "Documents related to directors, officers, and their responsibilities",
            "keywords": [
                "director",
                "officer",
                "D&O insurance",
                "indemnification",
                "fiduciary duty",
                "appointment",
                "resignation",
                "liability",
            ],
        },
        {
            "name": "Cap Table",
            "description": "Equity and ownership related documents",
            "keywords": [
                "stock certificate",
                "equity",
                "shares",
                "option grant",
                "warrant",
                "convertible",
                "cap table",
                "ownership",
                "vesting",
                "securities",
            ],
        },
        {
            "name": "Employees",
            "description": "Employment and HR related documents",
            "keywords": [
                "employment agreement",
                "offer letter",
                "employee handbook",
                "non-disclosure",
                "non-compete",
                "severance",
                "benefits",
                "payroll",
            ],
        },
        {
            "name": "Intellectual Property",
            "description": "IP related documents including patents, trademarks, and assignments",
            "keywords": [
                "patent",
                "trademark",
                "copyright",
                "IP assignment",
                "invention assignment",
                "trade secret",
                "license",
                "intellectual property",
            ],
        },
        {
            "name": "Compliance",
            "description": "Regulatory and compliance documents",
            "keywords": [
                "compliance",
                "regulatory filing",
                "license",
                "permit",
                "audit",
                "SOX",
                "GDPR",
                "privacy policy",
                "regulation",
                "filing",
            ],
        },
    ]

    for category_data in default_categories:
        # Check if category already exists
        existing_category = (
            db.query(DocumentCategory)
            .filter(DocumentCategory.name == category_data["name"])
            .first()
        )

        if not existing_category:
            category = DocumentCategory(
                name=category_data["name"],
                description=category_data["description"],
                keywords=category_data["keywords"],
            )
            db.add(category)
            logger.info(f"Created category: {category_data['name']}")
        else:
            logger.info(f"Category already exists: {category_data['name']}")

    db.commit()
    logger.info("Document categories initialization completed")


def init_db_data(db: Session) -> None:
    """Initialize all default data"""
    logger.info("Starting database initialization...")

    try:
        init_document_categories(db)
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error during database initialization: {str(e)}")
        db.rollback()
        raise
