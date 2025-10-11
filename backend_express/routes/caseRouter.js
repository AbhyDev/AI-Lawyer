import { Router } from "express";
import { getCasesForUser, getCaseById, getAnalytics, createCase, updateCase } from "../controllers/caseController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.route("/")
  .get(verifyJWT, getCasesForUser)
  .post(verifyJWT, createCase);

router.route("/analytics").get(verifyJWT, getAnalytics);

router.route("/:id")
  .get(verifyJWT, getCaseById)
  .put(verifyJWT, updateCase);

export default router;
