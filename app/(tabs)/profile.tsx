import { Colors } from "./../../constants/Colors";
import React from "react";
import {
  View,
  Image,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";

const ProfileTab = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View>
          <AppText text="My Profile" style={styles.header} />
        </View>
        <View style={styles.profileHeader}>
          <View>
            <AppText style={styles.profileName} text="김철수" />
            <AppText style={styles.username} text="#cutehorangi" />
            <AppText style={styles.joinDate} text="2025년 1월에 가입" />
          </View>
        </View>
        <TouchableOpacity style={styles.buttonContainer}>
          <AppText
            text="변경하기"
            style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
          />
        </TouchableOpacity>

        <AppText style={styles.sectionTitle} text="Achievements" />
        <View style={styles.achievementsContainer}>
          <View style={styles.achievementBox}>
            <AppText style={styles.achievementNumber} text="12일" />
            <AppText style={styles.achievementLabel} text="연속 공부 기록" />
          </View>
          <View style={styles.achievementBox}>
            <AppText style={styles.achievementNumber} text="243" />
            <AppText style={styles.achievementLabel} text="외운 단어수" />
          </View>
        </View>
        <View style={styles.tierContainer}>
          <AppText style={styles.tierLabel} text="티어" />
          <View style={styles.tierBox}>
            <AppText style={styles.tierText} text="Sage" />
            <Image
              source={{ uri: "https://via.placeholder.com/50" }}
              style={styles.tierImage}
            />
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          {[
            { title: "Sage", level: 3 },
            { title: "Knight", level: 2 },
            { title: "Appentice", level: 1 },
          ].map((badge, index) => (
            <View key={index} style={styles.badgeBox}>
              <AppText style={styles.badgeTitle} text={badge.title} />
              <AppText
                style={styles.badgeLevel}
                text={`Level ${badge.level}`}
              />
              <AppText style={styles.rank} text="순위" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9F9F9" },
  container: { flex: 1, padding: 20, backgroundColor: "#F9F9F9" },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileName: { fontSize: 22, fontWeight: "bold" },
  username: { color: "gray", fontSize: 15 },
  joinDate: { color: "gray", fontSize: 15 },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  achievementsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  achievementBox: {
    flex: 1,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  achievementNumber: { fontSize: 22, fontWeight: "bold" },
  achievementLabel: { fontSize: 14, color: "gray" },
  tierContainer: { marginBottom: 20, backgroundColor: "red" },
  tierLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  tierBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
  },
  tierText: { fontSize: 18, fontWeight: "bold" },
  tierImage: { width: 40, height: 40, borderRadius: 5 },
  badgesContainer: { marginBottom: 20 },
  badgeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeTitle: { fontSize: 16, fontWeight: "bold" },
  badgeLevel: { fontSize: 14, color: "gray" },
  rank: { color: "gray" },
});

export default ProfileTab;
