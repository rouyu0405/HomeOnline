import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { db, firebase_auth } from '../utils/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = firebase_auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      try {
        const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const notesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(notesData);
        await AsyncStorage.setItem('userNotes', JSON.stringify(notesData)); // cache notes
      } catch (error) {
        console.error('Error fetching notes:', error);
        // fallback to local cache
        const cached = await AsyncStorage.getItem('userNotes');
        if (cached) setNotes(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  // filter notes as user types
  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(lower) ||
      note.content.toLowerCase().includes(lower)
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#9EB995" />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text numberOfLines={2} style={styles.noteContent}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No matching notes found.</Text>}
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
  noteCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noteContent: {
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});
