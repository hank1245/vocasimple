import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import { supabase } from "@/utils/supabase";

interface Props {
  changeFormType: (type: FormType) => void;
}

const SignUpForm = ({ changeFormType }: Props) => {
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
      Alert.alert("이메일 형식이 올바르지 않습니다.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (!session) {
      Alert.alert("계정을 생성했습니다. 이메일 인증 후 로그인해 주세요!");
      changeFormType("LOGIN");
    }
    setLoading(false);
  }

  const onChangeFormToLogin = () => {
    changeFormType("LOGIN");
  };

  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.label} text="이름" />
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      <View>
        <AppText style={styles.label} text="email 주소" />
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View>
        <AppText style={styles.label} text="비밀번호" />
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="6자리 이상"
        />
      </View>

      <View style={{ marginBottom: 30 }}>
        <AppText style={styles.label} text="비밀번호 확인" />
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="6자리 이상"
        />
      </View>

      <AuthButton
        text="회원 가입하기"
        onPress={signUpWithEmail}
        disabled={isDisabled || loading}
      />

      {/* Google 로그인 버튼 및 관련 코드 제거됨 */}

      <View style={styles.guidance}>
        <AppText style={styles.guide} text="이미 계정이 있으신가요?" />
        <Pressable onPress={onChangeFormToLogin}>
          <AppText style={styles.link} text="로그인" />
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

export default SignUpForm;
