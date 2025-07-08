import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, TextInput } from 'react-native'
import React, { useState, useMemo, useEffect } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppButton from '@/components/app-button'
import { useCommandStore } from '@/lib/command-store'
import { createCommande } from '@/services/create-commande'
import { useUserStore } from '@/lib/user-store'
import AddressDropdown from '@/components/address-dropdown'

type Line = {
  itemCode: string;
  qty: number;
  price?: number;
};

type BasketItemDisplay = Line & {
  name?: string;
  category?: string;
  available?: number;
  description?: string;
};

const BasketScreen = () => {
  const { commandParams, setCommandParams, updateCommandField } = useCommandStore()
  const { user } = useUserStore()
  const router = useRouter()
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [tempQuantity, setTempQuantity] = useState<string>('')
  const [selectedAddressCode, setSelectedAddressCode] = useState('');


  // Extract basket items from commandParams.lines
  const basketLines: Line[] = commandParams.lines || []

  // You might want to enrich the lines with additional product data
  // This could come from a product lookup service or cache
  const enrichedBasketItems: BasketItemDisplay[] = useMemo(() => {
    return basketLines.map(line => ({
      ...line,
      name: `Article ${line.itemCode}`, // Replace with actual product lookup
      category: 'General', // Replace with actual category lookup
      description: `Description for ${line.itemCode}`, // Replace with actual description
      price: line.price || 0
    }))
  }, [basketLines])

  // Calculate totals
  const basketTotals = useMemo(() => {
    const totalItems = basketLines.reduce((sum, line) => sum + line.qty, 0)
    const totalPrice = basketLines.reduce((sum, line) => sum + ((line.price || 0) * line.qty), 0)
    const uniqueItems = basketLines.length
    
    return { totalItems, totalPrice, uniqueItems }
  }, [basketLines])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatCurrency = (price: number) => {
    return `${formatPrice(price)} ${commandParams.currency}`
  }

  // Update item quantity
  const updateItemQuantity = (itemCode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemCode)
      return
    }

    const updatedLines = basketLines.map(line =>
      line.itemCode === itemCode
        ? { ...line, qty: newQuantity }
        : line
    )

    setCommandParams({
      ...commandParams,
      lines: updatedLines
    })
  }

  const handleAddressChange = (addressCode: string) => {
    setSelectedAddressCode(addressCode);
    updateCommandField("shipSite", addressCode);
  };

  // Add new item to basket (called from articles screen)
  const addItemToBasket = (itemCode: string, price: number, quantity: number = 1) => {
    const existingLineIndex = basketLines.findIndex(line => line.itemCode === itemCode)
    
    let updatedLines: Line[]
    
    if (existingLineIndex >= 0) {
      // Update existing line
      updatedLines = basketLines.map((line, index) =>
        index === existingLineIndex
          ? { ...line, qty: line.qty + quantity }
          : line
      )
    } else {
      // Add new line
      updatedLines = [...basketLines, { itemCode, qty: quantity, price }]
    }

    setCommandParams({
      ...commandParams,
      lines: updatedLines
    })
  }

  // Remove single item
  const removeItem = (itemCode: string) => {
    Alert.alert(
      "Supprimer l'article",
      "Êtes-vous sûr de vouloir supprimer cet article de la commande ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updatedLines = basketLines.filter(line => line.itemCode !== itemCode)
            setCommandParams({
              ...commandParams,
              lines: updatedLines
            })
          }
        }
      ]
    )
  }

  // Clear entire basket
  const clearBasket = () => {
    Alert.alert(
      "Vider la commande",
      "Êtes-vous sûr de vouloir vider complètement la commande ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Vider",
          style: "destructive",
          onPress: () => {
            setCommandParams({
              ...commandParams,
              lines: []
            })
          }
        }
      ]
    )
  }

  // Navigate to articles to add more items
  const addMoreItems = () => {
    router.push('/articles') // Adjust route as needed
  }

  // Validate basket (process order)
  const validateBasket = () => {
    if (basketLines.length === 0) {
      Alert.alert("Commande vide", "Ajoutez des articles avant de valider votre commande.")
      return
    }

    // Validate that all lines have prices
    const linesWithoutPrice = basketLines.filter(line => !line.price || line.price <= 0)
    if (linesWithoutPrice.length > 0) {
      Alert.alert(
        "Prix manquants", 
        `Certains articles n'ont pas de prix défini: ${linesWithoutPrice.map(l => l.itemCode).join(', ')}`
      )
      return
    }

    Alert.alert(
      "Valider la commande",
      `Confirmer la commande de ${basketTotals.totalItems} articles pour un total de ${formatCurrency(basketTotals.totalPrice)} ?\n\nSite: ${commandParams.site}\nClient: ${commandParams.customer}\nDate: ${formatDate(commandParams.date)}`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            processOrder()
          }
        }
      ]
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (dateString.length === 8) {
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)
      return `${day}/${month}/${year}`
    }
    return dateString
  }

  // Process order function
  const processOrder = async () => {
    if (!selectedAddressCode) {
      Alert.alert("Erreur", "Veuillez sélectionner une adresse.")
      return
    }
    
    try {
      console.log("selectedAddressCode", selectedAddressCode)
      
      // Update the shipSite field first
      updateCommandField("shipSite", selectedAddressCode);
      
      // Create updated command params for the API call
      const updatedCommandParams = {
        ...commandParams,
        shipSite: selectedAddressCode
      };
  
      console.log("Processing order:", {
        commandParams: commandParams,
        totals: basketTotals,
        timestamp: new Date().toISOString()
      })
      
      // Use the updated params for the API call
      const result = await createCommande({
        username: "admin",
        password: "Wazasolutions2025@",
        moduleToImport: "YSOH",
        command: commandParams  // Use updated params here
      })
  
      console.log("result", result)
      
      Alert.alert(
        "Succès", 
        `Commande validée avec succès !\n\nRéférence: ${commandParams.orderType}-${commandParams.date}\nTotal: ${formatCurrency(basketTotals.totalPrice)}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Clear basket after successful order
              setCommandParams({
                ...commandParams,
                lines: []
              })
              // Navigate to orders list
              // router.push('/orders')
            }
          }
        ]
      )
      
    } catch (error) {
      console.error("Order processing error:", error)
      Alert.alert("Erreur", "Une erreur s'est produite lors de la validation de votre commande.")
    }
  }

  // Handle quantity editing
  const startEditingQuantity = (itemCode: string, currentQuantity: number) => {
    setEditingQuantity(itemCode)
    setTempQuantity(currentQuantity.toString())
  }

  const finishEditingQuantity = (itemCode: string) => {
    const newQuantity = parseInt(tempQuantity) || 1
    updateItemQuantity(itemCode, newQuantity)
    setEditingQuantity(null)
    setTempQuantity('')
  }

  const cancelEditingQuantity = () => {
    setEditingQuantity(null)
    setTempQuantity('')
  }

  useEffect(() => {
    // console.log("user", user)
  }, [user])

  if (basketLines.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        
        
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-black text-2xl font-bold mb-1">Commande</Text>
          <Text className="text-gray-600">
            {commandParams.orderType} • Site: {commandParams.site} • Client: {commandParams.customer}
          </Text>
        </View>

        

        {/* Empty State */}
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="shopping-cart" size={80} color="#d1d5db" />
          <Text className="text-gray-900 text-xl font-semibold mt-6 text-center">
            Votre commande est vide
          </Text>
          <Text className="text-gray-600 text-center mt-2 mb-8">
            Ajoutez des articles pour commencer votre commande
          </Text>
          
          <AppButton
            label="Parcourir les articles"
            onPress={addMoreItems}
            className="bg-blue-500 px-8 py-4 rounded-lg flex-row items-center"
            textClasses="text-white font-semibold text-lg"
            icon={<MaterialIcons name="add-shopping-cart" color="white" size={24} />}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-black text-2xl font-bold mb-1">Commande</Text>
            <Text className="text-gray-600">
              {commandParams.orderType} • {formatDate(commandParams.date)}
            </Text>
            <Text className="text-gray-500 text-sm">
              Site: {commandParams.site} • Client: {commandParams.customer}
            </Text>
          </View>
          
          {basketLines.length > 0 && (
            <TouchableOpacity
              onPress={clearBasket}
              className="bg-red-50 p-2 rounded-lg"
            >
              <MaterialIcons name="delete-sweep" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Command Summary */}
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 border border-gray-200">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Résumé de la commande</Text>
        
        {/* Command Details */}
        <View className="bg-gray-50 rounded-lg p-3 mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 text-sm">Type de commande</Text>
            <Text className="text-gray-900 font-medium">{commandParams.orderType}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 text-sm">Site d'expédition</Text>
            <Text className="text-gray-900 font-medium">{commandParams.shipSite}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">Devise</Text>
            <Text className="text-gray-900 font-medium">{commandParams.currency}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-600">Articles ({basketTotals.uniqueItems})</Text>
          <Text className="text-gray-900 font-medium">{basketTotals.totalItems} unités</Text>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">Total</Text>
          <Text className="text-xl font-bold text-gray-900">{formatCurrency(basketTotals.totalPrice)}</Text>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={addMoreItems}
            className="flex-1 bg-gray-100 py-3 rounded-lg flex-row items-center justify-center"
          >
            <MaterialIcons name="add" size={20} color="#374151" />
            <Text className="text-gray-700 font-medium ml-2">Ajouter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={validateBasket}
            className="flex-1 bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
          >
            <MaterialIcons name="check" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Valider</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
      <AddressDropdown
        addresses={user?.addresses || []}
        value={selectedAddressCode}
        onChange={handleAddressChange}  // Use the new handler
        placeholder="Choisissez une adresse..."
      />
    </View>

      {/* Basket Items */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-6">
          {enrichedBasketItems.map((item, index) => (
            <View key={`${item.itemCode}-${index}`} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
              {/* Item Header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-semibold text-gray-900 mb-1" numberOfLines={2}>
                    {item.name || item.itemCode}
                  </Text>
                  <Text className="text-sm text-gray-500 mb-2">
                    Code: {item.itemCode}
                  </Text>
                  {item.category && (
                    <View className="bg-gray-100 self-start px-2 py-1 rounded-full">
                      <Text className="text-xs text-gray-600">{item.category}</Text>
                    </View>
                  )}
                </View>
                
                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => removeItem(item.itemCode)}
                  className="bg-red-50 p-2 rounded-lg"
                >
                  <MaterialIcons name="delete" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>

              {/* Price and Quantity Controls */}
              <View className="flex-row items-center justify-between">
                {/* Price Section */}
                <View>
                  <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Prix unitaire
                  </Text>
                  <Text className="text-lg font-bold text-gray-900">
                    {item.price ? formatCurrency(item.price) : 'Prix non défini'}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => updateItemQuantity(item.itemCode, item.qty - 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 items-center justify-center"
                    disabled={item.qty <= 1}
                  >
                    <MaterialIcons 
                      name="remove" 
                      size={20} 
                      color={item.qty <= 1 ? "#d1d5db" : "#374151"} 
                    />
                  </TouchableOpacity>

                  {editingQuantity === item.itemCode ? (
                    <View className="mx-4 flex-row items-center">
                      <TextInput
                        value={tempQuantity}
                        onChangeText={setTempQuantity}
                        keyboardType="numeric"
                        className="w-16 h-10 border border-blue-500 rounded-lg text-center font-bold text-lg"
                        selectTextOnFocus
                        onSubmitEditing={() => finishEditingQuantity(item.itemCode)}
                        onBlur={() => finishEditingQuantity(item.itemCode)}
                        autoFocus
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => startEditingQuantity(item.itemCode, item.qty)}
                      className="mx-4 min-w-[60px] items-center"
                    >
                      <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Quantité
                      </Text>
                      <Text className="text-2xl font-bold text-gray-900">
                        {item.qty}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => updateItemQuantity(item.itemCode, item.qty + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-blue-500 bg-blue-500 items-center justify-center"
                  >
                    <MaterialIcons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Item Total */}
              <View className="mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">
                    {item.qty} × {item.price ? formatCurrency(item.price) : 'N/A'}
                  </Text>
                  <Text className="text-lg font-bold text-blue-600">
                    {item.price ? formatCurrency(item.price * item.qty) : 'Prix à définir'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={clearBasket}
            className="flex-1 bg-red-50 border border-red-200 py-4 rounded-lg flex-row items-center justify-center"
          >
            <MaterialIcons name="clear" size={20} color="#ef4444" />
            <Text className="text-red-600 font-medium ml-2">Vider</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={validateBasket}
            className="flex-2 bg-blue-500 py-4 rounded-lg flex-row items-center justify-center"
            style={{ flex: 2 }}
          >
            <MaterialIcons name="shopping-cart-checkout" size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-lg">
              Valider • {formatCurrency(basketTotals.totalPrice)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default BasketScreen