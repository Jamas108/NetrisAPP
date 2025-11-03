import firebase, { FIREBASE_DB } from './FIREBASE';

// Function untuk menyimpan data tambal ban baru ke Firebase
export const saveTambalBanData = async (data) => {
  try {
    // Buat referensi ke koleksi tambal_ban
    const tambalBanRef = FIREBASE_DB.ref('tambal_ban');
    
    // Generate key baru
    const newTambalBanRef = tambalBanRef.push();
    
    // Tambahkan ID dan timestamp
    const dataToSave = {
      ...data,
      id: newTambalBanRef.key,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Simpan data ke Firebase
    await newTambalBanRef.set(dataToSave);
    
    return dataToSave;
  } catch (error) {
    console.error('Error saving tambal ban data:', error);
    throw error;
  }
};

// Function untuk mengambil semua data tambal ban dari Firebase
export const getAllTambalBanData = async () => {
  try {
    const snapshot = await FIREBASE_DB.ref('tambal_ban').once('value');
    
    if (snapshot.exists()) {
      // Convert snapshot to array
      const tambalBanList = [];
      snapshot.forEach((childSnapshot) => {
        tambalBanList.push({ 
          ...childSnapshot.val()
        });
      });
      
      return tambalBanList;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting tambal ban data:', error);
    throw error;
  }
};

// Function untuk mengambil data tambal ban berdasarkan ID
export const getTambalBanById = async (id) => {
  try {
    const snapshot = await FIREBASE_DB.ref(`tambal_ban/${id}`).once('value');
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting tambal ban by ID:', error);
    throw error;
  }
};

// Function untuk mengupdate data tambal ban
export const updateTambalBanData = async (id, data) => {
  try {
    const tambalBanRef = FIREBASE_DB.ref(`tambal_ban/${id}`);
    
    // Update data with timestamp
    const dataToUpdate = {
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    await tambalBanRef.update(dataToUpdate);
    
    return { id, ...dataToUpdate };
  } catch (error) {
    console.error('Error updating tambal ban data:', error);
    throw error;
  }
};

// Function untuk menghapus data tambal ban
export const deleteTambalBanData = async (id) => {
  try {
    await FIREBASE_DB.ref(`tambal_ban/${id}`).remove();
    return true;
  } catch (error) {
    console.error('Error deleting tambal ban data:', error);
    throw error;
  }
};

// **FUNGSI BARU UNTUK DELETION REQUEST**

// Function untuk submit permintaan penghapusan data
export const submitDeletionRequest = async (itemId, userName, userEmail, deletionReason) => {
  try {
    const updateData = {
      status: 'pending_deletion',
      deletion_requested_at: new Date().toISOString(),
      deletion_requested_by: userName,
      deletion_requester_email: userEmail,
      deletion_reason: deletionReason,
      approval_status: 'pending_deletion'
    };
    
    await updateTambalBanData(itemId, updateData);
    return updateData;
  } catch (error) {
    console.error('Error submitting deletion request:', error);
    throw error;
  }
};

// Function untuk approve deletion request (admin menghapus data)
export const approveDeletionRequest = async (itemId, approverName) => {
  try {
    // Benar-benar hapus data dari Firebase
    await deleteTambalBanData(itemId);
    return true;
  } catch (error) {
    console.error('Error approving deletion request:', error);
    throw error;
  }
};

// Function untuk reject deletion request (kembalikan status aktif)
export const rejectDeletionRequest = async (itemId, approverName, rejectionReason) => {
  try {
    const updateData = {
      status: 'aktif',
      deletion_rejected_at: new Date().toISOString(),
      deletion_rejected_by: approverName,
      deletion_rejection_reason: rejectionReason,
      approval_status: 'deletion_rejected',
      // Clear deletion request data
      deletion_requested_at: null,
      deletion_requested_by: null,
      deletion_requester_email: null,
      deletion_reason: null
    };
    
    await updateTambalBanData(itemId, updateData);
    return updateData;
  } catch (error) {
    console.error('Error rejecting deletion request:', error);
    throw error;
  }
};

// **FUNGSI APPROVAL YANG SUDAH ADA**

// Function untuk mengambil data pending approvals (termasuk deletion requests)
export const getPendingApprovals = async () => {
  try {
    const allData = await getAllTambalBanData();
    
    // Filter data yang statusnya pending atau pending_deletion
    const pendingData = allData.filter(item => 
      item.status === 'pending' || item.status === 'pending_deletion'
    );
    
    return pendingData;
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    throw error;
  }
};

// Function untuk menyetujui data tambal ban
export const approveTambalBanData = async (itemId, approverName) => {
  try {
    const updateData = {
      status: 'aktif',
      approved_at: new Date().toISOString(),
      approved_by: approverName,
      approval_status: 'approved'
    };
    
    await updateTambalBanData(itemId, updateData);
    return updateData;
  } catch (error) {
    console.error('Error approving data:', error);
    throw error;
  }
};

// Function untuk menolak data tambal ban
export const rejectTambalBanData = async (itemId, approverName, reason) => {
  try {
    const updateData = {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: approverName,
      rejection_reason: reason,
      approval_status: 'rejected'
    };
    
    await updateTambalBanData(itemId, updateData);
    return updateData;
  } catch (error) {
    console.error('Error rejecting data:', error);
    throw error;
  }
};

// Function untuk mengambil data berdasarkan status
export const getTambalBanByStatus = async (status) => {
  try {
    const allData = await getAllTambalBanData();
    
    // Filter berdasarkan status
    const filteredData = allData.filter(item => item.status === status);
    
    return filteredData;
  } catch (error) {
    console.error('Error getting tambal ban by status:', error);
    throw error;
  }
};

// Function untuk mengambil statistik approval
export const getApprovalStats = async () => {
  try {
    const allData = await getAllTambalBanData();
    
    const stats = {
      total: allData.length,
      pending: allData.filter(item => item.status === 'pending').length,
      approved: allData.filter(item => item.status === 'aktif').length,
      rejected: allData.filter(item => item.status === 'rejected').length,
      pending_deletion: allData.filter(item => item.status === 'pending_deletion').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting approval stats:', error);
    throw error;
  }
};