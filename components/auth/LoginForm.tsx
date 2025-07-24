import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import BottomSheet from "@gorhom/bottom-sheet";
import { supabase } from "@/utils/supabase";

interface Props {
  changeFormType: (type: FormType) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const LoginForm = ({ changeFormType, bottomSheetRef }: Props) => {
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
        Alert.alert("존재하지 않거나 인증이 완료되지 않은 계정입니다.");
      } else {
        bottomSheetRef.current?.close();
      }
    } catch (err) {
      console.error("Login exception:", err);
      Alert.alert("로그인 중 오류가 발생했습니다.");
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

  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.label} text="email 주소" />
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />
      </View>

      <View style={{ marginBottom: 30 }}>
        <AppText style={styles.label} text="비밀번호" />
        <TextInput
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
      </View>

      <AuthButton
        text="로그인"
        onPress={signInWithEmail}
        disabled={isDisabled}
      />

      {/* Google 로그인 버튼 및 관련 코드 제거됨 */}

      <View style={styles.guidance}>
        <AppText style={styles.guide} text="아직 계정이 없으신가요?" />
        <Pressable onPress={onChangeFormTypeToSignUp}>
          <AppText style={styles.link} text="회원가입" />
        </Pressable>
      </View>
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
});

export default LoginForm;
