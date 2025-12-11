#!/bin/bash
# Interactive script to help update .env file

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════════"
echo "  🔑 Update .env File with Your API Keys"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check current .env
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi

echo "📋 Current .env file status:"
echo ""

# Check each required key
MISSING_KEYS=()

if grep -q "REPLACE_WITH_YOUR_SERVICE_ROLE_SECRET\|your-service-role-key-here" .env; then
  echo "  ❌ SUPABASE_SERVICE_ROLE_KEY needs to be updated"
  MISSING_KEYS+=("SUPABASE_SERVICE_ROLE_KEY")
else
  SUPABASE_SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2)
  if [ -z "$SUPABASE_SERVICE_KEY" ] || [ "${#SUPABASE_SERVICE_KEY}" -lt 50 ]; then
    echo "  ⚠️  SUPABASE_SERVICE_ROLE_KEY looks invalid (too short)"
    MISSING_KEYS+=("SUPABASE_SERVICE_ROLE_KEY")
  else
    echo "  ✅ SUPABASE_SERVICE_ROLE_KEY is set"
  fi
fi

if grep -q "REPLACE_WITH_YOUR_ANON_KEY\|your-anon-key-here" .env; then
  echo "  ❌ VITE_SUPABASE_ANON_KEY needs to be updated"
  MISSING_KEYS+=("VITE_SUPABASE_ANON_KEY")
else
  ANON_KEY=$(grep "^VITE_SUPABASE_ANON_KEY=" .env | cut -d'=' -f2)
  if [ -z "$ANON_KEY" ] || [ "${#ANON_KEY}" -lt 50 ]; then
    echo "  ⚠️  VITE_SUPABASE_ANON_KEY looks invalid (too short)"
    MISSING_KEYS+=("VITE_SUPABASE_ANON_KEY")
  else
    echo "  ✅ VITE_SUPABASE_ANON_KEY is set"
  fi
fi

if grep -q "REPLACE_WITH_YOUR_GROQ_KEY\|your-groq-api-key-here" .env; then
  echo "  ❌ GROQ_API_KEY needs to be updated"
  MISSING_KEYS+=("GROQ_API_KEY")
else
  GROQ_KEY=$(grep "^GROQ_API_KEY=" .env | cut -d'=' -f2)
  if [ -z "$GROQ_KEY" ] || [ "${#GROQ_KEY}" -lt 20 ]; then
    echo "  ⚠️  GROQ_API_KEY looks invalid (too short)"
    MISSING_KEYS+=("GROQ_API_KEY")
  else
    echo "  ✅ GROQ_API_KEY is set"
  fi
fi

echo ""

if [ ${#MISSING_KEYS[@]} -eq 0 ]; then
  echo "✅ All required keys are set!"
  echo ""
  echo "🧪 Testing connection..."
  npm run test:supabase
else
  echo "⚠️  Missing or invalid keys found:"
  for key in "${MISSING_KEYS[@]}"; do
    echo "   - $key"
  done
  echo ""
  echo "📝 To update:"
  echo "   1. Open .env file: nano .env (or code .env)"
  echo "   2. Replace the placeholder values with your actual keys"
  echo "   3. Get keys from:"
  echo "      • Supabase: https://supabase.com/dashboard/project/xgraxcgavqeyqfwimbwt/settings/api"
  echo "      • Groq: https://console.groq.com"
  echo "   4. Run this script again: ./update-env.sh"
  echo ""
fi


