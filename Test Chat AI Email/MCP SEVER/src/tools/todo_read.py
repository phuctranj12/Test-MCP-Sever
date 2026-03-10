# tools/todo_read.py — Các tool đọc: liệt kê, tìm kiếm, thống kê

from store import todos

PRIORITY_ICON = {"low": "🔵", "medium": "🟡", "high": "🔴"}

# ─── Tool: list_todos ─────────────────────────────────────────────────────────
TOOL_LIST_TODOS = {
    "name": "list_todos",
    "description": "Xem toàn bộ danh sách task",
    "inputSchema": {
        "type": "object",
        "properties": {
            "filter": {
                "type": "string",
                "enum": ["all", "done", "pending"],
                "description": "Lọc theo trạng thái",
                "default": "all",
            }
        },
    },
}

async def handle_list_todos(args: dict) -> str:
    filter_by = args.get("filter", "all")

    filtered = todos
    if filter_by == "done":
        filtered = [t for t in todos if t["done"]]
    elif filter_by == "pending":
        filtered = [t for t in todos if not t["done"]]

    if not filtered:
        return "📭 Danh sách trống!"

    lines = [f"📋 Danh sách tasks ({filter_by}):"]
    for t in filtered:
        status = "✅" if t["done"] else "⬜"
        icon   = PRIORITY_ICON.get(t["priority"], "⚪")
        lines.append(f"  {status} #{t['id']} {icon} {t['task']}")

    return "\n".join(lines)


# ─── Tool: search_todos ───────────────────────────────────────────────────────
TOOL_SEARCH_TODOS = {
    "name": "search_todos",
    "description": "Tìm kiếm task theo từ khoá",
    "inputSchema": {
        "type": "object",
        "properties": {
            "keyword": {"type": "string", "description": "Từ khoá cần tìm"},
        },
        "required": ["keyword"],
    },
}

async def handle_search_todos(args: dict) -> str:
    keyword = args["keyword"].lower()
    results = [t for t in todos if keyword in t["task"].lower()]

    if not results:
        return f"🔍 Không tìm thấy task nào chứa '{keyword}'"

    lines = [f"🔍 Tìm thấy {len(results)} task:"]
    for t in results:
        status = "✅" if t["done"] else "⬜"
        lines.append(f"  {status} #{t['id']} {t['task']}")
    return "\n".join(lines)


# ─── Tool: stats ──────────────────────────────────────────────────────────────
TOOL_STATS = {
    "name": "stats",
    "description": "Thống kê tổng quan danh sách todo",
    "inputSchema": {"type": "object", "properties": {}},
}

async def handle_stats(_args: dict) -> str:
    total   = len(todos)
    done    = sum(1 for t in todos if t["done"])
    pending = total - done
    high    = sum(1 for t in todos if t["priority"] == "high" and not t["done"])

    return (
        f"📊 Thống kê:\n"
        f"  Tổng:      {total} tasks\n"
        f"  Hoàn thành: {done} tasks\n"
        f"  Còn lại:   {pending} tasks\n"
        f"  🔴 Khẩn cấp chưa làm: {high} tasks"
    )
