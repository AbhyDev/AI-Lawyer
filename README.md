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
3. **Python Backend**: An AI service using LangGraph, Gemini (for vision), and Groq API (for text processing) for document processing and legal analysis

## 🌟 Key Features

### For Lawyers
- Comprehensive case dashboard with timeline visualization
- Document management system with AI-powered insights
- Secure client communication channels
- Case progress tracking and hearing notifications
- AI Counsel chat for legal research assistance

### For Judges
- Case overview and management interface
- Document review with AI-generated summaries
- Scheduling and calendar integration
- Historical case reference and precedent analysis
- Analytics dashboard with case statistics

### For Citizens
- User-friendly case tracking
- Document submission through web or Telegram
- AI-powered legal guidance and explanations
- Transparent case progress updates

### AI Capabilities
- **ML-based Case Classification**: Custom-trained DistilBERT model classifies documents as Criminal or Civil
- **Automated Document Analysis**: LangGraph agents extract evidence, public info, and private details
- **OCR & Vision Processing**: Gemini 2.5 Flash for image/PDF text extraction
- **RAG System**: Vector-based retrieval with FAISS for intelligent case querying
- **Web Search Fallback**: Tavily integration when case documents don't contain answers
- **Evidence Classification**: Categorizes documents into 10 evidence types

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

- **Frontend**: React 18 application with TypeScript, TailwindCSS, and shadcn/ui
- **Express Backend**: Node.js/Express server with JWT authentication and Redis session management
- **Python Backend**: FastAPI server with LangGraph for AI document processing
- **Telegram Bot**: Integrated into the Express backend for document collection via webhook

## 💻 Technologies Used

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- shadcn/ui component library (Radix UI primitives)
- React Router for navigation
- TanStack Query for data fetching
- Framer Motion for animations
- Recharts for analytics visualization

### Express Backend
- Node.js and Express 5
- MongoDB with Mongoose
- Redis for session management and caching
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Axios for HTTP requests to Python backend
- ngrok for Telegram webhook tunneling

### Python Backend
- Python 3.11+
- FastAPI for API endpoints
- LangGraph for AI agent workflows
- **Gemini 2.5 Flash** for vision/OCR processing (images, scanned PDFs)
- **Groq API (Qwen3-32B)** for text-based LangGraph processing
- **DistilBERT** for ML-based Criminal/Civil classification
- FAISS for vector storage
- HuggingFace Embeddings (all-MiniLM-L6-v2)
- PyMuPDF for PDF parsing
- Tavily for web search fallback
- Motor/PyMongo for async MongoDB access

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- Python 3.11 or higher
- MongoDB 6.x
- Redis 7.x
- Telegram Bot Token
- Google API Key (for Gemini model)
- Groq API Key (for LangGraph text processing)
- Tavily API Key (optional, for web search)

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

Or with uv (recommended):
```bash
cd ../backend_lang
uv sync
```

#### 4. Set up the Frontend

```bash
cd ../frontend
npm install
```

### Configuration

#### Express Backend Configuration

Create a `.env` file in the `backend_express` directory:

```env
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai-lawyer

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=7d

# Telegram Bot Configuration
TELEGRAM_BASE_URL=https://api.telegram.org/bot<BOT_TOKEN>
TELEGRAM_WEBHOOK_URL=https://your-ngrok-url/telegram/webhook

# Processing Server Configuration (FastAPI backend)
PROCESSING_SERVER_URL=http://localhost:8000/classify
FASTAPI_URL=http://localhost:8000

# ngrok (for Telegram webhook)
NGROK_AUTHTOKEN=your_ngrok_auth_token
```

#### Python Backend Configuration

Create a `.env` file in the `backend_lang` directory:

```env
# Google API (for Gemini vision/OCR)
GOOGLE_API_KEY=your_google_api_key

# Groq API (for LangGraph text processing)
GROQ_API_KEY=your_groq_api_key

# MongoDB (for RAG system)
MONGODB_URI=mongodb://localhost:27017/ai-lawyer

# Tavily (optional, for web search fallback)
TAVILY_API_KEY=your_tavily_api_key
```

#### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🖥️ Usage

### Starting the Servers

#### 1. Start the Express Backend

```bash
cd backend_express
npm run dev
```

For development with Telegram webhook tunnel:
```bash
npm run dev:tunnel
```

#### 2. Start the Python Backend

```bash
cd backend_lang
python main.py
```

Or with uv:
```bash
cd backend_lang
uv run python main.py
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
4. Upload evidence documents as requested (type "DONE" when finished)
5. Upload case documents as requested (type "DONE" when finished)
6. The bot will process all documents and generate case analysis

### Web Dashboard

Access the web dashboard at `http://localhost:5173`:

1. Log in with your credentials based on your role (lawyer, judge, citizen)
2. Role-based dashboards:
   - **Lawyers**: `/dashboard/lawyer` - Case management, client communication
   - **Judges**: `/dashboard/judge` - Case review, analytics, scheduling
   - **Citizens**: `/dashboard/citizen` - Case tracking, document uploads
3. Common features:
   - `/cases` - View all assigned cases
   - `/cases/:id` - Detailed case view with evidence, timeline, parties
   - `/aicounsel` - AI-powered legal research assistant
   - `/analytics` - Dashboard statistics and insights
   - `/settings` - User preferences and account settings

## 📚 API Documentation

### Express Backend Endpoints

#### Authentication (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user (requires username, password, role) |
| POST | `/auth/login` | Login and receive access + refresh tokens |
| POST | `/auth/logout` | Logout and invalidate refresh token (requires auth) |
| GET | `/auth/refresh-token` | Renew access token using refresh token cookie |
| GET | `/auth/me` | Get currently logged-in user details (requires auth) |

#### Case Management (`/api/cases`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | Get all cases for authenticated user |
| POST | `/api/cases` | Create a new case |
| GET | `/api/cases/analytics` | Get analytics data for dashboard |
| GET | `/api/cases/:id` | Get a specific case by MongoDB ID |
| PUT | `/api/cases/:id` | Update case information |

#### RAG System (`/api/rag`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rag` | Query the RAG system with a question |

#### Telegram Bot (`/telegram`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/telegram/webhook` | Telegram webhook endpoint for bot updates |
| GET | `/telegram/health` | Health check for bot status |

### Python Backend Endpoints (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classify` | Process documents, extract info, classify case type |
| POST | `/rag/load` | Load a case into the vector store |
| POST | `/rag/reload` | Manually reload all vector stores |
| POST | `/rag/query` | Query the RAG system with LangGraph agent |

## 🤖 AI Components

### Document Processing Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Document   │────►│   Vision    │────►│  LangGraph  │
│   Upload    │     │  (Gemini)   │     │   (Groq)    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  OCR Text   │     │  Structured │
                    │  Extraction │     │    Data     │
                    └─────────────┘     └─────────────┘
```

1. **Document Upload**: Files received via Telegram or web interface
2. **Vision Processing**: Gemini 2.5 Flash extracts text from images/scanned PDFs
3. **ML Classification**: DistilBERT model predicts Criminal/Civil case type
4. **LangGraph Analysis**: Groq-powered agents extract:
   - Evidence (10 categories)
   - Public information (court details, parties, timeline)
   - Private information (contacts, strategy notes)
5. **Vector Storage**: Case data indexed in FAISS for RAG queries

### Evidence Classification Categories

| Category | Examples |
|----------|----------|
| Photographs and Videos | CCTV footage, crime scene photos |
| Official Reports | FIRs, police reports, medical reports |
| Contracts and Agreements | Legal documents, deeds, MoUs |
| Financial Records | Bank statements, invoices, receipts |
| Affidavits and Statements | Witness statements, declarations |
| Digital Communications | Emails, WhatsApp chats, SMS |
| Call Detail Records | Phone records, communication logs |
| Forensic Reports | DNA, fingerprint, ballistics analysis |
| Expert Opinions | Medical expert, technical expert reports |
| Physical Object Descriptions | Evidence items, seized materials |

### RAG System

The RAG (Retrieval-Augmented Generation) system enables intelligent querying:

1. **Vector Store**: Each case is indexed in a FAISS vector store using HuggingFace embeddings
2. **Search Strategy**: 
   - First searches case documents via vector similarity
   - Falls back to Tavily web search if no relevant documents found
3. **LangGraph Agent**: Orchestrates tool calls and generates comprehensive responses
4. **Multi-case Support**: Can query across all cases with metadata filtering

## 🔒 Security

- **JWT Authentication**: Secure, token-based authentication with access + refresh tokens
- **Role-Based Access Control**: Three roles with different permissions:
  - `lawyer`: Access to assigned cases, client communication
  - `judge`: Access to all cases, review capabilities
  - `user` (citizen): Access to own cases only
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **HTTP-Only Cookies**: Refresh tokens stored in HTTP-only cookies
- **Session Management**: Redis-based session tracking with automatic expiration
- **Authorization Middleware**: `verifyJWT` middleware protects all sensitive routes

## 📁 Project Structure

```
AI-Lawyer/
├── backend_express/          # Node.js/Express API server
│   ├── controllers/          # Route handlers
│   │   ├── authController.js
│   │   ├── caseController.js
│   │   ├── ragController.js
│   │   └── telegramBotController.js
│   ├── routes/               # API route definitions
│   ├── schemas/              # Mongoose models
│   ├── middleware/           # Auth middleware
│   ├── services/             # Telegram service
│   ├── utils/                # MongoDB, Redis utilities
│   └── constants/            # Bot states, messages
│
├── backend_lang/             # Python/FastAPI AI backend
│   ├── main.py               # FastAPI server & classify endpoint
│   ├── agent.py              # LangGraph classification agent
│   ├── rag.py                # RAG system with FAISS
│   ├── analyse.py            # Gemini vision/OCR
│   ├── legal_classifier.py   # DistilBERT ML model
│   ├── civil_criminal_model/ # Trained model weights
│   └── vector_stores/        # FAISS indices
│
├── frontend/                 # React/TypeScript web app
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # UI components
│   │   ├── lib/              # API client, utilities
│   │   └── hooks/            # Custom React hooks
│   └── public/
│
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
