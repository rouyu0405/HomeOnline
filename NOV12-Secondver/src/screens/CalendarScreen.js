import React from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function CalendarScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <ImageBackground 
                source={require("../../assets/calendarHolder.png")} 
                resizeMode="cover" 
                style={styles.image}/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 42,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000c0',
  },
});