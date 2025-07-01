import { View, Text, ScrollView, FlatList } from 'react-native'
import React, { useState } from 'react'
import AppButton from '@/components/app-button'
import { MaterialIcons } from '@expo/vector-icons'
import ArticesCard from '@/components/articles-card'
import { useRouter } from 'expo-router'


const articles = [
    {
      id: "1",
      name: "Fresh Croissants",
      image: "/placeholder.svg?height=200&width=200",
      price: 2.5,
      available: 24,
      category: "Bakery",
    },
    {
      id: "2",
      name: "Artisan Bread",
      image: "/placeholder.svg?height=200&width=200",
      price: 4.8,
      available: 12,
      category: "Bakery",
    },
    {
      id: "3",
      name: "Premium Coffee Beans",
      image: "/placeholder.svg?height=200&width=200",
      price: 15.9,
      available: 8,
      category: "Coffee",
    },
    {
      id: "4",
      name: "Organic Milk",
      image: "/placeholder.svg?height=200&width=200",
      price: 3.2,
      available: 15,
      category: "Dairy",
    },

  ]

  type ArticesCardProps = {
    id: string
    name: string
    price: number  // Changed from string to number to match your data
    image: string
    available: number
    category: string
  }

const Articles = () => {
    const [articleCount, setArticleCount] = useState(0)
    const [price, setPrice] = useState(0)
    const router = useRouter()
  return (
    <View className='flex-1'>
        <View className='flex flex-row items-center justify-between bg-white p-5'>
                <Text className="text-2xl font-semibold text-gray-900">Articles</Text>
                <AppButton
                    label={`Panier(${articleCount}) - ${price}XAF`}
                    onPress={() => router.push("/basket")}
                    className='bg-black text-white p-3 rounded-lg flex flex-row items-center'
                    textClasses='text-center font-medium text-white' 
                    icon={<MaterialIcons name="shopping-cart" color="white" size={16} />}
                />
            </View>
            <FlatList
                className='p-5' 
                data={articles}   
                scrollEnabled = {true} 
                renderItem={({ item }) => (
                    <ArticesCard 
                        name={item.name}
                        price={item.price}
                        image={item.image}
                        available={item.available}
                        category={item.category}
                        onAddArticle={(price, amount) => {
                            setArticleCount(prev => prev + 1)
                            console.log(articleCount)
                            
                        }}
                        onRemoveArticle={(price, amount) => {
                            setArticleCount(prev => prev - 1)
                            console.log(articleCount)
                        }}
                    />
                )}
            />
    </View>
  )
}

export default Articles
