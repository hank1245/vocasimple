import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "@/components/common/AppText";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { QuizMode } from "@/types/common";
import { learningStreakService } from "@/utils/learningStreak";
import { getCurrentUser } from "@/stores/authStore";

const QuizTab = () => {
  const router = useRouter();
  const [currentMonthCount, setCurrentMonthCount] = useState(0);
  const [totalDaysInMonth, setTotalDaysInMonth] = useState(0);

  const fetchFireCount = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const monthCount = await learningStreakService.getCurrentMonthCount(user.id);
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

  const handleNavigateToMultipleChoiceQuestions = (mode: QuizMode) => {
    router.push({
      pathname: "/MultipleChoiceQuestions",
      params: { mode },
    });
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
            <AppText style={styles.cardText} text="뜻 맞추기" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigateToMultipleChoiceQuestions("word")}
          >
            <Ionicons name="text" size={34} color="white" />
            <AppText style={styles.cardText} text="단어 맞추기" />
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
            <AppText style={styles.cardText} text="플래시카드" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push("/WritingPractice")}
          >
            <Entypo name="pencil" size={34} color="white" />
            <AppText style={styles.cardText} text="Writing Practice" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.progressContainer}
          onPress={() => router.push("/FireCalendar")}
        >
          <AppText
            style={styles.progressText}
            text="매일 퀴즈를 달성하고 불꽃을 밝히세요!"
          />

          <Image
            source={require("@/assets/images/flame.png")}
            style={styles.flameIcon}
          />
          <AppText
            style={styles.progressSubText}
            text={`이번 달 획득한 불꽃: ${currentMonthCount}/${totalDaysInMonth}`}
          />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    height: "40%",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  flameIcon: {
    width: 82,
    height: 89,
    marginTop: 30,
    marginBottom: 25,
  },
  progressSubText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QuizTab;
