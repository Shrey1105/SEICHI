# Regulatory Intelligence Platform

A comprehensive AI-powered platform for monitoring and analyzing regulatory changes across industries. Built with FastAPI, React, and modern web technologies.

## Features

- **AI-Powered Analysis**: 4-stage pipeline for comprehensive regulatory change detection
- **Real-time Monitoring**: WebSocket-based real-time updates and progress tracking
- **Company Profiles**: Manage multiple company profiles with custom monitoring parameters
- **Risk Assessment**: Automated risk level classification and impact assessment
- **Compliance Tracking**: Track compliance requirements and implementation timelines
- **Report Generation**: Detailed reports with actionable insights and recommendations
- **User Management**: Secure authentication and role-based access control

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL**: Robust, open-source relational database
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Token authentication
- **Socket.io**: Real-time bidirectional event-based communication

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **Redux Toolkit**: Predictable state container for JavaScript apps
- **Ant Design**: Enterprise-class UI design language
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Composable charting library built on React components

### AI & Analysis
- **Google Gemini API**: AI-powered content analysis and insights generation
- **Custom Pipeline**: 4-stage analysis pipeline (Query Generation, Data Acquisition, Content Filtering, AI Analysis)

### Document Management
- **Box API Integration**: Cloud document storage and management
- **File Upload/Download**: Secure document handling with Box cloud storage
- **Folder Management**: Organized document structure with regulatory categories
- **Shared Links**: Secure document sharing with access controls

## Project Structure

```
regulatory-intelligence-platform/
├── backend/
│   └── regulatory_analyzer/
│       ├── main.py                 # FastAPI application entry point
│       ├── requirements.txt        # Python dependencies
│       ├── env.example            # Environment variables template
│       └── src/
│           ├── api/               # API endpoints
│           │   ├── auth.py        # Authentication endpoints
│           │   ├── reports.py     # Report management
│           │   ├── history.py     # Analysis history
│           │   ├── schedules.py   # Scheduled analyses
│           │   ├── management.py  # Company profiles & sources
│           │   └── box.py         # Box API integration
│           ├── core/
│           │   └── pipeline/      # AI analysis pipeline
│           │       ├── orchestrator.py    # Pipeline coordinator
│           │       ├── query_generator.py # Query generation
│           │       ├── data_acquirer.py   # Data acquisition
│           │       ├── content_filter.py  # Content filtering
│           │       └── ai_analyst.py      # AI analysis
│           ├── database/
│           │   ├── models.py      # SQLAlchemy models
│           │   └── session.py     # Database configuration
│           ├── services/
│           │   └── box_service.py # Box API service
│           ├── config.py          # Application configuration
│           └── schemas.py         # Pydantic schemas
└── frontend/
    ├── src/
    │   ├── components/            # React components
    │   │   ├── Layout/           # Layout components
    │   │   ├── Box/              # Box integration components
    │   │   └── ui/               # Reusable UI components
    │   ├── pages/                # Page components
    │   │   ├── Dashboard.tsx     # Main dashboard
    │   │   ├── Analysis.tsx      # Analysis interface
    │   │   ├── Reports.tsx       # Reports listing
    │   │   ├── ReportDetail.tsx  # Report details
    │   │   ├── Settings.tsx      # User settings
    │   │   ├── BoxDocuments.tsx  # Box document management
    │   │   ├── Login.tsx         # Authentication
    │   │   └── Register.tsx      # User registration
    │   ├── store/                # Redux store
    │   │   ├── index.ts          # Store configuration
    │   │   └── slices/           # Redux slices
    │   ├── services/             # API services
    │   ├── hooks/                # Custom React hooks
    │   ├── types/                # TypeScript type definitions
    │   └── utils/                # Utility functions
    ├── package.json              # Node.js dependencies
    ├── tsconfig.json             # TypeScript configuration
    └── tailwind.config.js        # Tailwind CSS configuration
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd regulatory-intelligence-platform
   ```

2. **Set up Python environment**
   ```bash
   cd backend/regulatory_analyzer
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb regulatory_intelligence
   
   # Run migrations (if using Alembic)
   alembic upgrade head
   ```

5. **Start the backend server**
   ```bash
   python main.py
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/regulatory_intelligence

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# Box API Configuration
BOX_CLIENT_ID=your-box-client-id-here
BOX_CLIENT_SECRET=your-box-client-secret-here
BOX_ACCESS_TOKEN=your-box-access-token-here
BOX_REFRESH_TOKEN=your-box-refresh-token-here
BOX_ENTERPRISE_ID=your-box-enterprise-id-here
BOX_FOLDER_ID=0

# Application Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_SOCKET_URL=http://localhost:8000
```

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Usage

### 1. User Registration & Authentication
- Register a new account or use demo credentials (admin/password)
- Secure JWT-based authentication with role-based access

### 2. Company Profile Setup
- Create company profiles with industry, jurisdiction, and monitoring parameters
- Configure trusted sources and keywords for targeted analysis

### 3. Regulatory Analysis
- Start comprehensive, targeted, or monitoring analyses
- Real-time progress tracking with WebSocket updates
- AI-powered content analysis and risk assessment

### 4. Report Management
- View detailed analysis reports with regulatory changes
- Export reports in various formats
- Track compliance requirements and action items

### 5. Document Management
- Upload regulatory documents to Box cloud storage
- Organize documents in structured folders
- Create secure shared links for document collaboration
- Search and manage regulatory documents

### 6. Settings & Configuration
- Manage user profile and preferences
- Configure notification settings
- Set up scheduled analyses

## AI Analysis Pipeline

The platform uses a sophisticated 4-stage AI analysis pipeline:

1. **Query Generation**: Creates targeted search queries based on company profile and analysis requirements
2. **Data Acquisition**: Gathers regulatory data from trusted sources and government databases
3. **Content Filtering**: Filters and ranks content based on relevance and quality metrics
4. **AI Analysis**: Uses Google Gemini API to analyze content and generate insights

## Development

### Backend Development
```bash
cd backend/regulatory_analyzer
python main.py  # Development server with auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Development server with hot reload
```

### Testing
```bash
# Backend tests
cd backend/regulatory_analyzer
pytest

# Frontend tests
cd frontend
npm test
```

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Production Considerations
- Use environment-specific configuration files
- Set up proper database backups
- Configure SSL/TLS certificates
- Set up monitoring and logging
- Use a production-grade WSGI server (e.g., Gunicorn)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and API docs

## Roadmap

- [x] Box API integration for document management
- [x] Google Gemini AI integration
- [x] Real-time WebSocket communication
- [x] Production-ready deployment configuration
- [ ] Advanced AI model integration
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced analytics and reporting
- [ ] Integration with external compliance tools
- [ ] Automated compliance monitoring
- [ ] Regulatory change prediction
