# Government Contract Search MVP - Project Plan

## Overview
An MVP webapp that aggregates government contracts from sources like E&I, Sourcewell, and OMNIA Partners with a focus on search, browse, and user management features.

## Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui
- **Database**: Supabase (future) - using local data for MVP
- **Payments**: Stripe (future) - mock implementation for MVP
- **Styling**: Tailwind CSS (via shadcn/ui)

## Data Structure
```typescript
interface Contract {
  id: string;
  source: 'E&I' | 'Sourcewell' | 'OMNIA Partners' | 'Other';
  contractId: string;
  url: string;
  supplierName: string;
  contractTitle: string;
  contractDescription: string;
  category: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: 'free' | 'pro';
  searchCount: number;
  savedContracts: string[];
  createdAt: Date;
}
```

## Core Features

### 1. User Authentication
- [ ] Sign up with email/password
- [ ] Login/logout functionality
- [ ] User profile management
- [ ] Password reset (future)

### 2. Contract Search & Browse
- [ ] Search contracts by title, description, supplier
- [ ] Filter by source (E&I, Sourcewell, OMNIA, etc.)
- [ ] Filter by category
- [ ] Filter by date ranges
- [ ] Sort by relevance, date, supplier
- [ ] Pagination for search results

### 3. Contract Details
- [ ] Individual contract detail pages
- [ ] Display all contract fields
- [ ] Save/unsave contracts (Pro users)
- [ ] Share contract links

### 4. User Dashboard
- [ ] View saved contracts (Pro users)
- [ ] Search history
- [ ] Account settings
- [ ] Subscription management (future)

### 5. Subscription Tiers
- [ ] **Free Tier**: 10 searches per month
- [ ] **Pro Tier**: Unlimited searches + saved contracts ($20/month)
- [ ] Mock subscription logic for MVP

## Site Structure
```
/ (Home page with hero)
/search (Search results with filters)
/contract/[id] (Contract detail pages)
/login (User login)
/signup (User registration)
/dashboard (User profile & saved contracts)
```

## Development Phases

### Phase 1: Project Setup & Foundation
- [x] Create project plan
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up shadcn/ui components
- [ ] Configure Tailwind CSS
- [ ] Set up project structure

### Phase 2: Data & Types
- [ ] Define TypeScript interfaces
- [ ] Create mock contract data
- [ ] Set up data management utilities

### Phase 3: Core UI Components
- [ ] Header with navigation
- [ ] Search input component
- [ ] Filter sidebar component
- [ ] Contract card component
- [ ] Pagination component

### Phase 4: Pages & Routing
- [ ] Home page with hero section
- [ ] Search results page
- [ ] Contract detail pages
- [ ] Authentication pages

### Phase 5: User Management
- [ ] Mock authentication system
- [ ] User dashboard
- [ ] Subscription tier logic

### Phase 6: Polish & Testing
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Final UI polish

## Mock Data Strategy
- Create 50-100 realistic contract entries
- Include variety of sources, suppliers, and categories
- Use realistic dates and descriptions
- Cover different contract types and categories

## Future Enhancements (Post-MVP)
- Real data integration with APIs
- Advanced search with full-text search
- Email notifications for saved contracts
- Contract comparison features
- Admin dashboard for data management
- Real Stripe integration
- Supabase database integration

## Success Metrics
- Users can successfully search and find contracts
- Clean, intuitive user interface
- Fast search performance
- Mobile-responsive design
- Clear subscription tier differentiation

## Reference UX
- **trueup.io**: Clean, professional design with good search UX
- Focus on usability and information hierarchy
- Minimal, distraction-free interface
