import React, { useState,useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { collection, getDocs, deleteDoc,doc } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

export default function MapScreen() {
  const navigation = useNavigation(); // 👈 启用导航
  const [rooms, setRooms]=useState([]);

//  const rooms = [
//     { name: "Kitchen", screen: "Kitchen" },
//     { name: "Closet", screen: "Closet" },
//     { name: "Storage", screen: "Storage" },
//     { name: "Bedroom", screen: "Bedroom" },
//     { name: "Living Room", screen: "LivingRoom" },
//     { name: "Table", screen: "Table" },
//     { name: "Washroom", screen: "Washroom" },
//   ];
  useFocusEffect(
  useCallback(() => {
    const fetchSections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sections"));
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
            await deleteDoc(doc(db, "sections", id));
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


  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#FFFAE4"
        />
        <TouchableOpacity style={styles.searchButton}>
        <FontAwesome name="search" size={24} color="#CBAF98" />
        </TouchableOpacity>
      </View>

      {/* 房间方块 */}
      <ScrollView contentContainerStyle={styles.grid}>
        {rooms.map((room, index) => (
          <Pressable
            key={index}
            onPress={() => navigation.navigate(room.screen, { sectionId: room.id})} 
            onLongPress={() => handleDelete(room.id)}   // 👈 长按删除
            delayLongPress={800}                        // 👈 按住 0.8 秒触发
            style={({ pressed }) => [
              styles.roomBox,
              pressed && { backgroundColor: "#A9BCE3" },
            ]}
          >
            <Text style={styles.roomText}>{room.name}</Text>
          </Pressable>
        ))}

        {/* Add Section 按钮 */}
        <View style={styles.addContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={()=>navigation.navigate("AddSection")}
          >
            <Image
              source={require("../assets/add.png")}
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
    borderWidth: 1,          // 给边缘加一个轻微边框
    borderColor: "#97AA8B",
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#CBAF98",
    resizeMode: "contain",
    marginTop: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",   // ✅ 必加：防止被拉伸！
    alignContent: "flex-start", // ✅ 必加：确保多行布局正常计算比例
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
    elevation: 2, // Android 阴影
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
  addIcon:{
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
