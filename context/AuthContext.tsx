import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { callAdonixSoapServiceWithAuth } from "@/services/login";
import { parseSageX3ExportData } from "@/lib/utils";

interface AuthProps {
    authState?: {token: string | null, authenticated: boolean | null}
    onRegister?: (username: string, password: string) => Promise<{error?: string}>
    onLogin?: (username: string, password: string) => Promise<{error?: string}>
    onLogout?: () => void
}

const TOKEN = 'token'

const AuthContext = createContext<AuthProps>({})

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({children}: any) => {
    
    const [authState, setAuthState] = useState<{
        token: string | null,
        authenticated: boolean | null
    }>({
        token: null, 
        authenticated: null // null means we're still checking
    })

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await SecureStore.getItemAsync(TOKEN)
                console.log("Stored token:", token)

                if (token) {
                    // TODO: Optionally verify token with your backend here
                    setAuthState({
                        token: token,
                        authenticated: true
                    })
                } else {
                    setAuthState({
                        token: null,
                        authenticated: false
                    })
                }
            } catch (error) {
                console.error("Failed to load token:", error)
                setAuthState({
                    token: null,
                    authenticated: false
                })
            }
        }

        loadToken()
    }, [])

    const register = async (username: string, password: string): Promise<{error?: string}> => {
        try {
            // TODO: Implement your registration API call
            // const response = await axios.post('/api/register', { username, password })
            
            // For now, mock success
            const mockToken = "registered_token_" + Date.now()
            
            setAuthState({
                token: mockToken,
                authenticated: true
            })
            
            await SecureStore.setItemAsync(TOKEN, mockToken)
            return {}
        } catch (error) {
            return { error: "Registration failed" }
        }
    }

    const login = async (username: string, password: string): Promise<{error?: string}> => {
        try {
            // TODO: Replace with actual API call
            // const response = await axios.post('/api/login', { username, password })
            
            // Mock login validation
            if (username.length === 0 || password.length === 0) {

                return { error: "Username and password are required" }
            }

            const loginResponse = await callAdonixSoapServiceWithAuth({
                username: "admin",
                password: "Wazasolutions2025@",
                moduleToExport: "BPC",
                userNameCriteria: username,
                passwordCriteria: password
            })
            
            

            console.log( "GRP3 response" ,loginResponse['GRP3']['O_FILE'])
            const extracted_data = parseSageX3ExportData(loginResponse['GRP3']['O_FILE'])
            
            
            if (extracted_data.customer !== undefined){
                const mockToken = extracted_data.customer[2]
                console.log("mockToken", mockToken)
                setAuthState({
                    token: mockToken,
                    authenticated: true
                })
                
                await SecureStore.setItemAsync(TOKEN, mockToken)
            }
            
           
            return {}
            
        } catch (error) {
            return { error: "Login failed" }
        }
    }

    const logout = async () => {
        try {
            setAuthState({
                token: null,
                authenticated: false
            })

            await SecureStore.deleteItemAsync(TOKEN)
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    const value = {
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        authState: authState
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


