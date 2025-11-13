import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { db } from "../utils/firebaseConfig";
import { deleteDoc, doc, collection, onSnapshot, addDoc, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function KitchenScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sectionId } = route.params || {};

  const [categories, setCategories] = useState([]);
  const [itemsByCat, setItemsByCat] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // ✅ Load user from AsyncStorage
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    })();
  }, []);

  // ✅ Listen to categories
  useEffect(() => {
    if (!user || !sectionId) return;

    const catRef = collection(db, "users", user.uid, "sections", sectionId, "categories");
    const unsub = onSnapshot(catRef, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setCategories(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user, sectionId]);

  // ✅ Listen to all category items (in parallel)
  useEffect(() => {
    if (!user || !sectionId || categories.length === 0) return;

    const unsubs = categories.map((cat) => {
      const itemsRef = collection(
        db,
        "users",
        user.uid,
        "sections",
        sectionId,
        "categories",
        cat.id,
        "items"
      );
      return onSnapshot(itemsRef, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItemsByCat((prev) => ({ ...prev, [cat.id]: list }));
      });
    });

    return () => unsubs.forEach((fn) => fn && fn());
  }, [user, sectionId, categories]);

  // ✅ Expand/collapse
  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Add item modal
  const handleAddItem = (catId) => {
    setActiveCategory(catId);
    setShowModal(true);
  };

  // ✅ Save item
  const saveNewItem = async () => {
    if (!newItemText.trim()) {
      Alert.alert("Please enter an item name");
      return;
    }
    if (!user || !sectionId || !activeCategory) {
      Alert.alert("Error", "Missing user or category info");
      return;
    }

    try {
      const itemRef = collection(
        db,
        "users",
        user.uid,
        "sections",
        sectionId,
        "categories",
        activeCategory,
        "items"
      );
      await addDoc(itemRef, { name: newItemText.trim() });
      setNewItemText("");
      setShowModal(false);
    } catch (err) {
      console.error("Error adding item:", err);
      Alert.alert("Failed to add item");
    }
  };

  // ✅ Delete item
  const handleDeleteItem = async (catId, itemId, itemName) => {
    Alert.alert("Delete Item", `Are you sure you want to delete "${itemName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const itemRef = doc(
              db,
              "users",
              user.uid,
              "sections",
              sectionId,
              "categories",
              catId,
              "items",
              itemId
            );
            await deleteDoc(itemRef);
          } catch (e) {
            console.error("Error deleting item:", e);
            Alert.alert("Failed to delete item");
          }
        },
      },
    ]);
  };
  // 🗑️ Delete entire category (and its items)
const handleDeleteCategory = async (catId, catName) => {
  Alert.alert("Delete Category", `Delete category "${catName}" and all its items?`, [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          const itemsRef = collection(
            db,
            "users",
            user.uid,
            "sections",
            sectionId,
            "categories",
            catId,
            "items"
          );
          const itemsSnap = await getDocs(itemsRef);
          const deletePromises = itemsSnap.docs.map((d) => deleteDoc(d.ref));
          await Promise.all(deletePromises);

          const catRef = doc(
            db,
            "users",
            user.uid,
            "sections",
            sectionId,
            "categories",
            catId
          );
          await deleteDoc(catRef);
        } catch (err) {
          console.error("Error deleting category:", err);
          Alert.alert("Failed to delete category");
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
          <Text style={styles.title}>Kitchen</Text>
        </View>

        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Ionicons name="search-outline" size={24} color="black" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addCategory}
            onPress={() => navigation.navigate("AddCategory", { sectionId })}
          >
            <Image
              source={require("../../assets/add.png")}
              style={styles.addIcon}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <Text style={styles.addText}>Add</Text>
              <Text style={styles.addText}>category</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      {categories.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 18, color: "#555" }}>No categories yet</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                onLongPress={() => handleDeleteCategory(item.id, item.name)}
                delayLongPress={600}
                style={styles.categoryHeader}
              >
                <Text style={styles.categoryName}>{item.name}</Text>
                <Ionicons
                  name={expanded[item.id] ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#333"
                />
              </TouchableOpacity>


              {expanded[item.id] && (
                <View style={styles.itemList}>
                  {itemsByCat[item.id]?.length ? (
                    itemsByCat[item.id].map((it) => (
                      <TouchableOpacity
                        key={it.id}
                        onLongPress={() => handleDeleteItem(item.id, it.id, it.name)}
                        delayLongPress={600}
                      >
                        <Text style={styles.itemName}>• {it.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noItems}>No items</Text>
                  )}

                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={() => handleAddItem(item.id)}
                  >
                    <Ionicons name="add" size={18} color="white" />
                    <Text style={styles.addItemLabel}>Add item</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter item name..."
              placeholderTextColor="#999"
              value={newItemText}
              onChangeText={setNewItemText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setShowModal(false);
                  setNewItemText("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#CBAF98" }]}
                onPress={saveNewItem}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAE4", paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  leftGroup: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 1, padding: 5 },
  title: { fontSize: 28, fontWeight: "bold" },
  iconGroup: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 15 },
  addCategory: { alignItems: "center", justifyContent: "center", marginLeft: 10 },
  addIcon: { width: 40, height: 40, marginBottom: 1, marginTop: 1 },
  textContainer: { alignItems: "center", justifyContent: "center" },
  addText: { fontSize: 12, color: "black", fontWeight: "bold", lineHeight: 15 },
  categoryContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  categoryName: { fontSize: 18, fontWeight: "600", color: "#333" },
  itemList: { paddingHorizontal: 20, paddingVertical: 10 },
  itemName: { fontSize: 16, color: "#444", marginVertical: 2 },
  noItems: { fontSize: 15, color: "#777", fontStyle: "italic" },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#CBAF98",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-end",
  },
  addItemLabel: { color: "white", marginLeft: 5 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#FFFAE4",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalInput: {
    width: "90%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "white",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "80%" },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  modalButtonText: { color: "white", fontWeight: "600" },
});
