import { supabase } from "./supabase";

export interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  created_at: string;
}

export const exportService = {
  // Get all vocabulary for a user
  async getUserVocabulary(userId: string): Promise<VocabularyItem[]> {
    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vocabulary:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserVocabulary:", error);
      return [];
    }
  },

  // Convert vocabulary data to CSV format
  convertToCSV(vocabularyData: VocabularyItem[]): string {
    if (!vocabularyData || vocabularyData.length === 0) {
      return "Word,Meaning,Example,Registration Date\n";
    }

    // CSV header
    const header = "Word,Meaning,Example,Registration Date\n";
    
    // Convert each vocabulary item to CSV row
    const rows = vocabularyData.map(item => {
      const word = this.escapeCSVField(item.word);
      const meaning = this.escapeCSVField(item.meaning);
      const example = this.escapeCSVField(item.example || "");
      const createdAt = this.escapeCSVField(
        new Date(item.created_at).toLocaleDateString("ko-KR")
      );
      
      return `${word},${meaning},${example},${createdAt}`;
    }).join("\n");

    return header + rows;
  },

  // Escape CSV fields (handle commas, quotes, line breaks)
  escapeCSVField(field: string): string {
    if (!field) return "";
    
    // If field contains comma, quote, or line break, wrap in quotes and escape quotes
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  },

  // Share CSV file using React Native Expo Sharing
  async sendVocabularyEmail(
    userEmail: string,
    csvData: string,
    vocabularyCount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Import required modules
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      
      const fileName = `vocabulary_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Create temporary file for sharing
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write CSV data to file
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        // Clean up file if sharing is not available
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        return {
          success: false,
          error: "File sharing feature is not available."
        };
      }

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Share Word List (${vocabularyCount} words)`,
      });

      // Clean up temporary file after sharing
      await FileSystem.deleteAsync(fileUri, { idempotent: true });

      return { success: true };
    } catch (error) {
      console.error("Error in sendVocabularyEmail:", error);
      return { 
        success: false, 
        error: "An unexpected error occurred while sharing the file." 
      };
    }
  },

  // Main export function
  async exportVocabularyToEmail(userId: string, userEmail: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      // Get user's vocabulary
      const vocabulary = await this.getUserVocabulary(userId);
      
      if (vocabulary.length === 0) {
        return {
          success: false,
          error: "No saved words found."
        };
      }

      // Convert to CSV
      const csvData = this.convertToCSV(vocabulary);

      // Send email
      const emailResult = await this.sendVocabularyEmail(
        userEmail,
        csvData,
        vocabulary.length
      );

      if (emailResult.success) {
        return {
          success: true,
          message: `${vocabulary.length} words have been successfully shared.`
        };
      } else {
        return {
          success: false,
          error: emailResult.error
        };
      }
    } catch (error) {
      console.error("Error in exportVocabularyToEmail:", error);
      return {
        success: false,
        error: "An error occurred while exporting words."
      };
    }
  },

  // Generate preview of CSV data (for testing)
  generateCSVPreview(vocabularyData: VocabularyItem[]): string {
    const previewData = vocabularyData.slice(0, 5); // Show first 5 items
    return this.convertToCSV(previewData);
  }
};