// Route xử lý chat
// Nhận message từ client → gọi MCP tool → trả kết quả

const express = require('express');
const logger = require('../utils/logger');
const { sendMCP } = require('../services/Mcpservice');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = express.Router();

// ─── Phân tích message → chọn tool phù hợp ───────────────────────────────────
// function parseTool(message) {
//     const msg = message.toLowerCase();

//     if (msg.includes('thêm') || msg.includes('add')) {
//         return { name: 'add_todo', arguments: { task: message } };
//     }
//     if (msg.includes('xoá') || msg.includes('xoa') || msg.includes('delete')) {
//         const id = parseInt(message.match(/\d+/)?.[0]);
//         return { name: 'delete_todo', arguments: { id } };
//     }
//     if (msg.includes('hoàn thành') || msg.includes('done') || msg.includes('xong')) {
//         const id = parseInt(message.match(/\d+/)?.[0]);
//         return { name: 'complete_todo', arguments: { id } };
//     }
//     if (msg.includes('tìm') || msg.includes('search')) {
//         const keyword = message.replace(/tìm|search/gi, '').trim();
//         return { name: 'search_todos', arguments: { keyword } };
//     }
//     if (msg.includes('thống kê') || msg.includes('stats')) {
//         return { name: 'stats', arguments: {} };
//     }
//     if (msg.includes('danh sách') || msg.includes('list')) {
//         const filter = msg.includes('xong') ? 'done'
//             : msg.includes('chưa') ? 'pending'
//                 : 'all';
//         return { name: 'list_todos', arguments: { filter } };
//     }
//     if (msg.includes('gửi email') || msg.includes('send email')) {
//         // Parse email: giả sử format "gửi email đến email@domain.com chủ đề Tiêu đề body Nội dung"
//         const emailMatch = message.match(/đến\s+([^\s]+@\S+)/);
//         const subjectMatch = message.match(/chủ đề\s+([^b]+)/);
//         const bodyMatch = message.match(/body\s+(.+)/);
//         logger.info('Email parse:', { emailMatch, subjectMatch, bodyMatch });
//         if (emailMatch && subjectMatch && bodyMatch) {
//             return {
//                 name: 'send_email',
//                 arguments: {
//                     to: emailMatch[1],
//                     subject: subjectMatch[1].trim(),
//                     body: bodyMatch[1].trim()
//                 }
//             };
//         }
//     }

//     return null;
// }
// async function parseTool(message) {
//     try {
//         const toolsResult = await sendMCP('tools/list', {});
//         const mcpTools = toolsResult?.tools ?? [];
//         logger.info('mcpTools count:', mcpTools.length); // ← thêm

//         const model = genAI.getGenerativeModel({
//             model: 'gemini-2.0-flash',
//             tools: [{
//                 functionDeclarations: mcpTools.map(t => ({
//                     name: t.name,
//                     description: t.description,
//                     parameters: {
//                         type: t.inputSchema?.type ?? 'object',
//                         properties: t.inputSchema?.properties ?? {},
//                         required: t.inputSchema?.required ?? [],
//                     },
//                 }))
//             }],
//             systemInstruction: 'Bạn là trợ lý quản lý todo và email. Hãy luôn gọi tool phù hợp, đừng trả lời text.',
//         });

//         const chat = model.startChat();
//         logger.info('Sending to Gemini...'); // ← thêm
//         const aiResponse = await chat.sendMessage(message);
//         logger.info('Gemini responded'); // ← thêm
//         const parts = aiResponse.response.candidates?.[0]?.content?.parts ?? [];
//         logger.info('Gemini parts:', JSON.stringify(parts));
//         const functionCall = parts.find(p => p.functionCall)?.functionCall;

//         if (!functionCall) return null;
//         return { name: functionCall.name, arguments: functionCall.args ?? {} };

//     } catch (err) {
//         logger.error('parseTool Gemini error:', err.message); // ← catch lỗi
//         logger.error('parseTool Gemini error full:', JSON.stringify(err, Object.getOwnPropertyNames(err))); // ← thêm dòng này
//         return null;
//     }
// }
// ─── Parse email fields bằng Gemini AI ────────────────────────────────────────
// ─── Regex fallback độc lập ───────────────────────────────────────────────────
function parseEmailRegex(message) {
    const emailMatch = message.match(/(?:đến|tới|cho|to)\s+([^\s]+@[^\s]+)/i);
    const subjectMatch = message.match(/(?:chủ đề|tiêu đề|subject)\s+(.+?)(?=\s+(?:body|với nội dung|nội dung|message)|$)/i);
    const bodyMatch = message.match(/(?:body|với nội dung|nội dung|message|nói rằng)\s+(.+)/i);

    logger.info('Regex parse result:', { emailMatch: emailMatch?.[1], subjectMatch: subjectMatch?.[1], bodyMatch: bodyMatch?.[1] });

    if (emailMatch) {
        return {
            to: emailMatch[1],
            subject: subjectMatch?.[1]?.trim() ?? '(Không có tiêu đề)',
            body: bodyMatch?.[1]?.trim() ?? ''
        };
    }
    return null;
}

// ─── Parse email bằng Gemini, fallback về regex nếu lỗi ──────────────────────
async function parseEmailWithAI(message) {
    // Thử Gemini trước
    if (process.env.GEMINI_API_KEY) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const prompt = `Extract email info. Return ONLY raw JSON, no markdown, no backticks.
Message: "${message}"
Format: {"to":"email","subject":"subject","body":"body"}`;

            const result = await model.generateContent(prompt);
            let text = result.response.text().trim();
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            logger.info('Gemini email raw:', text);

            const parsed = JSON.parse(text);
            if (parsed.to) {
                return {
                    to: parsed.to,
                    subject: parsed.subject ?? '(Không có tiêu đề)',
                    body: parsed.body ?? ''
                };
            }
        } catch (err) {
            logger.warn('Gemini failed, fallback to regex. Error:', err.message ?? JSON.stringify(err));
        }
    } else {
        logger.warn('GEMINI_API_KEY not set, using regex only');
    }

    // Luôn fallback về regex
    return parseEmailRegex(message);
}

// ─── Phân tích message → chọn tool phù hợp ───────────────────────────────────
async function parseTool(message) {
    const msg = message.toLowerCase();

    if (msg.includes('thêm') || msg.includes('add')) {
        return { name: 'add_todo', arguments: { task: message } };
    }
    if (msg.includes('xoá') || msg.includes('xoa') || msg.includes('delete')) {
        const id = parseInt(message.match(/\d+/)?.[0]);
        return { name: 'delete_todo', arguments: { id } };
    }
    if (msg.includes('hoàn thành') || msg.includes('done') || msg.includes('xong')) {
        const id = parseInt(message.match(/\d+/)?.[0]);
        return { name: 'complete_todo', arguments: { id } };
    }
    if (msg.includes('tìm') || msg.includes('search')) {
        const keyword = message.replace(/tìm|search/gi, '').trim();
        return { name: 'search_todos', arguments: { keyword } };
    }
    if (msg.includes('thống kê') || msg.includes('stats')) {
        return { name: 'stats', arguments: {} };
    }
    if (msg.includes('danh sách') || msg.includes('list')) {
        const filter = msg.includes('xong') ? 'done'
            : msg.includes('chưa') ? 'pending'
                : 'all';
        return { name: 'list_todos', arguments: { filter } };
    }

    // ── Email: dùng AI để hiểu ngôn ngữ tự nhiên ──
    const emailKeywords = ['gửi email', 'send email', 'gửi mail', 'email đến', 'email tới', 'email cho'];
    if (emailKeywords.some(k => msg.includes(k))) {
        const emailData = await parseEmailWithAI(message);
        logger.info('Parsed email data:', emailData);
        if (emailData) {
            return {
                name: 'send_email',
                arguments: {
                    to: emailData.to,
                    subject: emailData.subject,
                    body: emailData.body
                }
            };
        }
    }

    return null;
}
// ─── POST /api/chat 
router.post('/', async (req, res) => {
    const { message } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ error: 'Thiếu message' });
    }

    logger.info('Received message:', message);
    const tool = await parseTool(message); // Fix part 
    logger.info('Parsed tool:', tool);

    if (!tool) {
        return res.json({
            response: 'Tôi có thể giúp bạn:\n'
                + '• Thêm task: "thêm task Học MCP"\n'
                + '• Xem danh sách: "danh sách"\n'
                + '• Tìm kiếm: "tìm Python"\n'
                + '• Thống kê: "thống kê"\n'
                + '• Xoá: "xoá task 1"\n'
                + '• Hoàn thành: "xong task 2"\n'
                + '• Gửi email: "gửi email đến abc@gmail.com chủ đề Chào body Xin chào"',
            tool_used: null,
        });
    }

    try {
        logger.info('Calling sendMCP with:', { method: 'tools/call', params: tool });
        const result = await sendMCP('tools/call', tool);
        logger.info('MCP result:', JSON.stringify(result).substring(0, 500));
        logger.info('Result type:', Array.isArray(result), 'First element:', result?.[0]);

        // Handle different response formats
        let text = 'Không có phản hồi';
        logger.info('Processing result:', { isArray: Array.isArray(result), hasContent: !!result?.content, length: result?.length });
        if (result?.content && Array.isArray(result.content) && result.content.length > 0) {
            // MCP format: { content: [{ text: "..." }] }
            text = result.content[0]?.text ?? result.content[0];
            logger.info('Using MCP content format, text:', text);
        } else if (Array.isArray(result) && result.length > 0) {
            // Format: [{ type: "text", text: "..." }]
            text = result[0]?.text ?? result[0];
            logger.info('Using array format, text:', text);
        } else if (typeof result === 'string') {
            // Format: "direct string"
            text = result;
            logger.info('Using string format, text:', text);
        } else if (result?.text) {
            // Format: { type: "text", text: "..." }
            text = result.text;
            logger.info('Using object format, text:', text);
        } else {
            logger.warn('No valid text found in result, using default');
        }

        logger.info('Final response text:', text.substring(0, 200));
        res.json({ response: text, tool_used: tool.name });
    } catch (err) {
        logger.error('Error:', err);
        res.status(500).json({
            error: 'Lỗi khi gửi request đến MCP: ' + err.message,
            tool: tool.name
        });
    }
});


module.exports = router;