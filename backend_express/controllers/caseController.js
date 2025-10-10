import { Case } from "../schemas/caseSchema.js";
import { asyncHandler } from "./authController.js";

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
