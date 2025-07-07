"use client"

import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

// Mock data
const mockClientData = {
  activeOrders: 3,
  completedOrders: 12,
  totalSpent: 2450,
  recentOrders: [
    { id: "001", status: "processing", total: 125, date: "2024-01-15", items: 3 },
    { id: "002", status: "shipped", total: 89, date: "2024-01-12", items: 2 },
    { id: "003", status: "delivered", total: 156, date: "2024-01-10", items: 4 },
  ],
}

const HomeScreen = () => {
  const router = useRouter()
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600"
      case "processing":
        return "text-blue-600"
      case "shipped":
        return "text-purple-600"
      case "delivered":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <Text className="text-black text-2xl font-bold mb-1">Your Orders</Text>
        <Text className="text-gray-600">Track and manage your orders</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white rounded-xl p-4 flex-1 mr-2 border border-borders">
            <View className="flex-row items-center justify-between mb-2">
              <MaterialIcons name="inventory" size={20} color="#6b7280" />
              <Text className="text-blue-600 text-xs font-medium">ACTIVE</Text>
            </View>
            <Text className="text-black text-2xl font-bold">{mockClientData.activeOrders}</Text>
            <Text className="text-gray-500 text-xs">Orders in progress</Text>
          </View>

          <View className="bg-white rounded-xl p-4 flex-1 mx-1 border border-borders">
            <View className="flex-row items-center justify-between mb-2">
              <MaterialIcons name="check-circle" size={20} color="#6b7280" />
              <Text className="text-green-600 text-xs font-medium">COMPLETED</Text>
            </View>
            <Text className="text-black text-2xl font-bold">{mockClientData.completedOrders}</Text>
            <Text className="text-gray-500 text-xs">Total orders</Text>
          </View>

          <View className="bg-white rounded-xl p-4 flex-1 ml-2 border border-borders">
            <View className="flex-row items-center justify-between mb-2">
              <MaterialIcons name="trending-up" size={20} color="#6b7280" />
              <Text className="text-amber-600 text-xs font-medium">SPENT</Text>
            </View>
            <Text className="text-black text-2xl font-bold">${mockClientData.totalSpent}</Text>
            <Text className="text-gray-500 text-xs">This year</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="bg-black rounded-xl p-4 flex-1 mr-2 flex-row items-center justify-center">
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">New Order</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-500 rounded-xl p-4 flex-1 ml-2 flex-row items-center justify-center">
            <MaterialIcons name="search" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Track Order</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-black text-lg font-semibold">Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push("/commands")} >
              <Text className="text-gray-600 text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          {mockClientData.recentOrders.map((order) => (
            <TouchableOpacity key={order.id} className="bg-white rounded-xl p-4 mb-3 border border-borders">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-black font-semibold">Order #{order.id}</Text>
                <Text className={`text-sm font-medium capitalize ${getStatusColor(order.status)}`}>{order.status}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 text-sm">
                  {order.items} items • {order.date}
                </Text>
                <Text className="text-black font-semibold">${order.total}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen
