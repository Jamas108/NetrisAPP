import { Alert } from 'react-native';
import { loginUser, logoutUser } from '../actions/AuthAction';
import { getData, clearStorage } from '../utils/localStorage';

export const handleLogin = async (email, password, navigation) => {
  try {
    // Validate input fields
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi!');
      return;
    }

    // Login with Firebase
    const userData = await loginUser(email, password);
    
    // Route user based on role
    switch (userData.role) {
      case 'pengguna':
        navigation.replace('Pengguna');
        break;
      case 'admin':
        navigation.replace('HomeAdmin');
        break;
      case 'superadmin':
        navigation.replace('HomeSuperAdmin');
        break;
      default:
        Alert.alert('Error', 'Role pengguna tidak valid!');
    }
  } catch (error) {
    let errorMessage = 'Login gagal';
    
    // Handle Firebase authentication errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Email atau password salah!';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Format email tidak valid!';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Akun telah dinonaktifkan!';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti.';
    }
    
    Alert.alert('Login Gagal', errorMessage);
    console.log('Login Error:', error);
  }
};

// Function to handle logout
export const handleLogout = async (navigation) => {
  try {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ya, Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Logout from Firebase and clear AsyncStorage
              const success = await logoutUser();
              
              if (success) {
                // Navigate to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            } catch (error) {
              console.log('Logout Error:', error);
              Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
            }
          },
        },
      ]
    );
  } catch (error) {
    console.log('Logout Error:', error);
    Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
  }
};

// Function to check if user is logged in
export const checkUserLogin = async () => {
  try {
    const userData = await getData('user');
    return userData && userData.role ? userData : null;
  } catch (error) {
    console.log('Error checking user login:', error);
    return null;
  }
};

// Function to get current user data
export const getCurrentUser = async () => {
  try {
    const userData = await getData('user');
    return userData;
  } catch (error) {
    console.log('Error getting current user:', error);
    return null;
  }
};