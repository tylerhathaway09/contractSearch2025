-- Create saved_contracts table for bookmark functionality
-- Migration: create_saved_contracts_table
-- Created: 2025-09-24

CREATE TABLE IF NOT EXISTS public.saved_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contract_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS saved_contracts_user_id_idx ON public.saved_contracts(user_id);
CREATE INDEX IF NOT EXISTS saved_contracts_contract_id_idx ON public.saved_contracts(contract_id);
CREATE INDEX IF NOT EXISTS saved_contracts_saved_at_idx ON public.saved_contracts(saved_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.saved_contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved contracts" ON public.saved_contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved contracts" ON public.saved_contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved contracts" ON public.saved_contracts
    FOR DELETE USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.saved_contracts IS 'Stores user bookmarked/saved contracts';
COMMENT ON COLUMN public.saved_contracts.user_id IS 'Reference to the user who saved the contract';
COMMENT ON COLUMN public.saved_contracts.contract_id IS 'Reference to the saved contract';
COMMENT ON COLUMN public.saved_contracts.saved_at IS 'Timestamp when the contract was bookmarked';