import React, { useState } from "react";
import { View, Image, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";

export default function LogInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      //fetch user
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
        Don’t have an account? Sign up
      </Text>

      <Text style={styles.text}>Or Log In With</Text>
      <Image //placeholder for Google API
        source={require("../../assets/google.png")}
        style={[styles.image]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20,
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
    marginTop: 90,
    color: '#333'
  },
  input: { 
    width: '80%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc', 
  },
  link: {
    marginTop: 15, 
    color: "#9EB995", 
    fontWeight: "600",
  },
  button: { 
    backgroundColor: "#9EB995", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "700" 
  },
  image: { 
    width: 80,
    height: 80, 
    marginBottom: 20,
    marginTop: 10,
  },
});
