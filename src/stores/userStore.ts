import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  walletAddress: string;
  username?: string;
  avatarUrl?: string;
  chadScore: number;
  totalSpins: number;
  totalWins: number;
  totalYieldEarned: number;
  referralCode?: string;
  referredBy?: string;
}

export interface Stake {
  id: string;
  amount: number;
  stakedAt: Date;
  unstakeRequestedAt?: Date;
  unstakedAt?: Date;
  penaltyAmount: number;
  status: 'active' | 'unstaking' | 'unstaked';
}

export interface Spin {
  id: string;
  spinType: 'daily' | 'bonus' | 'premium';
  result: 'win' | 'consolation';
  yieldPercentage?: number;
  yieldAmount?: number;
  consolationType?: 'lottery_ticket' | 'chad_score' | 'booster_fragment' | 'bonus_spin';
  consolationAmount?: number;
  createdAt: Date;
}

export interface BoosterNft {
  id: string;
  mintAddress: string;
  boosterType: 'yield_multiplier' | 'luck_boost' | 'bonus_spin' | 'jackpot_access';
  powerLevel: number;
  usedAt?: Date;
}

export interface BoosterFragment {
  id: string;
  fragmentType: string;
  quantity: number;
}

export interface LotteryTicket {
  id: string;
  ticketNumber: string;
  lotteryDrawId?: string;
  isWinner: boolean;
}

interface UserState {
  user: User | null;
  stakes: Stake[];
  spins: Spin[];
  boosters: BoosterNft[];
  fragments: BoosterFragment[];
  lotteryTickets: LotteryTicket[];
  
  // Actions
  setUser: (user: User | null) => void;
  updateStakes: (stakes: Stake[]) => void;
  addStake: (stake: Stake) => void;
  updateStake: (id: string, updates: Partial<Stake>) => void;
  addSpin: (spin: Spin) => void;
  updateChadScore: (score: number) => void;
  addBooster: (booster: BoosterNft) => void;
  useBooster: (id: string) => void;
  addFragment: (fragment: BoosterFragment) => void;
  updateFragmentQuantity: (id: string, quantity: number) => void;
  addLotteryTicket: (ticket: LotteryTicket) => void;
  fetchUserData: (walletAddress: string) => Promise<void>;
  
  // Computed
  canSpinToday: () => boolean;
  totalStaked: () => number;
  totalYieldEarned: () => number;
  getActiveStakes: () => Stake[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      stakes: [],
      spins: [],
      boosters: [],
      fragments: [],
      lotteryTickets: [],
      
      setUser: (user) => set({ user }),
      
      updateStakes: (stakes) => set({ stakes }),
      
      addStake: (stake) => set((state) => ({ 
        stakes: [...state.stakes, stake] 
      })),
      
      updateStake: (id, updates) => set((state) => ({
        stakes: state.stakes.map(stake => 
          stake.id === id ? { ...stake, ...updates } : stake
        )
      })),
      
      addSpin: (spin) => set((state) => {
        const newSpins = [...state.spins, spin];
        const totalSpins = state.user ? state.user.totalSpins + 1 : 1;
        const totalWins = state.user && spin.result === 'win' 
          ? state.user.totalWins + 1 
          : state.user?.totalWins || 0;
        const totalYieldEarned = state.user && spin.yieldAmount 
          ? state.user.totalYieldEarned + spin.yieldAmount 
          : state.user?.totalYieldEarned || 0;
          
        return {
          spins: newSpins,
          user: state.user ? {
            ...state.user,
            totalSpins,
            totalWins,
            totalYieldEarned
          } : null
        };
      }),
      
      updateChadScore: (score) => set((state) => ({
        user: state.user ? {
          ...state.user,
          chadScore: state.user.chadScore + score
        } : null
      })),
      
      addBooster: (booster) => set((state) => ({
        boosters: [...state.boosters, booster]
      })),
      
      useBooster: (id) => set((state) => ({
        boosters: state.boosters.map(booster =>
          booster.id === id ? { ...booster, usedAt: new Date() } : booster
        )
      })),
      
      addFragment: (fragment) => set((state) => {
        const existingFragment = state.fragments.find(f => f.fragmentType === fragment.fragmentType);
        
        if (existingFragment) {
          return {
            fragments: state.fragments.map(f => 
              f.id === existingFragment.id 
                ? { ...f, quantity: f.quantity + fragment.quantity } 
                : f
            )
          };
        }
        
        return {
          fragments: [...state.fragments, fragment]
        };
      }),
      
      updateFragmentQuantity: (id, quantity) => set((state) => ({
        fragments: state.fragments.map(fragment =>
          fragment.id === id ? { ...fragment, quantity } : fragment
        )
      })),
      
      addLotteryTicket: (ticket) => set((state) => ({
        lotteryTickets: [...state.lotteryTickets, ticket]
      })),
      
      fetchUserData: async (walletAddress) => {
        // This would normally fetch data from an API
        // For now, we'll create mock data if the user doesn't exist
        const currentUser = get().user;
        
        if (!currentUser || currentUser.walletAddress !== walletAddress) {
          // Mock user data for demo purposes
          const mockUser: User = {
            walletAddress,
            username: `Chad${walletAddress.substring(0, 4)}`,
            avatarUrl: '/images/chad-warrior.svg',
            chadScore: 100,
            totalSpins: 0,
            totalWins: 0,
            totalYieldEarned: 0,
            referralCode: `CHAD${walletAddress.substring(0, 6)}`,
          };
          
          set({ user: mockUser });
        }
        
        // In a real app, we would also fetch stakes, spins, boosters, etc.
        return Promise.resolve();
      },
      
      // Computed values
      canSpinToday: () => {
        const { spins } = get();
        if (spins.length === 0) return true;
        
        const lastSpin = spins.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        
        const now = new Date();
        const lastSpinDate = new Date(lastSpin.createdAt);
        
        // Check if last spin was on a different calendar day
        return now.toDateString() !== lastSpinDate.toDateString();
      },
      
      totalStaked: () => {
        const { stakes } = get();
        return stakes
          .filter(stake => stake.status === 'active')
          .reduce((total, stake) => total + stake.amount, 0);
      },
      
      totalYieldEarned: () => {
        const { user } = get();
        return user?.totalYieldEarned || 0;
      },
      
      getActiveStakes: () => {
        const { stakes } = get();
        return stakes.filter(stake => stake.status === 'active');
      }
    }),
    {
      name: 'chadempire-user-storage',
      partialize: (state) => ({
        user: state.user,
        stakes: state.stakes,
        spins: state.spins,
        boosters: state.boosters,
        fragments: state.fragments,
        lotteryTickets: state.lotteryTickets
      })
    }
  )
);
