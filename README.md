# LegalDocs AI - Startup Legal Document Management

An intelligent legal document management platform designed specifically for startups, powered by AI for automatic categorization, organization, and analysis.

## 🚀 Features

### Document Upload & Organization
- **Drag & Drop Interface**: Intuitive document upload with real-time progress tracking
- **AI-Powered Categorization**: Jessica AI automatically categorizes documents into legal categories
- **Live Processing**: Watch documents get analyzed and organized in real-time
- **Confidence Scoring**: Each document receives a confidence score for categorization accuracy

### AI Document Query
- **Natural Language Queries**: Ask questions about your legal documents in plain English
- **Intelligent Analysis**: Get instant answers powered by Jessica AI's legal knowledge
- **Document Citations**: Responses include relevant document references and confidence scores
- **Suggested Questions**: Pre-built queries for common legal document questions

### Document Categories
- **Formation**: Articles of incorporation, bylaws, and founding documents
- **Governance**: Board resolutions, meeting minutes, and governance policies
- **Directors & Officers**: D&O insurance, indemnification agreements, and officer appointments
- **Cap Table**: Stock certificates, option grants, and equity documentation
- **Employees**: Employment agreements, offer letters, and HR policies
- **Intellectual Property**: Patents, trademarks, copyrights, and IP assignments
- **Compliance**: Regulatory filings, licenses, and compliance documentation

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **Clerk** for authentication

### Backend
- **FastAPI** (Python)
- **PostgreSQL** database
- **Docker** containerization

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd startup-law-mvp
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Install backend dependencies**
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

### Environment Variables

Create `.env` files in both `client/` and `server/` directories:

**Client (.env)**
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=http://localhost:8000
```

**Server (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/legaldocs
CLERK_SECRET_KEY=your_clerk_secret
```

## 📱 User Interface

### Upload Center
The primary interface focuses on document uploading and organization:
- Large drag-and-drop area for easy file uploads
- Real-time progress tracking with visual feedback
- Live category organization panel
- Success states with next action suggestions

### Query Interface
AI-powered document analysis interface:
- Natural language query input
- Suggested questions for common legal topics
- Document availability sidebar
- Detailed analysis results with citations

## 🔒 Security

- Enterprise-grade document encryption
- Secure authentication via Clerk
- Role-based access control
- Audit logging for all document operations

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd client
npm run build

# Backend
cd server
docker build -t legaldocs-api .
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
