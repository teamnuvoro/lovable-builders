#!/bin/bash

echo "🗑️  CLEARING TEST USERS FROM DATABASE"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will delete ALL test users!"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    echo ""
    echo "🔧 Running cleanup script..."
    node clear-test-users.js
else
    echo "❌ Cancelled"
fi
