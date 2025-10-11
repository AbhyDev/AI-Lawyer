# AI-Lawyer Platform

A comprehensive legal case management system powered by AI that connects lawyers, judges, and citizens through an integrated platform for document processing, case analysis, and legal assistance.

![AI-Lawyer Platform](frontend/public/placeholder.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Telegram Bot](#telegram-bot)
  - [Web Dashboard](#web-dashboard)
- [API Documentation](#api-documentation)
- [AI Components](#ai-components)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

The AI-Lawyer platform bridges the gap between legal professionals and clients by providing AI-powered tools for case management, document analysis, and legal consultation. It consists of three main components:

1. **Frontend**: A React-based web interface for different user roles (lawyers, judges, citizens)
2. **Express Backend**: A Node.js API server handling authentication, case management, and Telegram bot integration
3. **Python Backend**: An AI service using LangGraph and Gemini models for document processing and legal analysis

## 🌟 Key Features

### For Lawyers
- Comprehensive case dashboard with timeline visualization
- Document management system with AI-powered insights
- Secure client communication channels
- Case progress tracking and hearing notifications

### For Judges
- Case overview and management interface
- Document review with AI-generated summaries
- Scheduling and calendar integration
- Historical case reference and precedent analysis

### For Citizens
- User-friendly case tracking
- Document submission through web or Telegram
- AI-powered legal guidance and explanations
- Transparent case progress updates

### AI Capabilities
- Automated document classification and analysis
- Legal document summarization and key point extraction
- Precedent case identification
- Evidence classification and organization
- Privacy-focused information categorization (public vs. private)

## 🏗️ System Architecture

The platform is built on a three-tier architecture:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Frontend  │◄─────►│  Express    │◄─────►│   Python    │
│  (React/TS) │       │  Backend    │       │  Backend    │
└─────────────┘       └─────────────┘       └─────────────┘
                            ▲                     ▲
                            │                     │
                            ▼                     │
                      ┌─────────────┐             │
                      │  Telegram   │◄────────────┘
                      │    Bot      │
                      └─────────────┘
```

- **Frontend**: React application with TypeScript, TailwindCSS, and shadcn/ui
- **Express Backend**: Node.js/Express server with JWT authentication
- **Python Backend**: FastAPI server with LangGraph for AI document processing
- **Telegram Bot**: Integrated into the Express backend for document collection

## 💻 Technologies Used

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- shadcn/ui component library
- React Router for navigation
- TanStack Query for data fetching

### Express Backend
- Node.js and Express
- MongoDB with Mongoose
- Redis for session management and caching
- JSON Web Tokens (JWT) for authentication
- Multer for file uploads
- Telegraph API for Telegram bot integration

### Python Backend
- Python 3.13
- FastAPI for API endpoints
- LangGraph for AI workflows
- Gemini 2.5 Flash for text processing
- FastVLM-1.5B for OCR/image analysis
- PyMuPDF for document parsing

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- Python 3.13 or higher
- MongoDB 6.x
- Redis 7.x
- Telegram Bot Token
- Google API Key for Gemini model

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/AbhyDev/AI-Lawyer.git
cd AI-Lawyer
```

#### 2. Set up the Express Backend

```bash
cd backend_express
npm install
```

#### 3. Set up the Python Backend

```bash
cd ../backend_lang
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
```

#### 4. Set up the Frontend

```bash
cd ../frontend
npm install
```

### Configuration

#### Express Backend Configuration

Create a `.env` file in the `backend_express` directory:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/ai-lawyer
REDIS_URI=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=90d
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PYTHON_BACKEND_URL=http://localhost:8000
```

#### Python Backend Configuration

Create a `.env` file in the `backend_lang` directory:

```
GOOGLE_API_KEY=your_google_api_key
MODEL_NAME=gemini-2.5-flash
```

## 🖥️ Usage

### Starting the Servers

#### 1. Start the Express Backend

```bash
cd backend_express
npm run dev
```

#### 2. Start the Python Backend

```bash
cd backend_lang
python main.py
```

#### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

### Telegram Bot

The Telegram bot serves as an interface for users to submit legal cases:

1. Start a chat with the bot using the link provided during setup
2. Send a greeting ("hi" or "hello") to initiate the conversation
3. Follow the bot's prompts to provide lawyer, judge, and client usernames
4. Upload evidence documents as requested
5. Upload case documents as requested
6. The bot will process all documents and generate case analysis

### Web Dashboard

Access the web dashboard at `http://localhost:5173`:

1. Log in with your credentials based on your role (lawyer, judge, citizen)
2. Navigate through the dashboard to view cases, documents, and analytics
3. Upload and manage documents
4. Communicate with other parties involved in the case
5. View AI-generated insights and summaries

## 📚 API Documentation

### Express Backend Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout and invalidate token
- `POST /api/auth/refresh` - Refresh access token

#### Case Management

- `GET /api/cases` - Get all cases for the authenticated user
- `GET /api/cases/:id` - Get a specific case by ID
- `POST /api/cases` - Create a new case
- `PUT /api/cases/:id` - Update case information
- `DELETE /api/cases/:id` - Delete a case

#### Document Management

- `GET /api/documents/:caseId` - Get all documents for a case
- `POST /api/documents/:caseId` - Upload a new document
- `GET /api/documents/:caseId/:docId` - Get a specific document
- `DELETE /api/documents/:caseId/:docId` - Delete a document

#### Telegram Bot Endpoints

- `POST /api/telegram/webhook` - Telegram webhook endpoint
- `GET /api/telegram/status` - Get bot status

### Python Backend Endpoints

- `POST /process` - Process document(s) and extract information
- `POST /classify` - Classify document type
- `POST /summarize` - Generate document summary
- `POST /analyze` - Perform deep analysis on case documents

## 🤖 AI Components

### Document Processing Pipeline

1. **Document Classification**: Identifies document type (evidence, court filing, etc.)
2. **Text Extraction**: Uses OCR for images/scans and text parsing for digital documents
3. **Information Categorization**: Separates information into evidence, public, and private categories
4. **Entity Extraction**: Identifies people, organizations, dates, and locations
5. **Summarization**: Creates concise summaries for each document

### Evidence Classification

Documents are classified into categories:
- Photographs and videos
- Official reports
- Contracts and agreements
- Financial records
- Affidavits and statements
- Digital communications
- Call detail records
- Forensic reports
- Expert opinions
- Physical object descriptions

## 🔒 Security

- **JWT Authentication**: Secure, token-based authentication with refresh tokens
- **Role-Based Access Control**: Different permissions for lawyers, judges, and citizens
- **HTTP-Only Cookies**: For secure token storage
- **Data Encryption**: Sensitive data is encrypted at rest and in transit
- **Privacy Protection**: Information is categorized as public or private
- **Session Management**: Redis-based session tracking with automatic expiration
- **Browser History Security**: Prevents unauthorized access via browser back navigation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
