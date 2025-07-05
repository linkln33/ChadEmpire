export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          username: string | null
          avatar_url: string | null
          chad_score: number
          total_spins: number
          total_wins: number
          total_yield_earned: number
          referral_code: string | null
          referred_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username?: string | null
          avatar_url?: string | null
          chad_score?: number
          total_spins?: number
          total_wins?: number
          total_yield_earned?: number
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string | null
          avatar_url?: string | null
          chad_score?: number
          total_spins?: number
          total_wins?: number
          total_yield_earned?: number
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stakes: {
        Row: {
          id: string
          user_id: string
          amount: number
          staked_at: string
          unstake_requested_at: string | null
          unstaked_at: string | null
          penalty_amount: number
          status: 'ACTIVE' | 'UNSTAKING' | 'UNSTAKED'
          transaction_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          staked_at?: string
          unstake_requested_at?: string | null
          unstaked_at?: string | null
          penalty_amount?: number
          status?: 'ACTIVE' | 'UNSTAKING' | 'UNSTAKED'
          transaction_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          staked_at?: string
          unstake_requested_at?: string | null
          unstaked_at?: string | null
          penalty_amount?: number
          status?: 'ACTIVE' | 'UNSTAKING' | 'UNSTAKED'
          transaction_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      spins: {
        Row: {
          id: string
          user_id: string
          spin_type: 'DAILY' | 'BONUS' | 'PREMIUM'
          result: 'WIN' | 'CONSOLATION'
          yield_percentage: number | null
          yield_amount: number | null
          consolation_type: 'LOTTERY_TICKET' | 'CHAD_SCORE' | 'BOOSTER_FRAGMENT' | 'BONUS_SPIN' | null
          consolation_amount: number | null
          booster_used: string | null
          transaction_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spin_type?: 'DAILY' | 'BONUS' | 'PREMIUM'
          result: 'WIN' | 'CONSOLATION'
          yield_percentage?: number | null
          yield_amount?: number | null
          consolation_type?: 'LOTTERY_TICKET' | 'CHAD_SCORE' | 'BOOSTER_FRAGMENT' | 'BONUS_SPIN' | null
          consolation_amount?: number | null
          booster_used?: string | null
          transaction_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spin_type?: 'DAILY' | 'BONUS' | 'PREMIUM'
          result?: 'WIN' | 'CONSOLATION'
          yield_percentage?: number | null
          yield_amount?: number | null
          consolation_type?: 'LOTTERY_TICKET' | 'CHAD_SCORE' | 'BOOSTER_FRAGMENT' | 'BONUS_SPIN' | null
          consolation_amount?: number | null
          booster_used?: string | null
          transaction_hash?: string | null
          created_at?: string
        }
      }
      boosters: {
        Row: {
          id: string
          user_id: string
          mint_address: string
          booster_type: 'YIELD_MULTIPLIER' | 'LUCK_BOOST' | 'BONUS_SPIN' | 'JACKPOT_ACCESS'
          power_level: number
          used_at: string | null
          expires_at: string | null
          transaction_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mint_address: string
          booster_type: 'YIELD_MULTIPLIER' | 'LUCK_BOOST' | 'BONUS_SPIN' | 'JACKPOT_ACCESS'
          power_level?: number
          used_at?: string | null
          expires_at?: string | null
          transaction_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mint_address?: string
          booster_type?: 'YIELD_MULTIPLIER' | 'LUCK_BOOST' | 'BONUS_SPIN' | 'JACKPOT_ACCESS'
          power_level?: number
          used_at?: string | null
          expires_at?: string | null
          transaction_hash?: string | null
          created_at?: string
        }
      }
      fragments: {
        Row: {
          id: string
          user_id: string
          fragment_type: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fragment_type: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fragment_type?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      lottery_draws: {
        Row: {
          id: string
          draw_number: number
          draw_time: string
          jackpot: number
          winning_numbers: string
          status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          draw_number: number
          draw_time: string
          jackpot: number
          winning_numbers: string
          status?: 'PENDING' | 'COMPLETED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          draw_number?: number
          draw_time?: string
          jackpot?: number
          winning_numbers?: string
          status?: 'PENDING' | 'COMPLETED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
      }
      lottery_tickets: {
        Row: {
          id: string
          user_id: string
          lottery_draw_id: string | null
          ticket_number: string
          is_winner: boolean
          matched_numbers: number
          prize_amount: number | null
          claimed: boolean
          transaction_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lottery_draw_id?: string | null
          ticket_number: string
          is_winner?: boolean
          matched_numbers?: number
          prize_amount?: number | null
          claimed?: boolean
          transaction_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lottery_draw_id?: string | null
          ticket_number?: string
          is_winner?: boolean
          matched_numbers?: number
          prize_amount?: number | null
          claimed?: boolean
          transaction_hash?: string | null
          created_at?: string
        }
      }
      system_stats: {
        Row: {
          id: string
          total_users: number
          total_staked: number
          total_spins: number
          total_yield_paid: number
          lottery_pool: number
          next_lottery_draw: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          total_users?: number
          total_staked?: number
          total_spins?: number
          total_yield_paid?: number
          lottery_pool?: number
          next_lottery_draw?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          total_users?: number
          total_staked?: number
          total_spins?: number
          total_yield_paid?: number
          lottery_pool?: number
          next_lottery_draw?: string | null
          updated_at?: string
        }
      },
      auth_nonces: {
        Row: {
          id: string
          wallet_address: string
          nonce: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          nonce: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          nonce?: string
          expires_at?: string
          created_at?: string
        }
      },
      yield_claims: {
        Row: {
          id: string
          user_id: string
          amount: number
          claimed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          claimed_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          claimed_at?: string
          created_at?: string
        }
      },
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          bonus_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          bonus_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          bonus_amount?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_total_staked: {
        Args: { amount_to_add: number }
        Returns: number
      },
      decrement_total_staked: {
        Args: { amount_to_subtract: number }
        Returns: number
      },
      increment_total_yield_paid: {
        Args: { amount_to_add: number }
        Returns: number
      },
      increment_chad_score: {
        Args: { user_id: string; amount_to_add: number }
        Returns: number
      },
      decrement_chad_score: {
        Args: { user_id: string; amount_to_subtract: number }
        Returns: number
      },
      increment_total_spins: {
        Args: { user_id: string }
        Returns: number
      },
      increment_total_wins: {
        Args: { user_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
