import { Router } from "express";
import { getCasesForUser } from "../controllers/caseController.js";
import { verifyJWT } from "./authRouter.js";

const router = Router();

router.route("/").get(verifyJWT, getCasesForUser);

export default router;
