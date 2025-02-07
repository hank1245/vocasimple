import { FormType } from '@/types/auth'
import { create } from 'zustand'

interface AuthState {
  formType: FormType
  setLogin: () => void
  setSignUp: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
    formType: 'SIGNUP',
    setSignUp: () => set((state) => ({formType: 'LOGIN'})),
    setLogin: () => set((state) => ({formType: 'SIGNUP'}))
}))