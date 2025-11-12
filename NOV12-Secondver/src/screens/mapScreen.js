import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Pressable, Alert, FlatList, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function MapScreen({userData}) {
  const navigation = useNavigation();
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load rooms/sections normally
  useFocusEffect(
    useCallback(() => {
      const fetchSections = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "users", userData.uid, "sections"));
          const fetchedRooms = [];

          querySnapshot.forEach((d) => {
            const data = d.data();
            fetchedRooms.push({
              id: d.id,
              name: data.name,
              screen: data.type || "Storage",
            });
          });

          const defaultRooms = [
            { id: "Kitchen", name: "Kitchen", screen: "Kitchen" },
            { id: "Bedroom", name: "Bedroom", screen: "Closet" },
          ];

          setRooms([...defaultRooms, ...fetchedRooms]);
        } catch (error) {
          console.error("Error loading sections:", error);
        }
      };

      fetchSections();
    }, [])
  );

  // Fetch all items across sections/categories for search
useEffect(() => {
  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const sectionsSnap = await getDocs(collection(db, "users", userData.uid, "sections"));
      const allResults = [];

      for (const sectionDoc of sectionsSnap.docs) {
        const sectionData = sectionDoc.data();
        const sectionId = sectionDoc.id;
        const sectionName = sectionData.name;
        const sectionType = sectionData.type || 'unknown';

        // ✅ 1️⃣ First, grab items directly under the section (Kitchen)
        const itemsSnap = await getDocs(collection(db, "users", userData.uid, "sections", sectionId, "items"));
        itemsSnap.forEach(itemDoc => {
          const itemData = itemDoc.data();
          allResults.push({
            id: itemDoc.id,
            name: itemData.name,
            categoryName: "(none)",
            sectionName,
            sectionType,
            sectionId,
          });
        });

        // ✅ 2️⃣ Then, grab categories (Closet)
        const categoriesSnap = await getDocs(collection(db, "users", userData.uid, "sections", sectionId, "categories"));
        for (const categoryDoc of categoriesSnap.docs) {
          const categoryData = categoryDoc.data();
          const categoryName = categoryData.name;
          const categoryId = categoryDoc.id;

          // Items inside each category
          const catItemsSnap = await getDocs(
            collection(db, "users", userData.uid, "sections", sectionId, "categories", categoryId, "items")
          );
          catItemsSnap.forEach(itemDoc => {
            const itemData = itemDoc.data();
            allResults.push({
              id: itemDoc.id,
              name: itemData.name,
              categoryName,
              sectionName,
              sectionType,
              sectionId,
            });
          });
        }
      }

      setAllItems(allResults);
    } catch (error) {
      console.error("Error fetching all items:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAllItems();
}, []);


  // Filter items based on search input
  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFilteredItems(
      allItems.filter(item => item.name?.toLowerCase().includes(lower))
    );
  }, [searchQuery, allItems]);

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Section",
      "Are you sure you want to delete this section?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", userData.uid, "sections", id));
              setRooms((prev) => prev.filter((room) => room.id !== id));
              console.log("Deleted section:", id);
            } catch (error) {
              console.error("Error deleting section:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#9EB995" />;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search all items..."
          placeholderTextColor="#FFFAE4"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => { /* optional: trigger search */ }}>
          <FontAwesome name="search" size={24} color="#CBAF98" />
        </TouchableOpacity>
      </View>

      {/* Show search results if query entered, else show rooms grid */}
      {searchQuery.length > 0 ? (
        filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => {
                  const targetScreen =
                    item.sectionType === "clothing" ? "Closet" : "Kitchen";

                  navigation.navigate(targetScreen, {
                    sectionId: item.sectionId,
                    sectionName: item.sectionName,
                    sectionType: item.sectionType,
                    highlightItemName: item.name,
                  });
                }}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.meta}>Category: {item.categoryName}</Text>
                <Text style={styles.meta}>Section: {item.sectionName}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No matching results found.</Text>
        )
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {rooms.map((room, index) => (
            <Pressable
              key={index}
              onPress={() => navigation.navigate(room.screen, { sectionId: room.id, userData })}
              onLongPress={() => handleDelete(room.id)}
              delayLongPress={800}
              style={({ pressed }) => [
                styles.roomBox,
                pressed && { backgroundColor: "#A9BCE3" },
              ]}
            >
              <Text style={styles.roomText}>{room.name}</Text>
            </Pressable>
          ))}

          {/* Add Section Button */}
          <View style={styles.addContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("AddSection")}
            >
              <Image
                source={require("../../assets/add.png")}
                style={styles.addIcon}
                resizeMode="contain"
              />
              <View style={styles.addTextContainer}>
                <Text style={styles.addText}>Add</Text>
                <Text style={styles.addText}>section</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF8E6",
    alignItems: "center",
    paddingTop: 60,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  searchInput: {
    backgroundColor: "#9EB995",
    width: 250,
    height: 35,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    color: "#FFFAE4",
    paddingLeft: 10,
  },
  searchButton: {
    width: 40,
    height: 35,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 1,
    borderColor: "#97AA8B",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignContent: "flex-start",
    paddingHorizontal: 50,
    paddingBottom: 40,
  },
  roomBox: {
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
  roomText: {
    color: "#FFFAE4",
    fontWeight: "600",
    fontSize: 15,
  },
  addContainer: {
    width: "45%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
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
  resultCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});
