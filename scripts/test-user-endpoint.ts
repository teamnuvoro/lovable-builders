#!/usr/bin/env tsx
// Test what user ID the endpoint is using

import 'dotenv/config';

const userId = 'c5c19cf0-dd24-4357-bf60-57b7d78c48e5';

console.log('🧪 Testing API endpoint with user ID:', userId);
console.log('');

const response = await fetch('http://localhost:3000/api/user/usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
  credentials: 'include'
});

const data = await response.json();
console.log('📊 API Response:');
console.log(JSON.stringify(data, null, 2));
console.log('');

if (data.premiumUser) {
  console.log('❌ Still showing premium!');
  console.log('💡 The endpoint is probably using DEV_USER_ID instead of your actual user ID');
} else {
  console.log('✅ Showing free plan correctly!');
}


