import "core-js/stable/structured-clone";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
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
import { Platform, TouchableOpacity } from "react-native";
import AppText from "@/components/common/AppText";

if (!global.structuredClone) {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

if (!Promise.allSettled) {
  Promise.allSettled = function (promises: Promise<any>[]) {
    return Promise.all(
      promises.map((p) =>
        Promise.resolve(p).then(
          (val) => ({ status: "fulfilled" as const, value: val }),
          (err) => ({ status: "rejected" as const, reason: err })
        )
      )
    );
  };
}

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { session, loading, initialized, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabGroup = segments[0] === "(tabs)";

    if (session || isGuest) {
      if (inAuthGroup) {
        router.replace("/(tabs)");
      }
    } else {
      if (inTabGroup) {
        router.replace("/(auth)");
      }
    }
  }, [session, isGuest, initialized, loading, segments, router]);
}

export default function RootLayout() {
  const { session, loading, initialized, initialize, cleanup, isGuest } =
    useAuth();
  const [initError, setInitError] = useState<string | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    Lexend: require("../assets/fonts/Lexend.ttf"),
  });

  useEffect(() => {
    // App running on ${Platform.OS} ${Platform.Version}
  }, []);

  useEffect(() => {
    let isMounted = true;

    setAppIsReady(false);

    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        if (isMounted) {
          console.error("Auth initialization failed:", error);
          setInitError(
            error instanceof Error
              ? error.message
              : "Authentication initialization failed"
          );
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [initialize, cleanup]);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        if ((loaded || error) && initialized && !loading && !appIsReady) {
          // App initialization completed successfully

          await new Promise((resolve) => setTimeout(resolve, 300));

          setAppIsReady(true);

          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error("App preparation error:", error);
        setInitError("Failed to initialize app");
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    prepareApp();
  }, [loaded, error, initialized, loading, appIsReady]);

  if (!appIsReady || !initialized || loading || (!loaded && !error)) {
    return null;
  }

  if (initError) {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <AppText
            text="App initialization failed"
            style={{
              fontSize: 18,
              color: "red",
              textAlign: "center",
              marginBottom: 20,
            }}
          />
          <TouchableOpacity
            style={{ backgroundColor: "#6D60F8", padding: 10, borderRadius: 8 }}
            onPress={() => {
              setInitError(null);
              initialize();
            }}
          >
            <AppText style={{ color: "white" }} text="Try Again" />
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
            <RootLayoutNav />
            <ToastManager />
          </ThemeProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
