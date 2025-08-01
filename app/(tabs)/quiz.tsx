import { Colors } from "@/constants/Colors";
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "@/components/common/AppText";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { QuizMode } from "@/types/common";
import { learningStreakService } from "@/utils/learningStreak";
import { getCurrentUser, useAuth } from "@/stores/authStore";

const QuizTab = () => {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const [currentMonthCount, setCurrentMonthCount] = useState(0);
  const [totalDaysInMonth, setTotalDaysInMonth] = useState(0);
  const [showQuizFilterModal, setShowQuizFilterModal] = useState(false);
  const [selectedQuizMode, setSelectedQuizMode] = useState<QuizMode>("meaning");
  const [scaleAnim] = useState(new Animated.Value(1));
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const fetchFireCount = async () => {
    if (isGuest) {
      // 게스트 모드에서는 기본값 설정
      setCurrentMonthCount(0);
      setTotalDaysInMonth(learningStreakService.getCurrentMonthTotalDays());
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const monthCount = await learningStreakService.getCurrentMonthCount(
        currentUser.id
      );
      const totalDays = learningStreakService.getCurrentMonthTotalDays();

      setCurrentMonthCount(monthCount || 0);
      setTotalDaysInMonth(totalDays || 0);
    } catch (error) {
      console.error("Error fetching fire count:", error);
      // Set default values on error
      setCurrentMonthCount(0);
      setTotalDaysInMonth(learningStreakService.getCurrentMonthTotalDays());
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFireCount();
    }, [])
  );

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      try {
        if (animationRef.current) {
          animationRef.current.stop();
        }
      } catch (error) {
        console.warn("Error stopping animation:", error);
      }
    };
  }, []);

  const handleNavigateToMultipleChoiceQuestions = (mode: QuizMode) => {
    setSelectedQuizMode(mode);
    setShowQuizFilterModal(true);
  };

  const handleQuizFilterSelect = (filter: "all" | "unmemorized") => {
    setShowQuizFilterModal(false);
    router.push({
      pathname: "/MultipleChoiceQuestions",
      params: {
        mode: selectedQuizMode,
        filter: filter,
      },
    });
  };

  const handleFireCalendarPress = () => {
    // Add scale animation for press feedback
    animationRef.current = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
    animationRef.current.start();

    router.push("/FireCalendar");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.padding}>
        <AppText style={styles.title} text="Quiz" />

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigateToMultipleChoiceQuestions("meaning")}
          >
            <Ionicons name="list" size={34} color="white" />
            <AppText style={styles.cardText} text="Meaning Match" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigateToMultipleChoiceQuestions("word")}
          >
            <Ionicons name="text" size={34} color="white" />
            <AppText style={styles.cardText} text="Word Match" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/Flashcard")}
          >
            <MaterialCommunityIcons
              name="cards-outline"
              size={34}
              color="white"
            />
            <AppText style={styles.cardText} text="Flashcard" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/WritingPractice")}
          >
            <Entypo name="pencil" size={34} color="white" />
            <AppText style={styles.cardText} text="Writing Practice" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.progressContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.progressTouchable}
            onPress={isGuest ? undefined : handleFireCalendarPress}
            activeOpacity={isGuest ? 1 : 0.8}
          >
            <View style={styles.progressHeader}>
              <AppText
                style={styles.progressText}
                text={
                  isGuest
                    ? "Sign up and manage your learning records!"
                    : "Complete daily quizzes and light up flames!"
                }
              />
            </View>

            <Image
              source={require("@/assets/images/flame.png")}
              style={styles.flameIcon}
            />
            <AppText
              style={styles.progressSubText}
              text={
                isGuest
                  ? "Guest Mode"
                  : `Flames earned this month: ${currentMonthCount}/${totalDaysInMonth}`
              }
            />

            {!isGuest && (
              <View style={styles.clickHint}>
                <AppText style={styles.clickHintText} text="View Calendar" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Quiz Filter Modal */}
      <Modal
        visible={showQuizFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuizFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle} text="Quiz Settings" />

            <AppText
              style={styles.modalSubtitle}
              text="Which words would you like to use for the quiz?"
            />

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleQuizFilterSelect("unmemorized")}
            >
              <Ionicons name="book-outline" size={24} color={Colors.primary} />
              <View style={styles.filterOptionText}>
                <AppText
                  style={styles.filterOptionTitle}
                  text="Unmemorized Words Only"
                />
                <AppText
                  style={styles.filterOptionSubtitle}
                  text="Quiz with words you haven't memorized yet"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleQuizFilterSelect("all")}
            >
              <Ionicons
                name="library-outline"
                size={24}
                color={Colors.primary}
              />
              <View style={styles.filterOptionText}>
                <AppText style={styles.filterOptionTitle} text="All Words" />
                <AppText
                  style={styles.filterOptionSubtitle}
                  text="Quiz with all saved words"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowQuizFilterModal(false)}
            >
              <AppText style={styles.modalCancelText} text="Cancel" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 36,
  },
  padding: {
    paddingHorizontal: 30,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 100,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 10,
  },
  cardText: {
    color: "white",
    fontSize: 15,
    marginTop: 5,
    fontWeight: "bold",
  },
  progressContainer: {
    marginTop: 50,
    backgroundColor: "#EDF0F3",
    borderRadius: 20,
    height: "40%",
    // Add subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTouchable: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  flameIcon: {
    width: 82,
    height: 85,
    marginTop: 20,
    marginBottom: 20,
  },
  progressSubText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  clickHint: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 2,
  },
  clickHintText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "700",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  filterOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  filterOptionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});

export default QuizTab;
