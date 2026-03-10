# khởi tạo MCP server
# đăng ký tools
# đăng ký resources
# nhận request từ AI/client

import asyncio
import logging
from mcp.server        import Server
from mcp.server.stdio  import stdio_server
from mcp.types         import (
    Tool, Resource, Prompt,
    TextContent, PromptMessage,
)

from src.tools.init import ALL_TOOLS,TOOL_HANDLERS
from src.resources.todo_resources import ALL_RESOURCES,RESOURCE_READERS
from src.prompts.todo_prompts import ALL_PROMPTS,PROMPT_HANDLERS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("todo-mcp-server")

server = Server("todo-manager")

# ─────────────────────────────────────────────────────────────────────────────
# TOOLS
# ─────────────────────────────────────────────────────────────────────────────
@server.list_tools()
async def list_tools() -> list[Tool]:
    """Trả về danh sách tools cho client (AI) biết."""
    return [Tool(**t) for t in ALL_TOOLS]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Dispatch tool call đến đúng handler."""
    logger.info(f"call_tool: {name} | args: {arguments}")

    handler = TOOL_HANDLERS.get(name)
    if not handler:
        return [TextContent(type="text", text=f"❌ Tool '{name}' không tồn tại")]

    try:
        result = await handler(arguments)
        logger.info(f"call_tool result type: {type(result)}, value: {result[:100] if isinstance(result, str) else result}")
        response = [TextContent(type="text", text=str(result))]
        logger.info(f"call_tool returning: {len(response)} items")
        return response
    except Exception as e:
        logger.error(f"call_tool error: {str(e)}", exc_info=True)
        return [TextContent(type="text", text=f"❌ Lỗi: {str(e)}")]


# ─────────────────────────────────────────────────────────────────────────────
# RESOURCES
# ─────────────────────────────────────────────────────────────────────────────
@server.list_resources()
async def list_resources() -> list[Resource]:
    """Trả về danh sách resources."""
    return [Resource(**r) for r in ALL_RESOURCES]

@server.read_resource()
async def read_resource(uri: str) -> str:
    """Đọc nội dung resource theo URI."""
    reader = RESOURCE_READERS.get(str(uri))
    if not reader:
        raise ValueError(f"Resource không tồn tại: {uri}")
    return await reader()


# ─────────────────────────────────────────────────────────────────────────────
# PROMPTS
# ─────────────────────────────────────────────────────────────────────────────
@server.list_prompts()
async def list_prompts() -> list[Prompt]:
    """Trả về danh sách prompt templates."""
    return [Prompt(**p) for p in ALL_PROMPTS]

@server.get_prompt()
async def get_prompt(name: str, arguments: dict | None = None) -> list[PromptMessage]:
    """Lấy nội dung prompt đã render."""
    handler = PROMPT_HANDLERS.get(name)
    if not handler:
        raise ValueError(f"Prompt '{name}' không tồn tại")
    messages = await handler(arguments or {})
    return [PromptMessage(**m) for m in messages]


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
async def main():
    logger.info("🚀 Todo MCP Server đang chạy...")
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )

if __name__ == "__main__":
    asyncio.run(main())
