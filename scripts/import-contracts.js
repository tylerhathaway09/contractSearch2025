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

    // Validate contract data
    validateContract(contract) {
        const required = ['source', 'supplier_name', 'supplier_normalized', 'contract_number', 'title'];
        const missing = required.filter(field => !contract[field]);
        
        if (missing.length > 0) {
            return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
        }

        // Validate source
        const validSources = ['OMNIA', 'Sourcewell', 'E&I'];
        if (!validSources.includes(contract.source)) {
            return { valid: false, error: `Invalid source: ${contract.source}` };
        }

        // Validate dates
        if (contract.start_date && !this.isValidDate(contract.start_date)) {
            return { valid: false, error: `Invalid start_date: ${contract.start_date}` };
        }

        if (contract.end_date && !this.isValidDate(contract.end_date)) {
            return { valid: false, error: `Invalid end_date: ${contract.end_date}` };
        }

        return { valid: true };
    }

    // Check if date string is valid YYYY-MM-DD format
    isValidDate(dateString) {
        if (!dateString) return true; // Optional field
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Clean and normalize contract data
    cleanContract(contract) {
        return {
            source: contract.source.trim(),
            supplier_name: contract.supplier_name.trim(),
            supplier_normalized: contract.supplier_normalized.trim(),
            contract_number: contract.contract_number.trim(),
            title: contract.title.trim(),
            description: contract.description ? contract.description.trim() : null,
            category: contract.category ? contract.category.trim() : null,
            eligible_industries: contract.eligible_industries ? contract.eligible_industries.trim() : null,
            contract_type: contract.contract_type ? contract.contract_type.trim() : null,
            start_date: contract.start_date || null,
            end_date: contract.end_date || null,
            geographic_coverage: contract.geographic_coverage || 'United States',
            diversity_status: contract.diversity_status ? contract.diversity_status.trim() : null,
            contract_url: contract.contract_url || null,
            supplier_url: contract.supplier_url || null,
            status: contract.status || 'active'
        };
    }

    // Import contracts from CSV file
    async importFromCSV(csvFilePath) {
        console.log('🚀 Starting Contract Import');
        console.log('============================\n');

        try {
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
            const batchSize = 100;
            for (let i = 0; i < contracts.length; i += batchSize) {
                const batch = contracts.slice(i, i + batchSize);
                await this.processBatch(batch, i + 1);
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

        // Validate and clean contracts
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

            validContracts.push(this.cleanContract(contract));
        }

        // Insert valid contracts
        if (validContracts.length > 0) {
            const { data, error } = await this.supabase
                .from('contracts')
                .upsert(validContracts, {
                    onConflict: 'contract_number,source',
                    ignoreDuplicates: false
                });

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

    // Clear all contracts (use with caution!)
    async clearAllContracts() {
        console.log('🗑️  Clearing all contracts...');
        const { error } = await this.supabase
            .from('contracts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (error) {
            console.error('❌ Failed to clear contracts:', error.message);
        } else {
            console.log('✅ All contracts cleared');
        }
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
                console.log('Usage: node import-contracts.js import <csv-file>');
                process.exit(1);
            }
            await importer.importFromCSV(csvFile);
            break;

        case 'clear':
            console.log('⚠️  This will delete ALL contracts. Are you sure? (Ctrl+C to cancel)');
            await new Promise(resolve => setTimeout(resolve, 3000));
            await importer.clearAllContracts();
            break;

        case 'stats':
            await importer.getStats();
            break;

        default:
            console.log('📋 Contract Import Script');
            console.log('========================');
            console.log('Usage:');
            console.log('  node import-contracts.js import <csv-file>  - Import contracts from CSV');
            console.log('  node import-contracts.js clear              - Clear all contracts (DANGER!)');
            console.log('  node import-contracts.js stats              - Show database statistics');
            console.log('');
            console.log('Examples:');
            console.log('  node import-contracts.js import normalized-contracts_2024-01-15.csv');
            console.log('  node import-contracts.js stats');
            break;
    }
}

// Run the script
main().catch(console.error);