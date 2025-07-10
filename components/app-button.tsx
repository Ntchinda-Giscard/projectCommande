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
    disabled?: boolean
}

const AppButton  = (props: AppButtonProps) => {

  return (
    <TouchableOpacity className={props.className}
    onPress={props.onPress}
    disabled={props.disabled}
    >
        {props.icon}
        { props.label &&
          <Text className={props.textClasses}> {props.label} </Text>}
    </TouchableOpacity>
  )
}

export default AppButton 