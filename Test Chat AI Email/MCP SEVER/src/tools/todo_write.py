from store import todos, next_id, Todo

TOOL_ADD_TODO = {
    "name": "add_todo",
    "description": "Thêm một task mới vào danh sách",
    "inputSchema": {
        "type": "object",
        "properties": {
            "task":     {"type": "string", "description": "Nội dung task"},
            "priority": {"type": "string", "enum": ["low", "medium", "high"],
                         "description": "Mức độ ưu tiên", "default": "medium"},
        },
        "required": ["task"],
    },
}

async def handle_add_todo(args: dict) -> str:
    todo: Todo = {
        "id":       next_id(),
        "task":     args["task"],
        "done":     False,
        "priority": args.get("priority", "medium"),
    }
    todos.append(todo)
    return f"✅ Đã thêm task #{todo['id']}: '{todo['task']}' [{todo['priority']}]"


# ─── Tool: complete_todo ──────────────────────────────────────────────────────
TOOL_COMPLETE_TODO = {
    "name": "complete_todo",
    "description": "Đánh dấu một task là đã hoàn thành",
    "inputSchema": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "description": "ID của task cần đánh dấu"},
        },
        "required": ["id"],
    },
}

async def handle_complete_todo(args: dict) -> str:
    todo_id = args["id"]
    for todo in todos:
        if todo["id"] == todo_id:
            todo["done"] = True
            return f"🎉 Hoàn thành task #{todo_id}: '{todo['task']}'"
    return f"❌ Không tìm thấy task #{todo_id}"


# ─── Tool: delete_todo ────────────────────────────────────────────────────────
TOOL_DELETE_TODO = {
    "name": "delete_todo",
    "description": "Xoá một task khỏi danh sách",
    "inputSchema": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "description": "ID của task cần xoá"},
        },
        "required": ["id"],
    },
}

async def handle_delete_todo(args: dict) -> str:
    todo_id = args["id"]
    for i, todo in enumerate(todos):
        if todo["id"] == todo_id:
            removed = todos.pop(i)
            return f"🗑️ Đã xoá task #{todo_id}: '{removed['task']}'"
    return f"❌ Không tìm thấy task #{todo_id}"
