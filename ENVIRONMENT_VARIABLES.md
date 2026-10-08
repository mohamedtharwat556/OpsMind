# OpsMind Environment Variables

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

## Variable Descriptions

### `VITE_SUPABASE_URL`
- **Type:** String (URL)
- **Purpose:** Supabase project URL
- **Format:** `https://[project-id].supabase.co`
- **Where to get it:** Supabase Project Settings → API → Project URL
- **Required:** YES

### `VITE_SUPABASE_ANON_KEY`
- **Type:** String (API Key)
- **Purpose:** Supabase anonymous/public API key for client-side authentication
- **Format:** Long string starting with `eyJ...`
- **Where to get it:** Supabase Project Settings → API → anon key
- **Required:** YES
- **Note:** This is the public/anonymous key, safe to expose in frontend code (used by Supabase Auth)

### `VITE_GEMINI_API_KEY`
- **Type:** String (API Key)
- **Purpose:** Google Gemini API key for AI-powered knowledge retrieval
- **Format:** Long alphanumeric string
- **Where to get it:** Google Cloud Console → APIs & Services → Credentials
- **Required:** YES
- **Note:** Keep this secure. Do not expose in version control.

## Setup Instructions

1. **Create .env file:**
   ```bash
   cp .env.example .env
   ```
   (or manually create `.env` in project root)

2. **Add Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Click "Settings" → "API"
   - Copy `Project URL` and `anon public key`
   - Paste into `.env`

3. **Add Gemini API key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create or select a project
   - Enable Generative Language API
   - Create an API key credential
   - Paste into `.env`

4. **Verify setup:**
   ```bash
   npm run dev
   ```
   Application should start without credential errors

## File Location

`.env` file should be in the project root:
```
OpsMind-main/
├── .env              ← Create here
├── src/
├── package.json
└── ...
```

## Security Notes

- ✅ `.env` is included in `.gitignore`
- ✅ Never commit `.env` file
- ✅ Never share `.env` values
- ✅ Rotate keys if accidentally exposed
- ✅ Use environment-specific `.env` files for different deployments

## Example .env File

```
VITE_SUPABASE_URL=https://project-abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyD1234567890abcdefghij...
```

## Verification

After setting up environment variables:

1. Start development server:
   ```bash
   npm run dev
   ```

2. Test login with valid Supabase user

3. Test AI Knowledge feature - should retrieve documents

4. Check browser console for any credential-related errors

## Troubleshooting

**Issue:** "Supabase is not configured" message  
**Solution:** Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set in `.env`

**Issue:** Login fails with "Invalid credentials"  
**Solution:** Ensure Supabase project has users created in auth.users table

**Issue:** AI Knowledge returns error  
**Solution:** Verify VITE_GEMINI_API_KEY is valid and Generative Language API is enabled

---

**Note:** All variable values must be kept confidential. These instructions document only the variable names and purposes, never their actual values.
