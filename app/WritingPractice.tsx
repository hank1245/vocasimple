import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import { getCurrentUser } from "@/stores/authStore";
import { VocabularyWord } from "@/types/common";
import AppText from "@/components/common/AppText";
import { Toast } from "toastify-react-native";
import { Colors } from "@/constants/Colors";
import { learningStreakService } from "@/utils/learningStreak";

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
  const [isLoading, setIsLoading] = useState(true);
  const [progress] = useState(new Animated.Value(0));

  const fetchVocabularyWords = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .select("word, meaning, group, example")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error fetching vocabulary:", error);
        return;
      }

      if (!data || data.length === 0) {
        Toast.error("저장한 단어가 없어요! 단어를 더 모아보세요!");
        router.back();
        return;
      }

      const shuffledWords = data.sort(() => Math.random() - 0.5);
      const selectedWords = shuffledWords.slice(0, Math.min(5, shuffledWords.length));
      setVocabularyWords(selectedWords);
      
      Animated.timing(progress, {
        toValue: 20,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error("Error:", error);
      Toast.error("단어를 불러오는 중 오류가 발생했습니다.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [router, progress]);

  const getTypedLetterColor = (letter: string, index: number) => {
    const correctWord = vocabularyWords[currentQuestionIndex]?.word.toLowerCase();
    const userLetter = letter.toLowerCase();
    const correctLetter = correctWord?.charAt(index)?.toLowerCase();

    if (userLetter === correctLetter) {
      return "#4CAF50"; // Green for correct
    } else {
      return "#f44336"; // Red for incorrect
    }
  };

  const renderTypedText = () => {
    const correctWord = vocabularyWords[currentQuestionIndex]?.word.toLowerCase();
    return userInput.split("").map((letter, index) => (
      <Text
        key={index}
        style={[
          styles.typedLetter,
          { color: getTypedLetterColor(letter, index) }
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
    const correct = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);

    let newCorrectAnswers = correctAnswers;
    let newWrongAnswers = [...wrongAnswers];

    if (correct) {
      newCorrectAnswers = correctAnswers + 1;
      setCorrectAnswers(newCorrectAnswers);
    } else {
      newWrongAnswers = [...wrongAnswers, currentWord];
      setWrongAnswers(newWrongAnswers);
    }

    const delay = correct ? 1000 : 2000;
    setTimeout(() => {
      handleContinue(newCorrectAnswers, newWrongAnswers);
    }, delay);
  };

  const handleContinue = (finalCorrectAnswers?: number, finalWrongAnswers?: VocabularyWord[]) => {
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
    fetchVocabularyWords();
  }, [fetchVocabularyWords]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText} text="Writing Practice를 준비하고 있어요..." />
        </View>
      </SafeAreaView>
    );
  }

  if (vocabularyWords.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText} text="Writing Practice를 생성할 수 없습니다." />
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = vocabularyWords[currentQuestionIndex];
  const canSubmit = userInput.trim().length > 0 && !showFeedback;

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
              style={[styles.textInput, showFeedback && styles.textInputDisabled]}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="단어를 입력하세요..."
              placeholderTextColor="#999"
              editable={!showFeedback}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <View style={styles.typedTextOverlay}>
              {renderTypedText()}
            </View>
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
            <Ionicons name="bulb" size={20} color={showHint ? "#999" : Colors.primary} />
            <AppText 
              style={[styles.hintButtonText, showHint && styles.hintButtonTextUsed]} 
              text="힌트" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <AppText 
              style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]} 
              text="Submit" 
            />
          </TouchableOpacity>
        </View>

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <AppText 
              style={[styles.feedbackText, isCorrect ? styles.correctText : styles.wrongText]} 
              text={isCorrect ? "Correct!" : `Wrong! The answer was: ${currentWord.word}`} 
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