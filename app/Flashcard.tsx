import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const FlashcardScreen = () => {
  const router = useRouter();
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flipAnimation] = useState(new Animated.Value(0));
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
      const selectedWords = shuffledWords.slice(0, Math.min(10, shuffledWords.length));
      setVocabularyWords(selectedWords);
      
      Animated.timing(progress, {
        toValue: (1 / selectedWords.length) * 100,
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

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
      
      Animated.timing(progress, {
        toValue: ((currentCardIndex) / vocabularyWords.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleNext = () => {
    if (currentCardIndex < vocabularyWords.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
      
      Animated.timing(progress, {
        toValue: ((currentCardIndex + 2) / vocabularyWords.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleShuffle = () => {
    const shuffledWords = [...vocabularyWords].sort(() => Math.random() - 0.5);
    setVocabularyWords(shuffledWords);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    flipAnimation.setValue(0);
    
    Animated.timing(progress, {
      toValue: (1 / shuffledWords.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    flipAnimation.setValue(0);
    
    Animated.timing(progress, {
      toValue: (1 / vocabularyWords.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    fetchVocabularyWords();
  }, [fetchVocabularyWords]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText} text="플래시카드를 준비하고 있어요..." />
        </View>
      </SafeAreaView>
    );
  }

  if (vocabularyWords.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText} text="플래시카드를 생성할 수 없습니다." />
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = vocabularyWords[currentCardIndex];
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="close" size={30} color="black" />
        </TouchableOpacity>
        <AppText style={styles.title} text="플래시카드" />
        <View style={styles.placeholder} />
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
          style={styles.cardCounter} 
          text={`${currentCardIndex + 1}/${vocabularyWords.length}`} 
        />
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.card}
          onPress={handleCardFlip}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.cardFace, { opacity: frontOpacity }]}>
            <AppText style={styles.cardText} text={currentWord.word} />
            <AppText style={styles.cardHint} text="탭하여 뜻 보기" />
          </Animated.View>
          
          <Animated.View style={[styles.cardFace, styles.cardBack, { opacity: backOpacity }]}>
            <AppText style={styles.cardText} text={currentWord.meaning} />
            {currentWord.example && (
              <AppText style={styles.exampleText} text={currentWord.example} />
            )}
            <AppText style={styles.cardHint} text="탭하여 단어 보기" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentCardIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentCardIndex === 0 ? "#ccc" : Colors.primary} />
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShuffle}>
            <Ionicons name="shuffle" size={20} color={Colors.primary} />
            <AppText style={styles.actionButtonText} text="셔플" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleReset}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
            <AppText style={styles.actionButtonText} text="처음으로" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.navButton, currentCardIndex === vocabularyWords.length - 1 && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={currentCardIndex === vocabularyWords.length - 1}
        >
          <Ionicons name="chevron-forward" size={24} color={currentCardIndex === vocabularyWords.length - 1 ? "#ccc" : Colors.primary} />
        </TouchableOpacity>
      </View>

      {currentCardIndex === vocabularyWords.length - 1 && (
        <View style={styles.completeContainer}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => router.push("/(tabs)")}
          >
            <AppText style={styles.completeButtonText} text="완료" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 30,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  cardCounter: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.5,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  cardBack: {
    backgroundColor: "#f8f9fa",
  },
  cardText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  exampleText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  cardHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    position: "absolute",
    bottom: 30,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 20,
  },
  actionButton: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 5,
  },
  completeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  completeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  completeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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

export default FlashcardScreen;