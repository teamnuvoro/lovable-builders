#!/bin/bash
# Interactive script to add API keys to .env

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════════"
echo "  🔑 Add Your API Keys to .env"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "I'll help you add your keys. You need to get them first:"
echo ""
echo "📋 Step 1: Get Supabase Keys"
echo "   → Go to: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api"
echo "   → Copy 'Service Role Secret' (long string starting with eyJ...)"
echo "   → Copy 'Anon Public Key' (long string starting with eyJ...)"
echo ""
echo "📋 Step 2: Get Groq Key"
echo "   → Go to: https://console.groq.com"
echo "   → Create/Get API key"
echo ""
read -p "Press Enter when you have your keys ready..."
echo ""

# Get Supabase Service Role Key
echo "1️⃣  Enter your SUPABASE_SERVICE_ROLE_KEY:"
read -s SERVICE_KEY
if [ ! -z "$SERVICE_KEY" ]; then
  sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY|" .env
  echo "   ✅ Updated SUPABASE_SERVICE_ROLE_KEY"
else
  echo "   ⏭️  Skipped"
fi
echo ""

# Get Supabase Anon Key
echo "2️⃣  Enter your VITE_SUPABASE_ANON_KEY:"
read -s ANON_KEY
if [ ! -z "$ANON_KEY" ]; then
  sed -i.bak "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$ANON_KEY|" .env
  echo "   ✅ Updated VITE_SUPABASE_ANON_KEY"
else
  echo "   ⏭️  Skipped"
fi
echo ""

# Get Groq Key
echo "3️⃣  Enter your GROQ_API_KEY:"
read -s GROQ_KEY
if [ ! -z "$GROQ_KEY" ]; then
  sed -i.bak "s|GROQ_API_KEY=.*|GROQ_API_KEY=$GROQ_KEY|" .env
  echo "   ✅ Updated GROQ_API_KEY"
else
  echo "   ⏭️  Skipped"
fi
echo ""

# Clean up backup
rm -f .env.bak

echo "═══════════════════════════════════════════════════════════"
echo "  🧪 Testing Connection..."
echo "═══════════════════════════════════════════════════════════"
echo ""

npm run test:supabase


