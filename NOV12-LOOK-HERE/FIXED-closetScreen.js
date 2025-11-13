import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { db } from "../utils/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function ClosetScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sectionId } = route.params || {};

  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultItems = [
    { id: "1", name: "Shirt", image: require("../../assets/shirt.webp") },
    { id: "2", name: "Jacket", image: require("../../assets/jacket.webp") },
    { id: "3", name: "Pants", image: require("../../assets/pants.webp") },
  ];

  // ✅ Load user & items
  useFocusEffect(
    useCallback(() => {
      const loadUserAndItems = async () => {
        try {
          setLoading(true);
          const stored = await AsyncStorage.getItem("user");
          if (!stored) {
            console.warn("⚠️ No user found in AsyncStorage");
            setLoading(false);
            return;
          }

          const userData = JSON.parse(stored);
          setUser(userData);

          if (!sectionId) {
            setLoading(false);
            return;
          }

          const querySnapshot = await getDocs(
            collection(db, "users", userData.uid, "sections", sectionId, "items")
          );
          const fetched = [];
          querySnapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });

          setItems([...defaultItems, ...fetched]);
        } catch (error) {
          console.error("Error loading closet items:", error);
        } finally {
          setLoading(false);
        }
      };

      loadUserAndItems();
    }, [sectionId])
  );

  const handleDelete = (id) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!user?.uid || !sectionId) {
            Alert.alert("Missing user info");
            return;
          }

          try {
            await deleteDoc(doc(db, "users", user.uid, "sections", sectionId, "items", id));
            setItems((prev) => prev.filter((item) => item.id !== id));
          } catch (error) {
            console.error("Error deleting item:", error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9EB995" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={40} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Closet</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddItem", { sectionId })}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={38} color="#CBAF98" />
        </TouchableOpacity>
      </View>

      {/* Grid */}
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
                  ? { uri: item.image }
                  : item.image || require("../../assets/search.png")
              }
              style={styles.itemImage}
              resizeMode="cover"
            />
            <Text style={styles.itemLabel}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAE4", paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  leftGroup: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 1, padding: 5 },
  title: { fontSize: 28, fontWeight: "bold" },
  addButton: { padding: 5 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignContent: "flex-start",
    paddingHorizontal: 30,
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
  itemImage: { width: "80%", height: "70%", borderRadius: 6 },
  itemLabel: { color: "#FFFAE4", fontWeight: "600", fontSize: 15, marginTop: 5 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
