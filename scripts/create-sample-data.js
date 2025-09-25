#!/usr/bin/env node

/**
 * Create sample contract data for testing
 * This converts our existing mock data to a format suitable for database import
 */

const fs = require('fs');
const path = require('path');
const { mockContracts } = require('../src/data/mockContracts');

function createSampleData() {
    console.log('📝 Creating sample contract data...');

    // Convert mock contracts to database format
    const dbContracts = mockContracts.map(contract => ({
        source: contract.source,
        supplier_name: contract.supplierName,
        supplier_normalized: contract.supplierName.toUpperCase().replace(/[^A-Z0-9]/g, ' ').trim(),
        contract_number: contract.contractId,
        title: contract.contractTitle,
        description: contract.contractDescription,
        category: contract.category,
        eligible_industries: 'All Industries', // Default value
        contract_type: 'Standard Contract',
        start_date: contract.startDate.toISOString().split('T')[0],
        end_date: contract.endDate.toISOString().split('T')[0],
        geographic_coverage: 'United States',
        diversity_status: null,
        contract_url: contract.url,
        supplier_url: null,
        status: 'active'
    }));

    // Write to JSON file for import
    const outputPath = path.join(__dirname, '..', 'data', 'sample-contracts.json');

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(dbContracts, null, 2));

    console.log(`✅ Created sample data file: ${outputPath}`);
    console.log(`📊 Generated ${dbContracts.length} contract records`);

    // Also create CSV format
    const csvPath = path.join(__dirname, '..', 'data', 'sample-contracts.csv');
    const headers = Object.keys(dbContracts[0]);
    const csvContent = [
        headers.join(','),
        ...dbContracts.map(row =>
            headers.map(header => {
                const value = row[header];
                return value ? `"${String(value).replace(/"/g, '""')}"` : '';
            }).join(',')
        )
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent);
    console.log(`✅ Created CSV file: ${csvPath}`);

    return { jsonPath: outputPath, csvPath, count: dbContracts.length };
}

if (require.main === module) {
    createSampleData();
}

module.exports = { createSampleData };