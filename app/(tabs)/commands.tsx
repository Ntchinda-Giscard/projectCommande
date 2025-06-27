import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import StatCard from '@/components/stat-card'
import CommandCarts from '@/components/command-carts'

const Commands = () => {
  return (
    <View className='flex-1 p-5'>
      <ScrollView>
        <StatCard />
        <CommandCarts />
      </ScrollView>
    </View>
  )
}

export default Commands