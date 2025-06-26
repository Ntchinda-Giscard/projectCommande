import { View, Text } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'

const StatCard = () => {
  return (
    <View className='flex flex-col space-y-5'>
      <Card />
    </View>
  )
}

export default StatCard




const Card = () =>{

    return(
        <View className='border p-5 border-borders bg-white rounded-lg'>
            <View className='flex flex-row items-center justify-between'>
                <Text className='text-lg font-semibold'>Nombre de commandes</Text>
                <MaterialIcons name="shopping-cart" color={"#"} size={24} />
            </View>
            <Text className='text-lg font-semibold'>10</Text>
        </View>
    )
}