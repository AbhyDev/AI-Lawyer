import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";

// Environment variable check
const requiredEnvVars = [
  "MONGODB_URI",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missingEnvVars.join(
      ", "
    )}`
  );
  process.exit(1);
}
import { connectToMongoDB } from "./utils/mongoUtils.js";
import { connectToRedis } from "./utils/redisUtils.js";
import authRouter from "./routes/authRouter.js";
import telegramRouter from "./routes/telegramRouter.js";
import caseRouter from "./routes/caseRouter.js";
import ragRouter from "./routes/ragRouter.js";
import cors from "cors";

const app = express();
app.use(cookieParser());

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${
        req.originalUrl
      } - Response Body:`
    );
    try {
      // Try to parse and log JSON for better readability
      console.log(JSON.parse(body));
    } catch (e) {
      // If not JSON, log as is
      console.log(body);
    }
    originalSend.apply(res, arguments);
  };
  next();
});

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
