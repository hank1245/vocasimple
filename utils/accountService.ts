import { supabase } from "./supabase";

export const accountService = {
  // Delete user account and all associated data
  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: "사용자 정보를 확인할 수 없습니다." };
      }

      // Delete user's associated data first (profiles, vocabulary, learning_streaks)
      const userId = user.id;

      // Delete user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        // Continue with account deletion even if profile deletion fails
      }

      // Delete user's vocabulary
      const { error: vocabularyError } = await supabase
        .from("vocabulary")
        .delete()
        .eq("user_id", userId);

      if (vocabularyError) {
        console.error("Error deleting vocabulary:", vocabularyError);
        // Continue with account deletion even if vocabulary deletion fails
      }

      // Delete user's learning streaks (if table exists)
      const { error: streakError } = await supabase
        .from("learning_streaks")
        .delete()
        .eq("user_id", userId);

      if (streakError) {
        console.error("Error deleting learning streaks:", streakError);
        // Continue with account deletion even if streak deletion fails
      }

      // Finally, delete the user account from auth.users
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Error deleting user account:", deleteError);
        return { success: false, error: "계정 삭제 중 오류가 발생했습니다." };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      return { success: false, error: "계정 삭제 중 예상치 못한 오류가 발생했습니다." };
    }
  },

  // Alternative method using RPC function for more reliable deletion
  async deleteAccountWithRPC(): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: "사용자 정보를 확인할 수 없습니다." };
      }

      // Use RPC function to delete account (if available)
      const { error: rpcError } = await supabase.rpc('delete_user_account', {
        user_id: user.id
      });

      if (rpcError) {
        console.error("Error deleting account via RPC:", rpcError);
        // Fallback to manual deletion
        return await this.deleteAccount();
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteAccountWithRPC:", error);
      return { success: false, error: "계정 삭제 중 예상치 못한 오류가 발생했습니다." };
    }
  },

  // Sign out user (safer alternative to account deletion)
  async signOutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        return { success: false, error: "로그아웃 중 오류가 발생했습니다." };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in signOutUser:", error);
      return { success: false, error: "로그아웃 중 예상치 못한 오류가 발생했습니다." };
    }
  }
};