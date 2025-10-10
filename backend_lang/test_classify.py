from fastapi.testclient import TestClient
from main import app
from pathlib import Path

client = TestClient(app)

# Create small temp files to upload
p = Path(__file__).parent
f1 = p / "tmp_evidence.txt"
f2 = p / "tmp_full.txt"
f1.write_text("evidence content")
f2.write_text("full doc content")

with open(f1, "rb") as ef, open(f2, "rb") as ff:
    response = client.post(
        "/classify",
        data={
            "CaseID": "CASE123",
            "LawyerID": "LAWYER1",
            "JudgeID": "JUDGE1",
            "UserID": "USER1",
        },
        files=[
            ("evidenceDocs", (f1.name, ef, "text/plain")),
            ("fullDocs", (f2.name, ff, "text/plain")),
        ],
    )

print("status_code:", response.status_code)
print(response.json())
