import { View, Text } from 'react-native'
import React, { ReactNode } from 'react'
import { TouchableOpacity } from 'react-native'


type AppButtonProps = {
    label: string;
    onPress: () => void;
    icon?: ReactNode,
    link?: ReactNode
}

const AppButton  = (props: AppButtonProps) => {

  return (
    <TouchableOpacity className='mt-5 flex items-center flex-row border justify-center border-gray-300 p-3 rounded-lg bg-white w-fit'
    onPress={props.onPress}
    >
        {props.icon}
        <Text className='text-center font-medium text-gray-600'> {props.label} </Text>
    </TouchableOpacity>
  )
}

export default AppButton 