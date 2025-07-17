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
import { useAuth } from "@/stores/authStore";
import ToastManager from "toastify-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// structuredClone polyfill for React Native
if (!global.structuredClone) {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading, initialized, initialize, cleanup } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  // Zustand store 초기화
  useEffect(() => {
    initialize();

    // 컴포넌트 언마운트 시 정리
    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  // 세션 변경 감지
  useEffect(() => {
    if (initialized && !loading) {
      setIsNavigating(true);
    }
  }, [session, initialized, loading]);

  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    Lexend: require("../assets/fonts/Lexend.ttf"),
  });

  // 초기 로드 시 네비게이션
  useEffect(() => {
    const handleInitialNavigation = async () => {
      if ((loaded || error) && initialized && !loading && !isNavigating) {
        await SplashScreen.hideAsync();
        // 짧은 딜레이를 추가하여 레이아웃이 완전히 마운트되도록 함
        setTimeout(() => {
          if (session) {
            router.replace("/(tabs)");
          } else {
            router.replace("/(auth)");
          }
        }, 100);
      }
    };
    handleInitialNavigation();
  }, [loaded, error, initialized, loading, session, isNavigating]);

  // 세션 변경 시 네비게이션
  useEffect(() => {
    if (isNavigating && initialized && !loading) {
      // 짧은 딜레이를 추가하여 레이아웃이 완전히 마운트되도록 함
      setTimeout(() => {
        if (session) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)");
        }
        setIsNavigating(false);
      }, 100);
    }
  }, [isNavigating, session, initialized, loading]);

  if (!loaded || !initialized || loading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <ToastManager />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
