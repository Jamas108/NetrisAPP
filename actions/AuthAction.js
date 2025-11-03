import { Alert } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../src/config/FIREBASE';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { storeData, clearStorage } from '../utils/localStorage';

// Register user with email and password
export const registerUser = async (data, password) => {
  try {
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      FIREBASE_AUTH, 
      data.email, 
      password
    );
    
    // Add user ID to the data
    const userData = {
      ...data,
      uid: userCredential.user.uid,
      createdAt: new Date().toISOString()
    };
    
    // Save user data to Firebase Realtime Database
    await set(ref(FIREBASE_DB, 'users/' + userCredential.user.uid), userData);
    
    // Store user data in AsyncStorage
    await storeData('user', userData);
    
    return userData;
  } catch (error) {
    throw error;
  }
};

// Login user with email and password
export const loginUser = async (email, password) => {
  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      FIREBASE_AUTH, 
      email, 
      password
    );
    
    // Get user data from Firebase Realtime Database
    const snapshot = await get(ref(FIREBASE_DB, 'users/' + userCredential.user.uid));
    
    if (snapshot.exists()) {
      // Get user data
      const userData = snapshot.val();
      
      // Store user data in AsyncStorage
      await storeData('user', userData);
      
      return userData;
    } else {
      throw new Error('User data not found');
    }
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    console.log('Starting profile update process...');
    
    const user = FIREBASE_AUTH.currentUser;
    
    if (!user) {
      throw new Error('No user logged in');
    }
    
    console.log('Updating profile for user:', user.uid);
    console.log('New data:', userData);
    
    // Update user data in Firebase Realtime Database
    const userRef = ref(FIREBASE_DB, 'users/' + user.uid);
    await set(userRef, {
      ...userData,
      uid: user.uid,
      updatedAt: new Date().toISOString()
    });
    
    console.log('Profile updated in Firebase Database');
    
    // Update user data in AsyncStorage
    await storeData('user', userData);
    
    console.log('Profile updated in AsyncStorage');
    
    return { success: true, userData };
    
  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        fullError: error
      }
    };
  }
};

// Change user password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    console.log('Starting password change process...');
    
    const user = FIREBASE_AUTH.currentUser;
    console.log('Current user:', user ? 'Logged in' : 'Not logged in');
    
    if (!user) {
      throw new Error('No user logged in');
    }
    
    if (!user.email) {
      throw new Error('User email not found');
    }
    
    console.log('User email:', user.email);
    console.log('Attempting re-authentication...');
    
    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    console.log('Re-authentication successful, updating password...');
    
    // Update password
    await updatePassword(user, newPassword);
    
    console.log('Password updated successfully');
    return { success: true };
    
  } catch (error) {
    console.error('Password change error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Return detailed error info
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        fullError: error
      }
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(FIREBASE_AUTH);
    clearStorage();
    return true;
  } catch (error) {
    Alert.alert('Logout Error', error.message);
    return false;
  }
};