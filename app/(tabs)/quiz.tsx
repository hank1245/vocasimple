// QuizTab.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
} from "react-native";

const questions = [
  {
    id: 1,
    question: 'What is the Korean word for "star"?',
    options: ["豈", "스타", "달", "태양"],
    correctAnswer: "스타",
  },
  {
    id: 2,
    question: 'What is the Korean word for "moon"?',
    options: ["豈", "스타", "달", "태양"],
    correctAnswer: "달",
  },
  {
    id: 3,
    question: 'What is the Korean word for "sun"?',
    options: ["豈", "스타", "달", "태양"],
    correctAnswer: "태양",
  },
  {
    id: 4,
    question: 'What is the English word for "豈"?',
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

const QuizTab = () => {
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
      // Handle quiz completion
      alert("Quiz completed!");
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{item.question}</Text>
      {item.options.map((option: any, idx: number) => (
        <TouchableOpacity key={idx} style={styles.optionButton}>
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  return (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  progressBarContainer: {
    height: 10,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#76c7c0",
    borderRadius: 5,
  },
  questionContainer: {
    width: 360, // Fixed width in pixels
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "black",
  },
  optionButton: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
    color: "black",
  },
  continueButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#76c7c0",
    borderRadius: 5,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});

export default QuizTab;
