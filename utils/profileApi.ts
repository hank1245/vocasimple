import { nicknameService } from "./nicknameService";
import { memorizedService } from "./memorizedService";
import { learningStreakService } from "./learningStreak";

export interface ProfileData {
  nickname: string;
  tierInfo: {
    currentTier: string;
    memorizedCount: number;
    nextTier: string;
    nextTierRequirement: number;
    progressPercentage: number;
  };
  memorizedCount: number;
  totalWords: number;
  streakData: {
    currentStreak: number;
    currentMonthCount: number;
    totalFireCount: number;
    maxStreak: number;
    markedDates: Record<string, any>;
  };
}

export const profileApi = {
  // Fetch all profile data in minimal API calls
  async fetchAllProfileData(userId: string): Promise<ProfileData> {
    try {
      // Parallel fetch of all data with optimized queries
      const [
        nickname,
        tierInfo,
        memorizedCount,
        totalWords,
        maxStreak,
        currentStreak,
        monthCount,
        totalFire,
        markedDates,
      ] = await Promise.all([
        nicknameService
          .getUserNickname(userId)
          .catch(() => nicknameService.generateDefaultNickname(userId)),
        memorizedService.getUserTierInfo(userId).catch(() => null),
        memorizedService.getMemorizedWordsCount(userId).catch(() => 0),
        memorizedService.getTotalWordsCount(userId).catch(() => 0),
        learningStreakService.getMaxStreak(userId).catch(() => 0),
        learningStreakService.getCurrentStreak(userId).catch(() => 0),
        learningStreakService.getCurrentMonthCount(userId).catch(() => 0),
        learningStreakService.getTotalFireCount(userId).catch(() => 0),
        learningStreakService.getMarkedDates(userId).catch(() => ({})),
      ]);

      return {
        nickname,
        tierInfo: tierInfo || {
          currentTier: "Apprentice",
          memorizedCount,
          nextTier: "Knight",
          nextTierRequirement: 500,
          progressPercentage: 0,
        },
        memorizedCount,
        totalWords,
        streakData: {
          currentStreak,
          currentMonthCount: monthCount,
          totalFireCount: totalFire,
          maxStreak,
          markedDates,
        },
      };
    } catch (error) {
      console.error("Error fetching profile data:", error);
      throw error;
    }
  },

  // Fetch only essential data (lighter version)
  async fetchEssentialProfileData(
    userId: string
  ): Promise<Partial<ProfileData>> {
    try {
      const [nickname, memorizedCount, currentStreak] = await Promise.all([
        nicknameService
          .getUserNickname(userId)
          .catch(() => nicknameService.generateDefaultNickname(userId)),
        memorizedService.getMemorizedWordsCount(userId).catch(() => 0),
        learningStreakService.getCurrentStreak(userId).catch(() => 0),
      ]);

      return {
        nickname,
        memorizedCount,
        streakData: {
          currentStreak,
          currentMonthCount: 0,
          totalFireCount: 0,
          maxStreak: 0,
          markedDates: {},
        },
      };
    } catch (error) {
      console.error("Error fetching essential profile data:", error);
      throw error;
    }
  },
};
