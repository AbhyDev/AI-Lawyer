/**
 * Bot states for the Telegram bot state machine
 */
export const BOT_STATES = {
  WAITING_FOR_GREETING: "WAITING_FOR_GREETING",
  WAITING_FOR_LAWYER_ID: "WAITING_FOR_LAWYER_ID",
  WAITING_FOR_JUDGE_ID: "WAITING_FOR_JUDGE_ID",
  WAITING_FOR_USER_ID: "WAITING_FOR_USER_ID",
  WAITING_FOR_EVIDENCES: "WAITING_FOR_EVIDENCES",
  WAITING_FOR_FULL_DOCS: "WAITING_FOR_FULL_DOCS",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
};

/**
 * Messages sent by the bot
 */
export const BOT_MESSAGES = {
  WELCOME:
    "👋 Welcome! I'm here to help you with your legal case documentation.\n\nPlease provide the following information:",
  REQUEST_LAWYER_ID: "📝 Please send the Lawyer's Username (single word):",
  REQUEST_JUDGE_ID: "⚖️ Please send the Judge's Username (single word):",
  REQUEST_USER_ID: "👤 Please send the Client's Username (single word):",
  REQUEST_EVIDENCES:
    "📎 Please send evidence documents for the court case.\n\nYou can send multiple documents. When you're done, send 'DONE'.",
  REQUEST_FULL_DOCS:
    "📄 Please send other case documents.\n\nYou can send multiple documents. When you're done, send 'DONE'.",
  PROCESSING_CASE: "⏳ Processing your case data and sending to the server...",
  SUCCESS: "✅ Case created successfully!",
  ERROR:
    "❌ An error occurred while processing your request. Please try again.",
  INVALID_GREETING:
    "Please start by sending 'hi' or 'hello' to begin the process.",
  INVALID_USERNAME: "Username must be a single word. Please try again:",
  DOCUMENT_RECEIVED:
    "✅ Document received. Send more documents or type 'DONE' when finished.",
};
