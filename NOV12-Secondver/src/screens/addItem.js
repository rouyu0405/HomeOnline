import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db, storage } from "../utils/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// ✅ Cloudflare 上传函数
const uploadToCloudflare = async (photoUri) => {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const uploadResponse = await fetch(
      "https://image-uploader.jiaweishi020830.workers.dev/", // 👈 你的 Worker URL
      {
        method: "POST",
        headers: {
          "Content-Type": blob.type || "image/jpeg",
        },
        body: blob,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    console.log("✅ Uploaded to Cloudflare:", result.url);
    return result.url;
  } catch (error) {
    console.error("❌ Upload error:", error);
    return null;
  }
};

export default function AddItemScreen({userData}) {
  const navigation = useNavigation();
  const route = useRoute();
  const { sectionId } = route.params || {};
  const [itemName, setItemName] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");

  // 📷 打开相机
  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // 🖼️ 打开相册
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // ✅ 保存到 Firestore
  const handleSave = async () => {
    if (!itemName.trim()) {
      Alert.alert("Please enter item name");
      return;
    }

    try {
      let imageUrl = null;

      // ✅ 使用 Cloudflare 上传替代 Firebase Storage
      if (photoUri) {
        imageUrl = await uploadToCloudflare(photoUri);
      }

      // 存储 Firestore
        if (sectionType === "clothing") {
        await addDoc(
            collection(db, "users", userData.uid, "sections", sectionId, "items"),
            itemData
        );
        } else {
        await addDoc(
            collection(
            db,
            "users",
            userData.uid,
            "sections",
            sectionId,
            "categories",
            categoryId,
            "items"
            ),
            itemData
        );
        }

      Alert.alert("✅ Item added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("❌ Failed to add item.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Add item</Text>

        {/* 1️⃣ 拍照 / 上传照片 */}
        <Text style={styles.label}>1. Take / upload photo</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoButton} onPress={handleCamera}>
            <Text style={styles.photoText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={handleGallery}>
            <Text style={styles.photoText}>Photo Gallery</Text>
          </TouchableOpacity>
        </View>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}

        {/* 2️⃣ 物品名称 */}
        <Text style={styles.label}>2. Item name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name..."
          placeholderTextColor="#FFFAE4"
          value={itemName}
          onChangeText={setItemName}
        />

        {/* 3️⃣ 通知日期 */}
        <Text style={styles.label}>3. Notification date</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={styles.dateInput}
            placeholder="Month"
            placeholderTextColor="#FFFAE4"
            keyboardType="numeric"
            value={month}
            onChangeText={setMonth}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Day"
            placeholderTextColor="#FFFAE4"
            keyboardType="numeric"
            value={day}
            onChangeText={setDay}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Year"
            placeholderTextColor="#FFFAE4"
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
          />
        </View>

        {/* ✅ 底部按钮 */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../assets/cancel.png")}
              style={styles.iconImage}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => {
              Keyboard.dismiss();
              handleSave();
            }}
          >
            <Image
              source={require("../../assets/confirm.png")}
              style={styles.iconImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAE4",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 45,
    fontWeight: "bold",
    marginBottom: 40,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 20,
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    backgroundColor: "#9EB995",
    marginHorizontal: 5,
    height: 70,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    color: "#FFFAE4",
    fontSize: 16,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    width: "70%",
    height: 40,
    backgroundColor: "#9EB995",
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 25,
    fontStyle: "italic",
    fontSize: 20,
    color: "#FFFAE4",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginBottom: 40,
  },
  dateInput: {
    backgroundColor: "#9EB995",
    width: "30%",
    height: 40,
    borderRadius: 4,
    textAlign: "center",
    color: "#FFFAE4",
    fontSize: 18,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginTop: 40,
  },
  circleButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});