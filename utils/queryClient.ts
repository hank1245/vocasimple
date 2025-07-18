import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutes (reduced from 5)
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data is fresh
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys for vocabulary management
export const vocabularyKeys = {
  all: ["vocabulary"] as const,
  lists: () => [...vocabularyKeys.all, "list"] as const,
  list: (userId: string, filter?: "all" | "memorized" | "unmemorized") =>
    [...vocabularyKeys.lists(), userId, filter] as const,
  detail: (id: string) => [...vocabularyKeys.all, "detail", id] as const,
};
