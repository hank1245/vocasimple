import React from 'react'
import { StyleSheet } from 'react-native'
import {View, Text} from 'react-native'

const profile = () => {
  return (
  <View style={styles.container}>
    <Text>profile</Text>
  </View>)
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default profile