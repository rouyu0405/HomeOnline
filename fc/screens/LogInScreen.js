import React, { useState } from 'react';
import { Button, View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { firebase_auth, db } from '../utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LogInScreen({ navigation, setIsLoggedIn, setUserData }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Incorrect email or password');
            return;
        }

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(firebase_auth, email.trim(), password);
            const user = userCredential.user;

            //fetch user info
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                Alert.alert('Please sign up first.');
                return;
            }

            const userInfo = userDoc.data();

            setUserData(userInfo);
            setIsLoggedIn(true);

        } catch (e) {
            console.error(e);
            Alert.alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Home!</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
                keyboardType='email-address'
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button title={loading? "Logging in..." : "Log In"}
                onPress={handleLogin}
                color={'#9EB995'}
            />
            <Text style={styles.text}>No account? Create one first:</Text>
            <Button title="Sign Up"
                onPress={() => navigation.navigate('SignUp')}
                color={'#9EB995'}
            />
            
        </View>
    );
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFAE4'
        },
        title: {
            color: '#333',
            fontSize: 28,
            fontWeight: '900',
            marginBottom: 30,
        },
        text: {
            color: '#333',
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 10,
            marginTop: 60,
        },
        input: {
            width: '80%',
            padding: 10,
            backgroundColor: '#fff',
            borderRadius: 8,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: '#ccc'
        },
    }
);