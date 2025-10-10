import express from "express";
import { handleWebhook } from "../controllers/telegramBotController.js";

const router = express.Router();

// Telegram webhook endpoint
router.post("/webhook", handleWebhook);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Telegram bot is running",
  });
});

export default router;
