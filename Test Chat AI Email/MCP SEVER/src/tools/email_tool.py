
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import config  # Import config để lấy credentials
import logging

logger = logging.getLogger("email_tool")

def _send_email_sync(to_email: str, subject: str, body: str) -> str:
    """
    Synchronous email sending function.
    Runs in thread pool to avoid blocking async event loop.
    """
    try:
        # Validate email addresses
        if '@' not in to_email:
            return f"❌ Lỗi: Email không hợp lệ: {to_email}"
        
        logger.info(f"Gửi email từ {config.EMAIL_USER} đến {to_email}")
        
        # Tạo message
        msg = MIMEMultipart()
        msg['From'] = config.EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        # Kết nối SMTP
        logger.info(f"Kết nối SMTP {config.SMTP_SERVER}:{config.SMTP_PORT}")
        server = smtplib.SMTP(config.SMTP_SERVER, config.SMTP_PORT, timeout=10)
        server.starttls()  # Bảo mật
        
        # Login
        logger.info(f"Đang login với {config.EMAIL_USER}")
        server.login(config.EMAIL_USER, config.EMAIL_PASSWORD)
        
        # Send
        logger.info("Gửi email...")
        server.sendmail(config.EMAIL_USER, to_email, msg.as_string())
        server.quit()
        
        logger.info("✅ Gửi thành công")
        return f"✅ Đã gửi email đến {to_email} với chủ đề '{subject}'"
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"Auth lỗi: {str(e)}")
        return f"❌ Lỗi xác thực email: Kiểm tra SENDER_PASSWORD trong .env"
    except smtplib.SMTPException as e:
        logger.error(f"SMTP lỗi: {str(e)}")
        return f"❌ Lỗi SMTP: {str(e)}"
    except Exception as e:
        logger.error(f"Lỗi: {str(e)}")
        return f"❌ Lỗi gửi email: {str(e)}"

async def send_email(arguments: dict) -> str:
    """
    Tool để gửi email.
    Arguments: {"to": "email@domain.com", "subject": "Tiêu đề", "body": "Nội dung"}
    
    Runs synchronous SMTP in thread pool to avoid blocking event loop.
    """
    to_email = arguments.get("to")
    subject = arguments.get("subject", "No Subject")
    body = arguments.get("body", "No Body")
    
    if not to_email:
        return "❌ Lỗi: Thiếu email đích ('to')"
    
    # Run synchronous SMTP operations in thread pool
    # This prevents blocking the async event loop
    try:
        result = await asyncio.to_thread(_send_email_sync, to_email, subject, body)
        return result
    except Exception as e:
        print(f"[email_tool] ❌ Thread error: {str(e)}")
        return f"❌ Lỗi gửi email: {str(e)}"

# Định nghĩa tool cho MCP
TOOL_SEND_EMAIL = {
    "name": "send_email",
    "description": "Gửi email đến địa chỉ chỉ định. Cần cung cấp 'to' (email đích), 'subject' (tiêu đề), và 'body' (nội dung).",
    "inputSchema": {
        "type": "object",
        "properties": {
            "to": {"type": "string", "description": "Email đích"},
            "subject": {"type": "string", "description": "Tiêu đề email"},
            "body": {"type": "string", "description": "Nội dung email"}
        },
        "required": ["to"]
    }
}