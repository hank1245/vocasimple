import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/utils/supabase";

GoogleSignin.configure({
  iosClientId: process.env.GOOGLE_CLOUD_CLIENT_ID_IOS,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken || userInfo.data?.idToken;
    if (idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) throw error;
      return { data };
    } else {
      throw new Error("No ID token present!");
    }
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // 사용자가 로그인 취소
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // 이미 진행 중
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // Play Services 오류
    }
    return { error };
  }
}
