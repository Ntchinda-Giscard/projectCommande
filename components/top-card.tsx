import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker';
import PickerData from './picker-data';
import StatCard from './stat-card';

type TopCardProps = {
    onPress: (value: string) => void
  }


const TopCard = ({ onPress }: TopCardProps) => {
    const [value, setValue] = useState<string>();
  return (
    <View>
        <View className='flex flex-row items-center border-borders justify-between p-3 bg-white rounded-lg border'>
            <View className='flex flex-col'>
                <View className='flex flex-row items-center gap-5'> 
                    <MaterialIcons name="people-outline" size={24} color="black" />
                    <Text className='text-lg font-semibold'> Sélectionnez un client </Text>
                </View>
                <Text className='text-sm text-gray-600 mt-2'> Choose a client to view their articles and manage orders</Text>
                <PickerData 
                    onPress={(value) => {
                            setValue(value);
                        onPress(value);
                    }}
                />
            </View>
        </View>
    </View>
  )
}

export default TopCard