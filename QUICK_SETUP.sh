#!/bin/bash
# Complete setup script - run this to set everything up

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════════"
echo "  🚀 Riya AI - Local Development Setup"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Check .env file
echo "📋 Step 1: Checking .env file..."
if [ ! -f .env ]; then
  echo "   ❌ .env file not found - creating template..."
  cat > .env << 'ENVEOF'
SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_YOUR_SERVICE_ROLE_SECRET
VITE_SUPABASE_URL=https://xgraxcgavqeyqfwimbwt.supabase.co
VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_ANON_KEY
NODE_ENV=development
PORT=3000
GROQ_API_KEY=REPLACE_WITH_YOUR_GROQ_KEY
CASHFREE_APP_ID=REPLACE_WITH_YOUR_CASHFREE_APP_ID
CASHFREE_SECRET_KEY=REPLACE_WITH_YOUR_CASHFREE_SECRET
CASHFREE_ENV=TEST
SESSION_SECRET=dev-session-secret
ENVEOF
  echo "   ✅ Created .env template"
else
  echo "   ✅ .env file exists"
fi

# Step 2: Check if keys are placeholders
echo ""
echo "📋 Step 2: Checking if keys need to be updated..."
NEEDS_UPDATE=false

if grep -q "REPLACE_WITH\|your-service-role-key-here\|your-groq-api-key-here" .env 2>/dev/null; then
  NEEDS_UPDATE=true
  echo "   ⚠️  .env file has placeholder values"
  echo ""
  echo "   📝 You need to update these in .env:"
  echo "      - SUPABASE_SERVICE_ROLE_KEY (get from Supabase dashboard)"
  echo "      - VITE_SUPABASE_ANON_KEY (get from Supabase dashboard)"
  echo "      - GROQ_API_KEY (get from https://console.groq.com)"
  echo ""
  echo "   🔗 Get Supabase keys from:"
  echo "      https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api"
  echo ""
else
  echo "   ✅ .env file looks configured"
fi

# Step 3: Test Supabase connection
echo ""
echo "📋 Step 3: Testing Supabase connection..."
if [ "$NEEDS_UPDATE" = false ]; then
  if npm run test:supabase 2>/dev/null; then
    echo "   ✅ Supabase connection successful!"
    SUPABASE_OK=true
  else
    echo "   ❌ Supabase connection failed"
    echo "   💡 Check your SUPABASE_SERVICE_ROLE_KEY in .env"
    SUPABASE_OK=false
  fi
else
  echo "   ⏭️  Skipping (keys need to be updated first)"
  SUPABASE_OK=false
fi

# Step 4: Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📊 Setup Summary"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$SUPABASE_OK" = true ]; then
  echo "✅ Everything is ready!"
  echo ""
  echo "🚀 To start the server:"
  echo "   ./start-dev.sh"
  echo ""
  echo "🌐 Then in another terminal:"
  echo "   npm run dev"
  echo ""
  echo "📱 Open: http://localhost:3000"
else
  echo "⚠️  Setup incomplete"
  echo ""
  echo "📝 Next steps:"
  echo "   1. Edit .env file and add your actual API keys"
  echo "   2. Run this script again: ./QUICK_SETUP.sh"
  echo "   3. Or test manually: npm run test:supabase"
  echo ""
  echo "🔑 Where to get keys:"
  echo "   • Supabase: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api"
  echo "   • Groq: https://console.groq.com"
  echo ""
fi

echo "═══════════════════════════════════════════════════════════"


