import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import BottomSheet from "@gorhom/bottom-sheet";
import { supabase } from "@/utils/supabase";
import { handleSignInBackup } from "@/utils/unifiedVocabularyApi";
import { useAuth } from "@/stores/authStore";

interface Props {
  changeFormType: (type: FormType) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const LoginForm = ({ changeFormType, bottomSheetRef }: Props) => {
  const { enterGuestMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled = loading || !email.trim() || !password.trim();

  async function signInWithEmail() {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        Alert.alert("Account doesn't exist or email verification incomplete.");
      } else {
        // 로그인 성공 후 서버 데이터를 로컬로 백업 (백그라운드에서 실행)
        if (data.user) {
          handleSignInBackup(data.user.id).catch(console.error);
        }
        bottomSheetRef.current?.close();
      }
    } catch (err) {
      console.error("Login exception:", err);
      Alert.alert("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  }

  const onChangeFormTypeToSignUp = () => {
    changeFormType("SIGNUP");
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(1);
    }, 10);
  };

  const handleGuestStart = () => {
    enterGuestMode();
    bottomSheetRef.current?.close();
  };

  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.label} text="Email Address" />
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />
      </View>

      <View style={{ marginBottom: 30 }}>
        <AppText style={styles.label} text="Password" />
        <TextInput
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
      </View>

      <AuthButton
        text="Login"
        onPress={signInWithEmail}
        disabled={isDisabled}
      />

      {/* Google 로그인 버튼 및 관련 코드 제거됨 */}

      <View style={styles.guidance}>
        <AppText style={styles.guide} text="Don't have an account yet?" />
        <Pressable onPress={onChangeFormTypeToSignUp}>
          <AppText style={styles.link} text="Sign Up" />
        </Pressable>
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <AppText style={styles.dividerText} text="or" />
        <View style={styles.line} />
      </View>

      <AuthButton
        text="Start as Guest"
        onPress={handleGuestStart}
        variant="secondary"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  label: {
    color: "#B3B4B6",
    marginBottom: 13,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    width: 321,
    height: 41,
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#DDDFE2",
  },
  // Google OAuth 관련 스타일 제거됨
  guidance: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  guide: {
    fontSize: 20,
    color: "#000",
    fontWeight: "700",
  },
  link: {
    fontSize: 20,
    color: "#F5C92B",
    marginLeft: 8,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: 321,
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
});

export default LoginForm;
