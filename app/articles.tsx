import { View, Text } from 'react-native'
import React, { useState } from 'react'
import AppButton from '@/components/app-button'
import { MaterialIcons } from '@expo/vector-icons'

const Articles = () => {
    const [articleCount, setArticleCount] = useState(0)
    const [price, setPrice] = useState(0)
  return (
    <View className='flex-1 p-5'>
        <View className='flex flex-row items-center justify-between'>
            <Text className="text-2xl font-semibold text-gray-900">Articles</Text>
            <AppButton
                label={`Panier ${articleCount} - ${price}XAF`}
                onPress={() => {}}
                className='bg-black text-white p-3 rounded-lg flex flex-row items-center'
                textClasses='text-center font-medium text-white' 
                icon={<MaterialIcons name="shopping-cart" color="white" size={16} />}
            />
        </View>
    </View>
  )
}

export default Articles
