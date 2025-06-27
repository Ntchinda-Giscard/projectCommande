import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import ItemsInCard from '@/components/items-modify-card'
import AppButton from '@/components/app-button'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import EmptyBasket from '@/components/empty-basket'

const Basket = () => {
    const router = useRouter()
    const [cleared, setCleared] = useState(false)
  return (
    <View>
        { !cleared ?<View className='flex-1 mb-10'>
            <View className='bg-white p-5'>
                <Text className='text-2xl font-semibold text-gray-900'>Basket</Text>
                <Text className="text-gray-600">Review and manage your order</Text>
            </View>
            <ScrollView>
                <View className='flex-1 p-5'>
                    <View className='border border-borders bg-white p-5 rounded-lg'>
                        <View className="flex w-full flex-row items-center justify-between">
                            <Text>Order Summary</Text>
                            <Badge text='4 items' /> 
                        </View>

                        <View className="flex w-full flex-row items-center mt-5 justify-between">
                            <Text className='text-lg font-semibold'>Order Summary</Text>
                            <Text className='text-lg font-semibold'>XAF 16.90</Text> 
                        </View>
                    </View>


                    <View className='border border-borders bg-white p-5 rounded-lg mt-8'>
                        <Text className='text-xl font-semibold text-gray-900'>Items in Basket </Text>
                        <Text className="text-gray-600 mb-10">Modify quantities or remove items as needed</Text>
                        <ItemsInCard 
                            unitprice={0} 
                            availabe={0} 
                            name={'Fresh Croissants'} 
                        />

                        {/* <ItemsInCard 
                            unitprice={0} 
                            availabe={0} 
                            name={'Fresh Croissants'} 
                        />

                        <ItemsInCard 
                            unitprice={0} 
                            availabe={0} 
                            name={'Artisan Bread'} 
                        /> */}

        

                        <View className='flex flex-row my-3 justify-between'>
                            <AppButton
                                onPress={() => router.push('/articles')}
                                label={'Add more items'}
                                className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg w-fit"
                                textClasses='text-center font-medium text-black'
                                // icon={<MaterialIcons name="add" color="black" size={24} />}
                            />
                            <AppButton
                                onPress={() => setCleared(true)}
                                label={'Clear basket'}
                                className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg w-fit"
                                textClasses='text-center font-medium text-red-500'
                                // icon={<MaterialIcons name="add" color="black" size={24} />}
                            />
                        </View>
                        <AppButton
                                onPress={() => {}}
                                label={'Place order'}
                                className="flex items-center border-borders flex-row border bg-black justify-center p-3 rounded-lg w-full"
                                textClasses='text-center font-medium text-white'
                                icon={<MaterialIcons name="check" color="white" size={16} />}
                            />
                    </View>
                </View>
            </ScrollView>

        </View> :
        <EmptyBasket />}
    </View>
  )
}

export default Basket

const Badge = ({text}: {text: string}) => {

    return <View className='bg-slate-200 rounded-full py-1 px-2 w-fit'>
        <Text className='text-black fonr-medium'> {text}  </Text> </View>
}

//•