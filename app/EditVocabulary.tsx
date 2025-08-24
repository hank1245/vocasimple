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
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors } from "@/constants/Colors";
import AppText from "@/components/common/AppText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/stores/authStore";
import Toast from "toastify-react-native";
import { aiExampleService } from "@/utils/aiExampleService";
import { useUpdateWord } from "@/hooks/useVocabularyQuery";

const EditVocabularyScreen = () => {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const params = useLocalSearchParams();

  // Extract parameters passed from the card
  const initialWord = params.word as string;
  const initialMeaning = params.meaning as string;
  const initialExample = params.example as string;
  const initialGroup = params.group as string;

  const [word, setWord] = useState(initialWord || "");
  const [meaning, setMeaning] = useState(initialMeaning || "");
  const [example, setExample] = useState(initialExample || "");
  const [selectedGroup] = useState(initialGroup || "기본");
  const [aiLoading, setAiLoading] = useState(false);

  // TanStack Query hook for updating words
  const updateWordMutation = useUpdateWord();

  const onCreateExample = async () => {
    if (!word.trim() || !meaning.trim()) {
      Alert.alert("알림", "단어와 뜻을 먼저 입력해주세요.");
      return;
    }

    setAiLoading(true);
    try {
      const result = await aiExampleService.generateExample(
        word.trim(),
        meaning.trim()
      );

      if (result.success && result.example) {
        setExample(result.example);
        // AI 예시가 생성되었습니다!
      } else {
        Alert.alert("오류", result.error || "예시 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("AI example generation error:", error);
      Alert.alert("오류", "예시 생성 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const onGoBack = () => {
    router.back();
  };

  const onSave = async () => {
    if (word.trim() === "" || meaning.trim() === "") {
      Alert.alert("알림", "단어 혹은 뜻 칸이 비었어요");
      return;
    }

    if (!user && !isGuest) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    try {
      await updateWordMutation.mutateAsync({
        wordId: params.id as string,
        updates: {
          word: word.trim(),
          meaning: meaning.trim(),
          example: example.trim(),
          group: selectedGroup,
        },
      });

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
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onGoBack}>
            <Ionicons name="close" size={34} color="black" />
          </Pressable>
          <AppText style={styles.headerTitle} text="단어 수정" />
          <Pressable onPress={updateWordMutation.isPending ? () => {} : onSave}>
            {updateWordMutation.isPending ? (
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
          {user && !isGuest && (
            <View style={styles.aiButton}>
              <TouchableOpacity
                style={[
                  styles.aiButtonContainer,
                  aiLoading && styles.aiButtonDisabled,
                ]}
                onPress={onCreateExample}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="#6D60F8" />
                ) : (
                  <FontAwesome5 name="pen-nib" size={20} color="#6D60F8" />
                )}
                <AppText
                  style={[styles.aiText, aiLoading && styles.aiTextDisabled]}
                  text={
                    aiLoading ? "AI로 예문 생성중..." : "AI로 예문 생성하기"
                  }
                />
              </TouchableOpacity>
            </View>
          )}
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
  aiButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  aiButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#e0e0e0",
  },
  aiText: {
    fontSize: 15,
    marginLeft: 4,
    color: "#6D60F8",
  },
  aiTextDisabled: {
    color: "#999",
  },
  picker: {
    borderRadius: 10,
    backgroundColor: "#DDDFE2",
  },
});

export default EditVocabularyScreen;
