import { supabase } from "./supabase";
import { VocabularyWord } from "@/types/common";

export interface VocabularyApiService {
  fetchVocabulary: (
    userId: string,
    filter?: "all" | "memorized" | "unmemorized"
  ) => Promise<VocabularyWord[]>;
  createWord: (
    word: Omit<VocabularyWord, "id" | "user_id">,
    userId: string
  ) => Promise<VocabularyWord>;
  updateWord: (
    wordId: string,
    updates: Partial<VocabularyWord>,
    userId: string
  ) => Promise<VocabularyWord>;
  deleteWord: (wordId: string, userId: string) => Promise<void>;
  markWordsAsMemorized: (wordIds: string[], userId: string) => Promise<void>;
  markWordsAsUnmemorized: (wordIds: string[], userId: string) => Promise<void>;
}

export const vocabularyApi: VocabularyApiService = {
  async fetchVocabulary(
    userId: string,
    filter?: "all" | "memorized" | "unmemorized"
  ): Promise<VocabularyWord[]> {
    let query = supabase
      .from("vocabulary")
      .select("id, word, meaning, group, example, is_memorized")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Apply filter if specified
    if (filter === "memorized") {
      query = query.eq("is_memorized", true);
    } else if (filter === "unmemorized") {
      query = query.eq("is_memorized", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching vocabulary:", error);
      throw new Error(`단어 목록을 불러오는데 실패했습니다: ${error.message}`);
    }

    return data || [];
  },

  async createWord(
    word: Omit<VocabularyWord, "id" | "user_id">,
    userId: string
  ): Promise<VocabularyWord> {
    const { data, error } = await supabase
      .from("vocabulary")
      .insert({
        ...word,
        user_id: userId,
        is_memorized: false,
      })
      .select("id, word, meaning, group, example, is_memorized")
      .single();

    if (error) {
      console.error("Error creating word:", error);
      throw new Error(`단어 추가에 실패했습니다: ${error.message}`);
    }

    return data;
  },

  async updateWord(
    wordId: string,
    updates: Partial<VocabularyWord>,
    userId: string
  ): Promise<VocabularyWord> {
    const { data, error } = await supabase
      .from("vocabulary")
      .update(updates)
      .eq("id", wordId)
      .eq("user_id", userId)
      .select("id, word, meaning, group, example, is_memorized")
      .single();

    if (error) {
      console.error("Error updating word:", error);
      throw new Error(`단어 수정에 실패했습니다: ${error.message}`);
    }

    return data;
  },

  async deleteWord(wordId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("vocabulary")
      .delete()
      .eq("id", wordId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting word:", error);
      throw new Error(`단어 삭제에 실패했습니다: ${error.message}`);
    }
  },

  async markWordsAsMemorized(wordIds: string[], userId: string): Promise<void> {
    if (!wordIds || wordIds.length === 0) return;

    const { error } = await supabase
      .from("vocabulary")
      .update({ is_memorized: true })
      .eq("user_id", userId)
      .in("id", wordIds);

    if (error) {
      console.error("Error marking words as memorized:", error);
      throw new Error(`단어 암기 처리에 실패했습니다: ${error.message}`);
    }
  },

  async markWordsAsUnmemorized(
    wordIds: string[],
    userId: string
  ): Promise<void> {
    if (!wordIds || wordIds.length === 0) return;

    const { error } = await supabase
      .from("vocabulary")
      .update({ is_memorized: false })
      .eq("user_id", userId)
      .in("id", wordIds);

    if (error) {
      console.error("Error marking words as unmemorized:", error);
      throw new Error(`단어 미암기 처리에 실패했습니다: ${error.message}`);
    }
  },
};
