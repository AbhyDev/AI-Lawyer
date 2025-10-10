// Frontend API Client - calls remote backend endpoints
// This file contains NO backend logic, only fetch() calls to cloud API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ============================================================================
// TYPE DEFINITIONS (matching Mongoose schema exactly)
// ============================================================================

export interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  status: "Filed" | "Under Review" | "Hearing Scheduled" | "Judgment Pending" | "Closed" | "Active" | "Pending Review";
  filingDate: string;
  lastUpdated: string;
  assignedJudge?: string;
  assignedLawyer?: string;
  citizens: string[];
  public: {
    caseNumber: string;
    title: string;
    category: string;
    status: string;
    filingDate: string;
    court: string;
    nextHearing?: string;
    parties: {
      petitioner: string;
      respondent: string;
    };
    timeline: Array<{
      date: string;
      event: string;
      description: string;
    }>;
  };
  private: {
    evidence: Array<{
      _id: string;
      title: string;
      type: string;
      uploadedBy: string;
      uploadDate: string;
      fileUrl: string;
      accessLevel: "judge" | "lawyer" | "all";
      metadata: {
        fileSize: number;
        mimeType: string;
      };
    }>;
    internalNotes: Array<{
      author: string;
      role: string;
      content: string;
      timestamp: string;
    }>;
    aiAnalysis?: {
      summary: string;
      keyPoints: string[];
      suggestedActions: string[];
      similarCases: string[];
      lastAnalyzed: string;
    };
  };
  
  // Convenience properties for frontend (flattened access)
  id: string;  // alias for _id
  court: string;  // alias for public.court
  nextHearing?: string;  // alias for public.nextHearing
  parties?: { petitioner: string; respondent: string };  // alias for public.parties
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
  id: string;  // alias for _id
  name: string;  // alias for title
  uploadedAt: string;  // alias for uploadDate
  size: string;  // formatted fileSize from metadata
  category?: string;  // optional classification category
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
    // TODO: Connect to your cloud backend endpoint
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/documents`);
    
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
export async function updateCase(caseId: string, updates: Partial<Case>): Promise<Case> {
  try {
    // TODO: Connect to your cloud backend endpoint
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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
export async function uploadDocument(caseId: string, file: File, metadata: any): Promise<Document> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));
    
    // TODO: Connect to your cloud backend endpoint
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/documents`, {
      method: "POST",
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
  }
): Promise<string> {
  try {
    // TODO: Connect to LangGraph endpoint with RAG + Gemini Flash + BART integration
    const response = await fetch(`${API_BASE_URL}/ai-counsel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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




