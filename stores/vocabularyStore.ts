import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { getCurrentUser } from './authStore';
import { VocabularyWord } from '@/types/common';
import { memorizedService } from '@/utils/memorizedService';

interface VocabularyState {
  // Data
  vocabularyList: VocabularyWord[];
  filteredList: VocabularyWord[];
  
  // Filters
  currentFilter: "all" | "memorized" | "unmemorized";
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  
  // Cache management
  lastFetch: number;
  cacheExpiry: number;
  
  // Actions
  fetchVocabulary: (forceRefresh?: boolean) => Promise<void>;
  addWord: (word: Omit<VocabularyWord, 'id' | 'user_id'>) => Promise<boolean>;
  updateWord: (wordId: string, updates: Partial<VocabularyWord>) => Promise<boolean>;
  deleteWord: (wordId: string) => Promise<boolean>;
  
  // Filtering
  setFilter: (filter: "all" | "memorized" | "unmemorized") => void;
  applyFilter: () => void;
  
  // Memorization
  markWordsAsMemorized: (wordIds: string[]) => Promise<boolean>;
  markWordsAsUnmemorized: (wordIds: string[]) => Promise<boolean>;
  
  // Optimistic updates
  optimisticUpdateMemorization: (wordId: string, isMemorized: boolean) => void;
  optimisticAddWord: (word: VocabularyWord) => void;
  optimisticUpdateWord: (wordId: string, updates: Partial<VocabularyWord>) => void;
  optimisticDeleteWord: (wordId: string) => void;
  
  // Utilities
  shouldRefetch: () => boolean;
  clearCache: () => void;
  getWordById: (wordId: string) => VocabularyWord | undefined;
  getFilteredVocabulary: (filter?: "all" | "memorized" | "unmemorized") => VocabularyWord[];
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  // Initial state
  vocabularyList: [],
  filteredList: [],
  currentFilter: "all",
  loading: false,
  refreshing: false,
  lastFetch: 0,
  cacheExpiry: 3 * 60 * 1000, // 3 minutes

  // Check if data should be refetched
  shouldRefetch: () => {
    const { lastFetch, cacheExpiry } = get();
    return Date.now() - lastFetch > cacheExpiry;
  },

  // Clear cache
  clearCache: () => {
    set({ lastFetch: 0 });
  },

  // Fetch vocabulary from API
  fetchVocabulary: async (forceRefresh = false) => {
    const user = getCurrentUser();
    if (!user) return;

    const { shouldRefetch, vocabularyList, loading } = get();
    
    // Skip if not needed and not forcing refresh
    if (!forceRefresh && !shouldRefetch() && vocabularyList.length > 0) {
      console.log('Using cached vocabulary data');
      return;
    }

    // Prevent duplicate requests
    if (loading) return;

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .select("id, word, meaning, group, example, is_memorized")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vocabulary:", error);
        set({ loading: false });
        return;
      }

      const vocabularyData = data || [];
      
      set({
        vocabularyList: vocabularyData,
        lastFetch: Date.now(),
        loading: false,
      });

      // Apply current filter
      get().applyFilter();

    } catch (error) {
      console.error("Error in fetchVocabulary:", error);
      set({ loading: false });
    }
  },

  // Add new word
  addWord: async (word: Omit<VocabularyWord, 'id' | 'user_id'>) => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .insert({
          ...word,
          user_id: user.id,
          is_memorized: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding word:", error);
        return false;
      }

      if (data) {
        get().optimisticAddWord(data);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in addWord:", error);
      return false;
    }
  },

  // Update word
  updateWord: async (wordId: string, updates: Partial<VocabularyWord>) => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("vocabulary")
        .update(updates)
        .eq("id", wordId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating word:", error);
        return false;
      }

      get().optimisticUpdateWord(wordId, updates);
      return true;
    } catch (error) {
      console.error("Error in updateWord:", error);
      return false;
    }
  },

  // Delete word
  deleteWord: async (wordId: string) => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("vocabulary")
        .delete()
        .eq("id", wordId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting word:", error);
        return false;
      }

      get().optimisticDeleteWord(wordId);
      return true;
    } catch (error) {
      console.error("Error in deleteWord:", error);
      return false;
    }
  },

  // Set filter and apply it
  setFilter: (filter: "all" | "memorized" | "unmemorized") => {
    set({ currentFilter: filter });
    get().applyFilter();
  },

  // Apply current filter to vocabulary list
  applyFilter: () => {
    const { vocabularyList, currentFilter } = get();
    
    let filtered = vocabularyList;
    
    switch (currentFilter) {
      case "memorized":
        filtered = vocabularyList.filter(word => word.is_memorized === true);
        break;
      case "unmemorized":
        filtered = vocabularyList.filter(word => word.is_memorized !== true);
        break;
      case "all":
      default:
        filtered = vocabularyList;
        break;
    }

    set({ filteredList: filtered });
  },

  // Mark words as memorized
  markWordsAsMemorized: async (wordIds: string[]) => {
    const user = getCurrentUser();
    if (!user || wordIds.length === 0) return false;

    try {
      // Optimistic update
      wordIds.forEach(wordId => {
        get().optimisticUpdateMemorization(wordId, true);
      });

      const success = await memorizedService.markWordsAsMemorized(user.id, wordIds);
      
      if (!success) {
        // Revert optimistic update on failure
        wordIds.forEach(wordId => {
          get().optimisticUpdateMemorization(wordId, false);
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in markWordsAsMemorized:", error);
      // Revert optimistic update on error
      wordIds.forEach(wordId => {
        get().optimisticUpdateMemorization(wordId, false);
      });
      return false;
    }
  },

  // Mark words as unmemorized
  markWordsAsUnmemorized: async (wordIds: string[]) => {
    const user = getCurrentUser();
    if (!user || wordIds.length === 0) return false;

    try {
      // Optimistic update
      wordIds.forEach(wordId => {
        get().optimisticUpdateMemorization(wordId, false);
      });

      const success = await memorizedService.markWordsAsUnmemorized(user.id, wordIds);
      
      if (!success) {
        // Revert optimistic update on failure
        wordIds.forEach(wordId => {
          get().optimisticUpdateMemorization(wordId, true);
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in markWordsAsUnmemorized:", error);
      // Revert optimistic update on error
      wordIds.forEach(wordId => {
        get().optimisticUpdateMemorization(wordId, true);
      });
      return false;
    }
  },

  // Optimistic update for memorization status
  optimisticUpdateMemorization: (wordId: string, isMemorized: boolean) => {
    const { vocabularyList } = get();
    
    const updatedList = vocabularyList.map(word => 
      word.id === wordId ? { ...word, is_memorized: isMemorized } : word
    );

    set({ vocabularyList: updatedList });
    get().applyFilter();
  },

  // Optimistic add word
  optimisticAddWord: (word: VocabularyWord) => {
    const { vocabularyList } = get();
    set({ vocabularyList: [word, ...vocabularyList] });
    get().applyFilter();
  },

  // Optimistic update word
  optimisticUpdateWord: (wordId: string, updates: Partial<VocabularyWord>) => {
    const { vocabularyList } = get();
    
    const updatedList = vocabularyList.map(word => 
      word.id === wordId ? { ...word, ...updates } : word
    );

    set({ vocabularyList: updatedList });
    get().applyFilter();
  },

  // Optimistic delete word
  optimisticDeleteWord: (wordId: string) => {
    const { vocabularyList } = get();
    const updatedList = vocabularyList.filter(word => word.id !== wordId);
    set({ vocabularyList: updatedList });
    get().applyFilter();
  },

  // Get word by ID
  getWordById: (wordId: string) => {
    const { vocabularyList } = get();
    return vocabularyList.find(word => word.id === wordId);
  },

  // Get filtered vocabulary
  getFilteredVocabulary: (filter?: "all" | "memorized" | "unmemorized") => {
    const { vocabularyList } = get();
    
    if (!filter) return vocabularyList;
    
    switch (filter) {
      case "memorized":
        return vocabularyList.filter(word => word.is_memorized === true);
      case "unmemorized":
        return vocabularyList.filter(word => word.is_memorized !== true);
      case "all":
      default:
        return vocabularyList;
    }
  },
}));