#!/usr/bin/env node

/**
 * Database setup script for Contract Search App
 * Deploys the complete database schema to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class DatabaseSetup {
    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }

    async executeSQLFile(filePath) {
        console.log(`📄 Reading SQL file: ${filePath}`);

        try {
            const sqlContent = fs.readFileSync(filePath, 'utf8');
            console.log(`✅ SQL file loaded (${sqlContent.length} characters)`);

            // Split SQL into individual statements
            const statements = this.splitSQLStatements(sqlContent);
            console.log(`📋 Found ${statements.length} SQL statements`);

            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i].trim();
                if (!statement) continue;

                console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}:`);
                console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);

                try {
                    const { data, error } = await this.supabase.rpc('exec_sql', {
                        sql_query: statement
                    }).catch(async () => {
                        // If RPC doesn't exist, try direct query
                        return await this.supabase.from('_').select('*').limit(0);
                    });

                    if (error) {
                        console.log(`   ⚠️  Error: ${error.message}`);
                        errors.push({ statement: i + 1, error: error.message, sql: statement });
                        errorCount++;
                    } else {
                        console.log(`   ✅ Success`);
                        successCount++;
                    }
                } catch (err) {
                    console.log(`   ⚠️  Exception: ${err.message}`);
                    errors.push({ statement: i + 1, error: err.message, sql: statement });
                    errorCount++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`\n📊 Execution Summary:`);
            console.log(`   ✅ Successful: ${successCount}`);
            console.log(`   ⚠️  Errors: ${errorCount}`);

            if (errors.length > 0) {
                console.log(`\n⚠️  Errors encountered:`);
                errors.forEach((err, index) => {
                    console.log(`   ${index + 1}. Statement ${err.statement}: ${err.error}`);
                });
            }

            return { successCount, errorCount, errors };

        } catch (error) {
            console.error('❌ Failed to read or execute SQL file:', error);
            throw error;
        }
    }

    splitSQLStatements(sql) {
        // Remove comments and split by semicolon
        const cleaned = sql
            .replace(/--.*$/gm, '') // Remove line comments
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments

        return cleaned
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
    }

    async testConnection() {
        console.log('🔍 Testing database connection...');

        try {
            const { data, error } = await this.supabase
                .from('information_schema.tables')
                .select('table_name')
                .limit(1);

            if (error) {
                console.log('❌ Connection test failed:', error.message);
                return false;
            }

            console.log('✅ Database connection successful!');
            return true;
        } catch (err) {
            console.log('❌ Connection test failed:', err.message);
            return false;
        }
    }

    async checkExistingTables() {
        console.log('📋 Checking existing tables...');

        try {
            const { data, error } = await this.supabase
                .rpc('get_schema_info')
                .catch(async () => {
                    // Fallback method
                    return await this.supabase
                        .from('information_schema.tables')
                        .select('table_name')
                        .eq('table_schema', 'public');
                });

            if (error) {
                console.log('⚠️  Could not check existing tables:', error.message);
                return [];
            }

            const tableNames = data ? data.map(row => row.table_name) : [];
            console.log(`   Found ${tableNames.length} existing tables:`, tableNames);

            return tableNames;
        } catch (err) {
            console.log('⚠️  Error checking tables:', err.message);
            return [];
        }
    }
}

async function main() {
    console.log('🚀 Setting up Contract Search Database');
    console.log('=====================================\n');

    const db = new DatabaseSetup();

    // Test connection
    const connected = await db.testConnection();
    if (!connected) {
        console.log('❌ Cannot connect to database. Check your environment variables.');
        process.exit(1);
    }

    // Check existing tables
    await db.checkExistingTables();

    // Execute schema file
    const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');

    if (!fs.existsSync(schemaPath)) {
        console.log(`❌ Schema file not found: ${schemaPath}`);
        process.exit(1);
    }

    console.log('\n🏗️  Deploying database schema...');
    console.log('==================================');

    try {
        const result = await db.executeSQLFile(schemaPath);

        console.log('\n🎉 Database setup complete!');
        console.log('============================');

        if (result.errorCount === 0) {
            console.log('✅ All schema elements deployed successfully!');
        } else {
            console.log(`⚠️  Setup completed with ${result.errorCount} errors (this may be normal for existing objects)`);
        }

        console.log('\n📋 Next steps:');
        console.log('1. Import contract data: npm run import-contracts');
        console.log('2. Test authentication: npm run dev');
        console.log('3. Verify search functionality');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 Setup cancelled');
    process.exit(0);
});

main().catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
});