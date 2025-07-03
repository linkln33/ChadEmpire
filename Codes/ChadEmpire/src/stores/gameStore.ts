import { create } from 'zustand';

export interface SpinResult {
  type: 'win' | 'consolation';
  yieldPercentage?: string;
  yieldAmount?: string;
  consolationType?: 'lottery_ticket' | 'chad_score' | 'booster_fragment' | 'bonus_spin';
  consolationAmount?: number;
  message: string;
}

export interface SystemStats {
  totalUsers: number;
  totalStaked: number;
  totalSpins: number;
  totalYieldPaid: number;
  lotteryPool: number;
  nextLotteryDraw: Date;
}

export interface LeaderboardEntry {
  walletAddress: string;
  username?: string;
  avatarUrl?: string;
  chadScore: number;
  totalSpins: number;
  totalWins: number;
  totalYieldEarned: number;
  rank: number;
}

interface GameState {
  isSpinning: boolean;
  lastSpinResult: SpinResult | null;
  systemStats: SystemStats;
  leaderboard: LeaderboardEntry[];
  
  // Actions
  setSpinning: (spinning: boolean) => void;
  setSpinResult: (result: SpinResult | null) => void;
  updateSystemStats: (stats: Partial<SystemStats>) => void;
  updateLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  
  // Spin mechanics
  executeSpin: (stakeAmount: number, boosterUsed?: string) => Promise<SpinResult>;
}

// Mock initial system stats
const initialSystemStats: SystemStats = {
  totalUsers: 1247,
  totalStaked: 2500000,
  totalSpins: 18645,
  totalYieldPaid: 42680,
  lotteryPool: 5750,
  nextLotteryDraw: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
};

export const useGameStore = create<GameState>()((set, get) => ({
  isSpinning: false,
  lastSpinResult: null,
  systemStats: initialSystemStats,
  leaderboard: [],
  
  setSpinning: (spinning) => set({ isSpinning: spinning }),
  
  setSpinResult: (result) => set({ lastSpinResult: result }),
  
  updateSystemStats: (stats) => set((state) => ({
    systemStats: { ...state.systemStats, ...stats }
  })),
  
  updateLeaderboard: (leaderboard) => set({ leaderboard }),
  
  executeSpin: async (stakeAmount, boosterUsed) => {
    set({ isSpinning: true });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Determine spin result based on probabilities in whitepaper
    const isWin = Math.random() < 0.6; // 60% chance to win yield
    let result: SpinResult;
    
    if (isWin) {
      // 10% chance for jackpot (1-3% yield)
      const isJackpot = Math.random() < 0.1;
      
      const yieldPercentage = isJackpot 
        ? (Math.random() * 2 + 1).toFixed(2) // 1-3%
        : (Math.random() * 0.4 + 0.1).toFixed(2); // 0.1-0.5%
        
      const yieldAmount = (stakeAmount * Number(yieldPercentage) / 100).toFixed(2);
      
      result = {
        type: 'win',
        yieldPercentage: `${yieldPercentage}%`,
        yieldAmount,
        message: isJackpot 
          ? 'JACKPOT! Massive yield earned!' 
          : 'Congratulations! You won yield!'
      };
      
      // Update system stats
      set((state) => ({
        systemStats: {
          ...state.systemStats,
          totalSpins: state.systemStats.totalSpins + 1,
          totalYieldPaid: state.systemStats.totalYieldPaid + Number(yieldAmount)
        }
      }));
    } else {
      // Consolation prizes
      const consolationTypes: Array<'lottery_ticket' | 'chad_score' | 'booster_fragment' | 'bonus_spin'> = 
        ['lottery_ticket', 'chad_score', 'booster_fragment', 'bonus_spin'];
      const weights = [50, 30, 15, 5]; // Probabilities as per whitepaper
      
      // Weighted random selection
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;
      
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }
      
      const consolationType = consolationTypes[selectedIndex];
      let consolationAmount = 1;
      let message = '';
      
      switch (consolationType) {
        case 'lottery_ticket':
          message = 'You earned a lottery ticket for the weekly draw!';
          break;
        case 'chad_score':
          consolationAmount = Math.floor(Math.random() * 50) + 10; // 10-60 points
          message = `Your Chad Score increased by ${consolationAmount} points!`;
          break;
        case 'booster_fragment':
          message = 'You collected a Booster Fragment! Collect 5 to mint a Booster NFT.';
          break;
        case 'bonus_spin':
          message = 'RARE REWARD! You earned a Bonus Spin token!';
          break;
      }
      
      result = {
        type: 'consolation',
        consolationType,
        consolationAmount,
        message
      };
      
      // Update system stats
      set((state) => ({
        systemStats: {
          ...state.systemStats,
          totalSpins: state.systemStats.totalSpins + 1
        }
      }));
    }
    
    set({ 
      isSpinning: false,
      lastSpinResult: result
    });
    
    return result;
  }
}));
