import { Link, useRouter } from "expo-router";
import "../../global.css"
import { Text, TouchableHighlight, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import AppButton from "@/components/app-button";
import { MaterialIcons } from "@expo/vector-icons";
import TopCard from "@/components/top-card";
 
export default function Index() {
  const router = useRouter()

  return (
    <View className="flex-1 overflow-y-scroll">
      <View className="flex flex-col bg-white p-5">
        <Text className="text-2xl font-semibold text-gray-900">
          Système de gestion des commandes
        </Text>
        <Text className="text-gray-600">Gérer les commandes et les stocks des clients</Text>

        <AppButton 
          label="Afficher toutes les commandes" 
          className="mt-5 flex items-center border-borders flex-row border justify-center p-3 rounded-lg bg-white w-fit"
          textClasses='text-center font-medium text-gray-600'
          onPress={() => {
            router.push("/commands")
            }}
          icon={<MaterialIcons name="border-all" color="gray" size={24} />}
        />
      </View>

      <View className="flex flex-col p-5">
        <TopCard 
          onPress={(value) => alert(value)}
        />
      </View>
      <View className="flex flex-col gap-3 p-5">
        <AppButton 
          label="Parcourir les articles" 
          className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg bg-black color-white"
          textClasses='text-center font-medium text-white'
          onPress={() => {
            router.push("/articles")
           }}
          icon={<MaterialIcons name="shopping-cart" color="white" size={24} />}
        />
        <AppButton 
          label="Gérer le panier actuel" 
          className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg bg-white"
          onPress={() => {
            router.push("/")
          }
          }
          icon={<MaterialIcons name="border-all" color="gray" size={24} />}
        />
      </View>
    </View>
  );
}