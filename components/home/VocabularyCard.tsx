import React from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
import AppText from "@/components/common/AppText";

interface VocabularyCardProps {
  word: string;
  meaning: string;
  subItems?: string[];
  mode: "word" | "meaning" | null;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  meaning,
  subItems,
  mode,
}) => {
  const wordOpacity = React.useRef(new Animated.Value(1)).current;
  const meaningOpacity = React.useRef(new Animated.Value(1)).current;
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null);

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

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Animated.Text style={[styles.word, { opacity: wordOpacity }]}>
        {word}
      </Animated.Text>
      <Animated.Text style={[styles.meaning, { opacity: meaningOpacity }]}>
        {meaning}
      </Animated.Text>
      {subItems?.map((item, idx) => (
        <AppText key={idx} style={styles.subItem} text={item} />
      ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F7FAFC",
    padding: 24,
    borderRadius: 8,
    marginBottom: 21,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  word: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "black",
  },
  meaning: {
    fontSize: 16,
    color: "grey",
  },
  subItem: {
    marginLeft: 16,
    color: "grey",
    fontSize: 14,
    marginTop: 4,
  },
});

export default VocabularyCard;
