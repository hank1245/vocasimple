import { supabase } from "./supabase";

export interface TierInfo {
  currentTier: string;
  memorizedCount: number;
  nextTier: string;
  nextTierRequirement: number;
  progressPercentage: number;
}

export interface UserProfile {
  user_id: string;
  tier: string;
  memorized_count: number;
  nickname?: string;
  created_at?: string;
  updated_at?: string;
}

export const memorizedService = {
  // Mark a word as memorized
  async markWordAsMemorized(userId: string, wordId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({ 
          is_memorized: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('id', wordId);

      if (error) {
        console.error("Error marking word as memorized:", error);
        return false;
      }

      // Update user's tier after marking word
      await this.updateUserTier(userId);
      return true;
    } catch (error) {
      console.error("Error in markWordAsMemorized:", error);
      return false;
    }
  },

  // Mark multiple words as memorized (for quiz completion)
  async markWordsAsMemorized(userId: string, wordIds: string[]): Promise<boolean> {
    try {
      if (!wordIds || wordIds.length === 0) {
        return true;
      }

      // Update all words in a single transaction
      const { error } = await supabase
        .from('vocabulary')
        .update({ 
          is_memorized: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .in('id', wordIds);

      if (error) {
        console.error("Error marking words as memorized:", error);
        return false;
      }

      // Update user's tier after marking words
      await this.updateUserTier(userId);

      return true;
    } catch (error) {
      console.error("Error in markWordsAsMemorized:", error);
      return false;
    }
  },

  // Update user's tier based on memorized count
  async updateUserTier(userId: string): Promise<string | null> {
    try {
      const memorizedCount = await this.getMemorizedWordsCount(userId);
      
      let tier: string;
      if (memorizedCount >= 1000) {
        tier = 'Sage';
      } else if (memorizedCount >= 500) {
        tier = 'Knight';
      } else {
        tier = 'Apprentice';
      }

      await this.updateUserProfile(userId, tier, memorizedCount);
      return tier;
    } catch (error) {
      console.error("Error in updateUserTier:", error);
      return null;
    }
  },

  // Update user profile with tier and memorized count
  async updateUserProfile(userId: string, tier: string, memorizedCount: number): Promise<boolean> {
    try {
      // First, try to update existing profile
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          tier,
          memorized_count: memorizedCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error("Error updating profile:", updateError);
        // If update fails, try to insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            tier,
            memorized_count: memorizedCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error inserting profile:", insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return false;
    }
  },

  // Get user's tier information
  async getUserTierInfo(userId: string): Promise<TierInfo | null> {
    try {
      // Get current memorized count directly from vocabulary table
      const memorizedCount = await this.getMemorizedWordsCount(userId);
      
      // Calculate tier based on count
      let currentTier: string;
      let nextTier: string;
      let nextTierRequirement: number;
      let progressPercentage: number;

      if (memorizedCount >= 1000) {
        currentTier = 'Sage';
        nextTier = 'Max';
        nextTierRequirement = 1000;
        progressPercentage = 100;
      } else if (memorizedCount >= 500) {
        currentTier = 'Knight';
        nextTier = 'Sage';
        nextTierRequirement = 1000;
        progressPercentage = Math.round(((memorizedCount - 500) / 500) * 100);
      } else {
        currentTier = 'Apprentice';
        nextTier = 'Knight';
        nextTierRequirement = 500;
        progressPercentage = Math.round((memorizedCount / 500) * 100);
      }

      // Update user profile with current tier and count
      await this.updateUserProfile(userId, currentTier, memorizedCount);

      return {
        currentTier,
        memorizedCount,
        nextTier,
        nextTierRequirement,
        progressPercentage
      };
    } catch (error) {
      console.error("Error in getUserTierInfo:", error);
      return null;
    }
  },

  // Get user's profile with tier information
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error getting user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  },

  // Get memorized words count for a user
  async getMemorizedWordsCount(userId: string): Promise<number> {
    try {
      // First check if is_memorized column exists
      const { data: testData, error: testError } = await supabase
        .from('vocabulary')
        .select('is_memorized')
        .eq('user_id', userId)
        .limit(1);

      if (testError) {
        console.log("is_memorized column doesn't exist yet, returning 0");
        return 0;
      }

      const { count, error } = await supabase
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_memorized', true);

      if (error) {
        console.error("Error getting memorized words count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getMemorizedWordsCount:", error);
      return 0;
    }
  },

  // Get total words count for a user
  async getTotalWordsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error("Error getting total words count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getTotalWordsCount:", error);
      return 0;
    }
  },

  // Get tier requirements and descriptions
  getTierRequirements(): { [key: string]: { min: number; max: number; description: string } } {
    return {
      'Apprentice': {
        min: 0,
        max: 499,
        description: '단어 학습을 시작하는 단계'
      },
      'Knight': {
        min: 500,
        max: 999,
        description: '꾸준히 학습하며 실력을 쌓는 단계'
      },
      'Sage': {
        min: 1000,
        max: Infinity,
        description: '많은 단어를 암기한 현자 단계'
      }
    };
  },

  // Get tier icon/image name
  getTierIcon(tier: string): string {
    switch (tier) {
      case 'Sage':
        return 'sage.png';
      case 'Knight':
        return 'knight.png';
      case 'Apprentice':
      default:
        return 'apprentice.png';
    }
  },

  // Calculate progress to next tier
  calculateTierProgress(currentCount: number, currentTier: string): {
    progress: number;
    nextTier: string;
    nextTierRequirement: number;
    remainingWords: number;
  } {
    if (currentCount >= 1000) {
      return {
        progress: 100,
        nextTier: 'Max',
        nextTierRequirement: 1000,
        remainingWords: 0
      };
    } else if (currentCount >= 500) {
      return {
        progress: Math.round(((currentCount - 500) / 500) * 100),
        nextTier: 'Sage',
        nextTierRequirement: 1000,
        remainingWords: 1000 - currentCount
      };
    } else {
      return {
        progress: Math.round((currentCount / 500) * 100),
        nextTier: 'Knight',
        nextTierRequirement: 500,
        remainingWords: 500 - currentCount
      };
    }
  }
};