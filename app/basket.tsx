import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, TextInput, ActivityIndicator, Modal } from 'react-native'
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'expo-router'
import AppButton from '@/components/app-button'
import { useCommandStore } from '@/lib/command-store'
import { createCommande } from '@/services/create-commande'
import { useUserStore } from '@/lib/user-store'
import AddressDropdown from '@/components/address-dropdown'
import { useArticleStore } from '@/lib/article-store'
import { getTarif } from '@/services/tarif-service'
import { MaterialIcons } from '@expo/vector-icons'
import LoadingModal from '@/components/laoding-modal'


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
  unitPrice?: number; // Individual item price
  mtnetPrice?: number; // Price from getTarif (.MTNET)
  isLoadingPrice?: boolean;
};

type TarifResponse = {
  MTNET: string;
  CLIENT: string;
    ARTICLE: string;
    QTY: string;
    SVTE: string;
    SEXP: string;
    UOM: string;
    CUR: string;
    GROPRI: string;
    PRINET: string;
  // [key: string]: any;
};

const BasketScreen = () => {
  const { commandParams, setCommandParams, updateCommandField } = useCommandStore()
  const { user } = useUserStore()
  const router = useRouter()
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [tempQuantity, setTempQuantity] = useState<string>('')
  const [selectedAddressCode, setSelectedAddressCode] = useState('');
  const { articles } = useArticleStore()
  const [itemMtnetPrices, setItemMtnetPrices] = useState<Record<string, number>>({})
  const [loadingPrices, setLoadingPrices] = useState<Record<string, boolean>>({})
  const [showAddressPrompt, setShowAddressPrompt] = useState(false)
  const [loading, setLoading] = useState(false);


  // Extract basket items from commandParams.lines
  const basketLines: Line[] = commandParams.lines || []

  // Function to get article tariff with .MTNET value
  const getArticleTarif = async (item: Line): Promise<number> => {
    const article = articles.find(article => article.itemCode === item.itemCode)

    if (!article) {
      console.warn(`Article not found: ${item.itemCode}`)
      return 0
    }

    if (!selectedAddressCode) {
      console.warn(`No address selected for pricing calculation`)
      return 0
    }

    if (!user?.header?.customerCode) {
      console.warn(`No customer code available`)
      return 0
    }

    try {
      setLoading(true)
      const tarif: TarifResponse = await getTarif({
        username: 'admin',
        password: 'Wazasolutions2025@',
        client: user.header.customerCode,
        article: item.itemCode,
        qty: item.qty,
        cur: commandParams.currency || 'EUR',
        svte: commandParams.site || 'FR011',
        sexp: selectedAddressCode,
        uom: article.salesUoM
      })
      
      // Return the MTNET value exclusively, handle both string and number types
      const mtnetValue = tarif?.MTNET ? parseFloat(tarif.MTNET.toString()) : 0
      // Ensure it's a valid number after parsing
      const validMtnetValue = !isNaN(mtnetValue) ? mtnetValue : 0
      console.log(`MTNET price for ${item.itemCode} (qty: ${item.qty}):`, validMtnetValue)
      setLoading(false)
      return validMtnetValue
      
    } catch (error) {
      console.error('Error fetching tariff for', item.itemCode, error)
      setLoading(false)
      return 0
    }
  }

  // Calculate prices for all items
  const calculateAllPrices = useCallback(async () => {
    if (!selectedAddressCode || !user?.header?.customerCode || basketLines.length === 0) {
      return
    }

    console.log('Calculating prices for all items...')
    
    // Set loading state for all items
    const loadingState: Record<string, boolean> = {}
    basketLines.forEach(item => {
      const key = `${item.itemCode}-${item.qty}`
      loadingState[key] = true
    })
    setLoadingPrices(loadingState)

    // Calculate prices for all items
    const pricePromises = basketLines.map(async (item) => {
      const key = `${item.itemCode}-${item.qty}`
      
      try {
        const mtnetPrice = await getArticleTarif(item)
        // Ensure the price is a valid number
        const validPrice = typeof mtnetPrice === 'number' && !isNaN(mtnetPrice) ? mtnetPrice : 0
        return { key, price: validPrice }
      } catch (error) {
        console.error('Error calculating price for', item.itemCode, error)
        return { key, price: 0 }
      }
    })

    const results = await Promise.all(pricePromises)
    
    // Update prices state
    const newPrices: Record<string, number> = {}
    const newLoadingState: Record<string, boolean> = {}
    
    results.forEach(({ key, price }) => {
      // Ensure we only store valid numbers
      newPrices[key] = typeof price === 'number' && !isNaN(price) ? price : 0
      newLoadingState[key] = false
    })

    setItemMtnetPrices(newPrices)
    setLoadingPrices(newLoadingState)
    
    console.log('Price calculation completed:', newPrices)
  }, [selectedAddressCode, user?.header?.customerCode, basketLines, articles])

  // Trigger price calculation when address changes
  useEffect(() => {
    if (selectedAddressCode && basketLines.length > 0) {
      calculateAllPrices()
    } else if (!selectedAddressCode && basketLines.length > 0) {
      // Clear prices when no address is selected
      setItemMtnetPrices({})
      setShowAddressPrompt(true)
    }
  }, [selectedAddressCode, calculateAllPrices])

  // Trigger price calculation when items change (debounced)
  useEffect(() => {
    if (selectedAddressCode && basketLines.length > 0) {
      const timeoutId = setTimeout(() => {
        calculateAllPrices()
      }, 500) // Debounce to avoid too many API calls

      return () => clearTimeout(timeoutId)
    }
  }, [basketLines, calculateAllPrices])

  // Enhanced basket items with refined pricing
  const enrichedBasketItems: BasketItemDisplay[] = useMemo(() => {
    return basketLines.map(line => {
      const key = `${line.itemCode}-${line.qty}`
      const article = articles.find(a => a.itemCode === line.itemCode)
      
      return {
        ...line,
        name: article?.description || `Article ${line.itemCode}`,
        category: article?.category || article?.family || 'General',
        description: article?.description || `Description for ${line.itemCode}`,
        unitPrice: article?.salesPrice || line.price || 0, // Individual item price
        mtnetPrice: itemMtnetPrices[key], // Total price from .MTNET
        isLoadingPrice: loadingPrices[key] || false
      }
    })
  }, [basketLines, articles, itemMtnetPrices, loadingPrices])

  // Calculate totals using exclusively .MTNET values - FIXED VERSION
  const basketTotals = useMemo(() => {
    const totalItems = basketLines.reduce((sum, line) => sum + (line.qty || 0), 0)
    
    // Sum all .MTNET values (total price for each card) - with proper null checking
    const totalPrice = enrichedBasketItems.reduce((sum, item) => {
      // Ensure we handle undefined/null mtnetPrice properly
      const mtnetPrice = typeof item.mtnetPrice === 'number' && !isNaN(item.mtnetPrice) ? item.mtnetPrice : 0
      return sum + mtnetPrice
    }, 0)
    
    // Fallback total using catalog prices when MTNET prices aren't available
    const catalogTotal = enrichedBasketItems.reduce((sum, item) => {
      const catalogPrice = (typeof item.unitPrice === 'number' ? item.unitPrice : 0) * (item.qty || 0)
      return sum + catalogPrice
    }, 0)
    
    const uniqueItems = basketLines.length
    
    // Check if we have any calculated MTNET prices
    const hasCalculatedPrices = enrichedBasketItems.some(item => 
      typeof item.mtnetPrice === 'number' && !isNaN(item.mtnetPrice) && item.mtnetPrice > 0
    )
    
    // Check if any prices are still loading
    const hasLoadingPrices = Object.values(loadingPrices).some(loading => loading === true)
    
    console.log('Basket totals calculation:', {
      totalItems,
      totalPrice,
      catalogTotal,
      hasCalculatedPrices,
      hasLoadingPrices,
      enrichedBasketItems: enrichedBasketItems.map(item => ({
        itemCode: item.itemCode,
        mtnetPrice: item.mtnetPrice,
        unitPrice: item.unitPrice,
        qty: item.qty
      }))
    })
    
    return { 
      totalItems, 
      totalPrice: typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice : 0, 
      catalogTotal: typeof catalogTotal === 'number' && !isNaN(catalogTotal) ? catalogTotal : 0,
      uniqueItems,
      hasCalculatedPrices,
      hasLoadingPrices
    }
  }, [basketLines, enrichedBasketItems, loadingPrices])

  const formatPrice = (price: number) => {
    // Ensure price is a valid number before formatting
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(validPrice)
  }

  const formatCurrency = (price: number) => {
    return `${formatPrice(price)} ${commandParams.currency || 'EUR'}`
  }

  // Calculate unit price from MTNET total
  const calculateUnitPriceFromMtnet = (mtnetTotal: number, quantity: number): number => {
    if (typeof mtnetTotal !== 'number' || isNaN(mtnetTotal) || quantity <= 0) {
      return 0
    }
    return mtnetTotal / quantity
  }

  // Update item quantity and recalculate prices
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

    // Prompt for address if not selected
    if (!selectedAddressCode) {
      setShowAddressPrompt(true)
    }
  }

  const handleAddressChange = (addressCode: string) => {
    setSelectedAddressCode(addressCode);
    updateCommandField("shipSite", addressCode);
    setShowAddressPrompt(false)
    // Clear existing prices to trigger recalculation
    setItemMtnetPrices({})
  };

  // Add new item to basket and trigger price calculation
  const addItemToBasket = (itemCode: string, price: number, quantity: number = 1) => {
    const existingLineIndex = basketLines.findIndex(line => line.itemCode === itemCode)
    
    let updatedLines: Line[]
    
    if (existingLineIndex >= 0) {
      updatedLines = basketLines.map((line, index) =>
        index === existingLineIndex
          ? { ...line, qty: line.qty + quantity }
          : line
      )
    } else {
      updatedLines = [...basketLines, { itemCode, qty: quantity, price }]
    }

    setCommandParams({
      ...commandParams,
      lines: updatedLines
    })

    // Prompt for address if not selected
    if (!selectedAddressCode) {
      setShowAddressPrompt(true)
    }
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
            
            // Clear price for removed item
            const newPrices = { ...itemMtnetPrices }
            Object.keys(newPrices).forEach(key => {
              if (key.startsWith(itemCode)) {
                delete newPrices[key]
              }
            })
            setItemMtnetPrices(newPrices)
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
            setItemMtnetPrices({})
            setLoadingPrices({})
            setShowAddressPrompt(false)
          }
        }
      ]
    )
  }

  // Navigate to articles to add more items
  const addMoreItems = () => {
    router.back()
  }

  // Validate basket with refined pricing logic
  const validateBasket = () => {
    if (basketLines.length === 0) {
      Alert.alert("Commande vide", "Ajoutez des articles avant de valider votre commande.")
      return
    }

    if (!selectedAddressCode) {
      Alert.alert("Adresse manquante", "Veuillez sélectionner une adresse de livraison pour calculer les prix.")
      return
    }

    // Check if prices are still loading
    const hasLoadingPrices = Object.values(loadingPrices).some(loading => loading)
    if (hasLoadingPrices) {
      Alert.alert("Calcul en cours", "Veuillez attendre que tous les prix soient calculés.")
      return
    }

    // Use the appropriate total (MTNET if available, otherwise catalog)
    const finalTotal = basketTotals.hasCalculatedPrices ? basketTotals.totalPrice : basketTotals.catalogTotal

    Alert.alert(
      "Valider la commande",
      `Confirmer la commande de ${basketTotals.totalItems} articles pour un total de ${formatCurrency(finalTotal)} ?\n\nSite: ${commandParams.site}\nClient: ${commandParams.customer}\nDate: ${formatDate(commandParams.date)}`,
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
    if (dateString && dateString.length === 8) {
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)
      return `${day}/${month}/${year}`
    }
    return dateString || ''
  }

  // Process order with calculated .MTNET prices
  const processOrder = async () => {
    try {
      // Update lines with calculated unit prices from .MTNET
      const updatedLines = basketLines.map(line => {
        const key = `${line.itemCode}-${line.qty}`
        const mtnetTotal = itemMtnetPrices[key] || 0
        const unitPrice = calculateUnitPriceFromMtnet(mtnetTotal, line.qty)
        
        return {
          ...line,
          price: unitPrice > 0 ? unitPrice : (line.price || 0)
        }
      })

      const updatedCommandParams = {
        ...commandParams,
        shipSite: selectedAddressCode,
        lines: updatedLines
      }

      console.log("Processing order with .MTNET calculated prices:", updatedCommandParams)
      
      const result = await createCommande({
        username: "admin",
        password: "Wazasolutions2025@",
        moduleToImport: "YSOH",
        command: updatedCommandParams
      })

      console.log("Order result:", result)
      
      const finalTotal = basketTotals.hasCalculatedPrices ? basketTotals.totalPrice : basketTotals.catalogTotal
      
      Alert.alert(
        "Succès", 
        `Commande validée avec succès !\n\nRéférence: ${commandParams.orderType}-${commandParams.date}\nTotal: ${formatCurrency(finalTotal)}`,
        [
          {
            text: "OK",
            onPress: () => {
              setCommandParams({
                ...commandParams,
                lines: []
              })
              setItemMtnetPrices({})
              setLoadingPrices({})
              setShowAddressPrompt(false)
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

  // Address prompt component
  const AddressPrompt = () => {
    if (!showAddressPrompt || selectedAddressCode) return null

    return (
      <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-6 mt-4">
        {loading && <LoadingModal visible={true} message="Please wait..." />}
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="warning" size={20} color="#f59e0b" />
          <Text className="text-yellow-800 font-medium ml-2">Adresse requise</Text>
        </View>
        <Text className="text-yellow-700 text-sm mb-3">
          Veuillez sélectionner une adresse de livraison pour calculer les prix exacts.
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddressPrompt(false)}
          className="self-end"
        >
          <Text className="text-yellow-600 text-sm font-medium">Compris</Text>
        </TouchableOpacity>
      </View>
    )
  }

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
            onPress={() => router.push('/articles')}
            className="bg-blue-500 px-8 py-4 rounded-lg flex-row items-center"
            textClasses="text-white font-semibold text-lg"
            icon={<MaterialIcons name="add-shopping-cart" color="white" size={24} />}
          />
        </View>
      </SafeAreaView>
    )
  }

  // Determine which total to display
  const displayTotal = basketTotals.hasCalculatedPrices ? basketTotals.totalPrice : basketTotals.catalogTotal
  const totalLabel = basketTotals.hasCalculatedPrices ? "Total (prix calculés)" : "Total (prix catalogue)"

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* <Modal>
        <View>
          
        </View>
      </Modal> */}
      
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

      {/* Address Selection */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <AddressDropdown
          addresses={user?.addresses || []}
          value={selectedAddressCode}
          onChange={handleAddressChange}
          placeholder="Choisissez une adresse de livraison..."
          label="Adresse de livraison"
        />
      </View>

      {/* Address Prompt */}
      <AddressPrompt />

      {/* Command Summary - Shows sum of all .MTNET totals */}
      <View className="bg-white mx-6 mt-4 rounded-xl p-4 border border-gray-200">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Résumé de la commande</Text>
        
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-600">Articles ({basketTotals.uniqueItems})</Text>
          <Text className="text-gray-900 font-medium">{basketTotals.totalItems} unités</Text>
        </View>
        
        {basketTotals.hasLoadingPrices ? (
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Total</Text>
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-lg text-blue-600 ml-2">Calcul en cours...</Text>
            </View>
          </View>
        ) : selectedAddressCode ? (
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">{totalLabel}</Text>
            <Text className={`text-xl font-bold ${basketTotals.hasCalculatedPrices ? 'text-green-600' : 'text-blue-600'}`}>
              {formatCurrency(displayTotal)}
            </Text>
          </View>
        ) : (
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Total</Text>
            <Text className="text-lg text-gray-500">Sélectionnez une adresse</Text>
          </View>
        )}
        
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
            className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
              selectedAddressCode && displayTotal > 0 && !basketTotals.hasLoadingPrices
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            }`}
            disabled={!selectedAddressCode || displayTotal === 0 || basketTotals.hasLoadingPrices}
          >
            <MaterialIcons 
              name="check" 
              size={20} 
              color={selectedAddressCode && displayTotal > 0 && !basketTotals.hasLoadingPrices ? "white" : "#9ca3af"} 
            />
            <Text className={`font-semibold ml-2 ${
              selectedAddressCode && displayTotal > 0 && !basketTotals.hasLoadingPrices
                ? 'text-white' 
                : 'text-gray-500'
            }`}>
              Valider
            </Text>
          </TouchableOpacity>
        </View>
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
                {/* Prix unitaire - Individual item price */}
                <View>
                  <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Prix unitaire (catalogue)
                  </Text>
                  <Text className="text-lg font-bold text-gray-900">
                    {formatCurrency(item.unitPrice || 0)}
                  </Text>
                  {item.mtnetPrice !== undefined && selectedAddressCode && (
                    <Text className="text-xs text-blue-600 mt-1">
                      Prix calculé: {formatCurrency(calculateUnitPriceFromMtnet(item.mtnetPrice, item.qty))}
                    </Text>
                  )}
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

              {/* Item Total - Exclusively from .MTNET */}
              <View className="mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">
                    Total pour cette ligne
                  </Text>
                  {item.isLoadingPrice ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#3b82f6" />
                      <Text className="text-sm text-gray-500 ml-2">Calcul...</Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-blue-600">
                      {typeof item.mtnetPrice === 'number' && !isNaN(item.mtnetPrice)
                        ? formatCurrency(item.mtnetPrice)
                        : (selectedAddressCode ? formatCurrency((item.unitPrice || 0) * item.qty) : 'Adresse requise')
                      }
                    </Text>
                  )}
                </View>
                {typeof item.mtnetPrice === 'number' && !isNaN(item.mtnetPrice) && selectedAddressCode && (
                  <Text className="text-xs text-green-600 mt-1">
                    ✓ Prix calculé avec tarification client
                  </Text>
                )}
                {!selectedAddressCode && (
                  <Text className="text-xs text-orange-600 mt-1">
                    ⚠ Sélectionnez une adresse pour calculer le prix
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {/* <View className="bg-white border-t border-gray-200 px-6 py-4">
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
            className={`flex-2 py-4 rounded-lg flex-row items-center justify-center ${
              selectedAddressCode && displayTotal > 0 && !basketTotals.hasLoadingPrices
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            }`}
            style={{ flex: 2 }}
            disabled={!selectedAddressCode || displayTotal === 0 || basketTotals.hasLoadingPrices}
          >
            <MaterialIcons 
              name="shopping-cart-checkout" 
              size={20} 
              color={selectedAddressCode && displayTotal > 0 && !basketTotals.hasLoadingPrices ? "white" : "#9ca3af"} 
            />
            <Text className={`font-semibold ml-2 text-lg ${
              selectedAddressCode && displayTotal > 0 && !basketTotals.hasLoadingPrices
                ? 'text-white' 
                : 'text-gray-500'
            }`}>
              Valider • {selectedAddressCode && !basketTotals.hasLoadingPrices ? formatCurrency(displayTotal) : 'Adresse requise'}
            </Text>
          </TouchableOpacity>
        </View>
      </View> */}
    </SafeAreaView>
  )
}

export default BasketScreen