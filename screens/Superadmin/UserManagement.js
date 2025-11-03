import React, { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    VStack,
    Text,
    HStack,
    Button,
    ScrollView,
    Icon,
    useToast,
    Center,
    Circle,
    Badge,
    Modal,
    FormControl,
    Select,
    CheckIcon,
    Divider,
    Pressable,
    AlertDialog,
    Skeleton
} from 'native-base';
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components";
import { FIREBASE_DB } from '../../src/config/FIREBASE';
import { ref, get, update } from 'firebase/database';
import { getData } from '../../utils/localStorage';

const UserManagementScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const toast = useToast();

    const roleOptions = [
        { label: 'Administrator', value: 'admin' },
        { label: 'Pengguna', value: 'pengguna' }
    ];

    useEffect(() => {
        getCurrentUser();
        fetchUsers();
    }, []);

    const getCurrentUser = async () => {
        try {
            const userData = await getData('user');
            setCurrentUser(userData);
        } catch (error) {
            console.log('Error getting current user:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const usersRef = ref(FIREBASE_DB, 'users');
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const usersList = Object.keys(usersData).map(uid => ({
                    uid,
                    ...usersData[uid]
                }));
                
                // Sort by creation date (newest first)
                usersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUsers(usersList);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.log('Error fetching users:', error);
            toast.show({
                title: "Error",
                description: "Gagal mengambil data pengguna",
                status: "error",
                placement: "top"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
    };

    const updateUserRole = async () => {
        if (!selectedUser || !newRole) return;

        try {
            setIsUpdating(true);
            const userRef = ref(FIREBASE_DB, `users/${selectedUser.uid}`);
            await update(userRef, { 
                role: newRole,
                updatedAt: new Date().toISOString()
            });

            // Update local state
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.uid === selectedUser.uid 
                        ? { ...user, role: newRole }
                        : user
                )
            );

            toast.show({
                title: "Berhasil",
                description: `Role ${selectedUser.nama} berhasil diubah menjadi ${newRole === 'admin' ? 'Administrator' : 'Pengguna'}`,
                status: "success",
                placement: "top"
            });

            setShowRoleModal(false);
            setSelectedUser(null);
            setNewRole('');
        } catch (error) {
            console.log('Error updating user role:', error);
            toast.show({
                title: "Error",
                description: "Gagal mengubah role pengguna",
                status: "error",
                placement: "top"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return '#E62E05';
            case 'pengguna':
                return '#0891B2';
            default:
                return '#6B7280';
        }
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'pengguna':
                return 'Pengguna';
            default:
                return role;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '-';
        }
    };

    const UserCard = ({ user }) => (
        <Box bg="white" rounded="lg" shadow={2} p={4} mb={3}>
            <HStack space={3} alignItems="center">
                {/* Avatar */}
                <Circle size="60px" bg="#E62E05" borderWidth={2} borderColor="#E62E05">
                    <Icon
                        as={Ionicons}
                        name="person"
                        size="lg"
                        color="white"
                    />
                </Circle>

                {/* User Info */}
                <VStack flex={1} space={1}>
                    <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack flex={1}>
                            <Text fontSize="md" fontWeight="bold" color="coolGray.800">
                                {user.nama}
                            </Text>
                            <Text fontSize="sm" color="coolGray.600">
                                {user.email}
                            </Text>
                            {user.phoneNumber && (
                                <Text fontSize="xs" color="coolGray.500">
                                    {user.phoneNumber}
                                </Text>
                            )}
                        </VStack>
                        
                        {/* Role Badge */}
                        <Badge
                            bg={getRoleBadgeColor(user.role)}
                            _text={{ color: 'white', fontSize: 'xs', fontWeight: 'bold' }}
                            rounded="full"
                            px={3}
                            py={1}
                        >
                            {getRoleDisplayName(user.role)}
                        </Badge>
                    </HStack>

                    {/* Action Buttons */}
                    <HStack space={2} mt={2}>
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="#E62E05"
                            _text={{ color: "#E62E05", fontSize: "xs" }}
                            leftIcon={<Icon as={Ionicons} name="person-outline" size="xs" />}
                            onPress={() => handleRoleChange(user)}
                            isDisabled={currentUser?.uid === user.uid}
                        >
                            Ubah Role
                        </Button>
                    </HStack>

                    {/* Created Date */}
                    <Text fontSize="xs" color="coolGray.400" mt={1}>
                        Bergabung: {formatDate(user.createdAt)}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );

    const LoadingSkeleton = () => (
        <VStack space={3}>
            {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item} bg="white" rounded="lg" shadow={2} p={4}>
                    <HStack space={3} alignItems="center">
                        <Skeleton rounded="full" size="60px" />
                        <VStack flex={1} space={2}>
                            <Skeleton h="4" rounded="md" />
                            <Skeleton h="3" rounded="md" w="70%" />
                            <Skeleton h="3" rounded="md" w="50%" />
                        </VStack>
                    </HStack>
                </Box>
            ))}
        </VStack>
    );

    return (
        <>
            <Header title={"Kelola Pengguna"} />
            <Box flex={1} bg="#F7FAFC">
                <ScrollView px={4} py={4}>
                    {/* Header Stats */}
                    <Box bg="white" rounded="lg" shadow={1} p={4} mb={4}>
                        <HStack justifyContent="space-around" alignItems="center">
                            <VStack alignItems="center">
                                <Text fontSize="xl" fontWeight="bold" color="#E62E05">
                                    {users.length}
                                </Text>
                                <Text fontSize="sm" color="coolGray.600">
                                    Total Pengguna
                                </Text>
                            </VStack>
                            <Divider orientation="vertical" />
                            <VStack alignItems="center">
                                <Text fontSize="xl" fontWeight="bold" color="#E62E05">
                                    {users.filter(u => u.role === 'admin').length}
                                </Text>
                                <Text fontSize="sm" color="coolGray.600">
                                    Administrator
                                </Text>
                            </VStack>
                            <Divider orientation="vertical" />
                            <VStack alignItems="center">
                                <Text fontSize="xl" fontWeight="bold" color="#E62E05">
                                    {users.filter(u => u.role === 'pengguna').length}
                                </Text>
                                <Text fontSize="sm" color="coolGray.600">
                                    Pengguna
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>

                    {/* Refresh Button */}
                    <HStack justifyContent="space-between" alignItems="center" mb={4}>
                        <Heading size="md" color="coolGray.800">
                            Daftar Pengguna
                        </Heading>
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="#E62E05"
                            _text={{ color: "#E62E05" }}
                            leftIcon={<Icon as={Ionicons} name="refresh-outline" size="sm" />}
                            onPress={fetchUsers}
                            isLoading={isLoading}
                        >
                            Refresh
                        </Button>
                    </HStack>

                    {/* Users List */}
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : users.length === 0 ? (
                        <Center py={8}>
                            <Icon
                                as={Ionicons}
                                name="people-outline"
                                size="4xl"
                                color="coolGray.400"
                                mb={3}
                            />
                            <Text fontSize="lg" color="coolGray.500">
                                Tidak ada pengguna
                            </Text>
                        </Center>
                    ) : (
                        <VStack space={0}>
                            {users.map((user) => (
                                <UserCard key={user.uid} user={user} />
                            ))}
                        </VStack>
                    )}
                </ScrollView>

                {/* Role Change Modal */}
                <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)}>
                    <Modal.Content maxWidth="400px">
                        <Modal.CloseButton />
                        <Modal.Header>Ubah Role Pengguna</Modal.Header>
                        <Modal.Body>
                            <VStack space={4}>
                                <Text>
                                    Ubah role untuk: <Text fontWeight="bold">{selectedUser?.nama}</Text>
                                </Text>
                                
                                <FormControl>
                                    <FormControl.Label>Pilih Role</FormControl.Label>
                                    <Select
                                        selectedValue={newRole}
                                        minWidth="200"
                                        accessibilityLabel="Pilih Role"
                                        placeholder="Pilih Role"
                                        _selectedItem={{
                                            bg: "#E62E05",
                                            endIcon: <CheckIcon size="5" color="white" />
                                        }}
                                        onValueChange={setNewRole}
                                    >
                                        {roleOptions.map((option) => (
                                            <Select.Item
                                                key={option.value}
                                                label={option.label}
                                                value={option.value}
                                            />
                                        ))}
                                    </Select>
                                </FormControl>
                            </VStack>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button.Group space={2}>
                                <Button
                                    variant="ghost"
                                    colorScheme="blueGray"
                                    onPress={() => setShowRoleModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    bg="#E62E05"
                                    onPress={updateUserRole}
                                    isLoading={isUpdating}
                                    isDisabled={!newRole || newRole === selectedUser?.role}
                                >
                                    Simpan
                                </Button>
                            </Button.Group>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
            </Box>
        </>
    );
};

export default UserManagementScreen;