import React, { useState, useEffect } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  Heading,
  FormControl,
  Input,
  TextArea,
  Button,
  HStack,
  Image,
  Text,
  useToast,
  Select,
  CheckIcon,
  IconButton,
  Divider,
  Pressable,
  Modal,
  Badge,
  Center,
  Spinner
} from 'native-base';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Header } from "../../components";
import { uploadImageToCloudinary } from '../../src/config/cloudinaryService';
import { saveTambalBanData } from '../../src/config/tambalBanAPI';
import { getCurrentUser } from '../../controllers/LoginController';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Color theme yang sama dengan HomeAdmin
const COLORS = {
  primary: "#E62E05",    // Bright red (primary color)
  secondary: "#FFD600",  // Bright yellow (secondary color)
  accent: "#000000",     // Black (for contrast)
  text: "#333333",       // Dark gray for text
  light: "#FFFFFF"       // White
};

const AddTambalBanScreen = ({ navigation }) => {
  // State untuk menyimpan form data
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    latitude: '',
    longitude: '',
    telepon: '',
    hari_operasional: 'Setiap Hari',
    jam_operasional: '',
    // Array untuk menyimpan jadwal operational per hari
    jadwal: [
      { hari: 'senin', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
      { hari: 'selasa', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
      { hari: 'rabu', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
      { hari: 'kamis', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
      { hari: 'jumat', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
      { hari: 'sabtu', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
      { hari: 'minggu', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
    ]
  });

  // State untuk menyimpan gambar
  const [images, setImages] = useState({
    gambar_1: null,
    gambar_2: null
  });

  // State untuk loading
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  
  // State untuk modal jam operasional
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // State untuk time picker custom
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('buka');
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  
  // State untuk data user yang sedang login
  const [currentUser, setCurrentUser] = useState(null);
  
  const toast = useToast();

  // Generate hours (00-23) and minutes (00-59)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  
  // Common time options for quick selection
  const commonTimes = [
    '06.00', '07.00', '08.00', '09.00', '10.00', '11.00', '12.00',
    '13.00', '14.00', '15.00', '16.00', '17.00', '18.00', '19.00',
    '20.00', '21.00', '22.00', '23.00'
  ];

  // Request permission untuk camera, location, dan ambil data user
  useEffect(() => {
    (async () => {
      // Request permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        toast.show({
          title: "Izin diperlukan",
          description: "Aplikasi membutuhkan izin kamera dan galeri untuk mengambil gambar",
          status: "warning"
        });
      }
      
      if (locationStatus !== 'granted') {
        toast.show({
          title: "Izin diperlukan",
          description: "Aplikasi membutuhkan izin lokasi untuk mendapatkan koordinat",
          status: "warning"
        });
      }

      // Ambil data user yang sedang login
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setCurrentUser(userData);
        } else {
          toast.show({
            title: "Error",
            description: "Tidak dapat mengambil data pengguna. Silakan login ulang.",
            status: "error"
          });
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        toast.show({
          title: "Error",
          description: "Gagal mengambil data pengguna",
          status: "error"
        });
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);

  // Handle gambar dari galeri
  const pickImage = async (key) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages({
          ...images,
          [key]: result.assets[0].uri
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.show({
        title: "Error",
        description: "Gagal mengambil gambar",
        status: "error"
      });
    }
  };

  // Handle ambil gambar dari kamera
  const takePhoto = async (key) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages({
          ...images,
          [key]: result.assets[0].uri
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.show({
        title: "Error",
        description: "Gagal mengambil foto",
        status: "error"
      });
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle get current location
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.show({
          title: "Izin ditolak",
          description: "Izin lokasi diperlukan untuk fitur ini",
          status: "warning"
        });
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      setFormData({
        ...formData,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString()
      });
      
      toast.show({
        title: "Lokasi didapatkan",
        status: "success"
      });
    } catch (error) {
      console.error('Error getting location:', error);
      toast.show({
        title: "Error",
        description: "Gagal mendapatkan lokasi saat ini",
        status: "error"
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle modal untuk jadwal operasional
  const openDayScheduleModal = (day) => {
    setSelectedDay(formData.jadwal.find(item => item.hari === day));
    setShowModal(true);
  };

  const handleUpdateDaySchedule = (field, value) => {
    if (!selectedDay) return;
    
    const updatedDay = { ...selectedDay, [field]: value };
    
    // Jika buka24Jam diaktifkan, kosongkan jam buka-tutup
    if (field === 'buka24Jam' && value === true) {
      updatedDay.buka = '';
      updatedDay.tutup = '';
      updatedDay.buka2 = '';
      updatedDay.tutup2 = '';
    }
    
    setSelectedDay(updatedDay);
  };

  // **FUNGSI BARU UNTUK MENGHAPUS WAKTU**
  const clearTime = (timeField) => {
    if (!selectedDay) return;
    
    const updatedDay = { ...selectedDay, [timeField]: '' };
    setSelectedDay(updatedDay);
    
    toast.show({
      title: "Waktu dihapus",
      status: "info",
      duration: 1500
    });
  };

  // **FUNGSI UNTUK MENGHAPUS SEMUA JADWAL HARI INI**
  const clearAllScheduleForDay = () => {
    if (!selectedDay) return;
    
    const updatedDay = {
      ...selectedDay,
      buka24Jam: false,
      buka: '',
      tutup: '',
      buka2: '',
      tutup2: ''
    };
    
    setSelectedDay(updatedDay);
    
    toast.show({
      title: "Jadwal dihapus",
      description: "Semua jadwal untuk hari ini telah dihapus",
      status: "info"
    });
  };

  // Handle time picker
  const openTimePicker = (mode) => {
    setTimePickerMode(mode);
    
    // Set initial time based on existing value
    const currentValue = selectedDay[mode];
    if (currentValue) {
      // Parse existing time (format: "HH.MM WIB")
      const timePart = currentValue.replace(' WIB', '');
      const [hours, minutes] = timePart.split('.');
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    } else {
      setSelectedHour('08');
      setSelectedMinute('00');
    }
    
    setShowTimePicker(true);
  };

  const confirmTime = () => {
    const formattedTime = `${selectedHour}.${selectedMinute} WIB`;
    handleUpdateDaySchedule(timePickerMode, formattedTime);
    setShowTimePicker(false);
  };

  const selectCommonTime = (time) => {
    const [hours, minutes] = time.split('.');
    setSelectedHour(hours);
    setSelectedMinute(minutes);
  };

  const saveDaySchedule = () => {
    const updatedJadwal = formData.jadwal.map(day => 
      day.hari === selectedDay.hari ? selectedDay : day
    );
    
    setFormData({
      ...formData,
      jadwal: updatedJadwal
    });
    
    setShowModal(false);
  };

  // Handle apply to all days - FITUR BARU
  const applyToAllDays = () => {
    if (!selectedDay) return;
    
    // Ambil nilai dari hari yang sedang diedit
    const { buka24Jam, buka, tutup, buka2, tutup2 } = selectedDay;
    
    // Terapkan ke semua hari
    const updatedJadwal = formData.jadwal.map(day => ({
      ...day,
      buka24Jam: buka24Jam,
      buka: buka,
      tutup: tutup,
      buka2: buka2,
      tutup2: tutup2
    }));
    
    setFormData({
      ...formData,
      jadwal: updatedJadwal
    });
    
    toast.show({
      title: "Berhasil",
      description: "Jadwal berhasil diterapkan ke semua hari",
      status: "success"
    });
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validasi form
      if (!formData.nama || !formData.alamat || !formData.latitude || !formData.longitude) {
        toast.show({
          title: "Data tidak lengkap",
          description: "Nama, alamat, dan koordinat lokasi wajib diisi",
          status: "warning"
        });
        return;
      }

      // Cek apakah currentUser ada
      if (!currentUser) {
        toast.show({
          title: "Error",
          description: "Data pengguna tidak ditemukan. Silakan login ulang.",
          status: "error"
        });
        return;
      }
      
      // Mulai loading
      setIsLoading(true);

      // Upload gambar ke Cloudinary
      let gambar1Url = '';
      let gambar2Url = '';
      
      if (images.gambar_1) {
        gambar1Url = await uploadImageToCloudinary(images.gambar_1);
      }
      
      if (images.gambar_2) {
        gambar2Url = await uploadImageToCloudinary(images.gambar_2);
      }
      
      // Tentukan status berdasarkan role user
      const status = isAdmin() ? 'aktif' : 'pending';
      
      // Buat objek data untuk disimpan ke Firebase
      const tambalBanData = {
        nama: formData.nama,
        alamat: formData.alamat,
        latitude: formData.latitude,
        longitude: formData.longitude,
        telepon: formData.telepon || 'Tidak punya HP',
        hari_operasional: formData.hari_operasional,
        jam_operasional: formData.jam_operasional,
        gambar_1: gambar1Url,
        gambar_2: gambar2Url,
        // Tambahkan data pengguna yang menambahkan
        ditambahkan_oleh: currentUser.nama || 'Unknown User',
        email_penambah: currentUser.email || '',
        uid_penambah: currentUser.uid || '',
        role_penambah: currentUser.role || '',
        tanggal_ditambahkan: new Date().toISOString(),
        status: status, // Status berdasarkan role
        // Metadata untuk approval
        ...(status === 'pending' && {
          approval_status: 'pending_create',
          submitted_at: new Date().toISOString(),
          action_type: 'create'
        })
      };
      
      // Tambahkan jadwal operasional per hari
      formData.jadwal.forEach(day => {
        const { hari, buka24Jam, buka, tutup, buka2, tutup2 } = day;
        
        if (buka24Jam) {
          tambalBanData[`hari_${hari}`] = 'Buka 24 Jam';
        } else {
          if (buka && tutup) {
            tambalBanData[`hari_${hari}_buka`] = buka;
            tambalBanData[`hari_${hari}_tutup`] = tutup;
          }
          
          if (buka2 && tutup2) {
            tambalBanData[`hari_${hari}_buka2`] = buka2;
            tambalBanData[`hari_${hari}_tutup2`] = tutup2;
          }
        }
      });
      
      // Simpan ke Firebase
      await saveTambalBanData(tambalBanData);
      
      // Show success message
      toast.show({
        title: "Berhasil",
        description: isAdmin() 
          ? "Data tambal ban berhasil disimpan" 
          : "Data tambal ban berhasil dikirim dan menunggu persetujuan admin",
        status: "success"
      });
      
      // Reset form and navigate back
      setFormData({
        nama: '',
        alamat: '',
        latitude: '',
        longitude: '',
        telepon: '',
        hari_operasional: 'Setiap Hari',
        jam_operasional: '',
        jadwal: [
          { hari: 'senin', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
          { hari: 'selasa', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
          { hari: 'rabu', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
          { hari: 'kamis', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
          { hari: 'jumat', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
          { hari: 'sabtu', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
          { hari: 'minggu', buka24Jam: false, buka: '', tutup: '', buka2: '', tutup2: '' },
        ]
      });
      
      setImages({
        gambar_1: null,
        gambar_2: null
      });
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting tambal ban data:', error);
      toast.show({
        title: "Error",
        description: "Gagal menyimpan data tambal ban",
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format nama hari dengan kapital di awal
  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Generate jadwal text untuk ditampilkan
  const getScheduleText = (day) => {
    if (day.buka24Jam) {
      return "Buka 24 Jam";
    } 
    
    let text = "";
    if (day.buka && day.tutup) {
      text += `${day.buka} - ${day.tutup}`;
    }
    
    if (day.buka2 && day.tutup2) {
      text += text ? ` & ${day.buka2} - ${day.tutup2}` : `${day.buka2} - ${day.tutup2}`;
    }
    
    return text || "Belum diatur";
  };

  // Component untuk time picker button dengan tombol delete
  const TimePickerButton = ({ mode, value, placeholder, disabled = false }) => (
    <HStack space={1} alignItems="center">
      <Pressable
        onPress={disabled ? null : () => openTimePicker(mode)}
        bg={disabled ? "gray.200" : "white"}
        borderWidth={1}
        borderColor={disabled ? "gray.300" : "coolGray.300"}
        borderRadius={6}
        p={3}
        opacity={disabled ? 0.5 : 1}
        flex={1}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <Text color={value ? "black" : "gray.400"}>
            {value || placeholder}
          </Text>
          <Ionicons name="time-outline" size={16} color={disabled ? "gray" : COLORS.primary} />
        </HStack>
      </Pressable>
      
      {/* Tombol Delete - hanya muncul jika ada value dan tidak disabled */}
      {value && !disabled && (
        <IconButton
          icon={<Ionicons name="trash-outline" size={16} color="red.500" />}
          onPress={() => clearTime(mode)}
          bg="red.50"
          borderRadius="md"
          size="sm"
          _pressed={{ bg: "red.100" }}
        />
      )}
    </HStack>
  );

  // Loading screen saat mengambil data user
  if (userLoading) {
    return (
      <>
        <Header title="Tambah Tambal Ban" withBack />
        <Center flex={1}>
          <Spinner size="lg" color={COLORS.primary} />
          <Text mt={2} color="gray.500">Memuat data pengguna...</Text>
        </Center>
      </>
    );
  }

  return (
    <>
      <Header title="Tambah Tambal Ban" withBack />
      <Box flex={1} bg="white" safeArea>
        <ScrollView p={4}>
          <VStack space={4}>
            {/* Info Pengguna yang Menambahkan */}
            {currentUser && (
              <Box bg={COLORS.primary} rounded="md" p={3} mb={2}>
                <HStack space={2} alignItems="center">
                  <Ionicons name="person-circle" size={24} color="white" />
                  <VStack flex={1}>
                    <Text color="white" fontWeight="bold" fontSize="md">
                      Ditambahkan oleh: {currentUser.nama}
                    </Text>
                    <Text color="white" fontSize="sm" opacity={0.8}>
                      {currentUser.email} • {currentUser.role}
                    </Text>
                  </VStack>
                  <Badge bg={COLORS.secondary} _text={{ color: COLORS.accent, fontWeight: "bold" }}>
                    {currentUser.role}
                  </Badge>
                </HStack>
                
                {/* Status Info */}
                <Box mt={2} p={2} bg="rgba(255,255,255,0.1)" rounded="md">
                  <Text color="white" fontSize="sm" textAlign="center">
                    {isAdmin() 
                      ? "✅ Data akan langsung aktif setelah disimpan" 
                      : "⏳ Data akan menunggu persetujuan admin setelah disimpan"
                    }
                  </Text>
                </Box>
              </Box>
            )}
            
            {/* Informasi Dasar */}
            <Box bg="white" rounded="md" shadow={2} p={4} mb={2}>
              <Heading size="md" mb={4}>Informasi Dasar</Heading>
              
              <FormControl isRequired mb={4}>
                <FormControl.Label>Nama Tambal Ban</FormControl.Label>
                <Input
                  placeholder="Masukkan nama tambal ban"
                  value={formData.nama}
                  onChangeText={(value) => handleInputChange('nama', value)}
                />
              </FormControl>
              
              <FormControl isRequired mb={4}>
                <FormControl.Label>Alamat</FormControl.Label>
                <TextArea
                  placeholder="Masukkan alamat lengkap"
                  value={formData.alamat}
                  onChangeText={(value) => handleInputChange('alamat', value)}
                  autoCompleteType={false}
                  h={20}
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormControl.Label>Nomor Telepon</FormControl.Label>
                <Input
                  placeholder="Masukkan nomor telepon (opsional)"
                  value={formData.telepon}
                  onChangeText={(value) => handleInputChange('telepon', value)}
                  keyboardType="phone-pad"
                />
              </FormControl>
              
              <FormControl isRequired mb={4}>
                <FormControl.Label>Koordinat Lokasi</FormControl.Label>
                <HStack space={2} alignItems="center">
                  <VStack flex={1} space={2}>
                    <Input
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChangeText={(value) => handleInputChange('latitude', value)}
                    />
                    <Input
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChangeText={(value) => handleInputChange('longitude', value)}
                    />
                  </VStack>
                  <Button
                    leftIcon={<Ionicons name="locate" size={20} color="white" />}
                    onPress={getCurrentLocation}
                    bg={COLORS.primary}
                    isLoading={locationLoading}
                    h="full"
                  >
                    Lokasi Saat Ini
                  </Button>
                </HStack>
              </FormControl>
              
              <FormControl mb={4}>
                <FormControl.Label>Hari Operasional</FormControl.Label>
                <Select
                  selectedValue={formData.hari_operasional}
                  onValueChange={(value) => handleInputChange('hari_operasional', value)}
                  _selectedItem={{
                    bg: COLORS.primary,
                    endIcon: <CheckIcon size={5} color="white" />
                  }}
                >
                  <Select.Item label="Setiap Hari" value="Setiap Hari" />
                  <Select.Item label="Hari Kerja (Senin-Jumat)" value="Hari Kerja (Senin-Jumat)" />
                  <Select.Item label="Hari Kerja (Senin-Sabtu)" value="Hari Kerja (Senin-Sabtu)" />
                  <Select.Item label="Tidak Pasti Harinya" value="Tidak Pasti Harinya" />
                </Select>
              </FormControl>
              
              <FormControl mb={4}>
                <FormControl.Label>Jam Operasional (Ringkasan)</FormControl.Label>
                <Input
                  placeholder="Contoh: 08.00 - 21.00 WIB"
                  value={formData.jam_operasional}
                  onChangeText={(value) => handleInputChange('jam_operasional', value)}
                />
                <FormControl.HelperText>
                  Masukkan ringkasan jam operasional untuk tampilan utama
                </FormControl.HelperText>
              </FormControl>
            </Box>
            
            {/* Jadwal Operasional Per Hari */}
            <Box bg="white" rounded="md" shadow={2} p={4} mb={2}>
              <Heading size="md" mb={4}>Jadwal Operasional Per Hari</Heading>
              
              <VStack space={3} divider={<Divider />}>
                {formData.jadwal.map((day) => (
                  <Pressable key={day.hari} onPress={() => openDayScheduleModal(day.hari)}>
                    <HStack justifyContent="space-between" alignItems="center" py={2}>
                      <Text fontWeight="bold">{formatDayName(day.hari)}</Text>
                      <HStack space={2} alignItems="center">
                        <Text color={day.buka24Jam ? "green.600" : (getScheduleText(day) === "Belum diatur" ? "gray.400" : "gray.600")}>
                          {getScheduleText(day)}
                        </Text>
                        <IconButton
                          icon={<Ionicons name="chevron-forward" size={20} color={COLORS.primary} />}
                          onPress={() => openDayScheduleModal(day.hari)}
                        />
                      </HStack>
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </Box>
            
            {/* Foto Tambal Ban */}
            <Box bg="white" rounded="md" shadow={2} p={4} mb={2}>
              <Heading size="md" mb={4}>Foto Tambal Ban</Heading>
              
              <VStack space={4}>
                <Box>
                  <FormControl.Label>Foto 1</FormControl.Label>
                  {images.gambar_1 ? (
                    <Box position="relative">
                      <Image
                        source={{ uri: images.gambar_1 }}
                        alt="Foto Tambal Ban 1"
                        size="xl"
                        w="100%"
                        h={200}
                        borderRadius={10}
                        mb={2}
                      />
                      <IconButton
                        icon={<Ionicons name="close-circle" size={24} color="white" />}
                        position="absolute"
                        top={2}
                        right={2}
                        onPress={() => setImages({ ...images, gambar_1: null })}
                        bg="rgba(0,0,0,0.5)"
                        borderRadius="full"
                      />
                    </Box>
                  ) : (
                    <Pressable
                      onPress={() => pickImage('gambar_1')}
                      bg="gray.100"
                      h={200}
                      borderRadius={10}
                      justifyContent="center"
                      alignItems="center"
                      borderWidth={1}
                      borderStyle="dashed"
                      borderColor="gray.300"
                    >
                      <Ionicons name="camera" size={40} color="gray" />
                      <Text color="gray.500" mt={2}>Tap untuk menambahkan foto</Text>
                    </Pressable>
                  )}
                  
                  {!images.gambar_1 && (
                    <HStack space={2} mt={2} justifyContent="center">
                      <Button
                        leftIcon={<Ionicons name="image" size={16} color="white" />}
                        bg={COLORS.primary}
                        onPress={() => pickImage('gambar_1')}
                        size="sm"
                      >
                        Dari Galeri
                      </Button>
                      <Button
                        leftIcon={<Ionicons name="camera" size={16} color="white" />}
                        bg={COLORS.accent}
                        onPress={() => takePhoto('gambar_1')}
                        size="sm"
                      >
                        Ambil Foto
                      </Button>
                    </HStack>
                  )}
                </Box>
                
                <Box>
                  <FormControl.Label>Foto 2</FormControl.Label>
                  {images.gambar_2 ? (
                    <Box position="relative">
                      <Image
                        source={{ uri: images.gambar_2 }}
                        alt="Foto Tambal Ban 2"
                        size="xl"
                        w="100%"
                        h={200}
                        borderRadius={10}
                        mb={2}
                      />
                      <IconButton
                        icon={<Ionicons name="close-circle" size={24} color="white" />}
                        position="absolute"
                        top={2}
                        right={2}
                        onPress={() => setImages({ ...images, gambar_2: null })}
                        bg="rgba(0,0,0,0.5)"
                        borderRadius="full"
                      />
                    </Box>
                  ) : (
                    <Pressable
                      onPress={() => pickImage('gambar_2')}
                      bg="gray.100"
                      h={200}
                      borderRadius={10}
                      justifyContent="center"
                      alignItems="center"
                      borderWidth={1}
                      borderStyle="dashed"
                      borderColor="gray.300"
                    >
                      <Ionicons name="camera" size={40} color="gray" />
                      <Text color="gray.500" mt={2}>Tap untuk menambahkan foto</Text>
                    </Pressable>
                  )}
                  
                  {!images.gambar_2 && (
                    <HStack space={2} mt={2} justifyContent="center">
                      <Button
                        leftIcon={<Ionicons name="image" size={16} color="white" />}
                        bg={COLORS.primary}
                        onPress={() => pickImage('gambar_2')}
                        size="sm"
                      >
                        Dari Galeri
                      </Button>
                      <Button
                        leftIcon={<Ionicons name="camera" size={16} color="white" />}
                        bg={COLORS.accent}
                        onPress={() => takePhoto('gambar_2')}
                        size="sm"
                      >
                        Ambil Foto
                      </Button>
                    </HStack>
                  )}
                </Box>
              </VStack>
            </Box>
            
            {/* Submit Button */}
            <Button
              size="lg"
              bg={COLORS.primary}
              _pressed={{ bg: COLORS.accent }}
              leftIcon={<Ionicons name="save-outline" size={20} color="white" />}
              isLoading={isLoading}
              onPress={handleSubmit}
              my={4}
            >
              {isAdmin() ? "Simpan Data" : "Kirim untuk Persetujuan"}
            </Button>
          </VStack>
        </ScrollView>
      </Box>
      
      {/* Modal untuk jadwal operasional per hari - ENHANCED VERSION */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>
            <HStack justifyContent="space-between" alignItems="center" pr={8}>
              <Text fontSize="lg" fontWeight="bold">
                Jadwal {selectedDay ? formatDayName(selectedDay.hari) : ''}
              </Text>
              {/* Tombol Hapus Semua Jadwal */}
              {selectedDay && (selectedDay.buka24Jam || selectedDay.buka || selectedDay.tutup || selectedDay.buka2 || selectedDay.tutup2) && (
                <IconButton
                  icon={<Ionicons name="trash" size={18} color="white" />}
                  bg="red.500"
                  borderRadius="md"
                  size="sm"
                  onPress={clearAllScheduleForDay}
                  _pressed={{ bg: "red.600" }}
                />
              )}
            </HStack>
          </Modal.Header>
          <Modal.Body>
            {selectedDay && (
              <VStack space={4}>
                <FormControl>
                  <FormControl.Label>Buka 24 Jam?</FormControl.Label>
                  <HStack space={2} alignItems="center" mt={1}>
                    <Button
                      variant={selectedDay.buka24Jam ? "solid" : "outline"}
                      colorScheme="success"
                      onPress={() => handleUpdateDaySchedule('buka24Jam', true)}
                      size="sm"
                      flex={1}
                    >
                      Ya
                    </Button>
                    <Button
                      variant={!selectedDay.buka24Jam ? "solid" : "outline"}
                      colorScheme="error"
                      onPress={() => handleUpdateDaySchedule('buka24Jam', false)}
                      size="sm"
                      flex={1}
                    >
                      Tidak
                    </Button>
                  </HStack>
                </FormControl>
                
                {!selectedDay.buka24Jam && (
                  <>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Heading size="xs" color={COLORS.primary}>Jadwal Pertama</Heading>
                      {/* Tombol hapus jadwal pertama */}
                      {(selectedDay.buka || selectedDay.tutup) && (
                        <IconButton
                          icon={<Ionicons name="close-circle" size={16} color="red.500" />}
                          onPress={() => {
                            handleUpdateDaySchedule('buka', '');
                            handleUpdateDaySchedule('tutup', '');
                          }}
                          size="xs"
                          _pressed={{ bg: "red.50" }}
                        />
                      )}
                    </HStack>
                    <VStack space={2}>
                      <FormControl>
                        <FormControl.Label>Jam Buka</FormControl.Label>
                        <TimePickerButton 
                          mode="buka"
                          value={selectedDay.buka}
                          placeholder="Pilih jam buka"
                        />
                      </FormControl>
                      <FormControl>
                        <FormControl.Label>Jam Tutup</FormControl.Label>
                        <TimePickerButton 
                          mode="tutup"
                          value={selectedDay.tutup}
                          placeholder="Pilih jam tutup"
                        />
                      </FormControl>
                    </VStack>
                    
                    <HStack justifyContent="space-between" alignItems="center">
                      <Heading size="xs" color={COLORS.primary}>Jadwal Kedua (Opsional)</Heading>
                      {/* Tombol hapus jadwal kedua */}
                      {(selectedDay.buka2 || selectedDay.tutup2) && (
                        <IconButton
                          icon={<Ionicons name="close-circle" size={16} color="red.500" />}
                          onPress={() => {
                            handleUpdateDaySchedule('buka2', '');
                            handleUpdateDaySchedule('tutup2', '');
                          }}
                          size="xs"
                          _pressed={{ bg: "red.50" }}
                        />
                      )}
                    </HStack>
                    <VStack space={2}>
                      <FormControl>
                        <FormControl.Label>Jam Buka</FormControl.Label>
                        <TimePickerButton 
                          mode="buka2"
                          value={selectedDay.buka2}
                          placeholder="Pilih jam buka"
                        />
                      </FormControl>
                      <FormControl>
                        <FormControl.Label>Jam Tutup</FormControl.Label>
                        <TimePickerButton 
                          mode="tutup2"
                          value={selectedDay.tutup2}
                          placeholder="Pilih jam tutup"
                        />
                      </FormControl>
                    </VStack>
                    
                    {/* Tombol Terapkan ke Semua Hari - FITUR BARU */}
                    <Divider />
                    <VStack space={2}>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Terapkan jadwal ini ke semua hari?
                      </Text>
                      <Button
                        variant="outline"
                        borderColor={COLORS.primary}
                        _text={{ color: COLORS.primary }}
                        leftIcon={<Ionicons name="copy-outline" size={16} color={COLORS.primary} />}
                        onPress={applyToAllDays}
                        size="sm"
                      >
                        Terapkan ke Semua Hari
                      </Button>
  
                    </VStack>
                  </>
                )}
                
                {/* Jika buka 24 jam, tampilkan juga opsi terapkan ke semua hari */}
                {selectedDay.buka24Jam && (
                  <>
                    <Divider />
                    <VStack space={2}>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Terapkan "Buka 24 Jam" ke semua hari?
                      </Text>
                      <Button
                        variant="outline"
                        borderColor={COLORS.primary}
                        _text={{ color: COLORS.primary }}
                        leftIcon={<Ionicons name="copy-outline" size={16} color={COLORS.primary} />}
                        onPress={applyToAllDays}
                        size="sm"
                      >
                        Terapkan ke Semua Hari
                      </Button>
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        Semua hari akan diatur menjadi "Buka 24 Jam"
                      </Text>
                    </VStack>
                  </>
                )}
                
                {/* Info Box untuk cara penggunaan */}
              </VStack>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="coolGray" onPress={() => setShowModal(false)}>
                Batal
              </Button>
              <Button bg={COLORS.primary} onPress={saveDaySchedule}>
                Simpan
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Custom Time Picker Modal */}
      <Modal isOpen={showTimePicker} onClose={() => setShowTimePicker(false)} size="lg">
        <Modal.Content>
          <Modal.Header>Pilih Jam Buka</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Box>
                <HStack space={4} alignItems="center" justifyContent="center">
                  {/* Hour Picker */}
                  <VStack alignItems="center">
                    <Text fontSize="sm" color="gray.600">Jam</Text>
                    <Select
                      selectedValue={selectedHour}
                      onValueChange={setSelectedHour}
                      w={20}
                      _selectedItem={{
                        bg: COLORS.primary,
                        endIcon: <CheckIcon size={5} color="white" />
                      }}
                    >
                      {hours.map(hour => (
                        <Select.Item key={hour} label={hour} value={hour} />
                      ))}
                    </Select>
                  </VStack>

                  <Text fontSize="xl" fontWeight="bold">:</Text>

                  {/* Minute Picker */}
                  <VStack alignItems="center">
                    <Text fontSize="sm" color="gray.600">Menit</Text>
                    <Select
                      selectedValue={selectedMinute}
                      onValueChange={setSelectedMinute}
                      w={20}
                      _selectedItem={{
                        bg: COLORS.primary,
                        endIcon: <CheckIcon size={5} color="white" />
                      }}
                    >
                      {['00', '01', '02', '03','04','05','06','07','08','09','10', '11', '12', '13','14','15','16','17','18','19','20','20', '21', '22', '23','24','25','26','27','28','29','30','31', '32', '33','34','35','36','37','38','39','40','41', '42', '43','44','45','46','47','48','49','50','51', '52', '53','54','55','56','57','58','59'].map(minute => (
                        <Select.Item key={minute} label={minute} value={minute} />
                      ))}
                    </Select>
                  </VStack>
                </HStack>

                {/* Preview */}
                <Center mt={4}>
                  <Text fontSize="lg" fontWeight="bold" color={COLORS.primary}>
                    {selectedHour}.{selectedMinute} WIB
                  </Text>
                </Center>
              </Box>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={() => setShowTimePicker(false)}>
                Batal
              </Button>
              <Button bg={COLORS.primary} onPress={confirmTime}>
                Konfirmasi
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default AddTambalBanScreen;