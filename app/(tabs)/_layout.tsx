import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'

const _layout = () => {
  return (
    <Tabs
       screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        headerTintColor: 'black', 
        headerTitleStyle: {
          color: 'black',
        },
       }}
    >
        <Tabs.Screen 
            name="index"
            
            options={{
                title: "Accueil",
                tabBarIcon: ({ color }) => (
                    <MaterialIcons  name='home' size={24} color={color} />
                ),
                tabBarLabel: 'Accueil'
            }} 
        />
        <Tabs.Screen name="commands" options={{
            title: "Commandes",
            tabBarIcon: ({ color }) => (
                <MaterialIcons name="layers" color={color} size={24} />
            ),
            tabBarLabel: 'Commandes'
        }} />
        <Tabs.Screen name="articles" options={{
            title: "Articles",
            tabBarIcon: ({ color }) => (
                <MaterialIcons  name='article' size={24} color={color} />
            ),
            tabBarLabel: 'Articles'
        }} />
        <Tabs.Screen name="profile" options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
                <MaterialIcons  name='person' size={24} color={color} />
            ),
            tabBarLabel: 'Profile'
        }} /> 
    </Tabs>
  )
}

export default _layout
