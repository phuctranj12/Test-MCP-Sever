#!/bin/bash
# setup.sh — Auto setup MCP Server

set -e  # Exit on error

echo "🚀 Setting up MCP Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "/Users/anhphuc/Desktop/MCP SEVER"

# Step 1: Create virtual environment
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
else
    echo "✅ Virtual environment exists"
fi

# Step 2: Activate and install dependencies
echo "📥 Installing dependencies..."
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Step 3: Verify installation
echo ""
echo "🔍 Verifying installation..."
python3 -c "from mcp.server import Server; print('✅ mcp package OK')" || exit 1
python3 -c "import google.generativeai; print('✅ google-generativeai OK')" || exit 1
python3 -c "from dotenv import load_dotenv; print('✅ python-dotenv OK')" || exit 1

# Step 4: Check .env
echo ""
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "📝 Please create .env with your Gmail credentials"
else
    echo "✅ .env file exists"
    if grep -q "SENDER_PASSWORD=" .env; then
        echo "✅ SENDER_PASSWORD configured"
    else
        echo "⚠️  WARNING: SENDER_PASSWORD not configured in .env"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ MCP Server setup complete!"
echo ""
echo "📌 Next steps:"
echo "   1. Terminal 1: cd '/Users/anhphuc/Desktop/MCP CLIENT/client' && npm run server"
echo "   2. Terminal 2: cd '/Users/anhphuc/Desktop/MCP CLIENT/client' && npm start"
echo ""
