import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vocabularyApi } from "@/utils/vocabularyApi";
import { unifiedVocabularyApi } from "@/utils/unifiedVocabularyApi";
import { vocabularyKeys } from "@/utils/queryClient";
import { VocabularyWord } from "@/types/common";
import { getCurrentUser, useAuth } from "@/stores/authStore";
import { memorizedService } from "@/utils/memorizedService";
import { useUserProfileStore } from "@/stores/userProfileStore";

// Hook for fetching vocabulary list
export function useVocabulary(filter?: "all" | "memorized" | "unmemorized") {
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  return useQuery({
    queryKey: vocabularyKeys.list(userId, filter),
    queryFn: () => unifiedVocabularyApi.fetchVocabulary(userId, filter),
    enabled: !!user || isGuest,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

// Hook for creating a new word
export function useCreateWord() {
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  return useMutation({
    mutationFn: (word: Omit<VocabularyWord, "id" | "user_id">) =>
      unifiedVocabularyApi.createWord(word, userId),
    onSuccess: () => {
      // Invalidate all vocabulary queries for this user
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.lists(),
      });

      // Update user profile store to refresh total word count (only for logged in users)
      if (user && !isGuest) {
        const profileStore = useUserProfileStore.getState();
        profileStore.fetchTierInfo(); // Refresh tier info with updated counts
      }
    },
    onError: (error) => {
      console.error("Failed to create word:", error);
    },
  });
}

// Hook for updating a word
export function useUpdateWord() {
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  return useMutation({
    mutationFn: ({
      wordId,
      updates,
    }: {
      wordId: string;
      updates: Partial<VocabularyWord>;
    }) => unifiedVocabularyApi.updateWord(wordId, updates, userId),
    onSuccess: (updatedWord) => {
      // Update the specific word in cache
      queryClient.setQueryData(
        vocabularyKeys.detail(updatedWord.id),
        updatedWord
      );

      // Invalidate all vocabulary lists to refresh filtered views
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Failed to update word:", error);
    },
  });
}

// Hook for deleting a word
export function useDeleteWord() {
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  return useMutation({
    mutationFn: (wordId: string) => unifiedVocabularyApi.deleteWord(wordId, userId),
    onSuccess: (_, wordId) => {
      // Remove the word from all relevant queries
      queryClient.removeQueries({
        queryKey: vocabularyKeys.detail(wordId),
      });

      // Invalidate all vocabulary lists
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.lists(),
      });

      // Update user profile store to refresh total word count (only for logged in users)
      if (user && !isGuest) {
        const profileStore = useUserProfileStore.getState();
        profileStore.fetchTierInfo(); // Refresh tier info with updated counts
      }
    },
    onError: (error) => {
      console.error("Failed to delete word:", error);
    },
  });
}

// Hook for marking words as memorized
export function useMarkWordsAsMemorized() {
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  return useMutation({
    mutationFn: (wordIds: string[]) => {
      // Use memorized service for logged in users, direct API for guests
      if (user && !isGuest) {
        return memorizedService.markWordsAsMemorized(user.id, wordIds);
      } else {
        return unifiedVocabularyApi.markWordsAsMemorized(wordIds, userId);
      }
    },
    onSuccess: (_, wordIds) => {
      // Invalidate all vocabulary queries to refresh counts and filters
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.all,
      });

      // Also invalidate user profile queries to refresh memorized count
      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });

      // Force refresh profile store data instead of optimistic update (only for logged in users)
      if (user && !isGuest) {
        const profileStore = useUserProfileStore.getState();
        profileStore.clearCache(); // Clear cache to force refetch
        profileStore.fetchTierInfo(); // Refresh tier info with updated counts from server
      }
    },
    onError: (error) => {
      console.error("Failed to mark words as memorized:", error);
    },
  });
}

// Hook for marking words as unmemorized
export function useMarkWordsAsUnmemorized() {
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  return useMutation({
    mutationFn: (wordIds: string[]) => {
      // Use memorized service for logged in users, direct API for guests
      if (user && !isGuest) {
        return memorizedService.markWordsAsUnmemorized(user.id, wordIds);
      } else {
        return unifiedVocabularyApi.markWordsAsUnmemorized(wordIds, userId);
      }
    },
    onSuccess: (_, wordIds) => {
      // Invalidate all vocabulary queries to refresh counts and filters
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.all,
      });

      // Also invalidate user profile queries to refresh memorized count
      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });

      // Force refresh profile store data instead of optimistic update (only for logged in users)
      if (user && !isGuest) {
        const profileStore = useUserProfileStore.getState();
        profileStore.clearCache(); // Clear cache to force refetch
        profileStore.fetchTierInfo(); // Refresh tier info with updated counts from server
      }
    },
    onError: (error) => {
      console.error("Failed to mark words as unmemorized:", error);
    },
  });
}

// Hook for optimistic updates when marking single word as memorized
export function useToggleWordMemorized() {
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  return useMutation({
    mutationFn: async ({
      wordId,
      isMemorized,
    }: {
      wordId: string;
      isMemorized: boolean;
    }) => {
      if (user && !isGuest) {
        if (isMemorized) {
          await memorizedService.markWordAsMemorized(user.id, wordId);
        } else {
          await memorizedService.markWordsAsUnmemorized(user.id, [wordId]);
        }
      } else {
        if (isMemorized) {
          await unifiedVocabularyApi.markWordsAsMemorized([wordId], userId);
        } else {
          await unifiedVocabularyApi.markWordsAsUnmemorized([wordId], userId);
        }
      }
    },
    onMutate: async ({ wordId, isMemorized }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: vocabularyKeys.lists() });

      // Snapshot previous values
      const previousData = queryClient.getQueriesData({
        queryKey: vocabularyKeys.lists(),
      });

      // Optimistically update the word
      queryClient.setQueriesData(
        { queryKey: vocabularyKeys.lists() },
        (oldData: VocabularyWord[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((word) =>
            word.id === wordId ? { ...word, is_memorized: isMemorized } : word
          );
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert optimistic updates on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
    },
  });
}

// Hook to prefetch vocabulary data
export function usePrefetchVocabulary() {
  const queryClient = useQueryClient();
  const { user, isGuest } = useAuth();
  const userId = user?.id || (isGuest ? 'guest_user' : '');

  const prefetchVocabulary = (filter?: "all" | "memorized" | "unmemorized") => {
    if (!user && !isGuest) return;

    queryClient.prefetchQuery({
      queryKey: vocabularyKeys.list(userId, filter),
      queryFn: () => unifiedVocabularyApi.fetchVocabulary(userId, filter),
      staleTime: 3 * 60 * 1000,
    });
  };

  return { prefetchVocabulary };
}
