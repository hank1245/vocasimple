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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const router = useRouter();

  // 세션 로드 및 변경 구독
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoaded(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
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

  // 폰트나 에러, 세션 로드가 완료되면 스플래시 스크린 숨김
  useEffect(() => {
    if ((loaded || error) && sessionLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, sessionLoaded]);

  // 세션 로드가 완료되면 인증 여부에 따라 자동 리디렉션
  useEffect(() => {
    if ((loaded || error) && sessionLoaded) {
      if (session) {
        // 인증된 경우, (tabs)의 index 페이지로 이동
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }
    }
  }, [loaded, error, sessionLoaded, session, router]);

  if (!loaded || !sessionLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 화면은 라우터에서 자동 리디렉션되므로 빈 Stack을 렌더링 */}
      </Stack>
    </ThemeProvider>
  );
}
