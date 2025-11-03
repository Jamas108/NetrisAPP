import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Text, 
  HStack, 
  Center,
  Circle,
  Icon,
  Divider,
  Progress,
  Button,
  ScrollView,
  Spinner
} from 'native-base';
import { Ionicons } from "@expo/vector-icons";
import { getData } from '../../utils/localStorage';

const AdminReports = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const data = await getData('user');
      setUserData(data);
    };

    const fetchReportData = async () => {
      // Simulate fetching report data
      setTimeout(() => {
        const mockData = {
          totalUsers: 142,
          activeUsers: 118,
          pendingUsers: 24,
          userGrowth: 12.5,
          transactions: 268,
          transactionTotal: 8750000,
          transactionAverage: 32650,
          periodComparison: 8.3
        };
        setReportData(mockData);
        setLoading(false);
      }, 1500);
    };
    
    getUserData();
    fetchReportData();
  }, []);

  if (loading) {
    return (
      <Center flex={1} bg="white">
        <Spinner size="lg" color="#E62E05" />
        <Text mt={2} color="coolGray.500">Memuat laporan...</Text>
      </Center>
    );
  }

  return (
    <ScrollView bg="white">
      <Box flex={1} safeAreaTop px={4} py={6}>
        <Heading size="lg" color="#E62E05" mb={4}>
          Laporan
        </Heading>
        
        <HStack space={4} mb={4} flexWrap="wrap">
          {/* User Stats Card */}
          <Box 
            bg="white" 
            rounded="md" 
            shadow={2} 
            p={4} 
            mb={4}
            width="100%"
          >
            <HStack alignItems="center" space={2} mb={2}>
              <Icon as={Ionicons} name="people" size="sm" color="#E62E05" />
              <Heading size="sm">Statistik Pengguna</Heading>
            </HStack>
            
            <Divider mb={4} />
            
            <HStack space={3} justifyContent="space-between" mb={4}>
              <VStack space={1} flex={1}>
                <Text color="coolGray.500" fontSize="xs">Total Pengguna</Text>
                <Heading size="md">{reportData.totalUsers}</Heading>
              </VStack>
              
              <VStack space={1} flex={1}>
                <Text color="coolGray.500" fontSize="xs">Pengguna Aktif</Text>
                <Heading size="md">{reportData.activeUsers}</Heading>
              </VStack>
              
              <VStack space={1} flex={1}>
                <Text color="coolGray.500" fontSize="xs">Menunggu Persetujuan</Text>
                <Heading size="md">{reportData.pendingUsers}</Heading>
              </VStack>
            </HStack>
            
            <Text fontSize="xs" color="coolGray.500" mb={1}>Persentase Pengguna Aktif</Text>
            <Progress 
              value={(reportData.activeUsers / reportData.totalUsers) * 100} 
              colorScheme="red" 
              bg="coolGray.200"
              size="md"
              mb={2}
            />
            
            <HStack alignItems="center" space={1} mt={2}>
              <Icon 
                as={Ionicons} 
                name={reportData.userGrowth >= 0 ? "trending-up" : "trending-down"} 
                color={reportData.userGrowth >= 0 ? "green.500" : "red.500"} 
                size="sm" 
              />
              <Text 
                color={reportData.userGrowth >= 0 ? "green.500" : "red.500"} 
                fontWeight="bold"
              >
                {reportData.userGrowth}% 
              </Text>
              <Text color="coolGray.500" fontSize="xs">
                dibanding bulan lalu
              </Text>
            </HStack>
          </Box>
          
          {/* Transaction Stats Card */}
          <Box 
            bg="white" 
            rounded="md" 
            shadow={2} 
            p={4} 
            mb={4}
            width="100%"
          >
            <HStack alignItems="center" space={2} mb={2}>
              <Icon as={Ionicons} name="cash" size="sm" color="#E62E05" />
              <Heading size="sm">Statistik Transaksi</Heading>
            </HStack>
            
            <Divider mb={4} />
            
            <HStack space={3} justifyContent="space-between" mb={4}>
              <VStack space={1} flex={1}>
                <Text color="coolGray.500" fontSize="xs">Total Transaksi</Text>
                <Heading size="md">{reportData.transactions}</Heading>
              </VStack>
              
              <VStack space={1} flex={1}>
                <Text color="coolGray.500" fontSize="xs">Total Nilai (Rp)</Text>
                <Heading size="md">{(reportData.transactionTotal).toLocaleString()}</Heading>
              </VStack>
              
              <VStack space={1} flex={1}>
                <Text color="coolGray.500" fontSize="xs">Rata-rata (Rp)</Text>
                <Heading size="md">{(reportData.transactionAverage).toLocaleString()}</Heading>
              </VStack>
            </HStack>
            
            <HStack alignItems="center" space={1} mt={2}>
              <Icon 
                as={Ionicons} 
                name={reportData.periodComparison >= 0 ? "trending-up" : "trending-down"} 
                color={reportData.periodComparison >= 0 ? "green.500" : "red.500"} 
                size="sm" 
              />
              <Text 
                color={reportData.periodComparison >= 0 ? "green.500" : "red.500"} 
                fontWeight="bold"
              >
                {reportData.periodComparison}% 
              </Text>
              <Text color="coolGray.500" fontSize="xs">
                dibanding periode sebelumnya
              </Text>
            </HStack>
          </Box>
        </HStack>
        
        <HStack justifyContent="space-between" mb={4}>
          <Button 
            leftIcon={<Icon as={Ionicons} name="download-outline" size="sm" />}
            colorScheme="success"
          >
            Ekspor Laporan
          </Button>
          
          <Button 
            leftIcon={<Icon as={Ionicons} name="sync-outline" size="sm" />}
            variant="outline" 
            colorScheme="error"
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            Refresh
          </Button>
        </HStack>
        
        <Box bg="white" rounded="md" shadow={2} p={4} mb={4}>
          <Heading size="sm" mb={4}>Daftar Laporan</Heading>
          
          <VStack space={3} divider={<Divider />}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontWeight="bold">Laporan Bulanan Mei 2025</Text>
                <Text fontSize="xs" color="coolGray.500">Diterbitkan: 01/05/2025</Text>
              </VStack>
              <Button size="sm" leftIcon={<Icon as={Ionicons} name="eye-outline" size="sm" />}>
                Lihat
              </Button>
            </HStack>
            
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontWeight="bold">Laporan Bulanan April 2025</Text>
                <Text fontSize="xs" color="coolGray.500">Diterbitkan: 01/04/2025</Text>
              </VStack>
              <Button size="sm" leftIcon={<Icon as={Ionicons} name="eye-outline" size="sm" />}>
                Lihat
              </Button>
            </HStack>
            
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontWeight="bold">Laporan Bulanan Maret 2025</Text>
                <Text fontSize="xs" color="coolGray.500">Diterbitkan: 01/03/2025</Text>
              </VStack>
              <Button size="sm" leftIcon={<Icon as={Ionicons} name="eye-outline" size="sm" />}>
                Lihat
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default AdminReports;