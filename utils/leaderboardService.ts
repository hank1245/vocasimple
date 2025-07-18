import { supabase } from "./supabase";

export interface LeaderboardUser {
  user_id: string;
  nickname: string;
  tier: string;
  memorized_count: number;
  rank: number;
  is_current_user?: boolean;
}

export interface TierLeaderboard {
  tier: string;
  users: LeaderboardUser[];
  totalUsers: number;
  currentUserRank?: number;
}

export const leaderboardService = {
  // Get leaderboard for a specific tier
  async getTierLeaderboard(tier: string, currentUserId: string): Promise<TierLeaderboard | null> {
    try {
      // Get all users in the specified tier, ordered by memorized_count
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, nickname, tier, memorized_count')
        .eq('tier', tier)
        .order('memorized_count', { ascending: false });

      if (error) {
        console.error(`Error fetching ${tier} leaderboard:`, error);
        return null;
      }

      if (!data || data.length === 0) {
        return {
          tier,
          users: [],
          totalUsers: 0,
          currentUserRank: undefined
        };
      }

      // Add ranks and mark current user
      const usersWithRank: LeaderboardUser[] = data.map((user, index) => ({
        ...user,
        rank: index + 1,
        is_current_user: user.user_id === currentUserId,
        nickname: user.nickname || `#${user.user_id.substring(0, 8)}` // Fallback nickname
      }));

      // Find current user's rank
      const currentUserRank = usersWithRank.find(user => user.is_current_user)?.rank;

      return {
        tier,
        users: usersWithRank,
        totalUsers: data.length,
        currentUserRank
      };
    } catch (error) {
      console.error(`Error in getTierLeaderboard for ${tier}:`, error);
      return null;
    }
  },

  // Get top users for a specific tier (limit results)
  async getTopUsersInTier(tier: string, limit: number = 10): Promise<LeaderboardUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, nickname, tier, memorized_count')
        .eq('tier', tier)
        .order('memorized_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error(`Error fetching top users in ${tier}:`, error);
        return [];
      }

      return (data || []).map((user, index) => ({
        ...user,
        rank: index + 1,
        nickname: user.nickname || `#${user.user_id.substring(0, 8)}`
      }));
    } catch (error) {
      console.error(`Error in getTopUsersInTier for ${tier}:`, error);
      return [];
    }
  },

  // Get current user's position in their tier
  async getCurrentUserRankInTier(userId: string): Promise<{
    tier: string;
    rank: number;
    totalUsers: number;
    memorizedCount: number;
  } | null> {
    try {
      // First, get user's current tier and memorized count
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('tier, memorized_count')
        .eq('user_id', userId)
        .single();

      if (userError || !userProfile) {
        console.error('Error fetching user profile:', userError);
        return null;
      }

      // Get all users in the same tier with higher or equal memorized count
      const { data: higherUsers, error: higherError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('tier', userProfile.tier)
        .gte('memorized_count', userProfile.memorized_count);

      if (higherError) {
        console.error('Error fetching higher users:', higherError);
        return null;
      }

      // Get total users in tier
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tier', userProfile.tier);

      if (countError) {
        console.error('Error counting total users:', countError);
        return null;
      }

      // Calculate rank (users with higher scores + 1)
      const usersWithHigherScores = (higherUsers || []).length - 1; // Subtract 1 for current user
      const rank = usersWithHigherScores + 1;

      return {
        tier: userProfile.tier,
        rank,
        totalUsers: totalUsers || 0,
        memorizedCount: userProfile.memorized_count
      };
    } catch (error) {
      console.error('Error in getCurrentUserRankInTier:', error);
      return null;
    }
  },

  // Get leaderboard for all tiers
  async getAllTierLeaderboards(currentUserId: string): Promise<{
    sage: TierLeaderboard | null;
    knight: TierLeaderboard | null;
    apprentice: TierLeaderboard | null;
  }> {
    try {
      const [sage, knight, apprentice] = await Promise.all([
        this.getTierLeaderboard('Sage', currentUserId),
        this.getTierLeaderboard('Knight', currentUserId),
        this.getTierLeaderboard('Apprentice', currentUserId)
      ]);

      return { sage, knight, apprentice };
    } catch (error) {
      console.error('Error in getAllTierLeaderboards:', error);
      return {
        sage: null,
        knight: null,
        apprentice: null
      };
    }
  },

  // Get tier statistics
  async getTierStatistics(): Promise<{
    sage: number;
    knight: number;
    apprentice: number;
    total: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tier')
        .not('tier', 'is', null);

      if (error) {
        console.error('Error fetching tier statistics:', error);
        return { sage: 0, knight: 0, apprentice: 0, total: 0 };
      }

      const stats = (data || []).reduce((acc, user) => {
        const tier = user.tier?.toLowerCase();
        if (tier === 'sage') acc.sage++;
        else if (tier === 'knight') acc.knight++;
        else if (tier === 'apprentice') acc.apprentice++;
        return acc;
      }, { sage: 0, knight: 0, apprentice: 0 });

      return {
        ...stats,
        total: stats.sage + stats.knight + stats.apprentice
      };
    } catch (error) {
      console.error('Error in getTierStatistics:', error);
      return { sage: 0, knight: 0, apprentice: 0, total: 0 };
    }
  }
};