import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import colors from "./config/colors";
import "react-native-url-polyfill/auto"
import { StyleSheet } from "react-native";
import HomeScreen from "./app/screens/home/HomeScreen";
import GameScreen from "./app/screens/game/GameScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from "./app/contexts/UserContext";
import { upsertUser } from "./app/data/backend_client";
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [entryCode, setEntryCode] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const [fontsLoaded, fontError] = useFonts({
    'Signika': require('./app/assets/fonts/Signika.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const getGameEntryCode = async () => {
      const url = await Linking.getInitialURL();
      console.log('initialURl', url);
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const { entry_code } = queryParams;
      console.log('entry_code', entry_code);

      if (entry_code) { setEntryCode(entry_code) }
    }

    getGameEntryCode();
  }, [user])


  useEffect(() => {
    const findOrCreateeDeviceId = async () => {
      const id = await SecureStore.getItemAsync('deviceId');
      if (!id) {
        const newId = uuidv4();
        await SecureStore.setItemAsync('deviceId', newId);
      }
      setDeviceId(id);
    }

    findOrCreateeDeviceId();
  }, [])

  useEffect(() => {
    if (!deviceId) return;

    const userParams = {
      device_id: deviceId,
    }

    upsertUser(userParams)
      .then(upsertedUser => {
        setUser(upsertedUser)
      })
  }, [deviceId])

  return (
    <UserContext.Provider value={{user, setUser, entryCode, onLayoutRootView}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={"Home"} screenOptions={{
          headerStyle: {
            backgroundColor: colors.secondary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
          <Stack.Screen name="Game" component={GameScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
