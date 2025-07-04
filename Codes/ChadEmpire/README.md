# ChadEmpire

A Next.js application for the ChadEmpire platform, featuring Solana wallet integration, staking, yield farming, and gamification elements.

## 🚀 Features

- **Wallet Integration**: Secure authentication using Solana wallet signatures
- **Staking System**: Stake tokens with flexible unstaking options
- **Yield Farming**: Earn yield on staked tokens
- **Gamification**: Spin-to-win mechanism, boosters, and lottery system
- **Leaderboard**: Compete with other users based on CHAD score
- **Referral System**: Invite friends and earn rewards

## 📋 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Solana Web3.js
- **Authentication**: Wallet signature verification with Supabase
- **State Management**: SWR for data fetching, Zustand for client-side state

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Environment Setup

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at http://localhost:3000

## 📊 API Routes

All API routes are located in `src/app/api/` and follow Next.js 15 App Router conventions:

- `/api/auth`: Wallet-based authentication
- `/api/user`: User profile management
- `/api/stake`: Staking operations
- `/api/yield`: Yield calculation and claiming
- `/api/referral`: Referral system
- `/api/leaderboard`: User rankings
- `/api/lottery`: Lottery system
- `/api/boosters`: Booster management
- `/api/spin`: Spin mechanism

## 🔄 Database Schema

The database schema is defined in TypeScript at `src/types/supabase.ts`. Key tables include:

- `users`: User profiles and statistics
- `stakes`: Staking records
- `spins`: Spin history and results
- `boosters`: User boosters
- `lottery_draws`: Lottery draw information
- `lottery_tickets`: User lottery tickets
- `yield_claims`: Record of yield claims
- `referrals`: Referral relationships

## 📝 Migration Notes

This project was migrated from Prisma ORM to Supabase. For details on the migration process and architecture decisions, see [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md).

## 🧪 Testing

```bash
# Run tests
npm test
```

## 🚢 Deployment

The application is configured for deployment on Vercel:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

Copyright © 2025 ChadEmpire. All rights reserved.
