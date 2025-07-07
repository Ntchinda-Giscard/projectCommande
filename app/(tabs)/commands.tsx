// import { View, Text, ScrollView } from 'react-native'
// import React from 'react'
// import StatCard from '@/components/stat-card'
// import CommandCarts from '@/components/command-carts'

// const Commands = () => {
//   return (
//     <View className='flex-1 p-5'>
//       <ScrollView>
//         <StatCard />
//         <CommandCarts />
//       </ScrollView>
//     </View>
//   )
// }

// export default Commands


"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

// Mock data
const mockOrders = [
  {
    id: "001",
    status: "processing",
    total: 125,
    date: "2024-01-15",
    items: 3,
    customer: "Electronics Store",
    estimatedDelivery: "2024-01-18",
  },
  {
    id: "002",
    status: "shipped",
    total: 89,
    date: "2024-01-12",
    items: 2,
    customer: "Tech Solutions",
    estimatedDelivery: "2024-01-16",
  },
  {
    id: "003",
    status: "delivered",
    total: 156,
    date: "2024-01-10",
    items: 4,
    customer: "Digital Hub",
    estimatedDelivery: "2024-01-14",
  },
  {
    id: "004",
    status: "pending",
    total: 234,
    date: "2024-01-14",
    items: 5,
    customer: "Innovation Labs",
    estimatedDelivery: "2024-01-20",
  },
  {
    id: "005",
    status: "processing",
    total: 67,
    date: "2024-01-13",
    items: 1,
    customer: "Future Tech",
    estimatedDelivery: "2024-01-17",
  },
  {
    id: "006",
    status: "cancelled",
    total: 198,
    date: "2024-01-11",
    items: 3,
    customer: "Smart Systems",
    estimatedDelivery: "N/A",
  },
  {
    id: "007",
    status: "delivered",
    total: 145,
    date: "2024-01-09",
    items: 2,
    customer: "Tech Innovators",
    estimatedDelivery: "2024-01-13",
  },
  {
    id: "008",
    status: "shipped",
    total: 78,
    date: "2024-01-08",
    items: 1,
    customer: "Digital Solutions",
    estimatedDelivery: "2024-01-15",
  },
]

const OrdersScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState("all")

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
      case "cancelled":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "schedule"
      case "processing":
        return "autorenew"
      case "shipped":
        return "local-shipping"
      case "delivered":
        return "check-circle"
      case "cancelled":
        return "cancel"
      default:
        return "help"
    }
  }

  const filterOptions = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ]

  const filteredOrders =
    selectedFilter === "all" ? mockOrders : mockOrders.filter((order) => order.status === selectedFilter)

  const getOrderStats = () => {
    const stats = mockOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: mockOrders.length,
      pending: stats.pending || 0,
      processing: stats.processing || 0,
      shipped: stats.shipped || 0,
      delivered: stats.delivered || 0,
    }
  }

  const stats = getOrderStats()

  return (
    <SafeAreaView className="flex-1 ">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <Text className="text-black text-2xl font-bold mb-1">All Orders</Text>
        <Text className="text-gray-600">Manage and track your orders</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-xl p-4 border border-borders mb-4">
            <Text className="text-black text-lg font-semibold mb-3">Order Summary</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-black text-xl font-bold">{stats.total}</Text>
                <Text className="text-gray-500 text-xs">Total</Text>
              </View>
              <View className="items-center">
                <Text className="text-yellow-600 text-xl font-bold">{stats.pending}</Text>
                <Text className="text-gray-500 text-xs">Pending</Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-600 text-xl font-bold">{stats.processing}</Text>
                <Text className="text-gray-500 text-xs">Processing</Text>
              </View>
              <View className="items-center">
                <Text className="text-purple-600 text-xl font-bold">{stats.shipped}</Text>
                <Text className="text-gray-500 text-xs">Shipped</Text>
              </View>
              <View className="items-center">
                <Text className="text-green-600 text-xl font-bold">{stats.delivered}</Text>
                <Text className="text-gray-500 text-xs">Delivered</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSelectedFilter(option.key)}
                className={`mr-3 px-4 py-2 rounded-lg border border-borders ${
                  selectedFilter === option.key ? "bg-black" : "bg-white"
                }`}
              >
                <Text className={`font-medium ${selectedFilter === option.key ? "text-white" : "text-gray-600"}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <View className="px-6 pb-6">
          {filteredOrders.length === 0 ? (
            <View className="bg-white rounded-xl p-8 border border-borders items-center">
              <MaterialIcons name="inbox" size={48} color="#6b7280" />
              <Text className="text-black text-lg font-semibold mt-4 mb-2">No Orders Found</Text>
              <Text className="text-gray-500 text-center">
                {selectedFilter === "all" ? "You haven't placed any orders yet." : `No ${selectedFilter} orders found.`}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity key={order.id} className="bg-white rounded-xl p-4 mb-3 border border-borders">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name={getStatusIcon(order.status)} size={20} color="#6b7280" />
                    <Text className="text-black font-semibold ml-2">Order #{order.id}</Text>
                  </View>
                  <Text className={`text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-gray-600 text-sm mb-1">Customer: {order.customer}</Text>
                  <Text className="text-gray-600 text-sm mb-1">
                    {order.items} items • Ordered on {order.date}
                  </Text>
                  {order.status !== "cancelled" && (
                    <Text className="text-gray-600 text-sm">Estimated delivery: {order.estimatedDelivery}</Text>
                  )}
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-black font-bold text-lg">${order.total}</Text>
                  <View className="flex-row">
                    {order.status === "delivered" ? (
                      <TouchableOpacity className="bg-gray-500 rounded-lg px-3 py-1 mr-2">
                        <Text className="text-white text-sm font-medium">Reorder</Text>
                      </TouchableOpacity>
                    ) : order.status === "pending" ? (
                      <TouchableOpacity className="bg-gray-500 rounded-lg px-3 py-1 mr-2">
                        <Text className="text-white text-sm font-medium">Cancel</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity className="bg-black rounded-lg px-3 py-1">
                      <Text className="text-white text-sm font-medium">View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default OrdersScreen
