import AuthButton from '@/components/auth/AuthButton'
import Guidance from '@/components/auth/Guidance'
import BottomSheet from '@gorhom/bottom-sheet'
import React, { useRef } from 'react'
import { Button } from 'react-native'
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'

interface Props {}

const index = () => {
    const onSignUp = () => {
        console.log('hi');
    }

  return (
  <>
  <SafeAreaView style={styles.container}>
    <View style={styles.banner}>
        <Text style={styles.bannerText}>Let's get Started!</Text>
    </View>
    <Image source={require('../../assets/images/get-started.png')} style={styles.image}/>
    <AuthButton text='회원 가입하기' onPress={onSignUp}/>
    <Guidance guide="이미 계정이 있으신가요?" link="로그인" />
  </SafeAreaView>
  </>
  )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#6D60F8'
    },
    banner: {
        marginTop: 33,
        alignItems: 'center',
    },
    bannerText: {
        fontSize: 30,
        fontWeight: '600',
        fontFamily: 'Lexend',
        color:'white'
    },
    image: {
        width: 393,
        height: 454,
        marginBottom: 60
    },
})

export default index