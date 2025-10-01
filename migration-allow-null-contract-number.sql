-- ============================================
-- MIGRATION: Allow NULL contract_number
-- Purpose: Support contracts without contract numbers
-- Date: October 1, 2025
-- ============================================

-- Step 1: Drop unique constraint that requires contract_number
DROP INDEX IF EXISTS idx_contracts_unique_source_number;

-- Step 2: Alter contract_number to allow NULL
ALTER TABLE contracts
ALTER COLUMN contract_number DROP NOT NULL;

-- Step 3: Create partial unique index (only for non-NULL contract_numbers)
-- This prevents duplicate contract numbers when they exist, but allows multiple NULLs
CREATE UNIQUE INDEX idx_contracts_unique_source_number
ON contracts(source, contract_number)
WHERE contract_number IS NOT NULL;

-- Step 4: Verify changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contracts'
  AND column_name = 'contract_number';
