import React from 'react';
import { Header, HeaderNoAuth } from "../components";
import {
    Box,
    Text,
    HStack,
    VStack,
    Heading,
    Badge,
    Button,
    ScrollView,
    Container,
    Divider,
    Stack,
    Circle,
    Icon,
    Image,
    Center
} from 'native-base';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const About = () => {
    // Team members data with icons based on roles
    const teamMembers = [
        {
            name: "Mochamad Nizar Palefi Ma'Ady S.Kom., M.Kom., M.IM",
            role: "Pembimbing",
            status: "Dosen Sistem Informasi",
            color: "#E62E05",
            icon: "chalkboard-teacher"
        },
        {
            name: "Ansar Nur Jamas",
            role: "Coding & Infrastruktur",
            status: "Mahasiswa Angkatan 2021",
            color: "#E62E05",
            icon: "laptop-code"
        },
        {
            name: "Rifki Laroyba Fiddin",
            role: "Collecting & Entry Data",
            status: "Mahasiswa Angkatan 2023",
            color: "#E62E05",
            icon: "database"
        },
        {
            name: "Aawali Salsabilah",
            role: "Collecting & Entry Data",
            status: "Mahasiswa Angkatan 2023",
            color: "#E62E05",
            icon: "database"
        },
        {
            name: "Apriyanto Mauludin Kharis",
            role: "Collecting & Entry Data",
            status: "Mahasiswa Angkatan 2023",
            color: "#E62E05",
            icon: "database"
        },
        {
            name: "Ario Veisa Rayanda",
            role: "Collecting & Entry Data",
            status: "Mahasiswa Angkatan 2023",
            color: "#E62E05",
            icon: "database"
        },
    ];

    return (
        <>
            <HeaderNoAuth title={"Informasi"} />
            <ScrollView>
                {/* Hero Section */}
                <Box bg="#E62E05" py={16} px={6}>
                    <VStack space={4} alignItems="center">
                        <Heading mt={-12} color="white" size="2xl" textAlign="center">Tentang Kami</Heading>
                        <Text color="white" fontSize="lg" textAlign="center" maxW="2xl">
                            Netris merupakan hasil karya inovasi mahasiswa Prodi Sistem Informasi Telkom University Surabaya untuk memudahkan masyarakat dalam mencari informasi tentang perbaikan ban kendaraan.
                        </Text>
                    </VStack>
                </Box>

                {/* Vision & Mission Section */}
                <Box py={12} px={6} bg="white">
                    <Container maxW="container.lg">
                        <VStack space={8} alignItems="center">
                            <Heading color="#E62E05" size="xl" textAlign="center">Visi & Misi</Heading>
                            <Text fontSize="lg" textAlign="center" maxW="2xl">
                                Membuat suatu inovasi yang bermanfaat dan berkesan bagi masyarakat dalam membantu untuk memberikan informasi seputar gerai tambal ban atau perbaikan ban.
                            </Text>

                            <HStack space={6} flexWrap="wrap" justifyContent="center" mt={8}>
                                <Box
                                    bg="orange.50"
                                    p={8}
                                    rounded="xl"
                                    shadow="md"
                                    w={{ base: "full", md: "45%" }}
                                    mb={{ base: 6, md: 0 }}
                                    borderLeftWidth={4}
                                    borderLeftColor="#E62E05"
                                >
                                    <VStack space={4}>
                                        <Heading size="md" color="#E62E05">Inovasi</Heading>
                                        <Text>
                                            Lebih dari sekedar navigasi, Kami berinovasi dengan menyediakan informasi perbaikan ban disaat Anda membutuhkannya, kapanpun dan dimanapun.
                                        </Text>
                                    </VStack>
                                </Box>

                                <Box
                                    bg="orange.50"
                                    p={8}
                                    rounded="xl"
                                    shadow="md"
                                    w={{ base: "full", md: "45%" }}
                                    borderLeftWidth={4}
                                    borderLeftColor="#E62E05"
                                >
                                    <VStack space={4}>
                                        <Heading size="md" color="#E62E05">Keunggulan</Heading>
                                        <Text>
                                            Memberikan informasi lokasi tambal ban terdekat secara akurat dan real-time, memastikan Anda dapat segera mendapatkan bantuan yang diperlukan.
                                        </Text>
                                    </VStack>
                                </Box>
                            </HStack>
                        </VStack>
                    </Container>
                </Box>

                {/* Team Section - Simplified Design */}
                <Box py={12} px={10} bg="gray.50">
                    <Container maxW="container.lg">
                        <VStack space={8} alignItems="center">
                            <Heading color="#E62E05" size="xl" textAlign="center">Tim Pengembang</Heading>
                            <Text fontSize="md" textAlign="center" maxW="2xl">
                                Aplikasi netris dikembangkan oleh beberapa mahasiswa Program Studi Sistem Informasi dan berdedikasi untuk memberikan solusi permasalahan terbaik bagi masyarakat.
                            </Text>
                        </VStack>

                        {/* Team members styled to match the image */}
                        <Box mt={12} width="100%" maxW="4xl" mx="auto">
                            <VStack space={6} alignItems="center" width="100%">
                                {teamMembers.map((member, index) => (
                                    <Box
                                        key={index}
                                        bg="white"
                                        p={5}
                                        rounded="xl"
                                        shadow="sm"
                                        width="100%"
                                        borderWidth={1}
                                        borderColor="gray.100"
                                    >
                                        <HStack space={4} alignItems="center">
                                            <Circle size={16} bg="orange.50">
                                                <Icon
                                                    as={FontAwesome5}
                                                    name={member.icon}
                                                    size="lg"
                                                    color="#E62E05"
                                                />
                                            </Circle>
                                            <VStack flex={1} alignItems="flex-start">
                                                <Text
                                                    fontWeight="bold"
                                                    color="#E62E05"
                                                    fontSize="md"
                                                >
                                                    {member.name}
                                                </Text>
                                                <Box
                                                    bg="orange.100"
                                                    px={4}
                                                    py={1}
                                                    rounded="md"
                                                    mt={1}
                                                >
                                                    <Text color="#E62E05" fontSize="sm">
                                                        {member.status}
                                                    </Text>
                                                </Box>
                                                <Box
                                                    bg="orange.100"
                                                    px={4}
                                                    py={1}
                                                    rounded="md"
                                                    mt={1}
                                                >
                                                    <Text color="#E62E05" fontSize="sm">
                                                        {member.role}
                                                    </Text>
                                                </Box>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                ))}
                            </VStack>
                        </Box>
                    </Container>
                </Box>

                {/* Footer Section */}
                <Box bg="orange.100" py={8} px={6}>
                    <Container maxW="container.lg">
                        <VStack>
                            {/* Logo section */}
                            <HStack space={8} justifyContent="center" flexWrap="wrap">
                                {/* Placeholder for Logo 1 */}
                                <Box
                                    w={24}
                                    h={24}
                                    rounded="md"
                                    mb={{ base: 4, md: 0 }}
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Image
                                        source={require("../assets/logotelkom.png")}
                                        w="24"
                                        h="10"
                                        alt="Netris Logo"
                                        mr={"3"}
                                    />
                                </Box>


                                {/* Placeholder for Logo 2 */}
                                <Box
                                    w={24}
                                    h={24}
                                    rounded="md"
                                    mb={{ base: 4, md: 0 }}
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Image
                                        source={require("../assets/logosi.png")}
                                        w="24"
                                        h="10"
                                        alt="Netris Logo"
                                        mr={"3"}
                                    />
                                </Box>

                                {/* Placeholder for Logo 3 */}
                                <Box
                                    w={24}
                                    h={24}
                                    rounded="md"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Image
                                        source={require("../assets/netrislogo.png")}
                                        w="12"
                                        h="12"
                                        alt="Netris Logo"
                                        mr={"3"}
                                    />
                                </Box>
                            </HStack>

                            {/* Copyright */}
                            <Text color="gray.400" fontSize="sm" textAlign="center">
                                © {new Date().getFullYear()} Netris. Seluruh hak cipta dilindungi.
                            </Text>
                        </VStack>
                    </Container>
                </Box>
            </ScrollView >
        </>
    );
}

export default About;