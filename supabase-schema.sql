-- Supabase Database Schema for Contract Search App
-- Based on the ContractNormalizer script data structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONTRACTS TABLE
-- ============================================
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

-- ============================================
-- USERS TABLE (Supabase Auth integration)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'pro')) DEFAULT 'free',
    search_count INTEGER DEFAULT 0,
    search_count_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SAVED CONTRACTS JUNCTION TABLE
-- ============================================
CREATE TABLE saved_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contract_id)
);

-- ============================================
-- SEARCH HISTORY TABLE
-- ============================================
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT,
    filters JSONB, -- Store search filters as JSON
    results_count INTEGER,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Contracts table indexes
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

-- Users table indexes
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_search_count_reset ON users(search_count_reset_date);

-- Saved contracts indexes
CREATE INDEX idx_saved_contracts_user_id ON saved_contracts(user_id);
CREATE INDEX idx_saved_contracts_contract_id ON saved_contracts(contract_id);
CREATE INDEX idx_saved_contracts_saved_at ON saved_contracts(saved_at);

-- Search history indexes
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Contracts table - public read access
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Saved contracts policies
CREATE POLICY "Users can view own saved contracts" ON saved_contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save contracts" ON saved_contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own saved contracts" ON saved_contracts
    FOR DELETE USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can view own search history" ON search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history" ON search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Contracts are publicly readable
CREATE POLICY "Contracts are publicly readable" ON contracts
    FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset search count monthly
CREATE OR REPLACE FUNCTION reset_monthly_search_count()
RETURNS TRIGGER AS $$
BEGIN
    -- If it's a new month, reset search count
    IF NEW.search_count_reset_date != OLD.search_count_reset_date THEN
        NEW.search_count = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for search count reset
CREATE TRIGGER reset_search_count_trigger BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION reset_monthly_search_count();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's search limit info
CREATE OR REPLACE FUNCTION get_user_search_limit(user_uuid UUID)
RETURNS TABLE(can_search BOOLEAN, remaining INTEGER, limit_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN u.subscription_tier = 'pro' THEN true
            ELSE u.search_count < 10
        END as can_search,
        CASE 
            WHEN u.subscription_tier = 'pro' THEN -1
            ELSE GREATEST(0, 10 - u.search_count)
        END as remaining,
        CASE 
            WHEN u.subscription_tier = 'pro' THEN -1
            ELSE 10
        END as limit_count
    FROM users u
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment search count
CREATE OR REPLACE FUNCTION increment_search_count(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_record users%ROWTYPE;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Pro users have unlimited searches
    IF user_record.subscription_tier = 'pro' THEN
        UPDATE users SET search_count = search_count + 1 WHERE id = user_uuid;
        RETURN true;
    END IF;
    
    -- Free users have a limit of 10 searches per month
    IF user_record.subscription_tier = 'free' AND user_record.search_count < 10 THEN
        UPDATE users SET search_count = search_count + 1 WHERE id = user_uuid;
        RETURN true;
    END IF;
    
    RETURN false; -- Free user has reached their limit
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA INSERTION (Optional)
-- ============================================

-- Insert sample categories based on your data
INSERT INTO contracts (source, supplier_name, supplier_normalized, contract_number, title, description, category, status) VALUES
('OMNIA', 'Sample Supplier', 'SAMPLE SUPPLIER', 'SAMPLE-001', 'Sample Contract', 'Sample description', 'Technology', 'active')
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for contracts with expiration status
CREATE VIEW contracts_with_expiration AS
SELECT 
    *,
    CASE 
        WHEN end_date < CURRENT_DATE THEN 'expired'
        WHEN end_date < CURRENT_DATE + INTERVAL '90 days' THEN 'expiring_soon'
        ELSE 'active'
    END as expiration_status
FROM contracts
WHERE status = 'active';

-- View for user dashboard data
CREATE VIEW user_dashboard_data AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.subscription_tier,
    u.search_count,
    COUNT(sc.id) as saved_contracts_count,
    u.created_at
FROM users u
LEFT JOIN saved_contracts sc ON u.id = sc.user_id
GROUP BY u.id, u.email, u.name, u.subscription_tier, u.search_count, u.created_at;
