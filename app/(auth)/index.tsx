import AuthButton from "@/components/auth/AuthButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useMemo, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import AppText from "@/components/common/AppText";
import { Easing } from "react-native-reanimated";
import Form from "@/components/auth/Form";
import { Colors } from "@/constants/Colors";

export default function Index() {
  const snapPoints = useMemo(() => ["60%", "80%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 화면 크기 가져오기
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // 이미지 크기 계산 (화면 너비의 90%, 최대 393px)
  const imageWidth = Math.min(screenWidth * 0.9, 393);
  // 원본 비율 유지 (393:504)
  const imageHeight = (imageWidth * 504) / 393;

  // 버튼이 보이도록 최대 높이 제한
  const maxImageHeight = screenHeight * 0.6; // 화면 높이의 60%
  const finalImageHeight = Math.min(imageHeight, maxImageHeight);
  const finalImageWidth = (finalImageHeight * 393) / 504;

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  // 동적 스타일 생성
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: screenHeight * 0.1,
      paddingBottom: screenHeight * 0.15,
    },
    banner: {
      alignItems: "center",
      marginBottom: screenHeight * 0.05,
    },
    bannerText: {
      fontSize: Math.max(screenWidth * 0.08, 24), // 최소 24px
      fontWeight: "600",
      color: "white",
    },
    image: {
      alignSelf: "center",
      marginBottom: screenHeight * 0.06,
    },
  });

  const handleBackgroundPress = (event: any) => {
    // Only dismiss keyboard if user taps on the background, not on input fields
    if (event.target === event.currentTarget) {
      Keyboard.dismiss();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleBackgroundPress}>
      <GestureHandlerRootView
        style={{ backgroundColor: Colors.primary, flex: 1 }}
      >
        <SafeAreaView style={dynamicStyles.container}>
          <View style={dynamicStyles.banner}>
            <AppText
              style={dynamicStyles.bannerText}
              text="Let's get Started!"
            />
          </View>
          <Image
            source={require("../../assets/images/get-started.png")}
            style={[
              dynamicStyles.image,
              {
                width: finalImageWidth,
                height: finalImageHeight,
              },
            ]}
            resizeMode="contain"
          />
          <AuthButton text="Get Started" onPress={openBottomSheet} />
        </SafeAreaView>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose={true}
          enableDynamicSizing={false}
          animateOnMount={true}
          animationConfigs={{
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }}
        >
          <BottomSheetView style={styles.contentContainer}>
            <TouchableWithoutFeedback onPress={handleBackgroundPress}>
              <View style={{ flex: 1 }}>
                <Form bottomSheetRef={bottomSheetRef} />
              </View>
            </TouchableWithoutFeedback>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
  },
});
