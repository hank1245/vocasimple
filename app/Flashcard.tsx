import React, { Suspense } from "react";
import { View } from "react-native";
import AppText from "@/components/common/AppText";

const LazyImpl = React.lazy(() => import("@/screens/FlashcardScreenImpl"));

export default function FlashcardRoute() {
  return (
    <Suspense
      fallback={
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <AppText text="Loading..." style={{ fontSize: 16, color: "#666" }} />
        </View>
      }
    >
      <LazyImpl />
    </Suspense>
  );
}
