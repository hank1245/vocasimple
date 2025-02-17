import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import AppText from "@/components/common/AppText";
import { Colors } from "@/constants/Colors";

const windowWidth = Dimensions.get("window").width;

interface QuestionItemProps {
  item: any;
  selected: number | null;
  setSelected: (index: number) => void;
  handleContinue: () => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  item,
  selected,
  setSelected,
  handleContinue,
}) => {
  return (
    <View style={styles.questionContainer}>
      <AppText style={styles.questionText} text={item.question} />
      {item.options.map((option: any, idx: number) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.optionButton,
            selected === idx && { borderColor: Colors.primary },
          ]}
          onPress={() => setSelected(idx)}
        >
          <AppText style={styles.optionText} text={option} />
          <View
            style={[
              styles.select,
              selected === idx && { borderColor: Colors.primary },
            ]}
          >
            {selected === idx ? (
              <View style={styles.selectedDot}></View>
            ) : undefined}
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <AppText style={styles.continueButtonText} text="Continue" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    width: windowWidth - 30,
    paddingHorizontal: 10,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "black",
    paddingLeft: 14,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#D1DBE8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "black",
  },
  select: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: "#D1DBE8",
    borderRadius: "50%",
    position: "relative",
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    position: "absolute",
    top: 6,
    left: 6,
  },
  continueButton: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    alignSelf: "center",
    marginTop: 16,
    padding: 13,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});

export default QuestionItem;
