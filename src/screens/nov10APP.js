import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// --- Screens ---
import StartScreen from "./src/screens/StartScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LogInScreen from "./src/screens/LogInScreen";
import MapScreen from "./src/screens/mapScreen";
import KitchenScreen from "./src/screens/kitchenScreen";
import AddSectionScreen from "./src/screens/addSection";
import AddCategoryScreen from "./src/screens/addCategory";
import ClosetScreen from "./src/screens/closetScreen";
import AddItemScreen from "./src/screens/addItem";
import ProfileScreen from "./src/screens/ProfileScreen";
import SearchScreen from "./src/screens/SearchScreen";
import CalendarScreen from "./src/screens/CalendarScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthStack setIsLoggedIn={setIsLoggedIn} setUserData={setUserData}/>
      ) : (
        <MainView setIsLoggedIn={setIsLoggedIn} userData={userData}/>
      )}
    </NavigationContainer>
  );
}


function AuthStack({ setIsLoggedIn, setUserData }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="SignUp">
        {(props) => <SignUpScreen {...props} setIsLoggedIn={setIsLoggedIn} setUserData={setUserData}/>}
      </Stack.Screen>
      <Stack.Screen name="LogIn">
        {(props) => <LogInScreen {...props} setIsLoggedIn={setIsLoggedIn} setUserData={setUserData}/>}
      </Stack.Screen>
    </Stack.Navigator>
  );
}


function MainView({ setIsLoggedIn }) {
  const [selectedTab, setSelectedTab] = useState("Calendar");

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {selectedTab === "Map" && (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Kitchen" component={KitchenScreen} />
            <Stack.Screen name="AddSection" component={AddSectionScreen} />
          </Stack.Navigator>
        )}

        {selectedTab === "Calendar" && <CalendarScreen />}

        {selectedTab === "Search" && <SearchScreen />}

        {selectedTab === "Profile" && (
          <ProfileScreen onLogout={() => setIsLoggedIn(false)} />
        )}
      </View>

      {/* Bottom Tabs */}
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
            key: "Search",
            label: "Search",
            icon: require("./assets/search.png"),
            activeIcon: require("./assets/searchClick.png"),
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
              source={selectedTab === item.key ? item.activeIcon : item.icon}
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
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mainContent: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  tabButton: { alignItems: "center" },
  icon: { width: 24, height: 24, marginBottom: 4 },
  label: { fontSize: 12, color: "#666" },
});
