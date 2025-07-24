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
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/queryClient";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Platform, Alert, TouchableOpacity, View } from "react-native";
import AppText from "@/components/common/AppText";
import * as DevMenu from "expo-dev-menu";

// Android 8.0 호환성을 위한 polyfills
if (!global.structuredClone) {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Promise.allSettled polyfill (Android 8.0에서 누락될 수 있음)
if (!Promise.allSettled) {
  Promise.allSettled = function(promises: Promise<any>[]) {
    return Promise.all(promises.map(p => Promise.resolve(p).then(
      val => ({ status: 'fulfilled' as const, value: val }),
      err => ({ status: 'rejected' as const, reason: err })
    )));
  };
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading, initialized, initialize, cleanup } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();

  // 앱 초기화 완료 로그 (프로덕션에서도 유용)
  useEffect(() => {
    if (loaded && initialized && !loading) {
      console.log("App initialization completed successfully");
    }
  }, [loaded, initialized, loading]);

  // 플랫폼 정보 (에러 디버깅에 유용)
  useEffect(() => {
    console.log(`App running on ${Platform.OS} ${Platform.Version}`);
  }, []);

  // 인증 초기화
  useEffect(() => {
    initialize().catch((error) => {
      console.error("Auth initialization failed:", error);
      setInitError(error.message || "인증 초기화 실패");
    });

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


  // 초기 네비게이션
  useEffect(() => {
    const handleInitialNavigation = async () => {
      if ((loaded || error) && initialized && !loading && !isNavigating) {
        await SplashScreen.hideAsync();
        
        setTimeout(() => {
          try {
            if (session) {
              router.replace("/(tabs)");
            } else {
              router.replace("/(auth)");
            }
          } catch (error) {
            console.error("Navigation error:", error);
          }
        }, 500);
      }
    };
    handleInitialNavigation();
  }, [loaded, error, initialized, loading, session, isNavigating, router]);

  // 세션 변경 시 네비게이션
  useEffect(() => {
    if (isNavigating && initialized && !loading && (loaded || error)) {
      setTimeout(() => {
        try {
          if (session) {
            router.replace("/(tabs)");
          } else {
            router.replace("/(auth)");
          }
          setIsNavigating(false);
        } catch (error) {
          console.error("Session navigation error:", error);
          setIsNavigating(false);
        }
      }, 500);
    }
  }, [isNavigating, session, initialized, loading, loaded, error, router]);

  if (!loaded || !initialized || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <AppText style={{ fontSize: 20 }} text="로딩 중..." />
      </View>
    );
  }

  // 초기화 에러 발생 시 에러 화면 표시
  if (initError) {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <AppText style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 }}>
            앱 초기화에 실패했습니다
          </AppText>
          <TouchableOpacity 
            style={{ backgroundColor: '#6D60F8', padding: 10, borderRadius: 8 }}
            onPress={() => {
              setInitError(null);
              initialize();
            }}
          >
            <AppText style={{ color: 'white' }} text="다시 시도" />
          </TouchableOpacity>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <ToastManager />
          </ThemeProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
