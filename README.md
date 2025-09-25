# Contract Search Platform

A production-ready government contract search platform aggregating 1330+ contracts from E&I, Sourcewell, and OMNIA Partners. Features user authentication, subscription management, contract bookmarking, and advanced search capabilities.

**🌐 Live URL**: https://www.understoryanalytics.com
**📊 Status**: Production Ready with Live Stripe Payments

## 🚀 Features

### Core Functionality
- **Advanced Contract Search**: Real-time search across 1330+ government contracts
- **Multi-Source Aggregation**: E&I, Sourcewell, OMNIA Partners contracts
- **User Authentication**: Complete signup/login with email verification
- **Subscription Management**: Free (10 searches) / Pro (unlimited + bookmarks)
- **Contract Bookmarking**: Save/organize contracts (Pro feature)
- **User Dashboard**: Usage tracking, saved contracts, account management
- **Mobile-First Design**: Responsive, professional UI/UX

### Production Data
- **1330+ Real Contracts** from major government purchasing cooperatives
- **Real-time Search** with advanced filtering and sorting
- **Live Database** with Supabase PostgreSQL backend
- **Production Payments** via Stripe integration

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with email verification
- **Payments**: Stripe (Live mode with webhooks)
- **Hosting**: Vercel with custom domain
- **Search**: Full-text search with indexing

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── contract/[id]/     # Dynamic contract detail pages
│   ├── dashboard/         # User dashboard and account management
│   ├── saved/            # Saved contracts page (Pro users)
│   ├── pricing/          # Subscription plans and payments
│   ├── search/           # Advanced contract search
│   ├── login/ & signup/  # Authentication pages
│   └── api/webhooks/     # Stripe webhook handlers
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── Header.tsx       # Navigation with auth status
├── contexts/            # React contexts
│   └── AuthContext.tsx  # User authentication state
├── lib/                 # Core services and utilities
│   ├── supabase.ts      # Database operations
│   ├── contractService.ts # Contract search/filtering
│   ├── stripe.ts        # Payment processing
│   └── utils.ts         # General utilities
└── types/               # TypeScript interfaces
    └── supabase.ts      # Database type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contract-search-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Live Application

The application is deployed at **https://www.understoryanalytics.com** with:
- **Real contract data** (1330+ contracts)
- **Live Stripe payments** for Pro subscriptions
- **Email verification** for new accounts
- **Production database** with Supabase

## 📱 Pages & Features

### Home Page (`/`)
- Hero section with value proposition
- Feature highlights
- Featured contracts showcase
- Call-to-action sections

### Search Page (`/search`)
- Advanced search with multiple filters
- Real-time search results
- Pagination support
- Sort by relevance, date, supplier, or title

### Contract Details (`/contract/[id]`)
- Complete contract information
- Related contracts suggestions
- Save/share functionality (Pro users)
- Contract status and expiration tracking

### Authentication (`/login`, `/signup`)
- User registration and login
- Form validation
- Demo account information

### User Dashboard (`/dashboard`)
- Account information and usage stats
- Saved contracts (Pro users)
- Quick action buttons
- Recent activity tracking

## 💳 Subscription Tiers

### Free Tier ($0/month)
- 10 contract searches per month
- Access to all 1330+ contracts
- Advanced search and filtering
- Contract detail pages
- Search history tracking

### Pro Tier ($20/month or $192/year)
- **Unlimited** contract searches
- **Save and organize** contracts
- Dedicated saved contracts page
- Enhanced dashboard with bookmarks
- Email notifications (coming soon)

## 🎨 Design System

The application uses a consistent design system built on:
- **shadcn/ui**: Modern, accessible component library
- **Tailwind CSS**: Utility-first CSS framework
- **Color Palette**: Blue primary, neutral grays
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent 4px grid system

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Adding New Components

The project uses shadcn/ui for components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

### Mock Data

Current implementation uses mock data located in:
- `src/data/mockContracts.ts` - Sample contract data
- `src/data/mockUsers.ts` - User management and authentication

## 🚧 Roadmap

### Completed ✅
- Production database with 1330+ real contracts
- Live Stripe payment processing
- User authentication with email verification
- Contract bookmarking system
- Advanced search with filtering
- Mobile-responsive design
- Custom domain deployment

### Coming Soon 🔄
- Email notifications for saved contracts
- Contract expiration alerts
- Advanced search with full-text ranking
- Contract comparison tools
- Bulk export functionality (CSV/PDF)
- Admin dashboard for data management

## 📊 Data Model

### Database Schema (Supabase)

**Contracts Table** (1330+ records)
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  contract_number VARCHAR,
  contract_title TEXT,
  vendor_name VARCHAR,
  purchasing_org VARCHAR,
  contract_start_date DATE,
  contract_end_date DATE,
  description TEXT,
  items JSONB,
  contact_info JSONB,
  document_urls JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  subscription_status VARCHAR DEFAULT 'free',
  stripe_customer_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Saved Contracts Table**
```sql
CREATE TABLE saved_contracts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  contract_id UUID REFERENCES contracts(id),
  saved_at TIMESTAMP DEFAULT NOW()
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📈 Key Metrics

- **1330+ Government Contracts** from E&I, Sourcewell, OMNIA Partners
- **Production-Ready** with live payments and real user data
- **Mobile-First Design** with 100% responsive layout
- **Sub-second Search** with advanced filtering and pagination
- **Live Stripe Integration** with webhooks and subscription management
- **Secure Authentication** with email verification and RLS policies

## 🚀 Deployment

**Production URL**: https://www.understoryanalytics.com
**Hosting**: Vercel with automatic deployments
**Database**: Supabase with production scaling
**Payments**: Stripe with live webhook integration
**Domain**: Custom domain with SSL

## 🆘 Support

For questions or issues:
- Check the `PROJECT_DOCUMENTATION.md` for detailed technical information
- Review `DEPLOYMENT_NEXT_STEPS.md` for production setup details
- Create an issue in the repository for bugs or feature requests

---

**Built with ❤️ using Next.js 14, TypeScript, Supabase, Stripe, and shadcn/ui**
**Status: Production Ready with Live Payments** 🎉