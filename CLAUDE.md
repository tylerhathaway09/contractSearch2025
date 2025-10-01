# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready government contract search platform built with Next.js 15, TypeScript, Supabase, and Stripe. The application aggregates 1,357 contracts from E&I, Sourcewell, and OMNIA Partners cooperative purchasing organizations.

**Live URL**: https://www.understoryanalytics.com
**Status**: Production with live Stripe payments, webhooks, and Vercel Analytics
**Last Updated**: October 1, 2025

## Essential Commands

### Development
```bash
npm run dev              # Start development server on port 3000
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking
npm run clean            # Remove .next and out directories
```

### Database Operations
```bash
npm run test-supabase                                              # Test Supabase connection
npm run import-contracts                                           # Import contracts from CSV
npm run db-stats                                                   # Show database statistics
node scripts/check-schema.js                                       # Verify database schema
node scripts/import-contracts-fixed.js import <csv-file>          # Import contracts from CSV (recommended)
node scripts/import-contracts-fixed.js stats                       # Show import statistics
```

### MCP & Setup
```bash
npm run setup-mcp        # Configure Model Context Protocol
npm run setup-database   # Initialize database
npm run deploy-schema    # Deploy database schema
```

## Architecture & Code Structure

### Authentication & User Management
- **AuthContext** (`src/contexts/AuthContext.tsx`): Global auth state using Supabase Auth
  - Manages user session and profile data
  - Provides `user`, `profile`, `loading`, `signOut`, and `refreshProfile`
  - Profile includes subscription status synchronized with Stripe
  - Has testing override mode (`TESTING_PRO_MODE`) for development

- **Auth Flow**:
  1. User signs up → Email verification sent
  2. Email confirmation → `src/app/auth/callback/route.ts` handles token
  3. Auto-creates user profile in database during confirmation
  4. Stripe customer created asynchronously (non-blocking)

### Subscription & Payment Architecture
- **Two-tier system**: Free (10 searches/month) vs Pro (unlimited + bookmarks)
- **Stripe Integration** (`src/lib/stripe.ts`):
  - Live mode with real payment links
  - Monthly: `price_1SB5Y8I8PNaNPVmz4WzNzujr`
  - Yearly: `price_1SB5Y7I8PNaNPVmz5GCOeIEm`
  - Webhook handler: `src/app/api/webhooks/stripe/route.ts`

- **Webhook Events Handled**:
  - `customer.subscription.created` → Set user to 'pro'
  - `customer.subscription.updated` → Update subscription status
  - `customer.subscription.deleted` → Revert to 'free'
  - `invoice.payment_succeeded` → Update user record
  - `invoice.payment_failed` → Log for monitoring

### Database Layer (`src/lib/supabase.ts`)
- **Supabase Client**: Single instance exported for all operations
- **Key Tables**:
  - `contracts`: 1,357 records with full-text search indexes (updated Oct 1, 2025)
  - `users`: User profiles with Stripe integration
  - `saved_contracts`: Pro-only bookmarks (user_id + contract_id)
  - `search_usage`: Tracks monthly search limits for free users

- **Search Limits**:
  - Free users: 10 searches/month tracked via `search_usage` table
  - Pro users: Unlimited (returns 999999 as limit)
  - `incrementSearchCount()` records each search
  - Resets monthly based on `created_at` timestamp

- **Saved Contracts**:
  - Pro-only feature enforced in both frontend and backend
  - Uses JOIN query to fetch contract details with saved metadata
  - Unique constraint prevents duplicate saves

### Contract Service Layer (`src/lib/contractService.ts`)
- **ContractService class**: Central API for contract operations
- **Database Mapping**:
  - Maps database `source` (OMNIA, E&I, Sourcewell) → frontend display names (OMNIA Partners, E&I, Sourcewell)
  - All database columns map 1:1 to Contract interface (camelCase conversion)
  - Category is now a direct field (no longer from JSONB array)
  - Includes all new schema fields: eligibleIndustries, contractType, geographicCoverage, diversityStatus

- **Search & Filtering**:
  - Full-text search across title, description, supplier_name
  - Date range filtering on start_date/end_date
  - Source filtering with DB name translation (OMNIA Partners ↔ OMNIA)
  - Sorting: relevance, date, supplier, title, end_date
  - Pagination with offset/limit

### Frontend Pages Structure

**App Router Pages** (`src/app/`):
- `/` - Landing page with featured contracts
- `/search` - Main search interface with filters
- `/contract/[id]` - Dynamic contract detail pages
- `/dashboard` - User account and usage stats
- `/saved` - Bookmarked contracts (Pro only)
- `/pricing` - Subscription plans
- `/login`, `/signup` - Authentication
- `/account/billing` - Stripe billing portal
- `/api/webhooks/stripe` - Webhook endpoint

**Analytics & Monitoring**:
- **Vercel Analytics**: Integrated via `@vercel/analytics/react`
  - `<Analytics />` component in root layout (`src/app/layout.tsx`)
  - Tracks page views automatically in production
  - Debug mode in development (no data sent)

### Environment Configuration
Required `.env.local` variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://xqfimjbxjwisvknvgutx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=https://www.understoryanalytics.com
STRIPE_SECRET_KEY=<live_key>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
```

## Database Schema

### Contracts Table
```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY,
    source TEXT (OMNIA, Sourcewell, E&I),
    supplier_name TEXT,
    supplier_normalized TEXT,
    contract_number TEXT,
    title TEXT,
    description TEXT,
    category TEXT,
    eligible_industries TEXT,
    contract_type TEXT,
    start_date DATE,
    end_date DATE,
    geographic_coverage TEXT,
    diversity_status TEXT,
    contract_url TEXT,
    supplier_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Indexes**:
- Performance: source, supplier_normalized, category, status, end_date, contract_number
- Full-text: GIN indexes on title, description, supplier_name
- Unique constraint: (source, contract_number)

### Users Table
```sql
CREATE TABLE users (
    id UUID REFERENCES auth.users(id),
    email VARCHAR UNIQUE,
    full_name VARCHAR,
    subscription_status VARCHAR DEFAULT 'free',
    stripe_customer_id VARCHAR,
    stripe_subscription_id VARCHAR,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Row Level Security (RLS)
- Contracts: Public read access
- Users: Only own profile access
- Saved contracts: User can only see their own
- Search usage: User-specific with monthly reset logic

## Important Development Notes

### Schema Migration Pattern
When updating database schema:
1. Create migration SQL file (see `migration-schema-update.sql`)
2. Backup existing data to `*_backup` table
3. Run migration via Supabase SQL Editor
4. Update import scripts to match new schema
5. Verify with `node scripts/check-schema.js`

### Data Import Process
Current CSV structure maps 1:1 to database columns:
- Source file: `normalized-contracts_2025-10-01.csv`
- Import script: `scripts/import-contracts-fixed.js`
- Validates required fields and source values
- Batch processing: 100 contracts per batch
- Auto-generates UUIDs and timestamps

### Testing Pro Features Locally
Set `TESTING_PRO_MODE = true` in:
- `src/lib/supabase.ts` (line 11)
- `src/contexts/AuthContext.tsx` (line 17)

This bypasses Pro checks for development/testing.

### Stripe Webhook Testing
1. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
2. Production webhooks configured at Stripe Dashboard
3. Webhook endpoint must use raw body for signature validation

### Email Configuration
Supabase Auth settings:
- Site URL: `https://www.understoryanalytics.com`
- Redirect URLs include both production and localhost
- Email templates use `{{ .SiteURL }}` for dynamic URLs
- Confirmation flow: signup → email → callback → auto-login

## Key Technical Decisions

1. **Flattened Schema**: Removed separate `contract_items` table for simpler CSV import (Oct 2025)
   - Direct 1:1 mapping between CSV columns and database schema
   - Category is now a direct text field instead of JSONB array
   - All fields properly typed: dates, text, nullable fields

2. **Incomplete Data Strategy**: Show missing data instead of generating placeholders (Oct 2025)
   - **Business-driven decision** to support data quality differentiation model
   - NULL allowed for: `contract_number`, `start_date`, `end_date`
   - Display "Not Provided" consistently across all UI
   - Partial unique indexes prevent duplicates while allowing NULLs
   - ~75% of contracts show missing data, driving GPO engagement

3. **Lazy Stripe Initialization**: Stripe client only created when env var exists

4. **Non-blocking Stripe**: Customer creation doesn't block user profile creation

5. **Search Limit Tracking**: Separate `search_usage` table vs incrementing counter

6. **Frontend Source Mapping**: Display names differ from database values (OMNIA → OMNIA Partners)

7. **Vercel Analytics Integration**: Client-side tracking for page views and user behavior

## Common Gotchas

- Database column names use snake_case (e.g., `supplier_name`)
- Frontend types use camelCase (e.g., `supplierName`)
- Source filtering requires name translation: OMNIA Partners ↔ OMNIA
- Email redirects must match Supabase Site URL configuration
- Webhook signature validation requires raw request body
- Free tier search limit resets based on calendar month, not rolling 30 days

### Working with Incomplete Data
- **NEVER generate fake data** for missing fields - this is a core business requirement
- Contract numbers, dates, and other fields may be NULL - always check before using
- Use "Not Provided" messaging (not "Not Available" which implies platform error)
- When adding new features that use dates/contract numbers:
  - Handle NULL values gracefully
  - Display "Not Provided" for missing data
  - Don't filter out contracts with missing data (they're there intentionally)
- Sorting: NULL values should sort to end of lists
- Date filtering: Exclude contracts with NULL dates from date range filters

## Production Deployment

**Hosting**: Vercel with automatic deployments
- Build command: `npm run build`
- Output directory: `.next`
- Environment variables set in Vercel dashboard
- Custom domain with SSL configured

**Database**: Supabase production tier
- Connection pooling enabled
- RLS policies active
- Regular backups configured

**Payments**: Stripe Live Mode
- Webhooks configured with signing secret
- Payment links embedded in pricing page
- Customer Portal enabled for subscription management

**Analytics**: Vercel Analytics
- Integrated via `@vercel/analytics` package
- Automatic page view tracking in production
- View analytics at Vercel dashboard → Analytics tab

## Business Model: Data Quality Differentiation

**Core Value Proposition**: Show GPOs (Government Purchase Organizations) how incomplete competitor data hurts contract discoverability, encouraging them to provide complete information to our platform.

### Strategy
- Import contracts **with missing data** (contract numbers, dates, etc.)
- Display "Not Provided" for missing fields instead of generating fake data
- Create visual comparison showing complete vs. incomplete listings
- Demonstrate how complete data improves search results and user engagement

### Implementation
All missing data consistently displays **"Not Provided"** to:
1. Make data gaps immediately visible to GPOs
2. Emphasize GPO responsibility for data completeness
3. Avoid platform errors being blamed for missing information
4. Drive GPOs to submit complete contract information

## Recent Updates (October 2025)

### Schema Migration & Data Updates
- **Database Schema**: Migrated from old schema to flattened structure (Oct 1, 2025)
  - Removed `contract_items` JSONB table
  - Added direct columns: `category`, `eligible_industries`, `contract_type`, etc.
  - Column name updates: `purchasing_org` → `source`, `vendor_name` → `supplier_name`, etc.
  - Migration script: `migration-schema-update.sql`

- **Contract Service Updates**: Fixed all database mappings (Oct 1, 2025)
  - Updated `mapDatabaseContract()` to use correct column names
  - Fixed queries: search, filtering, sorting, related contracts
  - Added support for new schema fields in TypeScript interfaces

- **Data Import**: Updated to 1,357 contracts (Oct 1, 2025)
  - Import script: `scripts/import-contracts-fixed.js`
  - CSV source: `normalized-contracts_2025-10-01.csv`
  - Batch processing with validation (100 contracts per batch)

- **Vercel Analytics**: Added for production monitoring (Oct 1, 2025)
  - Package: `@vercel/analytics@^1.5.0`
  - Integrated in `src/app/layout.tsx`
  - Tracks page views and user behavior

### Incomplete Data Handling (Oct 1, 2025)

**Business Driver**: Support data quality differentiation strategy by showing missing data instead of generating fake placeholders.

- **NULL Contract Numbers** (171 contracts affected)
  - Database: Allow NULL `contract_number` field
  - Migration: `migration-allow-null-contract-number.sql`
  - Import: Removed from required fields validation
  - Display: Shows "Not Provided" instead of UUID fallback
  - Unique constraint: Partial index (only when contract_number exists)

- **NULL Dates** (1,017 contracts affected)
  - Types: `startDate: Date | null`, `endDate: Date | null`
  - Service: Return `null` instead of fake dates (was: today's date, today + 1 year)
  - Utils: `formatDateRange()`, `getDaysUntilExpiration()` handle null dates
  - Display: "Not Provided" shown across all pages:
    - Contract detail page (start/end dates, expiration)
    - Search results (expiration date)
    - Saved contracts (expiration date)
    - Homepage featured contracts (expiration date)
  - Sorting: NULL dates sorted to end of lists

**Impact**: ~75% of contracts (1,017/1,357) show "Not Provided" for dates, visually demonstrating incomplete data from GPOs and reinforcing the value of complete contract information.

### UI/UX Improvements (October 2025)

- **Card Layout Cleanup** (Oct 1, 2025)
  - Removed contract descriptions from all card views to reduce visual noise
  - Most descriptions duplicated title information, providing minimal additional value
  - Cards now display: source badge, category badge, title, supplier name, contract ID, and expiration
  - Applied across: search results (`src/app/search/page.tsx`), saved contracts (`src/app/saved/page.tsx`), and homepage (`src/app/page.tsx`)
  - Net reduction of 13 lines of code
  - **Rationale**: Title provides sufficient context for users to understand contract scope; detailed description available on contract detail page
