# RAG System Setup Guide

## Prerequisites

1. **Python 3.13+** (as specified in pyproject.toml)
2. **MongoDB** running with case data
3. **Google Gemini API Key**

## Setup Steps

### 1. Install Dependencies

Navigate to the backend_lang directory and install dependencies:

```bash
cd backend_lang

# Using uv (recommended)
uv sync

# OR using pip
pip install -e .
```

This will install all required packages:

- `pymongo` & `motor` - MongoDB connectivity
- `fastapi` - Web framework
- `langchain`, `langgraph` - LLM orchestration
- `langchain-google-genai` - Google Gemini integration
- `langchain-huggingface` - Embedding models
- `sentence-transformers` - Text embeddings
- `faiss-cpu` - Vector database
- And more...

### 2. Configure Environment Variables

Create a `.env` file in the `backend_lang` directory:

```bash
# Create .env file
touch .env
```

Add the following configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai_lawyer

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**:

- Replace `ai_lawyer` with your actual MongoDB database name
- Get your Gemini API key from: https://aistudio.google.com/app/apikey

### 3. Verify MongoDB Connection

Ensure MongoDB is running and has case data:

```bash
# Check if MongoDB is running
mongosh

# Connect to your database
use ai_lawyer

# Check if cases collection exists and has data
db.cases.findOne()
```

You should see case documents with the structure:

```json
{
  "CaseID": "CASE001",
  "LawyerID": "lawyer123",
  "JudgeID": "judge456",
  "UserID": "user789",
  "Evidence": { ... },
  "Private": { ... },
  "Public": { ... }
}
```

### 4. Start the FastAPI Server

```bash
# Make sure you're in the backend_lang directory
cd backend_lang

# Start the server
uvicorn main:app --reload --port 8000

# Or with custom host/port
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 5. Test the Endpoints

#### Option A: Using cURL

**Load a case**:

```bash
curl -X POST http://localhost:8000/rag/load \
  -H "Content-Type: application/json" \
  -d '{"caseID": "CASE001"}'
```

**Query the system**:

```bash
curl -X POST http://localhost:8000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the parties involved?"}'
```

#### Option B: Using the Test Script

```bash
# Load a case
python test_rag.py load CASE001

# Interactive mode (recommended for testing)
python test_rag.py interactive
```

#### Option C: Using API Documentation

1. Open your browser: http://localhost:8000/docs
2. Try the `/rag/load` and `/rag/query` endpoints interactively

## Typical Workflow

### 1. Load Cases into Vector Stores

First, load all your cases into vector stores:

```bash
python test_rag.py load CASE001
python test_rag.py load CASE002
python test_rag.py load CASE003
```

Or use a script to load all cases:

```python
import requests

# Get all case IDs from your database
case_ids = ["CASE001", "CASE002", "CASE003", ...]

for case_id in case_ids:
    response = requests.post(
        "http://localhost:8000/rag/load",
        json={"caseID": case_id}
    )
    print(f"Loaded {case_id}: {response.json()}")
```

### 2. Query the System

Once vector stores are created, you can query:

```bash
python test_rag.py interactive
```

Then ask questions like:

- "What are the key evidences in these cases?"
- "Who are the defendants?"
- "Summarize the legal strategies"
- "What is the status of case CASE001?"
- "Compare evidence between cases"

## Directory Structure After Setup

```
backend_lang/
├── main.py                 # FastAPI app with endpoints
├── rag.py                  # RAG implementation
├── agent.py               # Existing classification agent
├── test_rag.py            # Test script
├── RAG_README.md          # RAG documentation
├── SETUP_RAG.md           # This file
├── .env                   # Your environment variables (create this)
├── pyproject.toml         # Dependencies
├── vector_stores/         # Created automatically
│   ├── case_CASE001/
│   │   ├── index.faiss
│   │   └── index.pkl
│   └── case_CASE002/
│       ├── index.faiss
│       └── index.pkl
└── temp/                  # Temporary files
```

## Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'pymongo'`

**Solution**: Install dependencies

```bash
uv sync
# or
pip install pymongo motor fastapi langchain langgraph langchain-google-genai
```

### Issue: `ValueError: Case with ID CASE001 not found in MongoDB`

**Solution**:

1. Verify MongoDB is running: `mongosh`
2. Check the database name in your `MONGODB_URI`
3. Verify the case exists: `db.cases.findOne({CaseID: "CASE001"})`

### Issue: `Error: Could not load vector stores. No vector stores found`

**Solution**:

1. Load at least one case first using `/rag/load`
2. Check that `vector_stores/` directory exists and has case folders

### Issue: `401 Unauthorized` or Gemini API errors

**Solution**:

1. Verify your `GEMINI_API_KEY` in `.env`
2. Check your API key is valid at https://aistudio.google.com/app/apikey
3. Ensure you have API quota remaining

### Issue: Server won't start - Port already in use

**Solution**:

```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process or use a different port
uvicorn main:app --reload --port 8001
```

### Issue: Embeddings model download is slow

**Solution**: The first time you run the system, it will download the embedding model (~90MB). This is normal and only happens once. Subsequent runs will be fast.

## Performance Tips

1. **Load cases during off-peak hours**: Loading creates embeddings which can be CPU-intensive

2. **Use GPU if available**: Modify `rag.py` to use GPU for embeddings:

```python
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cuda'}  # Change from 'cpu' to 'cuda'
)
```

3. **Batch loading**: Load multiple cases in parallel for faster setup

4. **Vector store caching**: Vector stores are saved to disk and only loaded once per query session

## Next Steps

1. ✅ Setup complete - System is ready to use
2. Load your cases into vector stores
3. Start querying!
4. Integrate with your frontend (see API documentation)
5. Consider implementing additional features from RAG_README.md

## Integration with Frontend

Your frontend can call these endpoints:

```typescript
// Load a case
const loadCase = async (caseID: string) => {
  const response = await fetch("http://localhost:8000/rag/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseID }),
  });
  return response.json();
};

// Query the RAG system
const queryRAG = async (query: string) => {
  const response = await fetch("http://localhost:8000/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  return data.response;
};
```

## Support

For detailed API documentation, see: `RAG_README.md`

For issues or questions:

1. Check the troubleshooting section above
2. Review the RAG_README.md documentation
3. Check FastAPI logs for detailed error messages
