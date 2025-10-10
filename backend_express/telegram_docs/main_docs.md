# Telegram Base URL is of form:

# Send Text Message:https://api.telegram.org/bot<token>

url: {{telegram_base_url}}/sendMessage

queryParams:
chat_id=<chatID of receiver>
text=<text to send>

# get File sent by user

url: {{telegram_base_url}}/getFile

queryParams:
file_id=<file_id of file sent by user>

## example response received:

```json
{
  "ok": true,
  "result": {
    "file_id": "BQACAgUAAxkBAAMyaOlEFrRHXw6KswF1culBpU-QM_YAAqwdAAJQnUhXheQiLPUMSa42BA",
    "file_unique_id": "AgADrB0AAlCdSFc",
    "file_size": 345348,
    "file_path": "documents/file_0.pdf"
  }
}
```

The file can then be downloaded from the url: https://api.telegram.org/file/bot<token>/<file_path>
