import React, { useState, useEffect } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Image,
  useToast,
  Badge,
  Center,
  Spinner,
  Divider,
  TextArea,
  FormControl,
  Modal,
  Card,
  Stack,
  Pressable
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Linking, Alert } from 'react-native';
import { Header } from "../../components";
import { 
  getTambalBanById,
  approveTambalBanData,
  rejectTambalBanData
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

const ApprovalDetailScreen = ({ navigation, route }) => {
  const { itemId } = route.params;
  
  const [itemData, setItemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
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
      
      // Load item data
      const item = await getTambalBanById(itemId);
      if (!item) {
        toast.show({
          title: "Data tidak ditemukan",
          description: "Data yang diminta tidak tersedia",
          status: "error"
        });
        navigation.goBack();
        return;
      }
      
      setItemData(item);
      
    } catch (error) {
      console.error('Error loading item data:', error);
      toast.show({
        title: "Error",
        description: "Gagal memuat data",
        status: "error"
      });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // Open Google Maps
  const openGoogleMaps = () => {
    if (!itemData.latitude || !itemData.longitude) {
      toast.show({
        title: "Koordinat tidak tersedia",
        description: "Data koordinat tidak lengkap",
        status: "warning"
      });
      return;
    }

    const url = `https://www.google.com/maps?q=${itemData.latitude},${itemData.longitude}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          toast.show({
            title: "Error",
            description: "Tidak dapat membuka Google Maps",
            status: "error"
          });
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        toast.show({
          title: "Error",
          description: "Gagal membuka Google Maps",
          status: "error"
        });
      });
  };

  // Approve request
  const handleApprove = async () => {
    Alert.alert(
      "Konfirmasi Persetujuan",
      "Apakah Anda yakin ingin menyetujui permintaan ini?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Setujui",
          onPress: async () => {
            try {
              setActionLoading(true);
              
              await approveTambalBanData(itemId, currentUser.nama);
              
              toast.show({
                title: "Berhasil",
                description: "Data tambal ban telah disetujui dan diaktifkan",
                status: "success"
              });
              
              navigation.goBack();
              
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
          }
        }
      ]
    );
  };

  // Reject request
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
      
      await rejectTambalBanData(itemId, currentUser.nama, rejectReason);
      
      toast.show({
        title: "Berhasil",
        description: "Permintaan telah ditolak",
        status: "success"
      });
      
      setShowRejectModal(false);
      setRejectReason('');
      navigation.goBack();
      
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

  // Format schedule text
  const getScheduleText = (data, day) => {
    if (data[`hari_${day}`] === 'Buka 24 Jam') {
      return "Buka 24 Jam";
    }
    
    let text = "";
    if (data[`hari_${day}_buka`] && data[`hari_${day}_tutup`]) {
      text += `${data[`hari_${day}_buka`]} - ${data[`hari_${day}_tutup`]}`;
    }
    
    if (data[`hari_${day}_buka2`] && data[`hari_${day}_tutup2`]) {
      text += text ? ` & ${data[`hari_${day}_buka2`]} - ${data[`hari_${day}_tutup2`]}` : 
              `${data[`hari_${day}_buka2`]} - ${data[`hari_${day}_tutup2`]}`;
    }
    
    return text || "Belum diatur";
  };

  if (isLoading) {
    return (
      <>
        <Header title="Detail Persetujuan" withBack />
        <Center flex={1} bg="white">
          <Spinner size="lg" color={COLORS.primary} />
          <Text mt={2} color="gray.500">Memuat detail...</Text>
        </Center>
      </>
    );
  }

  if (!itemData) {
    return (
      <>
        <Header title="Detail Persetujuan" withBack />
        <Center flex={1} bg="white">
          <Text color="gray.500">Data tidak ditemukan</Text>
        </Center>
      </>
    );
  }

  return (
    <>
      <Header title="Detail Approval" withBack />
      <Box flex={1} bg="gray.50" safeArea>
        <ScrollView p={4}>
          <VStack space={4}>
            {/* Header Info */}
            <Card shadow={2} rounded="md">
              <Stack p={4} space={3}>
                <HStack space={3} alignItems="flex-start">
                  <Box bg={COLORS.primary} rounded="full" p={2}>
                    <Ionicons name="business" size={24} color="white" />
                  </Box>
                  <VStack flex={1} space={1}>
                    <Badge 
                      colorScheme={itemData.status === 'pending' ? 'warning' : itemData.status === 'aktif' ? 'success' : 'error'}
                      alignSelf="flex-start"
                      rounded="full"
                    >
                      {itemData.status === 'pending' ? 'Menunggu Persetujuan' : 
                       itemData.status === 'aktif' ? 'Aktif' : 'Ditolak'}
                    </Badge>
                    <Heading size="md" color={COLORS.text}>
                      {itemData.nama}
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      {itemData.alamat}
                    </Text>
                  </VStack>
                </HStack>
              </Stack>
            </Card>

            {/* Submitter Info */}
            <Card shadow={2} rounded="md">
              <Stack p={4} space={3}>
                <Heading size="sm" color={COLORS.primary}>
                  Informasi Pengaju
                </Heading>
                <VStack space={2}>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">Nama:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {itemData.ditambahkan_oleh || 'Unknown'}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">Email:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {itemData.email_penambah || 'N/A'}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">Role:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {itemData.role_penambah || 'User'}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">Waktu Pengajuan:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {formatDate(itemData.tanggal_ditambahkan)}
                    </Text>
                  </HStack>
                </VStack>
              </Stack>
            </Card>

            {/* Basic Information */}
            <Card shadow={2} rounded="md">
              <Stack p={4} space={3}>
                <Heading size="sm" color={COLORS.primary}>
                  Informasi Dasar
                </Heading>
                <VStack space={3}>
                  <VStack space={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Nama Tambal Ban</Text>
                    <Text fontSize="md">{itemData.nama}</Text>
                  </VStack>
                  
                  <VStack space={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Alamat</Text>
                    <Text fontSize="md">{itemData.alamat}</Text>
                  </VStack>
                  
                  <VStack space={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Telepon</Text>
                    <Text fontSize="md">{itemData.telepon || 'Tidak ada'}</Text>
                  </VStack>
                  
                  <VStack space={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Koordinat Lokasi</Text>
                    <HStack space={2} alignItems="center">
                      <VStack flex={1}>
                        <Text fontSize="md">
                          Lat: {itemData.latitude}
                        </Text>
                        <Text fontSize="md">
                          Lng: {itemData.longitude}
                        </Text>
                      </VStack>
                      <Button
                        size="sm"
                        bg={COLORS.primary}
                        leftIcon={<Ionicons name="map" size={16} color="white" />}
                        onPress={openGoogleMaps}
                      >
                        Buka Maps
                      </Button>
                    </HStack>
                  </VStack>
                  
                  <VStack space={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Hari Operasional</Text>
                    <Text fontSize="md">{itemData.hari_operasional}</Text>
                  </VStack>
                  
                  <VStack space={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Jam Operasional</Text>
                    <Text fontSize="md">{itemData.jam_operasional || 'Belum diatur'}</Text>
                  </VStack>
                </VStack>
              </Stack>
            </Card>

            {/* Schedule Details */}
            <Card shadow={2} rounded="md">
              <Stack p={4} space={3}>
                <Heading size="sm" color={COLORS.primary}>
                  Jadwal Operasional Detail
                </Heading>
                <VStack space={2} divider={<Divider />}>
                  {['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'].map(day => (
                    <HStack key={day} justifyContent="space-between" py={1}>
                      <Text textTransform="capitalize" fontWeight="medium" fontSize="sm">
                        {day}:
                      </Text>
                      <Text fontSize="sm" color={getScheduleText(itemData, day) === "Belum diatur" ? "gray.400" : "gray.700"}>
                        {getScheduleText(itemData, day)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Stack>
            </Card>

            {/* Images */}
            {(itemData.gambar_1 || itemData.gambar_2) && (
              <Card shadow={2} rounded="md">
                <Stack p={4} space={3}>
                  <Heading size="sm" color={COLORS.primary}>
                    Foto Tambal Ban
                  </Heading>
                  <VStack space={3}>
                    {itemData.gambar_1 && (
                      <VStack space={2}>
                        <Text fontSize="sm" fontWeight="medium">Foto 1:</Text>
                        <Pressable onPress={() => {
                          // Optional: Open image in full screen or external viewer
                          if (itemData.gambar_1.startsWith('http')) {
                            Linking.openURL(itemData.gambar_1);
                          }
                        }}>
                          <Image
                            source={{ uri: itemData.gambar_1 }}
                            alt="Foto Tambal Ban 1"
                            w="100%"
                            h={200}
                            borderRadius={10}
                            resizeMode="cover"
                          />
                        </Pressable>
                      </VStack>
                    )}
                    
                    {itemData.gambar_2 && (
                      <VStack space={2}>
                        <Text fontSize="sm" fontWeight="medium">Foto 2:</Text>
                        <Pressable onPress={() => {
                          // Optional: Open image in full screen or external viewer
                          if (itemData.gambar_2.startsWith('http')) {
                            Linking.openURL(itemData.gambar_2);
                          }
                        }}>
                          <Image
                            source={{ uri: itemData.gambar_2 }}
                            alt="Foto Tambal Ban 2"
                            w="100%"
                            h={200}
                            borderRadius={10}
                            resizeMode="cover"
                          />
                        </Pressable>
                      </VStack>
                    )}
                  </VStack>
                </Stack>
              </Card>
            )}

            {/* Action Buttons - Only show for pending items */}
            {itemData.status === 'pending' && (
              <Card shadow={2} rounded="md">
                <Stack p={4} space={3}>
                  <Heading size="sm" color={COLORS.primary}>
                    Tindakan
                  </Heading>
                  <VStack space={3}>
                    <Button
                      size="lg"
                      bg="green.600"
                      leftIcon={<Ionicons name="checkmark-circle" size={20} color="white" />}
                      onPress={handleApprove}
                      isLoading={actionLoading}
                    >
                      Setujui Permintaan
                    </Button>
                    
                    <Button
                      size="lg"
                      bg="red.600"
                      leftIcon={<Ionicons name="close-circle" size={20} color="white" />}
                      onPress={() => setShowRejectModal(true)}
                    >
                      Tolak Permintaan
                    </Button>
                  </VStack>
                </Stack>
              </Card>
            )}

            {/* Status Info for approved/rejected items */}
            {itemData.status !== 'pending' && (
              <Card shadow={2} rounded="md">
                <Stack p={4} space={3}>
                  <Heading size="sm" color={COLORS.primary}>
                    Status Approval
                  </Heading>
                  <VStack space={2}>
                    {itemData.status === 'aktif' && (
                      <>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Disetujui oleh:</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {itemData.approved_by || 'N/A'}
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Tanggal persetujuan:</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {formatDate(itemData.approved_at)}
                          </Text>
                        </HStack>
                      </>
                    )}
                    
                    {itemData.status === 'rejected' && (
                      <>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Ditolak oleh:</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {itemData.rejected_by || 'N/A'}
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Tanggal penolakan:</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {formatDate(itemData.rejected_at)}
                          </Text>
                        </HStack>
                        {itemData.rejection_reason && (
                          <VStack space={1}>
                            <Text fontSize="sm" color="gray.600">Alasan penolakan:</Text>
                            <Text fontSize="sm" color="red.600" fontStyle="italic">
                              {itemData.rejection_reason}
                            </Text>
                          </VStack>
                        )}
                      </>
                    )}
                  </VStack>
                </Stack>
              </Card>
            )}
          </VStack>
        </ScrollView>
      </Box>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Tolak Permintaan</Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <Text>
                Berikan alasan penolakan untuk permintaan ini:
              </Text>
              <FormControl>
                <FormControl.Label>Alasan Penolakan</FormControl.Label>
                <TextArea
                  placeholder="Masukkan alasan penolakan..."
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
                  setRejectReason('');
                }}
              >
                Batal
              </Button>
              <Button
                bg="red.600"
                onPress={handleReject}
                isLoading={actionLoading}
              >
                Tolak Permintaan
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default ApprovalDetailScreen;