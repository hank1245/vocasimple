import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppText from "../AppText";
import { useAuthStore } from "@/stores/useAuthStore";
import BottomSheet from "@gorhom/bottom-sheet";

interface Props {
  guide: string;
  link: string;
  color: string;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const Guidance = ({ guide, link, color, bottomSheetRef }: Props) => {
  const { formType, setLogin, setSignUp } = useAuthStore();

  const onPress = () => {
    if (formType === "LOGIN") {
      setSignUp();
      bottomSheetRef.current?.snapToIndex(1); // 80%
    } else {
      setLogin();
      bottomSheetRef.current?.snapToIndex(0); // 60%
    }
  };

  return (
    <View style={styles.container}>
      <AppText style={{ ...styles.guide, color: color }} text={guide} />
      <Pressable onPress={onPress}>
        <AppText style={styles.link} text={link} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default Guidance;
