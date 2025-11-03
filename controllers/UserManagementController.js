// UserManagementController.js
import { FIREBASE_DB, FIREBASE_AUTH } from '../src/config/FIREBASE';
import { 
  ref, 
  get, 
  set, 
  remove, 
  update,
  query,
  orderByChild,
  equalTo 
} from 'firebase/database';
import { 
  deleteUser as deleteAuthUser,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';

// Get all users (untuk superadmin)
export const getAllUsers = async () => {
  try {
    const snapshot = await get(ref(FIREBASE_DB, 'users'));
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      
      // Convert object to array dengan user ID
      const usersList = Object.keys(usersData).map(uid => ({
        uid,
        ...usersData[uid]
      }));
      
      // Sort by creation date (newest first)
      return usersList.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.role === role);
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (uid, newRole, updatedBy) => {
  try {
    const updateData = {
      role: newRole,
      roleUpdatedAt: new Date().toISOString(),
      roleUpdatedBy: updatedBy
    };
    
    await update(ref(FIREBASE_DB, `users/${uid}`), updateData);
    
    return updateData;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Update user status (active/blocked)
export const updateUserStatus = async (uid, status, updatedBy, reason = '') => {
  try {
    const updateData = {
      status: status, // 'active', 'blocked', 'suspended'
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: updatedBy,
      statusReason: reason
    };
    
    await update(ref(FIREBASE_DB, `users/${uid}`), updateData);
    
    return updateData;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Delete user completely
export const deleteUserAccount = async (uid, deletedBy) => {
  try {
    // First, update user status to deleted (for audit trail)
    await update(ref(FIREBASE_DB, `users/${uid}`), {
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      deletedBy: deletedBy
    });
    
    // Optional: Move to deleted_users collection instead of removing
    const userSnapshot = await get(ref(FIREBASE_DB, `users/${uid}`));
    if (userSnapshot.exists()) {
      await set(ref(FIREBASE_DB, `deleted_users/${uid}`), userSnapshot.val());
    }
    
    // Remove from active users
    await remove(ref(FIREBASE_DB, `users/${uid}`));
    
    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

// Send password reset email
export const sendUserPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(FIREBASE_AUTH, email);
    return true;
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const allUsers = await getAllUsers();
    
    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(user => user.status === 'active' || !user.status).length,
      blockedUsers: allUsers.filter(user => user.status === 'blocked').length,
      suspendedUsers: allUsers.filter(user => user.status === 'suspended').length,
      adminUsers: allUsers.filter(user => user.role === 'admin').length,
      superAdminUsers: allUsers.filter(user => user.role === 'superadmin').length,
      regularUsers: allUsers.filter(user => user.role === 'user' || !user.role).length,
      usersLastWeek: allUsers.filter(user => {
        const createdDate = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate >= weekAgo;
      }).length,
      usersLastMonth: allUsers.filter(user => {
        const createdDate = new Date(user.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return createdDate >= monthAgo;
      }).length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
};

// Search users by name, email, or other fields
export const searchUsers = async (searchTerm) => {
  try {
    const allUsers = await getAllUsers();
    
    if (!searchTerm || searchTerm.trim() === '') {
      return allUsers;
    }
    
    const term = searchTerm.toLowerCase();
    
    return allUsers.filter(user => 
      (user.nama && user.nama.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.telepon && user.telepon.includes(term)) ||
      (user.role && user.role.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Update user profile data (admin function)
export const updateUserProfile = async (uid, profileData, updatedBy) => {
  try {
    const updateData = {
      ...profileData,
      profileUpdatedAt: new Date().toISOString(),
      profileUpdatedBy: updatedBy
    };
    
    await update(ref(FIREBASE_DB, `users/${uid}`), updateData);
    
    return updateData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user activity logs (if you want to track user actions)
export const getUserActivityLogs = async (uid, limit = 50) => {
  try {
    const snapshot = await get(ref(FIREBASE_DB, `user_logs/${uid}`));
    
    if (snapshot.exists()) {
      const logs = snapshot.val();
      const logsList = Object.keys(logs).map(logId => ({
        id: logId,
        ...logs[logId]
      }));
      
      // Sort by timestamp (newest first) and limit
      return logsList
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user activity logs:', error);
    throw error;
  }
};

// Log user activity (for tracking)
export const logUserActivity = async (uid, action, details = {}) => {
  try {
    const logId = Date.now().toString();
    const logData = {
      action,
      details,
      timestamp: new Date().toISOString(),
      userAgent: 'Mobile App' // You can get actual user agent
    };
    
    await set(ref(FIREBASE_DB, `user_logs/${uid}/${logId}`), logData);
    
    return true;
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Don't throw error for logging, just console.error
    return false;
  }
};

// Create new user account (admin function)
export const createUserAccount = async (userData, createdBy) => {
  try {
    // Generate a temporary password or ask admin to set it
    const tempPassword = generateTempPassword();
    
    // This would require admin SDK or different approach
    // For now, we'll create user data and send them registration link
    const uid = Date.now().toString(); // Temporary UID until actual registration
    
    const newUserData = {
      ...userData,
      uid: uid,
      status: 'pending_activation',
      createdAt: new Date().toISOString(),
      createdBy: createdBy,
      tempPassword: tempPassword // This should be hashed in production
    };
    
    await set(ref(FIREBASE_DB, `pending_users/${uid}`), newUserData);
    
    return { ...newUserData, tempPassword };
  } catch (error) {
    console.error('Error creating user account:', error);
    throw error;
  }
};

// Helper function to generate temporary password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Get detailed user info including related data
export const getUserDetailedInfo = async (uid) => {
  try {
    const [userSnapshot, logsSnapshot] = await Promise.all([
      get(ref(FIREBASE_DB, `users/${uid}`)),
      get(ref(FIREBASE_DB, `user_logs/${uid}`))
    ]);
    
    let userData = null;
    let userLogs = [];
    
    if (userSnapshot.exists()) {
      userData = { uid, ...userSnapshot.val() };
    }
    
    if (logsSnapshot.exists()) {
      const logs = logsSnapshot.val();
      userLogs = Object.keys(logs).map(logId => ({
        id: logId,
        ...logs[logId]
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    return {
      user: userData,
      logs: userLogs,
      totalLogs: userLogs.length
    };
  } catch (error) {
    console.error('Error getting detailed user info:', error);
    throw error;
  }
};

// Bulk operations for multiple users
export const bulkUpdateUserStatus = async (userIds, status, updatedBy, reason = '') => {
  try {
    const updatePromises = userIds.map(uid => 
      updateUserStatus(uid, status, updatedBy, reason)
    );
    
    await Promise.all(updatePromises);
    
    return {
      success: true,
      updated: userIds.length
    };
  } catch (error) {
    console.error('Error bulk updating user status:', error);
    throw error;
  }
};

// Export user data to CSV format (for backup/export)
export const exportUsersData = async () => {
  try {
    const users = await getAllUsers();
    
    // Convert to CSV format
    const headers = ['UID', 'Nama', 'Email', 'Telepon', 'Role', 'Status', 'Dibuat', 'Terakhir Login'];
    const csvData = [
      headers.join(','),
      ...users.map(user => [
        user.uid,
        user.nama || '',
        user.email || '',
        user.telepon || '',
        user.role || 'user',
        user.status || 'active',
        user.createdAt || '',
        user.lastLoginAt || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    return csvData;
  } catch (error) {
    console.error('Error exporting users data:', error);
    throw error;
  }
};

// Check if user has permission for certain actions
export const checkUserPermission = async (currentUserUid, targetUserUid, action) => {
  try {
    const currentUser = await get(ref(FIREBASE_DB, `users/${currentUserUid}`));
    
    if (!currentUser.exists()) {
      return false;
    }
    
    const currentUserData = currentUser.val();
    
    // SuperAdmin can do everything
    if (currentUserData.role === 'superadmin') {
      return true;
    }
    
    // Admin can manage regular users but not other admins/superadmins
    if (currentUserData.role === 'admin') {
      const targetUser = await get(ref(FIREBASE_DB, `users/${targetUserUid}`));
      if (targetUser.exists()) {
        const targetUserData = targetUser.val();
        return targetUserData.role === 'user' || !targetUserData.role;
      }
    }
    
    // Regular users can't manage anyone
    return false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

// Export all functions
export {
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  updateUserStatus,
  deleteUserAccount,
  sendUserPasswordReset,
  getUserStatistics,
  searchUsers,
  updateUserProfile,
  getUserActivityLogs,
  logUserActivity,
  createUserAccount,
  getUserDetailedInfo,
  bulkUpdateUserStatus,
  exportUsersData,
  checkUserPermission
};