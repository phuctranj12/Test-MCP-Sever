# store.py — In-memory storage dùng chung toàn project
# Trong thực tế có thể thay bằng SQLite, Redis, PostgreSQL...

from typing import TypedDict

class Todo(TypedDict):
    id: int
    task: str
    done: bool
    priority: str  # "low" | "medium" | "high"

# Shared state — import từ bất kỳ module nào cần
todos: list[Todo] = []
_next_id: int = 1

def next_id() -> int:
    global _next_id
    current = _next_id
    _next_id += 1
    return current
