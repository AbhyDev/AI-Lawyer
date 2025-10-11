"""
Test script for RAG endpoints
This script demonstrates how to use the /rag/load and /rag/query endpoints
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = (
    "http://localhost:8000"  # Adjust if your FastAPI server runs on a different port
)


def test_load_case(case_id: str) -> Dict[str, Any]:
    """
    Test the /rag/load endpoint to create a vector store for a case.

    Args:
        case_id: The CaseID to load from MongoDB

    Returns:
        Response from the API
    """
    url = f"{BASE_URL}/rag/load"
    payload = {"caseID": case_id}

    print(f"\n{'='*60}")
    print(f"Testing /rag/load with CaseID: {case_id}")
    print(f"{'='*60}")

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()

        data = response.json()
        print("\n✅ Success!")
        print(json.dumps(data, indent=2))
        return data

    except requests.exceptions.HTTPError as e:
        print(f"\n❌ HTTP Error: {e}")
        print(f"Response: {e.response.text}")
        return None
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None


def test_query_rag(query: str) -> str:
    """
    Test the /rag/query endpoint to query the RAG system.

    Args:
        query: The question to ask

    Returns:
        Response from the AI assistant
    """
    url = f"{BASE_URL}/rag/query"
    payload = {"query": query}

    print(f"\n{'='*60}")
    print(f"Testing /rag/query")
    print(f"Query: {query}")
    print(f"{'='*60}")

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()

        data = response.json()
        print("\n✅ Success!")
        print("\n--- AI Assistant Response ---")
        print(data.get("response", "No response received"))
        print("\n" + "-" * 60)
        return data.get("response", "")

    except requests.exceptions.HTTPError as e:
        print(f"\n❌ HTTP Error: {e}")
        print(f"Response: {e.response.text}")
        return ""
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return ""


def run_comprehensive_test():
    """
    Run a comprehensive test of the RAG system.
    """
    print("\n" + "=" * 60)
    print("RAG System Comprehensive Test")
    print("=" * 60)

    # Step 1: Load multiple cases (if you have CaseIDs in your MongoDB)
    # Replace these with actual CaseIDs from your database
    test_case_ids = [
        "CASE001",  # Replace with actual CaseID
        "CASE002",  # Replace with actual CaseID
    ]

    print("\n--- Step 1: Loading Cases into Vector Stores ---")
    for case_id in test_case_ids:
        result = test_load_case(case_id)
        if result:
            print(f"✓ Successfully loaded case {case_id}")

    # Step 2: Query the RAG system
    print("\n--- Step 2: Querying the RAG System ---")

    test_queries = [
        "What are the key evidences in these cases?",
        "Who are the parties involved in the cases?",
        "What is the current status of the cases?",
        "Summarize the legal strategy and notes",
        "What are the timeline of proceedings?",
    ]

    for query in test_queries:
        test_query_rag(query)
        print("\n" + "-" * 60)


def interactive_mode():
    """
    Interactive mode for testing the RAG query endpoint.
    """
    print("\n" + "=" * 60)
    print("RAG System Interactive Query Mode")
    print("=" * 60)
    print("Type 'exit' or 'quit' to end the session")
    print("-" * 60)

    while True:
        try:
            query = input("\nEnter your query: ").strip()

            if query.lower() in ["exit", "quit", "q"]:
                print("\nExiting interactive mode...")
                break

            if not query:
                print("Please enter a valid query.")
                continue

            test_query_rag(query)

        except KeyboardInterrupt:
            print("\n\nExiting interactive mode...")
            break
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    import sys

    print(
        """
╔═══════════════════════════════════════════════════════════════╗
║                   AI Lawyer RAG System Test                   ║
╚═══════════════════════════════════════════════════════════════╝
    """
    )

    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "load" and len(sys.argv) > 2:
            # Load a specific case
            case_id = sys.argv[2]
            test_load_case(case_id)

        elif command == "query" and len(sys.argv) > 2:
            # Query with a specific question
            query = " ".join(sys.argv[2:])
            test_query_rag(query)

        elif command == "interactive" or command == "i":
            # Interactive mode
            interactive_mode()

        elif command == "full":
            # Run comprehensive test
            run_comprehensive_test()

        else:
            print("Usage:")
            print("  python test_rag.py load <CaseID>")
            print("  python test_rag.py query <your question>")
            print("  python test_rag.py interactive")
            print("  python test_rag.py full")

    else:
        print("\nNo command specified. Available options:")
        print("  1. Load a case: python test_rag.py load <CaseID>")
        print("  2. Query: python test_rag.py query <your question>")
        print("  3. Interactive mode: python test_rag.py interactive")
        print("  4. Full test: python test_rag.py full")
        print("\nStarting interactive mode by default...\n")
        interactive_mode()
