const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class ContractImporter {
    constructor() {
        // Initialize Supabase client with service role key for admin operations
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        this.stats = {
            total: 0,
            imported: 0,
            skipped: 0,
            errors: 0,
            errors_list: []
        };
    }

    // Validate contract data for current schema
    validateContract(contract) {
        const required = ['source', 'supplier_name', 'contract_number', 'title'];
        const missing = required.filter(field => !contract[field]);

        if (missing.length > 0) {
            return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
        }

        // Validate source
        const validSources = ['OMNIA', 'Sourcewell', 'E&I'];
        if (!validSources.includes(contract.source)) {
            return { valid: false, error: `Invalid source: ${contract.source}` };
        }

        return { valid: true };
    }

    // Map CSV data to current database schema
    mapToCurrentSchema(contract) {
        return {
            contract_number: contract.contract_number?.trim() || '',
            contract_title: contract.title?.trim() || '',
            vendor_name: contract.supplier_name?.trim() || '',
            purchasing_org: contract.source?.trim() || '',
            contract_start_date: contract.start_date || null,
            contract_end_date: contract.end_date || null,
            contract_value: null, // Not in CSV
            description: contract.description?.trim() || null,
            items: contract.category ? [{
                category: contract.category,
                eligible_industries: contract.eligible_industries,
                contract_type: contract.contract_type,
                geographic_coverage: contract.geographic_coverage,
                diversity_status: contract.diversity_status
            }] : [],
            contact_info: null, // Not in CSV
            document_urls: contract.contract_url ? [contract.contract_url] : [],
            is_active: contract.status === 'active' || contract.status !== 'inactive'
        };
    }

    // Import contracts from CSV file
    async importFromCSV(csvFilePath) {
        console.log('🚀 Starting Contract Import (Current Schema)');
        console.log('=============================================\n');

        try {
            // Clear existing contracts first
            console.log('🗑️  Clearing existing contracts...');
            const { error: clearError } = await this.supabase
                .from('contracts')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (clearError) {
                console.log('⚠️  Warning: Could not clear existing contracts:', clearError.message);
            } else {
                console.log('✅ Existing contracts cleared');
            }

            // Check if file exists
            if (!fs.existsSync(csvFilePath)) {
                throw new Error(`CSV file not found: ${csvFilePath}`);
            }

            // Read and parse CSV
            console.log(`📄 Reading CSV file: ${csvFilePath}`);
            const csvContent = fs.readFileSync(csvFilePath, 'utf8');
            const parseResult = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim()
            });

            if (parseResult.errors.length > 0) {
                console.log('⚠️  CSV parsing warnings:');
                parseResult.errors.forEach(error => console.log(`   ${error.message}`));
            }

            const contracts = parseResult.data;
            this.stats.total = contracts.length;

            console.log(`📊 Found ${contracts.length} contracts to import\n`);

            // Process contracts in batches
            const batchSize = 50; // Smaller batches for current schema
            for (let i = 0; i < contracts.length; i += batchSize) {
                const batch = contracts.slice(i, i + batchSize);
                await this.processBatch(batch, Math.floor(i / batchSize) + 1);
            }

            // Print final results
            this.printResults();

        } catch (error) {
            console.error('💥 Import failed:', error.message);
            process.exit(1);
        }
    }

    // Process a batch of contracts
    async processBatch(contracts, batchNumber) {
        console.log(`📦 Processing batch ${batchNumber} (${contracts.length} contracts)...`);

        const validContracts = [];
        const batchErrors = [];

        // Validate and map contracts to current schema
        for (const contract of contracts) {
            const validation = this.validateContract(contract);
            if (!validation.valid) {
                this.stats.skipped++;
                batchErrors.push({
                    contract: contract.contract_number || 'Unknown',
                    error: validation.error
                });
                continue;
            }

            validContracts.push(this.mapToCurrentSchema(contract));
        }

        // Insert valid contracts
        if (validContracts.length > 0) {
            const { data, error } = await this.supabase
                .from('contracts')
                .insert(validContracts);

            if (error) {
                console.error(`   ❌ Batch ${batchNumber} failed:`, error.message);
                this.stats.errors += validContracts.length;
                this.stats.errors_list.push({
                    batch: batchNumber,
                    error: error.message
                });
            } else {
                this.stats.imported += validContracts.length;
                console.log(`   ✅ Batch ${batchNumber}: ${validContracts.length} contracts imported`);
            }
        }

        // Log batch errors
        if (batchErrors.length > 0) {
            console.log(`   ⚠️  Batch ${batchNumber} skipped ${batchErrors.length} invalid contracts:`);
            batchErrors.forEach(err => {
                console.log(`      - ${err.contract}: ${err.error}`);
            });
        }
    }

    // Print import results
    printResults() {
        console.log('\n🎉 Import Complete!');
        console.log('===================');
        console.log(`📊 Total contracts processed: ${this.stats.total}`);
        console.log(`✅ Successfully imported: ${this.stats.imported}`);
        console.log(`⚠️  Skipped (invalid): ${this.stats.skipped}`);
        console.log(`❌ Errors: ${this.stats.errors}`);

        if (this.stats.errors_list.length > 0) {
            console.log('\n🚨 Error Details:');
            this.stats.errors_list.forEach(err => {
                console.log(`   Batch ${err.batch}: ${err.error}`);
            });
        }

        console.log('\n📈 Next Steps:');
        console.log('   1. Check your Supabase dashboard to verify data');
        console.log('   2. Test search functionality in your app');
        console.log('   3. Verify user authentication works');
        console.log('===================');
    }

    // Get import statistics
    async getStats() {
        const { count, error } = await this.supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Failed to get stats:', error.message);
            return;
        }

        console.log(`📊 Total contracts in database: ${count}`);
    }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
    const importer = new ContractImporter();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    const csvFile = args[1];

    switch (command) {
        case 'import':
            if (!csvFile) {
                console.error('❌ Please provide a CSV file path');
                console.log('Usage: node import-contracts-current-schema.js import <csv-file>');
                process.exit(1);
            }
            await importer.importFromCSV(csvFile);
            break;

        case 'stats':
            await importer.getStats();
            break;

        default:
            console.log('📋 Contract Import Script (Current Schema)');
            console.log('==========================================');
            console.log('Usage:');
            console.log('  node import-contracts-current-schema.js import <csv-file>  - Import contracts from CSV');
            console.log('  node import-contracts-current-schema.js stats              - Show database statistics');
            console.log('');
            console.log('Examples:');
            console.log('  node import-contracts-current-schema.js import normalized-contracts_2025-09-19.csv');
            console.log('  node import-contracts-current-schema.js stats');
            break;
    }
}

// Run the script
main().catch(console.error);