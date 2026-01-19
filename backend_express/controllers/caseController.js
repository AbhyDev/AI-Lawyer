import { Case } from "../schemas/caseSchema.js";
import { asyncHandler } from "./authController.js";
import { loadCaseToRAG } from "./ragController.js";

export const getCasesForUser = asyncHandler(async (req, res) => {
  const userId = req.user.username; // from verifyJWT middleware

  const cases = await Case.find({
    $or: [
      { UserID: userId },
      { LawyerID: userId },
      { JudgeID: userId },
    ],
  });

  if (!cases || cases.length === 0) {
    return res.status(200).json({ message: "No cases found for this user.", cases: [] });
  }

  res.status(200).json({ cases });
});

export const getCaseById = asyncHandler(async (req, res) => {
  console.log("Fetching case by ID...");
  const caseId = req.params.id;
  const userId = req.user.username;
  console.log("Case ID:", caseId);
  console.log("User ID:", userId);

  // In a real app, you should validate the caseId is a valid ObjectId
  const caseData = await Case.findById(caseId);
  console.log("Case Data:", caseData);

  if (!caseData) {
    return res.status(404).json({ message: "Case not found" });
  }

  // Check if the user has access to this case
  const hasAccess = 
    caseData.UserID === userId ||
    caseData.LawyerID === userId ||
    caseData.JudgeID === userId;

  // For judges, they can see all cases, so we can bypass this check
  if (req.user.role === 'judge') {
    return res.status(200).json({ case: caseData });
  }

  if (!hasAccess) {
    return res.status(403).json({ message: "Unauthorized to view this case" });
  }

  res.status(200).json({ case: caseData });
});

export const createCase = asyncHandler(async (req, res) => {
  try {
    const caseData = req.body;
    
    // Save to MongoDB
    const newCase = await Case.create(caseData);
    
    // Load the case into the RAG vector store
    // This is non-blocking and won't affect response time
    loadCaseToRAG(newCase.CaseID)
      .then(success => {
        if (success) {
          console.log(`Case ${newCase._id} successfully loaded into RAG system`);
        } else {
          console.error(`Failed to load case ${newCase._id} into RAG system`);
        }
      })
      .catch(error => {
        console.error(`Error in RAG loading for case ${newCase._id}:`, error);
      });
    
    return res.status(201).json({ 
      success: true, 
      message: "Case created successfully", 
      caseId: newCase._id 
    });
  } catch (error) {
    console.error("Error creating case:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error creating case", 
      error: error.message 
    });
  }
});

export const updateCase = asyncHandler(async (req, res) => {
  try {
    const caseId = req.params.id;
    const caseData = req.body;
    
    const updatedCase = await Case.findByIdAndUpdate(
      caseId, 
      caseData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedCase) {
      return res.status(404).json({ 
        success: false, 
        message: "Case not found" 
      });
    }
    
    // Reload the case into RAG system since it was updated
    loadCaseToRAG(caseId)
      .then(success => {
        console.log(`Case ${caseId} reloaded into RAG system: ${success ? 'success' : 'failed'}`);
      })
      .catch(error => {
        console.error(`Error in RAG reloading for updated case ${caseId}:`, error);
      });
    
    return res.status(200).json({ 
      success: true, 
      message: "Case updated successfully", 
      case: updatedCase 
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error updating case", 
      error: error.message 
    });
  }
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.username;
  const userRole = req.user.role;

  let cases = [];
  if (userRole === 'judge') {
    // For judges, get all cases
    cases = await Case.find({});
  } else {
    cases = await Case.find({
      $or: [
        { UserID: userId },
        { LawyerID: userId },
      ],
    });
  }

  const totalCases = cases.length;
  const activeCases = cases.filter(c => ["Active", "Under Review", "Hearing Scheduled"].includes(c.status)).length;
  const closedCases = cases.filter(c => c.status === "Closed").length;
  const pendingReview = cases.filter(c => c.status === "Pending Review").length;
  const upcomingHearings = cases.filter(c => c.Public?.nextHearing && new Date(c.Public.nextHearing) > new Date()).length;

  const analytics = {
    totalCases,
    activeCases,
    closedCases,
    pendingReview,
    upcomingHearings,
    // The following are just placeholders for now
    avgResolutionTime: 0,
    totalCasesReviewed: 0,
    pendingReviews: pendingReview,
    completedThisMonth: 0,
    avgReviewTime: "0 days",
    documentsUploaded: 0,
    recentActivity: [],
  };

  res.status(200).json({ analytics });
});
