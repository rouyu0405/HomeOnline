import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// --- Screens ---
import StartScreen from "./screens/StartScreen";
import SignUpScreen from "./screens/SignUpScreen";
import LogInScreen from "./screens/LogInScreen";
import MapScreen from "./screens/mapScreen";
import KitchenScreen from "./screens/kitchenScreen";
import ClosetScreen from "./screens/closetScreen";
import AddItemScreen from "./screens/addItem";
import AddSectionScreen from "./screens/addSection";
import AddCategoryScreen from "./screens/addCategory";
import CalendarScreen from "./screens/CalendarScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SearchScreen from "./screens/SearchScreen";

const Stack = createNativeStackNavigator();

/* ------------------ AUTH STACK ------------------ */
function AuthStack({ setIsLoggedIn, setUserData }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="SignUp">
        {(props) => (
          <SignUpScreen
            {...props}
            setIsLoggedIn={setIsLoggedIn}
            setUserData={setUserData}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="LogIn">
        {(props) => (
          <LogInScreen
            {...props}
            setIsLoggedIn={setIsLoggedIn}
            setUserData={setUserData}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

/* ------------------ MAP STACK ------------------ */
function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="Kitchen" component={KitchenScreen} />
      <Stack.Screen name="Closet" component={ClosetScreen} />
      <Stack.Screen name="AddSection" component={AddSectionScreen} />
      <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
      <Stack.Screen name="AddItem" component={AddItemScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

/* ------------------ CALENDAR STACK ------------------ */
function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
    </Stack.Navigator>
  );
}

/* ------------------ PROFILE STACK ------------------ */
function ProfileStack({ userData, setIsLoggedIn}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain">
        {(props) => (
          <ProfileScreen
            {...props}
            route={{ params: { userData } }}
            onLogout={() => setIsLoggedIn(false)}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}


/* ------------------ MAIN APP VIEW ------------------ */
function MainView({ userData, setIsLoggedIn }) {
  const [selectedTab, setSelectedTab] = useState("Map");

  const renderTab = () => {
    switch (selectedTab) {
      case "Map":
        return <MapStack />;
      case "Calendar":
        return <CalendarStack />;
      case "Profile":
        return <ProfileStack userData={userData} setIsLoggedIn={setIsLoggedIn} />;
      default:
        return <MapStack />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>{renderTab()}</View>

      {/* Bottom Navigation Tabs */}
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

/* ------------------ ROOT APP ------------------ */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthStack setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} />
      ) : (
        <MainView setIsLoggedIn={setIsLoggedIn} userData={userData} />
      )}
    </NavigationContainer>
  );
}

/* ------------------ STYLES ------------------ */
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
  icon: { width: 26, height: 26, marginBottom: 4 },
  label: { fontSize: 12, color: "#666" },
});
