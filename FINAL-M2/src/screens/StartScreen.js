import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function StartScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
        
        <Image
            source={require("../../assets/home.png")}
            style={[styles.image]}
        />
        <Text style={styles.title}>HomeOnline</Text>
        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
        >
            <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.text}>-OR-</Text>

        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("SignUp")}
        >
            <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ 
    container: { 
        flex: 1,
        padding: 20,
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#FFFAE4" 
    },
    title: { 
        fontSize: 35, 
        marginBottom: 80,
        fontWeight: '900',
        color: '#333'
    },
    text: { 
        fontSize: 16, 
        marginBottom: 10,
        marginTop: 10,
        color: '#333'
    },
    image: { 
        width: 80,
        height: 80, 
        marginBottom: 20,
    },
    button: { 
        backgroundColor: "#9EB995", 
        padding: 12, 
        borderRadius: 6, 
        marginVertical: 8 
    },
    buttonText: { 
        color: "#fff", 
        fontSize: 16, 
        fontWeight: "600" 
    },
});
