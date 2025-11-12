import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// --- Screens ---
import StartScreen from "./src/screens/StartScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LogInScreen from "./src/screens/LogInScreen";
import MapScreen from "./src/screens/mapScreen";
import KitchenScreen from "./src/screens/kitchenScreen";
import ClosetScreen from "./src/screens/closetScreen";
import AddItemScreen from "./src/screens/addItem";
import AddSectionScreen from "./src/screens/addSection";
import AddCategoryScreen from "./src/screens/addCategory";
import CalendarScreen from "./src/screens/CalendarScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SearchScreen from "./src/screens/SearchScreen";

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
function MapStack({ userData }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain">
        {(props) => <MapScreen {...props} userData={userData} />}
      </Stack.Screen>
      {/* Other screens also get userData */}
      <Stack.Screen name="Kitchen">
        {(props) => <KitchenScreen {...props} userData={userData} />}
      </Stack.Screen>
      <Stack.Screen name="Closet">
        {(props) => <ClosetScreen {...props} userData={userData} />}
      </Stack.Screen>
      <Stack.Screen name="AddSection">
        {(props) => <AddSectionScreen {...props} userData={userData} />}
      </Stack.Screen>
      <Stack.Screen name="AddCategory">
        {(props) => <AddCategoryScreen {...props} userData={userData} />}
      </Stack.Screen>
      <Stack.Screen name="AddItem">
        {(props) => <AddItemScreen {...props} userData={userData} />}
      </Stack.Screen>
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
        return <MapStack userData={userData} setIsLoggedIn={setIsLoggedIn}/>;
      case "Calendar":
        return <CalendarStack userData={userData} setIsLoggedIn={setIsLoggedIn}/>;
      case "Profile":
        return <ProfileStack userData={userData} setIsLoggedIn={setIsLoggedIn} />;
      default:
        return <MapStack userData={userData} setIsLoggedIn={setIsLoggedIn}/>;
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
        <MainView userData={userData} setIsLoggedIn={setIsLoggedIn} />
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
