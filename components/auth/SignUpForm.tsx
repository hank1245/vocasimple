import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import { supabase } from "@/utils/supabase";
import { signInWithGoogle } from "@/utils/googleAuth";

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

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("계정을 생성했습니다. 이메일 인증 후 로그인해 주세요!");
    setLoading(false);
    changeFormType("LOGIN");
  }

  const onChangeFormToLogin = () => {
    changeFormType("LOGIN");
  };

  const onGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      Alert.alert("Google 로그인 실패", error.message);
    } else {
      // 계정 생성 후에도 동일하게 메인 화면으로 이동
      changeFormType("LOGIN");
    }
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

      <AppText style={styles.orText} text="OR" />

      <TouchableOpacity
        style={[
          styles.googleButton,
          isDisabled || loading ? styles.disabled : null,
        ]}
        disabled={isDisabled || loading}
        onPress={onGoogleSignIn}
      >
        <Image
          source={require("../../assets/images/google.png")}
          style={styles.googleIcon}
        />
      </TouchableOpacity>

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
  orText: {
    textAlign: "center",
    color: "#000",
    marginVertical: 12,
    fontSize: 20,
    fontWeight: "700",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#efecec",
    width: 321,
  },
  googleIcon: {
    width: 26,
    height: 26,
  },
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
