import { FormType as FormTypeEnum } from "@/types/auth";
import React, { useState } from "react";
import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";
import GuestForm from "./GuestForm";
import BottomSheet from "@gorhom/bottom-sheet";

interface FormProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const Form = ({ bottomSheetRef }: FormProps) => {
  const [formType, setFormType] = useState<FormTypeEnum>("GUEST");

  const changeFormType = (type: FormTypeEnum) => {
    setFormType(type);
    if (type === "LOGIN") {
      // 로그인 폼으로 변경될 때 BottomSheet 높이 조정
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 100);
    }
  };

  if (formType === "GUEST") {
    return (
      <GuestForm
        changeFormType={changeFormType}
        bottomSheetRef={bottomSheetRef}
      />
    );
  }
  if (formType === "SIGNUP") {
    return (
      <SignUpForm
        changeFormType={changeFormType}
        bottomSheetRef={bottomSheetRef}
      />
    );
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
