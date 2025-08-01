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
  const { user, isGuest } = useAuth();

  // TanStack Query hooks
  const {
    data: vocabularyList = [],
    isLoading: loading,
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
      // Only prefetch if not already cached and user is logged in or guest
      if (user || isGuest) {
        // Prefetch only the filters that are likely to be used
        if (currentFilter !== "all") prefetchVocabulary("all");
        if (currentFilter !== "memorized") prefetchVocabulary("memorized");
        if (currentFilter !== "unmemorized") prefetchVocabulary("unmemorized");
      }
    }, [prefetchVocabulary, user, isGuest, currentFilter])
  );

  // Get filter display text
  const getFilterText = (filter: "all" | "memorized" | "unmemorized") => {
    switch (filter) {
      case "memorized":
        return "Memorized Words";
      case "unmemorized":
        return "Unmemorized";
      case "all":
      default:
        return "All";
    }
  };

  const onAdd = () => {
    router.push("/add");
  };

  const handleDeleteVocabulary = async (index: number) => {
    if (!user && !isGuest) {
      console.log("사용자가 로그인되지 않았습니다.");
      return;
    }

    const item = vocabularyList[index];
    if (!item?.id) {
      console.error("No word ID to delete.");
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

  // 에러 상태 처리
  if (error) {
    console.error("Vocabulary query error:", error);
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <AppText
            text="An error occurred while loading data"
            style={styles.errorText}
          />
          <AppText
            text={error.message || "Unknown error"}
            style={styles.errorDetailText}
          />
        </View>
      </SafeAreaView>
    );
  }

  // 로딩 상태 처리
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <AppText text="Loading..." style={styles.loadingText} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.filterButtonContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Octicons name="stack" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.add}>
          <Pressable onPress={onAdd}>
            <AntDesign name="plus" size={32} color="black" />
          </Pressable>
        </View>
      </View>
      <View style={styles.container}>
        <AppText style={styles.title} text="Vocabulary" />
        <View style={styles.topbar}>
          <AppText
            style={styles.filterStatusText}
            text={`${getFilterText(currentFilter)} (${vocabularyList.length})`}
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
                text="Words"
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
                text="Meanings"
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
              text="Tap the + button above"
              style={styles.emptyMessageText}
            />
            <AppText
              text="to add your first word!"
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
            <AppText style={styles.modalTitle} text="Select Filter" />

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
                text="All"
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
                text="Memorized Words"
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
                text="Unmemorized"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowFilterModal(false)}
            >
              <AppText style={styles.modalCancelText} text="Cancel" />
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
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 3,
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
    width: 48,
    height: 48,
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
    padding: 14,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    paddingLeft: 2,
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

  // Error and loading styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
  },
  errorDetailText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});

export default Index;
