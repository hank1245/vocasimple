import { FormType as FormTypeEnum } from "@/types/auth";
import React, { useState } from "react";
import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";
import BottomSheet from "@gorhom/bottom-sheet";

interface FormProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const Form = ({ bottomSheetRef }: FormProps) => {
  const [formType, setFormType] = useState<FormTypeEnum>("SIGNUP");

  const changeFormType = (type: FormTypeEnum) => {
    setFormType(type);
    if (type === "LOGIN") {
      // 로그인 폼으로 변경될 때 BottomSheet 높이 조정
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 100);
    }
  };

  if (formType === "SIGNUP") {
    return <SignUpForm changeFormType={changeFormType} />;
  }
  if (formType === "LOGIN") {
    return (
      <LoginForm
        changeFormType={changeFormType}
        bottomSheetRef={bottomSheetRef}
      />
    );
  }
  return null;
};

export default Form;
