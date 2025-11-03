import React, { useState, useEffect } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  useToast,
  Modal,
  Badge,
  Center,
  Spinner,
  TextArea,
  FormControl
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Header } from "../../components";
import { 
  getPendingApprovals,
  approveTambalBanData,
  rejectTambalBanData,
  approveDeletionRequest,
  rejectDeletionRequest
} from '../../src/config/tambalBanAPI';
import { getCurrentUser } from '../../controllers/LoginController';

// Color theme
const COLORS = {
  primary: "#E62E05",
  secondary: "#FFD600",
  accent: "#000000",
  text: "#333333",
  light: "#FFFFFF"
};

const ApprovalScreen = ({ navigation }) => {
  const [pendingData, setPendingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState(''); // 'reject_new', 'reject_deletion', atau ''
  
  const toast = useToast();

  // Load data saat komponen mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      
      // Check if user is admin
      if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
        toast.show({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki akses ke halaman ini",
          status: "error"
        });
        navigation.goBack();
        return;
      }
      
      // Load pending approvals
      const pending = await getPendingApprovals();
      setPendingData(pending);
      
    } catch (error) {
      console.error('Error loading approval data:', error);
      toast.show({
        title: "Error",
        description: "Gagal memuat data approval",
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // **FUNGSI BARU UNTUK DELETION REQUESTS**

  // Approve deletion request
  const handleApproveDeletion = async (item) => {
    try {
      setActionLoading(true);
      
      await approveDeletionRequest(item.id, currentUser.nama);
      
      toast.show({
        title: "Berhasil",
        description: "Data telah dihapus sesuai permintaan",
        status: "success"
      });
      
      loadData(); // Reload data
      
    } catch (error) {
      console.error('Error approving deletion request:', error);
      toast.show({
        title: "Error",
        description: "Gagal menghapus data",
        status: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject deletion request
  const handleRejectDeletion = async () => {
    if (!rejectReason.trim()) {
      toast.show({
        title: "Alasan diperlukan",
        description: "Silakan masukkan alasan penolakan",
        status: "warning"
      });
      return;
    }
    
    try {
      setActionLoading(true);
      
      await rejectDeletionRequest(selectedItem.id, currentUser.nama, rejectReason);
      
      toast.show({
        title: "Berhasil",
        description: "Permintaan penghapusan ditolak, data dikembalikan ke status aktif",
        status: "success"
      });
      
      setShowRejectModal(false);
      setRejectReason('');
      setActionType('');
      loadData(); // Reload data
      
    } catch (error) {
      console.error('Error rejecting deletion request:', error);
      toast.show({
        title: "Error",
        description: "Gagal menolak permintaan penghapusan",
        status: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // **FUNGSI UNTUK APPROVAL BIASA**

  // Approve new submission request
  const handleApprove = async (item) => {
    try {
      setActionLoading(true);
      
      await approveTambalBanData(item.id, currentUser.nama);
      
      toast.show({
        title: "Berhasil",
        description: "Data tambal ban telah disetujui dan diaktifkan",
        status: "success"
      });
      
      loadData(); // Reload data
      
    } catch (error) {
      console.error('Error approving request:', error);
      toast.show({
        title: "Error",
        description: "Gagal menyetujui permintaan",
        status: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject new submission request
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.show({
        title: "Alasan diperlukan",
        description: "Silakan masukkan alasan penolakan",
        status: "warning"
      });
      return;
    }
    
    try {
      setActionLoading(true);
      
      await rejectTambalBanData(selectedItem.id, currentUser.nama, rejectReason);
      
      toast.show({
        title: "Berhasil",
        description: "Permintaan telah ditolak",
        status: "success"
      });
      
      setShowRejectModal(false);
      setRejectReason('');
      setActionType('');
      loadData(); // Reload data
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.show({
        title: "Error",
        description: "Gagal menolak permintaan",
        status: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // **FUNGSI HELPER**

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get action badge color based on status
  const getActionBadgeColor = (item) => {
    if (item.status === 'pending_deletion') return 'error';
    return 'warning'; // All pending items are treated as new submissions
  };

  // Get action text based on status
  const getActionText = (item) => {
    if (item.status === 'pending_deletion') return 'Permintaan Hapus';
    return 'Pending Review';
  };

  // Check if item is deletion request
  const isDeletionRequest = (item) => {
    return item.status === 'pending_deletion';
  };

  // Get appropriate reject modal title
  const getRejectModalTitle = () => {
    return actionType === 'reject_deletion' ? 'Tolak Permintaan Hapus' : 'Tolak Permintaan';
  };

  // Get appropriate reject modal description
  const getRejectModalDescription = () => {
    if (actionType === 'reject_deletion') {
      return 'Data akan dikembalikan ke status aktif jika Anda menolak permintaan penghapusan ini:';
    }
    return 'Berikan alasan penolakan untuk permintaan ini:';
  };

  if (isLoading) {
    return (
      <>
        <Header title="Kelola Persetujuan" />
        <Center flex={1} bg="white">
          <Spinner size="lg" color={COLORS.primary} />
          <Text mt={2} color="gray.500">Memuat data approval...</Text>
        </Center>
      </>
    );
  }

  return (
    <>
      <Header title="Kelola Persetujuan" />
      <Box flex={1} bg="gray.50" safeArea>
        <ScrollView p={4}>
          <VStack space={4}>
            {/* Header Info */}
            <Box bg="white" rounded="md" shadow={1} p={4}>
              <HStack space={3} alignItems="center">
                <Box bg={COLORS.primary} rounded="full" p={2}>
                  <Ionicons name="shield-checkmark" size={24} color="white" />
                </Box>
                <VStack flex={1}>
                  <Heading size="md" color={COLORS.primary}>
                    Data Persetujuan
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    {pendingData.length} permintaan menunggu persetujuan
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    {pendingData.filter(item => !isDeletionRequest(item)).length} Pengajuan baru • {pendingData.filter(item => isDeletionRequest(item)).length} permintaan hapus
                  </Text>
                </VStack>
                <Badge bg={COLORS.secondary} _text={{ color: COLORS.accent, fontWeight: "bold" }}>
                  Admin
                </Badge>
              </HStack>
            </Box>

            {/* Pending Requests */}
            {pendingData.length === 0 ? (
              <Center py={10}>
                <Ionicons name="checkmark-circle" size={64} color="gray" />
                <Text color="gray.500" fontSize="lg" mt={2}>
                  Tidak ada permintaan pending
                </Text>
                <Text color="gray.400" fontSize="sm" textAlign="center" mt={1}>
                  Semua permintaan telah diproses
                </Text>
              </Center>
            ) : (
              pendingData.map((item, index) => {
                const isDeleteRequest = isDeletionRequest(item);
                
                return (
                  <Box key={item.id || index} shadow={2} rounded="md" bg="white">
                    <VStack p={4} space={3}>
                      {/* Header */}
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack flex={1} space={1}>
                          <HStack space={2} alignItems="center">
                            <Badge 
                              colorScheme={getActionBadgeColor(item)}
                              rounded="full"
                            >
                              {getActionText(item)}
                            </Badge>
                            <Badge colorScheme="gray" variant="outline">
                              Oleh: {isDeleteRequest ? item.deletion_requested_by : (item.ditambahkan_oleh || item.submitted_by_name)}
                            </Badge>
                          </HStack>
                          <Text fontSize="lg" fontWeight="bold" color={COLORS.text}>
                            {item.nama}
                          </Text>
                          <Text color="gray.600" fontSize="sm">
                            {item.alamat}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Special Warning for Deletion Requests */}
                      {isDeleteRequest && (
                        <Box bg="orange.50" borderWidth={1} borderColor="orange.200" borderRadius="md" p={3}>
                          <HStack space={2} alignItems="center">
                            <Ionicons name="warning" size={20} color="orange" />
                            <VStack flex={1} space={1}>
                              <Text fontWeight="bold" color="orange.800">
                                Permintaan Penghapusan Data
                              </Text>
                              <Text fontSize="sm" color="orange.700">
                                Alasan: {item.deletion_reason || 'Tidak ada alasan yang diberikan'}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      )}

                      {/* Submitter Info */}
                      <Box bg="gray.50" p={3} rounded="md">
                        <HStack space={2} alignItems="center">
                          <Ionicons name="person" size={16} color="gray" />
                          <VStack flex={1}>
                            {isDeleteRequest ? (
                              <>
                                <Text fontSize="sm" fontWeight="bold">
                                  Diminta hapus oleh: {item.deletion_requested_by || 'Unknown'}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {item.deletion_requester_email || 'N/A'} • {formatDate(item.deletion_requested_at)}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                  Data asli ditambahkan oleh: {item.ditambahkan_oleh || 'Unknown'}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text fontSize="sm" fontWeight="bold">
                                  Diajukan oleh: {item.ditambahkan_oleh || item.submitted_by_name || 'Unknown'}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {item.email_penambah || item.submitted_by_email || 'N/A'} • {formatDate(item.tanggal_ditambahkan || item.submitted_at)}
                                </Text>
                              </>
                            )}
                          </VStack>
                        </HStack>
                      </Box>

                      {/* Quick Info */}
                      <VStack space={2}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Telepon:</Text>
                          <Text fontSize="sm">{item.telepon || 'Tidak ada'}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Hari Operasional:</Text>
                          <Text fontSize="sm">{item.hari_operasional}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Jam Operasional:</Text>
                          <Text fontSize="sm">{item.jam_operasional || 'Belum diatur'}</Text>
                        </HStack>
                      </VStack>

                      {/* Action Buttons */}
                      <HStack space={2} justifyContent="space-between">
                        <Button
                          flex={1}
                          variant="outline"
                          borderColor={COLORS.primary}
                          _text={{ color: COLORS.primary }}
                          leftIcon={<Ionicons name="eye-outline" size={16} color={COLORS.primary} />}
                          onPress={() => navigation.navigate('ApprovalDetailScreen', { itemId: item.id })}
                        >
                          Detail
                        </Button>
                        
                        {isDeleteRequest ? (
                          <>
                            {/* Buttons for deletion requests */}
                            <Button
                              flex={1}
                              bg="red.600"
                              leftIcon={<Ionicons name="trash" size={16} color="white" />}
                              onPress={() => handleApproveDeletion(item)}
                              isLoading={actionLoading}
                            >
                              Hapus Data
                            </Button>
                            <Button
                              flex={1}
                              bg="blue.600"
                              leftIcon={<Ionicons name="arrow-back" size={16} color="white" />}
                              onPress={() => {
                                setSelectedItem(item);
                                setActionType('reject_deletion');
                                setShowRejectModal(true);
                              }}
                            >
                              Kembalikan
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Buttons for new submissions */}
                            <Button
                              flex={1}
                              bg="green.600"
                              leftIcon={<Ionicons name="checkmark" size={16} color="white" />}
                              onPress={() => handleApprove(item)}
                              isLoading={actionLoading}
                            >
                              Setujui
                            </Button>
                            <Button
                              flex={1}
                              bg="red.600"
                              leftIcon={<Ionicons name="close" size={16} color="white" />}
                              onPress={() => {
                                setSelectedItem(item);
                                setActionType('reject_new');
                                setShowRejectModal(true);
                              }}
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                );
              })
            )}
          </VStack>
        </ScrollView>
      </Box>

      {/* Reject Modal - Updated untuk handle kedua jenis rejection */}
      <Modal isOpen={showRejectModal} onClose={() => {
        setShowRejectModal(false);
        setActionType('');
        setRejectReason('');
      }}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>{getRejectModalTitle()}</Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <Text>
                {getRejectModalDescription()}
              </Text>
              <FormControl>
                <FormControl.Label>
                  {actionType === 'reject_deletion' ? 'Alasan Penolakan Hapus' : 'Alasan Penolakan'}
                </FormControl.Label>
                <TextArea
                  placeholder={actionType === 'reject_deletion' 
                    ? "Masukkan alasan mengapa permintaan penghapusan ditolak..." 
                    : "Masukkan alasan penolakan..."
                  }
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  h={20}
                />
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                onPress={() => {
                  setShowRejectModal(false);
                  setActionType('');
                  setRejectReason('');
                }}
              >
                Batal
              </Button>
              <Button
                bg={actionType === 'reject_deletion' ? "blue.600" : "red.600"}
                onPress={actionType === 'reject_deletion' ? handleRejectDeletion : handleReject}
                isLoading={actionLoading}
              >
                {actionType === 'reject_deletion' ? 'Kembalikan Data' : 'Tolak Permintaan'}
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default ApprovalScreen;