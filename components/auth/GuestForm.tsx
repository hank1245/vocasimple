import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import BottomSheet from "@gorhom/bottom-sheet";
import { useAuth } from "@/stores/authStore";

interface Props {
  changeFormType: (type: FormType) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const GuestForm = ({ changeFormType, bottomSheetRef }: Props) => {
  const { enterGuestMode } = useAuth();

  const handleGuestStart = async () => {
    await enterGuestMode();
    bottomSheetRef.current?.close();
  };

  const handleSignUp = () => {
    changeFormType("SIGNUP");
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(1);
    }, 10);
  };

  const handleLogin = () => {
    changeFormType("LOGIN");
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 10);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={styles.title} text="How would you like to start?" />
        <AppText style={styles.subtitle} text="You can sign up later anytime" />
      </View>

      <View style={styles.buttonContainer}>
        <AuthButton
          text="Start as Guest"
          onPress={handleGuestStart}
        />
        
        <View style={styles.divider}>
          <View style={styles.line} />
          <AppText style={styles.dividerText} text="or" />
          <View style={styles.line} />
        </View>

        <AuthButton
          text="Sign Up"
          onPress={handleSignUp}
          variant="secondary"
        />
      </View>

      <View style={styles.guidance}>
        <AppText style={styles.guide} text="Already have an account?" />
        <Pressable onPress={handleLogin}>
          <AppText style={styles.link} text="Login" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    width: 321,
    marginBottom: 30,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#888",
  },
  guidance: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  guide: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  link: {
    fontSize: 16,
    color: "#F5C92B",
    marginLeft: 8,
    fontWeight: "700",
  },
});

export default GuestForm;