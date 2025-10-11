import axios from "axios";

// FastAPI backend URL - configure via environment variable
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

/**
 * Query the RAG system via FastAPI
 * @route POST /api/rag
 * @access Protected (requires JWT)
 */
export const queryRAG = async (req, res) => {
  try {
    const { query } = req.body;

    // Validate query
    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Query is required and must be a non-empty string",
      });
    }

    console.log(`[RAG] Forwarding query to FastAPI: "${query}"`);

    // Call FastAPI /rag/query endpoint
    const response = await axios.post(
      `${FASTAPI_URL}/rag/query`,
      { query: query.trim() },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout for LLM processing
      }
    );

    // Return the response from FastAPI
    return res.status(200).json({
      success: true,
      response: response.data.response,
    });
  } catch (error) {
    console.error("[RAG] Error querying FastAPI:", error.message);

    // Handle different types of errors
    if (error.response) {
      // FastAPI returned an error response
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.detail || "Error from RAG service",
      });
    } else if (error.code === "ECONNREFUSED") {
      // FastAPI server is not running
      return res.status(503).json({
        success: false,
        error:
          "RAG service is unavailable. Please ensure FastAPI server is running.",
      });
    } else if (error.code === "ETIMEDOUT") {
      // Request timeout
      return res.status(504).json({
        success: false,
        error: "RAG query timed out. The query may be too complex.",
      });
    } else {
      // Other errors
      return res.status(500).json({
        success: false,
        error: "Internal server error while processing RAG query",
      });
    }
  }
};

/**
 * Load a case into the RAG vector store (internal function)
 * This is called after a case is saved to MongoDB
 * @param {string} caseID - The case ID to load into vector store
 * @returns {Promise<boolean>} - Success status
 */
export const loadCaseToRAG = async (caseID) => {
  try {
    console.log(`[RAG] Loading case ${caseID} into vector store...`);

    const response = await axios.post(
      `${FASTAPI_URL}/rag/load`,
      { caseID },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // 2 minute timeout for vector store creation
      }
    );

    console.log(
      `[RAG] Successfully loaded case ${caseID}:`,
      response.data.message
    );
    console.log(`[RAG] Documents indexed: ${response.data.documents_count}`);

    return true;
  } catch (error) {
    console.error(
      `[RAG] Error loading case ${caseID} into vector store:`,
      error.message
    );

    if (error.response) {
      console.error(`[RAG] FastAPI error details:`, error.response.data);
    }

    // Don't throw error - just log it
    // This prevents case creation from failing if RAG loading fails
    return false;
  }
};