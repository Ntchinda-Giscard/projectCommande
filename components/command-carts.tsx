import { View, Text } from 'react-native'
import React from 'react'

const CommandCarts = () => {
  return (
    <View className='flex border border-borders p-3 bg-white rounded-lg mt-4'>
        <View>
            <View className='flex flex-row gap-2'>
                <Text className='text-xl font-semibold'> Order #1750852523117</Text>
                <Badge text={'validate'} />
            </View>
        </View>
      <Text>CommandCarts</Text>

    </View>
  )
}

export default CommandCarts


const Badge = ({text, variant}: {text: string, variant?: string}) => {
    let className = ""
    let textColor = ""
    if(variant === 'light' ) className = "bg-slate-200 rounded-full py-2 px-4 w-fit"
    else if(variant === 'outline' ) className = "bg-slate-200 rounded-full py-2 px-4 w-fit"
    else className = "bg-black rounded-full py-1 px-2 w-fit"; textColor = "text-white";

    return <View className={className}>
        <Text className={textColor}> {text}  </Text> </View>
}