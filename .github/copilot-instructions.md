# AI-Lawyer Copilot Instructions

## Architecture Overview

Three-tier legal case management platform:
- **`frontend/`**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **`backend_express/`**: Node.js/Express API with MongoDB, Redis, Telegram bot
- **`backend_lang/`**: Python FastAPI with LangGraph agents, RAG, and ML classifiers

## Quick Start

```bash
# Express backend (port 3000) - requires Redis running locally
cd backend_express && npm install && npm run dev
# With ngrok tunnel for Telegram webhooks:
npm run dev:tunnel

# Python backend (port 8000) - uses uv package manager
cd backend_lang && uv sync && uvicorn main:app --reload --port 8000

# Frontend (port 5173)
cd frontend && npm install && npm run dev
```

## Key Data Flow

```
Telegram Bot → Express (state machine) → Python /classify → LangGraph Agent
     ↓                                           ↓
  Files + IDs                         Extracts text, runs ML classifier,
     ↓                                invokes tools (save_evidence, save_public, save_private)
Express saves to MongoDB → triggers /rag/load → FAISS vector store created
```

## Critical Patterns

### Express Backend
- **ES Modules only** - use `import/export`, never `require()`
- **State machine** for Telegram bot in [telegramBotController.js](backend_express/controllers/telegramBotController.js) with states defined in [botStates.js](backend_express/constants/botStates.js)
- **Redis sessions** stored as `session:{chatId}` with 1-hour TTL via [redisUtils.js](backend_express/utils/redisUtils.js)
- **Routes**: `/auth`, `/telegram/webhook`, `/api/cases`, `/api/rag`

### Python Backend  
- **LangGraph StateGraph** with tool-calling pattern in [agent.py](backend_lang/agent.py) - tools populate global dicts (`evidence_store`, `public_store`, `private_store`)
- **Dual LLM usage**: Groq qwen3-32b for text processing, Gemini 2.5 Flash for image OCR
- **RAG**: FAISS stores in `vector_stores/case_{id}/`, HuggingFace `all-MiniLM-L6-v2` embeddings
- **ML classifier**: DistilBERT from `civil_criminal_model/` runs before LangGraph for academic showcase

### Frontend
- **API client**: All calls through [api.ts](frontend/src/lib/api.ts) - set `VITE_API_BASE_URL`
- **Role-based dashboards**: `/dashboard/lawyer`, `/dashboard/judge`, `/dashboard/citizen`
- **UI components**: Use shadcn/ui from `src/components/ui/` - don't create custom base components

## Schema Synchronization (CRITICAL)

Python TypedDicts and MongoDB schemas MUST match. When modifying case structure:
1. Update `EvidenceClass`, `PublicInfoClass`, `PrivateInfoClass` in [agent.py](backend_lang/agent.py)
2. Update Mongoose schemas in [caseSchema.js](backend_express/schemas/caseSchema.js)
3. Update TypeScript interfaces in [api.ts](frontend/src/lib/api.ts)

## Environment Variables

**Express**: `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `TELEGRAM_BASE_URL`, `PROCESSING_SERVER_URL`

**Python**: `GROQ_API_KEY`, `GOOGLE_API_KEY`, `MONGODB_URI`

**Frontend**: `VITE_API_BASE_URL`

## Testing & Debugging

```bash
# Python tests
cd backend_lang && uv run python test_rag.py && uv run python test_classify.py

# Interactive notebooks for agent/OCR experiments
backend_lang/Notebooks/agent.ipynb
backend_lang/Notebooks/image_analyser.ipynb

# Sample case files for testing
backend_lang/Testing/Lawyer1/Case1/
```

## Common Gotchas

1. **RAG reload**: Call `reload_vector_stores()` after adding new cases
2. **Temp cleanup**: Both backends use `temp/` dirs - ensure cleanup after processing  
3. **CaseName**: LLM generates this in `save_public` tool - fallback to "Untitled Case"
4. **Telegram files**: May send duplicates - Express deduplicates by `fileId` hash
