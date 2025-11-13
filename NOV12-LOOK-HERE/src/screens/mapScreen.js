// src/screens/MapScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Pressable, FlatList, ActivityIndicator, Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchSections, deleteSection } from "../utils/db";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { useIsFocused } from "@react-navigation/native";

export default function MapScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) return;
      setUser(JSON.parse(raw));
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchSections(user.uid)
      .then((sections) => {
        const defaultRooms = [
          { id: "Closet", name: "Closet", type: "clothing" },
          { id: "Kitchen", name: "Kitchen", type: "storage" },
        ];
        setRooms([...defaultRooms, ...sections]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, isFocused]);

  // fetch/search index
  useEffect(() => {
    const buildIndex = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const dbHelpers = await import("../utils/db");
        const sections = await dbHelpers.fetchSections(user.uid);
        const results = [];
        for (const s of sections) {
          const itemsTop = await dbHelpers.fetchItemsInSection(user.uid, s.id);
          itemsTop.forEach((i) => results.push({ ...i, sectionId: s.id, sectionName: s.name, categoryName: "(none)", sectionType: s.type || "storage" }));
          const cats = await dbHelpers.fetchCategories(user.uid, s.id);
          for (const c of cats) {
            const items = await dbHelpers.fetchItemsInCategory(user.uid, s.id, c.id);
            items.forEach((i) => results.push({ ...i, sectionId: s.id, sectionName: s.name, categoryName: c.name, sectionType: s.type || "storage" }));
          }
        }
        setAllItems(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    buildIndex();
  }, [user, isFocused]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredItems(allItems.filter((it) => (it.name || "").toLowerCase().includes(q)));
  }, [searchQuery, allItems]);

  const handleDelete = (id) => {
    Alert.alert("Delete Section", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSection(user.uid, id);
            setRooms((r) => r.filter((x) => x.id !== id));
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("user");
    navigation.reset({ index: 0, routes: [{ name: "Start" }] });
  };

  if (!user || loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput placeholder="Search items..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput} />
        <TouchableOpacity onPress={() => navigation.navigate("Search", { query: searchQuery })} style={styles.goBtn}>
          <Text>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("AddSection")} style={styles.addBtn}>
          <Text style={{ color: "#fff" }}>+ Section</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} style={{ marginLeft: 8 }}>
          <Text style={{ color: "#c00" }}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {searchQuery.length > 0 ? (
        filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(item.sectionType === "clothing" ? "Closet" : "Kitchen", {
                    sectionId: item.sectionId,
                    sectionName: item.sectionName,
                    highlightItemName: item.name,
                  })
                }
                style={styles.resultCard}
              >
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                <Text>{item.sectionName} • {item.categoryName}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noResults}>No results</Text>
        )
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {rooms.map((room) => (
            <Pressable
              key={room.id}
              style={styles.roomBox}
              onPress={() => navigation.navigate(room.type === "clothing" ? "Closet" : "Kitchen", { sectionId: room.id, sectionName: room.name, sectionType: room.type })}
              onLongPress={() => (room.id !== "Closet" && room.id !== "Kitchen") && handleDelete(room.id)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>{room.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCF8E6", paddingTop: 24 },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, backgroundColor: "#fff", height: 40, borderRadius: 8, paddingHorizontal: 10 },
  goBtn: { marginLeft: 8, padding: 8 },
  addBtn: { marginLeft: 8, backgroundColor: "#9EB995", padding: 8, borderRadius: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12 },
  roomBox: { width: "45%", aspectRatio: 1, backgroundColor: "#9EB995", margin: 8, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  resultCard: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  noResults: { textAlign: "center", marginTop: 20 },
});
