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
    if (authState?.authenticated === null) return;

    const rootSegment = segments[0];

    const inAuthGroup = rootSegment === "(tabs)";
    const inPublicPages = rootSegment === "signin" || rootSegment === undefined;

    if (authState?.authenticated && !inAuthGroup) {
      // Redirect authenticated users away from public pages
      if (inPublicPages) router.replace("/(tabs)");
    } else if (!authState?.authenticated && inAuthGroup) {
      // Redirect unauthenticated users away from private tabs
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