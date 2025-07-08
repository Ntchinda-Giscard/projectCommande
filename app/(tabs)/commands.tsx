"use client"
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { listCommandes } from "@/services/liste-commande"
import AppButton from '@/components/app-button'

type LineItem = {
  code: string;
  description?: string;
  unit: string;
  quantity: number;
  price: number;
};

type Command = {
  site: string;
  type: string;
  number: string;
  customer: string;
  date: string;
  reference?: string;
  currency?: string;
  lines: LineItem[];
};

const OrdersScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [commands, setCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [token, setToken] = useState<string>("")
  const TOKEN = 'token'

  const loadOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const storedToken = await SecureStore.getItemAsync(TOKEN)
      if (!storedToken) {
        console.log("No token found")
        return
      }

      const fetchedCommands = await listCommandes({
        username: "admin",
        password: "Wazasolutions2025@",
        moduleToExport: "SOH",
        usercode: storedToken,
      })

      setCommands(fetchedCommands || [])
      setToken(storedToken)
      console.log("Orders loaded:", fetchedCommands?.length || 0)
    } catch (error) {
      console.error("Error loading orders:", error)
      setCommands([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const onRefresh = () => {
    loadOrders(true)
  }

  // Generate status based on order data (you can customize this logic)
  const getOrderStatus = (command: Command) => {
    // This is a simple example - adjust based on your business logic
    const orderDate = new Date(command.date)
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceOrder < 1) return "pending"
    if (daysSinceOrder < 3) return "processing"
    if (daysSinceOrder < 7) return "shipped"
    return "delivered"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#f59e0b"
      case "processing": return "#3b82f6"
      case "shipped": return "#8b5cf6"
      case "delivered": return "#10b981"
      case "cancelled": return "#ef4444"
      default: return "#6b7280"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return "schedule"
      case "processing": return "autorenew"
      case "shipped": return "local-shipping"
      case "delivered": return "check-circle"
      case "cancelled": return "cancel"
      default: return "help"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "pending": return "#fef3c7"
      case "processing": return "#dbeafe"
      case "shipped": return "#e9d5ff"
      case "delivered": return "#d1fae5"
      case "cancelled": return "#fee2e2"
      default: return "#f3f4f6"
    }
  }

  const filterOptions = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ]

  const commandsWithStatus = commands.map(command => ({
    ...command,
    status: getOrderStatus(command),
    total: command.lines.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }))

  const filteredOrders = selectedFilter === "all" 
    ? commandsWithStatus 
    : commandsWithStatus.filter(order => order.status === selectedFilter)

  const getOrderStats = () => {
    const stats = commandsWithStatus.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return {
      total: commandsWithStatus.length,
      pending: stats.pending || 0,
      processing: stats.processing || 0,
      shipped: stats.shipped || 0,
      delivered: stats.delivered || 0,
    }
  }

  const stats = getOrderStats()

  const formatDate = (dateString: string) => {
    try {
      if (!/^\d{8}$/.test(dateString)) throw new Error("Invalid format");
  
      const year = parseInt(dateString.slice(0, 4), 10);
      const month = parseInt(dateString.slice(4, 6), 10) - 1; // JS months = 0-indexed
      const day = parseInt(dateString.slice(6, 8), 10);
  
      const date = new Date(year, month, day);
  
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency = 'XAF') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading orders...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-black text-2xl font-bold mb-1">Orders</Text>
        <Text className="text-gray-600">Manage and track your orders</Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSelectedFilter(option.key)}
                className={`mr-3 px-4 py-2 rounded-full border ${
                  selectedFilter === option.key 
                    ? "bg-blue-500 border-blue-500" 
                    : "bg-white border-gray-200"
                }`}
              >
                <Text className={`font-medium ${
                  selectedFilter === option.key ? "text-white" : "text-gray-600"
                }`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <View className="px-6 pb-6">
          {filteredOrders.length === 0 ? (
            <View className="bg-white rounded-xl p-8 border-borders border items-center">
              <MaterialIcons name="inbox" size={48} color="#6b7280" />
              <Text className="text-black text-lg font-semibold mt-4 mb-2">No Orders Found</Text>
              <Text className="text-gray-500 text-center">
                {selectedFilter === "all" 
                  ? "You haven't placed any orders yet." 
                  : `No ${selectedFilter} orders found.`}
              </Text>
              <TouchableOpacity 
                onPress={onRefresh}
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity 
                key={order.number} 
                className="bg-white rounded-xl p-4 mb-3 border-borders border"
              >
                {/* Header Row */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: getStatusBgColor(order.status) }}
                    >
                      <MaterialIcons 
                        name={getStatusIcon(order.status)} 
                        size={20} 
                        color={getStatusColor(order.status)} 
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base">
                        Order #{order.number}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {order.site} • {order.type}
                      </Text>
                    </View>
                  </View>
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: getStatusBgColor(order.status) }}
                  >
                    <Text 
                      className="text-xs font-medium capitalize"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>

                {/* Customer and Date Info */}
                <View className="mb-3 bg-gray-50 rounded-lg p-3">
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="person" size={16} color="#6b7280" />
                    <Text className="text-gray-700 text-sm ml-2 font-medium">
                      {order.customer}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <MaterialIcons name="calendar-today" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {formatDate(order.date)}
                        {/* {order.date} */}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons name="shopping-cart" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {order.lines.length} articles
                      </Text>
                    </View>
                  </View>
                  {order.reference && (
                    <View className="flex-row items-center mt-2">
                      <MaterialIcons name="receipt" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Ref: {order.reference}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Total and Actions */}
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-gray-500 text-xs">Montant total</Text>
                    <Text className="text-black font-bold text-xl">
                      {formatCurrency(order.total, order.currency)}
                    </Text>
                  </View>
                  <TouchableOpacity className="bg-blue-500 rounded-lg px-4 py-2">
                    <Text className="text-white text-sm font-medium">View Details</Text>
                  </TouchableOpacity>
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