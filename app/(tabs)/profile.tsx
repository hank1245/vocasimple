import { Colors } from "./../../constants/Colors";
import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "@/components/common/AppText";
import { useRouter } from "expo-router";
import { useAuth } from "@/stores/authStore";
import { nicknameService } from "@/utils/nicknameService";
import { accountService } from "@/utils/accountService";
import { exportService } from "@/utils/exportService";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileTab = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Use centralized profile store
  const {
    nickname,
    tierInfo,
    memorizedCount,
    totalWords,
    streakData,
    leaderboardData,
    selectedTier,
    loading: profileLoading,
    nicknameLoading,
    fetchAllData,
    updateNickname,
    setSelectedTier,
    shouldRefetch,
  } = useUserProfileStore();

  const handleEditNickname = () => {
    setNewNickname(nickname.startsWith("#") ? nickname.substring(1) : nickname);
    setIsEditingNickname(true);
  };

  const handleSaveNickname = async () => {
    if (!user || !newNickname.trim()) return;

    setLoading(true);
    try {
      const validation = nicknameService.validateNickname(newNickname);
      if (!validation.isValid) {
        Alert.alert("오류", validation.error);
        setLoading(false);
        return;
      }

      const success = await updateNickname(newNickname);
      if (success) {
        setIsEditingNickname(false);
        Alert.alert("성공", "닉네임이 변경되었습니다.");
      } else {
        Alert.alert("오류", "닉네임 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
      Alert.alert("오류", "닉네임 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingNickname(false);
    setNewNickname("");
  };

  const handleTierSelect = (tier: "Sage" | "Knight" | "Apprentice") => {
    setSelectedTier(tier);
  };

  useFocusEffect(
    React.useCallback(() => {
      // Always fetch fresh data when screen comes into focus to ensure accuracy
      // This prevents stale data from showing after quiz completion
      if (user) {
        console.log("Profile screen focused, refreshing data");
        fetchAllData();
      }
    }, [user, fetchAllData])
  );

  const OnPressRecord = () => {
    router.push("/FireCalendar");
  };

  const handleSignOut = async () => {
    Alert.alert("로그아웃", "정말로 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleExportVocabulary = async () => {
    if (!user) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    Alert.alert(
      "단어 내보내기",
      `저장된 단어들을 CSV 파일로 내보내시겠습니까?\n\n파일 공유 화면에서 이메일이나 다른 앱으로 전송할 수 있습니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "내보내기",
          onPress: async () => {
            setIsExporting(true);
            try {
              const result = await exportService.exportVocabularyToEmail(
                user.id,
                user.email ?? ""
              );

              if (result.success) {
                Alert.alert(
                  "완료",
                  result.message || "단어 목록이 성공적으로 공유되었습니다."
                );
              } else {
                Alert.alert(
                  "오류",
                  result.error || "단어 내보내기 중 오류가 발생했습니다."
                );
              }
            } catch (error) {
              console.error("Export vocabulary error:", error);
              Alert.alert(
                "오류",
                "단어 내보내기 중 예상치 못한 오류가 발생했습니다."
              );
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "회원탈퇴",
      "정말 탈퇴하시겠습니까?\n\n계정이 삭제된 이후에는 복구할 수 없습니다.\n\n• 저장된 모든 단어\n• 학습 기록\n• 프로필 정보\n\n위 모든 데이터가 영구적으로 삭제됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            // 한 번 더 확인
            Alert.alert(
              "최종 확인",
              "정말로 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.",
              [
                { text: "취소", style: "cancel" },
                {
                  text: "삭제",
                  style: "destructive",
                  onPress: async () => {
                    setLoading(true);
                    try {
                      const result = await accountService.deleteAccount();
                      if (result.success) {
                        Alert.alert(
                          "완료",
                          "계정이 성공적으로 삭제되었습니다."
                        );
                        // 계정 삭제 후 로그아웃은 자동으로 처리됨
                      } else {
                        Alert.alert(
                          "오류",
                          result.error || "계정 삭제 중 오류가 발생했습니다."
                        );
                      }
                    } catch (error) {
                      console.error("Delete account error:", error);
                      Alert.alert(
                        "오류",
                        "계정 삭제 중 예상치 못한 오류가 발생했습니다."
                      );
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 70 }}
        style={styles.container}
      >
        <View>
          <AppText text="My Profile" style={styles.header} />
        </View>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <AppText
              style={styles.profileName}
              text={user?.email || "hank1234@gmail.com"}
            />
            <View style={styles.nicknameContainer}>
              <AppText
                style={styles.username}
                text={nickname || "#loading..."}
              />
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditNickname}
              >
                <MaterialIcons name="edit" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            <AppText style={styles.joinDate} text="2025년 1월에 가입" />
          </View>
        </View>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleSignOut}
        >
          <AppText
            text="로그아웃"
            style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportVocabulary}
          disabled={isExporting}
        >
          <MaterialIcons
            name="download"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <AppText
            text={isExporting ? "내보내는 중..." : "단어 저장하기"}
            style={[
              styles.exportButtonText,
              isExporting && styles.disabledText,
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          <AppText
            text={loading ? "처리 중..." : "회원탈퇴"}
            style={[styles.deleteAccountText, loading && styles.disabledText]}
          />
        </TouchableOpacity>

        <AppText style={styles.sectionTitle} text="Achievements" />
        <View style={styles.achievementsContainer}>
          <TouchableOpacity
            style={styles.achievementBox}
            onPress={OnPressRecord}
          >
            <AppText style={styles.achievementLabel} text="연속 공부 기록" />
            <AppText
              style={styles.achievementNumber}
              text={`${streakData.currentStreak}일`}
            />
          </TouchableOpacity>
          <View style={styles.achievementBox}>
            <AppText style={styles.achievementLabel} text="암기한 단어" />
            <AppText
              style={styles.achievementNumber}
              text={`${memorizedCount}개`}
            />
          </View>
        </View>
        <View style={styles.tierContainer}>
          <View style={styles.tierBox}>
            <AppText style={styles.tierLabel} text="현재 티어" />
            <AppText
              style={styles.tierText}
              text={tierInfo?.currentTier || "Apprentice"}
            />
            {tierInfo && tierInfo.nextTier !== "Max" && (
              <View style={styles.tierProgressContainer}>
                <AppText
                  style={styles.tierProgressText}
                  text={`${tierInfo.nextTier}까지 ${
                    tierInfo.nextTierRequirement - tierInfo.memorizedCount
                  }개 남음`}
                />
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${tierInfo.progressPercentage}%` },
                    ]}
                  />
                </View>
                <AppText
                  style={styles.tierProgressPercentage}
                  text={`${tierInfo.progressPercentage}%`}
                />
              </View>
            )}
          </View>
          <Image
            style={styles.tierImage}
            source={
              tierInfo?.currentTier === "Sage"
                ? require("@/assets/images/sage.png")
                : tierInfo?.currentTier === "Knight"
                ? require("@/assets/images/knight.png")
                : require("@/assets/images/apprentice.png")
            }
          />
        </View>

        <View style={styles.leaderboardContainer}>
          <AppText style={styles.leaderboardTitle} text="티어별 랭킹" />

          {/* Tier Selection Buttons */}
          <View style={styles.tierButtonsContainer}>
            {["Sage", "Knight", "Apprentice"].map((tier) => (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.tierButton,
                  selectedTier === tier && styles.selectedTierButton,
                ]}
                onPress={() =>
                  handleTierSelect(tier as "Sage" | "Knight" | "Apprentice")
                }
              >
                <Image
                  source={
                    tier === "Sage"
                      ? require("@/assets/images/sage.png")
                      : tier === "Knight"
                      ? require("@/assets/images/knight.png")
                      : require("@/assets/images/apprentice.png")
                  }
                  style={styles.tierButtonImage}
                />
                <AppText
                  style={[
                    styles.tierButtonText,
                    selectedTier === tier && styles.selectedTierButtonText,
                  ]}
                  text={tier}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Leaderboard List */}
          <View style={styles.leaderboardList}>
            {leaderboardData?.users.slice(0, 10).map((user, index) => (
              <View
                key={user.user_id}
                style={[
                  styles.leaderboardItem,
                  user.is_current_user && styles.currentUserItem,
                ]}
              >
                <View style={styles.leaderboardRank}>
                  <AppText
                    style={[
                      styles.rankText,
                      user.is_current_user && styles.currentUserText,
                    ]}
                    text={`#${user.rank}`}
                  />
                </View>
                <View style={styles.leaderboardUserInfo}>
                  <AppText
                    style={[
                      styles.leaderboardUserName,
                      user.is_current_user && styles.currentUserText,
                    ]}
                    text={user.nickname}
                  />
                  <AppText
                    style={[
                      styles.leaderboardUserScore,
                      user.is_current_user && styles.currentUserText,
                    ]}
                    text={`${user.memorized_count}개 암기`}
                  />
                </View>
                {user.is_current_user && (
                  <View style={styles.currentUserBadge}>
                    <AppText style={styles.currentUserBadgeText} text="나" />
                  </View>
                )}
              </View>
            ))}

            {leaderboardData?.users.length === 0 && (
              <View style={styles.emptyLeaderboard}>
                <AppText
                  style={styles.emptyLeaderboardText}
                  text="아직 이 티어에 사용자가 없습니다."
                />
              </View>
            )}
          </View>

          {/* Current User Stats */}
          {leaderboardData?.currentUserRank && (
            <View style={styles.currentUserStats}>
              <AppText
                style={styles.currentUserStatsText}
                text={`${selectedTier} 티어에서 ${leaderboardData.currentUserRank}위 (총 ${leaderboardData.totalUsers}명)`}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Nickname Edit Modal */}
      <Modal
        visible={isEditingNickname}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle} text="닉네임 변경" />

            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} text="새 닉네임" />
              <View style={styles.nicknameInputContainer}>
                <AppText style={styles.hashSymbol} text="#" />
                <TextInput
                  style={styles.nicknameInput}
                  value={newNickname}
                  onChangeText={setNewNickname}
                  placeholder="닉네임을 입력하세요"
                  placeholderTextColor="#999"
                  maxLength={20}
                  autoFocus={true}
                />
              </View>
              <AppText
                style={styles.inputHint}
                text="영문, 숫자, 한글, 밑줄(_) 사용 가능 (3-20자)"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <AppText style={styles.cancelButtonText} text="취소" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveNickname}
                disabled={loading || nicknameLoading || !newNickname.trim()}
              >
                <AppText
                  style={[
                    styles.saveButtonText,
                    (!newNickname.trim() || loading) &&
                      styles.disabledButtonText,
                  ]}
                  text={loading || nicknameLoading ? "저장 중..." : "저장"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  nicknameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  header: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileName: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  username: { color: "gray", fontSize: 16 },
  joinDate: { color: "gray", fontSize: 16, marginTop: 4 },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  achievementsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  achievementBox: {
    flex: 1,
    padding: 20,
    alignItems: "flex-start",
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#D1DBE8",
  },
  achievementNumber: { fontSize: 22, fontWeight: "bold" },
  achievementLabel: { fontSize: 16, marginBottom: 15 },
  tierContainer: {
    marginBottom: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1DBE8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  tierLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  tierBox: { flex: 1 },
  tierText: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  tierImage: { width: 90, height: 90, borderRadius: 10 },
  tierProgressContainer: {
    marginTop: 15,
  },
  tierProgressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  tierProgressPercentage: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  // Leaderboard styles
  leaderboardContainer: {
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tierButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tierButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    minWidth: 80,
  },
  selectedTierButton: {
    backgroundColor: Colors.primary,
  },
  tierButtonImage: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  tierButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  selectedTierButtonText: {
    color: "white",
  },
  leaderboardList: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 8,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  currentUserItem: {
    backgroundColor: Colors.primary + "20",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  leaderboardRank: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  leaderboardUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  leaderboardUserName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  leaderboardUserScore: {
    fontSize: 14,
    color: "#666",
  },
  currentUserText: {
    color: Colors.primary,
  },
  currentUserBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentUserBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyLeaderboard: {
    alignItems: "center",
    padding: 20,
  },
  emptyLeaderboardText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  currentUserStats: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  currentUserStatsText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
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
    minWidth: 300,
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
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  nicknameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  hashSymbol: {
    fontSize: 16,
    color: "#666",
    marginRight: 4,
  },
  nicknameInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  inputHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#ccc",
  },

  // Export Button styles
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 15,
  },
  exportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Delete Account Button styles
  deleteAccountButton: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#ff6b6b",
    padding: 10,
    borderRadius: 15,
    opacity: 1,
  },
  deleteAccountText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledText: {
    color: "#ccc",
  },
});

export default ProfileTab;
