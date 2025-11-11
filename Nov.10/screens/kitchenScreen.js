import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert, TextInput, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, } from "firebase/firestore";

export default function KitchenScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const route = useRoute();
  const { sectionId } = route.params; // Map 里传的 "Kitchen" / "Bedroom" / 真正的 firebase id

  // modal 相关
  const [showModal, setShowModal] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // ✅ 你一开始写的固定分类（本地的）
  const defaultCategories = [
    { id: 1, name: "Refrigerator", items: ["Wine opener", "Butter knife", "Sesame"] },
    { id: 2, name: "Cabinet 1", items: [] },
    { id: 3, name: "Cabinet 2", items: [] },
    { id: 4, name: "Drawer 1", items: [] },
    { id: 5, name: "Drawer 2", items: ["Wine opener", "Butter knife", "Sesame"] },
  ];

  // ✅ 页面回来时加载 firebase 里的分类，并和本地的合并
  useFocusEffect(
    useCallback(() => {
      const fetchCategories = async () => {
        try {
          const fetched = [];

          if (sectionId) {
            // 只有真的有这个 sectionId，我们才去 firebase 读
            const querySnapshot = await getDocs(
              collection(db, "sections", sectionId, "categories")
            );
            querySnapshot.forEach((d) => {
              fetched.push({
                id: d.id,     // 👈 这里是 string
                items: [],
                ...d.data(),
              });
            });
          }

          setCategories([
            ...defaultCategories,          // 先放本地的
            ...(Array.isArray(fetched) ? fetched : []), // 再放 firebase 的
          ]);
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      };

      fetchCategories();
    }, [sectionId])
  );

  // 点击每个 category 里的 “Add item”
  const handleAddItem = (categoryId) => {
    setActiveCategory(categoryId);
    setShowModal(true);
  };

  // ✅ 真正保存 item
  const saveNewItem = async () => {
    if (!newItemText.trim()) {
      Alert.alert("Please enter an item name");
      return;
    }

    try {
      // 1. 先看看它是不是“本地的默认分类”（id 是数字）
      const clickedCategory = categories.find((c) => c.id === activeCategory);

      // 没找到就算了
      if (!clickedCategory) {
        Alert.alert("Category not found");
        return;
      }

      // ① 本地分类（默认的那几个）：只改本地，不进 firebase
      if (typeof clickedCategory.id === "number") {
        const updated = categories.map((c) => {
          if (c.id === activeCategory) {
            const oldItems = Array.isArray(c.items) ? c.items : [];
            return {
              ...c,
              items: [...oldItems, newItemText],
            };
          }
          return c;
        });

        setCategories(updated);
        setNewItemText("");
        setActiveCategory(null);
        setShowModal(false);
        return;
      }

      // ② 走到这里说明是 firebase 里真的有的分类（id 是字符串）
      // 但还是要防守：要有 sectionId
      if (!sectionId) {
        Alert.alert("No sectionId. Cannot save to Firestore.");
        return;
      }

      const secId = String(sectionId);
      const catId = String(activeCategory);

      const categoryRef = doc(db, "sections", secId, "categories", catId);
      const categorySnap = await getDoc(categoryRef);

      let oldItems = [];

      if (categorySnap.exists()) {
        const data = categorySnap.data();
        if (Array.isArray(data.items)) {
          oldItems = data.items;
        } else if (typeof data.items === "string") {
          oldItems = [data.items];
        } else {
          oldItems = [];
        }
      }

      const updatedItems = [...oldItems, newItemText];

      // ✅ 用 setDoc + merge，文档不存在也能写进去
      await setDoc(
        categoryRef,
        {
          items: updatedItems,
        },
        { merge: true }
      );

      // 本地也同步一下
      setCategories((prev) =>
        prev.map((c) =>
          String(c.id) === catId ? { ...c, items: updatedItems } : c
        )
      );

      setNewItemText("");
      setActiveCategory(null);
      setShowModal(false);
    } catch (error) {
      console.error("🔥 Error adding item:", error);
      Alert.alert("❌ Failed to add item. Check console for details.");
    }
  };

  const handleDeleteItem = async (categoryId, itemIndex) => {
  const clickedCategory = categories.find((c) => c.id === categoryId);
  if (!clickedCategory) return;

  Alert.alert(
    "Delete Item",
    `Are you sure you want to delete "${clickedCategory.items[itemIndex]}"?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedItems = clickedCategory.items.filter((_, i) => i !== itemIndex);

            // ✅ 本地 state 更新
            setCategories((prev) =>
              prev.map((c) =>
                c.id === categoryId ? { ...c, items: updatedItems } : c
              )
            );

            // ✅ 如果是 Firebase 分类（id 是字符串），同步数据库
            if (typeof categoryId === "string" && sectionId) {
              const categoryRef = doc(
                db,
                "sections",
                String(sectionId),
                "categories",
                String(categoryId)
              );
              await setDoc(categoryRef, { items: updatedItems }, { merge: true });
            }
          } catch (error) {
            console.error("Error deleting item:", error);
            Alert.alert("❌ Failed to delete item");
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={40} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Kitchen</Text>
        </View>

        <View style={styles.iconGroup}>
          <Ionicons name="search-outline" size={24} color="black" style={styles.icon} />
          <TouchableOpacity
            style={styles.addCategory}
            onPress={() => navigation.navigate("AddCategory", { sectionId })}
          >
            <Image
              source={require("../assets/add.png")}
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
                {Array.isArray(item.items) &&
                  item.items.map((it, index) => (
                  <TouchableOpacity
                    key={index}
                    onLongPress={() => handleDeleteItem(item.id, index)}
                    delayLongPress={600} // 长按 0.6 秒触发
                  >
                    <Text style={styles.itemText}>{it}</Text>
                  </TouchableOpacity>
                  ))}

                {/* add button */}
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
      />

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
    alignSelf: "flex-end",
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

