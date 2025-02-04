import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

interface Props {}

const index = () => {
  return <SafeAreaView style={styles.container}>
    <View style={styles.banner}>
        <Text style={styles.bannerText}>Let's get Started!</Text>
    </View>
  </SafeAreaView>
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#6D60F8'
    },
    banner: {
        marginTop: 73,
        alignItems: 'center',
    },
    bannerText: {
        fontSize: 30,
        fontWeight: '600',
        fontFamily: 'Lexend'
    }
})

export default index