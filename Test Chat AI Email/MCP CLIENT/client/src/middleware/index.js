//  Middleware dùng chung

const { isRunning } = require('../services/Mcpservice');

// ─── Kiểm tra MCP server còn sống không
function requireMCP(req, res, next) {
    if (!isRunning()) {
        console.error('[requireMCP] MCP server not running');
        return res.status(503).json({
            error: 'MCP server không chạy. Vui lòng khởi động backend lại.',
            status: 'mcp_offline'
        });
    }
    next();
}

// ─── Xử lý lỗi tập trung với chi tiết
function errorHandler(err, req, res, next) {
    console.error('[Error]', {
        message: err.message,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    res.status(500).json({
        error: err.message ?? 'Internal server error',
        path: req.path,
        timestamp: new Date().toISOString()
    });
}

module.exports = { requireMCP, errorHandler };