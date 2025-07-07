import { View, Text, ScrollView, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import AppButton from '@/components/app-button'
import { MaterialIcons } from '@expo/vector-icons'
import ArticesCard from '@/components/articles-card'
import { useRouter } from 'expo-router'
import { listArticles } from '@/services/articles-services'

type PartyInfo = {
  plant: string;
  location: string;
  stockStatus: string;
  onHandQty: number;
  uom: string;
  uomConversion: number;
};

type Material = {
  itemCode: string;
  family: string;
  description: string;
  baseUoM: string;
  salesUoM: string;
  weightPerUoM: number;
  purchaseUoM: string;
  purchaseConversion: number;
  minStockLevel: number;
  category: string;
  status: string;
  salesPrice?: number;
  parties: PartyInfo[];
};

type CartItem = {
  itemCode: string;
  quantity: number;
  price: number;
};

type ArticleCardProps = {
  id: string;
  name: string;
  price: number;
  image: string;
  available: number;
  category: string;
  onAddArticle: (price: number, amount: number) => void;
  onRemoveArticle: (price: number, amount: number) => void;
};

type AvailabilityFilter = 'all' | 'available' | 'unavailable' | 'low-stock';

const Articles = () => {
  const [articles, setArticles] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all')
  const router = useRouter()

  const loadArticles = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      setError(null)
      
      const fetchedArticles = await listArticles({
        username: 'admin',
        password: 'Wazasolutions2025@',
        moduleToExport: 'ITM'
      })
      
      setArticles(fetchedArticles || [])
      console.log("Articles loaded:", fetchedArticles?.length || 0)
    } catch (err) {
      console.error("Error loading articles:", err)
      setError("Failed to load articles. Please try again.")
      setArticles([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const onRefresh = () => {
    loadArticles(true)
  }

  // Convert Material to ArticleCardProps format
  const convertMaterialToArticleCard = (material: Material): ArticleCardProps => {
    const totalStock = material.parties.reduce((sum, party) => sum + party.onHandQty, 0)
    const defaultPrice = material.salesPrice || 0
    
    return {
      id: material.itemCode,
      name: material.description,
      price: defaultPrice,
      image: "/placeholder.svg?height=200&width=200",
      available: totalStock,
      category: material.category || material.family,
      onAddArticle: (price: number, amount: number) => handleAddToCart(material.itemCode, price, amount),
      onRemoveArticle: (price: number, amount: number) => handleRemoveFromCart(material.itemCode, price, amount)
    }
  }

  const handleAddToCart = (itemCode: string, price: number, amount: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.itemCode === itemCode)
      if (existingItem) {
        return prevCart.map(item =>
          item.itemCode === itemCode
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
      } else {
        return [...prevCart, { itemCode, quantity: amount, price }]
      }
    })
  }

  const handleRemoveFromCart = (itemCode: string, price: number, amount: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.itemCode === itemCode)
      if (existingItem) {
        if (existingItem.quantity <= amount) {
          return prevCart.filter(item => item.itemCode !== itemCode)
        } else {
          return prevCart.map(item =>
            item.itemCode === itemCode
              ? { ...item, quantity: item.quantity - amount }
              : item
          )
        }
      }
      return prevCart
    })
  }

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(articles.map(article => article.category || article.family))]
    return ['all', ...uniqueCategories.filter(Boolean)]
  }, [articles])

  // Availability filter options
  const availabilityOptions = [
    { key: 'all' as AvailabilityFilter, label: 'Tous', icon: 'inventory' },
    { key: 'available' as AvailabilityFilter, label: 'Disponible', icon: 'check-circle' },
    { key: 'low-stock' as AvailabilityFilter, label: 'Stock faible', icon: 'warning' },
    { key: 'unavailable' as AvailabilityFilter, label: 'Indisponible', icon: 'remove-circle' },
  ]

  // Filter articles based on search, category, and availability
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const totalStock = article.parties.reduce((sum, party) => sum + party.onHandQty, 0)
      
      // Search filter
      const matchesSearch = article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
                             article.category === selectedCategory || 
                             article.family === selectedCategory
      
      // Availability filter
      let matchesAvailability = true
      switch (availabilityFilter) {
        case 'available':
          matchesAvailability = totalStock > 5
          break
        case 'low-stock':
          matchesAvailability = totalStock > 0 && totalStock <= 5
          break
        case 'unavailable':
          matchesAvailability = totalStock === 0
          break
        case 'all':
        default:
          matchesAvailability = true
          break
      }
      
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [articles, searchQuery, selectedCategory, availabilityFilter])

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return { totalItems, totalPrice }
  }, [cart])

  // Calculate availability statistics
  const availabilityStats = useMemo(() => {
    const stats = articles.reduce((acc, article) => {
      const totalStock = article.parties.reduce((sum, party) => sum + party.onHandQty, 0)
      
      if (totalStock === 0) {
        acc.unavailable++
      } else if (totalStock <= 5) {
        acc.lowStock++
      } else {
        acc.available++
      }
      
      return acc
    }, { available: 0, lowStock: 0, unavailable: 0 })
    
    return {
      ...stats,
      total: articles.length
    }
  }, [articles])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const getAvailabilityColor = (filterKey: AvailabilityFilter) => {
    switch (filterKey) {
      case 'available': return '#10b981'
      case 'low-stock': return '#f59e0b'
      case 'unavailable': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getAvailabilityBgColor = (filterKey: AvailabilityFilter) => {
    switch (filterKey) {
      case 'available': return '#d1fae5'
      case 'low-stock': return '#fef3c7'
      case 'unavailable': return '#fee2e2'
      default: return '#f3f4f6'
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading articles...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text className="text-red-600 text-lg font-semibold mt-4 text-center">
          {error}
        </Text>
        <TouchableOpacity 
          onPress={() => loadArticles()}
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-gray-50'>
      {/* Header with Cart */}
      <View className='flex flex-row items-center justify-between bg-white p-5 border-b border-gray-200'>
        <View>
          <Text className="text-2xl font-bold text-gray-900">Articles</Text>
          <Text className="text-gray-600 text-sm">{articles.length} articles au total</Text>
        </View>
        <AppButton
          label={`Panier (${cartTotals.totalItems}) - ${formatPrice(cartTotals.totalPrice)} XAF`}
          onPress={() => router.push("/basket")}
          className='bg-blue-500 text-white px-4 py-3 rounded-lg flex flex-row items-center'
          textClasses='text-center font-medium text-white text-sm'
          icon={<MaterialIcons name="shopping-cart" color="white" size={18} />}
        />
      </View>

      {/* Availability Statistics */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-900 mb-3">État des stocks</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mb-1">
              <Text className="text-green-600 text-lg font-bold">{availabilityStats.available}</Text>
            </View>
            <Text className="text-green-600 text-xs font-medium">Disponible</Text>
          </View>
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mb-1">
              <Text className="text-yellow-600 text-lg font-bold">{availabilityStats.lowStock}</Text>
            </View>
            <Text className="text-yellow-600 text-xs font-medium">Stock faible</Text>
          </View>
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mb-1">
              <Text className="text-red-600 text-lg font-bold">{availabilityStats.unavailable}</Text>
            </View>
            <Text className="text-red-600 text-xs font-medium">Indisponible</Text>
          </View>
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mb-1">
              <Text className="text-gray-600 text-lg font-bold">{availabilityStats.total}</Text>
            </View>
            <Text className="text-gray-600 text-xs font-medium">Total</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <MaterialIcons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Rechercher des articles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6b7280"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Availability Filter */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-900 mb-3">Filtrer par disponibilité</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availabilityOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setAvailabilityFilter(option.key)}
              className={`mr-3 px-4 py-2 rounded-full border flex-row items-center ${
                availabilityFilter === option.key
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              style={{
                backgroundColor: availabilityFilter === option.key 
                  ? getAvailabilityBgColor(option.key)
                  : '#ffffff'
              }}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={16} 
                color={availabilityFilter === option.key ? getAvailabilityColor(option.key) : "#6b7280"} 
              />
              <Text className={`font-medium ml-2 ${
                availabilityFilter === option.key 
                  ? "text-gray-900" 
                  : "text-gray-600"
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-900 mb-3">Filtrer par catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                selectedCategory === category
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text className={`font-medium capitalize ${
                selectedCategory === category ? "text-white" : "text-gray-600"
              }`}>
                {category === 'all' ? 'Toutes les catégories' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="inventory-2" size={64} color="#6b7280" />
          <Text className="text-gray-900 text-lg font-semibold mt-4 text-center">
            Aucun article trouvé
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            {searchQuery || selectedCategory !== 'all' || availabilityFilter !== 'all'
              ? "Essayez d'ajuster vos critères de recherche ou de filtre"
              : "Aucun article n'est actuellement disponible"}
          </Text>
          <TouchableOpacity 
            onPress={onRefresh}
            className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Actualiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          className='px-5'
          data={filteredArticles}
          keyExtractor={(item) => item.itemCode}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingVertical: 16 }}
          renderItem={({ item }) => {
            const articleProps = convertMaterialToArticleCard(item)
            return (
              <View className="mb-4">
                <ArticesCard {...articleProps} />
              </View>
            )
          }}
          ListHeaderComponent={() => (
            <View className="mb-4">
              <Text className="text-gray-600 text-sm">
                Affichage de {filteredArticles.length} sur {articles.length} articles
                {availabilityFilter !== 'all' && ` • Filtre: ${availabilityOptions.find(opt => opt.key === availabilityFilter)?.label}`}
                {selectedCategory !== 'all' && ` • Catégorie: ${selectedCategory}`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

export default Articles