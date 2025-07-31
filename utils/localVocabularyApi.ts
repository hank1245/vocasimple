import AsyncStorage from '@react-native-async-storage/async-storage';
import { VocabularyWord } from "@/types/common";
import { VocabularyApiService } from "./vocabularyApi";
import { guestMemorizedService } from "./guestMemorizedService";

const VOCABULARY_STORAGE_KEY = 'vocabulary_words';

// Simple UUID generation function
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Function to get word list from local storage
const getStoredWords = async (): Promise<VocabularyWord[]> => {
  try {
    const stored = await AsyncStorage.getItem(VOCABULARY_STORAGE_KEY);
    if (!stored) return [];
    
    const words = JSON.parse(stored);
    // Data validation and cleanup
    return words.filter((word: any) => word && word.word && word.meaning).map((word: any) => ({
      ...word,
      id: String(word.id || generateId()), // Generate new ID if missing or not string
      word: String(word.word || ''),
      meaning: String(word.meaning || ''),
      group: String(word.group || 'Default'),
      example: String(word.example || ''),
      is_memorized: Boolean(word.is_memorized), // Ensure boolean type
    }));
  } catch (error) {
    console.error('Error getting stored words:', error);
    return [];
  }
};

// Function to save word list to local storage
const setStoredWords = async (words: VocabularyWord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(words));
  } catch (error) {
    console.error('Error storing words:', error);
    throw new Error('Failed to save words');
  }
};

export const localVocabularyApi: VocabularyApiService = {
  async fetchVocabulary(
    userId: string,
    filter?: "all" | "memorized" | "unmemorized"
  ): Promise<VocabularyWord[]> {
    const words = await getStoredWords();
    
    // For guest users, sync memorized status from guest service
    if (userId === 'guest_user') {
      const memorizedWordIds = await guestMemorizedService.getMemorizedWordIds();
      const memorizedSet = new Set(memorizedWordIds);
      
      // Update is_memorized status based on guest service
      words.forEach(word => {
        word.is_memorized = memorizedSet.has(word.id);
      });
    }
    
    // Apply filter
    let filteredWords = words;
    if (filter === "memorized") {
      filteredWords = words.filter(word => word.is_memorized === true);
    } else if (filter === "unmemorized") {
      filteredWords = words.filter(word => word.is_memorized === false);
    }
    
    // Sort by latest (since ID is timestamp-based)
    return filteredWords.sort((a, b) => {
      // Safely sort after ensuring IDs are strings
      const aId = String(a.id || '');
      const bId = String(b.id || '');
      return bId.localeCompare(aId);
    });
  },

  async createWord(
    word: Omit<VocabularyWord, "id" | "user_id">,
    userId: string
  ): Promise<VocabularyWord> {
    const words = await getStoredWords();
    const newWord: VocabularyWord = {
      ...word,
      id: generateId(),
      user_id: userId,
      is_memorized: false,
    };
    
    words.push(newWord);
    await setStoredWords(words);
    
    return newWord;
  },

  async updateWord(
    wordId: string,
    updates: Partial<VocabularyWord>,
    userId: string
  ): Promise<VocabularyWord> {
    const words = await getStoredWords();
    const wordIndex = words.findIndex(word => word.id === wordId);
    
    if (wordIndex === -1) {
      throw new Error('Word not found');
    }
    
    words[wordIndex] = { ...words[wordIndex], ...updates };
    await setStoredWords(words);
    
    return words[wordIndex];
  },

  async deleteWord(wordId: string, userId: string): Promise<void> {
    const words = await getStoredWords();
    const filteredWords = words.filter(word => word.id !== wordId);
    
    if (words.length === filteredWords.length) {
      throw new Error('Word to delete not found');
    }
    
    await setStoredWords(filteredWords);
  },

  async markWordsAsMemorized(wordIds: string[], userId: string): Promise<void> {
    if (!wordIds || wordIds.length === 0) return;
    
    // For guest users, use guest service to manage memorized status
    if (userId === 'guest_user') {
      const words = await getStoredWords();
      const wordsToMark = words
        .filter(word => wordIds.includes(word.id))
        .map(word => ({
          id: word.id,
          word: word.word,
          meaning: word.meaning
        }));
      
      await guestMemorizedService.markWordsAsMemorized(wordsToMark);
      return;
    }
    
    const words = await getStoredWords();
    const updatedWords = words.map(word => 
      wordIds.includes(word.id) ? { ...word, is_memorized: true } : word
    );
    
    await setStoredWords(updatedWords);
  },

  async markWordsAsUnmemorized(wordIds: string[], userId: string): Promise<void> {
    if (!wordIds || wordIds.length === 0) return;
    
    // For guest users, use guest service to manage memorized status
    if (userId === 'guest_user') {
      await guestMemorizedService.markWordsAsUnmemorized(wordIds);
      return;
    }
    
    const words = await getStoredWords();
    const updatedWords = words.map(word => 
      wordIds.includes(word.id) ? { ...word, is_memorized: false } : word
    );
    
    await setStoredWords(updatedWords);
  },
};

// Function to sync local data to server (used during signup)
export const syncLocalToServer = async (serverApi: VocabularyApiService, userId: string): Promise<void> => {
  try {
    const localWords = await getStoredWords();
    
    for (const word of localWords) {
      const { id, user_id, ...wordData } = word;
      await serverApi.createWord(wordData, userId);
    }
    
    // Remove local data after sync completion
    await AsyncStorage.removeItem(VOCABULARY_STORAGE_KEY);
  } catch (error) {
    console.error('Error syncing local data to server:', error);
    throw error;
  }
};

// Function to backup server data to local (used during logout)
export const backupServerToLocal = async (serverApi: VocabularyApiService, userId: string): Promise<void> => {
  try {
    const serverWords = await serverApi.fetchVocabulary(userId);
    await setStoredWords(serverWords);
  } catch (error) {
    console.error('Error backing up server data to local:', error);
    throw error;
  }
};