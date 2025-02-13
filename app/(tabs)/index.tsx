import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";
import VocabularyCard from "@/components/home/VocabularyCard";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

const Index = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"word" | "meaning" | null>(null);

  const vocabularyList = [
    { word: "run", meaning: "달리다", subItems: [] },
    { word: "moon", meaning: "달", subItems: [] },
    { word: "star", meaning: "별, 스타", subItems: [] },
    { word: "tree", meaning: "나무", subItems: [] },
  ];

  const onAdd = () => {
    router.push("/add");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.add}>
        <Pressable onPress={onAdd}>
          <AntDesign name="plus" size={32} color="black" />
        </Pressable>
      </View>
      <View style={styles.container}>
        <View style={styles.topbar}>
          <AppText style={styles.title} text="Vocabulary" />
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[styles.modeButton, mode === "word" && styles.activeMode]}
              onPress={() => setMode((m) => (m === "word" ? null : "word"))}
            >
              <AppText
                style={mode === "word" ? { color: "white" } : undefined}
                text="단어만"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "meaning" && styles.activeMode,
              ]}
              onPress={() =>
                setMode((m) => (m === "meaning" ? null : "meaning"))
              }
            >
              <AppText
                style={mode === "meaning" ? { color: "white" } : undefined}
                text="뜻만"
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          {vocabularyList.map((item, idx) => (
            <VocabularyCard
              key={idx}
              word={item.word}
              meaning={item.meaning}
              subItems={item.subItems}
              mode={mode}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  add: {
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 30,
    alignItems: "flex-end",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  modeButtons: {
    flexDirection: "row",
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },
  activeMode: {
    backgroundColor: Colors.primary,
  },
});

export default Index;
