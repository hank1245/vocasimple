import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import AppText from "@/components/common/AppText";
import { VocabularyWord } from "@/types/common";

const QuizResultScreen = () => {
  const router = useRouter();
  const { totalQuestions, correctAnswers, wrongAnswers } =
    useLocalSearchParams<{
      totalQuestions: string;
      correctAnswers: string;
      wrongAnswers: string;
    }>();

  const wrongAnswersList: VocabularyWord[] = wrongAnswers
    ? JSON.parse(wrongAnswers)
    : [];

  const handleDone = () => {
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.header}>
          <AppText style={styles.title} text="Quiz Result" />
          <AppText
            style={styles.score}
            text={`${correctAnswers}/${totalQuestions}`}
          />
        </View>

        {wrongAnswersList.length > 0 && (
          <View style={styles.wrongSection}>
            <AppText style={styles.sectionTitle} text="틀린 문제" />
            {wrongAnswersList.map((word, index) => (
              <View key={index} style={styles.wrongItem}>
                <AppText style={styles.wrongWord} text={word.word} />
                <AppText style={styles.wrongMeaning} text={word.meaning} />
              </View>
            ))}
          </View>
        )}

        {wrongAnswersList.length === 0 && (
          <View style={styles.perfectSection}>
            <AppText
              style={styles.perfectText}
              text="완벽해요! 모든 문제를 맞혔습니다!"
            />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <AppText style={styles.doneButtonText} text="Done" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  score: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.primary,
  },
  wrongSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  wrongItem: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignSelf: "center",
  },
  wrongWord: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 5,
  },
  wrongMeaning: {
    fontSize: 16,
    color: "#666",
  },
  perfectSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  perfectText: {
    fontSize: 24,
    textAlign: "center",
    color: Colors.primary,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default QuizResultScreen;
