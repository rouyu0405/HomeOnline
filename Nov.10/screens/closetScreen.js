import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function ClosetScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sectionId } = route.params || {};
  const [items, setItems] = useState([]);

  const defaultItems = [
    { id: "1", name: "Shirt", image: require("../assets/shirt.webp") },
    { id: "2", name: "Jacket", image: require("../assets/jacket.webp") },
    { id: "3", name: "Pants", image: require("../assets/pants.webp") },
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        if (!sectionId) return;
        try {
          const querySnapshot = await getDocs(collection(db, "sections", sectionId, "items"));
          const fetched = [];
          querySnapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setItems([...defaultItems, ...fetched]);
        } catch (error) {
          console.error("Error loading items:", error);
        }
      };
      fetchItems();
    }, [sectionId])
  );

  const handleDelete = (id) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "sections", sectionId, "items", id));
            setItems((prev) => prev.filter((item) => item.id !== id));
          } catch (error) {
            console.error("Error deleting item:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ✅ Header：复制 Kitchen 的布局 */}
      <View style={styles.header}>
        <View style={styles.leftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={40} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Closet</Text>
        </View>

        <View style={styles.iconGroup}>
          <Ionicons name="search-outline" size={24} color="black" style={styles.icon} />
        </View>
      </View>

      {/* ✅ 保留你原来的内容 */}
      <ScrollView contentContainerStyle={styles.grid}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onLongPress={() => handleDelete(item.id)}
            delayLongPress={800}
            style={({ pressed }) => [
              styles.itemBox,
              pressed && { backgroundColor: "#A9BCE3" },
            ]}
          >
            <Image
               source={
                    typeof item.image === "string"
                    ? { uri: item.image } // ✅ Firebase 的 URL
                    : item.image || require("../assets/search.png") // ✅ 本地 require()
                }
                style={styles.itemImage}
                resizeMode="cover"
            />
            <Text style={styles.itemLabel}>{item.name}</Text>
          </Pressable>
        ))}

        {/* 保留原 Add item 按钮 */}
        <TouchableOpacity
          style={styles.addContainer}
          onPress={() => navigation.navigate("AddItem", { sectionId })}
        >
          <Image
            source={require("../assets/add.png")}
            style={styles.addIcon}
            resizeMode="contain"
          />
          <View style={styles.addTextContainer}>
            <Text style={styles.addText}>Add</Text>
            <Text style={styles.addText}>item</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAE4",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  // 👇 完全复制 Kitchen 的 Header 样式
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 1,
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 15,
  },

  // ✅ 以下保留你原来的内容样式
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignContent: "flex-start",
    paddingHorizontal: 50,
    paddingBottom: 40,
  },
  itemBox: {
    width: "45%",
    aspectRatio: 1,
    backgroundColor: "#9EB995",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: "80%",
    height: "70%",
    borderRadius: 6,
  },
  itemLabel: {
    color: "#FFFAE4",
    fontWeight: "600",
    fontSize: 15,
    marginTop: 5,
  },
  addContainer: {
    width: "45%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  addIcon: {
    width: 50,
    height: 50,
  },
  addTextContainer: {
    alignItems: "center",
  },
  addText: {
    marginTop: 3,
    fontWeight: "bold",
    color: "black",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 15,
  },
});