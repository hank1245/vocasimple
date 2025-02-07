import { FormType } from "@/types/auth";
import { create } from "zustand";

interface AuthState {
  formType: FormType;
  setLogin: () => void;
  setSignUp: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  formType: "SIGNUP",
  setLogin: () => set({ formType: "LOGIN" }),
  setSignUp: () => set({ formType: "SIGNUP" }),
}));
