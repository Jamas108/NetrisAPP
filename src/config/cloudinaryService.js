import { CLOUDINARY_URL, cloudinaryConfig } from './cloudinaryConfig';
import firebase, { FIREBASE_DB } from './FIREBASE';

/**
 * Upload gambar ke Cloudinary
 * @param {string} imageUri - URI gambar dari ImagePicker
 * @returns {Promise} - Hasil upload
 */
export const uploadToCloudinary = async (imageUri) => {
  try {
    // Validasi URI gambar
    if (!imageUri) {
      throw new Error('Image URI tidak valid');
    }

    // Persiapkan formData dengan file
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type,
      name: filename,
    });
    
    // Tambahkan upload preset (untuk unsigned upload)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    // Opsional: tambahkan folder dan tag
    formData.append('folder', 'netris_app');
    formData.append('tags', 'mobile_upload,tambal_ban');
    
    console.log('Uploading to Cloudinary with preset:', cloudinaryConfig.uploadPreset);
    
    // Lakukan upload
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Jangan set Content-Type untuk FormData, biarkan browser yang mengatur
      },
    });
    
    // Cek apakah response berhasil
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    console.log('Upload success:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Alias untuk backward compatibility dengan kode sebelumnya
export const uploadImageToCloudinary = uploadToCloudinary;