# ContractSearch MVP

A modern web application for aggregating and searching government contracts from multiple sources including E&I, Sourcewell, and OMNIA Partners.

## 🚀 Features

### Core Functionality
- **Contract Search**: Advanced search with filters by source, category, date range, and supplier
- **Contract Details**: Comprehensive contract information pages with related contracts
- **User Authentication**: Sign up, login, and user profile management
- **Subscription Tiers**: Free (10 searches/month) and Pro ($20/month, unlimited + saved contracts)
- **User Dashboard**: Personal dashboard with saved contracts and usage statistics

### Data Sources
- E&I Cooperative Services
- Sourcewell
- OMNIA Partners
- Other government contracting sources

### Contract Information
- Source and Contract ID
- Supplier Name and Contact
- Contract Title and Description
- Category Classification
- Start and End Dates
- Direct links to original contracts

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Database**: Mock data (Supabase integration planned)
- **Payments**: Mock implementation (Stripe integration planned)
- **Authentication**: Mock system (Supabase Auth planned)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── contract/[id]/     # Dynamic contract detail pages
│   ├── dashboard/         # User dashboard
│   ├── login/            # Authentication pages
│   ├── search/           # Contract search page
│   └── signup/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── Header.tsx       # Main navigation
├── data/                # Mock data and utilities
│   ├── mockContracts.ts # Sample contract data
│   └── mockUsers.ts     # User management
├── lib/                 # Utility functions
│   ├── contractUtils.ts # Search and contract utilities
│   └── utils.ts         # General utilities
└── types/               # TypeScript type definitions
    └── index.ts         # Main type definitions
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

### Demo Accounts

For testing purposes, you can use these demo accounts:

**Free Account:**
- Email: `demo@example.com`
- Password: `password`

**Pro Account:**
- Email: `pro@example.com`
- Password: `password`

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

### Free Tier
- 10 contract searches per month
- Access to all contract sources
- Advanced search filters
- Basic contract details

### Pro Tier ($20/month)
- Unlimited contract searches
- Save and organize contracts
- Enhanced dashboard features
- Priority support (future)

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

## 🚧 Future Enhancements

### Phase 2 Features
- Real data integration with contract APIs
- Supabase database integration
- Stripe payment processing
- Email notifications for saved contracts
- Advanced search with full-text search
- Contract comparison tools

### Phase 3 Features
- Admin dashboard for data management
- API for third-party integrations
- Mobile app development
- Advanced analytics and reporting
- Contract expiration alerts
- Bulk export functionality

## 📊 Data Model

### Contract Schema
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
```

### User Schema
```typescript
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**