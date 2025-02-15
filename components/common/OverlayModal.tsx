import React from "react";
import { Modal, View, StyleSheet } from "react-native";

interface OverlayModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  children?: React.ReactNode;
}

const OverlayModal: React.FC<OverlayModalProps> = ({
  visible,
  onRequestClose,
  children,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>{children}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)", // 검은색 overlay, 투명도 조절 가능
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OverlayModal;
