import { Colors } from "@/constants/Colors";
import React from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import AppText from "@/components/common/AppText";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const QuizScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.padding}>
        <AppText style={styles.title} text="Quiz" />

        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="list" size={34} color="white" />
            <AppText style={styles.cardText} text="뜻 맞추기" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="text" size={34} color="white" />
            <AppText style={styles.cardText} text="단어 맞추기" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <MaterialCommunityIcons
              name="cards-outline"
              size={34}
              color="white"
            />
            <AppText style={styles.cardText} text="플래시카드" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="play" size={34} color="white" />
            <AppText style={styles.cardText} text="자동재생" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <AppText
            style={styles.progressText}
            text="매일 퀴즈를 달성하고 불꽃을 밝혀세요!"
          />

          <Image
            source={require("../../assets/images/flame.png")}
            style={styles.flameIcon}
          />
          <AppText
            style={styles.progressSubText}
            text={`이번 달 획득한 불꽃: 4/30`}
          />
        </View>
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

export default QuizScreen;
