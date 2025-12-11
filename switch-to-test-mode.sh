#!/bin/bash

# Quick script to switch to Cashfree TEST mode for local testing

echo "🔄 Switching to Cashfree TEST mode..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Update CASHFREE_ENV to TEST
if grep -q "CASHFREE_ENV=" .env; then
    # Replace existing CASHFREE_ENV
    sed -i '' 's/^CASHFREE_ENV=.*/CASHFREE_ENV=TEST/' .env
    echo "✅ Updated CASHFREE_ENV=TEST"
else
    # Add CASHFREE_ENV if it doesn't exist
    echo "" >> .env
    echo "# Cashfree Environment (TEST = no whitelisting needed)" >> .env
    echo "CASHFREE_ENV=TEST" >> .env
    echo "✅ Added CASHFREE_ENV=TEST"
fi

echo ""
echo "📝 Next steps:"
echo "1. Get TEST credentials from Cashfree:"
echo "   - Go to: https://merchant.cashfree.com"
echo "   - Click 'Switch to Test' (top right)"
echo "   - Go to Developers > API Keys"
echo "   - Copy TEST App ID and Secret Key"
echo ""
echo "2. Update .env with TEST credentials:"
echo "   CASHFREE_APP_ID=your_test_app_id"
echo "   CASHFREE_SECRET_KEY=your_test_secret_key"
echo ""
echo "3. Restart backend: ./start-dev.sh"
echo ""
echo "4. Test payment at http://localhost:8080 (no ngrok needed!)"

