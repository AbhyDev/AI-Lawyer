import "dotenv/config";
import express from "express";
import axios from "axios";
import { connectToMongoDB } from "./utils/mongoUtils.js";
import { connectToRedis } from "./utils/redisUtils.js";

const app = express();
const BASE_URL = process.env.TELEGRAM_BASE_URL;

async function sendTelegramRequest(route, params = {}) {
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

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/webhook", (req, res) => {
  //   console.log(req.body);
  const { message } = req.body;
  const text = message.text;
  const file_id = message.document?.file_id;
  const chat_id = message.chat.id;
  if (text) {
    sendTelegramRequest("sendMessage", {
      chat_id: chat_id,
      text: `You said: ${text}`,
    });
  }
  if (file_id) {
    sendTelegramRequest("sendMessage", {
      chat_id: chat_id,
      text: `You sent a document with file_id: ${file_id}`,
    });
  }
  res.send("Webhook received!");
});

async function startServer() {
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  await connectToMongoDB();
  await connectToRedis();
}

startServer();
