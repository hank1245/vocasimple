import { supabase } from "./supabase";

export interface UserProfile {
  user_id: string;
  nickname?: string;
  created_at?: string;
  updated_at?: string;
}

export const nicknameService = {
  // Get user's profile with nickname
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  },

  // Create initial user profile using database function
  async createUserProfile(userId: string, nickname?: string): Promise<UserProfile | null> {
    try {
      // Use database function to create profile (bypasses RLS issues)
      const { data, error } = await supabase
        .rpc('create_user_profile', {
          p_user_id: userId,
          p_nickname: nickname || null
        });

      if (error) {
        console.error("Error creating user profile via function:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createUserProfile:", error);
      return null;
    }
  },

  // Get user's nickname (with fallback to default)
  async getUserNickname(userId: string): Promise<string> {
    try {
      let profile = await this.getUserProfile(userId);
      
      // Create profile if it doesn't exist
      if (!profile) {
        profile = await this.createUserProfile(userId);
        if (!profile) {
          return this.generateDefaultNickname(userId);
        }
      }

      // Return nickname or generate default if empty
      return profile.nickname || this.generateDefaultNickname(userId);
    } catch (error) {
      console.error("Error in getUserNickname:", error);
      return this.generateDefaultNickname(userId);
    }
  },

  // Update user's nickname
  async updateNickname(userId: string, newNickname: string): Promise<boolean> {
    try {
      // Validate nickname
      const validation = this.validateNickname(newNickname);
      if (!validation.isValid) {
        console.error("Nickname validation failed:", validation.error);
        return false;
      }

      // Check if profile exists
      let profile = await this.getUserProfile(userId);
      
      if (!profile) {
        // Create new profile with nickname
        profile = await this.createUserProfile(userId, newNickname);
        return profile !== null;
      } else {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            nickname: newNickname,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating nickname:", error);
          return false;
        }

        return true;
      }
    } catch (error) {
      console.error("Error in updateNickname:", error);
      return false;
    }
  },

  // Generate default nickname from user ID
  generateDefaultNickname(userId: string): string {
    // Take first 8 characters of user ID
    const shortId = userId.substring(0, 8);
    return `#${shortId}`;
  },

  // Validate nickname
  validateNickname(nickname: string): { isValid: boolean; error?: string } {
    // Remove # if present for validation
    const cleanNickname = nickname.startsWith('#') ? nickname.substring(1) : nickname;
    
    // Check length (3-20 characters)
    if (cleanNickname.length < 3) {
      return { isValid: false, error: "닉네임은 최소 3글자 이상이어야 합니다." };
    }
    if (cleanNickname.length > 20) {
      return { isValid: false, error: "닉네임은 최대 20글자까지 가능합니다." };
    }

    // Check allowed characters (letters, numbers, Korean characters)
    const allowedPattern = /^[a-zA-Z0-9가-힣_]+$/;
    if (!allowedPattern.test(cleanNickname)) {
      return { isValid: false, error: "닉네임은 영문, 숫자, 한글, 밑줄(_)만 사용 가능합니다." };
    }

    return { isValid: true };
  },

  // Check if nickname is unique (optional feature)
  async isNicknameUnique(nickname: string, currentUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("nickname", nickname)
        .neq("user_id", currentUserId);

      if (error) {
        console.error("Error checking nickname uniqueness:", error);
        return true; // Allow if we can't check
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error("Error in isNicknameUnique:", error);
      return true; // Allow if we can't check
    }
  },

  // Format nickname for display (ensure it starts with #)
  formatNicknameForDisplay(nickname: string): string {
    if (!nickname) return "";
    return nickname.startsWith('#') ? nickname : `#${nickname}`;
  },
};