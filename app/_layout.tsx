import "core-js/stable/structured-clone";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import ToastManager from "toastify-react-native";

// structuredClone polyfill for React Native
if (!global.structuredClone) {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  // 세션 로드 및 변경 구독
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("초기 세션 로드:", session);
      setSession(session);
      setSessionLoaded(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth 상태 변경:", event, session);
        setSession(session);

        // 로그인/로그아웃 시에만 네비게이션 수행
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          setIsNavigating(true);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    Lexend: require("../assets/fonts/Lexend.ttf"),
  });

  // 초기 로드 시 네비게이션
  useEffect(() => {
    const handleInitialNavigation = async () => {
      if ((loaded || error) && sessionLoaded && !isNavigating) {
        await SplashScreen.hideAsync();
        console.log("초기 네비게이션 실행, 세션:", session);
        if (session) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)");
        }
      }
    };
    handleInitialNavigation();
  }, [loaded, error, sessionLoaded, session, router, isNavigating]);

  // 세션 변경 시 네비게이션
  useEffect(() => {
    if (isNavigating && sessionLoaded) {
      console.log("세션 변경 네비게이션 실행, 세션:", session);
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }
      setIsNavigating(false);
    }
  }, [isNavigating, session, sessionLoaded, router]);

  if (!loaded || !sessionLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 화면은 라우터에서 자동 리디렉션되므로 빈 Stack을 렌더링 */}
      </Stack>
      <ToastManager />
    </ThemeProvider>
  );
}
