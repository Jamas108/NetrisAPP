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
    ScrollView,
    useToast
} from 'native-base';
import { handleLogin } from '../../controllers/LoginController';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const onLogin = async () => {
        try {
            setIsLoading(true);
            await handleLogin(email, password, navigation);
        } catch (error) {
            toast.show({
                title: "Login gagal",
                description: error.message,
                status: "error",
                placement: "top"
            });
            console.error('Login error:', error);
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
                        Selamat Datang!
                    </Heading>

                    {/* Explanation Text */}
                    <Text textAlign="center" px={4} mb={4}>
                        Silahkan melakukan login untuk masuk ke dalam aplikasi Netris
                    </Text>

                    {/* Form */}
                    <VStack space={4} w="100%" px={4}>
                        <FormControl>
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

                        <FormControl>
                            <FormControl.Label _text={{ color: "#E62E05" }}>Password</FormControl.Label>
                            <Input
                                placeholder="Masukkan password Anda"
                                value={password}
                                onChangeText={text => setPassword(text)}
                                secureTextEntry
                                borderColor="#E62E05"
                                _focus={{ borderColor: "#E62E05", backgroundColor: "white" }}
                            />
                        </FormControl>
                    </VStack>
                    
                    {/* Login Button */}
                    <Button
                        w="80%"
                        mt={6}
                        bg="#E62E05"
                        _pressed={{ bg: "#C42704" }}
                        onPress={onLogin}
                        isLoading={isLoading}
                        isLoadingText="Menyimpan..."
                    >
                        Masuk
                    </Button>

                    {/* Register Link */}
                    <Text mt={2}>
                        Belum punya akun?{' '}
                        <Text color="#E62E05" fontWeight="medium" onPress={() => navigation.navigate('Register')}>
                            Daftar
                        </Text>
                    </Text>
                </VStack>
            </Center>
        </ScrollView>
    );
};

export default LoginScreen;