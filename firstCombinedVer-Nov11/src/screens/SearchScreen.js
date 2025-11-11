import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { db } from '../utils/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const sectionsSnap = await getDocs(collection(db, "sections"));
        const allResults = [];

        for (const sectionDoc of sectionsSnap.docs) {
          const sectionData = sectionDoc.data();
          const sectionId = sectionDoc.id;
          const sectionName = sectionData.name;
          const sectionType = sectionData.type || 'unknown';

          // Fetch categories for this section
          const categoriesSnap = await getDocs(collection(db, "sections", sectionId, "categories"));

          for (const categoryDoc of categoriesSnap.docs) {
            const categoryData = categoryDoc.data();
            const categoryName = categoryData.name;
            const categoryId = categoryDoc.id;

            // Items could be an array or subcollection
            let items = [];

            if (Array.isArray(categoryData.items)) {
              // Stored as array field
              items = categoryData.items.map((itemName, index) => ({
                id: `${categoryId}-${index}`,
                name: itemName,
              }));
            } else {
              // Try to fetch from subcollection
              const itemsSnap = await getDocs(collection(db, "sections", sectionId, "categories", categoryId, "items"));
              itemsSnap.forEach(itemDoc => {
                items.push({
                  id: itemDoc.id,
                  name: itemDoc.data().name,
                });
              });
            }

            // Add to global array
            for (const item of items) {
              allResults.push({
                id: item.id,
                name: item.name,
                categoryName,
                sectionName,
                sectionType,
                sectionId,
              });
            }
          }
        }

        setAllItems(allResults);
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFilteredItems(
      allItems.filter(item => item.name?.toLowerCase().includes(lower))
    );
  }, [searchQuery, allItems]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#9EB995" />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search all items..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

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
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matching results found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAE4',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
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
