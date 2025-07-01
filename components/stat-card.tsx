import { View, Text } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'

const StatCard = () => {
  return (
    <View className='flex flex-col space-y-5 mt-5 gap-5 '>
      <Card 
        icon={<MaterialIcons name="layers" color={"gray"} size={16} />}
        title="Nombre de commandes"
        value="10"
        descroiption="Nombre totale de commandes"
      />
      <Card 
        icon={<MaterialIcons name="access-time" color={"gray"} size={16} />}
        title="Pending"
        value="10"
        descroiption="Commandes en attente"
      />
      <Card 
        icon={<MaterialIcons name="check" color={"gray"} size={16} />}
        title="Validated"
        value="10"
        descroiption="Completed orders"
      />
      <Card 
        icon={<MaterialIcons name="money" color={"gray"} size={16} />}
        title="Total Value"
        value="XAF10"
        descroiption="All time orders"
      />
    </View>
  )
}

export default StatCard


type CarsProps = {
    icon?: React.ReactNode
    title?: string
    value?: string
    descroiption?: string
}

const Card = (props: CarsProps) =>{

    return(
        <View className='border p-5 border-borders bg-white rounded-lg'>
            <View className='flex flex-row items-center justify-between'>
                <Text className="text-sm font-medium"> {props.title} </Text>
                {props.icon}
            </View>
            <Text className='text-xl font-bold'> {props.value} </Text>
            <Text className="text-xs text-muted-foreground text-gray-600"> {props.descroiption} </Text>
        </View>
    )
}