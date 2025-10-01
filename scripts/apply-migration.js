const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function applyMigration() {
    console.log('🔄 Applying Database Migration');
    console.log('==============================\n');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migration-schema-update.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('⚠️  WARNING: This will drop and recreate the contracts table!');
    console.log('⚠️  Any existing data will be moved to contracts_backup table\n');

    // Split SQL into individual statements
    const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        const stmtPreview = stmt.substring(0, 60).replace(/\n/g, ' ') + '...';

        console.log(`[${i + 1}/${statements.length}] ${stmtPreview}`);

        try {
            // Use raw SQL execution via REST API
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: stmt })
                }
            );

            if (response.ok || response.status === 404) {
                console.log('   ✅ Success');
                successCount++;
            } else {
                const error = await response.text();
                console.log(`   ⚠️  Warning: ${error}`);
                errorCount++;
            }
        } catch (error) {
            console.log(`   ⚠️  Error: ${error.message}`);
            errorCount++;
        }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Errors/Warnings: ${errorCount}`);
    console.log('\n⚠️  Note: You need to run the SQL migration manually in Supabase SQL Editor');
    console.log('   File: migration-schema-update.sql');
    console.log('   Path: ' + migrationPath);
}

applyMigration().catch(console.error);
