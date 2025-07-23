import { create } from 'zustand';
import { nicknameService } from '@/utils/nicknameService';
import { memorizedService, TierInfo } from '@/utils/memorizedService';
import { learningStreakService } from '@/utils/learningStreak';
import { leaderboardService, TierLeaderboard } from '@/utils/leaderboardService';
import { getCurrentUser } from './authStore';

interface StreakData {
  currentStreak: number;
  currentMonthCount: number;
  totalFireCount: number;
  maxStreak: number;
  markedDates: Record<string, any>;
}

interface UserProfileState {
  // Data
  nickname: string;
  tierInfo: TierInfo | null;
  memorizedCount: number;
  totalWords: number;
  streakData: StreakData;
  leaderboardData: TierLeaderboard | null;
  selectedTier: "Sage" | "Knight" | "Apprentice";
  
  // Loading states
  loading: boolean;
  nicknameLoading: boolean;
  
  // Cache management
  lastFetch: number;
  cacheExpiry: number;
  
  // Actions
  fetchAllData: () => Promise<void>;
  fetchNickname: () => Promise<void>;
  fetchTierInfo: () => Promise<void>;
  fetchStreakData: () => Promise<void>;
  fetchLeaderboardData: (tier?: "Sage" | "Knight" | "Apprentice") => Promise<void>;
  updateNickname: (newNickname: string) => Promise<boolean>;
  setSelectedTier: (tier: "Sage" | "Knight" | "Apprentice") => void;
  shouldRefetch: () => boolean;
  clearCache: () => void;
  
  // Optimistic updates
  optimisticUpdateMemorizedCount: (change: number) => void;
  optimisticUpdateTier: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  // Initial state
  nickname: '',
  tierInfo: null,
  memorizedCount: 0,
  totalWords: 0,
  streakData: {
    currentStreak: 0,
    currentMonthCount: 0,
    totalFireCount: 0,
    maxStreak: 0,
    markedDates: {},
  },
  leaderboardData: null,
  selectedTier: 'Sage',
  loading: false,
  nicknameLoading: false,
  lastFetch: 0,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes

  // Check if data should be refetched
  shouldRefetch: () => {
    const { lastFetch, cacheExpiry } = get();
    return Date.now() - lastFetch > cacheExpiry;
  },

  // Clear cache
  clearCache: () => {
    set({ lastFetch: 0 });
  },

  // Fetch all data in parallel
  fetchAllData: async () => {
    const user = getCurrentUser();
    if (!user) return;

    // Check cache first
    if (!get().shouldRefetch() && get().lastFetch > 0) {
      console.log('Using cached profile data');
      return;
    }

    set({ loading: true });
    
    try {
      // Fetch all data in parallel to minimize API calls
      const [
        nicknameResult,
        tierInfoResult,
        memorizedCountResult,
        totalWordsResult,
        streakResult,
        maxStreakResult,
        currentStreakResult,
        monthCountResult,
        totalFireResult,
        markedDatesResult,
      ] = await Promise.all([
        nicknameService.getUserNickname(user.id).catch(() => nicknameService.generateDefaultNickname(user.id)),
        memorizedService.getUserTierInfo(user.id).catch(() => null),
        memorizedService.getMemorizedWordsCount(user.id).catch(() => 0),
        memorizedService.getTotalWordsCount(user.id).catch(() => 0),
        learningStreakService.getUserStreak(user.id).catch(() => null),
        learningStreakService.getMaxStreak(user.id).catch(() => 0),
        learningStreakService.getCurrentStreak(user.id).catch(() => 0),
        learningStreakService.getCurrentMonthCount(user.id).catch(() => 0),
        learningStreakService.getTotalFireCount(user.id).catch(() => 0),
        learningStreakService.getMarkedDates(user.id).catch(() => ({})),
      ]);

      const finalTierInfo = tierInfoResult || {
        currentTier: 'Apprentice',
        memorizedCount: memorizedCountResult,
        nextTier: 'Knight',
        nextTierRequirement: 500,
        progressPercentage: 0,
      };

      // Update all state at once
      set({
        nickname: nicknameResult,
        tierInfo: finalTierInfo,
        memorizedCount: memorizedCountResult,
        totalWords: totalWordsResult,
        streakData: {
          currentStreak: currentStreakResult,
          currentMonthCount: monthCountResult,
          totalFireCount: totalFireResult,
          maxStreak: maxStreakResult,
          markedDates: markedDatesResult,
        },
        selectedTier: finalTierInfo.currentTier as "Sage" | "Knight" | "Apprentice",
        lastFetch: Date.now(),
        loading: false,
      });

      // Fetch leaderboard for selected tier
      await get().fetchLeaderboardData();

    } catch (error) {
      console.error('Error fetching profile data:', error);
      set({
        loading: false,
        // Set default values on error
        nickname: nicknameService.generateDefaultNickname(user.id),
        tierInfo: {
          currentTier: 'Apprentice',
          memorizedCount: 0,
          nextTier: 'Knight',
          nextTierRequirement: 500,
          progressPercentage: 0,
        },
        selectedTier: 'Apprentice',
        memorizedCount: 0,
        totalWords: 0,
        streakData: {
          currentStreak: 0,
          currentMonthCount: 0,
          totalFireCount: 0,
          maxStreak: 0,
          markedDates: {},
        },
      });
    }
  },

  // Fetch nickname only
  fetchNickname: async () => {
    const user = getCurrentUser();
    if (!user) return;

    set({ nicknameLoading: true });
    
    try {
      const nickname = await nicknameService.getUserNickname(user.id);
      set({ nickname, nicknameLoading: false });
    } catch (error) {
      console.error('Error fetching nickname:', error);
      set({ 
        nickname: nicknameService.generateDefaultNickname(user.id),
        nicknameLoading: false 
      });
    }
  },

  // Fetch tier info only
  fetchTierInfo: async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const [tierInfo, memorizedCount, totalWords] = await Promise.all([
        memorizedService.getUserTierInfo(user.id),
        memorizedService.getMemorizedWordsCount(user.id),
        memorizedService.getTotalWordsCount(user.id),
      ]);

      const finalTierInfo = tierInfo || {
        currentTier: 'Apprentice',
        memorizedCount: memorizedCount || 0,
        nextTier: 'Knight',
        nextTierRequirement: 500,
        progressPercentage: 0,
      };

      set({
        tierInfo: finalTierInfo,
        selectedTier: finalTierInfo.currentTier as "Sage" | "Knight" | "Apprentice",
        memorizedCount: memorizedCount || 0,
        totalWords: totalWords || 0,
      });
    } catch (error) {
      console.error('Error fetching tier info:', error);
    }
  },

  // Fetch streak data only
  fetchStreakData: async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const [maxStreak, currentStreak, monthCount, totalFire, markedDates] = await Promise.all([
        learningStreakService.getMaxStreak(user.id),
        learningStreakService.getCurrentStreak(user.id),
        learningStreakService.getCurrentMonthCount(user.id),
        learningStreakService.getTotalFireCount(user.id),
        learningStreakService.getMarkedDates(user.id),
      ]);

      set({
        streakData: {
          currentStreak: currentStreak || 0,
          currentMonthCount: monthCount || 0,
          totalFireCount: totalFire || 0,
          maxStreak: maxStreak || 0,
          markedDates: markedDates || {},
        },
      });
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  },

  // Fetch leaderboard data
  fetchLeaderboardData: async (tier?: "Sage" | "Knight" | "Apprentice") => {
    const user = getCurrentUser();
    if (!user) return;

    const targetTier = tier || get().selectedTier;
    
    try {
      const leaderboard = await leaderboardService.getTierLeaderboard(targetTier, user.id);
      set({ leaderboardData: leaderboard });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      set({ leaderboardData: null });
    }
  },

  // Update nickname
  updateNickname: async (newNickname: string) => {
    const user = getCurrentUser();
    if (!user) return false;

    set({ nicknameLoading: true });
    
    try {
      const validation = nicknameService.validateNickname(newNickname);
      if (!validation.isValid) {
        set({ nicknameLoading: false });
        return false;
      }

      const success = await nicknameService.updateNickname(user.id, newNickname);
      
      if (success) {
        const formattedNickname = nicknameService.formatNicknameForDisplay(newNickname);
        set({ nickname: formattedNickname, nicknameLoading: false });
        return true;
      } else {
        set({ nicknameLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Error updating nickname:', error);
      set({ nicknameLoading: false });
      return false;
    }
  },

  // Set selected tier and fetch leaderboard
  setSelectedTier: (tier: "Sage" | "Knight" | "Apprentice") => {
    set({ selectedTier: tier });
    get().fetchLeaderboardData(tier);
  },

  // Optimistic update for memorized count
  optimisticUpdateMemorizedCount: (change: number) => {
    const { memorizedCount, tierInfo } = get();
    const newCount = Math.max(0, memorizedCount + change);
    
    set({ memorizedCount: newCount });
    
    // Update tier info optimistically
    if (tierInfo) {
      const updatedTierInfo = { ...tierInfo, memorizedCount: newCount };
      set({ tierInfo: updatedTierInfo });
    }
  },

  // Optimistic update for tier progression
  optimisticUpdateTier: () => {
    // This will be called after quiz completion to refresh tier info
    get().fetchTierInfo();
  },
}));