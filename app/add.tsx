import React from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors } from "@/constants/Colors";
import AppText from "@/components/common/AppText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const AddScreen = () => {
  const onCreateExample = () => {};

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="close" size={34} color="black" />
          <Entypo name="check" size={30} color={Colors.primary} />
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label} text="단어" />
          <TextInput style={styles.input} />
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label} text="뜻" />
          <TextInput style={styles.input} />
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label} text="예문(선택)" />
          <TextInput style={styles.input} />
          <TouchableOpacity style={styles.aiButton} onPress={onCreateExample}>
            <FontAwesome5 name="pen-nib" size={20} color="#6D60F8" />
            <AppText style={styles.aiText} text="AI로 예문 생성하기" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label} text="그룹(선택)" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingRight: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B3B4B6",
    marginBottom: 4,
  },
  input: {
    height: 41,
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: "#DDDFE2",
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  aiText: {
    fontSize: 15,
    marginLeft: 4,
  },
  picker: {
    height: 40,
    borderColor: "lightgray",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
});

export default AddScreen;
