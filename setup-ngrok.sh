#!/bin/bash

# Setup script for ngrok HTTPS tunnel for Cashfree local testing

echo "🚀 Cashfree Local HTTPS Setup"
echo "=============================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Install it with:"
    echo "  brew install ngrok"
    echo ""
    echo "Or download from: https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if port 8080 is in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Port 8080 is running (frontend server)"
else
    echo "⚠️  Port 8080 is not running. Start your frontend first:"
    echo "   npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Starting ngrok tunnel..."
echo "This will create an HTTPS URL like: https://abc123.ngrok-free.app"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Copy the HTTPS URL from ngrok output"
echo "2. Add it to Cashfree whitelisting: https://merchant.cashfree.com/developers/whitelisting"
echo "3. Add NGROK_URL to .env file: NGROK_URL=https://your-ngrok-url.ngrok-free.app"
echo "4. Restart your backend server"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

# Start ngrok
ngrok http 8080


