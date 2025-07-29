import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import { supabase } from "@/utils/supabase";
import { handleSignUpSync } from "@/utils/unifiedVocabularyApi";
import { useAuth } from "@/stores/authStore";
import BottomSheet from "@gorhom/bottom-sheet";

interface Props {
  changeFormType: (type: FormType) => void;
  bottomSheetRef?: React.RefObject<BottomSheet>;
}

const SignUpForm = ({ changeFormType, bottomSheetRef }: Props) => {
  const { enterGuestMode } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // 모든 필드가 채워져있는지 체크, loading 중에도 disabled 처리
  const isDisabled =
    loading ||
    !name.trim() ||
    !email.trim() ||
    !password.trim() ||
    !confirmPassword.trim();

  async function signUpWithEmail() {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email format.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password and password confirmation do not match.");
      return;
    }
    
    setLoading(true);
    
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Signup error:", error);
        Alert.alert("Sign Up Failed", error.message);
      } else if (!session) {
        Alert.alert("Account created! Please verify your email and then log in.");
        changeFormType("LOGIN");
      } else {
        // 회원가입 성공 후 로컬 데이터를 서버로 동기화 (백그라운드에서 실행)
        if (session.user) {
          handleSignUpSync(session.user.id).catch(console.error);
        }
      }
    } catch (err) {
      console.error("Signup exception:", err);
      Alert.alert("Network Error", "Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  const onChangeFormToLogin = () => {
    changeFormType("LOGIN");
  };

  const handleGuestStart = () => {
    enterGuestMode();
    bottomSheetRef?.current?.close();
  };

  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.label} text="Name" />
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      <View>
        <AppText style={styles.label} text="Email Address" />
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View>
        <AppText style={styles.label} text="Password" />
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="6+ characters"
        />
      </View>

      <View style={{ marginBottom: 30 }}>
        <AppText style={styles.label} text="Confirm Password" />
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="6+ characters"
        />
      </View>

      <AuthButton
        text="Sign Up"
        onPress={signUpWithEmail}
        disabled={isDisabled || loading}
      />

      {/* Google 로그인 버튼 및 관련 코드 제거됨 */}

      <View style={styles.guidance}>
        <AppText style={styles.guide} text="Already have an account?" />
        <Pressable onPress={onChangeFormToLogin}>
          <AppText style={styles.link} text="Login" />
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

export default SignUpForm;
