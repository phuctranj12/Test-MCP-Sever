#!/usr/bin/env node
/*
 * test-setup.js — Validate installation & configuration
 * 
 * Run: node test-setup.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const PYTHON_PATH = '/Users/anhphuc/Desktop/MCP SEVER/.venv/bin/python3';
const SERVER_PATH = '/Users/anhphuc/Desktop/MCP SEVER/server.py';
const ENV_PATH = '/Users/anhphuc/Desktop/MCP SEVER/.env';
const REQ_PATH = '/Users/anhphuc/Desktop/MCP SEVER/requirements.txt';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
};

const log = {
    ok: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    err: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

async function checkFileExists(filePath, label) {
    const exists = fs.existsSync(filePath);
    if (exists) {
        log.ok(`${label} exists: ${filePath}`);
        return true;
    } else {
        log.err(`${label} NOT FOUND: ${filePath}`);
        return false;
    }
}

async function checkPythonDeps() {
    try {
        log.info('Checking Python dependencies...');
        const { stdout } = await execAsync(`${PYTHON_PATH} -m pip list`);

        const requiredPkgs = ['mcp', 'google-generativeai', 'python-dotenv'];
        const missing = [];

        for (const pkg of requiredPkgs) {
            if (stdout.toLowerCase().includes(pkg)) {
                log.ok(`Python package: ${pkg}`);
            } else {
                log.err(`Python package MISSING: ${pkg}`);
                missing.push(pkg);
            }
        }

        return missing.length === 0;
    } catch (err) {
        log.err(`Failed to check Python deps: ${err.message}`);
        return false;
    }
}

async function checkEnvFile() {
    if (!fs.existsSync(ENV_PATH)) {
        log.err(`.env file not found: ${ENV_PATH}`);
        return false;
    }

    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const required = ['SENDER_EMAIL', 'SENDER_PASSWORD', 'EMAIL_USER'];
    const missing = [];

    for (const key of required) {
        if (content.includes(key)) {
            const value = content.match(new RegExp(`${key}=(.+)`))?.[1];
            if (value && value !== '') {
                log.ok(`.env has ${key}`);
            } else {
                log.warn(`.env has ${key} but it's empty`);
                missing.push(key);
            }
        } else {
            log.err(`.env MISSING ${key}`);
            missing.push(key);
        }
    }

    return missing.length === 0;
}

async function runTests() {
    console.log('\n' + colors.blue + '═══════════════════════════════════════' + colors.reset);
    console.log(colors.blue + 'MCP Chat + Email Setup Validator' + colors.reset);
    console.log(colors.blue + '═══════════════════════════════════════\n' + colors.reset);

    const results = {
        files: true,
        python: true,
        env: true,
    };

    console.log('📁 Checking files...');
    results.files = await checkFileExists(PYTHON_PATH, 'Python .venv');
    results.files = (await checkFileExists(SERVER_PATH, 'MCP Server')) && results.files;
    results.files = (await checkFileExists(ENV_PATH, 'Env file')) && results.files;
    results.files = (await checkFileExists(REQ_PATH, 'Requirements')) && results.files;

    console.log('\n🐍 Checking Python setup...');
    results.python = await checkPythonDeps();

    console.log('\n⚙️  Checking configuration...');
    results.env = await checkEnvFile();

    // Summary
    console.log('\n' + colors.blue + '═══════════════════════════════════════' + colors.reset);
    if (results.files && results.python && results.env) {
        log.ok('ALL CHECKS PASSED ✨');
        console.log('\n📌 Next steps:');
        console.log('  1. Terminal 1: npm run server');
        console.log('  2. Terminal 2: npm start');
        console.log('  3. Open: http://localhost:3000');
        console.log('\nTest email: "gửi email đến your_email@gmail.com chủ đề Test body Xin chào"');
        process.exit(0);
    } else {
        log.err('SETUP INCOMPLETE');
        console.log('\n📌 Fix these issues first:');
        if (!results.files) console.log('  • Check file paths in setup');
        if (!results.python) console.log('  • Run: pip install -r requirements.txt');
        if (!results.env) console.log('  • Update .env with Gmail credentials');
        process.exit(1);
    }
}

runTests().catch(err => {
    log.err(`Unexpected error: ${err.message}`);
    process.exit(1);
});
