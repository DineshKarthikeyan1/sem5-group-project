# Signup Troubleshooting Guide

## 🔍 How to Debug Signup Issues

### Step 1: Use the Debug Button

1. Open your app at `http://localhost:5174/voice-assisted-financial-manager`
2. Click the red **"Debug"** button in the top-right corner
3. Run all three tests:
   - **Test Signup (via Service)** - Tests your auth service
   - **Test Direct Supabase Auth** - Tests direct Supabase connection
   - **Test Project Settings** - Verifies project accessibility

### Step 2: Check Browser Console

1. Open Developer Tools (F12)
2. Go to the **Console** tab
3. Try to sign up and watch for error messages
4. Look for detailed error information

## 🚨 Common Issues & Solutions

### Issue 1: "Email confirmation required"

**Symptoms:** Signup seems to work but you can't log in
**Solution:**

1. Check your email (including spam folder)
2. Click the confirmation link
3. Or disable email confirmation in Supabase Dashboard:
   - Go to Authentication > Settings
   - Turn off "Enable email confirmations"

### Issue 2: "Invalid login credentials"

**Symptoms:** Error during signup or login
**Solution:**

1. Check if email confirmation is required
2. Verify your Supabase project is active
3. Check Site URL in Supabase Dashboard

### Issue 3: "Failed to fetch" or Network errors

**Symptoms:** Cannot connect to Supabase
**Solution:**

1. Verify your `.env` file has correct credentials
2. Check if your Supabase project is paused
3. Restart your dev server: `npm run dev`

### Issue 4: Environment variables not loading

**Symptoms:** Debug shows "Missing" for URL or key
**Solution:**

1. Restart your dev server
2. Check `.env` file is in the correct location
3. Verify variable names start with `VITE_`

## 🔧 Supabase Dashboard Checklist

Go to your Supabase Dashboard and verify:

### Authentication Settings

- [ ] Email authentication is **enabled**
- [ ] Site URL is set to `http://localhost:5174` (or your dev server URL)
- [ ] Redirect URLs include your development URL
- [ ] Email templates are configured (if using email confirmation)

### Project Status

- [ ] Project is **active** (not paused)
- [ ] Database is accessible
- [ ] API keys are valid

## 🧪 Manual Testing Steps

1. **Test Environment Variables:**

   ```javascript
   console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
   console.log(
     "Anon Key:",
     import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing"
   );
   ```

2. **Test Direct Supabase Call:**

   ```javascript
   import { supabase } from "./lib/supabase";

   const testAuth = async () => {
     const { data, error } = await supabase.auth.signUp({
       email: "test@example.com",
       password: "testpassword123",
     });
     console.log("Result:", { data, error });
   };
   ```

## 📞 Next Steps

If you're still having issues:

1. Share the console output from the debug tests
2. Let me know the specific error message you're seeing
3. Tell me at which step the signup fails

The debug tools will help us identify exactly what's going wrong! 🔍
