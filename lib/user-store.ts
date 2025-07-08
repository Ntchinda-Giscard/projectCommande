import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';


type Header = {
  country: string;
  customerCode: string;
  invoiceAddress: string;
  deliveryAddress: string;
  orderAddress: string;
  transportAddress: string;
  currency: string;
  contactCode: string;
  deliveryMode: string;
  paymentTerm: string;
  transportType: string;
  fixedCharges: number;
  variableCharges: number;
  netAmount: number;
  numberOfPackages: number;
};

type Address = {
  code: string;
  city: string;
  addressLine: string;
  postalCode: string;
  country: string;
  phone: string;
  contactCode: string;
};

type Recipient = {
  addressCode: string;
  companyName: string;
  quantity: number;
};

type Contact = {
  code: string;
  civilityCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleCode: string;
};

type ParsedDataLogin = {
  header: Header | null;
  addresses: Address[];
  recipients: Recipient[];
  contact: Contact | null;
};


interface AuthState {
  user: ParsedDataLogin | null;
  setAuthUser: (user: ParsedDataLogin | null) => void;
}

export const useUserStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      
      setAuthUser: (user) => set({ 
        user
      }),
      
      
      
      
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
    }
  )
);
