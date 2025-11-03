import AsyncStorage from '@react-native-async-storage/async-storage';

// Store data in AsyncStorage
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.log('Error storing data:', error);
  }
};

// Get data from AsyncStorage
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.log('Error getting data:', error);
    return null;
  }
};

// Clear all data from AsyncStorage
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log('Error clearing data:', error);
  }
};