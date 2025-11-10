import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { firebase_auth, db } from '../utils/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileScreen({ route, navigation }) {
  const [userData, setUserData] = useState(route.params?.userData || null);
  const [loading, setLoading] = useState(!route.params?.userData);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase_auth, async (currentUser) => {
      if (!currentUser) {
        navigation.replace('LogIn');
        return;
      }

      if (!userData) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            Alert.alert('User not found');
          }
        } catch (e) {
          console.error('Error:', e);
          Alert.alert('Failed to load');
        } finally {
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(firebase_auth);
      navigation.replace('Start');
    } catch (e) {
      console.error(e);
      Alert.alert('Error loggin out');
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userData.name}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email}</Text>

        <Text style={styles.label}>Birthday:</Text>
        <Text style={styles.value}>{userData.birthday}</Text>

        
        <Text style={styles.text}>.</Text>
        
        <Button title="Log Out"
          onPress={handleLogout}
          color={'#9EB995'}
        />

        <Text style={styles.text}>.</Text>

        <Button title="Switch Account"
          onPress={async () => {
            try {
              await signOut(firebase_auth);
              navigation.replace('LogIn'); //redirect to login
            } catch (e) {
              Alert.alert('Error switching accounts');
            }
          }}
          color={'#9EB995'}
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAE4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: '#555',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 30,
    color: '#333'
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    marginBottom: 15,
  },
  text: {
    color: '#FFFAE4',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
});
