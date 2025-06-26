import { View, Text } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'

const StatCard = () => {
  return (
    <View className='flex flex-col space-y-5'>
      <Card 
        icon={<MaterialIcons name="shopping-cart" color={"gray"} size={24} />}
        title="Nombre de commandes"
        value="10"
      />
    </View>
  )
}

export default StatCard


type CarsProps = {
    icon?: React.ReactNode
    title?: string
    value?: string
}

const Card = (props: CarsProps) =>{

    return(
        <View className='border p-5 border-borders bg-white rounded-lg'>
            <View className='flex flex-row items-center justify-between'>
                <Text className='text-lg font-light'> {props.title} </Text>
                {props.icon}
            </View>
            <Text className='text-xl font-bold'> {props.value} </Text>
        </View>
    )
}