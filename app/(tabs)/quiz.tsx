import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const QuizScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quiz</Text>

      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.card}>
          <Ionicons name="list" size={24} color="white" />
          <Text style={styles.cardText}>뜻 맞추기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Ionicons name="text" size={24} color="white" />
          <Text style={styles.cardText}>단어 맞추기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialCommunityIcons
            name="cards-outline"
            size={24}
            color="white"
          />
          <Text style={styles.cardText}>플래시카드</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.cardText}>자동재생</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          매일 퀴즈를 달성하고 불꽃을 밝혀세요!
        </Text>

        <Image
          source={require("../../assets/images/flame.png")}
          style={styles.flameIcon}
        />
        <Text style={styles.progressSubText}>
          이번 달 획득한 불꽃: <Text style={styles.boldText}>4/30</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    aspectRatio: 1.5,
    backgroundColor: "#6A5ACD",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    color: "white",
    fontSize: 16,
    marginTop: 5,
  },
  progressContainer: {
    marginTop: 30,
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  flameIcon: {
    width: 50,
    height: 50,
    marginVertical: 10,
  },
  progressSubText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
});

export default QuizScreen;
