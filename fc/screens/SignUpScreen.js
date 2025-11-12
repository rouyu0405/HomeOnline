import React, { useState } from 'react';
import { Button, View, Image, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { firebase_auth, db } from '../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthday, setBirthday] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password || !name || !birthday) {
            Alert.alert('Missing info');
            return;
        }

        setLoading(true);

        try {
            //Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                firebase_auth,
                email.trim(),
                password
            );

            const user = userCredential.user;

            //Save additional user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                    name: name.trim(),
                    email: email.trim(),
                    birthday,
                    createdAt: new Date().toISOString(),
            });

            //Navigate to Login after successful signup
            Alert.alert("Account created successfully!", "You can now log in.");
            navigation.navigate('LogIn');

        } catch (e) {
                console.error("signup error", e.code, e.message);
                Alert.alert("Sign Up Failed", e.message);
                return;
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <TextInput
                placeholder="Birthday (YYYY-MM-DD)"
                value={birthday}
                onChangeText={setBirthday}
                style={styles.input}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#9EB995" style={{ marginTop: 15 }} />
            ) : (
                <Button title="Submit" onPress={handleSubmit} color="#9EB995" />
            )}

            <Image 
                source={require("../assets/google.png")}
                style={[styles.image]}
            />
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFAE4',
        padding: 20,
    },
    title: {
        color: '#333',
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 30,
    },
    input: {
        width: '80%',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    image: {
        width: 80,
        height: 80,
        marginTop: 50,
    },
})