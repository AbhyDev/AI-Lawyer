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
 * @returns {Promise<{filePath: string, buffer: Buffer, fileId: string}>} - The local file path, buffer, and original file_id
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
      fileId: fileId, // Include the original Telegram file_id for deduplication
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
    formData.append("CaseID", data.caseID);
    formData.append("LawyerID", data.lawyerID);
    formData.append("JudgeID", data.judgeID);
    formData.append("UserID", data.userID);

    console.log(
      `Preparing to send ${files.evidences?.length || 0} evidence files and ${
        files.fullDocs?.length || 0
      } full doc files`,
    );

    // Add evidence files - all with the same field name "Evidence"
    // This allows FastAPI to receive them as a list
    if (files.evidences && files.evidences.length > 0) {
      console.log("Evidence files to send:");
      files.evidences.forEach((file, index) => {
        console.log(
          `  [${index}] fileId: ${file.fileId}, fileName: ${file.fileName}, originalName: ${file.originalName}`,
        );
      });

      files.evidences.forEach((file, index) => {
        try {
          const filename =
            file.originalName || file.fileName || `evidence_${index}`;
          if (file.filePath && fs.existsSync(file.filePath)) {
            console.log(
              `Attaching evidence file: ${filename} from ${file.filePath}`,
            );
            formData.append(
              "Evidence", // Same field name for all evidence files
              fs.createReadStream(file.filePath),
              {
                filename: filename,
              },
            );
          } else if (file.buffer) {
            // buffer may be a Buffer or arraybuffer; ensure Buffer
            const buf = Buffer.isBuffer(file.buffer)
              ? file.buffer
              : Buffer.from(file.buffer);
            console.log(`Attaching evidence file from buffer: ${filename}`);
            formData.append("Evidence", buf, {
              filename: filename,
            });
          } else {
            console.warn(
              `Evidence file missing: ${file.filePath} and no buffer available - skipping`,
            );
          }
        } catch (err) {
          console.error("Error attaching evidence file to formdata:", err);
        }
      });
    }

    // Add full document files - all with the same field name "Full_docs"
    // This allows FastAPI to receive them as a list
    if (files.fullDocs && files.fullDocs.length > 0) {
      console.log("Full doc files to send:");
      files.fullDocs.forEach((file, index) => {
        console.log(
          `  [${index}] fileId: ${file.fileId}, fileName: ${file.fileName}, originalName: ${file.originalName}`,
        );
      });

      files.fullDocs.forEach((file, index) => {
        try {
          const filename =
            file.originalName || file.fileName || `full_doc_${index}`;
          if (file.filePath && fs.existsSync(file.filePath)) {
            console.log(
              `Attaching full doc file: ${filename} from ${file.filePath}`,
            );
            formData.append(
              "Full_docs", // Same field name for all full doc files
              fs.createReadStream(file.filePath),
              {
                filename: filename,
              },
            );
          } else if (file.buffer) {
            const buf = Buffer.isBuffer(file.buffer)
              ? file.buffer
              : Buffer.from(file.buffer);
            console.log(`Attaching full doc file from buffer: ${filename}`);
            formData.append("Full_docs", buf, {
              filename: filename,
            });
          } else {
            console.warn(
              `Full doc missing: ${file.filePath} and no buffer available - skipping`,
            );
          }
        } catch (err) {
          console.error("Error attaching full_doc file to formdata:", err);
        }
      });
    }

    // Send to processing server (FastAPI /classify endpoint)
    const processingServerUrl =
      process.env.PROCESSING_SERVER_URL || "http://localhost:8000/classify";

    console.log(`Sending case data to: ${processingServerUrl}`);
    const response = await axios.post(processingServerUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log("Successfully sent data to processing server");
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
