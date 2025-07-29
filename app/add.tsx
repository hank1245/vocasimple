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
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors } from "@/constants/Colors";
import AppText from "@/components/common/AppText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { useAuth } from "@/stores/authStore";
import Toast from "toastify-react-native";
import { aiExampleService } from "@/utils/aiExampleService";
import { useCreateWord } from "@/hooks/useVocabularyQuery";

const AddScreen = () => {
  const { user, isGuest } = useAuth();
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("기본");
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();

  // TanStack Query hook for creating words
  const createWordMutation = useCreateWord();

  const onCreateExample = async () => {
    if (!word.trim() || !meaning.trim()) {
      Alert.alert("Notice", "Please enter word and meaning first.");
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
        console.log("AI example generated!");
      } else {
        Alert.alert("Error", result.error || "Failed to generate example.");
      }
    } catch (error) {
      console.error("AI example generation error:", error);
      Alert.alert("Error", "An error occurred while generating example.");
    } finally {
      setAiLoading(false);
    }
  };

  const onGoBack = () => {
    router.back();
  };

  const onSave = async () => {
    if (word.trim() === "" || meaning.trim() === "") {
      Alert.alert("Notice", "Word or meaning field is empty");
      return;
    }

    // 게스트 모드나 로그인 모드 모두 지원
    if (!user && !isGuest) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    try {
      await createWordMutation.mutateAsync({
        word: word.trim(),
        meaning: meaning.trim(),
        example: example.trim(),
        group: selectedGroup,
      });

      Alert.alert("Success", "Word has been saved.");
      setWord("");
      setMeaning("");
      setExample("");
    } catch (error) {
      console.error("저장 에러:", error);
      Alert.alert("오류", "저장 중 오류가 발생했습니다.");
    }
  };

  const handleBackgroundPress = (event: any) => {
    // Only dismiss keyboard if user taps on the background, not on input fields
    if (event.target === event.currentTarget) {
      Keyboard.dismiss();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleBackgroundPress}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={onGoBack}>
              <Ionicons name="close" size={34} color="black" />
            </Pressable>
            <Pressable
              onPress={createWordMutation.isPending ? () => {} : onSave}
            >
              {createWordMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Entypo name="check" size={30} color={Colors.primary} />
              )}
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label} text="Word" />
            <TextInput
              style={styles.input}
              value={word}
              onChangeText={setWord}
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label} text="Meaning" />
            <TextInput
              style={styles.input}
              value={meaning}
              onChangeText={setMeaning}
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label} text="Example (Optional)" />
            <TextInput
              style={styles.input}
              value={example}
              onChangeText={setExample}
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
                      aiLoading
                        ? "Generating example with AI..."
                        : "Generate example with AI"
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
    </TouchableWithoutFeedback>
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
    marginBottom: 30,
    paddingRight: 10,
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

export default AddScreen;
