import { View, Text } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import AppButton from './app-button'
import { useRouter } from 'expo-router'



const EmptyBasket = () => {
    const router = useRouter()
  return (
    <View className='p-5'>
        <View className='border border-borders p-3 bg-white rounded-lg flex justify-center items-center'>
            <MaterialIcons name='remove-shopping-cart' color={'#E5E7E8'} size={50} />
            <Text className='text-xl font-semibold mb-2'>Your basket is empty</Text>
            <Text className='text-md font-sm text-gray-600 mb-10'>Add some articles to your basket to get started</Text>
            <AppButton 
                onPress={() => router.push("/articles") } 
                label={'Brouse articles'} 
                className= 'bg-black p-3 rounded-lg mx-auto'
                textClasses='text-white text-md font-semibold' 
            />
        </View>
    </View>
  )
}

export default EmptyBasket