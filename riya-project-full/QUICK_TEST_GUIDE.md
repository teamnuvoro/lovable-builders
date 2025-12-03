# 🚀 Quick Test Guide - Authentication System

## Test in 2 Minutes!

### Step 1: Start the App
```bash
cd /Users/joshuavaz/Documents/project1/riya-project-full
npm run dev
```

### Step 2: Open Browser
```
http://localhost:3000
```

### Step 3: Test Signup Flow

1. **Landing Page:**
   - You'll see a beautiful woman's image with call interface
   - Click the purple **"Let's Get Started"** button

2. **Signup Form:**
   - Enter any name: `Test User`
   - Enter any email: `test@example.com`
   - Enter any phone: `9876543210`
   - Click **"Get Verification Code"**

3. **Check Terminal:**
   - Look at your terminal/console where `npm run dev` is running
   - You'll see: `[DEV MODE] OTP for +919876543210: 123456`
   - Copy the 6-digit OTP

4. **Enter OTP:**
   - The page will show an OTP input field
   - Enter the 6-digit code from terminal
   - Click **"Verify & Create Account"**

5. **Success!**
   - You'll see a green checkmark animation
   - "Welcome to Riya! 🎉"
   - Auto-redirects to chat in 2 seconds

6. **Chat Page:**
   - You're now logged in!
   - Start chatting with Riya

### Step 4: Test Login Flow

1. **Logout:**
   - Click the menu (3 dots) in top navbar
   - Click "Logout"

2. **Go to Login:**
   - Click "Login" link on landing page

3. **Enter Phone:**
   - Enter the same phone: `9876543210`
   - Click **"Send Verification Code"**

4. **Check Terminal:**
   - Look for new OTP: `[DEV MODE] OTP for +919876543210: 654321`

5. **Enter OTP:**
   - Enter the new 6-digit code
   - Click **"Verify & Login"**

6. **Logged In!**
   - Welcome back message
   - Redirects to chat

---

## ✅ What to Verify

### In Browser:
- [ ] Landing page loads with image
- [ ] Signup form accepts input
- [ ] OTP screen appears after submitting
- [ ] Success animation plays
- [ ] Redirects to chat
- [ ] Login flow works
- [ ] Can logout and login again

### In Terminal:
- [ ] OTP printed for signup
- [ ] OTP printed for login
- [ ] No errors in console

### In Supabase:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor**
4. Check **users** table:
   - [ ] New user row created
   - [ ] Name, email, phone saved
   - [ ] persona = 'sweet_supportive'
   - [ ] premium_user = false
5. Check **usage_stats** table:
   - [ ] New row for user
   - [ ] total_messages = 0
   - [ ] total_call_seconds = 0

---

## 🐛 Troubleshooting

### Issue: OTP not showing in terminal
**Solution:** Make sure you're looking at the correct terminal where `npm run dev` is running

### Issue: "User already exists"
**Solution:** Use a different phone number or email

### Issue: "Invalid OTP"
**Solution:** 
- Make sure you're copying the latest OTP from terminal
- OTPs expire after 10 minutes - request a new one

### Issue: Not redirecting to chat
**Solution:**
- Check browser console for errors
- Make sure Supabase credentials are in .env
- Verify tables exist in Supabase

---

## 📱 Enable Real SMS (Optional)

### Get Twilio Credentials:
1. Sign up: https://www.twilio.com/try-twilio
2. Get $15 free credit
3. Go to: https://console.twilio.com/
4. Copy:
   - Account SID
   - Auth Token
   - Phone Number

### Add to .env:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Restart:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Test:
- Now OTPs will be sent via SMS! 📲
- No need to check terminal
- Real SMS to user's phone

---

## 🎉 Success Indicators

You'll know it's working when:

✅ **Signup:**
- Form submits without errors
- OTP appears in terminal (dev mode)
- OTP verification succeeds
- Success screen shows
- Redirects to chat
- User appears in Supabase

✅ **Login:**
- Phone number recognized
- OTP sent
- OTP verification succeeds
- Redirects to chat
- Session active

✅ **Database:**
- User row in `users` table
- Usage stats row in `usage_stats` table
- All fields populated correctly

---

## 📞 Need Help?

**Check these files:**
- `AUTHENTICATION_SETUP.md` - Complete documentation
- `AUTHENTICATION_FLOW.md` - Visual diagrams
- Terminal logs - Error messages
- Browser console - Frontend errors

**Common fixes:**
- Restart server: `npm run dev`
- Clear browser cache: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Check Supabase connection
- Verify .env file has correct values

---

## ⏱️ Expected Timeline

- Landing page load: **Instant**
- Form submission: **1-2 seconds**
- OTP generation: **Instant**
- SMS delivery (production): **5-30 seconds**
- OTP verification: **1-2 seconds**
- Account creation: **1-2 seconds**
- Redirect to chat: **2 seconds**

**Total time (dev mode): ~10-15 seconds**
**Total time (production): ~20-45 seconds**

---

## 🎯 You're All Set!

The authentication system is fully functional and ready to use.

**Start testing now:**
```bash
npm run dev
```

Then visit: **http://localhost:3000**

Enjoy! 🚀
