// src/services/mcpService.js — Toàn bộ logic kết nối MCP
// Các route chỉ cần import và gọi hàm từ đây

const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');

const PYTHON_PATH = '/Users/anhphuc/Desktop/MCP SEVER/.venv/bin/python3';
const SERVER_PATH = '/Users/anhphuc/Desktop/MCP SEVER/server.py';
const TIMEOUT_MS = 30000;  // 30 s email gửi có thể mất time

let mcpProcess = null;
let pendingRequests = new Map();
let requestId = 1;
let buffer = '';

// ─── Gửi JSON-RPC request đến MCP 
function sendMCP(method, params = {}) {
    return new Promise((resolve, reject) => {
        if (!mcpProcess) {
            return reject(new Error('MCP server không chạy. Vui lòng khởi động backend.'));
        }

        const id = requestId++;
        const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';

        pendingRequests.set(id, { resolve, reject });

        try {
            mcpProcess.stdin.write(msg);
        } catch (e) {
            pendingRequests.delete(id);
            return reject(new Error('Không thể gửi message đến MCP: ' + e.message));
        }

        // Timeout
        setTimeout(() => {
            if (pendingRequests.has(id)) {
                pendingRequests.delete(id);
                reject(new Error(`Timeout sau ${TIMEOUT_MS}ms: ${method}`));
            }
        }, TIMEOUT_MS);
    });
}

// ─── Xử lý data từ stdout của MCP ────────────────────────────────────────────
function handleStdout(data) {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();   // giữ lại dòng chưa hoàn chỉnh

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const msg = JSON.parse(line);
            logger.info('MCP raw msg:', msg);
            logger.info('MCP →', JSON.stringify(msg).substring(0, 300));

            // Handle both JSON-RPC responses
            if (msg.id && pendingRequests.has(msg.id)) {
                const { resolve } = pendingRequests.get(msg.id);
                pendingRequests.delete(msg.id);

                // Log full response for debugging
                logger.info('MCP response id:', msg.id, 'has result:', !!msg.result, 'has error:', !!msg.error);

                if (msg.error) {
                    logger.error('MCP error response', msg.error);
                    resolve(null);
                } else if (msg.result) {
                    resolve(msg.result);
                } else {
                    // Fallback: if no result field, resolve with msg itself
                    logger.warn('No result field in response, using entire message');
                    resolve(msg);
                }
            }
        } catch (e) {
            logger.error('MCP parse error', line.substring(0, 100), '|', e.message);
        }
    }
}

// ─── Khởi động MCP process ───────────────────────────────────────────────────
function startMCPServer() {
    const fs = require('fs');
    logger.info('Checking dependencies...');
    logger.info('Python at:', PYTHON_PATH, '- exists:', fs.existsSync(PYTHON_PATH));
    logger.info('Server at:', SERVER_PATH, '- exists:', fs.existsSync(SERVER_PATH));

    try {
        mcpProcess = spawn(PYTHON_PATH, [SERVER_PATH], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.dirname(SERVER_PATH),
            env: {
                ...process.env,
                PYTHONUNBUFFERED: '1',
            }
        });

        mcpProcess.stdout.on('data', handleStdout);

        mcpProcess.stderr.on('data', (data) => {
            const msg = data.toString().trim();
            logger.info('MCP stderr raw:', data.toString());
            logger.info('MCP stderr trimmed:', msg);
            // Log Python errors for debugging
            if (msg.includes('Error') || msg.includes('Traceback')) {
                logger.error('MCP CRITICAL ERROR', msg);
            }
        });

        mcpProcess.on('error', (err) => {
            logger.error('MCP spawn error', err.message);
            mcpProcess = null;
        });

        mcpProcess.on('exit', (code, signal) => {
            logger.warn(`MCP Process exited with code ${code}, signal ${signal}`);
            mcpProcess = null;
            // Attempt restart after 3 seconds
            setTimeout(() => {
                if (!mcpProcess) {
                    logger.info('Attempting automatic restart...');
                    startMCPServer();
                }
            }, 3000);
        });

        // Gửi initialize sau khi process sẵn sàng
        setTimeout(() => {
            sendMCP('initialize', {
                protocolVersion: '2024-11-05',
                clientInfo: { name: 'node-client', version: '1.0' },
                capabilities: {},
            }).then(() => logger.info('MCP Initialized ✅'))
                .catch(err => logger.error('MCP init error', err.message));
        }, 500);
    } catch (err) {
        logger.error('Failed to start:', err.message);
    }
}

// ─── Kiểm tra trạng thái 
function isRunning() {
    return mcpProcess !== null;
}

// ─── Export 
module.exports = { startMCPServer, sendMCP, isRunning };