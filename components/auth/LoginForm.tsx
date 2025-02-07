import React, { useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import AuthButton from "./AuthButton";
import AppText from "../common/AppText";
import { FormType } from "@/types/auth";
import BottomSheet from "@gorhom/bottom-sheet";

interface Props {
  changeFormType: (type: FormType) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const LoginForm = ({ changeFormType, bottomSheetRef }: Props) => {
  const onSubmit = () => {
    // 예: 로그인 성공 후 bottomSheet 닫기
    bottomSheetRef.current?.close();
  };

  const onChangeFormTypeToSignUp = () => {
    changeFormType("SIGNUP");
    setTimeout(
      () => {
        bottomSheetRef.current?.snapToIndex(1);
      },
      10,
      []
    );
  };

  useEffect(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.label} text="email 주소" />
        <TextInput style={styles.input} keyboardType="email-address" />
      </View>

      <View>
        <AppText style={styles.label} text="비밀번호" />
        <TextInput style={styles.input} secureTextEntry />
      </View>

      <AuthButton text="로그인" onPress={onSubmit} />

      <AppText style={styles.orText} text="OR" />

      <TouchableOpacity style={styles.googleButton}>
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
});

export default LoginForm;
