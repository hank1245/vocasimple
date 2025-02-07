import AuthButton from "@/components/auth/AuthButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useMemo, useRef } from "react";
import { Image, SafeAreaView, StyleSheet, View } from "react-native";
import AppText from "@/components/common/AppText";
import { Easing } from "react-native-reanimated";
import Form from "@/components/auth/Form";

const Index = () => {
  const snapPoints = useMemo(() => ["60%", "80%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  return (
    <GestureHandlerRootView style={{ backgroundColor: "#6D60F8", flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.banner}>
          <AppText style={styles.bannerText} text="Let's get Started!" />
        </View>
        <Image
          source={require("../../assets/images/get-started.png")}
          style={styles.image}
        />
        <AuthButton text="시작하기" onPress={openBottomSheet} />
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={true}
        animationConfigs={{
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Form bottomSheetRef={bottomSheetRef} />
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
  },
  banner: {
    alignItems: "center",
  },
  bannerText: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
  },
  image: {
    width: 393,
    height: 504,
    marginBottom: 50,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
  },
});

export default Index;
