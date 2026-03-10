const express = require('express');
const cors = require('cors');
const logger = require('./src/utils/logger');
const { requireMCP, errorHandler } = require('./src/middleware/index');
const chatRoutes = require('./src/routes/chat');
const toolsRoutes = require('./src/routes/tools');
const healthRoutes = require('./src/routes/health');

const app = express();
const PORT = 3001;

// ─── CORS ─────────────────────────────────────────
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ─── Routes ───────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/tools', requireMCP, toolsRoutes);
app.use('/api/chat', requireMCP, chatRoutes);

app.use(errorHandler);

// ─── Start MCP server ─────────────────────────────
const mcpService = require('./src/services/Mcpservice');

setTimeout(() => {
    mcpService.startMCPServer();
    logger.info('MCP Server initialization started');
}, 100);

app.listen(PORT, () => {
    logger.info(`Backend running on http://localhost:${PORT}`);
});