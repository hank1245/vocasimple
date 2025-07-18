import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/common/AppText";
import VocabularyCard from "@/components/home/VocabularyCard";
import { AntDesign, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useAuth, getCurrentUser } from "@/stores/authStore";

const Index = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"word" | "meaning" | null>("word");
  const [vocabularyList, setVocabularyList] = useState<any[]>([]);
  const [filteredVocabularyList, setFilteredVocabularyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "memorized" | "unmemorized">("all");
  const isLoadingRef = useRef(false);

  // Zustand store에서 사용자 정보 가져오기
  const { user } = useAuth();

  // Filter vocabulary list based on memorization status
  const applyFilter = useCallback((data: any[], filter: "all" | "memorized" | "unmemorized") => {
    let filtered = data;
    
    switch (filter) {
      case "memorized":
        filtered = data.filter(item => item.is_memorized === true);
        break;
      case "unmemorized":
        filtered = data.filter(item => item.is_memorized !== true);
        break;
      case "all":
      default:
        filtered = data;
        break;
    }
    
    setFilteredVocabularyList(filtered);
  }, []);

  // Handle filter selection
  const handleFilterSelect = (filter: "all" | "memorized" | "unmemorized") => {
    setSelectedFilter(filter);
    setShowFilterModal(false);
    applyFilter(vocabularyList, filter);
  };

  // Get filter display text
  const getFilterText = (filter: "all" | "memorized" | "unmemorized") => {
    switch (filter) {
      case "memorized":
        return "암기됨";
      case "unmemorized":
        return "암기 안됨";
      case "all":
      default:
        return "전체";
    }
  };

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
        .select("id, word, meaning, group, example, is_memorized")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("데이터 가져오기 에러:", error);
        return;
      }

      console.log("Vocabulary data fetched:", data?.length || 0, "items");
      setVocabularyList(data || []);
      applyFilter(data || [], selectedFilter);
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
      const newList = vocabularyList.filter((_, i) => i !== index);
      setVocabularyList(newList);
      applyFilter(newList, selectedFilter);
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
      <View style={styles.headerContainer}>
        <View style={styles.filterButtonContainer}>
          <AppText style={styles.filterLabel} text="Vocabulary" />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Octicons name="stack" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.add}>
          <Pressable onPress={onAdd}>
            <AntDesign name="plus" size={32} color="black" />
          </Pressable>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.topbar}>
          <AppText style={styles.filterStatusText} text={`${getFilterText(selectedFilter)} (${filteredVocabularyList.length}개)`} />
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
        {filteredVocabularyList && filteredVocabularyList.length > 0 ? (
          <ScrollView
            contentContainerStyle={{ paddingVertical: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredVocabularyList.map((item, idx) => (
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

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle} text="필터 선택" />
            
            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === "all" && styles.selectedFilterOption]}
              onPress={() => handleFilterSelect("all")}
            >
              <AppText style={[styles.filterOptionText, selectedFilter === "all" && styles.selectedFilterText]} text="전체" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === "memorized" && styles.selectedFilterOption]}
              onPress={() => handleFilterSelect("memorized")}
            >
              <AppText style={[styles.filterOptionText, selectedFilter === "memorized" && styles.selectedFilterText]} text="암기됨" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === "unmemorized" && styles.selectedFilterOption]}
              onPress={() => handleFilterSelect("unmemorized")}
            >
              <AppText style={[styles.filterOptionText, selectedFilter === "unmemorized" && styles.selectedFilterText]} text="암기 안됨" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowFilterModal(false)}
            >
              <AppText style={styles.modalCancelText} text="취소" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  filterButtonContainer: {
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  add: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
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
  filterStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedFilterOption: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  selectedFilterText: {
    color: "white",
    fontWeight: "600",
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
  },
});

export default Index;
