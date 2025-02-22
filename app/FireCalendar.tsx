import React from "react";
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
import AppText from "@/components/common/AppText";
const windowWidth = Dimensions.get("window").width;

const FireCalendar = () => {
  const router = useRouter();

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
          markedDates={{
            "2025-02-17": {
              customStyles: {
                container: {
                  backgroundColor: "#FF7474",
                },
                text: {
                  color: "white",
                  fontWeight: "bold",
                },
              },
            },
            "2025-02-18": {
              customStyles: {
                container: {
                  backgroundColor: "#FF7474",
                },
                text: {
                  color: "white",
                  fontWeight: "bold",
                },
              },
            },
          }}
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
          <AppText text="12일" style={styles.recordText} />
          <AppText text="50개" style={styles.recordText} />
          <AppText text="3일" style={styles.recordText} />
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
