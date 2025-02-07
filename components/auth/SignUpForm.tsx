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

const SignUpForm = ({ changeFormType, bottomSheetRef }: Props) => {
  const onSubmit = () => {};

  const onChangeFormToLogin = () => {
    changeFormType("LOGIN");
  };

  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.label} text="이름" />
        <TextInput style={styles.input} />
      </View>

      <View>
        <AppText style={styles.label} text="email 주소" />
        <TextInput style={styles.input} keyboardType="email-address" />
      </View>

      <View>
        <AppText style={styles.label} text="비밀번호" />
        <TextInput style={styles.input} secureTextEntry />
      </View>

      <View style={{ marginBottom: 30 }}>
        <AppText style={styles.label} text="비밀번호 확인" />
        <TextInput style={styles.input} secureTextEntry />
      </View>

      <AuthButton text="회원 가입하기" onPress={onSubmit} />

      <AppText style={styles.orText} text="OR" />

      <TouchableOpacity style={styles.googleButton}>
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
  signupButton: {
    backgroundColor: "#fbc02d",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  signupAppText: {
    color: "black",
    fontWeight: "bold",
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

export default SignUpForm;
