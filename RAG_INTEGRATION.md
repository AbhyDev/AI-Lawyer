# RAG Feature Integration Documentation

## Overview

This merge integrates the Retrieval Augmented Generation (RAG) functionality from the `test2` branch into the `test1` branch. The RAG system allows the AI Lawyer application to retrieve information from stored legal cases and provide more accurate and contextualized responses.

## Changes Made

### Added Files

1. **Python Backend (backend_lang)**
   - `rag.py`: Core RAG implementation using LangChain and FAISS
   - `test_rag.py`: Testing utilities for the RAG system
   - `RAG_README.md`: Comprehensive documentation for the RAG system
   - `.gitignore`: Updated to exclude vector store binary files

2. **Express Backend (backend_express)**
   - `controllers/ragController.js`: Controller for RAG API endpoints
   - `routes/ragRouter.js`: Router for RAG API endpoints
   - `.env-example`: Updated example environment variables

### Modified Files

1. **Python Backend (backend_lang)**
   - `main.py`: Added RAG endpoints (/rag/load and /rag/query)
   
2. **Express Backend (backend_express)**
   - `index.js`: Added ragRouter integration
   - `controllers/caseController.js`: Added integration with RAG for case creation and updates
   - `routes/caseRouter.js`: Updated to support the new case endpoints

### Added Directories

- `backend_lang/vector_stores/`: Directory for storing FAISS vector indices

## Integration Details

### RAG System Flow

```
┌─────────────────────────────────────────────────────────┐
│                    RAG System Flow                      │
└─────────────────────────────────────────────────────────┘

/rag/load endpoint:
MongoDB → Extract Text → Create Embeddings → FAISS Vector Store
                                                      ↓
                                              Save to disk
                                         (vector_stores/case_X/)

/rag/query endpoint:
Query → Load All Vector Stores → Merge → LLM with Tool Calling
                                             ↓
                                    Similarity Search
                                             ↓
                                    Format Results
                                             ↓
                                    LLM Final Answer
```

### Backend Integration

- The Express backend interfaces with the FastAPI backend using REST API calls
- When a case is created or updated in Express, it automatically triggers the RAG system to index the case
- The `/api/rag` endpoint in Express forwards queries to the FastAPI backend

## Testing Instructions

1. **Setup Environment**
   - Ensure both backends have appropriate `.env` files based on the examples
   - The Python backend requires LangChain and FAISS dependencies

2. **Start Backends**
   ```bash
   # Start Express backend
   cd backend_express
   npm install
   npm start
   
   # Start Python backend
   cd backend_lang
   uv sync
   uvicorn main:app --reload
   ```

3. **Test RAG Loading**
   - Create or update a case through the Express API
   - Verify in logs that the case was loaded into the RAG system

4. **Test RAG Querying**
   ```bash
   # Using curl
   curl -X POST http://localhost:3000/api/rag \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"query": "What are the key evidences in this case?"}'
   ```

## Environment Variables

Add the following to your `.env` file in the backend_express directory:

```
FASTAPI_URL=http://localhost:8000
```

## Dependencies

The Python backend requires the following additional dependencies:
- langchain
- langchain-community
- langchain-google-genai
- langchain-huggingface
- faiss-cpu
- sentence-transformers

## Notes

- The RAG system requires an API key for Google's Gemini model
- Vector stores are saved to disk and persist between server restarts
- Each case gets its own vector store for efficient searching