from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List
import json
from agent import classified_data
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow all origins/methods/headers for broader accessibility
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CaseData(BaseModel):
    case_id: str = Field(..., alias="CaseID")
    lawyer_id: str = Field(..., alias="LawyerID")
    judge_id: str = Field(..., alias="JudgeID")
    evidence: List[str]
    full_docs: List[str] = Field(..., alias="Full_docs")

@app.post("/classify")
async def classify_case_data(case_data: CaseData):
    # The classified_data function expects a JSON string,
    # so we convert the Pydantic model back to a JSON string.
    input_json_string = case_data.model_dump_json(by_alias=True)
    
    # Call the existing function
    result_json_string = classified_data(input_json_string)
    
    # The function returns a JSON string, so we parse it back to a dict
    # to be sent as a proper JSON response by FastAPI.
    return json.loads(result_json_string)
