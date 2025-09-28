# Supabase Auth Configuration for Custom Domain

## Required Manual Configuration Steps

After updating the code, you must configure Supabase project settings to ensure email confirmation links use your custom domain (`https://www.understoryanalytics.com`) instead of localhost.

### 1. Update Site URL in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/xqfimjbxjwisvknvgutx
2. Navigate to **Authentication** → **Settings**
3. Update the following fields:

**Site URL:**
```
https://www.understoryanalytics.com
```

**Redirect URLs:**
Add these URLs (one per line):
```
https://www.understoryanalytics.com/auth/callback
https://www.understoryanalytics.com/auth/callback/**
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback/**
```

### 2. Configure Email Templates

1. In the Supabase dashboard, go to **Authentication** → **Email Templates**
2. Update the **Confirm signup** template:

**Subject:** Confirm Your Account - Understory Analytics

**Body:** Update the confirmation link in the template to use:
```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup">
  Confirm your account
</a>
```

### 3. Environment Variables (Already Done)

The following environment variable has been added to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://www.understoryanalytics.com
```

### 4. Code Changes Summary (Already Implemented)

#### Updated `src/lib/supabase.ts`:
- Added `emailRedirectTo` option to `signUp` function
- Uses `NEXT_PUBLIC_SITE_URL` environment variable

#### Enhanced `src/app/auth/callback/route.ts`:
- Added comprehensive error handling
- Proper success message forwarding
- Automatic user profile creation during email confirmation

#### Updated UI Components:
- Login page displays auth callback error messages
- Dashboard shows success messages from email confirmation

### 5. Testing the Fix

After making the Supabase dashboard changes:

1. **Test Signup Flow:**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:3000/signup
   - Create a new account with a real email
   - Check your email - the confirmation link should point to `https://www.understoryanalytics.com/auth/callback`

2. **Test Email Confirmation:**
   - Click the confirmation link in the email
   - Should redirect to dashboard with success message
   - User should be logged in automatically

3. **Test Error Handling:**
   - Try invalid confirmation links
   - Should redirect to login with appropriate error messages

### 6. Production Deployment

The changes are ready for production deployment. The email links will automatically use the production domain when deployed to Vercel.

### 7. Verification Checklist

- [ ] Supabase Site URL updated to `https://www.understoryanalytics.com`
- [ ] Redirect URLs added for both production and development
- [ ] Email templates use `{{ .SiteURL }}` for dynamic URLs
- [ ] Test signup with real email address
- [ ] Confirm email links point to production domain
- [ ] Test complete auth flow from signup to dashboard

## Notes

- The `NEXT_PUBLIC_SITE_URL` environment variable allows for different URLs in different environments
- The auth callback route handles both success and error cases gracefully
- Email templates will automatically use the correct domain based on your Supabase Site URL setting
- All existing users and functionality remain unaffected by these changes