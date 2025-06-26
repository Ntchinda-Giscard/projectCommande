import { View, Text } from 'react-native'
import React, { ReactNode } from 'react'
import { TouchableOpacity } from 'react-native'


type AppButtonProps = {
    label?: string | null;
    onPress: () => void;
    icon?: ReactNode,
    link?: ReactNode
    className?: string
    textClasses?: string
}

const AppButton  = (props: AppButtonProps) => {

  return (
    <TouchableOpacity className={props.className}
    onPress={props.onPress}
    >
        {props.icon}
        { props.label &&
          <Text className={props.textClasses}> {props.label} </Text>}
    </TouchableOpacity>
  )
}

export default AppButton 