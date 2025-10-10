from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json
from agent import classified_data
from pathlib import Path
from uuid import uuid4
import hashlib
import shutil

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
