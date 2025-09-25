# Supabase MCP Setup Guide

This guide walks you through setting up the Supabase MCP (Model Context Protocol) server to connect your Contract Search app to a real Supabase database.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project for your contract search app
3. **Access Token**: Generate a personal access token in your Supabase account

## Step 1: Get Supabase Credentials

### 1.1 Create Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `contract-search-app`
   - **Organization**: Choose your organization
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the region closest to your users

### 1.2 Get Project Reference
1. In your project dashboard, go to **Settings** → **General**
2. Copy the **Reference ID** (this is your `project-ref`)

### 1.3 Get Access Token
1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click "Generate new token"
3. Give it a name like "Contract Search MCP"
4. Copy the generated token (this is your `access-token`)

### 1.4 Get API Keys (for app usage)
1. In your project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - Keep this secret!

## Step 2: Configure MCP

### Option A: Automated Setup (Recommended)
```bash
npm run setup-mcp
```

This interactive script will:
- Update `.mcp.json` with your project ref
- Create/update `.env.local` with your credentials
- Guide you through the setup process

### Option B: Manual Configuration

1. **Update .mcp.json**:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase",
           "--read-only",
           "--project-ref=YOUR_PROJECT_REF_HERE"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN_HERE"
         }
       }
     }
   }
   ```

2. **Create .env.local**:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # MCP Configuration
   SUPABASE_PROJECT_REF=your_project_ref_here
   SUPABASE_ACCESS_TOKEN=your_access_token_here
   ```

## Step 3: Restart Claude Code

After configuring the MCP, you need to restart Claude Code to load the new MCP server:

1. Exit Claude Code completely
2. Restart Claude Code
3. The Supabase MCP server should now be available

## Step 4: Set Up Database Schema

Once the MCP is connected, Claude will be able to:

1. **Create database tables** using the schema in `supabase-schema.sql`
2. **Set up Row Level Security** policies
3. **Create indexes** for performance
4. **Deploy database functions** for search limits and user management

## Step 5: Test MCP Connection

You can test if the MCP is working by asking Claude to:

```
Can you show me the tables in my Supabase database?
```

If configured correctly, Claude should be able to connect to your Supabase project and show the database structure.

## Troubleshooting

### "MCP server failed to start"
- Check that your project ref and access token are correct
- Ensure you have an active internet connection
- Verify that the Supabase project is active and accessible

### "Permission denied"
- Make sure your access token has the necessary permissions
- Check that the project ref matches your actual project
- Verify you're using the correct Supabase account

### "Database connection failed"
- Ensure your Supabase project is active (not paused)
- Check that you're using the correct project URL
- Verify network connectivity

## Next Steps

After MCP setup is complete:

1. **Deploy Database Schema**: Ask Claude to set up the database tables
2. **Import Contract Data**: Upload your contract data to the database
3. **Test Authentication**: Verify user registration and login work
4. **Test Search Functionality**: Ensure contract search works with real data

## Security Notes

- **Never commit .env.local** to version control
- **Keep your access token secure** - it has admin access to your Supabase projects
- **Use environment variables** for all sensitive configuration
- **The MCP runs with read-only access** by default for security

## Benefits of Using MCP

✅ **Seamless Integration**: Claude can directly interact with your Supabase database
✅ **Real-time Setup**: No manual SQL execution needed
✅ **Error Handling**: Claude can diagnose and fix database issues
✅ **Data Import**: Claude can efficiently import your contract data
✅ **Schema Management**: Easy database schema updates and migrations

## Support

If you encounter issues:
1. Check the Claude Code console for error messages
2. Verify your Supabase project is accessible via the web dashboard
3. Test your access token by making a direct API call
4. Consult the Supabase documentation for project-specific issues