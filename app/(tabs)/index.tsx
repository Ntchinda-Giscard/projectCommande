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
        <Text className="text-3xl font-semibold text-gray-900">
          Système de gestion des commandes
        </Text>
        <Text className="text-gray-600">Gérer les commandes et les stocks des clients</Text>

        <AppButton 
          label="Afficher toutes les commandes" 
          onPress={() => {
            router.push("/commands")
            alert("Pressed!")}}
          icon={<MaterialIcons name="shopping-cart" color="gray" size={24} />}
        />
      </View>

      <View className="flex flex-col p-5">
        <TopCard />
      </View>
    </View>
  );
}