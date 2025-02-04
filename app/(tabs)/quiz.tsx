import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props {}

const quiz = () => {
  return (<View style={styles.container}>
    <Text>quiz</Text>
  </View>)
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default quiz