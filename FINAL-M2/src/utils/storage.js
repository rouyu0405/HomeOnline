// src/utils/storage.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

const makePath = (prefix = "images") => {
  const now = Date.now();
  return `${prefix}/${now}-${Math.random().toString(36).slice(2, 9)}.jpg`;
};

export const uploadBlobToStorage = async (blob, prefix = "images") => {
  const path = makePath(prefix);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  return url;
};
