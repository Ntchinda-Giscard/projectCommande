import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';


const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


type ItemsInCardProps = {
    unitprice: number
    availabe: number
    name: string
}

const ItemsInCard = (props:ItemsInCardProps ) => {
  return (
    <View>
      <View>
        <Item 
            unitprice={props.unitprice} 
            availabe={props.availabe} 
            name={props.name}            
        />
      </View>
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
                    source="/placeholder.svg"
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