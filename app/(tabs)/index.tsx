import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";
import VocabularyCard from "@/components/home/VocabularyCard";
import OverlayModal from "@/components/common/OverlayModal";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";

interface LayoutInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Index = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"word" | "meaning" | null>(null);
  const [vocabularyList, setVocabularyList] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [highlightedLayout, setHighlightedLayout] = useState<LayoutInfo | null>(
    null
  );

  const cardsRefs = useRef<Array<View | null>>([]);
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
  useFocusEffect(() => {
    fetchData();
  });

  const onAdd = () => {
    router.push("/add");
  };

  // 각 카드의 절대 위치를 측정합니다.
  const handleCardLongPress = (index: number) => {
    const cardRef = cardsRefs.current[index];
    if (cardRef) {
      cardRef.measureInWindow((x, y, width, height) => {
        setHighlightedLayout({ x, y, width, height });
        setHighlightedIndex(index);
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OverlayModal
        visible={highlightedIndex !== null && highlightedLayout !== null}
        onRequestClose={() => {
          setHighlightedIndex(null);
          setHighlightedLayout(null);
        }}
      >
        {highlightedIndex !== null && highlightedLayout !== null && (
          <View
            style={[
              styles.highlightedCardContainer,
              {
                top: highlightedLayout.y,
                left: highlightedLayout.x,
                width: highlightedLayout.width,
                height: highlightedLayout.height,
              },
            ]}
          >
            <VocabularyCard
              word={vocabularyList[highlightedIndex].word}
              meaning={vocabularyList[highlightedIndex].meaning}
              group={vocabularyList[highlightedIndex].group}
              example={vocabularyList[highlightedIndex].example}
              mode={mode}
            />
          </View>
        )}
      </OverlayModal>
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
                style={mode === "meaning" ? { color: "white" } : undefined}
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
            <View key={idx} ref={(ref) => (cardsRefs.current[idx] = ref)}>
              <VocabularyCard
                word={item.word}
                meaning={item.meaning}
                group={item.group}
                example={item.example}
                mode={mode}
                onLongPress={() => handleCardLongPress(idx)}
                onPressOut={() => {
                  setHighlightedIndex(null);
                  setHighlightedLayout(null);
                }}
              />
            </View>
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
    paddingHorizontal: 24,
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },
  activeMode: {
    backgroundColor: Colors.primary,
  },
  highlightedCardContainer: {
    position: "absolute",
    zIndex: 10,
  },
});

export default Index;
