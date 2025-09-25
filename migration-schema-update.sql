-- ============================================
-- SCHEMA MIGRATION FOR CSV IMPORT
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create backup of existing data
CREATE TABLE contracts_backup AS SELECT * FROM contracts;

-- Step 2: Drop existing constraints and indexes
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS contract_items CASCADE;

-- Step 3: Recreate contracts table with correct schema
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL CHECK (source IN ('OMNIA', 'Sourcewell', 'E&I')),
    supplier_name TEXT NOT NULL,
    supplier_normalized TEXT NOT NULL, -- For deduplication and search
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
);

-- Step 4: Create performance indexes
CREATE INDEX idx_contracts_source ON contracts(source);
CREATE INDEX idx_contracts_supplier_normalized ON contracts(supplier_normalized);
CREATE INDEX idx_contracts_category ON contracts(category);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);

-- Full-text search indexes
CREATE INDEX idx_contracts_title_search ON contracts USING gin(to_tsvector('english', title));
CREATE INDEX idx_contracts_description_search ON contracts USING gin(to_tsvector('english', description));
CREATE INDEX idx_contracts_supplier_search ON contracts USING gin(to_tsvector('english', supplier_name));

-- Unique constraint for preventing duplicates
CREATE UNIQUE INDEX idx_contracts_unique_source_number ON contracts(source, contract_number);

-- Step 5: Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Contracts are publicly readable" ON contracts
    FOR SELECT USING (true);

-- Step 6: Create trigger for updated_at (if function exists)
-- First check if the function exists, create if needed
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Recreate saved_contracts table if needed
CREATE TABLE IF NOT EXISTS saved_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contract_id)
);

-- Enable RLS for saved_contracts
ALTER TABLE saved_contracts ENABLE ROW LEVEL SECURITY;

-- Policies for saved_contracts
CREATE POLICY "Users can view own saved contracts" ON saved_contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save contracts" ON saved_contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own saved contracts" ON saved_contracts
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for saved_contracts
CREATE INDEX idx_saved_contracts_user_id ON saved_contracts(user_id);
CREATE INDEX idx_saved_contracts_contract_id ON saved_contracts(contract_id);
CREATE INDEX idx_saved_contracts_saved_at ON saved_contracts(saved_at);