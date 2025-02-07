import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import AuthButton from "./AuthButton";
import Guidance from "./Guidance";
import AppText from "../AppText";
import { useAuthStore } from "@/stores/useAuthStore";

interface Props {
  bottomSheetRef: any;
}

const Form = ({ bottomSheetRef }: Props) => {
  const formType = useAuthStore((state) => state.formType);
  const onSubmit = () => {};
  if (formType === "SIGNUP") {
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
        <Guidance
          guide="이미 계정이 있으신가요?"
          link="로그인"
          color="black"
          bottomSheetRef={bottomSheetRef}
        />
      </View>
    );
  }
  if (formType === "LOGIN") {
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
        <Guidance
          guide="아직 계정이 없으신가요?"
          link="회원가입"
          color="black"
          bottomSheetRef={bottomSheetRef}
        />
      </View>
    );
  }
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
});

export default Form;
