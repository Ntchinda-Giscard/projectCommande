import { View, Text, ScrollView, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import AppButton from '@/components/app-button'
import { MaterialIcons } from '@expo/vector-icons'
import ArticesCard from '@/components/articles-card'
import { useRouter } from 'expo-router'
import { listArticles } from '@/services/articles-services'
import { getTarif } from '@/services/tarif-service'
import { useUserStore } from '@/lib/user-store'
import { useCommandStore } from '@/lib/command-store'
import { useArticleStore } from '@/lib/article-store'

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
  const { commandParams, setCommandParams, updateCommandField } = useCommandStore()
  const router = useRouter()
  
  const setStoreArticles = useArticleStore((state) => state.setArticles)

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
      setStoreArticles(fetchedArticles || [])
      
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

  const handleAddToCart = async (itemCode: string, price: number, amount: number) => {
    // const item = articles.find(item => item.itemCode === itemCode)
    // if (item) {
    //   const response =  await getTarif({
    //     article: itemCode,
    //     client: user?.header?.customerCode || '',
    //     qty: amount,
    //     cur: 'EUR',
    //     svte: 'FR011',
    //     //@ts-ignore
    //     sexp: user?.addresses[0]?.code,
    //     uom: item.salesUoM,
    //     username: 'admin',
    //     password: 'Wazasolutions2025@',
    //   })
    // }
    
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

    
    // console.log("Item:", item)
    

    console.log("Cart updated:", cart)
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

    console.log("Cart updated:", cart)
  }

  // Enhanced search function - case insensitive and includes multiple fields
  const searchArticles = (article: Material, query: string): boolean => {
    if (!query.trim()) return true
    
    const searchTerm = query.toLowerCase().trim()
    
    // Search in description
    const descriptionMatch = article.description?.toLowerCase().includes(searchTerm) || false
    
    // Search in baseUoM
    const baseUoMMatch = article.baseUoM?.toLowerCase().includes(searchTerm) || false
    
    // Search in itemCode
    const itemCodeMatch = article.itemCode?.toLowerCase().includes(searchTerm) || false
    
    // Search in category/family
    const categoryMatch = article.category?.toLowerCase().includes(searchTerm) || false
    const familyMatch = article.family?.toLowerCase().includes(searchTerm) || false
    
    // Return true if any field matches
    return descriptionMatch || baseUoMMatch || itemCodeMatch || categoryMatch || familyMatch
  }

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryCount = articles.reduce((acc, article) => {
      const category = article.category || article.family || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const uniqueCategories = Object.keys(categoryCount).filter(Boolean)
    
    return {
      all: uniqueCategories,
      counts: categoryCount,
      total: articles.length
    }
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
      
      // Enhanced search filter
      const matchesSearch = searchArticles(article, searchQuery)
      
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
    setCommandParams({
      ...commandParams,
      lines: cart.map(item => ({
        itemCode: item.itemCode,
        qty: item.quantity,
        price: item.price
      }))
    })
    return { totalItems, totalPrice }
  }, [cart])

  // Calculate availability statistics


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

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setAvailabilityFilter('all')
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || availabilityFilter !== 'all'

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Chargement des articles...</Text>
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
          <Text className="text-white font-medium">Réessayer</Text>
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
          // label={`Panier (${cartTotals.totalItems}) - ${formatPrice(cartTotals.totalPrice)} XAF`}
          label={`Panier (${cartTotals.totalItems})`}
          onPress={() => router.push("/basket")}
          className='bg-blue-500 text-white px-4 py-3 rounded-lg flex flex-row items-center'
          textClasses='text-center font-medium text-white text-sm'
          icon={<MaterialIcons name="shopping-cart" color="white" size={18} />}
        />
      </View>

      {/* Enhanced Search Bar */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <MaterialIcons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Rechercher par nom, code, catégorie ou UoM..."
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
        {searchQuery.trim() !== '' && (
          <View className="mt-2">
            <Text className="text-xs text-gray-500">
              Recherche dans: nom, code article, catégorie, famille et unité de mesure
            </Text>
          </View>
        )}
      </View>

      {/* Availability Filter */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-medium text-gray-900">Filtrer par disponibilité</Text>
          {hasActiveFilters && (
            <TouchableOpacity 
              onPress={clearAllFilters}
              className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full"
            >
              <MaterialIcons name="clear-all" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-xs ml-1">Effacer tout</Text>
            </TouchableOpacity>
          )}
        </View>
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

      {/* Enhanced Category Filter with View All */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-900 mb-3">Filtrer par catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* View All Button */}
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            className={`mr-3 px-4 py-2 rounded-full border flex-row items-center ${
              selectedCategory === 'all'
                ? "bg-blue-500 border-blue-500"
                : "bg-white border-gray-300"
            }`}
          >
            <MaterialIcons 
              name="view-list" 
              size={16} 
              color={selectedCategory === 'all' ? "white" : "#6b7280"} 
            />
            <Text className={`font-medium ml-2 ${
              selectedCategory === 'all' ? "text-white" : "text-gray-600"
            }`}>
              Voir tout ({categories.total})
            </Text>
          </TouchableOpacity>

          {/* Category Buttons */}
          {categories.all.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-3 px-4 py-2 rounded-full border flex-row items-center ${
                selectedCategory === category
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <MaterialIcons 
                name="category" 
                size={16} 
                color={selectedCategory === category ? "white" : "#6b7280"} 
              />
              <Text className={`font-medium ml-2 capitalize ${
                selectedCategory === category ? "text-white" : "text-gray-600"
              }`}>
                {category} ({categories.counts[category]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="search-off" size={64} color="#6b7280" />
          <Text className="text-gray-900 text-lg font-semibold mt-4 text-center">
            Aucun article trouvé
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            {hasActiveFilters
              ? "Essayez d'ajuster vos critères de recherche ou de filtre"
              : "Aucun article n'est actuellement disponible"}
          </Text>
          <View className="flex-row mt-4 space-x-2">
            {hasActiveFilters && (
              <TouchableOpacity 
                onPress={clearAllFilters}
                className="bg-gray-500 px-4 py-2 rounded-lg mr-2"
              >
                <Text className="text-white font-medium">Effacer les filtres</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={onRefresh}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Actualiser</Text>
            </TouchableOpacity>
          </View>
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
                {searchQuery.trim() !== '' && ` • Recherche: "${searchQuery}"`}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity 
                  onPress={clearAllFilters}
                  className="mt-2 self-start"
                >
                  <Text className="text-blue-500 text-sm underline">
                    Effacer tous les filtres
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  )
}

export default Articles

