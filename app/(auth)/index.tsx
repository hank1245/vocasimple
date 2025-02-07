import AuthButton from '@/components/auth/AuthButton'
import Guidance from '@/components/auth/Guidance'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import React, { useRef } from 'react'
import { Button } from 'react-native'
import { Image, SafeAreaView, StyleSheet, View } from 'react-native'
import AppText from '@/components/AppText'
import Form from '@/components/auth/Form'

const index = () => {
    const bottomSheetRef = useRef<BottomSheet>(null)

    const onSignUp = () => {
        bottomSheetRef.current?.snapToIndex(0)
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.banner}>
                    <AppText style={styles.bannerText} text="Let's get Started!" />
                </View>
                <Image 
                    source={require('../../assets/images/get-started.png')} 
                    style={styles.image}
                />
                <AuthButton text='회원 가입하기' onPress={onSignUp}/>
                <Guidance guide="이미 계정이 있으신가요?" link="로그인" color='white' />
            </SafeAreaView>

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={['80%']}
                index={-1} // Start closed
                enablePanDownToClose={true}
                enableDynamicSizing={false}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Form />
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6D60F8'
    },
    banner: {
        marginTop: 33,
        alignItems: 'center',
    },
    bannerText: {
        fontSize: 30,
        fontWeight: '600',
        color: 'white'
    },
    image: {
        width: 393,
        height: 454,
        marginBottom: 60
    },
    contentContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: 'white',
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 16,
    }
})

export default index