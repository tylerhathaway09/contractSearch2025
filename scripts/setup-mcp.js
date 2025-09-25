#!/usr/bin/env node

/**
 * Setup script for configuring Supabase MCP
 * This script helps configure the .mcp.json file with actual project values
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function setupMCP() {
  console.log('🚀 Setting up Supabase MCP for Contract Search App\n');

  // Get project ref
  const projectRef = await question('Enter your Supabase project ref (found in Project Settings > General): ');
  if (!projectRef.trim()) {
    console.log('❌ Project ref is required');
    process.exit(1);
  }

  // Get access token
  const accessToken = await question('Enter your Supabase access token (from Account > Access Tokens): ');
  if (!accessToken.trim()) {
    console.log('❌ Access token is required');
    process.exit(1);
  }

  // Read current .mcp.json
  const mcpPath = path.join(__dirname, '..', '.mcp.json');
  let mcpConfig;

  try {
    const mcpContent = fs.readFileSync(mcpPath, 'utf8');
    mcpConfig = JSON.parse(mcpContent);
  } catch (error) {
    console.log('❌ Could not read .mcp.json file:', error.message);
    process.exit(1);
  }

  // Update configuration
  if (mcpConfig.mcpServers && mcpConfig.mcpServers.supabase) {
    // Update project-ref in args
    const args = mcpConfig.mcpServers.supabase.args;
    const projectRefIndex = args.findIndex(arg => arg.includes('--project-ref='));
    if (projectRefIndex !== -1) {
      args[projectRefIndex] = `--project-ref=${projectRef}`;
    }

    // Update access token in env
    mcpConfig.mcpServers.supabase.env.SUPABASE_ACCESS_TOKEN = accessToken;
  }

  // Write updated configuration
  try {
    fs.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
    console.log('✅ .mcp.json updated successfully!');
  } catch (error) {
    console.log('❌ Could not write .mcp.json file:', error.message);
    process.exit(1);
  }

  // Update .env.local if it exists
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';

  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    // .env.local doesn't exist, create it
    try {
      const envExampleContent = fs.readFileSync(path.join(__dirname, '..', 'env.example'), 'utf8');
      envContent = envExampleContent;
    } catch (exampleError) {
      console.log('⚠️  Could not read env.example file');
    }
  }

  // Update or add environment variables
  const envLines = envContent.split('\n');
  let projectRefSet = false;
  let accessTokenSet = false;

  for (let i = 0; i < envLines.length; i++) {
    if (envLines[i].startsWith('SUPABASE_PROJECT_REF=')) {
      envLines[i] = `SUPABASE_PROJECT_REF=${projectRef}`;
      projectRefSet = true;
    } else if (envLines[i].startsWith('SUPABASE_ACCESS_TOKEN=')) {
      envLines[i] = `SUPABASE_ACCESS_TOKEN=${accessToken}`;
      accessTokenSet = true;
    }
  }

  // Add missing variables
  if (!projectRefSet) {
    envLines.push(`SUPABASE_PROJECT_REF=${projectRef}`);
  }
  if (!accessTokenSet) {
    envLines.push(`SUPABASE_ACCESS_TOKEN=${accessToken}`);
  }

  // Write .env.local
  try {
    fs.writeFileSync(envPath, envLines.join('\n'));
    console.log('✅ .env.local updated successfully!');
  } catch (error) {
    console.log('❌ Could not write .env.local file:', error.message);
  }

  console.log('\n🎉 MCP setup complete!');
  console.log('\nNext steps:');
  console.log('1. Restart Claude Code to load the new MCP server');
  console.log('2. Run database setup: npm run setup-database');
  console.log('3. Import contract data: npm run import-contracts');

  rl.close();
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Setup cancelled');
  rl.close();
  process.exit(0);
});

setupMCP().catch((error) => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});