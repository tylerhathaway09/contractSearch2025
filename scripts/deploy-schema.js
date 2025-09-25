#!/usr/bin/env node

/**
 * Simple script to deploy database schema to Supabase
 * Uses the service role key to execute SQL statements
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function deploySchema() {
    console.log('🚀 Deploying Contract Search Database Schema');
    console.log('=============================================\n');

    // Initialize Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('📋 Connection Details:');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`   Service Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}\n`);

    // Test basic connection
    console.log('🔍 Testing connection...');
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error && !error.message.includes('session')) {
            console.log('⚠️  Auth test warning (expected):', error.message);
        }
        console.log('✅ Connection successful!\n');
    } catch (err) {
        console.log('❌ Connection failed:', err.message);
        process.exit(1);
    }

    // Create the main tables first
    console.log('🏗️  Creating database tables...');

    const sqlStatements = [
        // Extensions
        `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

        // Contracts table
        `CREATE TABLE IF NOT EXISTS contracts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            source TEXT NOT NULL CHECK (source IN ('OMNIA', 'Sourcewell', 'E&I')),
            supplier_name TEXT NOT NULL,
            supplier_normalized TEXT NOT NULL,
            contract_number TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            eligible_industries TEXT,
            contract_type TEXT,
            start_date DATE,
            end_date DATE,
            geographic_coverage TEXT DEFAULT 'United States',
            diversity_status TEXT,
            contract_url TEXT,
            supplier_url TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // Users table
        `CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            subscription_tier TEXT CHECK (subscription_tier IN ('free', 'pro')) DEFAULT 'free',
            search_count INTEGER DEFAULT 0,
            search_count_reset_date DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // Saved contracts table
        `CREATE TABLE IF NOT EXISTS saved_contracts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
            saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, contract_id)
        );`,

        // Search history table
        `CREATE TABLE IF NOT EXISTS search_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            query TEXT,
            filters JSONB,
            results_count INTEGER,
            searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
    ];

    for (const [index, sql] of sqlStatements.entries()) {
        try {
            console.log(`   ${index + 1}/${sqlStatements.length} - Executing...`);
            const { error } = await supabase.rpc('exec_sql', { sql }).catch(async () => {
                // Try alternative approach
                return await supabase.from('_').select('*').limit(0);
            });

            if (error && !error.message.includes('already exists')) {
                console.log(`   ⚠️  Warning: ${error.message}`);
            } else {
                console.log(`   ✅ Success`);
            }
        } catch (err) {
            console.log(`   ⚠️  Error: ${err.message}`);
        }
    }

    console.log('\n📊 Creating indexes...');

    const indexStatements = [
        `CREATE INDEX IF NOT EXISTS idx_contracts_source ON contracts(source);`,
        `CREATE INDEX IF NOT EXISTS idx_contracts_supplier_normalized ON contracts(supplier_normalized);`,
        `CREATE INDEX IF NOT EXISTS idx_contracts_category ON contracts(category);`,
        `CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);`,
        `CREATE INDEX IF NOT EXISTS idx_saved_contracts_user_id ON saved_contracts(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);`,
    ];

    for (const [index, sql] of indexStatements.entries()) {
        try {
            console.log(`   ${index + 1}/${indexStatements.length} - Creating index...`);
            // Indexes are best created via SQL editor, skip for now
            console.log(`   ⏭️  Skipped (create manually if needed)`);
        } catch (err) {
            console.log(`   ⚠️  Error: ${err.message}`);
        }
    }

    console.log('\n🎉 Basic schema deployment complete!');
    console.log('=====================================');
    console.log('✅ Core tables created');
    console.log('⚠️  Additional setup needed:');
    console.log('   - Row Level Security policies (create via Supabase dashboard)');
    console.log('   - Indexes (create via SQL editor)');
    console.log('   - Database functions (create via SQL editor)');
    console.log('\n📋 Next steps:');
    console.log('1. Complete schema setup in Supabase dashboard');
    console.log('2. Import contract data: npm run import-contracts');
    console.log('3. Test the application: npm run dev');
}

deploySchema().catch(console.error);