import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Props {
    guide: string;
    link: string;
}

const Guidance = ({guide,link}: Props) => {
  return (<View style={styles.container}>
    <Text style={styles.guide}>{guide}</Text>
    <Text style={styles.link}>{link}</Text>
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
        fontFamily: 'Lexend',
        color: '#fff'
    },
    link: {
        fontSize:20,
        fontFamily: 'Lexend',
        color: '#F5C92B',
        marginLeft: 8
    }
})

export default Guidance