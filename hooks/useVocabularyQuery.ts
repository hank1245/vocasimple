import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vocabularyApi } from "@/utils/vocabularyApi";
import { vocabularyKeys } from "@/utils/queryClient";
import { VocabularyWord } from "@/types/common";
import { getCurrentUser } from "@/stores/authStore";
import { memorizedService } from "@/utils/memorizedService";
import { useUserProfileStore } from "@/stores/userProfileStore";

// Hook for fetching vocabulary list
export function useVocabulary(filter?: "all" | "memorized" | "unmemorized") {
  const user = getCurrentUser();

  return useQuery({
    queryKey: vocabularyKeys.list(user?.id || "", filter),
    queryFn: () => vocabularyApi.fetchVocabulary(user!.id, filter),
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

// Hook for creating a new word
export function useCreateWord() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (word: Omit<VocabularyWord, "id" | "user_id">) =>
      vocabularyApi.createWord(word, user!.id),
    onSuccess: () => {
      // Invalidate all vocabulary queries for this user
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.lists(),
      });

      // Update user profile store to refresh total word count
      const profileStore = useUserProfileStore.getState();
      profileStore.fetchTierInfo(); // Refresh tier info with updated counts
    },
    onError: (error) => {
      console.error("Failed to create word:", error);
    },
  });
}

// Hook for updating a word
export function useUpdateWord() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: ({
      wordId,
      updates,
    }: {
      wordId: string;
      updates: Partial<VocabularyWord>;
    }) => vocabularyApi.updateWord(wordId, updates, user!.id),
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
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (wordId: string) => vocabularyApi.deleteWord(wordId, user!.id),
    onSuccess: (_, wordId) => {
      // Remove the word from all relevant queries
      queryClient.removeQueries({
        queryKey: vocabularyKeys.detail(wordId),
      });

      // Invalidate all vocabulary lists
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.lists(),
      });

      // Update user profile store to refresh total word count
      const profileStore = useUserProfileStore.getState();
      profileStore.fetchTierInfo(); // Refresh tier info with updated counts
    },
    onError: (error) => {
      console.error("Failed to delete word:", error);
    },
  });
}

// Hook for marking words as memorized
export function useMarkWordsAsMemorized() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (wordIds: string[]) => {
      // Use the memorized service to handle tier updates
      return memorizedService.markWordsAsMemorized(user!.id, wordIds);
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

      // Force refresh profile store data instead of optimistic update
      const profileStore = useUserProfileStore.getState();
      profileStore.clearCache(); // Clear cache to force refetch
      profileStore.fetchTierInfo(); // Refresh tier info with updated counts from server
    },
    onError: (error) => {
      console.error("Failed to mark words as memorized:", error);
    },
  });
}

// Hook for marking words as unmemorized
export function useMarkWordsAsUnmemorized() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (wordIds: string[]) => {
      // Use the memorized service to handle tier updates
      return memorizedService.markWordsAsUnmemorized(user!.id, wordIds);
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

      // Force refresh profile store data instead of optimistic update
      const profileStore = useUserProfileStore.getState();
      profileStore.clearCache(); // Clear cache to force refetch
      profileStore.fetchTierInfo(); // Refresh tier info with updated counts from server
    },
    onError: (error) => {
      console.error("Failed to mark words as unmemorized:", error);
    },
  });
}

// Hook for optimistic updates when marking single word as memorized
export function useToggleWordMemorized() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: async ({
      wordId,
      isMemorized,
    }: {
      wordId: string;
      isMemorized: boolean;
    }) => {
      if (isMemorized) {
        await memorizedService.markWordAsMemorized(user!.id, wordId);
      } else {
        await memorizedService.markWordsAsUnmemorized(user!.id, [wordId]);
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
  const user = getCurrentUser();

  const prefetchVocabulary = (filter?: "all" | "memorized" | "unmemorized") => {
    if (!user) return;

    queryClient.prefetchQuery({
      queryKey: vocabularyKeys.list(user.id, filter),
      queryFn: () => vocabularyApi.fetchVocabulary(user.id, filter),
      staleTime: 3 * 60 * 1000,
    });
  };

  return { prefetchVocabulary };
}
