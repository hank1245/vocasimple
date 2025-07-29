import { VocabularyWord } from "@/types/common";
import { VocabularyApiService, vocabularyApi } from "./vocabularyApi";
import { localVocabularyApi, syncLocalToServer, backupServerToLocal } from "./localVocabularyApi";
import { useAuthStore } from "@/stores/authStore";

// 현재 인증 상태에 따라 적절한 API를 선택하는 함수
const getActiveApi = (): VocabularyApiService => {
  const { session, isGuest } = useAuthStore.getState();
  
  if (session && !isGuest) {
    return vocabularyApi; // 서버 API 사용
  } else {
    return localVocabularyApi; // 로컬 API 사용
  }
};

// 사용자 ID를 가져오는 함수
const getUserId = (): string => {
  const { session, isGuest } = useAuthStore.getState();
  
  if (session && !isGuest) {
    return session.user.id;
  } else {
    return 'guest_user'; // 게스트 사용자 ID
  }
};

export const unifiedVocabularyApi: VocabularyApiService = {
  async fetchVocabulary(
    userId?: string,
    filter?: "all" | "memorized" | "unmemorized"
  ): Promise<VocabularyWord[]> {
    const api = getActiveApi();
    const id = userId || getUserId();
    return api.fetchVocabulary(id, filter);
  },

  async createWord(
    word: Omit<VocabularyWord, "id" | "user_id">,
    userId?: string
  ): Promise<VocabularyWord> {
    const api = getActiveApi();
    const id = userId || getUserId();
    return api.createWord(word, id);
  },

  async updateWord(
    wordId: string,
    updates: Partial<VocabularyWord>,
    userId?: string
  ): Promise<VocabularyWord> {
    const api = getActiveApi();
    const id = userId || getUserId();
    return api.updateWord(wordId, updates, id);
  },

  async deleteWord(wordId: string, userId?: string): Promise<void> {
    const api = getActiveApi();
    const id = userId || getUserId();
    return api.deleteWord(wordId, id);
  },

  async markWordsAsMemorized(wordIds: string[], userId?: string): Promise<void> {
    const api = getActiveApi();
    const id = userId || getUserId();
    return api.markWordsAsMemorized(wordIds, id);
  },

  async markWordsAsUnmemorized(wordIds: string[], userId?: string): Promise<void> {
    const api = getActiveApi();
    const id = userId || getUserId();
    return api.markWordsAsUnmemorized(wordIds, id);
  },
};

// 회원가입 시 로컬 데이터를 서버로 동기화
export const handleSignUpSync = async (userId: string): Promise<void> => {
  try {
    await syncLocalToServer(vocabularyApi, userId);
  } catch (error) {
    console.error('Failed to sync local data to server:', error);
  }
};

// 로그인 시 서버 데이터를 로컬로 백업 (옵션)
export const handleSignInBackup = async (userId: string): Promise<void> => {
  try {
    await backupServerToLocal(vocabularyApi, userId);
  } catch (error) {
    console.error('Failed to backup server data to local:', error);
  }
};

// 로그아웃 시 서버 데이터를 로컬로 백업
export const handleSignOutBackup = async (userId: string): Promise<void> => {
  try {
    await backupServerToLocal(vocabularyApi, userId);
  } catch (error) {
    console.error('Failed to backup server data to local:', error);
  }
};