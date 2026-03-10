const express = require('express');
const { sendMCP } = require('../services/Mcpservice');

const router = express.Router();



// ─── GET /api/tools — Lấy danh sách tools từ MCP 
router.get('/', async (req, res) => {
    try {
        const result = await sendMCP('tools/list', {});
        // result là array các Tool objects
        res.json({ tools: Array.isArray(result) ? result : [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/tools/call — Gọi tool trực tiếp (debug) 
router.post('/call', async (req, res) => {
    const { name, arguments: args } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Thiếu tên tool' });
    }

    try {
        const result = await sendMCP('tools/call', { name, arguments: args ?? {} });
        // result là [TextContent, ...] => lấy text từ item đầu
        const text = result?.[0]?.text ?? 'Không có phản hồi';
        res.json({ result: text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;