import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import AppButton from './app-button';

type ArticesCardProps = {
    name: string
    price: number
    image: string
    available: number
    category: string
    onAddArticle: (price: number, items: number) => void
    onRemoveArticle: (price: number, items: number) => void
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ArticesCard = (props: ArticesCardProps) => {
    const [articleCount, setArticleCount] = useState(0)
    const [addState, setAddState] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price)
    }

    const addItem = (price: number) => {
        if (articleCount < props.available) {
            const newCount = articleCount + 1
            setArticleCount(newCount)
            props.onAddArticle(price, 1) // Pass 1 as the increment amount
        }
    }

    const removeItem = (price: number) => {
        if (articleCount > 0) {
            const newCount = articleCount - 1
            setArticleCount(newCount)
            props.onRemoveArticle(price, 1) // Pass 1 as the decrement amount
            
            if (newCount === 0) {
                setAddState(false)
            }
        }
    }

    const getAvailabilityStatus = () => {
        if (props.available === 0) return { text: 'Rupture de stock', color: 'text-red-600', bgColor: 'bg-red-100' }
        if (props.available <= 5) return { text: 'Stock faible', color: 'text-orange-600', bgColor: 'bg-orange-100' }
        return { text: 'En stock', color: 'text-green-600', bgColor: 'bg-green-100' }
    }

    const availabilityStatus = getAvailabilityStatus()

    return (
        <View className='flex flex-col border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm'>
            {/* Product Image */}
            <View className='relative'>
                <Image
                    style={styles.productImage}
                    source="https://picsum.photos/seed/696/3000/2000"
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                />
                {/* Stock Status Badge */}
                <View className={`absolute top-3 right-3 px-2 py-1 rounded-full ${availabilityStatus.bgColor}`}>
                    <Text className={`text-xs font-medium ${availabilityStatus.color}`}>
                        {availabilityStatus.text}
                    </Text>
                </View>
                {/* Category Badge */}
                <View className='absolute top-3 left-3'>
                    <Badge text={props.category} />
                </View>
            </View>

            {/* Product Information */}
            <View className='p-4'>
                {/* Product Name */}
                <View className='mb-3'>
                    <Text className='text-xs text-gray-500 uppercase tracking-wide mb-1'>
                        Nom du produit
                    </Text>
                    <Text className="text-lg font-semibold text-gray-900 leading-tight" numberOfLines={2}>
                        {props.name}
                    </Text>
                </View>

                {/* Price and Availability Row */}
                <View className='flex flex-row justify-between items-start mb-4'>
                    {/* Price Section */}
                    <View className='flex-1 mr-4'>
                        <Text className='text-xs text-gray-500 uppercase tracking-wide mb-1'>
                            Prix unitaire
                        </Text>
                        <View className='flex flex-row items-baseline'>
                            <Text className="text-2xl font-bold text-gray-900">
                                {formatPrice(props.price)}
                            </Text>
                            <Text className="text-sm text-gray-600 ml-1">
                                XAF
                            </Text>
                        </View>
                    </View>

                    {/* Availability Section */}
                    <View className='flex-1'>
                        <Text className='text-xs text-gray-500 uppercase tracking-wide mb-1'>
                            Disponibilité
                        </Text>
                        <View className='flex flex-row items-center'>
                            <MaterialIcons 
                                name="inventory" 
                                size={16} 
                                color={props.available > 0 ? "#10b981" : "#ef4444"} 
                            />
                            <Text className={`text-sm font-medium ml-1 ${
                                props.available > 0 ? 'text-gray-900' : 'text-red-600'
                            }`}>
                                {props.available} {props.available <= 1 ? 'unité' : 'unités'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className='mt-4'>
                    {!addState ? (
                        <AppButton
                            label="Ajouter au panier"
                            onPress={() => {
                                if (props.available > 0) {
                                    setAddState(true)
                                    setArticleCount(1)
                                    props.onAddArticle(props.price, 1)
                                }
                            }}
                            className={`flex items-center flex-row justify-center p-4 rounded-lg ${
                                props.available > 0 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'bg-gray-300 border-gray-300'
                            }`}
                            textClasses={`text-center font-semibold ${
                                props.available > 0 ? 'text-white' : 'text-gray-500'
                            }`}
                            icon={
                                <MaterialIcons 
                                    name="add-shopping-cart" 
                                    color={props.available > 0 ? "white" : "#6b7280"} 
                                    size={20} 
                                />
                            }
                            disabled={props.available === 0}
                        />
                    ) : (
                        <View>
                            {/* Quantity in Cart Info */}
                            <View className='bg-blue-50 rounded-lg p-3 mb-3'>
                                <View className='flex flex-row items-center justify-center'>
                                    <MaterialIcons name="shopping-cart" size={16} color="#3b82f6" />
                                    <Text className='text-blue-700 font-medium ml-2'>
                                        {articleCount} {articleCount <= 1 ? 'article' : 'articles'} dans le panier
                                    </Text>
                                </View>
                                <Text className='text-blue-600 text-sm text-center mt-1'>
                                    Total: {formatPrice(props.price * articleCount)} XAF
                                </Text>
                            </View>

                            {/* Quantity Controls */}
                            <View className='flex flex-row items-center justify-between'>
                                <TouchableOpacity
                                    onPress={() => removeItem(props.price)}
                                    className='flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-300 bg-white'
                                    disabled={articleCount <= 0}
                                >
                                    <MaterialIcons 
                                        name="remove" 
                                        color={articleCount > 0 ? "#374151" : "#9ca3af"} 
                                        size={24} 
                                    />
                                </TouchableOpacity>

                                <View className='flex-1 mx-4'>
                                    <Text className='text-xs text-gray-500 uppercase tracking-wide text-center mb-1'>
                                        Quantité
                                    </Text>
                                    <Text className='text-2xl font-bold text-center text-gray-900'>
                                        {articleCount}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => addItem(props.price)}
                                    className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 ${
                                        articleCount < props.available 
                                            ? 'border-blue-500 bg-blue-500' 
                                            : 'border-gray-300 bg-gray-300'
                                    }`}
                                    disabled={articleCount >= props.available}
                                >
                                    <MaterialIcons 
                                        name="add" 
                                        color={articleCount < props.available ? "white" : "#9ca3af"} 
                                        size={24} 
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Stock Warning */}
                            {articleCount >= props.available && (
                                <View className='mt-2 p-2 bg-orange-50 rounded-lg'>
                                    <Text className='text-orange-700 text-xs text-center'>
                                        Stock maximum atteint
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </View>
    )
}

export default ArticesCard

const Badge = ({ text }: { text: string }) => {
    return (
        <View className='bg-white/90 backdrop-blur-sm rounded-full py-1 px-3 border border-gray-200'>
            <Text className='text-gray-700 text-xs font-medium'>
                {text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    productImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f3f4f6',
    },
});