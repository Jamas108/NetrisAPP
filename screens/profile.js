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
    Center
} from 'native-base';

import { Ionicons } from "@expo/vector-icons";
import { getData } from '../utils/localStorage';
import { logoutUser } from '../actions/AuthAction';

const Profile = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);
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
                routes: [{ name: 'Login' }],
            });
        }
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    const handleSaveProfile = () => {
        // Here you would update the profile in Firebase
        // For this example, we'll just show a success message
        toast.show({
            title: "Profil berhasil diperbarui",
            status: "success",
            placement: "top"
        });
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
        <ScrollView bg="white">
            <Box flex={1} safeAreaTop px={4} py={6}>
                <Heading size="lg" color="#E62E05" mb={6}>
                    Profil
                </Heading>

                <VStack space={6} alignItems="center" mb={6}>
                    <Avatar
                        size="2xl"
                        source={{ uri: "https://via.placeholder.com/150" }}
                        borderWidth={3}
                        borderColor="#E62E05"
                    />

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
                                <FormControl.Label _text={{ color: "#E62E05" }}>Nama</FormControl.Label>
                                <Input
                                    value={nama}
                                    onChangeText={setNama}
                                    borderColor="#E62E05"
                                    _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormControl.Label _text={{ color: "#E62E05" }}>Email</FormControl.Label>
                                <Input
                                    value={email}
                                    onChangeText={setEmail}
                                    isDisabled={true}
                                    borderColor="#E62E05"
                                    _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
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
                                    keyboardType="phone-pad"
                                    borderColor="#E62E05"
                                    _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                                />
                            </FormControl>

                            <HStack space={2} mt={4} justifyContent="flex-end">
                                <Button
                                    variant="outline"
                                    colorScheme="gray"
                                    onPress={() => setIsEditing(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    colorScheme="error"
                                    bg="#E62E05"
                                    onPress={handleSaveProfile}
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
                                <Text fontWeight="bold" color="coolGray.700">Nomor Telepon</Text>
                                <Text>{userData.phoneNumber || '-'}</Text>
                            </VStack>

                            <Divider />

                            <VStack space={2}>
                                <Text fontWeight="bold" color="coolGray.700">Role</Text>
                                <Text>{userData.role === 'admin' ? 'Administrator' : 
                                       userData.role === 'pengguna' ? 'Pengguna' : userData.role}</Text>
                            </VStack>

                            <Button
                                leftIcon={<Icon as={Ionicons} name="create-outline" size="sm" />}
                                variant="subtle"
                                colorScheme="info"
                                mt={4}
                                onPress={() => setIsEditing(true)}
                            >
                                Edit Profil
                            </Button>
                        </VStack>
                    )}
                </Box>

                <Box bg="white" rounded="md" shadow={2} p={4} mb={6}>
                    <VStack space={4}>
                        <Heading size="sm" mb={2}>Keamanan</Heading>

                        <Button
                            leftIcon={<Icon as={Ionicons} name="key-outline" size="sm" />}
                            variant="outline"
                            colorScheme="info"
                        >
                            Ubah Password
                        </Button>
                    </VStack>
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
    );
};

export default Profile;