# Stripe Integration Plan for Contract Search

## Phase 1: Stripe Products & Pricing Setup ✅ COMPLETED
1. **Create Stripe Products**
   - [x] Create "Contract Search Free" product ($0/month) with 10 search limit
   - [x] Create "Contract Search Pro Monthly" product ($20/month) with unlimited searches
   - [x] Create "Contract Search Pro Yearly" product ($192/year) with unlimited searches
   - [x] Get product and price IDs for integration

2. **Free Tier Implementation**
   - [x] Set up $0 subscription product in Stripe (allows customer management)
   - [ ] Configure search count tracking and limits in application
   - [ ] Handle free tier signup without payment collection

3. **Payment Links Creation**
   - [x] Generate payment links for Pro Monthly and Pro Yearly subscriptions
   - [ ] Configure success/cancel redirect URLs
   - [ ] Set up free tier customer creation flow (no payment required)

## Phase 2: Frontend Integration ✅ COMPLETED
4. **Update Pricing Page**
   - [x] Replace mock buttons with real Stripe payment links
   - [x] Add loading states and error handling
   - [x] Implement subscription status checking

5. **Create Subscription Management**
   - [x] Build `/account/billing` page for subscription management
   - [x] Add upgrade/downgrade/cancel functionality
   - [x] Display current subscription status and next billing date

## Phase 3: Backend Integration ✅ COMPLETED
6. **Webhook Handler**
   - [x] Create `/api/webhooks/stripe` endpoint
   - [x] Handle subscription events (created, updated, cancelled)
   - [x] Update user subscription_status in Supabase

7. **Database Schema Updates**
   - [x] Add `stripe_customer_id` and `stripe_subscription_id` fields to user profiles
   - [x] Create subscription tracking table if needed

## Phase 4: User Experience ✅ COMPLETED
8. **Authentication Flow**
   - [x] Update user registration to create Stripe customers
   - [x] Link existing users to Stripe customers
   - [x] Handle subscription limits in search functionality

9. **Dashboard Updates**
   - [x] Show subscription status and billing info in user dashboard
   - [x] Add billing history and invoice access
   - [x] Update search limit enforcement based on real subscription status

## Phase 5: Testing & Polish ✅ COMPLETED
10. **Testing**
    - [x] Test subscription flows end-to-end
    - [x] Verify webhook handling
    - [x] Test upgrade/downgrade scenarios
    - [x] Security review completed

11. **Production Deployment**
    - [x] Deploy webhook endpoint to production
    - [x] Update environment variables to live mode
    - [x] Monitor subscription events with Stripe Dashboard
    - [x] Successfully processing live payments

## Product Configuration

### Pricing Structure
- **Free Tier**: $0/month, 10 searches per month
- **Pro Monthly**: $20/month, unlimited searches
- **Pro Yearly**: $192/year, unlimited searches (20% savings)

### Stripe Product IDs & Price IDs
*Updated after Phase 1 completion*

#### Free Tier
- **Product ID**: `prod_T77RrJ7YpNrrbv` (Contract Search Free)
- **Price ID**: `price_1SAtCpIalLFWR1AUkQT4FMxG` ($0/month)

#### Pro Tier
- **Product ID**: `prod_T77RvJa1JJVaS4` (Contract Search Pro)
- **Monthly Price ID**: `price_1SAtD6IalLFWR1AUAsBrAhWX` ($20/month)
- **Yearly Price ID**: `price_1SAtDIIalLFWR1AUxuFNW6v3` ($192/year)

#### Payment Links (LIVE MODE)
- **Pro Monthly**: https://buy.stripe.com/8x2aEX108g2m7Ge6SN5wI02
- **Pro Yearly**: https://buy.stripe.com/7sY28raAIeYigcK1yt5wI03

### Implementation Notes
- All users will be managed as Stripe customers (including free tier)
- Free tier uses $0 subscription for unified customer management
- Search limits enforced in application logic, not Stripe
- Webhook integration required for real-time subscription updates

---

**Status**: ✅ COMPLETED - All phases implemented and live in production
**Last Updated**: September 25, 2024
**Production Status**: Live Stripe payments processing at https://www.understoryanalytics.com