import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/utils/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import StartScreen from "./src/screens/StartScreen";
import LogInScreen from "./src/screens/LogInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import MapScreen from "./src/screens/mapScreen";
import AddCategoryScreen from "./src/screens/addCategory";
import AddSectionScreen from "./src/screens/addSection";
import AddItemScreen from "./src/screens/addItem";
import ClosetScreen from "./src/screens/closetScreen";
import KitchenScreen from "./src/screens/kitchenScreen";
import SearchScreen from "./src/screens/SearchScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigation after login
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#9EB995",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Map") iconName = "map";
          else if (route.name === "Calendar") iconName = "calendar";
          else if (route.name === "Profile") iconName = "person";
          else if (route.name === "Search") iconName = "search";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Start");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email }));
        setInitialRoute("MainTabs");
      } else {
        await AsyncStorage.removeItem("user");
        setInitialRoute("Start");
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        {/* Auth flow */}
        <Stack.Screen name="Start" component={StartScreen} options={{ title: "Welcome" }} />
        <Stack.Screen name="Login" component={LogInScreen} options={{ title: "Log In" }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />

        {/* Main app */}
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="AddSection" component={AddSectionScreen} options={{ title: "Add Section" }} />
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} options={{ title: "Add Category" }} />
        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: "Add Item" }} />
        <Stack.Screen name="Closet" component={ClosetScreen} options={{ title: "Closet" }} />
        <Stack.Screen name="Kitchen" component={KitchenScreen} options={{ title: "Storage" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
