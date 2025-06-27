import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import StatCard from '@/components/stat-card'

const Commands = () => {
  return (
    <View className='flex-1 p-5'>
      <ScrollView>
        <StatCard />
      </ScrollView>
    </View>
  )
}

export default Commands