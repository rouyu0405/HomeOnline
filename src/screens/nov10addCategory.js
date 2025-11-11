import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function AddCategoryScreen() {
  const navigation = useNavigation();
  const [categoryName, setCategoryName] = useState("");
  const route= useRoute();
  const { sectionId } =route.params || {};
  const [note, setNote]=useState("");

  const handleSave = async () => {
    if (!categoryName.trim()) {
      alert("Please enter a category name!");
      return;
    }

    if (!sectionId) {
      console.warn("⚠️ Missing sectionId, cannot add category!");
      alert("❌ No section ID. Please open Kitchen again from Map.");
      return;
    }

    try {
        console.log("✅ Adding category to section:", sectionId);
      await addDoc(collection(db, "sections", sectionId,"categories"), {
        name: categoryName,
        note,
        createdAt: new Date(),
      });
      alert("✅ Category added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding category: ", error);
      alert("❌ Failed to add category.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add category</Text>

      <Text style={styles.label}>1. Category name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name..."
        placeholderTextColor="#FFFAE4"
        value={categoryName}
        onChangeText={setCategoryName}
      />

      <View style={styles.bottomRow}>
        {/* ❌ 返回按钮 */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../assets/cancel.png")}
            style={styles.iconImage}
          />
        </TouchableOpacity>

        {/* ✅ 确认按钮 */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleSave}
        >
          <Image
            source={require("../assets/confirm.png")}
            style={styles.iconImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAE4",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 45,
    fontWeight: "bold",
    marginBottom: 50,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    width: "70%",
    height: 40,
    backgroundColor: "#9EB995",
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 80,
    fontStyle: "italic",
    fontSize: 20,
    color: "#FFFAE4",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginTop: 40,
  },
  circleButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});
