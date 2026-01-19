import os
from typing import TypedDict, Annotated, List, Literal, Sequence, NotRequired, Dict
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import torch
from PIL import Image
from transformers import AutoTokenizer, AutoModelForCausalLM
import mimetypes
from analyse import analyse
import fitz  # PyMuPDF
from legal_classifier import classify_legal_text  # ML model for case type classification

load_dotenv()
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=os.getenv("GEMINI_API_KEY"),
)

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    evidence: str
    Full_docs: str
    
class EvidenceClass(TypedDict, total=False):
    photographs_and_videos: NotRequired[List[str]]
    official_reports: NotRequired[List[str]]
    contracts_and_agreements: NotRequired[List[str]]
    financial_records: NotRequired[List[str]]
    affidavits_and_statements: NotRequired[List[str]]
    digital_communications: NotRequired[List[str]]
    call_detail_records: NotRequired[List[str]]
    forensic_reports: NotRequired[List[str]]
    expert_opinions: NotRequired[List[str]]
    physical_object_descriptions: NotRequired[List[str]]
 
# storage for tool-collected data (avoid name collision with tool objects)
evidence_store: EvidenceClass = {}

@tool
def save_evidence(evidences: EvidenceClass) -> str:
    """
    Use this tool to save a categorized summary of all evidence found in the documents.

    Analyze the provided text to identify different types of evidence and place a textual
    description or summary of each piece into the appropriate list within the EvidenceClass object.

    Args:
        evidences: A structured object for categorizing evidence.
            - photographs_and_videos: Describe any mentioned photos, CCTV footage, or video recordings.
            - official_reports: Summarize findings from Police Reports (FIRs), medical reports, etc.
            - contracts_and_agreements: Note any mentioned contracts, deeds, or agreements.
            - digital_communications: Add transcripts or summaries of emails, WhatsApp chats, or SMS.
            - forensic_reports: Describe findings from DNA, fingerprint, or ballistics reports.
    """
    global evidence_store
    evidence_store = evidences
    return "Successfully Added the Evidences to Database"

class PublicInfoClass(TypedDict, total=False):
    court_details: NotRequired[Dict[str, str]] #court location and court information(judges and all)
    parties: NotRequired[Dict[str, List[str]]] #primary litigants like Plaintiff vs. Defendant
    case_type: NotRequired[str] #like civil case
    case_status: NotRequired[str] 
    case_summary: NotRequired[str]
    timeline_of_proceedings: NotRequired[List[Dict[str, str]]]
public_store: PublicInfoClass = {}

@tool 
def save_public(public_info: PublicInfoClass)->str:
    """
    Use this tool to save all publicly available information about a legal case.

    This tool captures key details like case numbers, court information, involved parties,
    and a summary of the proceedings. Populate all fields of the PublicInfoClass object
    based on the text provided.

    Args:
        public_info: A structured object containing all public details.
            - court_details: Identify the court name and presiding judge.
            - parties: List the names of the plaintiff/petitioner and defendant/respondent.
            - case_type: Classify the case into one of the following categories: [Civil, Criminal, Constitutional, etc.].
            - case_status: Determine if the case is Pending, Disposed, etc.
            - case_summary: Write a in depth, neutral summary of the publically available case facts.
            - timeline_of_proceedings: Create a log of important dates and events.
    Returns:
        A success message indicating that the publicly releasable information was added to the database.
    """
    global public_store
    public_store = public_info
    return "Successfully Added the public information to Database"

class PersonDetail(TypedDict, total=False):
    """Holds detailed personal information for private use."""
    role: NotRequired[str]               # e.g., "Client", "Witness", "Opposing Party"
    name: NotRequired[str]
    phone_number: NotRequired[str]
    email_address: NotRequired[str]
    address: NotRequired[str]
    
class PrivateInfoClass(TypedDict, total=False):
    evidence_summary: NotRequired[str]
    confidential_contacts: NotRequired[List[PersonDetail]]
    privileged_communications: NotRequired[Dict[str, str]]  #Key is betwen whom communication happened, value is communication summary
    legal_strategy_and_notes: NotRequired[str]   # Internal memos, argument outlines, case strategy, legal research notes.

private_store: PrivateInfoClass = {}

@tool
def save_private(private_info: PrivateInfoClass) -> str:
    """
    Use this tool to save confidential and privileged information not for public disclosure.

    This tool is for sensitive data like client details, internal legal strategy, and
    summaries of attorney-client communications.

    Args:
        private_info: A structured object for all confidential information.
            - evidence_summary: Populate this using the detailed EvidenceClass structure.
            - confidential_contacts: Extract detailed personal info (name, role, contact details) for clients, witnesses, etc.
            - privileged_communications: Record summaries of confidential talks. The dictionary key should be the parties involved (e.g., "Lawyer-Client John Doe"), and the value should be a summary of the communication.
            - legal_strategy_and_notes: Summarize internal memos, argument outlines, and case strategy notes.
    """
    global private_store
    private_store = private_info
    return "Successfully Added the private information to Database"

tools = [save_evidence, save_public, save_private]
llm_withtools = llm.bind_tools(tools=tools)

def ClassyAgent(state: AgentState)->AgentState:
    evidence_text = state['evidence']
    full_docs_text = state['Full_docs']
    SystemPrompt = SystemMessage(content=f"""
You are an expert legal assistant AI. 🤖

Your primary function is to meticulously analyze provided legal texts, extract key information, and categorize it using your available tools. You will be given two distinct sets of text: one containing documents identified as evidence, and another containing the rest of the general case files.

Your workflow is as follows:
1.  **Analyze Everything:** First, thoroughly review all the text from both the evidence and the general documents to get a complete picture of the case.
2.  **Use All Tools:** Your goal is to accurately populate and call all three of your tools: `save_public_case_information`, `save_evidence_summary`, and `save_private_case_information`.
3.  **Tool Calls Only:** Do not provide summaries or answer questions in plain text. Your entire response must be the necessary tool calls to structure the extracted data.
4.  **Be Comprehensive:** Ensure you extract all relevant details to populate every possible field in the schemas for each tool. Do not leave any relevant information behind.
    """)

    HumanPrompt = HumanMessage(content= f"""
Here are the digitized texts from a legal case file. The content is separated into evidence-specific documents and general case documents.

Please process all the information and categorize it using your tools.

---
## Evidence Documents
---
{evidence_text}

---
## General Case Documents
---
{full_docs_text}
    """)
    response = llm_withtools.invoke([SystemPrompt, HumanPrompt] + state['messages'])

    return {"messages" : [response] }

def router(state: AgentState)->str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "call_tool"
    else:
        return "end"
    
graph = StateGraph(AgentState)
Tooler = ToolNode(tools=tools)

graph.add_node("ClassyAgent", ClassyAgent)
graph.add_node("Tooler", Tooler)

graph.add_edge(START, "ClassyAgent")
graph.add_edge("Tooler", "ClassyAgent")
graph.add_conditional_edges(
    "ClassyAgent",
    router,
    {
        "call_tool" : "Tooler",
        "end" : END
    }
)
app = graph.compile()

import fitz
import mimetypes
import re

def process_file(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        return None

    elif mime_type.startswith("image/"):
        return analyse(file_path)

    elif mime_type == "application/pdf":
        pdf_document = fitz.open(file_path)
        pages_text = []

        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            text = page.get_text("text")
            if not text.strip():
                pix = page.get_pixmap()
                img_path = f"temp_page_{page_num}.png"
                pix.save(img_path)
                text = analyse(img_path)

            pages_text.append(text)

        pdf_document.close()

        full_text = "\n".join(pages_text)
        processed_text = re.sub(r' {2,}', ' ', full_text)
        processed_text = re.sub(r'(\s*\n\s*){2,}', '\n', processed_text)
        final_text = processed_text.strip()

        return final_text

    else:
        return None
    
def preprocess_data(evidence_file, Rest_docs_files):
    evidence_files = evidence_file
    rest_files = Rest_docs_files
    evi_len = len(evidence_files)
    rest_len = len(rest_files)
    evi_dict = {}
    rest_dict = {}
    for i in range(evi_len):
        #i is 1 document
        processed_data = process_file(evidence_files[i])
        if processed_data is not None:
            evi_dict[i] = processed_data
    for j in range(rest_len):
        processed_data = process_file(rest_files[j])
        if processed_data is not None:
            rest_dict[j] = processed_data
    string_dig_evidence = " ".join(evi_dict.values())
    string_dig_rest = " ".join(rest_dict.values())
    return evi_dict, rest_dict, string_dig_evidence, string_dig_rest

def classified_data(incoming_data: str)->str:
    Database = json.loads(incoming_data)
    dig_evidence = str
    dig_rest = str
    global evidence
    global public
    global privateinfo
    #dig_evidence and dig_rest are doc type byt digital, while string_dig_evidence, string_dig_rest are combined + in single string
    dig_evidence, dig_rest, string_dig_evidence, string_dig_rest = preprocess_data(Database['evidence'], Database['Full_docs'])
    
    # Run ML classifier FIRST (showcase for academic purposes)
    combined_text = string_dig_evidence + " " + string_dig_rest
    ml_result = classify_legal_text(combined_text)
    print(f"[ML Classifier] Prediction: {ml_result['type']} (confidence: {ml_result['confidence']*100:.1f}%)")
    
    # Then run LangGraph agent for full extraction
    app.invoke({"messages":[HumanMessage(content="Start the Analysis")],
        "evidence" : string_dig_evidence, 
        "Full_docs" : string_dig_rest
    })
    # use the storage variables that are plain Python structures (not tool objects)
    
    finalised = {
        "CaseID" : Database["CaseID"],
        "LawyerID": Database["LawyerID"],
        "JudgeID" : Database["JudgeID"],
        "Evidence" : evidence_store,
        "Public" : public_store,
        "Private" : private_store,
    }
    return json.dumps(finalised)