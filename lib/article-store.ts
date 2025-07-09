import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand'

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

interface ArticleState {
  articles: Material[];
  setArticles: (params: Material[]) => void;

}

export const useArticleStore = create<ArticleState>()(
    persist(
        (set) => ({
              articles: [],
              setArticles: (params: Material[]) => set({ articles: params }),
              
              
              
              
            }),
            {
              name: 'article-storage',
              storage: createJSONStorage(() => ({
                getItem: SecureStore.getItemAsync,
                setItem: SecureStore.setItemAsync,
                removeItem: SecureStore.deleteItemAsync,
              })),
            }
          )
    )
    


