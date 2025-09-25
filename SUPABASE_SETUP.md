# Supabase Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `contract-search-app`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Your API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - Keep this secret!

### 3. Configure Environment Variables
1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 4. Set Up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all tables, indexes, and security policies

### 5. Import Your Contract Data
1. Run your contract normalizer script to generate the CSV
2. Use the data import script (we'll create this next):
   ```bash
   node scripts/import-contracts.js
   ```

## 🔧 Database Schema Overview

The schema includes:

### Core Tables
- **contracts** - All contract data from your normalizer
- **users** - User profiles with subscription tiers
- **saved_contracts** - User's saved contracts
- **search_history** - Track user searches

### Key Features
- ✅ Row Level Security (RLS) enabled
- ✅ Full-text search indexes
- ✅ Automatic timestamps
- ✅ Search count limits for free users
- ✅ Contract expiration tracking

### Security
- Users can only access their own data
- Contracts are publicly readable
- Admin functions use service role key

## 🧪 Testing Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test authentication:
   - Go to `/signup` and create a test account
   - Check if user appears in Supabase dashboard

3. Test contract search:
   - Go to `/search` and perform a search
   - Check if search history is recorded

## 🚨 Troubleshooting

### Common Issues

**"Invalid API key"**
- Check that your `.env.local` file has the correct keys
- Ensure no extra spaces or quotes around the values

**"Database connection failed"**
- Verify your project URL is correct
- Check if your Supabase project is active

**"RLS policy violation"**
- Make sure you're logged in when testing user-specific features
- Check that the user profile was created properly

### Getting Help
- Check Supabase logs in the dashboard
- Use the browser's Network tab to see API calls
- Check the console for error messages

## 📊 Next Steps

After setup is complete:
1. Import your contract data
2. Test all search functionality
3. Verify user authentication works
4. Test saved contracts feature
5. Deploy to production

## 🔐 Security Notes

- Never commit `.env.local` to version control
- The `service_role` key has admin access - keep it secure
- Use the `anon` key for client-side operations
- RLS policies protect user data automatically
