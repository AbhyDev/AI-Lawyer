import { Router } from "express";
import { getCasesForUser, getCaseById, getAnalytics } from "../controllers/caseController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.route("/").get(verifyJWT, getCasesForUser);
router.route("/analytics").get(verifyJWT, getAnalytics);
router.route("/:id").get(verifyJWT, getCaseById);

export default router;
