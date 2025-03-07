import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback } from "react";
import colors from "./config/colors";
import "react-native-url-polyfill/auto";
import HomeScreen from "./app/screens/home/HomeScreen";
import GameScreen from "./app/screens/game/GameScreen";
import FriendsListScreen from "./app/screens/list/FriendsListScreen";
import SharedMoviesScreen from "./app/screens/list/SharedMoviesScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { UserContext } from "./app/contexts/UserContext";
import { upsertUser } from "./app/data/backend_client";
import * as Linking from "expo-linking";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [entryCode, setEntryCode] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const [fontsLoaded, fontError] = useFonts({
    Signika: require("./app/assets/fonts/Signika.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Handle deep links (both initial and subsequent ones)
  useEffect(() => {
    const handleDeepLink = (event) => {
      const { url } = event;
      const { queryParams } = Linking.parse(url);
      const { entry_code } = queryParams;
      if (entry_code) {
        setEntryCode(entry_code);
      }
    };

    // Check if app was launched from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Subscribe to URL changes while the app is running
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Clean up the event listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const findOrCreateDeviceId = async () => {
      const id = await SecureStore.getItemAsync("deviceId");
      if (!id) {
        const newId = uuidv4();
        await SecureStore.setItemAsync("deviceId", newId);
        setDeviceId(newId);
      } else {
        setDeviceId(id);
      }
    };

    findOrCreateDeviceId();
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const userParams = {
      device_id: deviceId,
    };

    upsertUser(userParams).then((upsertedUser) => {
      setUser(upsertedUser);
    });
  }, [deviceId]);

  return (
    <UserContext.Provider value={{ user, setUser, entryCode, setEntryCode, onLayoutRootView }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={"Home"}
          screenOptions={{
            headerStyle: {
              backgroundColor: "#f0f0f0",
            },
            headerTintColor: colors.secondary,
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Friends List" component={FriendsListScreen} />
          <Stack.Screen name="Shared Movies" component={SharedMoviesScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserContext.Provider>
  );
}
