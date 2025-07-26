import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "@/stores/authStore";
import { VocabularyWord } from "@/types/common";
import AppText from "@/components/common/AppText";
import { Toast } from "toastify-react-native";
import { Colors } from "@/constants/Colors";
import { learningStreakService } from "@/utils/learningStreak";
import ToastManager from "toastify-react-native";
import {
  useVocabulary,
  useMarkWordsAsMemorized,
  useMarkWordsAsUnmemorized,
} from "@/hooks/useVocabularyQuery";

const WritingPracticeScreen = () => {
  const router = useRouter();
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<VocabularyWord[]>([]);
  const [correctWordsIds, setCorrectWordsIds] = useState<string[]>([]);
  const [wrongWordsIds, setWrongWordsIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress] = useState(new Animated.Value(0));

  // TanStack Query hook for marking words as memorized
  const { data: vocabularyData = [], isLoading: vocabularyLoading } =
    useVocabulary("all");
  const markWordsAsMemorizedMutation = useMarkWordsAsMemorized();
  const markWordsAsUnmemorizedMutation = useMarkWordsAsUnmemorized();

  const getTypedLetterColor = (letter: string, index: number) => {
    const currentWord = vocabularyWords[currentQuestionIndex];
    if (!currentWord) return "#000"; // Default color if word is undefined
    
    const correctWord = currentWord.word.toLowerCase();
    const userLetter = letter.toLowerCase();
    const correctLetter = correctWord?.charAt(index)?.toLowerCase();

    if (userLetter === correctLetter) {
      return "#4CAF50"; // Green for correct
    } else {
      return "#f44336"; // Red for incorrect
    }
  };

  const renderTypedText = () => {
    const currentWord = vocabularyWords[currentQuestionIndex];
    if (!currentWord) return null; // Return null if word is undefined
    
    return userInput.split("").map((letter, index) => (
      <Text
        key={index}
        style={[
          styles.typedLetter,
          { color: getTypedLetterColor(letter, index) },
        ]}
      >
        {letter}
      </Text>
    ));
  };

  const handleHint = () => {
    setShowHint(true);
  };

  const handleSubmit = () => {
    if (showFeedback || userInput.trim() === "") return;

    const currentWord = vocabularyWords[currentQuestionIndex];
    if (!currentWord) return; // Early return if word is undefined
    
    const correct =
      userInput.toLowerCase().trim() === currentWord.word.toLowerCase();

    setIsCorrect(correct);
    setShowFeedback(true);

    let newCorrectAnswers = correctAnswers;
    let newWrongAnswers = [...wrongAnswers];

    if (correct) {
      newCorrectAnswers = correctAnswers + 1;
      setCorrectAnswers(newCorrectAnswers);

      // Add correct word ID to the list for later memorization
      if (currentWord.id) {
        setCorrectWordsIds((prev) => [...prev, currentWord.id]);
      }
    } else {
      newWrongAnswers = [...wrongAnswers, currentWord];
      setWrongAnswers(newWrongAnswers);
      
      // Mark wrong word as unmemorized if it was previously memorized
      if (currentWord.is_memorized && currentWord.id) {
        setWrongWordsIds((prev) => [...prev, currentWord.id]);
      }
    }

    const delay = correct ? 1000 : 2000;
    setTimeout(() => {
      // Get the updated IDs including the current answer
      const updatedCorrectIds = correct && currentWord.id ? [...correctWordsIds, currentWord.id] : correctWordsIds;
      const updatedWrongIds = !correct && currentWord.is_memorized && currentWord.id ? [...wrongWordsIds, currentWord.id] : wrongWordsIds;
      
      handleContinue(newCorrectAnswers, newWrongAnswers, updatedCorrectIds, updatedWrongIds);
    }, delay);
  };

  const handleContinue = (
    finalCorrectAnswers?: number,
    finalWrongAnswers?: VocabularyWord[],
    finalCorrectWordsIds?: string[],
    finalWrongWordsIds?: string[]
  ) => {
    if (currentQuestionIndex < vocabularyWords.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      Animated.timing(progress, {
        toValue: ((nextIndex + 1) / vocabularyWords.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();

      setUserInput("");
      setShowHint(false);
      setShowFeedback(false);
    } else {
      // Award fire streak when writing practice is completed
      const user = getCurrentUser();
      if (user) {
        learningStreakService.addTodayCompletion(user.id);

        // Use passed arrays or fallback to component state
        const finalCorrectIds = finalCorrectWordsIds !== undefined ? finalCorrectWordsIds : correctWordsIds;
        const finalWrongIds = finalWrongWordsIds !== undefined ? finalWrongWordsIds : wrongWordsIds;

        // Mark correct words as memorized
        if (finalCorrectIds.length > 0) {
          markWordsAsMemorizedMutation.mutate(finalCorrectIds, {
            onSuccess: () => {
              console.log(
                `Marked ${finalCorrectIds.length} words as memorized`
              );
            },
            onError: (error) => {
              console.error("Error marking words as memorized:", error);
            },
          });
        }

        // Mark wrong words as unmemorized
        if (finalWrongIds.length > 0) {
          markWordsAsUnmemorizedMutation.mutate(finalWrongIds, {
            onSuccess: () => {
              console.log(`Marked ${finalWrongIds.length} words as unmemorized`);
            },
            onError: (error) => {
              console.error("Error marking words as unmemorized:", error);
            },
          });
        }
      }

      router.push({
        pathname: "/WritingPracticeResult",
        params: {
          totalQuestions: vocabularyWords.length.toString(),
          correctAnswers: (finalCorrectAnswers ?? correctAnswers).toString(),
          wrongAnswers: JSON.stringify(finalWrongAnswers ?? wrongAnswers),
        },
      });
    }
  };

  useEffect(() => {
    // Process vocabulary data when it's loaded
    if (!vocabularyLoading && vocabularyData && vocabularyData.length > 0) {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      try {
        const shuffledWords = vocabularyData.sort(() => Math.random() - 0.5);
        const selectedWords = shuffledWords.slice(
          0,
          Math.min(5, shuffledWords.length)
        );
        setVocabularyWords(selectedWords);

        Animated.timing(progress, {
          toValue: 20,
          duration: 300,
          useNativeDriver: false,
        }).start();

        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        Alert.alert(
          "오류",
          "단어를 불러오는 중 오류가 발생했습니다.",
          [
            {
              text: "확인",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } else if (
      !vocabularyLoading &&
      vocabularyData !== undefined &&
      vocabularyData.length === 0
    ) {
      console.log("No vocabulary words found, showing alert");
      Alert.alert(
        "단어 없음",
        "저장한 단어가 없어요! 단어를 더 모아보세요!",
        [
          {
            text: "확인",
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [vocabularyLoading, vocabularyData, router, progress]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AppText
            style={styles.loadingText}
            text="Writing Practice를 준비하고 있어요..."
          />
        </View>
      </SafeAreaView>
    );
  }

  if (vocabularyWords.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AppText
            style={styles.loadingText}
            text="Writing Practice를 생성할 수 없습니다."
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = vocabularyWords[currentQuestionIndex];
  const canSubmit = userInput.trim().length > 0 && !showFeedback;

  // If currentWord is undefined, show loading or error state
  if (!currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AppText
            style={styles.loadingText}
            text="단어를 불러오는 중..."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="close" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <AppText
          style={styles.questionCounter}
          text={`${currentQuestionIndex + 1}/${vocabularyWords.length}`}
        />
      </View>

      <View style={styles.questionContainer}>
        <AppText style={styles.meaningText} text={currentWord.meaning} />

        <View style={styles.inputContainer}>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={[
                styles.textInput,
                showFeedback && styles.textInputDisabled,
              ]}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="단어를 입력하세요..."
              placeholderTextColor="#999"
              editable={!showFeedback}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <View style={styles.typedTextOverlay}>{renderTypedText()}</View>
          </View>

          {showHint && (
            <AppText
              style={styles.hintText}
              text={`힌트: ${currentWord.word.charAt(0).toUpperCase()}...`}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.hintButton, showHint && styles.hintButtonUsed]}
            onPress={handleHint}
            disabled={showHint || showFeedback}
          >
            <Ionicons
              name="bulb"
              size={20}
              color={showHint ? "#999" : Colors.primary}
            />
            <AppText
              style={[
                styles.hintButtonText,
                showHint && styles.hintButtonTextUsed,
              ]}
              text="힌트"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <AppText
              style={[
                styles.submitButtonText,
                !canSubmit && styles.submitButtonTextDisabled,
              ]}
              text="Submit"
            />
          </TouchableOpacity>
        </View>

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <AppText
              style={[
                styles.feedbackText,
                isCorrect ? styles.correctText : styles.wrongText,
              ]}
              text={
                isCorrect
                  ? "Correct!"
                  : `Wrong! The answer was: ${currentWord.word}`
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  questionCounter: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  meaningText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 60,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 40,
  },
  textInputWrapper: {
    position: "relative",
  },
  textInput: {
    fontSize: 24,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    textAlign: "center",
    color: "transparent",
  },
  textInputDisabled: {
    backgroundColor: "#f5f5f5",
  },
  typedTextOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    pointerEvents: "none",
  },
  typedLetter: {
    fontSize: 24,
    fontWeight: "bold",
  },
  hintText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  hintButtonUsed: {
    backgroundColor: "#f5f5f5",
  },
  hintButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
  hintButtonTextUsed: {
    color: "#999",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButtonTextDisabled: {
    color: "#999",
  },
  feedbackContainer: {
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  correctText: {
    color: "#4CAF50",
  },
  wrongText: {
    color: "#f44336",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});

export default WritingPracticeScreen;
