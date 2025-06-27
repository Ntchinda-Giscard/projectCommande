import { View, Text } from 'react-native'
import React from 'react'

const Basket = () => {
  return (
    <View className='flex-1'>
        <View className='bg-white p-5'>
            <Text className='text-2xl font-semibold text-gray-900'>Basket</Text>
            <Text className="text-gray-600">Review and manage your order</Text>
        </View>
        <View className='flex-1 px-10 py-5'>
            <View className='border border-borders bg-white p-5 rounded-lg'>
                <View className="flex w-full flex-row items-center justify-between">
                    <Text>Order Summary</Text>
                    <Badge text='4 items' /> 
                </View>

                <View className="flex w-full flex-row items-center mt-5 justify-between">
                    <Text className='text-lg font-semibold'>Order Summary</Text>
                    <Text className='text-lg font-semibold'>XAF 16.90</Text> 
                </View>
            </View>


            <View className='border border-borders bg-white p-5 rounded-lg mt-8'>
                <Text className='text-xl font-semibold text-gray-900'>Items in Basket </Text>
                <Text className="text-gray-600">Modify quantities or remove items as needed</Text>
            </View>
        </View>

    </View>
  )
}

export default Basket

const Badge = ({text}: {text: string}) => {

    return <View className='bg-slate-200 rounded-full py-1 px-2 w-fit'>
        <Text className='text-black fonr-medium'> {text}  </Text> </View>
}

//•