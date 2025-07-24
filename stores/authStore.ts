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
        return;
      }

      // 타임아웃 설정 (10초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Auth initialization timeout")), 10000);
      });

      try {
        // 초기 세션 가져오기 (타임아웃과 함께)
        const sessionPromise = supabase.auth.getSession();
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        
        const {
          data: { session },
          error,
        } = result as any;

        if (error) {
          console.error("Session fetch error:", error);
          set({ loading: false, initialized: true });
          return;
        }

        set({
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true,
        });

        // 세션 변경 리스너 설정
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session: Session | null) => {
            // 불필요한 리렌더링 방지
            const currentState = get();
            if (currentState.session?.user?.id === session?.user?.id) {
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
          user: null 
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
