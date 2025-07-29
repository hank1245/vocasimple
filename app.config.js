import "dotenv/config";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export default {
  expo: {
    owner: "hank1245",
    name: "vocasimple",
    slug: "vocasimple",
    version: "1.0.2",
    orientation: "portrait",
    updates: {
      url: "https://u.expo.dev/993c9bc0-ed27-47ab-bc0a-5959a0e33d19",
    },
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.hank1245.vocasimple",
      buildNumber: "6",
      supportsTablet: true,
      requireFullScreen: false,
      config: {
        usesNonExemptEncryption: false,
      },
      runtimeVersion: IS_PRODUCTION ? { policy: "appVersion" } : "1.0.2",
    },
    android: {
      package: "com.hank1245.vocasimple",
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#6D60F8",
      },
      jsEngine: "hermes",
      enableProguardInReleaseBuilds: false,
      usesCleartextTraffic: true,
      networkSecurityConfig: {
        domain: ["krxessvmecpbjsqyrqgw.supabase.co", "api.anthropic.com"],
        includeSubdomains: true,
      },
      runtimeVersion: "1.0.2",
    },
    web: {
      scheme: "vocasimple",
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    splash: {
      image: "./assets/images/splash-screen.png",
      resizeMode: "contain",
      backgroundColor: "#6D60F8",
    },
    scheme: "vocasimple",
    plugins: [
      "expo-router",
      "expo-splash-screen",
      [
        "expo-font",
        {
          fonts: ["./assets/fonts/Lexend.ttf"],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "993c9bc0-ed27-47ab-bc0a-5959a0e33d19",
      },
      router: {
        origin: false,
      },
      EXPO_PUBLIC_SUPABASE_URL:
        process.env.EXPO_PUBLIC_SUPABASE_URL ||
        "https://krxessvmecpbjsqyrqgw.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeGVzc3ZtZWNwYmpzcXlycWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzEwNTIsImV4cCI6MjA2ODMwNzA1Mn0.PwCrfVkrBxJMcl6C74j9NJT8lM7wF0eShjBvakMRATY",
      EXPO_PUBLIC_CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY || "",
      EXPO_PUBLIC_CLAUDE_API_URL:
        process.env.EXPO_PUBLIC_CLAUDE_API_URL ||
        "https://api.anthropic.com/v1/messages",
    },
  },
};
