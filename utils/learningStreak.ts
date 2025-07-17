import { supabase } from "./supabase";

export interface LearningStreak {
  id?: number;
  user_id: string;
  completion_dates: string[];
  created_at?: string;
  updated_at?: string;
}

export const learningStreakService = {
  // Get user's learning streak data
  async getUserStreak(userId: string): Promise<LearningStreak | null> {
    try {
      const { data, error } = await supabase
        .from("learning_streaks")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no records gracefully

      if (error) {
        console.error("Error fetching learning streak:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserStreak:", error);
      return null;
    }
  },

  // Create initial streak record for user
  async createUserStreak(userId: string): Promise<LearningStreak | null> {
    try {
      const { data, error } = await supabase
        .from("learning_streaks")
        .insert({
          user_id: userId,
          completion_dates: [],
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating learning streak:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createUserStreak:", error);
      return null;
    }
  },

  // Add today's date to completion dates if not already added
  async addTodayCompletion(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Get current streak data
      let streakData = await this.getUserStreak(userId);
      
      // Create streak record if doesn't exist
      if (!streakData) {
        streakData = await this.createUserStreak(userId);
        if (!streakData) return false;
      }

      // Check if today is already completed
      if (streakData.completion_dates.includes(today)) {
        return true; // Already completed today
      }

      // Add today's date
      const updatedDates = [...streakData.completion_dates, today];

      const { error } = await supabase
        .from("learning_streaks")
        .update({
          completion_dates: updatedDates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating learning streak:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in addTodayCompletion:", error);
      return false;
    }
  },

  // Check if user has completed learning today
  async hasCompletedToday(userId: string): Promise<boolean> {
    try {
      const streakData = await this.getUserStreak(userId);
      if (!streakData || !streakData.completion_dates) return false;

      const today = new Date().toISOString().split("T")[0];
      return streakData.completion_dates.includes(today);
    } catch (error) {
      console.error("Error in hasCompletedToday:", error);
      return false;
    }
  },

  // Get current month's completion count
  async getCurrentMonthCount(userId: string): Promise<number> {
    try {
      const streakData = await this.getUserStreak(userId);
      if (!streakData || !streakData.completion_dates) return 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const currentMonthDates = streakData.completion_dates.filter(dateStr => {
        try {
          const date = new Date(dateStr);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        } catch (dateError) {
          console.error("Error parsing date:", dateStr, dateError);
          return false;
        }
      });

      return currentMonthDates.length;
    } catch (error) {
      console.error("Error in getCurrentMonthCount:", error);
      return 0;
    }
  },

  // Get total days in current month
  getCurrentMonthTotalDays(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return new Date(year, month + 1, 0).getDate();
  },

  // Get marked dates for calendar display
  async getMarkedDates(userId: string): Promise<Record<string, any>> {
    try {
      const streakData = await this.getUserStreak(userId);
      if (!streakData || !streakData.completion_dates) return {};

      const markedDates: Record<string, any> = {};
      
      streakData.completion_dates.forEach(dateStr => {
        try {
          // Validate date format before adding to marked dates
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            markedDates[dateStr] = {
              customStyles: {
                container: {
                  backgroundColor: "#FF7474",
                },
                text: {
                  color: "white",
                  fontWeight: "bold",
                },
              },
            };
          }
        } catch (dateError) {
          console.error("Error processing date for marking:", dateStr, dateError);
        }
      });

      return markedDates;
    } catch (error) {
      console.error("Error in getMarkedDates:", error);
      return {};
    }
  },

  // Get current streak count (consecutive days)
  async getCurrentStreak(userId: string): Promise<number> {
    try {
      const streakData = await this.getUserStreak(userId);
      if (!streakData || !streakData.completion_dates || streakData.completion_dates.length === 0) return 0;

      const sortedDates = streakData.completion_dates
        .map(dateStr => {
          try {
            return new Date(dateStr);
          } catch (dateError) {
            console.error("Error parsing date in getCurrentStreak:", dateStr, dateError);
            return null;
          }
        })
        .filter((date): date is Date => date !== null && !isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        currentDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (currentDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }

      return currentStreak;
    } catch (error) {
      console.error("Error in getCurrentStreak:", error);
      return 0;
    }
  },

  // Get maximum streak count
  async getMaxStreak(userId: string): Promise<number> {
    try {
      const streakData = await this.getUserStreak(userId);
      if (!streakData || !streakData.completion_dates || streakData.completion_dates.length === 0) return 0;

      const sortedDates = streakData.completion_dates
        .map(dateStr => {
          try {
            return new Date(dateStr);
          } catch (dateError) {
            console.error("Error parsing date in getMaxStreak:", dateStr, dateError);
            return null;
          }
        })
        .filter((date): date is Date => date !== null && !isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (sortedDates.length === 0) return 0;

      let maxStreak = 0;
      let currentStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }

      return Math.max(maxStreak, currentStreak);
    } catch (error) {
      console.error("Error in getMaxStreak:", error);
      return 0;
    }
  },

  // Get total fire count
  async getTotalFireCount(userId: string): Promise<number> {
    try {
      const streakData = await this.getUserStreak(userId);
      if (!streakData || !streakData.completion_dates) return 0;
      return streakData.completion_dates.length;
    } catch (error) {
      console.error("Error in getTotalFireCount:", error);
      return 0;
    }
  },
};