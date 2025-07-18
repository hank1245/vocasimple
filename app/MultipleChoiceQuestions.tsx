import { Colors } from "./../constants/Colors";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getCurrentUser } from "@/stores/authStore";
import { useVocabularyStore } from "@/stores/vocabularyStore";
import { VocabularyWord, QuizQuestion } from "@/types/common";
import AppText from "@/components/common/AppText";
import { Toast } from "toastify-react-native";
import { learningStreakService } from "@/utils/learningStreak";
import { memorizedService } from "@/utils/memorizedService";

const MultipleChoiceQuestionsScreen = () => {
  const router = useRouter();
  const { mode, filter } = useLocalSearchParams<{ 
    mode: "meaning" | "word";
    filter: "all" | "unmemorized";
  }>();
  
  // Use vocabulary store
  const { getFilteredVocabulary, markWordsAsMemorized, markWordsAsUnmemorized } = useVocabularyStore();
  
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<VocabularyWord[]>([]);
  const [correctWordsIds, setCorrectWordsIds] = useState<string[]>([]);
  const [wrongWordsIds, setWrongWordsIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVocabularyWords = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      // Get filtered vocabulary from store
      const filterType = filter === "unmemorized" ? "unmemorized" : "all";
      const data = getFilteredVocabulary(filterType);

      if (!data || data.length < 4) {
        Toast.error("저장한 단어가 없어요! 단어를 더 모아보세요!");
        router.back();
        return;
      }

      setVocabularyWords(data);
      generateQuizQuestions(data);
    } catch (error) {
      console.error("Error:", error);
      Toast.error("단어를 불러오는 중 오류가 발생했습니다.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [router, filter, getFilteredVocabulary]);

  const generateQuizQuestions = (words: VocabularyWord[]) => {
    const questions: QuizQuestion[] = [];
    const totalQuestions = Math.min(5, words.length);
    const usedWords = new Set<string>();

    for (let i = 0; i < totalQuestions; i++) {
      let correctWord: VocabularyWord;
      do {
        correctWord = words[Math.floor(Math.random() * words.length)];
      } while (usedWords.has(correctWord.word));
      
      usedWords.add(correctWord.word);

      const wrongOptions = words
        .filter(w => w.word !== correctWord.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [correctWord, ...wrongOptions]
        .sort(() => Math.random() - 0.5);

      const question: QuizQuestion = {
        id: i + 1,
        question: correctWord.meaning,
        options: options.map(w => w.word),
        correctAnswer: correctWord.word,
        correctIndex: options.findIndex(w => w.word === correctWord.word),
      };

      questions.push(question);
    }

    setQuizQuestions(questions);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    let newCorrectAnswers = correctAnswers;
    let newWrongAnswers = [...wrongAnswers];
    let newCorrectWordsIds = [...correctWordsIds];
    let newWrongWordsIds = [...wrongWordsIds];

    if (correct) {
      newCorrectAnswers = correctAnswers + 1;
      setCorrectAnswers(newCorrectAnswers);
      
      // Add correct word ID to the list for later memorization
      const correctWord = vocabularyWords.find(w => w.word === currentQuestion.correctAnswer);
      if (correctWord && correctWord.id) {
        newCorrectWordsIds = [...correctWordsIds, correctWord.id];
        setCorrectWordsIds(newCorrectWordsIds);
      }
    } else {
      const wrongWord = vocabularyWords.find(w => w.word === currentQuestion.correctAnswer);
      if (wrongWord) {
        newWrongAnswers = [...wrongAnswers, wrongWord];
        setWrongAnswers(newWrongAnswers);
        
        // If this is "All Words" mode and the word was previously memorized, mark it as unmemorized
        if (filter === "all" && wrongWord.is_memorized && wrongWord.id) {
          newWrongWordsIds = [...wrongWordsIds, wrongWord.id];
          setWrongWordsIds(newWrongWordsIds);
        }
      }
    }

    setTimeout(() => {
      handleContinue(newCorrectAnswers, newWrongAnswers, newCorrectWordsIds, newWrongWordsIds);
    }, 1000);
  };

  const handleContinue = (finalCorrectAnswers?: number, finalWrongAnswers?: VocabularyWord[], finalCorrectWordsIds?: string[], finalWrongWordsIds?: string[]) => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      Animated.timing(progress, {
        toValue: ((nextIndex + 1) / quizQuestions.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Award fire streak when quiz is completed
      const user = getCurrentUser();
      if (user) {
        learningStreakService.addTodayCompletion(user.id);
        
        // Use passed arrays or fallback to component state
        const correctIds = finalCorrectWordsIds || correctWordsIds;
        const wrongIds = finalWrongWordsIds || wrongWordsIds;

        // Mark correct words as memorized
        if (correctIds.length > 0) {
          markWordsAsMemorized(correctIds)
            .then(success => {
              if (success) {
                console.log(`Marked ${correctIds.length} words as memorized`);
              }
            })
            .catch(error => {
              console.error("Error marking words as memorized:", error);
            });
        }

        // Mark wrong words as unmemorized (for "All Words" mode)
        if (wrongIds.length > 0) {
          markWordsAsUnmemorized(wrongIds)
            .then(success => {
              if (success) {
                console.log(`Marked ${wrongIds.length} words as unmemorized`);
              }
            })
            .catch(error => {
              console.error("Error marking words as unmemorized:", error);
            });
        }
      }
      
      router.push({
        pathname: "/QuizResult",
        params: {
          totalQuestions: quizQuestions.length.toString(),
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText} text="퀴즈를 준비하고 있어요..." />
        </View>
      </SafeAreaView>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText} text="퀴즈 문제를 생성할 수 없습니다." />
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.goBackButton}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="close" size={30} color="black" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.container}>
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

        <View style={styles.questionContainer}>
          <AppText 
            style={styles.questionCounter} 
            text={`${currentQuestionIndex + 1}/${quizQuestions.length}`} 
          />
          
          <AppText style={styles.questionText} text={currentQuestion.question} />
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option && styles.selectedOption,
                  showFeedback && option === currentQuestion.correctAnswer && styles.correctOption,
                  showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer && styles.wrongOption,
                ]}
                onPress={() => handleAnswerSelect(option)}
                disabled={showFeedback}
              >
                <AppText 
                  style={[
                    styles.optionText,
                    selectedAnswer === option && styles.selectedOptionText,
                    showFeedback && option === currentQuestion.correctAnswer && styles.correctOptionText,
                  ]} 
                  text={option} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {showFeedback && (
            <View style={styles.feedbackContainer}>
              <AppText 
                style={[styles.feedbackText, isCorrect ? styles.correctText : styles.wrongText]} 
                text={isCorrect ? "Correct!" : "Wrong!"} 
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  goBackButton: {
    marginLeft: 20,
    marginBottom: 24,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  progressBarContainer: {
    height: 10,
    width: "100%",
    backgroundColor: "#D1DBE8",
    borderRadius: 5,
    marginBottom: 40,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 5,
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
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCounter: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: "#f0f0ff",
  },
  correctOption: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e8",
  },
  wrongOption: {
    borderColor: "#f44336",
    backgroundColor: "#ffebee",
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  correctOptionText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  feedbackContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  correctText: {
    color: "#4CAF50",
  },
  wrongText: {
    color: "#f44336",
  },
});

export default MultipleChoiceQuestionsScreen;
