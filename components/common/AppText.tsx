import React from 'react'
import { StyleProp, Text, TextStyle } from 'react-native';

interface Props {
    text: string;
    style: StyleProp<TextStyle>
}

const AppText = ({ text,style }: Props) => (
    <Text style={[style, { fontFamily: 'Lexend' }]}>
      {text}
    </Text>
  );
export default AppText