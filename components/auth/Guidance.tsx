import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import AppText from '../AppText';

interface Props {
    guide: string;
    link: string;
    color: string;
}

const Guidance = ({guide,link, color}: Props) => {
  return (<View style={styles.container}>
    <AppText style={{...styles.guide, color:color}} text={guide}/>
    <AppText style={styles.link} text={link} />
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