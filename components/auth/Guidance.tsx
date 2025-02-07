import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import AppText from '../AppText';
import { FormType } from '@/types/auth';
import { useAuthStore } from '@/stores/useAuthStore';

interface Props {
    guide: string;
    link: string;
    color: string;
}

const Guidance = ({guide,link, color}: Props) => {
    const { formType, setLogin, setSignUp } = useAuthStore((state) => ({
        formType: state.formType,
        setLogin: state.setLogin,
        setSignUp: state.setSignUp
    }));
  const onPress = () => {
    if(formType === 'LOGIN') {
        setSignUp()
    } else {
        setLogin()
    }
  }
  return (<View style={styles.container}>
    <AppText style={{...styles.guide, color:color}} text={guide}/>
    <Pressable onPress={onPress}>
        <AppText style={styles.link} text={link} />
    </Pressable>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flexDirection:'row',
        justifyContent:'center',
        alignItems: 'center'
    },
    guide: {
        fontSize: 20,
        color: '#fff',
        fontWeight:'700'
    },
    link: {
        fontSize:20,
        color: '#F5C92B',
        marginLeft: 8,
        fontWeight:'700'
    }
})

export default Guidance