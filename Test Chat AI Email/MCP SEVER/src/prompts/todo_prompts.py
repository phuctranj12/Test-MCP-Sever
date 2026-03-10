# Prompt templates để tái sử dụng
#  Prompt: daily_review
PROMPT_DAILY_REVIEW = {
    "name":        "daily_review",
    "description": "Tạo prompt để AI review và lên kế hoạch todo hôm nay",
    "arguments": [
        {"name": "date", "description": "Ngày hôm nay", "required": False},
    ],
}

async def get_daily_review_prompt(args: dict) -> list[dict]:
    date = args.get("date", "hôm nay")
    return [
        {
            "role": "user",
            "content": (
                f"Hãy xem danh sách todo của tôi cho {date}. "
                "Dùng tool list_todos để lấy danh sách, sau đó:\n"
                "1. Tóm tắt những việc còn chưa làm\n"
                "2. Đề xuất thứ tự ưu tiên\n"
                "3. Ước tính thời gian nếu có thể"
            ),
        }
    ]


 # Prompt: focus_mode
PROMPT_FOCUS_MODE = {
    "name":        "focus_mode",
    "description": "Chỉ focus vào task ưu tiên cao nhất",
    "arguments": [],
}

async def get_focus_mode_prompt(_args: dict) -> list[dict]:
    return [
        {
            "role": "user",
            "content": (
                "Dùng tool list_todos (filter: pending) rồi tìm task HIGH priority. "
                "Chỉ hiển thị task đó và hỏi tôi có muốn bắt đầu không."
            ),
        }
    ]


# Export
ALL_PROMPTS = [
    PROMPT_DAILY_REVIEW,
    PROMPT_FOCUS_MODE,
]

PROMPT_HANDLERS: dict = {
    "daily_review": get_daily_review_prompt,
    "focus_mode":   get_focus_mode_prompt,
}
