# Telegram Bot for AI Lawyer - Setup & Usage

## Overview

This Telegram bot is designed to help users submit legal case documentation through a conversational interface. It uses Redis for state management and MongoDB for data persistence.

## Features

- **Conversational Interface**: Step-by-step guidance for case submission
- **State Management**: Redis-based session management with chat_id as session key
- **Document Handling**: Supports multiple evidence and case document uploads
- **Case Processing**: Automatic case ID generation and data forwarding to processing server
- **MongoDB Integration**: Stores processed case data in MongoDB

## Bot Workflow

### State Flow

```
1. WAITING_FOR_GREETING
   ↓ (user sends "hi" or "hello")
2. WAITING_FOR_LAWYER_ID
   ↓ (user sends lawyer username)
3. WAITING_FOR_JUDGE_ID
   ↓ (user sends judge username)
4. WAITING_FOR_USER_ID
   ↓ (user sends client username)
5. WAITING_FOR_EVIDENCES
   ↓ (user uploads documents, then sends "DONE")
6. WAITING_FOR_FULL_DOCS
   ↓ (user uploads documents, then sends "DONE")
7. PROCESSING
   ↓ (bot processes and sends to server)
8. COMPLETED
   ↓ (bot resets, ready for new case)
```

### User Journey

1. **Start Conversation**

   - User: `hi` or `hello`
   - Bot: Sends welcome message

2. **Provide Usernames**

   - Bot asks for Lawyer's username (single word)
   - Bot asks for Judge's username (single word)
   - Bot asks for Client's username (single word)

3. **Upload Evidence Documents**

   - User uploads evidence files (as many as needed)
   - User sends `DONE` when finished

4. **Upload Case Documents**

   - User uploads case documents (as many as needed)
   - User sends `DONE` when finished

5. **Processing**

   - Bot generates unique Case ID (UUID)
   - Bot downloads all documents
   - Bot sends data to processing server
   - Bot stores response in MongoDB
   - Bot sends success message with case summary

6. **Ready for Next Case**
   - User can start a new case by sending `hi` or `hello`

## Project Structure

```
backend_express/
├── constants/
│   └── botStates.js           # Bot state constants and messages
├── controllers/
│   ├── authController.js      # Authentication controller
│   └── telegramBotController.js # Main bot logic with state machine
├── routes/
│   ├── authRouter.js          # Auth routes
│   └── telegramRouter.js      # Telegram bot routes
├── schemas/
│   ├── caseSchema.js          # MongoDB Case model
│   └── userSchema.js          # MongoDB User model
├── services/
│   └── telegramService.js     # Telegram API interactions & file handling
├── utils/
│   ├── mongoUtils.js          # MongoDB connection utilities
│   └── redisUtils.js          # Redis session management
├── temp/                      # Temporary file storage (auto-created)
├── index.js                   # Main server entry point
├── package.json               # Dependencies
└── .env                       # Environment variables
```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or remote)
- Redis (running locally or remote)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Installation

1. **Install Dependencies**

   ```bash
   cd backend_express
   npm install
   ```

2. **Configure Environment Variables**

   ```bash
   cp .env-example .env
   ```

   Edit `.env` with your values:

   ```env
   PORT=3000
   NGROK_AUTHTOKEN=your_ngrok_token

   # Telegram Bot Configuration
   TELEGRAM_BASE_URL=https://api.telegram.org/botYOUR_BOT_TOKEN

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/ai-lawyer

   # Redis Configuration
   REDIS_URL=redis://localhost:6379

   # Processing Server Configuration
   PROCESSING_SERVER_URL=http://localhost:8000/process

   # JWT Configuration
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   REFRESH_TOKEN_EXPIRY=7d
   ```

3. **Start MongoDB and Redis**

   ```bash
   # MongoDB (if running locally)
   mongod

   # Redis (if running locally)
   redis-server
   ```

4. **Set Up Telegram Webhook**

   You have two options:

   **Option A: Using ngrok (Development)**

   ```bash
   npm run dev:tunnel
   ```

   This will start both the server and ngrok tunnel. The webhook will be automatically set.

   **Option B: Manual Setup**

   ```bash
   # Start the server
   npm run dev

   # In another terminal, expose it with ngrok
   npm run tunnel

   # Set webhook manually
   curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-ngrok-url.ngrok.io/telegram/webhook"
   ```

5. **Verify Setup**
   ```bash
   # Check if webhook is set
   curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
   ```

## API Endpoints

### Telegram Bot Endpoints

- `POST /telegram/webhook` - Telegram webhook endpoint
- `GET /telegram/health` - Bot health check

### Other Endpoints

- `GET /` - Server health check
- `POST /auth/*` - Authentication endpoints

## Redis Session Structure

Sessions are stored with the key pattern: `session:{chat_id}`

```json
{
  "state": "WAITING_FOR_GREETING",
  "lawyerID": null,
  "judgeID": null,
  "userID": null,
  "evidences": [],
  "fullDocs": [],
  "caseID": null
}
```

Session expires after **1 hour** of inactivity.

## MongoDB Schema

Cases are stored in the `Case` collection with the following structure:

```javascript
{
  CaseID: String (UUID),
  LawyerID: String,
  JudgeID: String,
  UserID: String,
  Evidence: EvidenceClassSchema,
  Private: PrivateSectionSchema,
  Public: PublicSectionSchema,
  createdAt: Date,
  updatedAt: Date
}
```

## File Handling

1. **Download**: Files are downloaded from Telegram using the file_id
2. **Storage**: Temporarily stored in `backend_express/temp/` directory
3. **Processing**: Sent to processing server via multipart/form-data
4. **Cleanup**: Temporary files are deleted after processing

## Error Handling

- **Invalid Username**: Bot asks user to retry if username is not a single word
- **Missing Documents**: Bot requires at least one document before accepting "DONE"
- **Download Failures**: Bot notifies user and allows retry
- **Processing Errors**: Bot sends error message and resets session

## Development Commands

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run prod

# Start ngrok tunnel
npm run tunnel

# Development with tunnel (recommended)
npm run dev:tunnel
```

## Testing the Bot

1. Open Telegram and search for your bot
2. Send `/start` or `hi`
3. Follow the prompts
4. Upload test documents
5. Verify case creation

### Example Conversation

```
User: hi
Bot: 👋 Welcome! I'm here to help you with your legal case documentation.
     Please provide the following information:
Bot: 📝 Please send the Lawyer's Username (single word):

User: john_doe
Bot: ⚖️ Please send the Judge's Username (single word):

User: judge_smith
Bot: 👤 Please send the Client's Username (single word):

User: client_jane
Bot: 📎 Please send evidence documents for the court case.
     You can send multiple documents. When you're done, send 'DONE'.

User: [uploads document]
Bot: ✅ Document received. Send more documents or type 'DONE' when finished.

User: DONE
Bot: 📄 Please send other case documents.
     You can send multiple documents. When you're done, send 'DONE'.

User: [uploads document]
Bot: ✅ Document received. Send more documents or type 'DONE' when finished.

User: DONE
Bot: ⏳ Processing your case data and sending to the server...
Bot: ✅ Case created successfully!

     📋 **Case Summary:**
     🆔 Case ID: 550e8400-e29b-41d4-a716-446655440000
     👨‍⚖️ Lawyer: john_doe
     ⚖️ Judge: judge_smith
     👤 Client: client_jane
     📎 Evidence Documents: 1
     📄 Case Documents: 1

     Your case has been successfully created and sent for processing!
```

## Troubleshooting

### Webhook Not Receiving Messages

1. Check webhook status:

   ```bash
   curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
   ```

2. Delete and reset webhook:
   ```bash
   curl "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
   curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=YOUR_WEBHOOK_URL/telegram/webhook"
   ```

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping` (should return `PONG`)
- Check Redis URL in `.env` file
- Verify Redis logs for errors

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongosh` or `mongo`
- Check MongoDB URI in `.env` file
- Verify MongoDB logs for errors

### File Download Errors

- Check Telegram bot token is correct
- Verify file size (Telegram has limits)
- Check temp directory permissions

## Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **File Storage**: Temporary files are cleaned up after processing
3. **Session Expiry**: Sessions expire after 1 hour to prevent stale data
4. **Input Validation**: Usernames are validated to be single words
5. **Error Handling**: Sensitive error details are not exposed to users

## Next Steps

1. **Processing Server**: Implement the actual processing server endpoint
2. **File Processing**: Add logic to process uploaded documents
3. **Notifications**: Add user notifications for case status updates
4. **Admin Panel**: Create admin interface for case management
5. **Analytics**: Add logging and analytics for bot usage

## Support

For issues or questions, please check:

- Telegram Bot API documentation: https://core.telegram.org/bots/api
- Redis documentation: https://redis.io/docs/
- MongoDB documentation: https://docs.mongodb.com/

---

**Created**: October 2025  
**Version**: 1.0.0
