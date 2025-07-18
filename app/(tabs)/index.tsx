import React, { useState, useCallback } from "react";
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
import { useAuth } from "@/stores/authStore";
import {
  useVocabulary,
  useDeleteWord,
  usePrefetchVocabulary,
} from "@/hooks/useVocabularyQuery";
import { VocabularyWord } from "@/types/common";

const Index = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"word" | "meaning" | null>("word");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<
    "all" | "memorized" | "unmemorized"
  >("all");

  // Zustand stores
  const { user } = useAuth();

  // TanStack Query hooks
  const {
    data: vocabularyList = [],
    isLoading: loading,
    refetch: refetchVocabulary,
    error,
  } = useVocabulary(currentFilter);

  const deleteWordMutation = useDeleteWord();
  const { prefetchVocabulary } = usePrefetchVocabulary();

  // Handle filter selection
  const handleFilterSelect = (filter: "all" | "memorized" | "unmemorized") => {
    setCurrentFilter(filter);
    setShowFilterModal(false);
  };

  // Prefetch other filter data when component mounts (only once)
  useFocusEffect(
    useCallback(() => {
      // Only prefetch if not already cached and user is logged in
      if (user) {
        // Prefetch only the filters that are likely to be used
        if (currentFilter !== "all") prefetchVocabulary("all");
        if (currentFilter !== "memorized") prefetchVocabulary("memorized");
        if (currentFilter !== "unmemorized") prefetchVocabulary("unmemorized");
      }
    }, [prefetchVocabulary, user, currentFilter])
  );

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

  const onAdd = () => {
    router.push("/add");
  };

  const handleDeleteVocabulary = async (index: number) => {
    if (!user) {
      console.log("사용자가 로그인되지 않았습니다.");
      return;
    }

    const item = vocabularyList[index];
    if (!item?.id) {
      console.error("삭제할 단어 ID가 없습니다.");
      return;
    }

    try {
      await deleteWordMutation.mutateAsync(item.id);
    } catch (error) {
      console.error("handleDeleteVocabulary 에러:", error);
    }
  };

  const handleEditVocabulary = (index: number) => {
    const item = vocabularyList[index];
    router.push({
      pathname: "/EditVocabulary",
      params: {
        id: item.id,
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
          <AppText
            style={styles.filterStatusText}
            text={`${getFilterText(currentFilter)} (${
              vocabularyList.length
            }개)`}
          />
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
            {vocabularyList.map((item: VocabularyWord, idx: number) => (
              <VocabularyCard
                key={idx}
                word={item.word}
                meaning={item.meaning}
                group={item.group}
                example={item.example}
                mode={mode}
                isMemorized={item.is_memorized}
                currentFilter={currentFilter}
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
              style={[
                styles.filterOption,
                currentFilter === "all" && styles.selectedFilterOption,
              ]}
              onPress={() => handleFilterSelect("all")}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  currentFilter === "all" && styles.selectedFilterText,
                ]}
                text="전체"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                currentFilter === "memorized" && styles.selectedFilterOption,
              ]}
              onPress={() => handleFilterSelect("memorized")}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  currentFilter === "memorized" && styles.selectedFilterText,
                ]}
                text="암기됨"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                currentFilter === "unmemorized" && styles.selectedFilterOption,
              ]}
              onPress={() => handleFilterSelect("unmemorized")}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  currentFilter === "unmemorized" && styles.selectedFilterText,
                ]}
                text="암기 안됨"
              />
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
