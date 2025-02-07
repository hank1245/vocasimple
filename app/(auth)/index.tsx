import AuthButton from "@/components/auth/AuthButton";
import Guidance from "@/components/auth/Guidance";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import AppText from "@/components/AppText";
import Form from "@/components/auth/Form";
import { useAuthStore } from "@/stores/useAuthStore";

const index = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { formType, setLogin, setSignUp } = useAuthStore((state) => state);

  const onSignUp = () => {
    setSignUp();
    bottomSheetRef.current?.snapToIndex(1); // 80%
  };

  const onLogin = () => {
    setLogin();
    bottomSheetRef.current?.snapToIndex(0); // 60%
  };
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <View style={styles.banner}>
          <AppText style={styles.bannerText} text="Let's get Started!" />
        </View>
        <Image
          source={require("../../assets/images/get-started.png")}
          style={styles.image}
        />
        <AuthButton text="회원 가입하기" onPress={onSignUp} />
        <View style={styles.guidance}>
          <AppText style={styles.guide} text="이미 계정이 있으신가요?" />
          <Pressable onPress={onLogin}>
            <AppText style={styles.link} text="로그인" />
          </Pressable>
        </View>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["60%", "80%"]}
        index={-1} // Start closed
        enablePanDownToClose={true}
        enableDynamicSizing={false}
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
    flex: 1,
    backgroundColor: "#6D60F8",
  },
  banner: {
    marginTop: 33,
    alignItems: "center",
  },
  bannerText: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
  },
  image: {
    width: 393,
    height: 454,
    marginBottom: 60,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  guidance: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  guide: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
  },
  link: {
    fontSize: 20,
    color: "#F5C92B",
    marginLeft: 8,
    fontWeight: "700",
  },
});

export default index;
