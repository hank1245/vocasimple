import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "@/utils/supabase";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  authListener: any;
  initialize: () => Promise<void>;
  cleanup: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    authListener: null,

    initialize: async () => {
      const state = get();
      if (state.initialized) {
        console.log("Auth already initialized, skipping...");
        return;
      }

      console.log("Initializing auth store...");

      try {
        // 초기 세션 가져오기 (한 번만)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session fetch error:", error);
          set({ loading: false, initialized: true });
          return;
        }

        console.log("Initial session:", session?.user?.id ? "Found" : "None");

        set({
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true,
        });

        // 세션 변경 리스너 설정 (한 번만)
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session: Session | null) => {
            console.log("Auth state changed:", event, session?.user?.id);

            // 불필요한 리렌더링 방지
            const currentState = get();
            if (currentState.session?.user?.id === session?.user?.id) {
              console.log("Session unchanged, skipping update");
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
        set({ loading: false, initialized: true });
      }
    },

    cleanup: () => {
      const state = get();
      if (state.authListener) {
        console.log("Cleaning up auth listener");
        state.authListener.subscription.unsubscribe();
        set({ authListener: null });
      }
    },

    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Sign out error:", error);
        }
      } catch (error) {
        console.error("Sign out error:", error);
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
    initialize: store.initialize,
    cleanup: store.cleanup,
    signOut: store.signOut,
  };
};
