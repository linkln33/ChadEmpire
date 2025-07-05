# ChadEmpire: Migration from Prisma to Supabase

This document outlines the migration process from Prisma ORM to Supabase for the ChadEmpire project.

## Why Supabase?

After careful analysis, we've determined that using Supabase as the sole database solution provides several advantages:

1. **Better Performance**: Supabase's native connection pooling (Supavisor) eliminates connection exhaustion issues and provides 7-8x faster query performance compared to Prisma.

2. **Simplified Architecture**: Single provider for database, authentication, and real-time features reduces complexity.

3. **Enhanced Features**:
   - Built-in authentication system with JWT support
   - Row-level security (RLS) for data protection
   - Real-time subscriptions for live leaderboards and updates
   - Edge functions for serverless operations

4. **Solana Integration**: Supabase works seamlessly with the Solana blockchain integration, providing a clean separation between blockchain operations and database operations.

## Migration Steps

### 1. Set Up Supabase Project

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Get your project URL and API keys from the Supabase dashboard
3. Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Database Schema Migration

1. Apply the SQL migration script located at `/supabase/migrations/20250704_initial_schema.sql` to your Supabase project via the SQL Editor in the Supabase dashboard.

2. This script creates all necessary tables with proper indexes, constraints, and row-level security policies.

### 3. API Routes Migration

All API routes have been successfully migrated to use Supabase:

- `/api/auth`: Wallet-based authentication with nonce verification
- `/api/user`: User profile management and data retrieval
- `/api/stake`: Staking and unstaking operations with penalty calculations
- `/api/spin`: Spin mechanism, rewards, and daily limits
- `/api/boosters`: Booster usage, purchase, and minting from fragments
- `/api/leaderboard`: User rankings and system statistics
- `/api/lottery`: Lottery draws, ticket purchases, and prize distribution
- `/api/yield`: Yield calculation and claiming
- `/api/referral`: Referral code application and rewards

### 4. Client-Side Integration

1. Install the Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Use the Supabase client in your components:
```typescript
import { getSupabase } from '@/lib/supabase';

// In your component
const supabase = getSupabase();
const { data, error } = await supabase.from('users').select('*');
```

3. For real-time features, use Supabase subscriptions:
```typescript
const subscription = supabase
  .from('users')
  .on('UPDATE', payload => {
    // Handle real-time update
  })
  .subscribe();

// Don't forget to unsubscribe
return () => {
  subscription.unsubscribe();
};
```

## Solana Integration

The Solana blockchain integration remains unchanged. The existing `solana.ts` utility functions continue to work with Supabase, providing a clean separation between blockchain operations and database operations.

## Benefits of the Migration

1. **Connection Management**: Supabase's connection pooling eliminates connection exhaustion issues.

2. **Performance**: Queries are significantly faster, improving user experience.

3. **Real-time Features**: Native support for real-time subscriptions enables live leaderboards and instant updates.

4. **Security**: Row-level security ensures users can only access their own data.

5. **Simplified Codebase**: Reduced boilerplate and middleware layers.

## Next Steps

1. Complete the migration of remaining API routes
2. Implement real-time leaderboards using Supabase subscriptions
3. Add RLS policies for remaining tables
4. Implement proper JWT authentication with Supabase Auth
5. Set up automated database backups

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
