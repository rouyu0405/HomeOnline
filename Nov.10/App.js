import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import KitchenScreen from "./screens/kitchenScreen";
import MapScreen from "./screens/mapScreen";
import AddSectionScreen from "./screens/addSectionScreen";
import AddCategoryScreen from "./screens/addCategoryScreen";
import ClosetScreen from "./screens/closetScreen";
import AddItemScreen from "./screens/addItemScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [selectedTab, setSelectedTab] = useState("Map");

  return (
    <NavigationContainer>
      <View style={styles.container}>
        {/* Main Area */}
        <View style={styles.mainContent}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="Kitchen" component={KitchenScreen} />
              <Stack.Screen name="AddSection" component={AddSectionScreen} />
              <Stack.Screen name="AddCategory" component={AddCategoryScreen} /> 
              <Stack.Screen name="Closet" component={ClosetScreen} />
              <Stack.Screen name="AddItem" component={AddItemScreen} />
          </Stack.Navigator>

          {selectedTab === "Profile" && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Profile Page (Coming Soon)
              </Text>
            </View>
          )}

          {selectedTab === "Calendar" && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Calendar Page (Coming Soon)
              </Text>
            </View>
          )}
        </View>

        {/* bottom navigation bar */}
        <View style={styles.tabBar}>
          {[
            {
              key: "Map",
              label: "Map",
              icon: require("./assets/map.png"),
              activeIcon: require("./assets/mapClick.png"),
            },
            {
              key: "Calendar",
              label: "Calendar",
              icon: require("./assets/calendar.png"),
              activeIcon: require("./assets/calendarClick.png"),
            },
            {
              key: "Profile",
              label: "Profile",
              icon: require("./assets/profile.png"),
              activeIcon: require("./assets/profileClick.png"),
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.tabButton}
              onPress={() => setSelectedTab(item.key)}
            >
              <Image
                source={
                  selectedTab === item.key ? item.activeIcon : item.icon
                }
                style={styles.icon}
              />
              <Text
                style={[
                  styles.label,
                  selectedTab === item.key && {
                    color: "black",
                    fontWeight: "600",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  mainContent: { flex: 1 },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 18, color: "#000000" },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    height: 80,
    paddingBottom: 10,
  },
  tabButton: { alignItems: "center", justifyContent: "center" },
  icon: { width: 28, height: 28, marginBottom: 4 },
  label: { fontSize: 12, color: "#000000" },
});
