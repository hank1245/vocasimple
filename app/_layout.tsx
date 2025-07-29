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

// Polyfills for Android 8.0 compatibility
if (!global.structuredClone) {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Promise.allSettled polyfill (may be missing in Android 8.0)
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
  const { session, loading, initialized, initialize, cleanup, isGuest } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();

  // App initialization completion log (useful in production)
  useEffect(() => {
    if (loaded && initialized && !loading) {
      console.log("App initialization completed successfully");
    }
  }, [loaded, initialized, loading]);

  // Platform information (useful for error debugging)
  useEffect(() => {
    console.log(`App running on ${Platform.OS} ${Platform.Version}`);
  }, []);

  // Authentication initialization
  useEffect(() => {
    initialize().catch((error) => {
      console.error("Auth initialization failed:", error);
      setInitError(error.message || "Authentication initialization failed");
    });

    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);


  // Session change detection
  useEffect(() => {
    if (initialized && !loading) {
      setIsNavigating(true);
    }
  }, [session, isGuest, initialized, loading]);

  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    Lexend: require("../assets/fonts/Lexend.ttf"),
  });


  // Initial navigation
  useEffect(() => {
    const handleInitialNavigation = async () => {
      if ((loaded || error) && initialized && !loading && !isNavigating) {
        await SplashScreen.hideAsync();
        
        setTimeout(() => {
          try {
            if (session || isGuest) {
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
  }, [loaded, error, initialized, loading, session, isGuest, isNavigating, router]);

  // Navigation on session change
  useEffect(() => {
    if (isNavigating && initialized && !loading && (loaded || error)) {
      setTimeout(() => {
        try {
          if (session || isGuest) {
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
  }, [isNavigating, session, isGuest, initialized, loading, loaded, error, router]);

  if (!loaded || !initialized || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <AppText style={{ fontSize: 20 }} text="Loading..." />
      </View>
    );
  }

  // Show error screen on initialization error
  if (initError) {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <AppText style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 }}>
            App initialization failed
          </AppText>
          <TouchableOpacity 
            style={{ backgroundColor: '#6D60F8', padding: 10, borderRadius: 8 }}
            onPress={() => {
              setInitError(null);
              initialize();
            }}
          >
            <AppText style={{ color: 'white' }} text="Try Again" />
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
