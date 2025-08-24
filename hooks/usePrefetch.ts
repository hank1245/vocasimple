import { useCallback } from "react";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";

export function useImagePrefetch() {
  const prefetch = useCallback((sources: (number | string)[]) => {
    sources.forEach((src) => {
      try {
        if (typeof src === "string") {
          Image.prefetch(src);
        } else {
          Image.prefetch(src as any);
        }
      } catch {}
    });
  }, []);
  return prefetch;
}

export async function keepSplashWhile<T>(fn: () => Promise<T>): Promise<T> {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch {}
  try {
    const res = await fn();
    return res;
  } finally {
    try {
      await SplashScreen.hideAsync();
    } catch {}
  }
}
