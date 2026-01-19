import hashlib
import json
import shutil
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import classified_data

# Import RAG functions
from rag import (
    create_vector_store,
    extract_text_from_case,
    fetch_case_from_mongodb,
    global_retriever,
    query_rag_system,
    reload_vector_stores,
)

app = FastAPI()

# Allow all origins/methods/headers for broader accessibility
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TEMP_DIR = Path(__file__).resolve().parent / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)


def cleanup_temp_dir():
    """
    Clear all files from the temp directory.
    Recreates the directory after deletion to ensure it exists for next request.
    """
    try:
        if TEMP_DIR.exists():
            # Remove all files in temp directory
            for item in TEMP_DIR.iterdir():
                try:
                    if item.is_file():
                        item.unlink()
                        print(f"Deleted temp file: {item.name}")
                    elif item.is_dir():
                        shutil.rmtree(item)
                        print(f"Deleted temp directory: {item.name}")
                except Exception as e:
                    print(f"Error deleting {item}: {e}")
            print(
                f"Cleaned up temp directory: {len(list(TEMP_DIR.iterdir()))} items removed"
            )
        # Ensure temp directory exists
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"Error cleaning up temp directory: {e}")


@app.post("/classify")
async def classify_case_data(
    CaseID: str = Form(...),
    LawyerID: str = Form(...),
    JudgeID: str = Form(...),
    UserID: Optional[str] = Form(None),
    Evidence: List[UploadFile] = File(default_factory=list),
    Full_docs: List[UploadFile] = File(default_factory=list),
):
    """
    Accepts multipart/form-data with fields:
      - CaseID, LawyerID, JudgeID, UserID (form fields)
      - Evidence (multiple files, all with same field name)
      - Full_docs (multiple files, all with same field name)

    Saves uploaded files to backend_lang/temp and builds an input JSON string
    where `evidence` and `Full_docs` are lists of saved file paths. Calls
    agent.classified_data with that JSON string and returns the parsed result.
    """

    saved_evidence_paths = []
    saved_full_paths = []
    seen_hashes = set()  # Track file hashes to prevent duplicates

    print(
        f"Received {len(Evidence)} evidence files and {len(Full_docs)} full doc files"
    )
    print(f"Evidence files: {[f.filename for f in Evidence]}")
    print(f"Full doc files: {[f.filename for f in Full_docs]}")

    # Helper to save an UploadFile to TEMP_DIR and return the absolute path
    async def _save_file(upload: UploadFile) -> str:
        # Read file content (only once)
        data = await upload.read()

        # Validate that we actually have content
        if not data:
            print(f"Warning: Empty file received: {upload.filename}")
            return None

        # Calculate hash to detect duplicates
        file_hash = hashlib.md5(data).hexdigest()

        # Check if we've already saved this exact file
        if file_hash in seen_hashes:
            print(f"Skipping duplicate file: {upload.filename} (hash: {file_hash})")
            return None

        # Add to seen hashes
        seen_hashes.add(file_hash)

        # Generate unique filename with original name
        fname = f"{uuid4().hex}_{Path(upload.filename).name}"
        out_path = TEMP_DIR / fname

        # Write to disk
        out_path.write_bytes(data)
        print(f"Saved file: {fname} ({len(data)} bytes, hash: {file_hash[:8]}...)")
        return str(out_path)

    # Save evidence files
    for idx, upload in enumerate(Evidence):
        try:
            print(
                f"Processing evidence file {idx + 1}/{len(Evidence)}: {upload.filename}"
            )
            saved_path = await _save_file(upload)
            if saved_path:  # Only append if file was actually saved
                saved_evidence_paths.append(saved_path)
        except Exception as e:
            print(f"Error saving evidence file {upload.filename}: {e}")
        finally:
            # ensure file gets closed
            await upload.close()

    # Save full docs files
    for idx, upload in enumerate(Full_docs):
        try:
            print(
                f"Processing full doc file {idx + 1}/{len(Full_docs)}: {upload.filename}"
            )
            saved_path = await _save_file(upload)
            if saved_path:  # Only append if file was actually saved
                saved_full_paths.append(saved_path)
        except Exception as e:
            print(f"Error saving full doc file {upload.filename}: {e}")
        finally:
            await upload.close()

    # Build the input JSON expected by classified_data
    input_dict = {
        "CaseID": CaseID,
        "LawyerID": LawyerID,
        "JudgeID": JudgeID,
        "UserID": UserID,
        # agent.classified_data expects 'evidence' (lowercase) and 'Full_docs' (capital F)
        "evidence": saved_evidence_paths,
        "Full_docs": saved_full_paths,
    }

    input_json_string = json.dumps(input_dict)

    # Process the case data
    result_json_string = classified_data(input_json_string)
    result = json.loads(result_json_string)

    # Clean up temp directory before returning
    print("Processing complete. Cleaning up temporary files...")
    cleanup_temp_dir()
    print("Cleanup complete.")

    return result


# ========== RAG Endpoints ==========


class RAGLoadRequest(BaseModel):
    """Request model for /rag/load endpoint."""

    caseID: str


class RAGLoadResponse(BaseModel):
    """Response model for /rag/load endpoint."""

    success: bool
    message: str
    case_id: str
    vector_store_path: str = None
    documents_count: int = 0


@app.post("/rag/load", response_model=RAGLoadResponse)
async def load_case_to_vector_store(request: RAGLoadRequest):
    """
    Fetch a case document from MongoDB and create a vector store for it.

    Args:
        request: Contains the caseID to load

    Returns:
        Success status, message, and vector store path
    """
    try:
        case_id = request.caseID

        # Fetch case from MongoDB
        print(f"Fetching case {case_id} from MongoDB...")
        case_doc = await fetch_case_from_mongodb(case_id)

        # Extract text and create documents
        print(f"Extracting text from case {case_id}...")
        documents = extract_text_from_case(case_doc)
        print(f"Extracted {len(documents)} documents from case {case_id}")

        # Create vector store
        print(f"Creating vector store for case {case_id}...")
        vector_store_path = create_vector_store(documents, case_id)
        print(f"Vector store created at: {vector_store_path}")

        return RAGLoadResponse(
            success=True,
            message=f"Successfully created vector store for case {case_id}",
            case_id=case_id,
            vector_store_path=vector_store_path,
            documents_count=len(documents),
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /rag/load: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


class RAGReloadResponse(BaseModel):
    """Response model for /rag/reload endpoint."""

    success: bool
    message: str
    vector_stores_count: int = 0


@app.post("/rag/reload", response_model=RAGReloadResponse)
async def reload_rag_vector_stores():
    """
    Manually reload all vector stores.
    This should be called if the RAG query doesn't see newly created vector stores.

    Returns:
        Success status and count of loaded vector stores
    """
    try:
        reload_vector_stores()

        # Count vector stores
        from rag import VECTOR_STORE_DIR
        vector_store_dirs = [
            d for d in VECTOR_STORE_DIR.iterdir()
            if d.is_dir() and d.name.startswith("case_")
        ]

        return RAGReloadResponse(
            success=True,
            message="Successfully reloaded all vector stores",
            vector_stores_count=len(vector_store_dirs),
        )
    except Exception as e:
        print(f"Error in /rag/reload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reload vector stores: {str(e)}")


class RAGQueryRequest(BaseModel):
    """Request model for /rag/query endpoint."""

    query: str


class RAGQueryResponse(BaseModel):
    """Response model for /rag/query endpoint."""

    response: str


@app.post("/rag/query", response_model=RAGQueryResponse)
async def query_rag(request: RAGQueryRequest):
    """
    Query the RAG system with a question. The system will:
    1. Load all vector stores
    2. Use an LLM with tool calling to search the vector database
    3. Return a comprehensive answer

    Args:
        request: Contains the query string

    Returns:
        AI assistant's response based on the vector database
    """
    query = request.query

    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        print(f"Processing RAG query: {query}")

        # Query the RAG system
        response = query_rag_system(query)

        return RAGQueryResponse(response=response)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /rag/query: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
