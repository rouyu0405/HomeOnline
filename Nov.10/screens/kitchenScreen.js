import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute , useFocusEffect, } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function KitchenScreen() {
  const navigation=useNavigation();
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const route=useRoute();
  const { sectionId } = route.params;


  const defaultCategories = [
    { id: 1, name: "Refrigerator", items: ["Wine opener", "Butter knife", "Sesame"] },
    { id: 2, name: "Cabinet 1", items: [] },
    { id: 3, name: "Cabinet 2", items: [] },
    { id: 4, name: "Drawer 1", items: [] },
    { id: 5, name: "Drawer 2", items: ["Wine opener", "Butter knife", "Sesame"] },
  ];

  useFocusEffect(
    useCallback(() => {

      const fetchCategories = async () => {
        try {
          const fetched = [];
          if (sectionId){
          const querySnapshot = await getDocs(collection(db, "sections", sectionId, "categories"));
          querySnapshot.forEach((doc) => {
            fetched.push({ id: doc.id,items: [], ...doc.data() });
          });
        }

          // ✅ 合并固定分类 + Firebase 分类
          setCategories([ 
            ...defaultCategories,
            ...(Array.isArray(fetched) ? fetched : []),]);
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      };

      fetchCategories();
    }, [sectionId])
  );
  const handleAddItem = async (categoryId) => {
  const newItem = prompt("Enter item name:");
  if (!newItem) return;

  try {
    const categoryRef = doc(db, "sections", sectionId, "categories", categoryId);
    const categorySnap = await getDoc(categoryRef);
    const data = categorySnap.data();
    const updatedItems = [...(data.items || []), newItem];

    await updateDoc(categoryRef, { items: updatedItems });

    // 更新本地 state
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, items: updatedItems } : c
      )
    );
  } catch (error) {
    console.error("Error adding item:", error);
  }
};

const handleDeleteCategory = async (categoryId) => {
  Alert.alert(
    "Delete Category",
    "Are you sure you want to delete this category?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "sections", sectionId, "categories", categoryId));
            setCategories((prev) => prev.filter((c) => c.id !== categoryId));
          } catch (error) {
            console.error("Error deleting category:", error);
          }
        },
      },
    ]
  );
};


  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftGroup}>
            <TouchableOpacity style={styles.backButton} onPress = {() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={40} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Kitchen</Text>
        </View>

        <View style={styles.iconGroup}>
          <Ionicons name="search-outline" size={24} color="black" style={styles.icon} />
          <TouchableOpacity 
            style={styles.addCategory}
            onPress={()=> navigation.navigate("AddCategory", { sectionId})}
            >
            <Image
                source={require("../assets/add.png")} // 👈 你自己的 icon PNG
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

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.categoryRow}
              onPress={() => toggleExpand(item.id)}
              onLongPress={() => handleDeleteCategory(item.id)}
              delayLongPress={800}    
            >
              <Text style={styles.categoryText}>{item.name}</Text>
              <View style={[styles.triangle, expanded === item.id && styles.triangleUp]} />
            </TouchableOpacity>

            {expanded === item.id && (
              <View style={styles.itemList}>
                {Array.isArray(item.items)&&
                  item.items.map((it, index) => (
                  <Text key={index} style={styles.itemText}>
                    {it}
                  </Text>
                ))}

                {/* add button */}
                <TouchableOpacity style={styles.addItemButton}>
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.addItemLabel}>Add item</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
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
  backButton:{
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
  addCategory: {
   alignItems: "center",
   justifyContent: "center",
   marginLeft: 10,
  },
  addIcon: {
    width: 40,
    height: 40,
    marginBottom: 1,
    marginTop: 1,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontSize: 12,
    marginTop: 1,
    color: "black",
    textAlign: "center",
    lineHeight: 15,
    fontWeight: "bold",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#aaa",
    paddingVertical: 15,
  },
  categoryText: {
    fontSize: 16,
  },
  itemList: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
  itemText: {
    fontSize: 14,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#CBAF98",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  alignSelf:"flex-end",
  },
  addItemLabel: {
    color: "white",
    marginLeft: 5,
  },
  triangle: {
  width: 0,
  height: 0,
  borderLeftWidth: 15,
  borderRightWidth: 15,
  borderTopWidth: 20,
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  borderTopColor: "#CBAF98", 
  marginLeft: 100,
},
triangleUp: {
  transform: [{ rotate: "180deg" }], 
},
});

