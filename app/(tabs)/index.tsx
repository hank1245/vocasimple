import React from 'react'
import { View, Text } from 'react-native'
import { StyleSheet } from 'react-native'
function App() {
  return (
    <View style={styles.container}>
      <Text>App</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default App