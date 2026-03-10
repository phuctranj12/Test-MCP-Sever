const winston = require('winston');
const path = require('path');

// Tạo logger với file output
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'mcp-client' },
    transports: [
        // Log ra file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/app.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Log ra console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});

// Tạo thư mục logs nếu chưa có
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

module.exports = logger;