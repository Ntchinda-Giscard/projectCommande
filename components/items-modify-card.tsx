import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Image } from 'expo-image';
import AppButton from './app-button';
import { MaterialIcons } from '@expo/vector-icons';


const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


type ItemsInCardProps = {
    unitprice: number
    availabe: number
    name: string
}

const ItemsInCard = (props:ItemsInCardProps ) => {
    const [articleCount, setArticleCount] = useState(0)
    const [addState, setAddState] = useState(false);
    const [deleted, setDelete] = useState(false)

    const addItem = () => {
            setArticleCount(articleCount + 1)
    }

    const removeItem = () => {
        if (articleCount > 0) {
            setArticleCount(articleCount - 1)
        }
        if (articleCount == 0) {
            setAddState(false)
        }
    }
  return (
    <View>
      { !deleted && <View className='border border-borders p-2 rounded-lg mt-5'>
        <Item 
            unitprice={props.unitprice} 
            availabe={props.availabe} 
            name={props.name}            
        />
        <View className='flex flex-row justify-between items-center'>
            <View className='flex flex-row items-center gap-1'>
                <AppButton
                    onPress={() => addItem()}
                    className="flex items-center border-borders flex-row border justify-center p-1 rounded-lg w-fit"
                    textClasses='text-center font-medium text-white'
                    icon={<MaterialIcons name="add" color="black" size={24} />}
                />
                <View className='flex items-center justify-center p-2 border rounded-lg border-borders'> <Text className=''>{articleCount}</Text> </View>
                
                <AppButton
                    onPress={() => removeItem()}
                    className="flex items-center border-borders flex-row border justify-center p-1 rounded-lg w-fit"
                    textClasses='text-center font-medium text-white'
                    icon={<MaterialIcons name="remove" color="black" size={24} />}
                />
            </View>

            <View  className='flex flex-row gap-1 items-center'>
                <Text className='font-medium'> XAF3000 </Text>
                <AppButton
                    onPress={() => setDelete(true)}
                    className=""
                    icon={<MaterialIcons name="delete-outline" color="red" size={20} />}
                />
                
                
            </View>
        </View>
      </View>}
    </View>
  )
}

export default ItemsInCard




const Item = (props: ItemsInCardProps) =>{
    return (
        <View className='flex flex-row gap-6 items-center'>
            <Image
                    // style={styles.image}
                    className='w-16 h-16 rounded'
                    source="https://picsum.photos/seed/696/3000/2000"
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                  />
            <View className='flex flex-col'>
                <Text className='font-medium'>{props.name} </Text>
                <Text className='text-sm text-gray-600'>{props.unitprice} each • {props.availabe}availabe</Text>
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
      flex: 1,
      width: '100%',
      backgroundColor: '#0553',
    },
  });