import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import BottomSheet from "@gorhom/bottom-sheet";
import { supabase } from "@/utils/supabase";
import { signInWithGoogle } from "@/utils/googleAuth";

interface Props {
  changeFormType: (type: FormType) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const LoginForm = ({ changeFormType, bottomSheetRef }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isDisabled = loading || !email.trim() || !password.trim();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("존재하지 않거나 인증이 완료되지 않은 계정입니다.");
    } else {
      router.replace("/(tabs)");
    }
    setLoading(false);
  }

  const onGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      Alert.alert("Google 로그인 실패", error.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  const onChangeFormTypeToSignUp = () => {
    changeFormType("SIGNUP");
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(1);
    }, 10);
  };

  useEffect(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

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

      <AppText style={styles.orText} text="OR" />

      <TouchableOpacity
        style={[styles.googleButton, isDisabled ? styles.disabled : null]}
        disabled={isDisabled}
        onPress={onGoogleSignIn}
      >
        <Image
          source={require("../../assets/images/google.png")}
          style={styles.googleIcon}
        />
      </TouchableOpacity>

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

export default LoginForm;
