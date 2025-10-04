# Supabase MCP Investigation Checklist

## For Next Session with Supabase MCP Connected

Use these MCP commands to verify the database schema and troubleshoot any remaining issues:

### 1. Verify Table Structure

```
List all tables to confirm saved_contracts exists
Check saved_contracts table schema and columns
Check contracts table schema and columns
Verify foreign key relationships
```

### 2. Check Saved Contracts Data

```
Query: SELECT * FROM saved_contracts LIMIT 5
- Verify user_id and contract_id columns exist
- Check if there's any data
- Verify saved_at timestamps
```

### 3. Test JOIN Query

```
Execute the actual JOIN query that's failing:
SELECT
  sc.id,
  sc.saved_at,
  c.*
FROM saved_contracts sc
JOIN contracts c ON sc.contract_id = c.id
WHERE sc.user_id = '<test_user_id>'
ORDER BY sc.saved_at DESC
```

### 4. Verify Foreign Key Relationship

```
Check constraint: saved_contracts.contract_id → contracts.id
Check constraint: saved_contracts.user_id → users.id
Verify constraint names for Supabase relationship syntax
```

### 5. Check RLS Policies

```
List RLS policies on saved_contracts table
Verify: "Users can view own saved contracts" policy
Verify: "Users can save contracts" policy
Verify: "Users can remove own saved contracts" policy
```

## Current Query Syntax (After Fix)

```typescript
.from('saved_contracts')
.select(`
  id,
  saved_at,
  contracts:contract_id (
    id,
    source,
    supplier_name,
    ...
  )
`)
.eq('user_id', userId)
```

## Known Working Schema (from supabase-schema.sql)

```sql
CREATE TABLE saved_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contract_id)
);
```

## If Query Still Fails

Alternative approach to implement:

```typescript
// Fetch saved contract IDs first
const { data: savedIds } = await supabase
  .from('saved_contracts')
  .select('contract_id, saved_at')
  .eq('user_id', userId)
  .order('saved_at', { ascending: false });

// Fetch full contract details
const contractIds = savedIds.map(s => s.contract_id);
const { data: contracts } = await supabase
  .from('contracts')
  .select('*')
  .in('id', contractIds);

// Join in JavaScript
const result = savedIds.map(saved => ({
  id: saved.id,
  saved_at: saved.saved_at,
  contracts: contracts.find(c => c.id === saved.contract_id)
}));
```

## Test User for Queries

Current test user: Tyler Hathaway
- Check users table for user_id
- Use that ID for testing saved_contracts queries

## Expected Behavior

✅ Any logged-in user can save/unsave contracts
✅ Saved contracts appear in /saved page
✅ Dashboard shows saved contracts count
✅ No "Pro subscription required" errors
✅ Bookmark icons only visible when logged in
