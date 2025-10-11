# RAG System Documentation

## Overview

The RAG (Retrieval-Augmented Generation) system allows you to:

1. Load case documents from MongoDB into vector databases
2. Query all cases using natural language with AI-powered semantic search

## Architecture

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

## Features

- **Per-Case Vector Stores**: Each case gets its own vector database
- **Intelligent Merging**: All vector stores are merged for comprehensive search
- **LLM Tool Calling**: Uses LangGraph with tool calling for intelligent retrieval
- **Semantic Search**: Uses HuggingFace embeddings for meaningful similarity search
- **Comprehensive Extraction**: Extracts evidence, private, and public sections from cases

## Installation

1. Install dependencies:

```bash
cd backend_lang
uv sync
# or
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/your_database
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Start the FastAPI server:

```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### 1. `/rag/load` - Load Case into Vector Store

**Method**: POST

**Request Body**:

```json
{
  "caseID": "CASE001"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Successfully created vector store for case CASE001",
  "case_id": "CASE001",
  "vector_store_path": "/path/to/vector_stores/case_CASE001",
  "documents_count": 25
}
```

**What it does**:

1. Fetches the case document from MongoDB using the CaseID
2. Extracts all text from:
   - Evidence section (all evidence types)
   - Private section (evidence summary, contacts, communications, strategy)
   - Public section (court details, parties, summary, timeline)
3. Creates LangChain Document objects with metadata
4. Generates embeddings using `sentence-transformers/all-MiniLM-L6-v2`
5. Creates a FAISS vector store
6. Saves it to disk at `vector_stores/case_{caseID}/`

**Error Responses**:

- `404`: Case not found in MongoDB
- `500`: Internal server error (connection issues, extraction errors, etc.)

### 2. `/rag/query` - Query the RAG System

**Method**: POST

**Request Body**:

```json
{
  "query": "What are the key evidences in these cases?"
}
```

**Response**:

```json
{
  "response": "Based on the case documents, the key evidences include..."
}
```

**What it does**:

1. Loads all vector stores from `vector_stores/` directory
2. Merges them into a single comprehensive vector database
3. Initializes a LangGraph agent with:
   - Google Gemini LLM (gemini-2.5-flash)
   - `search_vector_database` tool
4. The agent:
   - Analyzes the query
   - Calls the search tool to find relevant documents
   - Receives similarity search results with metadata
   - Synthesizes a comprehensive answer
5. Returns the final response

**Error Responses**:

- `400`: Empty query
- `404`: No vector stores found
- `500`: Internal server error

## Usage Examples

### Using cURL

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
  -d '{"query": "What are the parties involved in the cases?"}'
```

### Using Python

```python
import requests

# Load a case
response = requests.post(
    "http://localhost:8000/rag/load",
    json={"caseID": "CASE001"}
)
print(response.json())

# Query the system
response = requests.post(
    "http://localhost:8000/rag/query",
    json={"query": "Summarize the legal strategy"}
)
print(response.json()["response"])
```

### Using the Test Script

```bash
# Load a case
python test_rag.py load CASE001

# Query the system
python test_rag.py query "What are the evidences?"

# Interactive mode
python test_rag.py interactive

# Run full test suite
python test_rag.py full
```

## Technical Details

### Vector Database

- **Library**: FAISS (Facebook AI Similarity Search)
- **Embeddings Model**: `sentence-transformers/all-MiniLM-L6-v2`
  - Dimension: 384
  - Fast and efficient for semantic similarity
- **Storage**: Local disk storage in `vector_stores/` directory
- **Format**: FAISS index files + pickle files for document metadata

### LLM Integration

- **Model**: Google Gemini 2.5 Flash
- **Framework**: LangGraph for agent workflows
- **Tool Calling**: Uses function calling to search the vector database
- **Features**:
  - Multiple tool calls per query (if needed)
  - Context-aware responses
  - Cites sources (case IDs and sections)

### Document Structure

Each MongoDB case document is broken down into multiple LangChain Documents:

```python
Document(
    page_content="...",  # The actual text
    metadata={
        "case_id": "CASE001",
        "section": "Evidence" | "Private" | "Public",
        "subsection": "evidence_type" | "court_details" | etc.,
        "item_index": 0,  # For list items
        ...
    }
)
```

## File Structure

```
backend_lang/
├── main.py                 # FastAPI app with RAG endpoints
├── rag.py                  # RAG logic (vector stores, agent)
├── test_rag.py            # Test script
├── RAG_README.md          # This file
├── vector_stores/         # Vector database storage
│   ├── case_CASE001/
│   │   ├── index.faiss
│   │   └── index.pkl
│   ├── case_CASE002/
│   │   ├── index.faiss
│   │   └── index.pkl
│   └── ...
└── ...
```

## Workflow Example

1. **Load Cases**:

```bash
# Load multiple cases
python test_rag.py load CASE001
python test_rag.py load CASE002
python test_rag.py load CASE003
```

2. **Query the System**:

```bash
# Ask questions
python test_rag.py query "What are common evidence types across all cases?"
python test_rag.py query "Who are the defendants in these cases?"
python test_rag.py query "Summarize the legal strategies"
```

3. **Interactive Session**:

```bash
python test_rag.py interactive

# Then ask questions interactively:
> What cases involve financial records?
> What are the court details?
> Summarize confidential communications
> exit
```

## Troubleshooting

### Issue: "Case not found in MongoDB"

- Verify the CaseID exists in your MongoDB database
- Check your `MONGODB_URI` in `.env`
- Ensure the MongoDB server is running

### Issue: "No vector stores found"

- Run `/rag/load` for at least one case before querying
- Check that `vector_stores/` directory exists and has case folders

### Issue: "Import errors for motor/pymongo"

- Run `uv sync` or `pip install -r requirements.txt`
- Ensure all dependencies are installed

### Issue: "LLM not responding"

- Verify `GEMINI_API_KEY` is set in `.env`
- Check your API key is valid and has quota
- Check internet connection

## Advanced Features

### Custom Search Parameters

You can modify the search in `rag.py`:

```python
# Change number of results
results = global_retriever.similarity_search_with_score(query, k=10)  # Default is 5

# Use different search methods
results = global_retriever.max_marginal_relevance_search(query, k=5)
```

### Multiple Tool Calls

The LLM agent can call the search tool multiple times:

```
User Query: "Compare evidence between cases"
├─ Tool Call 1: search_vector_database("evidence Case1")
├─ Tool Call 2: search_vector_database("evidence Case2")
└─ Final Answer: Synthesizes comparison
```

### Metadata Filtering

You can filter by metadata (requires code modification):

```python
# Search only in Evidence sections
results = retriever.similarity_search(
    query,
    k=5,
    filter={"section": "Evidence"}
)
```

## Performance Considerations

- **Loading Time**: ~2-5 seconds per case (depends on document size)
- **Query Time**: ~3-10 seconds (includes LLM processing)
- **Memory**: ~100-500MB per case in memory (when loaded)
- **Disk Space**: ~10-50MB per case (FAISS index)

## Future Enhancements

- [ ] Implement metadata filtering in queries
- [ ] Add support for deleting vector stores
- [ ] Implement incremental updates (update existing vector stores)
- [ ] Add batch loading endpoint
- [ ] Implement vector store versioning
- [ ] Add support for multiple embedding models
- [ ] Implement caching for frequently asked queries
- [ ] Add analytics/logging for queries

## Support

For issues or questions, refer to:

- Main project README: `/README.md`
- LangChain docs: https://python.langchain.com/
- FAISS docs: https://faiss.ai/
