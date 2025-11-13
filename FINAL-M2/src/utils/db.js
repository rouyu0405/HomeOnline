// src/utils/db.js
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Collections:
 * users/{uid}/sections/{sectionDoc}
 * users/{uid}/sections/{sectionId}/categories/{categoryDoc}
 * users/{uid}/sections/{sectionId}/items/{itemDoc}       // top-level items (for clothing)
 * users/{uid}/sections/{sectionId}/categories/{categoryId}/items/{itemDoc}
 */

export const createSection = async (uid, sectionData) => {
  const ref = collection(db, "users", uid, "sections");
  return await addDoc(ref, sectionData);
};

export const fetchSections = async (uid) => {
  const ref = collection(db, "users", uid, "sections");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteSection = async (uid, sectionId) => {
  const ref = doc(db, "users", uid, "sections", sectionId);
  return await deleteDoc(ref);
};

export const createCategory = async (uid, sectionId, categoryData) => {
  const ref = collection(db, "users", uid, "sections", sectionId, "categories");
  return await addDoc(ref, categoryData);
};

export const fetchCategories = async (uid, sectionId) => {
  const ref = collection(db, "users", uid, "sections", sectionId, "categories");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createItem = async (uid, sectionId, categoryId = null, itemData) => {
  const ref = categoryId
    ? collection(db, "users", uid, "sections", sectionId, "categories", categoryId, "items")
    : collection(db, "users", uid, "sections", sectionId, "items");
  return await addDoc(ref, itemData);
};

export const fetchItemsInSection = async (uid, sectionId) => {
  const ref = collection(db, "users", uid, "sections", sectionId, "items");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const fetchItemsInCategory = async (uid, sectionId, categoryId) => {
  const ref = collection(db, "users", uid, "sections", sectionId, "categories", categoryId, "items");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
