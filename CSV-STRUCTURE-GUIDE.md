# CSV Import Structure Guide

## Required CSV Columns

Your CSV file **must** contain these exact column headers (case-sensitive):

### Required Fields (Must have values)
- `source` - Must be one of: OMNIA, Sourcewell, E&I
- `supplier_name` - The vendor/supplier name
- `supplier_normalized` - Normalized version (usually uppercase, no special chars)
- `contract_number` - Unique contract identifier
- `title` - Contract title/name

### Optional Fields (Can be empty)
- `description` - Contract description
- `category` - Contract category (e.g., Technology, Office Supplies)
- `eligible_industries` - Who can use this contract
- `contract_type` - Type of contract
- `start_date` - Format: YYYY-MM-DD (e.g., 2024-01-15)
- `end_date` - Format: YYYY-MM-DD (e.g., 2025-01-14)
- `geographic_coverage` - Defaults to "United States" if empty
- `diversity_status` - Diversity certification info
- `contract_url` - Link to contract document
- `supplier_url` - Link to supplier website
- `status` - Must be: active, inactive, or expired (defaults to "active")

## Example CSV Structure

```csv
source,supplier_name,supplier_normalized,contract_number,title,description,category,start_date,end_date,contract_url
OMNIA,Dell Technologies Inc,DELL TECHNOLOGIES INC,OMNIA-2024-001,IT Hardware and Services,Complete IT solutions including laptops and servers,Technology,2024-01-01,2024-12-31,https://example.com/contract1
Sourcewell,Office Depot Business Solutions,OFFICE DEPOT BUSINESS SOLUTIONS,SW-2024-015,Office Supplies and Furniture,Comprehensive office supplies contract,Office Supplies,2024-02-01,2025-01-31,https://example.com/contract2
E&I,Microsoft Corporation,MICROSOFT CORPORATION,EI-2024-007,Software Licensing,Microsoft 365 and Azure services,Software,2024-03-01,2025-02-28,https://example.com/contract3
```

## Import Process

1. **Place your CSV file** in the project root directory
2. **Run the schema migration** (see migration-schema-update.sql)
3. **Test with sample**: `node scripts/import-contracts.js import your-file.csv`
4. **Monitor the import** - The script provides detailed progress and error reporting

## Data Validation

The import script will:
- ✅ Validate required fields are present
- ✅ Check source values are valid
- ✅ Validate date formats (YYYY-MM-DD)
- ✅ Clean and normalize text fields
- ✅ Handle duplicate contracts via upsert
- ✅ Process in batches of 100 for reliability

## Troubleshooting

### Common Issues:
- **Invalid source**: Must be exactly "OMNIA", "Sourcewell", or "E&I"
- **Missing required fields**: All 5 required columns must have values
- **Date format errors**: Use YYYY-MM-DD format only
- **Encoding issues**: Save CSV as UTF-8

### Getting Help:
- Check the import log for specific error messages
- Use `node scripts/import-contracts.js stats` to see current database counts
- Run `node scripts/import-contracts.js` to see all available commands