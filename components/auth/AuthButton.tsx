import React from "react";
import { Pressable, StyleSheet } from "react-native";
import AppText from "../common/AppText";

interface Props {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export default function AuthButton({
  text,
  onPress,
  disabled,
  variant = "primary",
}: Props) {
  const getContainerStyle = () => {
    if (disabled) {
      return { backgroundColor: "#6d6d6d" };
    }
    if (variant === "secondary") {
      return {
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#F5C92B",
      };
    }
    return {};
  };

  const getTextStyle = () => {
    if (variant === "secondary") {
      return { color: "#F5C92B" };
    }
    return {};
  };

  return (
    <Pressable
      style={[styles.container, getContainerStyle()]}
      onPress={onPress}
      disabled={disabled}
    >
      <AppText style={[styles.text, getTextStyle()]} text={text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 323,
    height: 64,
    backgroundColor: "#F5C92B",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 20,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    alignSelf: "center",
  },
});
