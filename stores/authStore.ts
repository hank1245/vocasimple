import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "@/utils/supabase";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_MODE_KEY = "guest_mode_active";

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  authListener: any;
  isGuest: boolean;
  initialize: () => Promise<void>;
  cleanup: () => void;
  signOut: () => Promise<void>;
  enterGuestMode: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
  loadGuestMode: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    authListener: null,
    isGuest: false,

    initialize: async () => {
      const state = get();
      if (state.initialized) {
        return;
      }

      // Starting auth initialization...

      // 타임아웃 설정 (5초로 단축)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Auth initialization timeout")),
          5000
        );
      });

      try {
        // Check for saved guest mode first (separate try-catch to prevent crashes)
        let wasInGuestMode = false;
        try {
          const savedGuestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
          wasInGuestMode = savedGuestMode === "true";
        } catch (storageError) {
          console.warn(
            "AsyncStorage error during initialization:",
            storageError
          );
          // Continue with initialization even if AsyncStorage fails
        }

        // 초기 세션 가져오기 (타임아웃과 함께)
        const sessionPromise = supabase.auth.getSession();
        const result = await Promise.race([sessionPromise, timeoutPromise]);

        const {
          data: { session },
          error,
        } = result as any;

        if (error) {
          console.error("Session fetch error:", error);
          // If there was an error but user was in guest mode, restore guest mode
          if (wasInGuestMode) {
            set({ loading: false, initialized: true, isGuest: true });
          } else {
            set({ loading: false, initialized: true });
          }
          return;
        }

        // Auth initialization completed

        // If user has a session, use it; otherwise check if they were in guest mode
        if (session) {
          set({
            session,
            user: session?.user ?? null,
            loading: false,
            initialized: true,
            isGuest: false,
          });
        } else if (wasInGuestMode) {
          set({
            session: null,
            user: null,
            loading: false,
            initialized: true,
            isGuest: true,
          });
        } else {
          set({
            session,
            user: session?.user ?? null,
            loading: false,
            initialized: true,
          });
        }

        // 세션 변경 리스너 설정
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session: Session | null) => {
            // Auth state changed

            // 불필요한 리렌더링 방지 - 세션이 실제로 변경된 경우만 업데이트
            const currentState = get();
            const currentUserId = currentState.session?.user?.id;
            const newUserId = session?.user?.id;

            if (
              currentUserId === newUserId &&
              !!currentState.session === !!session
            ) {
              return;
            }

            set({
              session,
              user: session?.user ?? null,
              loading: false,
            });
          }
        );

        set({ authListener });
      } catch (error) {
        console.error("Auth initialization error:", error);
        // 에러가 발생해도 앱이 계속 실행되도록 함
        set({
          loading: false,
          initialized: true,
          session: null,
          user: null,
        });
      }
    },

    cleanup: () => {
      const state = get();
      if (state.authListener) {
        state.authListener.subscription.unsubscribe();
        set({ authListener: null });
      }
    },

    signOut: async () => {
      const currentState = get();
      try {
        // 로그아웃 전에 서버 데이터를 로컬로 백업
        if (currentState.user && !currentState.isGuest) {
          try {
            const { handleSignOutBackup } = await import(
              "@/utils/unifiedVocabularyApi"
            );
            await handleSignOutBackup(currentState.user.id);
          } catch (error) {
            console.error("Error backing up data on sign out:", error);
          }
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Sign out error:", error);
        }

        // Clear guest mode when signing out
        set({ isGuest: false });

        // Try to clear AsyncStorage in background
        try {
          await AsyncStorage.removeItem(GUEST_MODE_KEY);
        } catch (storageError) {
          console.warn(
            "Failed to clear guest mode from storage:",
            storageError
          );
          // Continue without crashing
        }
      } catch (error) {
        console.error("Sign out error:", error);
      }
    },

    enterGuestMode: async () => {
      // Set guest mode immediately, don't wait for AsyncStorage
      set({
        isGuest: true,
        loading: false,
        initialized: true,
        user: null,
        session: null,
      });

      // Try to save to AsyncStorage in background
      try {
        await AsyncStorage.setItem(GUEST_MODE_KEY, "true");
      } catch (error) {
        console.warn("Failed to save guest mode to storage:", error);
        // Continue without crashing - guest mode is already set in state
      }
    },

    exitGuestMode: async () => {
      // Set state immediately, don't wait for AsyncStorage
      set({
        isGuest: false,
        loading: false,
        initialized: true,
        user: null,
        session: null,
      });

      // Try to remove from AsyncStorage in background
      try {
        await AsyncStorage.removeItem(GUEST_MODE_KEY);
      } catch (error) {
        console.warn("Failed to remove guest mode from storage:", error);
        // Continue without crashing - state is already updated
      }
    },

    loadGuestMode: async () => {
      try {
        const savedGuestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
        if (savedGuestMode === "true") {
          set({ isGuest: true });
        }
      } catch (error) {
        console.error("Error loading guest mode:", error);
      }
    },
  }))
);

// 전역 상태를 통한 사용자 정보 접근 함수
export const getCurrentUser = () => {
  const state = useAuthStore.getState();
  return state.user;
};

export const getCurrentSession = () => {
  const state = useAuthStore.getState();
  return state.session;
};

// 편의를 위한 기존 hook 유지
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    initialized: store.initialized,
    isGuest: store.isGuest,
    initialize: store.initialize,
    cleanup: store.cleanup,
    signOut: store.signOut,
    enterGuestMode: store.enterGuestMode,
    exitGuestMode: store.exitGuestMode,
  };
};
