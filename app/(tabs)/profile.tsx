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
import { MaterialIcons } from "@expo/vector-icons";

const ProfileTab = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [nickname, setNickname] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNickname = async () => {
    if (!user) return;
    
    try {
      const userNickname = await nicknameService.getUserNickname(user.id);
      setNickname(userNickname);
    } catch (error) {
      console.error("Error fetching nickname:", error);
      setNickname(nicknameService.generateDefaultNickname(user.id));
    }
  };

  const handleEditNickname = () => {
    setNewNickname(nickname.startsWith('#') ? nickname.substring(1) : nickname);
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

      const success = await nicknameService.updateNickname(user.id, newNickname);
      if (success) {
        const updatedNickname = nicknameService.formatNicknameForDisplay(newNickname);
        setNickname(updatedNickname);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchNickname();
    }, [user])
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
              <AppText style={styles.username} text={nickname || "#loading..."} />
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

        <AppText style={styles.sectionTitle} text="Achievements" />
        <View style={styles.achievementsContainer}>
          <TouchableOpacity
            style={styles.achievementBox}
            onPress={OnPressRecord}
          >
            <AppText style={styles.achievementLabel} text="연속 공부 기록" />
            <AppText style={styles.achievementNumber} text="12일" />
          </TouchableOpacity>
          <View style={styles.achievementBox}>
            <AppText style={styles.achievementLabel} text="외운 단어수" />
            <AppText style={styles.achievementNumber} text="243" />
          </View>
        </View>
        <View style={styles.tierContainer}>
          <View style={styles.tierBox}>
            <AppText style={styles.tierLabel} text="티어" />
            <AppText style={styles.tierText} text="Sage" />
          </View>
          <Image
            style={styles.tierImage}
            source={require("@/assets/images/sage.png")}
          />
        </View>

        <View style={styles.badgesContainer}>
          {[
            {
              title: "Sage",
              level: 3,
              image: require("@/assets/images/sage.png"),
            },
            {
              title: "Knight",
              level: 2,
              image: require("@/assets/images/knight.png"),
            },
            {
              title: "Apprentice",
              level: 1,
              image: require("@/assets/images/apprentice.png"),
            },
          ].map((badge, index) => (
            <View key={index} style={styles.badgeBox}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={badge.image} style={styles.badgeImage} />
                <View style={{ marginLeft: 10 }}>
                  <AppText style={styles.badgeTitle} text={badge.title} />
                  <AppText
                    style={styles.badgeLevel}
                    text={`Level ${badge.level}`}
                  />
                </View>
              </View>
              <View>
                <AppText style={styles.rank} text="순위" />
              </View>
            </View>
          ))}
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
              <AppText style={styles.inputHint} text="영문, 숫자, 한글, 밑줄(_) 사용 가능 (3-20자)" />
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
                disabled={loading || !newNickname.trim()}
              >
                <AppText 
                  style={[
                    styles.saveButtonText,
                    (!newNickname.trim() || loading) && styles.disabledButtonText
                  ]} 
                  text={loading ? "저장 중..." : "저장"} 
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
  tierBox: {},
  tierText: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  tierImage: { width: 90, height: 90, borderRadius: 10 },
  badgesContainer: { marginBottom: 20 },
  badgeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeTitle: { fontSize: 16, fontWeight: "bold" },
  badgeLevel: { fontSize: 14, color: "gray" },
  rank: {
    color: "black",
    fontWeight: "bold",
    backgroundColor: "#E8EDF2",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  badgeImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  
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
});

export default ProfileTab;
