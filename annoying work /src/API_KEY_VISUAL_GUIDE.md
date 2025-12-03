# 🎯 Visual Guide: Adding Your API Key

## 📍 The Exact Location

Your API key needs to go in **ONE specific place**:

```
File: /config/vapi-config.ts
Line: 6
```

---

## 🔍 What It Looks Like Now (BEFORE)

```typescript
1: // Vapi.ai Configuration for Real AI Voice Calling
2: 
3: export const VAPI_CONFIG = {
4:   // Get your API key from: https://vapi.ai
5:   // Sign up → Dashboard → API Keys
6:   publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE", // ← CHANGE THIS LINE!
7: };
```

**☝️ See line 6? That's what you need to change!**

---

## ✅ What It Should Look Like (AFTER)

```typescript
1: // Vapi.ai Configuration for Real AI Voice Calling
2: 
3: export const VAPI_CONFIG = {
4:   // Get your API key from: https://vapi.ai
5:   // Sign up → Dashboard → API Keys
6:   publicKey: "vapi_pk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p", // ← YOUR REAL KEY!
7: };
```

**☝️ Replace the text with your actual Vapi key!**

---

## 📋 Copy-Paste Template

**Just copy this and fill in YOUR key:**

```typescript
publicKey: "PASTE_YOUR_VAPI_KEY_HERE",
```

**Example with a real key:**

```typescript
publicKey: "vapi_pk_ab12cd34ef56gh78ij90kl12mn34op56qr78st90",
```

---

## 🎯 Step-by-Step Replacement

### Step 1: Find the Text
Look for this in `/config/vapi-config.ts`:
```
"YOUR_VAPI_PUBLIC_KEY_HERE"
```

### Step 2: Select It
**Click and drag** to select ONLY the text inside the quotes:
```
YOUR_VAPI_PUBLIC_KEY_HERE
```
(Don't select the quotes!)

### Step 3: Paste Your Key
**Paste** your Vapi key:
```
vapi_pk_1a2b3c4d5e6f...
```

### Step 4: Final Result
Should look like:
```typescript
publicKey: "vapi_pk_1a2b3c4d5e6f...",
```

---

## ✅ Common Mistakes to Avoid

### ❌ WRONG: Removed the quotes
```typescript
publicKey: vapi_pk_1a2b3c4d5e6f,  // ❌ No quotes!
```

### ✅ CORRECT: Kept the quotes
```typescript
publicKey: "vapi_pk_1a2b3c4d5e6f",  // ✅ Has quotes!
```

---

### ❌ WRONG: Extra spaces
```typescript
publicKey: "  vapi_pk_1a2b3c4d5e6f  ",  // ❌ Spaces inside!
```

### ✅ CORRECT: No extra spaces
```typescript
publicKey: "vapi_pk_1a2b3c4d5e6f",  // ✅ Clean!
```

---

### ❌ WRONG: Missing comma
```typescript
publicKey: "vapi_pk_1a2b3c4d5e6f"  // ❌ No comma at end!
};
```

### ✅ CORRECT: Has comma
```typescript
publicKey: "vapi_pk_1a2b3c4d5e6f",  // ✅ Comma at end!
};
```

---

## 🖥️ How to Edit in VS Code

### Method 1: Find and Replace

1. **Open VS Code**
2. **Press:** `Ctrl+H` (Windows) or `Cmd+H` (Mac)
3. **In "Find" box:** Type `YOUR_VAPI_PUBLIC_KEY_HERE`
4. **In "Replace" box:** Paste your Vapi key
5. **Click "Replace"**
6. **Save:** `Ctrl+S` or `Cmd+S`

### Method 2: Manual Edit

1. **Open VS Code**
2. **Navigate to:** `/config/vapi-config.ts`
3. **Go to line 6** (see line numbers on left)
4. **Click between the quotes**
5. **Delete the placeholder text**
6. **Paste your Vapi key**
7. **Save:** `Ctrl+S` or `Cmd+S`

---

## 🎯 What Your Vapi Key Looks Like

Your key will **always** start with:
```
vapi_pk_
```

Followed by a long string of random letters and numbers:
```
vapi_pk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
```

**Length:** Usually 40-60 characters

**Example (fake) keys:**
```
vapi_pk_abc123def456ghi789jkl012mno345pqr678stu
vapi_pk_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0
vapi_pk_aaabbbcccdddeeefff111222333444555666777
```

**Your key will be unique!**

---

## 🧪 How to Test If It Worked

### Before Adding Key:

**Console shows:**
```
⚠️ VAPI API KEY MISSING!
📝 To enable real voice calling:
1. Go to https://vapi.ai/signup
...
```

### After Adding Key:

**Console shows:**
```
✅ REAL AI VOICE CALLING ENABLED!
🎉 Vapi.ai is configured and ready!
🎤 Click any audio call button to start talking
```

---

## 🔄 Complete Flow

```
1. Get key from Vapi.ai
   ↓
2. Open /config/vapi-config.ts
   ↓
3. Find line 6: publicKey: "YOUR_VAPI_PUBLIC_KEY_HERE",
   ↓
4. Select: YOUR_VAPI_PUBLIC_KEY_HERE
   ↓
5. Paste your key: vapi_pk_1a2b3c4d...
   ↓
6. Result: publicKey: "vapi_pk_1a2b3c4d...",
   ↓
7. Save file (Ctrl+S)
   ↓
8. Restart: npm run dev
   ↓
9. Refresh browser
   ↓
10. Test voice calling!
```

---

## 🎬 Screen Recording Guide

If you're recording/streaming, **HIDE your API key** first:

1. **Replace digits with X's:**
   ```typescript
   publicKey: "vapi_pk_XXXXXXXXXXXXXXXXXXX",
   ```

2. **Or blur the screen** when showing that file

3. **Delete the key** from recordings/screenshots

---

## 📝 Quick Copy-Paste Checklist

Before saving, verify:

- [ ] Key starts with `vapi_pk_`
- [ ] Key is inside quotes `"..."`
- [ ] No extra spaces before/after key
- [ ] Comma at the end `,`
- [ ] File is saved
- [ ] Dev server restarted

**If all checked ✅ → It will work!**

---

## 🎉 Example: Complete Config File

Here's what your **entire file** should look like after adding the key:

```typescript
// Vapi.ai Configuration for Real AI Voice Calling

export const VAPI_CONFIG = {
  // Get your API key from: https://vapi.ai
  // Sign up → Dashboard → API Keys
  publicKey: "vapi_pk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n", // ✅ Your real key
};

// AI Assistant configurations for each character
export const AI_ASSISTANTS = {
  Riya: {
    name: "Riya",
    voice: "pNInz6obpgDQGcFmaJgB",
    systemPrompt: `You are Riya...`,
  },
  // ... rest of file stays the same
};
```

**Only line 6 changes!** Everything else stays exactly the same.

---

## 🎯 Success!

Once you see this in your console:
```
✅ REAL AI VOICE CALLING ENABLED!
```

You're done! Now test it:

1. Click audio call
2. Allow microphone
3. Wait for AI to greet you
4. Start talking!

**See `/WHAT_TO_EXPECT.md` for what happens next!**

---

**Remember: Only change line 6, keep the quotes, save the file!** 🚀
