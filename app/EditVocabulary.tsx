import React, { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors } from "@/constants/Colors";
import AppText from "@/components/common/AppText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { getCurrentUser } from "@/stores/authStore";
import Toast from "toastify-react-native";

const EditVocabularyScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract parameters passed from the card
  const initialWord = params.word as string;
  const initialMeaning = params.meaning as string;
  const initialExample = params.example as string;
  const initialGroup = params.group as string;
  const originalWord = params.originalWord as string; // For database update identification

  const [word, setWord] = useState(initialWord || "");
  const [meaning, setMeaning] = useState(initialMeaning || "");
  const [example, setExample] = useState(initialExample || "");
  const [selectedGroup, setSelectedGroup] = useState(initialGroup || "기본");
  const [loading, setLoading] = useState(false);

  const onCreateExample = () => {
    // AI example generation functionality can be added here
  };

  const onGoBack = () => {
    router.back();
  };

  const onSave = async () => {
    if (word.trim() === "" || meaning.trim() === "") {
      Alert.alert("알림", "단어 혹은 뜻 칸이 비었어요");
      return;
    }

    setLoading(true);

    const user = getCurrentUser();

    if (!user) {
      Alert.alert("오류", "로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("vocabulary")
        .update({
          word: word.trim(),
          meaning: meaning.trim(),
          example: example.trim(),
          group: selectedGroup,
        })
        .eq("user_id", user.id)
        .eq("word", originalWord); // Use original word for identification

      if (error) {
        console.error("업데이트 에러:", error);
        Alert.alert("오류", "업데이트 중 오류가 발생했습니다.");
        return;
      }

      Alert.alert("성공", "단어가 수정되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            router.back(); // Return to vocabulary list
          },
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("오류", "업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onGoBack}>
            <Ionicons name="close" size={34} color="black" />
          </Pressable>
          <AppText style={styles.headerTitle} text="단어 수정" />
          <Pressable onPress={loading ? () => {} : onSave}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Entypo name="check" size={30} color={Colors.primary} />
            )}
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label} text="단어" />
          <TextInput
            style={styles.input}
            value={word}
            onChangeText={setWord}
            onBlur={() => Keyboard.dismiss()}
            placeholder="단어를 입력하세요"
          />
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label} text="뜻" />
          <TextInput
            style={styles.input}
            value={meaning}
            onChangeText={setMeaning}
            onBlur={() => Keyboard.dismiss()}
            placeholder="뜻을 입력하세요"
          />
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label} text="예문(선택)" />
          <TextInput
            style={styles.input}
            value={example}
            onChangeText={setExample}
            onBlur={() => Keyboard.dismiss()}
            placeholder="예문을 입력하세요"
          />
          <View style={styles.aiButton}>
            <TouchableOpacity
              style={{ flexDirection: "row" }}
              onPress={onCreateExample}
            >
              <FontAwesome5 name="pen-nib" size={20} color="#6D60F8" />
              <AppText style={styles.aiText} text="AI로 예문 생성하기" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Toast
        duration={2000}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        position="bottom"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  groupContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B3B4B6",
    marginBottom: 4,
  },
  input: {
    height: 41,
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: "#DDDFE2",
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  aiText: {
    fontSize: 15,
    marginLeft: 4,
  },
  picker: {
    borderRadius: 10,
    backgroundColor: "#DDDFE2",
  },
});

export default EditVocabularyScreen;
