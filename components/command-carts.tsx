import { View, Text } from 'react-native'
import React from 'react'

const CommandCarts = () => {
  return (
    <View className='flex border border-borders p-3 bg-white rounded-lg mt-4'>
        <View className='flex flex-row  justify-between items-center w-full'>
            <View className='flex flex-row gap-2'>
                <Text className='text-xl font-semibold'>Order #17508</Text>
                <Badge text={'validate'}/>
            </View>
            <Text className='text-xl font-semibold'> XAF200 </Text>
        </View>
      <Text>CommandCarts</Text>

    </View>
  )
}

export default CommandCarts


const Badge = ({text, variant}: {text: string, variant?: string}) => {
    let className = ""
    let textColor = ""
    if(variant === 'light' ){ 
        className = "bg-slate-200 py-1 px-2 rounded-full w-fit"
        textColor = "text-black"}
    else if(variant === 'outline' ) {
        className = "bg-transparent py-1 px-2 rounded-full w-fit"
        textColor = "text-black"}
    else {className = "bg-black py-1 px-2 rounded-full w-fit" 
        textColor = "text-white"}

    return <View className={className}>
        <Text className={`${textColor} text-xs font-semibold`}> {text}  </Text> </View>
}