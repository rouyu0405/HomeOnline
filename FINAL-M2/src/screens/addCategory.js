import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createCategory } from "../utils/db";

export default function AddCategoryScreen({ route, navigation }) {
  const { sectionId } = route.params || {};
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert("Enter a name");
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return Alert.alert("Not signed in");
    const user = JSON.parse(raw);
    try {
      await createCategory(user.uid, sectionId, { name: name.trim() });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Category name" value={name} onChangeText={setName} style={styles.input} />
      <TouchableOpacity onPress={handleCreate} style={styles.btn}>
        <Text style={{ color: "#fff" }}>Create Category</Text>
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
  btn: { 
    marginTop: 12, 
    backgroundColor: "#9EB995", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center" 
  },
});
