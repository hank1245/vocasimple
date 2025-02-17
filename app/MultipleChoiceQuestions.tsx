import QuestionItem from "@/components/quiz/QuestionItem";
import { Colors } from "./../constants/Colors";
import React, { useState, useRef } from "react";
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
import { Dimensions } from "react-native";
import { wordQuestions, meaningQuestions } from "../constants/questions.ts";
const windowWidth = Dimensions.get("window").width;

const MultipleChoiceQuestionsScreen = () => {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: "meaning" | "word" }>();
  const questions = mode === "word" ? wordQuestions : meaningQuestions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [selected, setSelected] = useState(null);
  const flatListRef = useRef<FlatList>(null);

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      Animated.timing(progress, {
        toValue: ((currentQuestionIndex + 1) / questions.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setSelected(null);
    } else {
      alert("Quiz completed!");
    }
  };

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
          ref={flatListRef}
          data={questions}
          renderItem={({ item }) => (
            <QuestionItem
              item={item}
              selected={selected}
              setSelected={setSelected}
              handleContinue={handleContinue}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentQuestionIndex}
          getItemLayout={(data, index) => ({
            length: windowWidth,
            offset: (windowWidth - 30) * index,
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
    marginBottom: 24,
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
    marginBottom: 40,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
});

export default MultipleChoiceQuestionsScreen;
