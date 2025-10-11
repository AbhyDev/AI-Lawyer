import { Router } from "express";
import { queryRAG } from "../controllers/ragController.js";

const router = Router();

// POST /api/rag - Query the RAG system
router.route("/").post(queryRAG);

export default router;