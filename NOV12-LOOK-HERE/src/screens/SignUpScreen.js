// src/screens/SignUpScreen.js
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
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
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
        <Text style={styles.btnText}>Create account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCF8E6", padding: 16, justifyContent: "center" },
  input: { height: 44, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 10, marginBottom: 12 },
  btn: { backgroundColor: "#9EB995", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
