// src/screens/SearchScreen.js
import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchScreen({ route, navigation }) {
  const queryFrom = route.params?.query || "";
  const [query, setQuery] = useState(queryFrom);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const run = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);
      const db = await import("../utils/db");
      const sections = await db.fetchSections(u.uid);
      const out = [];
      for (const s of sections) {
        const itemsTop = await db.fetchItemsInSection(u.uid, s.id);
        itemsTop.forEach((i) => out.push({ ...i, sectionId: s.id, sectionName: s.name, categoryName: "(none)", sectionType: s.type }));
        const cats = await db.fetchCategories(u.uid, s.id);
        for (const c of cats) {
          const items = await db.fetchItemsInCategory(u.uid, s.id, c.id);
          items.forEach((i) => out.push({ ...i, sectionId: s.id, sectionName: s.name, categoryName: c.name, sectionType: s.type }));
        }
      }
      setResults(out);
    };
    run();
  }, []);

  const filtered = results.filter((r) => (r.name || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: "#FCF8E6" }}>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search items..." style={{ backgroundColor: "#fff", height: 44, borderRadius: 8, paddingHorizontal: 8 }} />
      <FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate(item.sectionType === "clothing" ? "Closet" : "Kitchen", { sectionId: item.sectionId, sectionName: item.sectionName, highlightItemName: item.name })} style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
          <Text style={{ fontWeight: "700" }}>{item.name}</Text>
          <Text>{item.sectionName} • {item.categoryName}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}
