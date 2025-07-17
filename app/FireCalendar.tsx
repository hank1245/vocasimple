import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "@/components/common/AppText";
import { learningStreakService } from "@/utils/learningStreak";
import { getCurrentUser } from "@/stores/authStore";
const windowWidth = Dimensions.get("window").width;

const FireCalendar = () => {
  const router = useRouter();
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalFireCount, setTotalFireCount] = useState(0);

  const fetchStreakData = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const [markedDatesData, maxStreakData, currentStreakData, totalFireCountData] = await Promise.all([
        learningStreakService.getMarkedDates(user.id),
        learningStreakService.getMaxStreak(user.id),
        learningStreakService.getCurrentStreak(user.id),
        learningStreakService.getTotalFireCount(user.id),
      ]);

      setMarkedDates(markedDatesData || {});
      setMaxStreak(maxStreakData || 0);
      setCurrentStreak(currentStreakData || 0);
      setTotalFireCount(totalFireCountData || 0);
    } catch (error) {
      console.error("Error fetching streak data:", error);
      // Set default values on error
      setMarkedDates({});
      setMaxStreak(0);
      setCurrentStreak(0);
      setTotalFireCount(0);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStreakData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("@/assets/images/flame.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>불꽃 달력</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: "center" }}>
        <Calendar
          style={{ width: windowWidth - 30 }}
          markingType={"custom"}
          markedDates={markedDates}
          current={new Date().toISOString().split("T")[0]}
          onDayPress={(day: any) => {
            console.log("selected day", day);
          }}
          monthFormat={"yyyy MM"}
          onMonthChange={(month: any) => {
            console.log("month changed", month);
          }}
          hideDayNames={false}
          showWeekNumbers={false}
          onPressArrowLeft={(subtractMonth: any) => subtractMonth()}
          onPressArrowRight={(addMonth: any) => addMonth()}
        />
      </View>
      <View style={styles.record}>
        <View>
          <AppText text="최대 연속 기록" style={styles.recordText} />
          <AppText text="획득한 불꽃 수" style={styles.recordText} />
          <AppText text="현재 연속 기록" style={styles.recordText} />
        </View>
        <View>
          <AppText text={`${maxStreak}일`} style={styles.recordText} />
          <AppText text={`${totalFireCount}개`} style={styles.recordText} />
          <AppText text={`${currentStreak}일`} style={styles.recordText} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 50,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  record: {
    flexDirection: "row",
    padding: 35,
    justifyContent: "space-between",
  },
  recordText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default FireCalendar;
