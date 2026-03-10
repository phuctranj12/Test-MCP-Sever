# resources/todo_resources.py — Resources: dữ liệu AI có thể đọc trực tiếp

from store import todos

# ─── Resource: Snapshot toàn bộ todo dạng JSON ───────────────────────────────
RESOURCE_TODOS_JSON = {
    "uri":         "todo://all/json",
    "name":        "Tất cả todos (JSON)",
    "description": "Danh sách todos đầy đủ dạng JSON thô",
    "mimeType":    "application/json",
}

async def read_todos_json() -> str:
    import json
    return json.dumps(todos, ensure_ascii=False, indent=2)


# ─── Resource: Summary ngắn gọn
RESOURCE_TODOS_SUMMARY = {
    "uri":         "todo://all/summary",
    "name":        "Tóm tắt todos",
    "description": "Tóm tắt nhanh trạng thái danh sách",
    "mimeType":    "text/plain",
}

async def read_todos_summary() -> str:
    if not todos:
        return "Chưa có task nào."
    lines = []
    for t in todos:
        mark = "✅" if t["done"] else "⬜"
        lines.append(f"{mark} [{t['priority'].upper()}] {t['task']}")
    return "\n".join(lines)


# ─── Export ───────────────────────────────────────────────────────────────────
ALL_RESOURCES = [
    RESOURCE_TODOS_JSON,
    RESOURCE_TODOS_SUMMARY,
]

RESOURCE_READERS: dict = {
    "todo://all/json":    read_todos_json,
    "todo://all/summary": read_todos_summary,
}
