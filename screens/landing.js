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
    Pressable,
    KeyboardAvoidingView,
    ScrollView,
      useToast
} from 'native-base';
import { FIREBASE_DB } from '../src/config/FIREBASE/index';
import { ref, push, set } from 'firebase/database';

const Landing = ({ navigation }) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const saveToFirebase = async () => {
        try {
            setIsLoading(true);

            // Validasi nomor telepon sederhana (opsional)
            if (phoneNumber && !phoneNumber.match(/^[0-9+()-\s]{6,15}$/)) {
                toast.show({
                    title: "Format nomor telepon tidak valid",
                    status: "warning",
                    placement: "top"
                });
                setIsLoading(false);
                return;
            }

            // Hanya simpan jika ada data yang diisi
            if (name.trim() || phoneNumber.trim()) {
                // Membuat referensi untuk data pengguna
                const userListRef = ref(FIREBASE_DB, 'users');
                // Membuat key baru dengan push
                const newUserRef = push(userListRef);
                // Menyimpan data dengan key yang dibuat
                await set(newUserRef, {
                    name: name.trim() || null,
                    phoneNumber: phoneNumber.trim() || null,
                    createdAt: new Date().toISOString()
                });

                toast.show({
                    title: "Data berhasil disimpan",
                    status: "success",
                    placement: "top"
                });

                console.log('Data saved successfully to Firebase');
            }

            // Navigate to main app
            navigation.navigate('Tabs');
        } catch (error) {
            console.error('Error saving data:', error);
            toast.show({
                title: "Gagal menyimpan data",
                description: error.message,
                status: "error",
                placement: "top"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        if (name.trim() || phoneNumber.trim()) {
            saveToFirebase();
        } else {
            // Jika tidak ada data yang diisi, langsung navigasi
            navigation.navigate('Tabs');
        }
    };

    return (
        <ScrollView bg="white" flex={1}>
            <Center flex={1} px={4} py={10}>
                <VStack space={6} alignItems="center" w="100%">
                    {/* Logo */}
                    <Box mt={10}>
                        <Image
                            source={require('../assets/netrislogoo.png')}
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
                        Selamat Datang!
                    </Heading>

                    {/* Explanation Text */}
                    <Text textAlign="center" px={4} mb={4}>
                        Silakan masukkan nama dan nomor telepon Anda untuk mendapatkan update terbaru aplikasi Netris.
                    </Text>

                    {/* Form */}
                    <VStack space={4} w="100%" px={4}>
                        <FormControl>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Nama</FormControl.Label>
                            <Input
                                placeholder="Masukkan nama Anda"
                                value={name}
                                onChangeText={text => setName(text)}
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Nomor Telepon</FormControl.Label>
                            <Input
                                placeholder="Masukkan nomor telepon Anda"
                                value={phoneNumber}
                                onChangeText={text => setPhoneNumber(text)}
                                keyboardType="phone-pad"
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                        </FormControl>
                    </VStack>
                    {/* Continue Button */}
                    <Button
                        w="80%"
                        mt={6}
                        bg="#E62E05"
                        _pressed={{ bg: "#C42704" }}
                        onPress={handleContinue}
                        isLoading={isLoading}
                        isLoadingText="Menyimpan..."
                    >
                        Lanjut ke Aplikasi
                    </Button>

                    {/* Skip text - alternative way to continue */}
                    <Pressable onPress={handleContinue} mt={2}>
                        <Text color="#E62E05" fontWeight="medium">
                            Lewati
                        </Text>
                    </Pressable>
                </VStack>
            </Center>
        </ScrollView>
    );
};

export default Landing;