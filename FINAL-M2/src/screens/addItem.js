import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../utils/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";


//Cloudflare upload helper
const uploadToCloudflare = async (photoUri) => {
  try {
    console.log("[uploadToCloudflare] fetching blob for:", photoUri);
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const uploadResponse = await fetch(
      "https://image-uploader.jiaweishi020830.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": blob.type || "image/jpeg" },
        body: blob,
      }
    );

    const txt = await uploadResponse.text();
    console.log("[uploadToCloudflare] raw response text:", txt);

    // try parse
    let result;
    try {
      result = JSON.parse(txt);
    } catch (e) {
      console.warn("[uploadToCloudflare] response not JSON, returning raw text");
      return txt;
    }

    console.log("[uploadToCloudflare] parsed result:", result);

    const urlCandidates = [
      result.url,
      result?.result?.url,
      result?.data?.url,
      result?.output?.url,
    ].filter(Boolean);

    if (urlCandidates.length > 0) {
      console.log("[uploadToCloudflare] returning URL:", urlCandidates[0]);
      return urlCandidates[0];
    }

    console.warn("[uploadToCloudflare] no url found in worker response");
    return null;
  } catch (err) {
    console.error("[uploadToCloudflare] upload error:", err);
    return null;
  }
};

export default function AddItemScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sectionId, userData } = route.params || {};

  const [itemName, setItemName] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [saving, setSaving] = useState(false);

  // pick image from gallery
  const handleGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow photo library access.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled) {
        setPhotoUri(res.assets[0].uri);
        console.log("[AddItem] gallery selected:", res.assets[0].uri);
      }
    } catch (err) {
      console.error("[AddItem] gallery error:", err);
      Alert.alert("Error", "Could not open gallery.");
    }
  };

  // take photo with camera
  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow camera access.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled) {
        setPhotoUri(res.assets[0].uri);
        console.log("[AddItem] camera captured:", res.assets[0].uri);
      }
    } catch (err) {
      console.error("[AddItem] camera error:", err);
      Alert.alert("Error", "Could not open camera.");
    }
  };

  const handleSave = async () => {
  if (!itemName.trim()) {
    Alert.alert("Please enter item name");
    return;
  }

  try {
    const stored = await AsyncStorage.getItem("user");
    if (!stored) {
      Alert.alert("No user logged in");
      return;
    }
    const userData = JSON.parse(stored);

    let imageUrl = null;
    if (photoUri) {
      imageUrl = await uploadToCloudflare(photoUri);
    }

    const itemData = {
      name: itemName,
      image: imageUrl || null,
      createdAt: new Date().toISOString(),
    };

    await addDoc(
      collection(db, "users", userData.uid, "sections", sectionId, "items"),
      itemData
    );

    Alert.alert("Item added successfully!");
    navigation.goBack();
  } catch (error) {
    console.error("Error adding item:", error);
    Alert.alert("Failed to add item.");
  }
};

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Add item</Text>

        <Text style={styles.label}>1. Take / upload photo</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoButton} onPress={handleCamera}>
            <Text style={styles.photoText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={handleGallery}>
            <Text style={styles.photoText}>Photo Gallery</Text>
          </TouchableOpacity>
        </View>

        {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}

        <Text style={styles.label}>2. Item name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name..."
          placeholderTextColor="#FFFAE4"
          value={itemName}
          onChangeText={setItemName}
        />

        <Text style={styles.label}>3. Notification date</Text>
        <View style={styles.dateRow}>
          <TextInput style={styles.dateInput} placeholder="MM" keyboardType="numeric" value={month} onChangeText={setMonth} />
          <TextInput style={styles.dateInput} placeholder="DD" keyboardType="numeric" value={day} onChangeText={setDay} />
          <TextInput style={styles.dateInput} placeholder="YYYY" keyboardType="numeric" value={year} onChangeText={setYear} />
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} disabled={saving}>
            <Image source={require("../../assets/cancel.png")} style={styles.iconImage} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.circleButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#000" /> : <Image source={require("../../assets/confirm.png")} style={styles.iconImage} />}
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
    padding: 20 
  },
  title: { 
    fontSize: 45, 
    fontWeight: "bold", 
    marginBottom: 40 
  },
  label: { 
    alignSelf: "flex-start", 
    fontSize: 20, 
    marginBottom: 10 
  },
  photoRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "70%", 
    marginBottom: 20 
  },
  photoButton: { 
    flex: 1, 
    backgroundColor: "#9EB995", 
    marginHorizontal: 5, 
    height: 70, 
    borderRadius: 6, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  photoText: { 
    color: "#FFFAE4", 
    fontSize: 16 
  },
  preview: { 
    width: 140, 
    height: 140, 
    borderRadius: 8, 
    marginBottom: 15 
  },
  input: { 
    width: "70%", 
    height: 40, 
    backgroundColor: "#9EB995", 
    borderRadius: 4, 
    paddingHorizontal: 10, 
    marginBottom: 25, 
    fontSize: 20, 
    color: "#FFFAE4" 
  },
  dateRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "70%", 
    marginBottom: 40 
  },
  dateInput: { 
    backgroundColor: "#9EB995", 
    width: "30%", 
    height: 40, 
    borderRadius: 4, 
    textAlign: "center", 
    color: "#FFFAE4", 
    fontSize: 18 
  },
  bottomRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "50%", 
    marginTop: 40 
  },
  circleButton: { 
    width: 55, 
    height: 55, 
    borderRadius: 27.5, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  iconImage: { 
    width: 50, 
    height: 50, 
    resizeMode: "contain" 
  },
});