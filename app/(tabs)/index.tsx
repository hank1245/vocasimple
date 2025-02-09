import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";

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
    // Reset opacities on mode change
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

    // Clear existing timeout
    if (timeoutId.current) clearTimeout(timeoutId.current);

    // Fade in
    Animated.timing(targetOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Fade out after 2 seconds
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
        <Text key={idx} style={styles.subItem}>
          {item}
        </Text>
      ))}
    </TouchableOpacity>
  );
};

const App = () => {
  const [mode, setMode] = useState<"word" | "meaning" | null>(null);

  const vocabularyList = [
    { word: "run", meaning: "달리다", subItems: [] },
    { word: "moon", meaning: "달", subItems: [] },
    { word: "star", meaning: "별, 스타", subItems: [] },
    { word: "tree", meaning: "나무", subItems: [] },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.modeButtons}>
        <TouchableOpacity
          style={[styles.modeButton, mode === "word" && styles.activeMode]}
          onPress={() => setMode((m) => (m === "word" ? null : "word"))}
        >
          <Text>단어만</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === "meaning" && styles.activeMode]}
          onPress={() => setMode((m) => (m === "meaning" ? null : "meaning"))}
        >
          <Text>뜻만</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {vocabularyList.map((item, idx) => (
          <VocabularyCard
            key={idx}
            word={item.word}
            meaning={item.meaning}
            subItems={item.subItems}
            mode={mode}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 100,
    backgroundColor: "#f5f5f5",
  },
  modeButtons: {
    flexDirection: "row",
    marginBottom: 16,
  },
  modeButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  activeMode: {
    backgroundColor: "#bdbdbd",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
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

export default App;
