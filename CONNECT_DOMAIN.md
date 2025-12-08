# How to Connect `riya-ai.site` to Your App

Great! You have purchased the domain. Now we need to point it to your server (Render).

### Step 1: Get the Details from Render
1. Go to your **Render Dashboard**.
2. Click on your web service (the app).
3. Go to **Settings** -> Scroll down to **Custom Domains**.
4. Click **Add Custom Domain**.
5. Enter: `riya-ai.site`
6. Click **Save**.
7. Render will now show you two required DNS records. They usually look like this:
   - **A Record**: `216.24.57.1` (This is Render's simplified IP)
   - **CNAME Record**: `your-app-name.onrender.com`

*(Note: Render might give you a different IP, use the one they show you.)*

### Step 2: Configure Namecheap (The Screenshot You Sent)
1. Go back to the Namecheap tab you screenshot.
2. Click on the **"Advanced DNS"** tab (It is the 4th tab next to "Sharing & Transfer").
3. You will likely see some default records (like "Parking Page"). **Delete them** (Trash icon).
4. Click **"ADD NEW RECORD"** (Red button).

#### Add Record #1 (The Root Domain)
*   **Type**: `A Record`
*   **Host**: `@`
*   **Value**: `216.24.57.1` (Or the IP Render gave you)
*   **TTL**: `Automatic`

#### Add Record #2 (The 'www' Subdomain)
*   **Type**: `CNAME Record`
*   **Host**: `www`
*   **Value**: `riya-ai.site` (OR your Render URL like `project1.onrender.com`)
    *   *Tip: Render usually recommends pointing `www` to your root domain or the onrender address.*
*   **TTL**: `Automatic`

### Step 3: Wait & Verify
1. Go back to the **Render Dashboard**.
2. Click **"Verify"** next to the domain.
3. It might take **5-30 minutes** for the changes to spread across the internet.
4. Once verified, Render will automatically issue a **Free SSL Certificate** (HTTPS) for you.

### Important Note on Redirects
In your Namecheap screenshot, I see a section at the bottom called **"REDIRECT DOMAIN"**.
*   It says `riya-ai.site` -> `http://www.riya-ai.site/`
*   This is a "Masked Redirect". **You should probably DELETE THIS** (Trash icon) before adding the DNS records in the "Advanced DNS" tab, as strict DNS records (A/CNAME) are better for web apps than redirects.
