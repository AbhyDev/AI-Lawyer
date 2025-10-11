import "dotenv/config";
import express from "express";
import { connectToMongoDB } from "./utils/mongoUtils.js";
import { connectToRedis } from "./utils/redisUtils.js";
import authRouter from "./routes/authRouter.js";
import telegramRouter from "./routes/telegramRouter.js";
import caseRouter from "./routes/caseRouter.js";
import ragRouter from "./routes/ragRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());

// Routes
app.use("/auth", authRouter);
app.use("/telegram", telegramRouter);
app.use("/api/cases", caseRouter);
app.use("/api/rag", ragRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AI Lawyer Backend Server is running",
    endpoints: {
      auth: "/auth",
      telegram: "/telegram",
      cases: "/api/cases",
      rag: "/api/rag",
    },
  });
});

async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Connect to databases
  await connectToMongoDB();
  await connectToRedis();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Available endpoints:");
    console.log(`  - GET  /`);
    console.log(`  - POST /telegram/webhook`);
    console.log(`  - GET  /telegram/health`);
    console.log(`  - *    /auth/*`);
  });
}

startServer();
