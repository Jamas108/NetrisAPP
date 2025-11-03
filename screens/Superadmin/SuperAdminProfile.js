import React, { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    VStack,
    Text,
    HStack,
    Avatar,
    Button,
    Divider,
    FormControl,
    Input,
    ScrollView,
    Icon,
    useToast,
    Center,
    Circle,
    Modal,
    Alert
} from 'native-base';
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components";
import { getData } from '../../utils/localStorage';
import { logoutUser, changePassword, updateUserProfile } from '../../actions/AuthAction';

const SuperAdminProfile = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileLoading, setIsProfileLoading] = useState(false); // New loading state for profile update
    
    // Password change states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const toast = useToast();

    useEffect(() => {
        const getUserData = async () => {
            try {
                const data = await getData('user');
                setUserData(data);
                if (data) {
                    setNama(data.nama || '');
                    setEmail(data.email || '');
                    setPhoneNumber(data.phoneNumber || '');
                }
            } catch (error) {
                console.log('Error getting user data:', error);
                setUserData(null);
            } finally {
                setIsLoading(false);
            }
        };

        getUserData();
    }, []);

    const handleLogout = async () => {
        const success = await logoutUser();
        if (success) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
            });
        }
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    const validateProfileForm = () => {
        if (!nama.trim()) {
            toast.show({
                title: "Nama harus diisi",
                status: "error",
                placement: "top"
            });
            return false;
        }

        if (nama.trim().length < 2) {
            toast.show({
                title: "Nama minimal 2 karakter",
                status: "error",
                placement: "top"
            });
            return false;
        }

        return true;
    };

    const handleSaveProfile = async () => {
        if (!validateProfileForm()) return;

        setIsProfileLoading(true);
        console.log('Starting profile save process...');
        
        try {
            // Prepare updated user data
            const updatedData = {
                ...userData,
                nama: nama.trim(),
                email: email, // Keep email unchanged
                phoneNumber: phoneNumber || '',
                updatedAt: new Date().toISOString()
            };

            console.log('Updating profile with data:', updatedData);

            const result = await updateUserProfile(updatedData);

            if (result.success) {
                // Update local state with the new data
                setUserData(updatedData);
                
                toast.show({
                    title: "Profil berhasil diperbarui",
                    status: "success",
                    placement: "top"
                });
                
                setIsEditing(false);
                console.log('Profile update successful');
            } else {
                const error = result.error;
                let errorMessage = "Gagal memperbarui profil";
                
                console.log('Profile update failed:', error);
                
                if (error.message) {
                    errorMessage = `Error: ${error.message}`;
                }
                
                toast.show({
                    title: errorMessage,
                    status: "error",
                    placement: "top"
                });
            }
            
        } catch (error) {
            console.error('Unexpected error in handleSaveProfile:', error);
            toast.show({
                title: `Unexpected error: ${error.message}`,
                status: "error",
                placement: "top"
            });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const validatePasswordForm = () => {
        if (!currentPassword.trim()) {
            toast.show({
                title: "Password saat ini harus diisi",
                status: "error",
                placement: "top"
            });
            return false;
        }

        if (!newPassword.trim()) {
            toast.show({
                title: "Password baru harus diisi",
                status: "error",
                placement: "top"
            });
            return false;
        }

        if (newPassword.length < 6) {
            toast.show({
                title: "Password baru minimal 6 karakter",
                status: "error",
                placement: "top"
            });
            return false;
        }

        if (newPassword !== confirmPassword) {
            toast.show({
                title: "Konfirmasi password tidak cocok",
                status: "error",
                placement: "top"
            });
            return false;
        }

        if (currentPassword === newPassword) {
            toast.show({
                title: "Password baru harus berbeda dari password saat ini",
                status: "error",
                placement: "top"
            });
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        setIsPasswordLoading(true);
        console.log('Starting password change from UI...');
        
        try {
            const result = await changePassword(currentPassword, newPassword);
            
            if (result.success) {
                toast.show({
                    title: "Password berhasil diubah",
                    status: "success",
                    placement: "top"
                });
                
                // Reset form and close modal
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(false);
            } else {
                // Handle detailed error from the result
                const error = result.error;
                let errorMessage = "Gagal mengubah password";
                
                console.log('Password change failed:', error);
                
                if (error.code === 'auth/wrong-password') {
                    errorMessage = "Password saat ini salah";
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = "Password baru terlalu lemah";
                } else if (error.code === 'auth/requires-recent-login') {
                    errorMessage = "Silakan login ulang untuk mengubah password";
                } else if (error.code === 'auth/invalid-credential') {
                    errorMessage = "Password saat ini tidak valid";
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = "Terlalu banyak percobaan. Coba lagi nanti";
                } else if (error.message) {
                    errorMessage = `Error: ${error.message}`;
                }
                
                toast.show({
                    title: errorMessage,
                    status: "error",
                    placement: "top"
                });
            }
            
        } catch (error) {
            console.error('Unexpected error in handleChangePassword:', error);
            toast.show({
                title: `Unexpected error: ${error.message}`,
                status: "error",
                placement: "top"
            });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const resetPasswordForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleCancelEdit = () => {
        // Reset form to original data
        if (userData) {
            setNama(userData.nama || '');
            setEmail(userData.email || '');
            setPhoneNumber(userData.phoneNumber || '');
        }
        setIsEditing(false);
    };

    // Loading state
    if (isLoading) {
        return (
            <Box flex={1} bg="white" justifyContent="center" alignItems="center">
                <Text>Loading...</Text>
            </Box>
        );
    }

    // No user logged in - show login prompt
    if (!userData) {
        return (
            <Box flex={1} bg="white" safeAreaTop>
                <Center flex={1} px={6}>
                    <VStack space={8} alignItems="center" width="full">
                        {/* Icon */}
                        <Icon
                            as={Ionicons}
                            name="person-circle-outline"
                            size="6xl"
                            color="#E62E05"
                        />

                        {/* Heading */}
                        <Heading size="lg" color="#E62E05" textAlign="center">
                            Akses Profil
                        </Heading>

                        {/* Description Box */}
                        <Box bg="white" rounded="lg" shadow={3} p={6} width="full" maxWidth="md">
                            <Text fontSize="md" color="coolGray.600" textAlign="center" lineHeight="xl">
                                Ingin berkontribusi untuk menambah data tambal ban di sekitar anda? silahkan melakukan masuk atau mendaftar akun terlebih dahulu.
                            </Text>
                        </Box>

                        {/* Login Button */}
                        <VStack space={4} width="full" maxWidth="md">
                            <Button
                                leftIcon={<Icon as={Ionicons} name="log-in-outline" size="sm" />}
                                colorScheme="error"
                                bg="#E62E05"
                                size="lg"
                                onPress={handleLogin}
                                _text={{ fontSize: "md", fontWeight: "bold" }}
                            >
                                Masuk ke Akun
                            </Button>

                            {/* Divider with text */}
                            <HStack alignItems="center" space={2}>
                                <Divider flex={1} />
                                <Text fontSize="xs" color="coolGray.400">atau</Text>
                                <Divider flex={1} />
                            </HStack>

                            {/* Register Button */}
                            <Button
                                leftIcon={<Icon as={Ionicons} name="person-add-outline" size="sm" />}
                                variant="outline"
                                borderColor="#E62E05"
                                _text={{ color: "#E62E05", fontSize: "md", fontWeight: "bold" }}
                                size="lg"
                                onPress={handleRegister}
                            >
                                Daftar Akun Baru
                            </Button>

                            {/* Register info text */}
                            <HStack justifyContent="center" alignItems="center" space={1} mt={2}>
                                <Icon as={Ionicons} name="information-circle-outline" color="coolGray.400" size="xs" />
                                <Text fontSize="xs" color="coolGray.400" textAlign="center">
                                    Belum punya akun? Daftar sekarang untuk bergabung
                                </Text>
                            </HStack>
                        </VStack>
                    </VStack>
                </Center>
            </Box>
        );
    }

    // User is logged in - show profile
    return (
        <>
            <Header title={"Kelola Profil"} />
            <ScrollView bg="white">
                <Box flex={1} safeAreaTop px={4} py={6}>
                    <VStack space={6} alignItems="center" mb={6}>
                        {/* Avatar dengan icon */}
                        <Circle size="120px" bg="#E62E05" borderWidth={4} borderColor="#E62E05">
                            <Icon
                                as={Ionicons}
                                name="person"
                                size="4xl"
                                color="white"
                            />
                        </Circle>

                        {!isEditing ? (
                            <VStack space={1} alignItems="center">
                                <Heading size="md">{userData.nama}</Heading>
                                <Text color="coolGray.600">{userData.email}</Text>
                                <HStack alignItems="center" space={1} mt={1}>
                                    <Icon as={Ionicons} name="shield-checkmark" color="#E62E05" size="sm" />
                                    <Text color="#E62E05" fontWeight="bold">
                                        {userData.role === 'admin' ? 'Administrator' :
                                            userData.role === 'pengguna' ? 'Pengguna' : userData.role}
                                    </Text>
                                </HStack>
                            </VStack>
                        ) : null}
                    </VStack>

                    <Box bg="white" rounded="md" shadow={2} p={4} mb={6}>
                        {isEditing ? (
                            <VStack space={4}>
                                <Heading size="sm" mb={2}>Edit Profil</Heading>

                                <FormControl>
                                    <FormControl.Label _text={{ color: "#E62E05" }}>Nama *</FormControl.Label>
                                    <Input
                                        value={nama}
                                        onChangeText={setNama}
                                        borderColor="#E62E05"
                                        _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                    <FormControl.HelperText>
                                        Minimal 2 karakter
                                    </FormControl.HelperText>
                                </FormControl>

                                <FormControl>
                                    <FormControl.Label _text={{ color: "#E62E05" }}>Email</FormControl.Label>
                                    <Input
                                        value={email}
                                        onChangeText={setEmail}
                                        isDisabled={true}
                                        borderColor="#E62E05"
                                        _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                        bg="gray.100"
                                    />
                                    <FormControl.HelperText>
                                        Email tidak dapat diubah
                                    </FormControl.HelperText>
                                </FormControl>

                                <FormControl>
                                    <FormControl.Label _text={{ color: "#E62E05" }}>Nomor Telepon</FormControl.Label>
                                    <Input
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        borderColor="#E62E05"
                                        _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                        placeholder="Masukkan nomor telepon (opsional)"
                                        keyboardType="phone-pad"
                                    />
                                </FormControl>

                                <HStack space={2} mt={4} justifyContent="flex-end">
                                    <Button
                                        variant="outline"
                                        colorScheme="gray"
                                        onPress={handleCancelEdit}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        colorScheme="error"
                                        bg="#E62E05"
                                        onPress={handleSaveProfile}
                                        isLoading={isProfileLoading}
                                        isLoadingText="Menyimpan..."
                                    >
                                        Simpan
                                    </Button>
                                </HStack>
                            </VStack>
                        ) : (
                            <VStack space={4}>
                                <Heading size="sm" mb={2}>Informasi Akun</Heading>

                                <VStack space={2}>
                                    <Text fontWeight="bold" color="coolGray.700">Nama</Text>
                                    <Text>{userData.nama}</Text>
                                </VStack>

                                <Divider />

                                <VStack space={2}>
                                    <Text fontWeight="bold" color="coolGray.700">Email</Text>
                                    <Text>{userData.email}</Text>
                                </VStack>

                                <Divider />

                                <VStack space={2}>
                                    <Text fontWeight="bold" color="coolGray.700">Role</Text>
                                    <Text>{userData.role === 'admin' ? 'Administrator' :
                                        userData.role === 'pengguna' ? 'Pengguna' : userData.role}</Text>
                                </VStack>

                                <HStack space={2} mt={4}>
                                    <Button
                                        leftIcon={<Icon as={Ionicons} name="create-outline" size="sm" />}
                                        variant="subtle"
                                        colorScheme="info"
                                        flex={1}
                                        onPress={() => setIsEditing(true)}
                                    >
                                        Edit Profil
                                    </Button>
                                    <Button
                                        leftIcon={<Icon as={Ionicons} name="key-outline" size="sm" />}
                                        variant="subtle"
                                        colorScheme="warning"
                                        flex={1}
                                        onPress={() => setShowPasswordModal(true)}
                                    >
                                        Ubah Password
                                    </Button>
                                </HStack>
                            </VStack>
                        )}
                    </Box>

                    <Button
                        leftIcon={<Icon as={Ionicons} name="log-out-outline" size="sm" />}
                        colorScheme="error"
                        bg="#E62E05"
                        onPress={handleLogout}
                        mb={6}
                    >
                        Logout
                    </Button>
                </Box>
            </ScrollView>

            {/* Password Change Modal */}
            <Modal 
                isOpen={showPasswordModal} 
                onClose={() => {
                    setShowPasswordModal(false);
                    resetPasswordForm();
                }}
                size="lg"
            >
                <Modal.Content maxWidth="400px">
                    <Modal.CloseButton />
                    <Modal.Header>Ubah Password</Modal.Header>
                    <Modal.Body>
                        <VStack space={4}>
                            <FormControl>
                                <FormControl.Label _text={{ color: "#E62E05" }}>Password Saat Ini</FormControl.Label>
                                <Input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    borderColor="#E62E05"
                                    _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                    InputRightElement={
                                        <Button
                                            size="xs"
                                            rounded="none"
                                            w="1/6"
                                            h="full"
                                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                            variant="ghost"
                                        >
                                            <Icon
                                                as={Ionicons}
                                                name={showCurrentPassword ? "eye-off" : "eye"}
                                                size="sm"
                                                color="muted.400"
                                            />
                                        </Button>
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormControl.Label _text={{ color: "#E62E05" }}>Password Baru</FormControl.Label>
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    borderColor="#E62E05"
                                    _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                    InputRightElement={
                                        <Button
                                            size="xs"
                                            rounded="none"
                                            w="1/6"
                                            h="full"
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                            variant="ghost"
                                        >
                                            <Icon
                                                as={Ionicons}
                                                name={showNewPassword ? "eye-off" : "eye"}
                                                size="sm"
                                                color="muted.400"
                                            />
                                        </Button>
                                    }
                                />
                                <FormControl.HelperText>
                                    Minimal 6 karakter
                                </FormControl.HelperText>
                            </FormControl>

                            <FormControl>
                                <FormControl.Label _text={{ color: "#E62E05" }}>Konfirmasi Password Baru</FormControl.Label>
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    borderColor="#E62E05"
                                    _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                    InputRightElement={
                                        <Button
                                            size="xs"
                                            rounded="none"
                                            w="1/6"
                                            h="full"
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            variant="ghost"
                                        >
                                            <Icon
                                                as={Ionicons}
                                                name={showConfirmPassword ? "eye-off" : "eye"}
                                                size="sm"
                                                color="muted.400"
                                            />
                                        </Button>
                                    }
                                />
                            </FormControl>
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button 
                                variant="ghost" 
                                colorScheme="blueGray" 
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    resetPasswordForm();
                                }}
                            >
                                Batal
                            </Button>
                            <Button 
                                colorScheme="error"
                                bg="#E62E05"
                                onPress={handleChangePassword}
                                isLoading={isPasswordLoading}
                                isLoadingText="Mengubah..."
                            >
                                Ubah Password
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </>
    );
};

export default SuperAdminProfile;