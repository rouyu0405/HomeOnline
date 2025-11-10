import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SignUpScreen from './src/screens/SignUpScreen';
import StartScreen from './src/screens/StartScreen';
import LogInScreen from './src/screens/LogInScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Start">
                <Stack.Screen
                    name="Start"
                    component={StartScreen}
                    options={{ title: "Start Screen" }}
                />
                <Stack.Screen
                    name="SignUp"
                    component={SignUpScreen}
                    options={{ title: "Sign Up Screen" }}
                />
                <Stack.Screen
                    name="LogIn"
                    component={LogInScreen}
                    options={{ title: "Log In Screen" }}
                />
                <Stack.Screen
                    name="Search"
                    component={SearchScreen}
                    options={{ title: "Search Screen" }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ title: "Profile Screen" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
