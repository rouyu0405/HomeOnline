import { View, Text, StyleSheet, Button, Image } from 'react-native';

export default function StartScreen({ navigation }) {
    return (
        <View style={[styles.container]}> 
            <Image 
                source={require("../../assets/home.png")}
                style={[styles.image]}
            />
            <Text style={[styles.title]}>HomeOnline</Text>
            <Button 
                title="Log In" 
                onPress={() => navigation.navigate("LogIn")}
                color={'#9EB995'}
            />
            <Text style={styles.text}>-OR-</Text>
            <Button 
                title="Sign Up" 
                onPress={() => navigation.navigate("SignUp")} 
                color={'#9EB995'}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, 
        justifyContent:"center", 
        alignItems:"center", 
        backgroundColor:"#FFFAE4"},
    image: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 35,
        fontWeight: '900',
        color: '#333',
        marginBottom: 50,
    },
    text: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
        marginTop: 20,
    },
})