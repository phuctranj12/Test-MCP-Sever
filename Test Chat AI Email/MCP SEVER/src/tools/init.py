from .todo_write import (
    TOOL_ADD_TODO,      handle_add_todo,
    TOOL_COMPLETE_TODO, handle_complete_todo,
    TOOL_DELETE_TODO,   handle_delete_todo,
)
from .todo_read import (
    TOOL_LIST_TODOS,    handle_list_todos,
    TOOL_SEARCH_TODOS,  handle_search_todos,
    TOOL_STATS,         handle_stats,
)
from .email_tool import (
    TOOL_SEND_EMAIL, send_email,
)


ALL_TOOLS = [
    TOOL_ADD_TODO,
    TOOL_COMPLETE_TODO,
    TOOL_DELETE_TODO,
    TOOL_LIST_TODOS,
    TOOL_SEARCH_TODOS,
    TOOL_STATS,
    TOOL_SEND_EMAIL,
]

# tên tool : hàm xử lý tương ứng     QUAN TRỌNG ĐỂ AI map “tên tool mà AI gọi” → “hàm Python thực thi thật sự”.
TOOL_HANDLERS: dict = {
    "add_todo":      handle_add_todo,
    "complete_todo": handle_complete_todo,
    "delete_todo":   handle_delete_todo,
    "list_todos":    handle_list_todos,
    "search_todos":  handle_search_todos,
    "stats":         handle_stats,
    "send_email":    send_email,
}
