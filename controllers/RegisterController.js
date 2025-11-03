import { FIREBASE_AUTH, FIREBASE_DB } from '../src/config/FIREBASE';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { storeData } from '../utils/localStorage';

export const handleRegister = async (nama, email, password, phoneNumber, navigation) => {
  try {
    const userData = {
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      role: 'pengguna',
      phoneNumber: phoneNumber.trim(),
      isActive: true,
      approvedBy: 'auto',
      approvedAt: new Date().toISOString()
    };

    const userCredential = await createUserWithEmailAndPassword(
      FIREBASE_AUTH, 
      userData.email, 
      password
    );
    
    const completeUserData = {
      ...userData,
      uid: userCredential.user.uid,
      createdAt: new Date().toISOString()
    };
    
    await set(ref(FIREBASE_DB, 'users/' + userCredential.user.uid), completeUserData);
    await storeData('user', completeUserData);
    
    return {
      success: true,
      userData: completeUserData,
      message: 'Registrasi berhasil'
    };
    
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat mendaftar';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Tidak ada koneksi internet. Periksa koneksi Anda.';
          break;
        default:
          errorMessage = error.message || 'Terjadi kesalahan saat mendaftar';
      }
    } else {
      errorMessage = error.message || 'Terjadi kesalahan tidak dikenal';
    }
    
    throw new Error(errorMessage);
  }
};