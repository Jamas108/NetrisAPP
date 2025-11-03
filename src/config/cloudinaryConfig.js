// Configuración de Cloudinary
// Para variables de entorno, instala: npm install react-native-dotenv

// Si usas variables de entorno, descomentar esto:
// import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

// Konfigurasi URL untuk upload
const CLOUDINARY_CLOUD_NAME = 'dxabrthol'; // Alternativamente usar: CLOUDINARY_CLOUD_NAME || 'drctc9wat'
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Alternativamente usar: CLOUDINARY_UPLOAD_PRESET || 'ml_default'

export const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/image/upload';

// Export kredensial
export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  secure: true
};