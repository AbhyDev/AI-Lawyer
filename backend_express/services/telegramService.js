import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.TELEGRAM_BASE_URL;
const TEMP_DIR = path.join(__dirname, "..", "temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Send a request to Telegram API
 */
export async function sendTelegramRequest(route, params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}/${route}`, {
      params: params,
    });
    return response.data;
  } catch (error) {
    console.error("Telegram API Error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send a message to a Telegram chat
 */
export async function sendMessage(chatId, text) {
  return await sendTelegramRequest("sendMessage", {
    chat_id: chatId,
    text: text,
  });
}

/**
 * Download a file from Telegram
 * @param {string} fileId - The Telegram file_id
 * @returns {Promise<{filePath: string, buffer: Buffer}>} - The local file path and buffer
 */
export async function downloadTelegramFile(fileId) {
  try {
    // Get file path from Telegram
    const fileInfo = await sendTelegramRequest("getFile", {
      file_id: fileId,
    });

    const filePath = fileInfo.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${
      process.env.TELEGRAM_BASE_URL.split("/bot")[1]
    }/${filePath}`;

    // Download the file
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data);
    const fileName = `${uuidv4()}_${path.basename(filePath)}`;
    const localFilePath = path.join(TEMP_DIR, fileName);

    // Save file locally
    fs.writeFileSync(localFilePath, buffer);

    return {
      filePath: localFilePath,
      buffer: buffer,
      fileName: fileName,
      originalName: path.basename(filePath),
    };
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

/**
 * Send files to another server
 * @param {Object} data - The data to send
 * @param {Array} files - Array of file objects with path and buffer
 * @returns {Promise<Object>} - The response from the server
 */
export async function sendToProcessingServer(data, files = []) {
  try {
    const formData = new FormData();

    // Add metadata
    formData.append("caseID", data.caseID);
    formData.append("lawyerID", data.lawyerID);
    formData.append("judgeID", data.judgeID);
    formData.append("userID", data.userID);

    // Add evidence files
    if (files.evidences && files.evidences.length > 0) {
      files.evidences.forEach((file, index) => {
        formData.append(
          `evidence_${index}`,
          fs.createReadStream(file.filePath),
          {
            filename: file.originalName || file.fileName,
          }
        );
      });
    }

    // Add full document files
    if (files.fullDocs && files.fullDocs.length > 0) {
      files.fullDocs.forEach((file, index) => {
        formData.append(
          `full_doc_${index}`,
          fs.createReadStream(file.filePath),
          {
            filename: file.originalName || file.fileName,
          }
        );
      });
    }

    // Send to processing server (placeholder URL for now)
    const processingServerUrl =
      process.env.PROCESSING_SERVER_URL || "http://localhost:8000/process";

    const response = await axios.post(processingServerUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending to processing server:", error.message);
    throw error;
  }
}

/**
 * Clean up temporary files
 */
export function cleanupTempFiles(files = []) {
  files.forEach((file) => {
    try {
      if (file.filePath && fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (error) {
      console.error("Error cleaning up file:", error);
    }
  });
}
