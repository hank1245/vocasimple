import React from "react";
import { TouchableOpacity, StyleSheet, Animated, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "@/components/common/AppText";

interface VocabularyCardProps {
  word: string;
  meaning: string;
  example?: string; // 문자열로 변경
  mode: "word" | "meaning" | null;
  onDelete?: () => void;
  onEdit?: () => void;
  group: string;
  isMemorized?: boolean;
  currentFilter?: "all" | "memorized" | "unmemorized";
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  meaning,
  example,
  mode,
  onDelete,
  onEdit,
  isMemorized = false,
  currentFilter = "all",
}) => {
  const wordOpacity = React.useRef(new Animated.Value(1)).current;
  const meaningOpacity = React.useRef(new Animated.Value(1)).current;
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null);

  // Swipe animation values
  const translateX = useSharedValue(0);
  const isDeleteVisible = useSharedValue(false);
  const isEditVisible = useSharedValue(false);

  React.useEffect(() => {
    if (mode === "word") {
      wordOpacity.setValue(1);
      meaningOpacity.setValue(0);
    } else if (mode === "meaning") {
      wordOpacity.setValue(0);
      meaningOpacity.setValue(1);
    } else {
      wordOpacity.setValue(1);
      meaningOpacity.setValue(1);
    }
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [mode]);

  const handlePress = () => {
    if (!mode) return;
    const targetOpacity = mode === "word" ? meaningOpacity : wordOpacity;
    if (timeoutId.current) clearTimeout(timeoutId.current);
    Animated.timing(targetOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    timeoutId.current = setTimeout(() => {
      Animated.timing(targetOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 2000);
  };

  const showDeleteIcon = () => {
    isDeleteVisible.value = true;
  };

  const hideDeleteIcon = () => {
    isDeleteVisible.value = false;
  };

  const showEditIcon = () => {
    isEditVisible.value = true;
  };

  const hideEditIcon = () => {
    isEditVisible.value = false;
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    // Reset position after delete
    translateX.value = withSpring(0);
    hideDeleteIcon();
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    // Reset position after edit
    translateX.value = withSpring(0);
    hideEditIcon();
  };

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: () => {
        // Start gesture
      },
      onActive: (event) => {
        // Allow both left and right swipes
        if (event.translationX < 0) {
          // Left swipe for delete
          translateX.value = Math.max(event.translationX, -100);
          isEditVisible.value = false;
          runOnJS(hideEditIcon)();

          if (event.translationX < -40) {
            if (!isDeleteVisible.value) {
              isDeleteVisible.value = true;
              runOnJS(showDeleteIcon)();
            }
          }
        } else if (event.translationX > 0) {
          // Right swipe for edit
          translateX.value = Math.min(event.translationX, 100);
          isDeleteVisible.value = false;
          runOnJS(hideDeleteIcon)();

          if (event.translationX > 40) {
            if (!isEditVisible.value) {
              isEditVisible.value = true;
              runOnJS(showEditIcon)();
            }
          }
        }
      },
      onEnd: (event) => {
        if (event.translationX < -60) {
          // Left swipe - show delete button
          translateX.value = withSpring(-80, {
            damping: 20,
            stiffness: 200,
          });
          isDeleteVisible.value = true;
          isEditVisible.value = false;
        } else if (event.translationX > 60) {
          // Right swipe - show edit button
          translateX.value = withSpring(80, {
            damping: 20,
            stiffness: 200,
          });
          isEditVisible.value = true;
          isDeleteVisible.value = false;
        } else {
          // Snap back to original position
          translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
          });
          isDeleteVisible.value = false;
          isEditVisible.value = false;
          runOnJS(hideDeleteIcon)();
          runOnJS(hideEditIcon)();
        }
      },
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-80, -40, 0],
      [1, 0.7, 0],
      "clamp"
    );
    return {
      opacity: isDeleteVisible.value ? withSpring(opacity) : withSpring(0),
    };
  });

  const editIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [80, 40, 0],
      [1, 0.7, 0],
      "clamp"
    );
    return {
      opacity: isEditVisible.value ? withSpring(opacity) : withSpring(0),
    };
  });

  return (
    <View style={styles.cardContainer}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <ReAnimated.View style={[styles.card, animatedStyle]}>
          <TouchableOpacity onPress={handlePress} style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Animated.Text style={[styles.word, { opacity: wordOpacity }]}>
                {word}
              </Animated.Text>
              {isMemorized && currentFilter === "all" && (
                <View style={styles.memorizedBadge}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#4CAF50"
                  />
                  <AppText style={styles.memorizedText} text="외운 단어" />
                </View>
              )}
            </View>
            <Animated.Text
              style={[styles.meaning, { opacity: meaningOpacity }]}
            >
              {meaning}
            </Animated.Text>

            {example && example.trim() && (
              <Animated.View style={{ opacity: meaningOpacity }}>
                <AppText style={styles.subItem} text={example} />
              </Animated.View>
            )}
          </TouchableOpacity>
        </ReAnimated.View>
      </PanGestureHandler>

      {/* Edit button */}
      <ReAnimated.View style={[styles.editButton, editIconStyle]}>
        <TouchableOpacity onPress={handleEdit} style={styles.editIconContainer}>
          <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>
      </ReAnimated.View>

      {/* Delete button */}
      <ReAnimated.View style={[styles.deleteButton, deleteIconStyle]}>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteIconContainer}
        >
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
      </ReAnimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    marginBottom: 21,
  },
  card: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  word: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    flex: 1,
  },
  memorizedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  memorizedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  meaning: {
    fontSize: 16,
    color: "grey",
  },
  subItem: {
    color: "grey",
    fontSize: 14,
    marginTop: 6,
  },
  editButton: {
    position: "absolute",
    left: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
  },
  editIconContainer: {
    backgroundColor: "#4CAF50",
    borderRadius: 30,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
  },
  deleteIconContainer: {
    backgroundColor: "#ff4444",
    borderRadius: 30,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VocabularyCard;
