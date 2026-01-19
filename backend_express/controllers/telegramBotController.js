import { v4 as uuidv4 } from "uuid";
import { getSession, setSession } from "../utils/redisUtils.js";
import {
  sendMessage,
  downloadTelegramFile,
  sendToProcessingServer,
  cleanupTempFiles,
} from "../services/telegramService.js";
import { BOT_STATES, BOT_MESSAGES } from "../constants/botStates.js";
import { Case } from "../schemas/caseSchema.js";
import { loadCaseToRAG } from "./ragController.js";

/**
 * Initialize or get session from Redis
 */
async function getOrCreateSession(chatId) {
  let session = await getSession(chatId);

  if (!session) {
    session = {
      state: BOT_STATES.WAITING_FOR_GREETING,
      lawyerID: null,
      judgeID: null,
      userID: null,
      evidences: [],
      fullDocs: [],
      caseID: null,
    };
    await setSession(chatId, session);
  }

  return session;
}

/**
 * Update session in Redis
 */
async function updateSession(chatId, updates) {
  const session = await getSession(chatId);
  const updatedSession = { ...session, ...updates };
  await setSession(chatId, updatedSession);
  return updatedSession;
}

/**
 * Validate if text is a single word (username)
 */
function isSingleWord(text) {
  return text && /^\w+$/.test(text.trim());
}

/**
 * Handle greeting state
 */
async function handleGreeting(chatId, text) {
  const lowerText = text.toLowerCase().trim();

  if (lowerText === "hi" || lowerText === "hello") {
    await sendMessage(chatId, BOT_MESSAGES.WELCOME);
    await sendMessage(chatId, BOT_MESSAGES.REQUEST_LAWYER_ID);
    await updateSession(chatId, {
      state: BOT_STATES.WAITING_FOR_LAWYER_ID,
    });
  } else {
    await sendMessage(chatId, BOT_MESSAGES.INVALID_GREETING);
  }
}

/**
 * Handle lawyer ID input
 */
async function handleLawyerId(chatId, text) {
  if (!isSingleWord(text)) {
    await sendMessage(chatId, BOT_MESSAGES.INVALID_USERNAME);
    return;
  }

  await updateSession(chatId, {
    lawyerID: text.trim(),
    state: BOT_STATES.WAITING_FOR_JUDGE_ID,
  });
  await sendMessage(chatId, BOT_MESSAGES.REQUEST_JUDGE_ID);
}

/**
 * Handle judge ID input
 */
async function handleJudgeId(chatId, text) {
  if (!isSingleWord(text)) {
    await sendMessage(chatId, BOT_MESSAGES.INVALID_USERNAME);
    return;
  }

  await updateSession(chatId, {
    judgeID: text.trim(),
    state: BOT_STATES.WAITING_FOR_USER_ID,
  });
  await sendMessage(chatId, BOT_MESSAGES.REQUEST_USER_ID);
}

/**
 * Handle user ID input
 */
async function handleUserId(chatId, text) {
  if (!isSingleWord(text)) {
    await sendMessage(chatId, BOT_MESSAGES.INVALID_USERNAME);
    return;
  }

  await updateSession(chatId, {
    userID: text.trim(),
    state: BOT_STATES.WAITING_FOR_EVIDENCES,
  });
  await sendMessage(chatId, BOT_MESSAGES.REQUEST_EVIDENCES);
}

/**
 * Handle evidence documents
 */
async function handleEvidences(chatId, text, document) {
  const session = await getSession(chatId);

  if (text && text.trim().toUpperCase() === "DONE") {
    if (session.evidences.length === 0) {
      await sendMessage(
        chatId,
        "⚠️ Please send at least one evidence document before typing 'DONE'.",
      );
      return;
    }

    await updateSession(chatId, {
      state: BOT_STATES.WAITING_FOR_FULL_DOCS,
    });
    await sendMessage(chatId, BOT_MESSAGES.REQUEST_FULL_DOCS);
    return;
  }

  if (document) {
    try {
      // Check if this file_id has already been processed
      const existingFile = session.evidences.find(
        (f) => f.fileId === document.file_id,
      );

      if (existingFile) {
        console.log(
          `Skipping duplicate evidence file: ${document.file_id} (${document.file_name})`,
        );
        await sendMessage(
          chatId,
          "⚠️ This file has already been uploaded. Send a different file or type 'DONE'.",
        );
        return;
      }

      const file = await downloadTelegramFile(document.file_id);
      const evidences = [...session.evidences, file];
      await updateSession(chatId, { evidences });
      await sendMessage(chatId, BOT_MESSAGES.DOCUMENT_RECEIVED);
    } catch (error) {
      console.error("Error downloading evidence:", error);
      await sendMessage(
        chatId,
        "❌ Failed to download the document. Please try again.",
      );
    }
  } else {
    await sendMessage(
      chatId,
      "Please send a document or type 'DONE' when finished.",
    );
  }
}

/**
 * Handle full case documents
 */
async function handleFullDocs(chatId, text, document) {
  const session = await getSession(chatId);

  if (text && text.trim().toUpperCase() === "DONE") {
    if (session.fullDocs.length === 0) {
      await sendMessage(
        chatId,
        "⚠️ Please send at least one case document before typing 'DONE'.",
      );
      return;
    }

    await updateSession(chatId, {
      state: BOT_STATES.PROCESSING,
    });

    // Process the case
    await processCase(chatId);
    return;
  }

  if (document) {
    try {
      // Check if this file_id has already been processed
      const existingFile = session.fullDocs.find(
        (f) => f.fileId === document.file_id,
      );

      if (existingFile) {
        console.log(
          `Skipping duplicate full doc file: ${document.file_id} (${document.file_name})`,
        );
        await sendMessage(
          chatId,
          "⚠️ This file has already been uploaded. Send a different file or type 'DONE'.",
        );
        return;
      }

      const file = await downloadTelegramFile(document.file_id);
      const fullDocs = [...session.fullDocs, file];
      await updateSession(chatId, { fullDocs });
      await sendMessage(chatId, BOT_MESSAGES.DOCUMENT_RECEIVED);
    } catch (error) {
      console.error("Error downloading document:", error);
      await sendMessage(
        chatId,
        "❌ Failed to download the document. Please try again.",
      );
    }
  } else {
    await sendMessage(
      chatId,
      "Please send a document or type 'DONE' when finished.",
    );
  }
}

/**
 * Process the case and send to server
 */
async function processCase(chatId) {
  try {
    const session = await getSession(chatId);
    await sendMessage(chatId, BOT_MESSAGES.PROCESSING_CASE);

    // Generate case ID
    const caseID = uuidv4();

    // Prepare data
    const caseData = {
      caseID,
      lawyerID: session.lawyerID,
      judgeID: session.judgeID,
      userID: session.userID,
    };

    // Prepare files
    const files = {
      evidences: session.evidences,
      fullDocs: session.fullDocs,
    };

    // Send to processing server
    const response = await sendToProcessingServer(caseData, files);

    // Store the response in MongoDB
    const newCase = new Case({
      CaseID: caseID,
      LawyerID: session.lawyerID,
      JudgeID: session.judgeID,
      UserID: session.userID,
      ...response, // Merge the response from processing server
    });

    await newCase.save();

    // Load the case into the RAG vector store for AI-powered search
    // This is non-blocking and won't affect response time
    loadCaseToRAG(caseID)
      .then((success) => {
        if (success) {
          console.log(
            `[Telegram] Case ${caseID} successfully loaded into RAG system`,
          );
        } else {
          console.error(
            `[Telegram] Failed to load case ${caseID} into RAG system`,
          );
        }
      })
      .catch((error) => {
        console.error(
          `[Telegram] Error in RAG loading for case ${caseID}:`,
          error,
        );
      });

    // Send success message
    const summaryMessage = `
${BOT_MESSAGES.SUCCESS}

📋 **Case Summary:**
🆔 Case ID: ${caseID}
👨‍⚖️ Lawyer: ${session.lawyerID}
⚖️ Judge: ${session.judgeID}
👤 Client: ${session.userID}
📎 Evidence Documents: ${session.evidences.length}
📄 Case Documents: ${session.fullDocs.length}

Your case has been successfully created and sent for processing!
    `.trim();

    await sendMessage(chatId, summaryMessage);

    // Clean up temporary files
    cleanupTempFiles([...session.evidences, ...session.fullDocs]);

    // Update session to completed and reset
    await updateSession(chatId, {
      state: BOT_STATES.COMPLETED,
      caseID,
    });

    // Reset session for new case
    setTimeout(async () => {
      await setSession(chatId, {
        state: BOT_STATES.WAITING_FOR_GREETING,
        lawyerID: null,
        judgeID: null,
        userID: null,
        evidences: [],
        fullDocs: [],
        caseID: null,
      });
      await sendMessage(
        chatId,
        "You can start a new case by sending 'hi' or 'hello'.",
      );
    }, 2000);
  } catch (error) {
    console.error("Error processing case:", error);
    await sendMessage(chatId, BOT_MESSAGES.ERROR);

    // Clean up files on error
    const session = await getSession(chatId);
    if (session) {
      cleanupTempFiles([...session.evidences, ...session.fullDocs]);
    }

    // Reset session
    await updateSession(chatId, {
      state: BOT_STATES.WAITING_FOR_GREETING,
    });
  }
}

/**
 * Main webhook handler
 */
export async function handleWebhook(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(200).send("No message in webhook");
    }

    const chatId = message.from.id;
    const text = message.text;
    const document = message.document;

    // Get or create session
    const session = await getOrCreateSession(chatId);

    // State machine
    switch (session.state) {
      case BOT_STATES.WAITING_FOR_GREETING:
        if (text) {
          await handleGreeting(chatId, text);
        }
        break;

      case BOT_STATES.WAITING_FOR_LAWYER_ID:
        if (text) {
          await handleLawyerId(chatId, text);
        }
        break;

      case BOT_STATES.WAITING_FOR_JUDGE_ID:
        if (text) {
          await handleJudgeId(chatId, text);
        }
        break;

      case BOT_STATES.WAITING_FOR_USER_ID:
        if (text) {
          await handleUserId(chatId, text);
        }
        break;

      case BOT_STATES.WAITING_FOR_EVIDENCES:
        await handleEvidences(chatId, text, document);
        break;

      case BOT_STATES.WAITING_FOR_FULL_DOCS:
        await handleFullDocs(chatId, text, document);
        break;

      case BOT_STATES.PROCESSING:
        await sendMessage(chatId, "Please wait while we process your case...");
        break;

      case BOT_STATES.COMPLETED:
        await sendMessage(
          chatId,
          "Your case is complete. Send 'hi' or 'hello' to start a new case.",
        );
        break;

      default:
        await updateSession(chatId, {
          state: BOT_STATES.WAITING_FOR_GREETING,
        });
        await sendMessage(chatId, BOT_MESSAGES.INVALID_GREETING);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
}
