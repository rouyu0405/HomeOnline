import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSection } from "../utils/db";

export default function AddSectionScreen({ navigation }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("clothing"); // or 'storage'

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert("Please enter a name");
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return Alert.alert("Not signed in");
    const user = JSON.parse(raw);
    try {
      await createSection(user.uid, { name: name.trim(), type });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Section name" value={name} onChangeText={setName} style={styles.input} />
      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity onPress={() => setType("clothing")} style={[styles.typeBtn, type === "clothing" && styles.active]}>
          <Text>Clothing</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setType("storage")} style={[styles.typeBtn, type === "storage" && styles.active]}>
          <Text>Storage</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
        <Text style={{ color: "#fff" }}>Create Section</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#FCF8E6" 
  },
  input: { 
    height: 44, 
    backgroundColor: "#fff", 
    borderRadius: 8, 
    paddingHorizontal: 10 
  },
  typeBtn: { 
    padding: 10, 
    backgroundColor: "#fff", 
    marginRight: 8, 
    borderRadius: 6 
  },
  active: { 
    backgroundColor: "#9EB995" 
  },
  createBtn: { 
    marginTop: 16, 
    backgroundColor: "#9EB995", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center" 
  },
});
