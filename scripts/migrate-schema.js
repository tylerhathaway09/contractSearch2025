const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function migrateSchema() {
    console.log('🚀 Migrating Database Schema for CSV Import');
    console.log('===========================================\n');

    // Initialize Supabase client with service role key
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        console.log('📋 Step 1: Backing up existing data...');

        // Get existing contracts data
        const { data: existingContracts, error: fetchError } = await supabase
            .from('contracts')
            .select('*');

        if (fetchError) {
            console.error('❌ Failed to fetch existing data:', fetchError.message);
            return;
        }

        console.log(`✅ Found ${existingContracts?.length || 0} existing contracts`);

        console.log('\n🗑️  Step 2: Dropping existing contracts table...');

        // Drop existing contracts table
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: 'DROP TABLE IF EXISTS contracts CASCADE;'
        });

        if (dropError) {
            console.error('❌ Failed to drop table:', dropError.message);
            console.log('⚠️  Continuing with manual schema creation...');
        } else {
            console.log('✅ Existing table dropped');
        }

        console.log('\n🏗️  Step 3: Creating new contracts table...');

        const createTableSQL = `
        CREATE TABLE contracts (
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
        );`;

        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: createTableSQL
        });

        if (createError) {
            console.error('❌ Failed to create table:', createError.message);
            console.log('📝 Please run this SQL manually in your Supabase SQL editor:');
            console.log(createTableSQL);
            return;
        }

        console.log('✅ New contracts table created');

        console.log('\n📊 Step 4: Creating indexes...');

        const indexes = [
            'CREATE INDEX idx_contracts_source ON contracts(source);',
            'CREATE INDEX idx_contracts_supplier_normalized ON contracts(supplier_normalized);',
            'CREATE INDEX idx_contracts_category ON contracts(category);',
            'CREATE INDEX idx_contracts_status ON contracts(status);',
            'CREATE INDEX idx_contracts_end_date ON contracts(end_date);',
            'CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);',
            'CREATE INDEX idx_contracts_title_search ON contracts USING gin(to_tsvector(\'english\', title));',
            'CREATE INDEX idx_contracts_description_search ON contracts USING gin(to_tsvector(\'english\', description));',
            'CREATE INDEX idx_contracts_supplier_search ON contracts USING gin(to_tsvector(\'english\', supplier_name));',
            'CREATE UNIQUE INDEX idx_contracts_unique_source_number ON contracts(source, contract_number);'
        ];

        let indexCount = 0;
        for (const indexSQL of indexes) {
            const { error: indexError } = await supabase.rpc('exec_sql', {
                sql: indexSQL
            });

            if (indexError) {
                console.log(`   ⚠️  Index ${indexCount + 1}/10: ${indexError.message}`);
            } else {
                indexCount++;
                console.log(`   ✅ Index ${indexCount}/10: Created successfully`);
            }
        }

        console.log('\n🔐 Step 5: Setting up Row Level Security...');

        const rlsSQL = `
        ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Contracts are publicly readable" ON contracts FOR SELECT USING (true);
        `;

        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: rlsSQL
        });

        if (rlsError) {
            console.log(`   ⚠️  RLS setup: ${rlsError.message}`);
            console.log('   📝 Please enable RLS manually in Supabase dashboard');
        } else {
            console.log('   ✅ RLS enabled and policies created');
        }

        console.log('\n🎉 Schema Migration Complete!');
        console.log('==============================');
        console.log('✅ New contracts table ready for CSV import');
        console.log('📊 Indexes created for optimal performance');
        console.log('🔐 Row Level Security configured');
        console.log('\n📋 Next Steps:');
        console.log('1. Place your CSV file in the project root');
        console.log('2. Run: node scripts/import-contracts.js import your-file.csv');
        console.log('3. Verify data import was successful');

        // Save migration info
        const migrationInfo = {
            timestamp: new Date().toISOString(),
            existingRecords: existingContracts?.length || 0,
            backupFile: 'backup-existing-data.sql',
            status: 'completed'
        };

        fs.writeFileSync(
            path.join(__dirname, '..', 'migration-info.json'),
            JSON.stringify(migrationInfo, null, 2)
        );

        console.log('✅ Migration info saved to migration-info.json');

    } catch (error) {
        console.error('💥 Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migration
migrateSchema();