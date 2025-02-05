import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Props {
  text: string;
}

export default function AuthButton({text} : Props) {
  return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </View>
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
    fontFamily: 'Lexend',
    width: 115,
    alignSelf:'center'
  }
})