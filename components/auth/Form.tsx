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
  if (formType === "SIGNUP") {
    return <SignUpForm changeFormType={setFormType} />;
  }
  if (formType === "LOGIN") {
    return (
      <LoginForm changeFormType={setFormType} bottomSheetRef={bottomSheetRef} />
    );
  }
  return null;
};

export default Form;
