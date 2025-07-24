import AuthButton from "@/components/auth/AuthButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useMemo, useRef } from "react";
import { Image, SafeAreaView, StyleSheet, View, Dimensions } from "react-native";
import AppText from "@/components/common/AppText";
import { Easing } from "react-native-reanimated";
import Form from "@/components/auth/Form";
import { Colors } from "@/constants/Colors";

export default function Index() {
  const snapPoints = useMemo(() => ["60%", "80%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // 화면 크기 가져오기
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // 이미지 크기 계산 (화면 너비의 90%, 최대 393px)
  const imageWidth = Math.min(screenWidth * 0.9, 393);
  // 원본 비율 유지 (393:504)
  const imageHeight = (imageWidth * 504) / 393;
  
  // 버튼이 보이도록 최대 높이 제한
  const maxImageHeight = screenHeight * 0.5; // 화면 높이의 50%
  const finalImageHeight = Math.min(imageHeight, maxImageHeight);
  const finalImageWidth = (finalImageHeight * 393) / 504;

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  return (
    <GestureHandlerRootView
      style={{ backgroundColor: Colors.primary, flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.banner}>
          <AppText style={styles.bannerText} text="Let's get Started!" />
        </View>
        <Image
          source={require("../../assets/images/get-started.png")}
          style={[
            styles.image,
            {
              width: finalImageWidth,
              height: finalImageHeight,
            }
          ]}
          resizeMode="contain"
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
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  banner: {
    alignItems: "center",
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
  },
  image: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
  },
});
