import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";
import VocabularyCard from "@/components/home/VocabularyCard";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";

const Index = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"word" | "meaning" | null>("word");
  const [vocabularyList, setVocabularyList] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("vocabulary")
        .select("word, meaning, group, example");
      if (error) {
        console.error("Error fetching vocabulary:", error);
        return;
      }
      setVocabularyList(data);
    };
    fetchData();
  }, []);

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
                style={[
                  styles.modeText,
                  mode === "word" ? { color: "white" } : undefined,
                ]}
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
                style={[
                  styles.modeText,
                  mode === "meaning" ? { color: "white" } : undefined,
                ]}
                text="뜻만"
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingVertical: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {vocabularyList.map((item, idx) => (
            <VocabularyCard
              key={idx}
              word={item.word}
              meaning={item.meaning}
              group={item.group}
              example={item.example}
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
  modeText: {
    fontWeight: "800",
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },
  activeMode: {
    backgroundColor: Colors.primary,
  },
});

export default Index;
