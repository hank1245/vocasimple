import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import AppText from '../AppText';

interface Props {
  text: string;
  onPress: () => void
}

export default function AuthButton({text, onPress} : Props) {
  return (
        <Pressable style={styles.container} onPress={onPress}>
            <AppText style={styles.text} text={text} />
        </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width:323,
    height: 64,
    backgroundColor: "#F5C92B",
    alignSelf: 'center',
    borderRadius: 20,
    justifyContent:'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    width: 115,
    alignSelf:'center',
  }
})