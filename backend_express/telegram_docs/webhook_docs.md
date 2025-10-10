# Example Response received when user sends text message:

```json
{
  "update_id": 189916097,
  "message": {
    "message_id": 48,
    "from": {
      "id": 6069335080,
      "is_bot": false,
      "first_name": "Amol",
      "username": "DeCipher_6",
      "language_code": "en"
    },
    "chat": {
      "id": 6069335080,
      "first_name": "Amol",
      "username": "DeCipher_6",
      "type": "private"
    },
    "date": 1760117571,
    "text": "hello"
  }
}
```

# Example Response received when user uploads file:

```json
{
  "update_id": 189916098,
  "message": {
    "message_id": 50,
    "from": {
      "id": 6069335080,
      "is_bot": false,
      "first_name": "Amol",
      "username": "DeCipher_6",
      "language_code": "en"
    },
    "chat": {
      "id": 6069335080,
      "first_name": "Amol",
      "username": "DeCipher_6",
      "type": "private"
    },
    "date": 1760117782,
    "document": {
      "file_name": "NoC - Argoynx'25 .pdf",
      "mime_type": "application/pdf",
      "file_id": "BQACAgUAAxkBAAMyaOlEFrRHXw6KswF1culBpU-QM_YAAqwdAAJQnUhXheQiLPUMSa42BA",
      "file_unique_id": "AgADrB0AAlCdSFc",
      "file_size": 345348
    }
  }
}
```
