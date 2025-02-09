import React from "react";
import { View, Image, Button, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: "https://via.placeholder.com/50" }}
            style={styles.profileImage}
          />
          <View>
            <AppText style={styles.profileName} text="김철수" />
            <AppText style={styles.username} text="#cutehorangi" />
            <AppText style={styles.joinDate} text="2025년 1월에 가입" />
          </View>
        </View>

        {/* Edit Button */}
        <View style={styles.buttonContainer}>
          <Button title="변경하기" color="#6C63FF" onPress={() => {}} />
        </View>

        {/* Achievements */}
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

        {/* Tier Section */}
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
            { title: "Champion", level: 3 },
            { title: "Photogenic", level: 2 },
            { title: "Sage", level: 1 },
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
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileName: { fontSize: 20, fontWeight: "bold" },
  username: { color: "gray" },
  joinDate: { color: "gray", fontSize: 12 },
  buttonContainer: { alignItems: "center", marginBottom: 20 },
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
  tierContainer: { marginBottom: 20 },
  tierLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  tierBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "white",
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

export default ProfileScreen;
