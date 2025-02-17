import { Colors } from "./../constants/Colors";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

const meaningQuestions = [
  {
    id: 1,
    question: 'What is the Korean word for "star"?',
    options: ["킥", "스타", "달", "태양"],
    correctAnswer: "스타",
  },
  {
    id: 2,
    question: 'What is the Korean word for "moon"?',
    options: ["킥", "스타", "달", "태양"],
    correctAnswer: "달",
  },
  {
    id: 3,
    question: 'What is the Korean word for "sun"?',
    options: ["킥", "스타", "달", "태양"],
    correctAnswer: "태양",
  },
  {
    id: 4,
    question: 'What is the English word for "sdf"?',
    options: ["star", "moon", "sun", "tree"],
    correctAnswer: "star",
  },
  {
    id: 5,
    question: 'What is the English word for "달"?',
    options: ["star", "moon", "sun", "tree"],
    correctAnswer: "moon",
  },
];

const wordQuestions = [
  {
    id: 1,
    question: "킥",
    options: ["kick", "star", "mmon", "sun"],
    correctAnswer: "kick",
  },
  {
    id: 2,
    question: "킥",
    options: ["kick", "star", "mmon", "sun"],
    correctAnswer: "kick",
  },
  {
    id: 3,
    question: "킥",
    options: ["kick", "star", "mmon", "sun"],
    correctAnswer: "kick",
  },
  {
    id: 4,
    question: "킥",
    options: ["kick", "star", "mmon", "sun"],
    correctAnswer: "kick",
  },
  {
    id: 5,
    question: "킥",
    options: ["kick", "star", "mmon", "sun"],
    correctAnswer: "kick",
  },
];

const QuizTab = () => {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: "meaning" | "word" }>();
  const questions = mode === "word" ? wordQuestions : meaningQuestions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(new Animated.Value(0));

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      Animated.timing(progress, {
        toValue: ((currentQuestionIndex + 1) / questions.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      alert("Quiz completed!");
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{item.question}</Text>
      {item.options.map((option: any, idx: number) => (
        <TouchableOpacity key={idx} style={styles.optionButton}>
          <Text style={styles.optionText}>{option}</Text>
          <View style={styles.select}></View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

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
        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentQuestionIndex}
          getItemLayout={(data, index) => ({
            length: 360,
            offset: 360 * index,
            index,
          })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  goBackButton: {
    marginLeft: 20,
    marginBottom: 20,
  },
  goBackText: {
    fontSize: 16,
    marginLeft: 5,
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
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  questionContainer: {
    width: 360,
    padding: 16,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "black",
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#D1DBE8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "black",
  },
  select: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: "#D1DBE8",
    borderRadius: "50%",
    position: "relative",
  },
  continueButton: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    alignSelf: "center",
    marginTop: 16,
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});

export default QuizTab;
