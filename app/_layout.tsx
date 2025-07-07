import { useEffect, useState } from "react";
import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// export default function RootLayout() {
//   const [isAuthenticated, setIsAuthenticated] = useState(true);
//   return <AuthProvider>

//   <Stack>
//          <Stack.Screen
//           name="(tabs)"
//           options={{ headerShown: false }}
//         />

//     <Stack.Screen
//       name = "signin"
//       options={{ headerShown: false, headerTintColor: 'black' }}
//     />

//   </Stack>
//   </AuthProvider>
//   ;
// }


function RootLayoutNav() {
  const { authState } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if authentication state is still loading
    if (authState?.authenticated === null) {
      return; // Still loading, don't navigate yet
    }

    const inAuthGroup = segments[0] === "(tabs)";

    if (authState?.authenticated && !inAuthGroup) {
      // User is authenticated but not in the protected area, redirect to tabs
      router.replace("/(tabs)");
    } else if (!authState?.authenticated && inAuthGroup) {
      // User is not authenticated but trying to access protected area, redirect to signin
      router.replace("/signin");
    }
  }, [authState?.authenticated, segments]);

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="signin"
        options={{ headerShown: false, headerTintColor: 'black' }}
      />
    </Stack>
  );
}


export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}