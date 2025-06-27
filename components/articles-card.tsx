import { View, Text, StyleSheet } from 'react-native'
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
    onAddArticle: ( price: number, items: number ) => void
    onRemoveArticle: ( price: number, items: number ) => void
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


const ArticesCard = (props: ArticesCardProps) => {
    const [articleCount, setArticleCount] = useState(0)
    const [addState, setAddState] = useState(false);

    const addItem = (price: number) => {
        if (articleCount < props.available) {
            setArticleCount(articleCount + 1)
            props.onAddArticle(price, articleCount)
        }
    }

    const removeItem = (price: number) => {
        if (articleCount == 0) {
            setAddState(false)
        }
        if (articleCount > 0) {
            setArticleCount(articleCount - 1)
            props.onRemoveArticle(price, 0- articleCount)
        }
        
    }

    
  return (
    <View className='flex flex-col border mt-5 border-borders bg-white rounded-xl p-5'>
      <Image
        style={{
          aspectRatio: 1,
          position: 'relative',
          marginBottom: 16,
          borderRadius: 12,
        }}
        source="https://picsum.photos/seed/696/3000/2000"
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
      <View className='flex flex-row justify-between items-center'> 
        <Text className="text-lg"> {props.name} </Text>
        <Text className="text-2xl font-bold"> {props.price} </Text>
      </View>
      <View className='flex flex-row justify-between items-center'>

        <Badge text={props.category} />
        <Text className='text-gray-600'> {props.available} disponible </Text>
      </View>
        <View className='flex flex-col'>
        
          {
            !addState ?
            <AppButton
                label="Ajouter au panier"
                onPress={() => {
                    setAddState(prev => !prev) 
                    setArticleCount(articleCount + 1)
                    props.onAddArticle(props.price, articleCount)
                }}
                className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg bg-black mt-5 w-fit"
                textClasses='text-center font-medium text-white'
                icon={<MaterialIcons name="add" color="white" size={24} />}
            /> :

          <View className='flex flex-row items-center justify-between'>
          <AppButton
                onPress={() => addItem(props.price)}
                className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg mt-5 w-fit"
                textClasses='text-center font-medium text-white'
                icon={<MaterialIcons name="add" color="black" size={24} />}
            />
             <Text>{articleCount} dans le panier </Text>
            <AppButton
                onPress={() => removeItem(props.price)}
                className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg mt-5 w-fit"
                textClasses='text-center font-medium text-white'
                icon={<MaterialIcons name="remove" color="black" size={24} />}
            />
           
            

          </View>}
        </View>
    </View>
  )
}

export default ArticesCard



const Badge = ({text}: {text: string}) => {

    return <View className='bg-slate-200 rounded-full py-2 px-4 w-fit'>
        <Text className='text-black'> {text}  </Text> </View>
}


const styles = StyleSheet.create({
    image: {
      flex: 1,
      width: '100%',
      backgroundColor: '#0553',
    },
  });