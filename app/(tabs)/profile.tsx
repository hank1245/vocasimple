import { Colors } from "./../../constants/Colors";
import React from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";
import { useRouter } from "expo-router";
import { useAuth } from "@/stores/authStore";

const ProfileTab = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const OnPressRecord = () => {
    router.push("/FireCalendar");
  };

  const handleSignOut = async () => {
    Alert.alert("로그아웃", "정말로 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 70 }}
        style={styles.container}
      >
        <View>
          <AppText text="My Profile" style={styles.header} />
        </View>
        <View style={styles.profileHeader}>
          <View>
            <AppText
              style={styles.profileName}
              text={user?.email || "hank1234@gmail.com"}
            />
            <AppText style={styles.username} text="#cutehorangi" />
            <AppText style={styles.joinDate} text="2025년 1월에 가입" />
          </View>
        </View>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleSignOut}
        >
          <AppText
            text="로그아웃"
            style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
          />
        </TouchableOpacity>

        <AppText style={styles.sectionTitle} text="Achievements" />
        <View style={styles.achievementsContainer}>
          <TouchableOpacity
            style={styles.achievementBox}
            onPress={OnPressRecord}
          >
            <AppText style={styles.achievementLabel} text="연속 공부 기록" />
            <AppText style={styles.achievementNumber} text="12일" />
          </TouchableOpacity>
          <View style={styles.achievementBox}>
            <AppText style={styles.achievementLabel} text="외운 단어수" />
            <AppText style={styles.achievementNumber} text="243" />
          </View>
        </View>
        <View style={styles.tierContainer}>
          <View style={styles.tierBox}>
            <AppText style={styles.tierLabel} text="티어" />
            <AppText style={styles.tierText} text="Sage" />
          </View>
          <Image
            style={styles.tierImage}
            source={require("@/assets/images/sage.png")}
          />
        </View>

        <View style={styles.badgesContainer}>
          {[
            {
              title: "Sage",
              level: 3,
              image: require("@/assets/images/sage.png"),
            },
            {
              title: "Knight",
              level: 2,
              image: require("@/assets/images/knight.png"),
            },
            {
              title: "Apprentice",
              level: 1,
              image: require("@/assets/images/apprentice.png"),
            },
          ].map((badge, index) => (
            <View key={index} style={styles.badgeBox}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={badge.image} style={styles.badgeImage} />
                <View style={{ marginLeft: 10 }}>
                  <AppText style={styles.badgeTitle} text={badge.title} />
                  <AppText
                    style={styles.badgeLevel}
                    text={`Level ${badge.level}`}
                  />
                </View>
              </View>
              <View>
                <AppText style={styles.rank} text="순위" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
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
  profileName: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  username: { color: "gray", fontSize: 16 },
  joinDate: { color: "gray", fontSize: 16, marginTop: 4 },
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
    padding: 20,
    alignItems: "flex-start",
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#D1DBE8",
  },
  achievementNumber: { fontSize: 22, fontWeight: "bold" },
  achievementLabel: { fontSize: 16, marginBottom: 15 },
  tierContainer: {
    marginBottom: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1DBE8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  tierLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  tierBox: {},
  tierText: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  tierImage: { width: 90, height: 90, borderRadius: 10 },
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
  rank: {
    color: "black",
    fontWeight: "bold",
    backgroundColor: "#E8EDF2",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  badgeImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
});

export default ProfileTab;
