#!/bin/bash
# Complete setup and test script

cd "$(dirname "$0")"

echo "🚀 Setting up and testing your local environment..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  echo ""
  echo "Creating .env file template..."
  cat > .env << 'ENVEOF'
# ==========================================
# SUPABASE (REQUIRED - Get from Supabase Dashboard)
# ==========================================
# Go to: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api
SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_SERVICE_ROLE_SECRET_HERE
VITE_SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE

# ==========================================
# SERVER CONFIGURATION
# ==========================================
NODE_ENV=development
PORT=3000
SESSION_SECRET=dev-session-secret-change-in-production

# ==========================================
# AI SERVICES (REQUIRED for chat)
# ==========================================
GROQ_API_KEY=PASTE_YOUR_GROQ_KEY_HERE

# ==========================================
# PAYMENTS - CASHFREE (REQUIRED for payment testing)
# ==========================================
CASHFREE_APP_ID=PASTE_YOUR_CASHFREE_APP_ID
CASHFREE_SECRET_KEY=PASTE_YOUR_CASHFREE_SECRET
CASHFREE_ENV=TEST
ENVEOF
  echo "✅ Created .env file template"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env file and add your actual keys!"
  echo "   Get Supabase keys from: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api"
  echo ""
  exit 1
fi

echo "✅ .env file exists"
echo ""

# Test Supabase connection
echo "🔍 Testing Supabase connection..."
echo ""

if npm run test:supabase 2>/dev/null; then
  echo ""
  echo "✅ All checks passed!"
  echo ""
  echo "🎉 You're ready to go!"
  echo ""
  echo "Next steps:"
  echo "  1. Start the server: ./start-dev.sh"
  echo "  2. In another terminal, start frontend: npm run dev"
  echo "  3. Open: http://localhost:3000"
  echo ""
else
  echo ""
  echo "❌ Supabase connection test failed"
  echo ""
  echo "Please check:"
  echo "  1. Your .env file has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  echo "  2. Keys are correct (get them from Supabase dashboard)"
  echo "  3. No extra spaces or quotes around the keys"
  echo ""
  echo "Get keys from: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api"
  echo ""
  exit 1
fi


