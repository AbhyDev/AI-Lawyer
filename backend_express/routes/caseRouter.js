import { Router } from "express";
import { getCasesForUser } from "../controllers/caseController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.route("/").get(verifyJWT, getCasesForUser);

export default router;
