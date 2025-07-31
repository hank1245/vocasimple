import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_MEMORIZED_WORDS_KEY = 'guest_memorized_words';

export interface GuestMemorizedWord {
  wordId: string;
  word: string;
  meaning: string;
  memorizedAt: string;
}

export const guestMemorizedService = {
  // Get all memorized words for guest mode
  async getMemorizedWords(): Promise<GuestMemorizedWord[]> {
    try {
      const storedWords = await AsyncStorage.getItem(GUEST_MEMORIZED_WORDS_KEY);
      return storedWords ? JSON.parse(storedWords) : [];
    } catch (error) {
      console.error('Error getting guest memorized words:', error);
      return [];
    }
  },

  // Mark words as memorized in guest mode
  async markWordsAsMemorized(words: { id: string; word: string; meaning: string }[]): Promise<boolean> {
    try {
      const existingWords = await this.getMemorizedWords();
      const now = new Date().toISOString();
      
      const newMemorizedWords: GuestMemorizedWord[] = words.map(word => ({
        wordId: word.id,
        word: word.word,
        meaning: word.meaning,
        memorizedAt: now,
      }));

      // Remove duplicates and add new words
      const existingWordIds = new Set(existingWords.map(w => w.wordId));
      const wordsToAdd = newMemorizedWords.filter(w => !existingWordIds.has(w.wordId));
      
      const updatedWords = [...existingWords, ...wordsToAdd];
      
      await AsyncStorage.setItem(GUEST_MEMORIZED_WORDS_KEY, JSON.stringify(updatedWords));
      return true;
    } catch (error) {
      console.error('Error marking guest words as memorized:', error);
      return false;
    }
  },

  // Mark words as unmemorized in guest mode
  async markWordsAsUnmemorized(wordIds: string[]): Promise<boolean> {
    try {
      const existingWords = await this.getMemorizedWords();
      const filteredWords = existingWords.filter(w => !wordIds.includes(w.wordId));
      
      await AsyncStorage.setItem(GUEST_MEMORIZED_WORDS_KEY, JSON.stringify(filteredWords));
      return true;
    } catch (error) {
      console.error('Error marking guest words as unmemorized:', error);
      return false;
    }
  },

  // Check if a word is memorized in guest mode
  async isWordMemorized(wordId: string): Promise<boolean> {
    try {
      const memorizedWords = await this.getMemorizedWords();
      return memorizedWords.some(w => w.wordId === wordId);
    } catch (error) {
      console.error('Error checking if guest word is memorized:', error);
      return false;
    }
  },

  // Get memorized words count for guest mode
  async getMemorizedWordsCount(): Promise<number> {
    try {
      const memorizedWords = await this.getMemorizedWords();
      return memorizedWords.length;
    } catch (error) {
      console.error('Error getting guest memorized words count:', error);
      return 0;
    }
  },

  // Clear all memorized words (for sign out or reset)
  async clearMemorizedWords(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(GUEST_MEMORIZED_WORDS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing guest memorized words:', error);
      return false;
    }
  },

  // Get memorized word IDs for filtering
  async getMemorizedWordIds(): Promise<string[]> {
    try {
      const memorizedWords = await this.getMemorizedWords();
      return memorizedWords.map(w => w.wordId);
    } catch (error) {
      console.error('Error getting guest memorized word IDs:', error);
      return [];
    }
  }
};