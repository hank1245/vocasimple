import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";
import VocabularyCard from "@/components/home/VocabularyCard";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useAuth, getCurrentUser } from "@/stores/authStore";

const Index = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"word" | "meaning" | null>("word");
  const [vocabularyList, setVocabularyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);

  // Zustand store에서 사용자 정보 가져오기
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    // 전역 상태에서 사용자 정보 확인
    const currentUser = getCurrentUser();
    if (!currentUser || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    try {
      console.log("Fetching vocabulary data for user:", currentUser.id);

      const { data, error } = await supabase
        .from("vocabulary")
        .select("word, meaning, group, example")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("데이터 가져오기 에러:", error);
        return;
      }

      console.log("Vocabulary data fetched:", data?.length || 0, "items");
      setVocabularyList(data || []);
    } catch (error) {
      console.error("fetchData 에러:", error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchData();
      }
    }, [fetchData, user])
  );

  const onAdd = () => {
    router.push("/add");
  };

  const handleDeleteVocabulary = async (index: number) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log("사용자가 로그인되지 않았습니다.");
      return;
    }

    const item = vocabularyList[index];

    try {
      const { error } = await supabase
        .from("vocabulary")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("word", item.word)
        .eq("meaning", item.meaning);

      if (error) {
        console.error("삭제 에러:", error);
        return;
      }

      // 로컬 상태 업데이트
      setVocabularyList((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("handleDeleteVocabulary 에러:", error);
    }
  };

  const handleEditVocabulary = (index: number) => {
    const item = vocabularyList[index];
    router.push({
      pathname: "/EditVocabulary",
      params: {
        word: item.word,
        meaning: item.meaning,
        example: item.example || "",
        group: item.group,
        originalWord: item.word, // For database update identification
      },
    });
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
        {vocabularyList && vocabularyList.length > 0 ? (
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
                onDelete={() => handleDeleteVocabulary(idx)}
                onEdit={() => handleEditVocabulary(idx)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyMessageContainer}>
            <AppText
              text="상단의 + 버튼을 눌러"
              style={styles.emptyMessageText}
            />
            <AppText
              text="단어를 추가해 보세요!"
              style={styles.emptyMessageText}
            />
          </View>
        )}
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
    marginBottom: 20,
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
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMessageText: {
    fontSize: 20,
    color: "gray",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Index;
