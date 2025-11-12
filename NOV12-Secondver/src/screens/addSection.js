import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../utils/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function AddSectionScreen({userData}) {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState(null);
  const [sectionName, setSectionName] = useState("");
  
  const handleSave = async () => {
    if (!sectionName.trim() || !selectedType) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      await addDoc(collection(db, "users", userData.uid, "sections"), {
        name: sectionName,
        type: selectedType,
        createdAt: new Date(),
      });
      alert("✅ Section added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding section: ", error);
      alert("❌ Failed to add section.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add section</Text>

      <Text style={styles.label}>1. Choose section type</Text>
      <View style={styles.typeRow}>
        {["Storage", "Clothing"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeSelected,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.typeText,
                selectedType === type && styles.typeTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>2. Name of section</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter..."
        placeholderTextColor="#FFFAE4"
        value={sectionName}
        onChangeText={setSectionName}
      />

      <View style={styles.bottomRow}>
        {/* ❌ 返回按钮 */}
        <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
        >
            <Image
            source={require("../../assets/cancel.png")} // ← 你的❌图标路径
            style={styles.iconImage}
            />
        </TouchableOpacity>

        

        {/* ✅ 确认按钮 */}
        <TouchableOpacity
            style={styles.circleButton}
            onPress={handleSave}
        >
            <Image
            source={require("../../assets/confirm.png")} // ← 你的✓图标路径
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
    marginBottom: 30,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 20,
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginBottom: 25,
  },
  typeButton: {
    width: "45%",
    aspectRatio: 1,
    backgroundColor: "#9EB995",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  typeSelected: {
    backgroundColor: "#A8BEDF",
  },
  typeText: {
    fontSize: 20,
    color: "#FFFAE4",
  },
  typeTextSelected: {
    color: "#FFFAE4",
    fontWeight: "600",
  },
  input: {
    width: "70%",
    height: 40,
    backgroundColor: "#9EB995",
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 40,
    fontStyle: "italic",
    fontSize: 20
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginTop: 40,
  },
  iconImage: {
  width: 50,  // 图标大小
  height: 50,
  resizeMode: "contain",
    },  
});