import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import WelcomeScreen from "./app/screens/welcome/WelcomeScreen";
import MatchScreen from "./app/screens/match/MatchScreen";
import LoginScreen from "./app/screens/user/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const { getItem, setItem } = useAsyncStorage("@authorization");

  const readItemFromStorage = async () => {
    const item = await getItem();
    setToken(item);
  };

  const writeItemToStorage = async (newValue) => {
    await setItem(newValue);
    setToken(newValue);
  };

  useEffect(() => {
    readItemFromStorage();

    console.log("token", token);
    if (token) {
      axios
        .get("http://localhost:3000/user", {
          headers: { Authorization: token },
        })
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          setUser(null);
        });
    } else {
      setUser(null);
    }
    console.log("Current User", user);
  }, [token]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={"Login"}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Match" component={MatchScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
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
