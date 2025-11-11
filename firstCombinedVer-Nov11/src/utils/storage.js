import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'userPrefs';

export async function saveUserPrefs(name, email, password, birthday) {
    try {
        const payload = JSON.stringify({ name, email, password, birthday });
        await AsyncStorage.setItem(KEY, payload);
    } catch (e) {
        console.warn('Failed to save prefs', e);
    }
}

export async function loadUserPrefs() {
    try {
        const raw = await AsyncStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('Failed to fetch prefs', e);
        return null;
    }
}

export async function removeUserPrefs() {
    try {
        await AsyncStorage.removeItem(KEY);
    } catch (e) {
        console.warn('Failed to clear prefs', e)
    }
}
