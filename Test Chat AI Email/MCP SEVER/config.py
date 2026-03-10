import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # ← tên biến trong .env, không phải key thật
LLM = "gemini-2.0-flash"

EMBEDDING_MODEL = "models/text-embedding-004"
RETRIEVE_K = 5

PROJECT_ROOT = Path(__file__).resolve().parent
JSON_TRACKCHANGE = PROJECT_ROOT / "json_trackchange" / "data" / "trackchange.json"
PERSIST_PATH     = PROJECT_ROOT / "db"
EXCEL_TRACKCHANGE = PROJECT_ROOT / "excel_trackchange"

# Config cho email (Gmail SMTP)
EMAIL_USER = os.getenv("SENDER_EMAIL")  # Gmail của bạn
EMAIL_PASSWORD = os.getenv("SENDER_PASSWORD")  # App Password từ Gmail
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))