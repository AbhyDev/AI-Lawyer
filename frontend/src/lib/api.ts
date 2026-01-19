// Frontend API Client - calls remote backend endpoints
// This file contains NO backend logic, only fetch() calls to cloud API

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://unannotated-overthickly-ceola.ngrok-free.dev";

// ============================================================================
// TYPE DEFINITIONS (matching Mongoose schema exactly)
// ============================================================================

export interface Case {
  _id: string;
  CaseID: string;
  CaseName?: string; // LLM-generated case title (e.g., "Sharma vs Singh - Loan Recovery")
  LawyerID: string;
  JudgeID: string;
  UserID: string;

  Evidence: {
    photographs_and_videos: string[];
    official_reports: string[];
    contracts_and_agreements: string[];
    financial_records: string[];
    affidavits_and_statements: string[];
    digital_communications: string[];
    call_detail_records: string[];
    forensic_reports: string[];
    expert_opinions: string[];
    physical_object_descriptions: string[];
  };

  Private: {
    evidence_summary: string;
    confidential_contacts: Array<{
      name: string;
      role: string;
    }>;
    privileged_communications: Record<string, any>;
    legal_strategy_and_notes: string;
  };

  Public: {
    court_details: {
      presiding_judge: string;
      name: string;
    };
    parties: {
      prosecution: string[];
      defendant: string[];
    };
    case_type: string;
    case_status: string;
    case_summary: string;
    timeline_of_proceedings: Array<{
      date: string;
      event: string;
    }>;
  };

  createdAt: string;
  updatedAt: string;

  // Optional legacy/compatibility fields
  title?: string;
  description?: string;
  status?: string;
  court?: string;
  category?: string;
  filingDate?: string;
}

export interface Document {
  _id: string;
  title: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  fileUrl: string;
  caseId: string;
  accessLevel: "judge" | "lawyer" | "all";
  metadata: {
    fileSize: number;
    mimeType: string;
  };

  // Convenience properties for frontend (flattened access)
  id: string; // alias for _id
  name: string; // alias for title
  uploadedAt: string; // alias for uploadDate
  size: string; // formatted fileSize from metadata
  category?: string; // optional classification category
}

export interface Analytics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingReview: number;
  avgResolutionTime: number;
  totalCasesReviewed?: number;
  pendingReviews?: number;
  completedThisMonth?: number;
  avgReviewTime?: string;
  documentsUploaded?: number;
  upcomingHearings?: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "judge" | "lawyer" | "user";
  assignedCases?: string[];
}

// ============================================================================
// API FUNCTIONS (all call remote backend)
// ============================================================================

/**
 * Fetch cases for the logged-in user
 */
export async function fetchCases(): Promise<Case[]> {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        // Not authorized, maybe token expired or not present
        // redirect to login?
        console.error("Not authorized to fetch cases.");
        // window.location.href = '/login'; // Optional: redirect to login
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.cases || [];
  } catch (error) {
    console.error("Error fetching cases:", error);
    // In case of network error, etc.
    return [];
  }
}

/**
 * Fetch analytics data for dashboard
 */
export async function fetchAnalytics(): Promise<Analytics> {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/cases/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    // Return a default empty object for now
    return {
      totalCases: 0,
      activeCases: 0,
      closedCases: 0,
      pendingReview: 0,
      avgResolutionTime: 0,
      totalCasesReviewed: 0,
      pendingReviews: 0,
      completedThisMonth: 0,
      avgReviewTime: "0 days",
      documentsUploaded: 0,
      upcomingHearings: 0,
      recentActivity: [],
    };
  }
}

/**
 * Fetch documents for a specific case
 */
export async function fetchCaseDocuments(caseId: string): Promise<Document[]> {
  try {
    // TODO: Connect to your cloud backend endpoint
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/documents`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error("Error fetching case documents:", error);
    return [];
  }
}

/**
 * Create a new case
 */
export async function createCase(caseData: Partial<Case>): Promise<Case> {
  try {
    // TODO: Connect to your cloud backend endpoint
    const response = await fetch(`${API_BASE_URL}/cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(caseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.case;
  } catch (error) {
    console.error("Error creating case:", error);
    throw error;
  }
}

/**
 * Update an existing case
 */
export async function updateCase(
  caseId: string,
  updates: Partial<Case>,
): Promise<Case> {
  try {
    // TODO: Connect to your cloud backend endpoint
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.case;
  } catch (error) {
    console.error("Error updating case:", error);
    throw error;
  }
}

/**
 * Upload a document to a case
 */
export async function uploadDocument(
  caseId: string,
  file: File,
  metadata: any,
): Promise<Document> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));

    // TODO: Connect to your cloud backend endpoint
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/documents`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.document;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

/**
 * Send a message to AI Counsel (LangGraph + RAG + Gemini Flash + BART)
 */
export async function sendAICounselMessage(
  message: string,
  context: {
    userId: string;
    userRole: string;
    caseIds?: string[];
  },
): Promise<string> {
  try {
    // TODO: Connect to LangGraph endpoint with RAG + Gemini Flash + BART integration
    const response = await fetch(`${API_BASE_URL}/ai-counsel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        message,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error sending AI counsel message:", error);
    // Return a fallback message
    return "I apologize, but I'm unable to process your request at the moment. Please try again later or contact support.";
  }
}

/**
 * Fetch a single case by its ID
 */
export async function fetchCaseById(caseId: string): Promise<Case> {
  try {
    if (!caseId) {
      throw new Error("Case ID is undefined or empty");
    }

    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.case;
  } catch (error) {
    console.error("Error fetching case data:", error);
    throw error;
  }
}
