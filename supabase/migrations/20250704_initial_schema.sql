-- Create auth_nonces table for wallet authentication
CREATE TABLE IF NOT EXISTS auth_nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  chad_score INTEGER DEFAULT 0 NOT NULL,
  total_spins INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  total_yield_earned DECIMAL DEFAULT 0 NOT NULL,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create stakes table
CREATE TABLE IF NOT EXISTS stakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  staked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  unstake_requested_at TIMESTAMP WITH TIME ZONE,
  unstaked_at TIMESTAMP WITH TIME ZONE,
  penalty_amount DECIMAL DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'UNSTAKING', 'UNSTAKED')),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create spins table
CREATE TABLE IF NOT EXISTS spins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spin_type TEXT DEFAULT 'DAILY' NOT NULL CHECK (spin_type IN ('DAILY', 'BONUS', 'PREMIUM')),
  result TEXT NOT NULL CHECK (result IN ('WIN', 'CONSOLATION')),
  yield_percentage DECIMAL,
  yield_amount DECIMAL,
  consolation_type TEXT CHECK (consolation_type IN ('LOTTERY_TICKET', 'CHAD_SCORE', 'BOOSTER_FRAGMENT', 'BONUS_SPIN')),
  consolation_amount INTEGER,
  booster_used TEXT,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create boosters table
CREATE TABLE IF NOT EXISTS boosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mint_address TEXT NOT NULL UNIQUE,
  booster_type TEXT NOT NULL CHECK (booster_type IN ('YIELD_MULTIPLIER', 'LUCK_BOOST', 'BONUS_SPIN', 'JACKPOT_ACCESS')),
  power_level INTEGER DEFAULT 1 NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create fragments table
CREATE TABLE IF NOT EXISTS fragments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fragment_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create lottery_draws table
CREATE TABLE IF NOT EXISTS lottery_draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_number INTEGER NOT NULL UNIQUE,
  draw_time TIMESTAMP WITH TIME ZONE NOT NULL,
  jackpot DECIMAL NOT NULL,
  winning_numbers TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create lottery_tickets table
CREATE TABLE IF NOT EXISTS lottery_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lottery_draw_id UUID REFERENCES lottery_draws(id) ON DELETE SET NULL,
  ticket_number TEXT NOT NULL,
  is_winner BOOLEAN DEFAULT false NOT NULL,
  matched_numbers INTEGER DEFAULT 0 NOT NULL,
  prize_amount DECIMAL,
  claimed BOOLEAN DEFAULT false NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create system_stats table
CREATE TABLE IF NOT EXISTS system_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_users INTEGER DEFAULT 0 NOT NULL,
  total_staked DECIMAL DEFAULT 0 NOT NULL,
  total_spins INTEGER DEFAULT 0 NOT NULL,
  total_yield_paid DECIMAL DEFAULT 0 NOT NULL,
  lottery_pool DECIMAL DEFAULT 0 NOT NULL,
  next_lottery_draw TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_chad_score ON users(chad_score);
CREATE INDEX IF NOT EXISTS idx_stakes_user_id ON stakes(user_id);
CREATE INDEX IF NOT EXISTS idx_stakes_status ON stakes(status);
CREATE INDEX IF NOT EXISTS idx_spins_user_id ON spins(user_id);
CREATE INDEX IF NOT EXISTS idx_spins_created_at ON spins(created_at);
CREATE INDEX IF NOT EXISTS idx_boosters_user_id ON boosters(user_id);
CREATE INDEX IF NOT EXISTS idx_boosters_booster_type ON boosters(booster_type);
CREATE INDEX IF NOT EXISTS idx_boosters_used_at ON boosters(used_at);
CREATE INDEX IF NOT EXISTS idx_fragments_user_id ON fragments(user_id);
CREATE INDEX IF NOT EXISTS idx_fragments_fragment_type ON fragments(fragment_type);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_draw_time ON lottery_draws(draw_time);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_status ON lottery_draws(status);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user_id ON lottery_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_draw_id ON lottery_tickets(lottery_draw_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_is_winner ON lottery_tickets(is_winner);

-- Create Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_nonces ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = wallet_address);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Create policies for stakes table
CREATE POLICY "Users can view their own stakes" ON stakes
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Create policies for spins table
CREATE POLICY "Users can view their own spins" ON spins
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Create policies for boosters table
CREATE POLICY "Users can view their own boosters" ON boosters
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Create policies for fragments table
CREATE POLICY "Users can view their own fragments" ON fragments
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Create policies for lottery_tickets table
CREATE POLICY "Users can view their own lottery tickets" ON lottery_tickets
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Create policies for lottery_draws table (public readable)
CREATE POLICY "Anyone can view lottery draws" ON lottery_draws
  FOR SELECT USING (true);

-- Create policies for system_stats table (public readable)
CREATE POLICY "Anyone can view system stats" ON system_stats
  FOR SELECT USING (true);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_stakes_updated_at
  BEFORE UPDATE ON stakes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_fragments_updated_at
  BEFORE UPDATE ON fragments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_lottery_draws_updated_at
  BEFORE UPDATE ON lottery_draws
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_system_stats_updated_at
  BEFORE UPDATE ON system_stats
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
