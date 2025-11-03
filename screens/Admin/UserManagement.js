import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, Text, FlatList, HStack, Avatar, Spacer, Button } from 'native-base';
import { getData } from '../../utils/localStorage';
import { FIREBASE_DB } from '../../src/config/FIREBASE';

const UserManagement = () => {
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      const data = await getData('user');
      setUserData(data);
    };

    const fetchUsers = async () => {
      try {
        // Simulate fetching users from Firebase
        // In a real app, you would use Firebase's realtime listeners here
        setTimeout(() => {
          const mockUsers = [
            { 
              id: '1', 
              nama: 'Budi Santoso', 
              email: 'budi@example.com', 
              role: 'pengguna',
              status: 'active'
            },
            { 
              id: '2', 
              nama: 'Siti Nurhayati', 
              email: 'siti@example.com', 
              role: 'pengguna',
              status: 'active' 
            },
            { 
              id: '3', 
              nama: 'Joko Widodo', 
              email: 'joko@example.com', 
              role: 'pengguna',
              status: 'inactive' 
            },
          ];
          setUsers(mockUsers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    getUserData();
    fetchUsers();
  }, []);

  const renderItem = ({ item }) => (
    <Box 
      borderBottomWidth="1" 
      _dark={{ borderColor: "muted.50" }} 
      borderColor="muted.300" 
      pl={["0", "4"]} 
      pr={["0", "5"]} 
      py="2"
    >
      <HStack space={[2, 3]} justifyContent="space-between">
        <Avatar 
          size="48px" 
          source={{ uri: "https://via.placeholder.com/150" }}
        />
        <VStack>
          <Text bold>{item.nama}</Text>
          <Text color="coolGray.600">{item.email}</Text>
          <HStack space={2} mt={1}>
            <Text 
              fontSize="xs" 
              colorScheme={item.role === 'admin' ? "info" : "success"} 
              color={item.role === 'admin' ? "blue.500" : "coolGray.600"}
            >
              {item.role}
            </Text>
            <Text 
              fontSize="xs" 
              colorScheme={item.status === 'active' ? "success" : "error"} 
              color={item.status === 'active' ? "green.500" : "red.500"}
            >
              {item.status}
            </Text>
          </HStack>
        </VStack>
        <Spacer />
        <VStack alignItems="flex-end" space={2}>
          <Button size="sm" colorScheme="primary" variant="outline" height="30px">
            Edit
          </Button>
          <Button size="sm" colorScheme={item.status === 'active' ? "danger" : "success"} height="30px">
            {item.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </VStack>
      </HStack>
    </Box>
  );

  return (
    <Box flex={1} bg="white" safeAreaTop px={4} py={6}>
      <Heading size="lg" color="#E62E05" mb={4}>
        Manajemen Pengguna
      </Heading>
      
      <Box bg="white" rounded="md" shadow={2} mb={4} p={4}>
        <Text fontSize="md" mb={2}>Total Pengguna: {users.length}</Text>
        <Text fontSize="md">Pengguna Aktif: {users.filter(user => user.status === 'active').length}</Text>
      </Box>
      
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          // Re-fetch users here
          setTimeout(() => setLoading(false), 1000);
        }}
      />
    </Box>
  );
};

export default UserManagement;