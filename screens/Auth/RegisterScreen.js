import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    Heading,
    Button,
    Input,
    Image,
    Center,
    FormControl,
    ScrollView,
    useToast
} from 'native-base';
import { handleRegister } from '../../controllers/RegisterController';

const RegisterScreen = ({ navigation }) => {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const onRegister = async () => {
        try {
            // Validation
            if (!nama.trim()) {
                toast.show({
                    title: "Nama harus diisi",
                    status: "warning",
                    placement: "top"
                });
                return;
            }

            if (!email.trim()) {
                toast.show({
                    title: "Email harus diisi",
                    status: "warning",
                    placement: "top"
                });
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                toast.show({
                    title: "Format email tidak valid",
                    status: "warning",
                    placement: "top"
                });
                return;
            }

            if (!phoneNumber.trim()) {
                toast.show({
                    title: "Nomor telepon harus diisi",
                    status: "warning",
                    placement: "top"
                });
                return;
            }

            // Phone number validation (Indonesian format)
            const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
            if (!phoneRegex.test(phoneNumber.trim())) {
                toast.show({
                    title: "Format nomor telepon tidak valid",
                    description: "Gunakan format: 08xxxxxxxx atau +628xxxxxxxx",
                    status: "warning",
                    placement: "top"
                });
                return;
            }

            if (password.length < 6) {
                toast.show({
                    title: "Password minimal 6 karakter",
                    status: "warning",
                    placement: "top"
                });
                return;
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                toast.show({
                    title: "Password tidak cocok",
                    status: "warning",
                    placement: "top"
                });
                return;
            }

            setIsLoading(true);
            const result = await handleRegister(nama, email, password, phoneNumber, navigation);
            
            if (result && result.success) {
                toast.show({
                    title: "Registrasi berhasil!",
                    description: "Selamat datang di aplikasi kami",
                    status: "success",
                    placement: "top",
                    duration: 3000
                });

                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Pengguna' }],
                    });
                }, 1000);
            }
        } catch (error) {
            toast.show({
                title: "Registrasi gagal",
                description: error.message,
                status: "error",
                placement: "top",
                duration: 4000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView bg="white" flex={1}>
            <Center flex={1} px={4} py={10}>
                <VStack space={6} alignItems="center" w="100%">
                    {/* Logo */}
                    <Box mt={10}>
                        <Image
                            source={require('../../assets/netrislogoo.png')}
                            alt="Logo"
                            size="xl"
                            w={"220px"}
                            h={"220px"}
                            fallbackSource={{
                                uri: "https://via.placeholder.com/150"
                            }}
                        />
                    </Box>

                    {/* Heading */}
                    <Heading textAlign="center" color="#E62E05" size="xl">
                        Daftar Akun
                    </Heading>

                    {/* Explanation Text */}
                    <Text textAlign="center" px={4} mb={4} color="coolGray.600">
                        Bergabung dengan komunitas tambal ban dan nikmati kemudahan mencari layanan terdekat
                    </Text>

                    {/* Form */}
                    <VStack space={4} w="100%" px={4}>
                        <FormControl isRequired>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Nama Lengkap</FormControl.Label>
                            <Input
                                placeholder="Masukkan nama lengkap Anda"
                                value={nama}
                                onChangeText={text => setNama(text)}
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Email</FormControl.Label>
                            <Input
                                placeholder="Masukkan email Anda"
                                value={email}
                                onChangeText={text => setEmail(text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Nomor Telepon</FormControl.Label>
                            <Input
                                placeholder="Contoh: 08123456789 atau +628123456789"
                                value={phoneNumber}
                                onChangeText={text => setPhoneNumber(text)}
                                keyboardType="phone-pad"
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                            <FormControl.HelperText>
                                Gunakan format Indonesia (08xxx atau +628xxx)
                            </FormControl.HelperText>
                        </FormControl>

                        <FormControl isRequired>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Password</FormControl.Label>
                            <Input
                                placeholder="Masukkan password (minimal 6 karakter)"
                                value={password}
                                onChangeText={text => setPassword(text)}
                                secureTextEntry
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Konfirmasi Password</FormControl.Label>
                            <Input
                                placeholder="Masukkan password kembali"
                                value={confirmPassword}
                                onChangeText={text => setConfirmPassword(text)}
                                secureTextEntry
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                        </FormControl>
                    </VStack>
                    
                    {/* Register Button */}
                    <Button
                        w="80%"
                        mt={6}
                        bg="#E62E05"
                        _pressed={{ bg: "#C42704" }}
                        onPress={onRegister}
                        isLoading={isLoading}
                        isLoadingText="Mendaftar..."
                        size="lg"
                        _text={{ fontSize: "md", fontWeight: "bold" }}
                    >
                        Daftar Akun
                    </Button>

                    {/* Login Link */}
                    <Text mt={4} textAlign="center">
                        Sudah punya akun?{' '}
                        <Text 
                            color="#E62E05" 
                            fontWeight="bold" 
                            onPress={() => navigation.navigate('Login')}
                            underline
                        >
                            Masuk di sini
                        </Text>
                    </Text>
                </VStack>
            </Center>
        </ScrollView>
    );
};

export default RegisterScreen;