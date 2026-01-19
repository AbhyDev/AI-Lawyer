import json
import os
from pathlib import Path
from typing import Annotated, Any, Dict, List, Sequence, TypedDict

from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.vectorstores import FAISS

# LangChain imports
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

# MongoDB imports
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

load_dotenv()

# Configuration
VECTOR_STORE_DIR = Path(__file__).resolve().parent / "vector_stores"
VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")

# Initialize embeddings model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2", model_kwargs={"device": "cpu"}
)

# Initialize LLM
# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash",
#     google_api_key=os.getenv("GEMINI_API_KEY"),
# )
from langchain_groq import ChatGroq

load_dotenv()
llm = ChatGroq(
    model="qwen/qwen3-32b",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7,
)


def get_vector_store_path(case_id: str) -> Path:
    """Get the path for a case's vector store."""
    return VECTOR_STORE_DIR / f"case_{case_id}"


async def fetch_case_from_mongodb(case_id: str) -> Dict[str, Any]:
    """
    Fetch a case document from MongoDB by CaseID.

    Args:
        case_id: The unique case identifier

    Returns:
        Dictionary containing the case data
    """
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.get_default_database()
    cases_collection = db.cases

    case_doc = await cases_collection.find_one({"CaseID": case_id})
    client.close()

    if not case_doc:
        raise ValueError(f"Case with ID {case_id} not found in MongoDB")

    return case_doc


def extract_text_from_case(case_doc: Dict[str, Any]) -> List[Document]:
    """
    Extract text from a case document and create LangChain Documents.

    Args:
        case_doc: MongoDB case document

    Returns:
        List of Document objects with text chunks and metadata
    """
    documents = []
    case_id = case_doc.get("CaseID", "unknown")

    # Extract Evidence section
    evidence = case_doc.get("Evidence", {})
    if evidence:
        for evidence_type, items in evidence.items():
            if isinstance(items, list):
                for idx, item in enumerate(items):
                    if item:  # Only process non-empty items
                        doc = Document(
                            page_content=str(item),
                            metadata={
                                "case_id": case_id,
                                "section": "Evidence",
                                "evidence_type": evidence_type,
                                "item_index": idx,
                            },
                        )
                        documents.append(doc)

    # Extract Private section
    private = case_doc.get("Private", {})
    if private:
        # Evidence summary
        if private.get("evidence_summary"):
            doc = Document(
                page_content=private["evidence_summary"],
                metadata={
                    "case_id": case_id,
                    "section": "Private",
                    "subsection": "evidence_summary",
                },
            )
            documents.append(doc)

        # Confidential contacts
        if private.get("confidential_contacts"):
            for idx, contact in enumerate(private["confidential_contacts"]):
                contact_text = json.dumps(contact, indent=2)
                doc = Document(
                    page_content=contact_text,
                    metadata={
                        "case_id": case_id,
                        "section": "Private",
                        "subsection": "confidential_contacts",
                        "contact_index": idx,
                    },
                )
                documents.append(doc)

        # Privileged communications
        if private.get("privileged_communications"):
            for key, value in private["privileged_communications"].items():
                doc = Document(
                    page_content=f"{key}: {value}",
                    metadata={
                        "case_id": case_id,
                        "section": "Private",
                        "subsection": "privileged_communications",
                        "communication_key": key,
                    },
                )
                documents.append(doc)

        # Legal strategy and notes
        if private.get("legal_strategy_and_notes"):
            doc = Document(
                page_content=private["legal_strategy_and_notes"],
                metadata={
                    "case_id": case_id,
                    "section": "Private",
                    "subsection": "legal_strategy_and_notes",
                },
            )
            documents.append(doc)

    # Extract Public section
    public = case_doc.get("Public", {})
    if public:
        # Court details
        if public.get("court_details"):
            court_text = json.dumps(public["court_details"], indent=2)
            doc = Document(
                page_content=court_text,
                metadata={
                    "case_id": case_id,
                    "section": "Public",
                    "subsection": "court_details",
                },
            )
            documents.append(doc)

        # Parties
        if public.get("parties"):
            parties_text = json.dumps(public["parties"], indent=2)
            doc = Document(
                page_content=parties_text,
                metadata={
                    "case_id": case_id,
                    "section": "Public",
                    "subsection": "parties",
                },
            )
            documents.append(doc)

        # Case type
        if public.get("case_type"):
            doc = Document(
                page_content=f"Case Type: {public['case_type']}",
                metadata={
                    "case_id": case_id,
                    "section": "Public",
                    "subsection": "case_type",
                },
            )
            documents.append(doc)

        # Case status
        if public.get("case_status"):
            doc = Document(
                page_content=f"Case Status: {public['case_status']}",
                metadata={
                    "case_id": case_id,
                    "section": "Public",
                    "subsection": "case_status",
                },
            )
            documents.append(doc)

        # Case summary
        if public.get("case_summary"):
            doc = Document(
                page_content=public["case_summary"],
                metadata={
                    "case_id": case_id,
                    "section": "Public",
                    "subsection": "case_summary",
                },
            )
            documents.append(doc)

        # Timeline of proceedings
        if public.get("timeline_of_proceedings"):
            for idx, event in enumerate(public["timeline_of_proceedings"]):
                event_text = json.dumps(event, indent=2)
                doc = Document(
                    page_content=event_text,
                    metadata={
                        "case_id": case_id,
                        "section": "Public",
                        "subsection": "timeline_of_proceedings",
                        "event_index": idx,
                    },
                )
                documents.append(doc)

    if not documents:
        raise ValueError(f"No text content could be extracted from case {case_id}")

    return documents


def create_vector_store(documents: List[Document], case_id: str) -> str:
    """
    Create and save a FAISS vector store from documents.

    Args:
        documents: List of Document objects
        case_id: Case identifier for naming the vector store

    Returns:
        Path to the saved vector store
    """
    # Create FAISS vector store
    vector_store = FAISS.from_documents(documents, embeddings)

    # Save to disk
    store_path = get_vector_store_path(case_id)
    vector_store.save_local(str(store_path))

    # Reload all vector stores to include the new one
    reload_vector_stores()

    return str(store_path)


def load_vector_store(case_id: str) -> FAISS:
    """
    Load a FAISS vector store from disk.

    Args:
        case_id: Case identifier

    Returns:
        Loaded FAISS vector store
    """
    store_path = get_vector_store_path(case_id)
    if not store_path.exists():
        raise ValueError(f"Vector store for case {case_id} not found at {store_path}")

    return FAISS.load_local(
        str(store_path), embeddings, allow_dangerous_deserialization=True
    )


def load_all_vector_stores() -> FAISS:
    """
    Load all vector stores and merge them into a single FAISS index.

    Returns:
        Merged FAISS vector store
    """
    vector_store_dirs = [
        d
        for d in VECTOR_STORE_DIR.iterdir()
        if d.is_dir() and d.name.startswith("case_")
    ]

    if not vector_store_dirs:
        raise ValueError("No vector stores found in the directory")

    # Load the first vector store
    merged_store = FAISS.load_local(
        str(vector_store_dirs[0]), embeddings, allow_dangerous_deserialization=True
    )

    # Merge the rest
    for store_dir in vector_store_dirs[1:]:
        try:
            store = FAISS.load_local(
                str(store_dir), embeddings, allow_dangerous_deserialization=True
            )
            merged_store.merge_from(store)
        except Exception as e:
            print(f"Error loading vector store from {store_dir}: {e}")
            continue

    return merged_store


# ========== LangGraph Agent for RAG Query ==========

# Global variable to store the vector store retriever
global_retriever = None


def reload_vector_stores() -> None:
    """
    Reload all vector stores and update the global retriever.
    This should be called after a new vector store is created.
    """
    global global_retriever
    try:
        global_retriever = load_all_vector_stores()
        print("Successfully reloaded all vector stores")
    except Exception as e:
        print(f"Error reloading vector stores: {e}")
        global_retriever = None


@tool
def search_vector_database(query: str, k: int = 5) -> str:
    """
    Search the vector database for relevant documents based on the query.

    Args:
        query: The search query string
        k: Number of top results to return (default: 5)

    Returns:
        A formatted string containing the relevant documents with their metadata
    """
    global global_retriever

    if global_retriever is None:
        return "Error: Vector database not initialized"

    try:
        # Perform similarity search
        results = global_retriever.similarity_search_with_score(query, k=k)

        if not results:
            return "No relevant documents found in the vector database."

        # Format results
        formatted_results = []
        for idx, (doc, score) in enumerate(results, 1):
            formatted_results.append(
                f"--- Document {idx} (Relevance Score: {score:.4f}) ---\n"
                f"Case ID: {doc.metadata.get('case_id', 'N/A')}\n"
                f"Section: {doc.metadata.get('section', 'N/A')}\n"
                f"Subsection: {doc.metadata.get('subsection', 'N/A')}\n"
                f"Content: {doc.page_content}\n"
            )

        return "\n\n".join(formatted_results)

    except Exception as e:
        return f"Error searching vector database: {str(e)}"


@tool
def search_web(query: str) -> str:
    """
    Search the web using Google to find information when the vector database has no relevant results.
    This should be used as a fallback when no case documents contain the requested information.

    Args:
        query: The search query string

    Returns:
        A formatted string containing web search results
    """
    try:
        # Initialize Tavily search
        tavily_api_key = os.getenv("TAVILY_API_KEY")
        if not tavily_api_key:
            return "Error: TAVILY_API_KEY not set. Cannot perform web search."

        search = TavilySearchResults(
            max_results=3,
            search_depth="advanced",
            include_answer=True,
            include_raw_content=False,
        )

        # Perform search
        results = search.invoke({"query": query})

        if not results:
            return "No web results found for the query."

        # Format results
        formatted_results = ["Web Search Results:\n"]
        for idx, result in enumerate(results, 1):
            formatted_results.append(
                f"--- Result {idx} ---\n"
                f"Title: {result.get('title', 'N/A')}\n"
                f"URL: {result.get('url', 'N/A')}\n"
                f"Content: {result.get('content', 'N/A')}\n"
            )

        return "\n".join(formatted_results)

    except Exception as e:
        return f"Error performing web search: {str(e)}"


class RAGAgentState(TypedDict):
    """State for the RAG agent."""

    messages: Annotated[Sequence[BaseMessage], add_messages]
    query: str


# Tools for the agent
rag_tools = [search_vector_database, search_web]
llm_with_tools = llm.bind_tools(tools=rag_tools)


def rag_agent_node(state: RAGAgentState) -> RAGAgentState:
    """
    Main agent node that processes the query and decides whether to use tools.
    """
    query = state["query"]

    system_prompt = SystemMessage(
        content="""
You are an expert legal AI assistant with access to a comprehensive vector database of legal case documents and web search capabilities.

Your role is to:
1. Understand the user's query about legal cases
2. First, ALWAYS use the `search_vector_database` tool to find relevant information from the case documents
3. If the vector database returns "No relevant documents found", then use the `search_web` tool to search Google for the information
4. Analyze the retrieved information carefully
5. Provide a clear, comprehensive, and well-structured answer

Search Strategy:
- ALWAYS start with `search_vector_database` to check case documents first
- If no relevant documents are found (the tool returns "No relevant documents found"), immediately use `search_web` to find information from the internet
- You may call the search_vector_database tool multiple times with different queries if needed
- When using information from case documents, always cite the case IDs and sections
- When using information from web search, mention that it's from external sources

Provide your final answer in a professional legal assistant tone, ensuring accuracy and clarity. If you had to use web search because no case documents were relevant, mention this clearly in your response.
    """
    )

    user_prompt = HumanMessage(content=f"Query: {query}")

    # Invoke LLM with tools
    response = llm_with_tools.invoke([system_prompt, user_prompt] + state["messages"])

    return {"messages": [response]}


def router(state: RAGAgentState) -> str:
    """
    Router function to decide next step based on the last message.
    """
    last_message = state["messages"][-1]

    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "call_tool"
    else:
        return "end"


# Build the RAG agent graph
rag_graph = StateGraph(RAGAgentState)
tool_node = ToolNode(tools=rag_tools)

rag_graph.add_node("agent", rag_agent_node)
rag_graph.add_node("tools", tool_node)

rag_graph.add_edge(START, "agent")
rag_graph.add_edge("tools", "agent")
rag_graph.add_conditional_edges("agent", router, {"call_tool": "tools", "end": END})

rag_app = rag_graph.compile()


def query_rag_system(query: str) -> str:
    """
    Query the RAG system with a user question.

    Args:
        query: User's question

    Returns:
        AI assistant's response
    """
    global global_retriever

    if global_retriever is None:
        # Load all vector stores
        try:
            global_retriever = load_all_vector_stores()
        except Exception as e:
            return f"Error: Could not load vector stores. {str(e)}"

    # Run the agent
    result = rag_app.invoke({"messages": [], "query": query})

    # Extract the final response
    final_message = result["messages"][-1]
    if isinstance(final_message, AIMessage):
        return final_message.content

    return str(final_message)
