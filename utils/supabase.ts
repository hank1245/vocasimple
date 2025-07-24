import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// 환경 변수 fallback 처리
const supabaseUrl = 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  "https://krxessvmecpbjsqyrqgw.supabase.co";

const supabaseAnonKey = 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeGVzc3ZtZWNwYmpzcXlycWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzEwNTIsImV4cCI6MjA2ODMwNzA1Mn0.PwCrfVkrBxJMcl6C74j9NJT8lM7wF0eShjBvakMRATY";

// 환경 변수 확인 (필수)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase configuration missing:", { url: !!supabaseUrl, key: !!supabaseAnonKey });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
