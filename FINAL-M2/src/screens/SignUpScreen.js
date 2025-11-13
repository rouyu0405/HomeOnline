import React, { useState } from "react";
import { View, Image, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      //creates user inFirebase
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = res.user;
      await AsyncStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email }));
      navigation.reset({ index: 0, routes: [{ name: "Map" }] });
    } catch (e) {
      Alert.alert("Sign up error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput 
        placeholder="Email" 
        autoCapitalize="none" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        keyboardType="email-address" //special keyboard for emails
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        style={styles.input} 
        secureTextEntry 
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      <Text style={styles.text}>Or Sign Up With</Text>
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
    backgroundColor: "#FFFAE4", 
    padding: 20, 
    justifyContent: "center", 
    alignItems: "center"
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
  title: { 
    fontSize: 28, 
    marginBottom: 80,
    fontWeight: '900',
    color: '#333'
  },
  image: { 
    width: 80,
    height: 80, 
    marginBottom: 20,
    marginTop: 10,
  },
  text: { 
    fontSize: 16, 
    marginBottom: 10,
    marginTop: 90,
    color: '#333'
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
});
