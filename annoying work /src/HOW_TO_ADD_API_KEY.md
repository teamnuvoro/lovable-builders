# 🔑 How to Add Your Vapi API Key - Step by Step

## ⚠️ Current Issue

You're seeing these errors:
```
⚠️ VAPI API KEY MISSING!
Vapi not initialized. Please add your API key
```

This means the app is in **DEMO MODE** - you can see the UI but can't actually talk to the AI.

---

## 🚀 Fix It in 10 Minutes!

### Step 1: Get Your Vapi API Key (5 minutes)

#### Option A: If You Don't Have an Account Yet

1. **Open your browser** and go to:
   ```
   https://vapi.ai/signup
   ```

2. **Sign up** with:
   - Email and password
   - OR use Google login
   - OR use GitHub login

3. **Verify your email** (check your inbox)

4. **You'll be redirected to the Vapi Dashboard**

#### Option B: If You Already Have an Account

1. Go to:
   ```
   https://vapi.ai/login
   ```

2. Login with your credentials

---

### Step 2: Get Your API Key (2 minutes)

Once you're in the **Vapi Dashboard**:

1. **Look at the left sidebar** - you'll see menu items like:
   - Dashboard
   - **API Keys** ← Click this!
   - Usage
   - Settings

2. **Click on "API Keys"**

3. **Click the "Create New Key" button** (or "+ New API Key")

4. **Give it a name** (optional):
   - Example: "Riya AI Production"
   - Or just use the default name

5. **Click "Create"**

6. **COPY THE KEY!** It will look like:
   ```
   vapi_pk_1a2b3c4d5e6f7g8h9i0j...
   ```
   
   ⚠️ **IMPORTANT:** You won't see this key again! Copy it now!

7. **Save it somewhere safe** (temporarily):
   - Paste it in Notepad/TextEdit
   - Or keep the tab open

---

### Step 3: Add Key to Your App (2 minutes)

#### Method 1: Edit Directly in Your Code Editor

1. **Open your project** in VS Code (or your editor)

2. **Navigate to this file:**
   ```
   /config/vapi-config.ts
   ```

3. **Find line 6** which says:
   ```typescript
   publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE", // Replace with your actual key
   ```

4. **Replace the text** with your actual key:
   
   **BEFORE:**
   ```typescript
   publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE",
   ```
   
   **AFTER:**
   ```typescript
   publicKey: "vapi_pk_1a2b3c4d5e6f7g8h9i0j...",
   ```
   
   ⚠️ **Keep the quotes!** The key should be inside `"..."` quotes

5. **Save the file** (Ctrl+S or Cmd+S)

---

### Step 4: Restart Your App (1 minute)

1. **Stop your dev server** if it's running:
   - Press `Ctrl+C` in the terminal
   - Or close the terminal

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Refresh your browser**

---

### Step 5: Verify It's Working! ✅

You'll know it worked when you see in the **console** (press F12):

```
============================================================
✅ REAL AI VOICE CALLING ENABLED!
============================================================

🎉 Vapi.ai is configured and ready!
🎤 Click any audio call button to start talking
📚 See /WHAT_TO_EXPECT.md for details

============================================================
```

---

## 🎯 Visual Example

### What Your Code Should Look Like:

**❌ WRONG (Current):**
```typescript
export const VAPI_CONFIG = {
  publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE", // ❌ Not a real key
};
```

**✅ CORRECT (After adding your key):**
```typescript
export const VAPI_CONFIG = {
  publicKey: "vapi_pk_1a2b3c4d5e6f7g8h9i0j...", // ✅ Real key
};
```

---

## 🧪 Test It!

1. **Open your app** in the browser

2. **Go through the flow:**
   - Click "Let's Get Started"
   - Fill in the form
   - Select an AI (Riya, Priya, Ananya, or Maya)
   - Click "Continue"

3. **Click the phone icon** (audio call button)

4. **Allow microphone** when prompted

5. **Wait 3-5 seconds**

6. **You should HEAR the AI say:**
   > "Namaste! Main Riya hoon. Kaise ho aap? Aaj kya baat karni hai?"

7. **Start talking!** Say: "Hi Riya, how are you?"

8. **AI should respond with voice!** 🎉

---

## 🐛 Still Not Working?

### Issue 1: Console Still Shows "API KEY MISSING"

**Problem:** You didn't save the file or typed the key incorrectly

**Fix:**
1. Double-check `/config/vapi-config.ts` line 6
2. Make sure you saved the file (Ctrl+S)
3. Make sure the key is inside quotes: `"vapi_pk_..."`
4. Restart dev server: `npm run dev`

---

### Issue 2: Error "Invalid API Key"

**Problem:** The key was copied incorrectly or is invalid

**Fix:**
1. Go back to Vapi Dashboard → API Keys
2. Create a NEW key
3. Copy it carefully (no extra spaces)
4. Paste it again in `/config/vapi-config.ts`
5. Save and restart

---

### Issue 3: "Failed to start AI call"

**Problem:** Internet connection or Vapi service issue

**Fix:**
1. Check your internet connection
2. Try again in a few seconds
3. Check Vapi status: https://status.vapi.ai

---

## 💰 Check Your Free Credits

After you add the key, you get **10 FREE minutes** to test!

**To check your usage:**

1. Go to **Vapi Dashboard**: https://vapi.ai/dashboard
2. Click **"Usage"** in the sidebar
3. You'll see:
   - Total minutes used
   - Remaining free minutes
   - Cost (should be $0 for first 10 minutes)

---

## 🔒 Security Tips

### ✅ DO:
- Keep your API key private
- Don't share it with anyone
- Don't commit it to public GitHub repos

### ❌ DON'T:
- Post your key online
- Share screenshots with the key visible
- Add it to version control without `.gitignore`

### For Production:
Use environment variables instead:

1. Create `.env` file:
   ```
   VITE_VAPI_PUBLIC_KEY=vapi_pk_your_key_here
   ```

2. Update `/config/vapi-config.ts`:
   ```typescript
   publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || "YOUR_VAPI_PUBLIC_KEY_HERE",
   ```

3. Add `.env` to `.gitignore`

---

## ✅ Success Checklist

- [ ] Signed up for Vapi.ai
- [ ] Created API key in dashboard
- [ ] Copied the key
- [ ] Opened `/config/vapi-config.ts`
- [ ] Replaced `"YOUR_VAPI_PUBLIC_KEY_HERE"` with real key
- [ ] Kept the quotes around the key
- [ ] Saved the file
- [ ] Restarted dev server (`npm run dev`)
- [ ] Refreshed browser
- [ ] Console shows "✅ REAL AI VOICE CALLING ENABLED!"
- [ ] Tested audio call
- [ ] Heard AI's voice
- [ ] Had a conversation!

---

## 🎉 You're Done!

Once you complete these steps, your app will have **REAL AI VOICE CALLING** and users can actually talk to Riya, Priya, Ananya, and Maya!

**Next:** Test it thoroughly using `/TESTING_CHECKLIST.md`

---

## 🆘 Still Stuck?

1. **Check the console** (F12 → Console tab) for error messages
2. **Read `/QUICK_START.md`** for alternative instructions
3. **Check Vapi docs:** https://docs.vapi.ai
4. **Contact Vapi support:** support@vapi.ai

---

**Remember:** The key starts with `vapi_pk_` and should be inside quotes!

Good luck! 🚀
