import React, { useState, useEffect } from 'react';
import {
    Box,
    ScrollView,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    Select,
    CheckIcon,
    Badge,
    Divider,
    Center,
    Spinner,
    Icon,
    Progress,
    Pressable,
    Circle,
    Modal,
    FormControl,
    Input,
    useToast,
    Alert,
    CloseIcon,
    Skeleton
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Header } from "../../components";
import { getAllTambalBanData } from '../../src/config/tambalBanAPI';
import { getData } from '../../utils/localStorage';

const COLORS = {
    primary: "#E62E05",
    secondary: "#FFD600",
    accent: "#000000",
    text: "#333333",
    light: "#FFFFFF"
};

// Date Picker Component
const CustomDatePicker = ({ 
    value, 
    onDateChange, 
    placeholder = "Pilih Tanggal",
    minimumDate = null,
    maximumDate = null 
}) => {
    const [show, setShow] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

    const onChange = (event, date) => {
        const currentDate = date || selectedDate;
        setShow(Platform.OS === 'ios');
        setSelectedDate(currentDate);
        
        if (date) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            onDateChange(formattedDate);
        }
    };

    const showDatepicker = () => {
        setShow(true);
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return placeholder;
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return placeholder;
        }
    };

    return (
        <VStack space={2}>
            <Pressable onPress={showDatepicker}>
                <Box
                    borderWidth={1}
                    borderColor="gray.300"
                    rounded="md"
                    px={3}
                    py={3}
                    bg="white"
                    _focus={{
                        borderColor: COLORS.primary,
                        borderWidth: 2
                    }}
                >
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text color={value ? "gray.800" : "gray.500"}>
                            {formatDisplayDate(value)}
                        </Text>
                        <Icon as={Ionicons} name="calendar-outline" size="sm" color="gray.500" />
                    </HStack>
                </Box>
            </Pressable>
            
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={selectedDate}
                    mode="date"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            )}
        </VStack>
    );
};

const UserManagementScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [tambalBanData, setTambalBanData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('bulan');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [showCustomDateModal, setShowCustomDateModal] = useState(false);
    const [userStats, setUserStats] = useState([]);
    const [totalStats, setTotalStats] = useState({});
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [showUserDetailModal, setShowUserDetailModal] = useState(false);
    
    const toast = useToast();

    const periodOptions = [
        { label: 'Hari Ini', value: 'hari' },
        { label: 'Minggu Ini', value: 'minggu' },
        { label: 'Bulan Ini', value: 'bulan' },
        { label: 'Tahun Ini', value: 'tahun' },
        { label: 'Semua Waktu', value: 'semua' },
        { label: 'Custom', value: 'custom' }
    ];

    useEffect(() => {
        fetchData();
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (tambalBanData.length > 0) {
            filterDataByPeriod();
        }
    }, [selectedPeriod, tambalBanData, customDateRange]);

    const getCurrentUser = async () => {
        try {
            const userData = await getData('user');
            setCurrentUser(userData);
        } catch (error) {
            console.log('Error getting current user:', error);
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await getAllTambalBanData();
            
            // Filter data yang memiliki informasi penambah
            const dataWithContributor = data.filter(item => 
                item.ditambahkan_oleh && item.tanggal_ditambahkan
            );
            
            setTambalBanData(dataWithContributor);
        } catch (error) {
            console.error('Error fetching tambal ban data:', error);
            toast.show({
                title: "Error",
                description: "Gagal mengambil data tambal ban",
                status: "error",
                placement: "top"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi helper untuk mendapatkan tanggal dengan timezone lokal
    const getLocalDate = (date = new Date()) => {
        const localDate = new Date(date);
        localDate.setHours(0, 0, 0, 0);
        return localDate;
    };

    // Fungsi untuk mendapatkan akhir hari
    const getEndOfDay = (date) => {
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        return endDate;
    };

    // Fungsi untuk mendapatkan awal minggu (Senin)
    const getStartOfWeek = (date) => {
        const startDate = new Date(date);
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        return startDate;
    };

    // Fungsi untuk mendapatkan akhir minggu (Minggu)
    const getEndOfWeek = (date) => {
        const endDate = new Date(date);
        const day = endDate.getDay();
        const diff = endDate.getDate() + (7 - day);
        endDate.setDate(diff);
        endDate.setHours(23, 59, 59, 999);
        return endDate;
    };

    const filterDataByPeriod = () => {
        const now = new Date();
        let startDate, endDate;

        switch (selectedPeriod) {
            case 'hari':
                startDate = getLocalDate(now);
                endDate = getEndOfDay(now);
                break;
                
            case 'minggu':
                startDate = getStartOfWeek(now);
                endDate = getEndOfWeek(now);
                break;
                
            case 'bulan':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
                
            case 'tahun':
                startDate = new Date(now.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now.getFullYear(), 11, 31);
                endDate.setHours(23, 59, 59, 999);
                break;
                
            case 'custom':
                if (customDateRange.startDate && customDateRange.endDate) {
                    startDate = new Date(customDateRange.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(customDateRange.endDate);
                    endDate.setHours(23, 59, 59, 999);
                } else {
                    setFilteredData(tambalBanData);
                    calculateStats(tambalBanData);
                    return;
                }
                break;
                
            case 'semua':
            default:
                setFilteredData(tambalBanData);
                calculateStats(tambalBanData);
                return;
        }

        // Filter data berdasarkan tanggal
        const filtered = tambalBanData.filter(item => {
            if (!item.tanggal_ditambahkan) return false;
            
            const itemDate = new Date(item.tanggal_ditambahkan);
            return itemDate >= startDate && itemDate <= endDate;
        });

        console.log(`Filter ${selectedPeriod}:`, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            totalData: tambalBanData.length,
            filteredData: filtered.length
        });

        setFilteredData(filtered);
        calculateStats(filtered);
    };

    const calculateStats = (data) => {
        // Group by user
        const userGroups = {};
        
        data.forEach(item => {
            const key = item.uid_penambah || item.email_penambah || item.ditambahkan_oleh;
            
            if (!userGroups[key]) {
                userGroups[key] = {
                    uid: item.uid_penambah || '',
                    nama: item.ditambahkan_oleh || 'Unknown',
                    email: item.email_penambah || '',
                    role: item.role_penambah || '',
                    totalData: 0,
                    statusBreakdown: {
                        aktif: 0,
                        pending: 0,
                        rejected: 0,
                        pending_deletion: 0
                    },
                    items: []
                };
            }
            
            userGroups[key].totalData++;
            userGroups[key].statusBreakdown[item.status] = 
                (userGroups[key].statusBreakdown[item.status] || 0) + 1;
            userGroups[key].items.push(item);
        });

        // Convert to array and sort by total data
        const userStatsArray = Object.values(userGroups).sort(
            (a, b) => b.totalData - a.totalData
        );

        // Calculate total stats
        const total = {
            totalData: data.length,
            totalUsers: userStatsArray.length,
            statusBreakdown: {
                aktif: data.filter(item => item.status === 'aktif').length,
                pending: data.filter(item => item.status === 'pending').length,
                rejected: data.filter(item => item.status === 'rejected').length,
                pending_deletion: data.filter(item => item.status === 'pending_deletion').length
            }
        };

        setUserStats(userStatsArray);
        setTotalStats(total);
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

    const getPeriodLabel = () => {
        const now = new Date();
        switch (selectedPeriod) {
            case 'hari':
                return `Hari Ini - ${now.toLocaleDateString('id-ID')}`;
            case 'minggu':
                const startOfWeek = getStartOfWeek(now);
                const endOfWeek = getEndOfWeek(now);
                return `Minggu Ini - ${startOfWeek.toLocaleDateString('id-ID')} s/d ${endOfWeek.toLocaleDateString('id-ID')}`;
            case 'bulan':
                return `Bulan Ini - ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
            case 'tahun':
                return `Tahun Ini - ${now.getFullYear()}`;
            case 'custom':
                if (customDateRange.startDate && customDateRange.endDate) {
                    return `Custom - ${new Date(customDateRange.startDate).toLocaleDateString('id-ID')} s/d ${new Date(customDateRange.endDate).toLocaleDateString('id-ID')}`;
                }
                return 'Custom - Pilih Tanggal';
            case 'semua':
            default:
                return 'Semua Waktu';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'aktif':
                return 'success.500';
            case 'pending':
                return 'warning.500';
            case 'rejected':
                return 'error.500';
            case 'pending_deletion':
                return 'info.500';
            default:
                return 'gray.500';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'aktif':
                return 'Aktif';
            case 'pending':
                return 'Pending';
            case 'rejected':
                return 'Ditolak';
            case 'pending_deletion':
                return 'Pending Hapus';
            default:
                return status;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
            case 'superadmin':
                return COLORS.primary;
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
            case 'superadmin':
                return 'Super Admin';
            case 'pengguna':
                return 'Pengguna';
            default:
                return role || 'Unknown';
        }
    };

    const showUserDetail = (user) => {
        setSelectedUserDetail(user);
        setShowUserDetailModal(true);
    };

    const handleCustomDateSubmit = () => {
        if (!customDateRange.startDate || !customDateRange.endDate) {
            toast.show({
                title: "Error",
                description: "Pilih tanggal mulai dan tanggal akhir",
                status: "error",
                placement: "top"
            });
            return;
        }

        const startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        
        if (startDate > endDate) {
            toast.show({
                title: "Error", 
                description: "Tanggal mulai harus lebih kecil dari tanggal akhir",
                status: "error",
                placement: "top"
            });
            return;
        }

        // Validasi rentang tanggal maksimal (misal 1 tahun)
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 365) {
            toast.show({
                title: "Peringatan",
                description: "Rentang tanggal maksimal 1 tahun",
                status: "warning",
                placement: "top"
            });
            return;
        }

        setShowCustomDateModal(false);
        toast.show({
            title: "Berhasil",
            description: `Filter diterapkan untuk ${diffDays + 1} hari`,
            status: "success",
            placement: "top"
        });
    };

    const resetCustomDate = () => {
        setCustomDateRange({
            startDate: '',
            endDate: ''
        });
    };

    const setQuickDateRange = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        setCustomDateRange({
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        });
    };

    const LoadingSkeleton = () => (
        <VStack space={3}>
            <Skeleton h="100px" rounded="lg" />
            <Skeleton h="60px" rounded="lg" />
            {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} h="80px" rounded="lg" />
            ))}
        </VStack>
    );

    if (isLoading) {
        return (
            <>
                <Header title="Laporan Kontribusi" />
                <Box flex={1} bg="#F7FAFC" p={4}>
                    <LoadingSkeleton />
                </Box>
            </>
        );
    }

    return (
        <>
            <Header title="Laporan Kontribusi" />
            <Box flex={1} bg="#F7FAFC">
                <ScrollView px={4} py={4}>
                    <VStack space={4}>
                        {/* Filter Period */}
                        <Box bg="white" rounded="lg" shadow={1} p={4}>
                            <HStack justifyContent="space-between" alignItems="center" mb={3}>
                                <Heading size="md" color={COLORS.text}>
                                    Filter Periode
                                </Heading>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    borderColor={COLORS.primary}
                                    _text={{ color: COLORS.primary }}
                                    leftIcon={<Icon as={Ionicons} name="refresh-outline" size="sm" />}
                                    onPress={fetchData}
                                >
                                    Refresh
                                </Button>
                            </HStack>
                            
                            <VStack space={3}>
                                <Select
                                    selectedValue={selectedPeriod}
                                    onValueChange={(value) => {
                                        setSelectedPeriod(value);
                                        if (value === 'custom') {
                                            setShowCustomDateModal(true);
                                        }
                                    }}
                                    _selectedItem={{
                                        bg: COLORS.primary,
                                        endIcon: <CheckIcon size={5} color="white" />
                                    }}
                                >
                                    {periodOptions.map((option) => (
                                        <Select.Item
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                        />
                                    ))}
                                </Select>
                                
                                <Box bg="gray.50" rounded="md" p={3}>
                                    <Text fontSize="sm" color="gray.600" textAlign="center">
                                        {getPeriodLabel()}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                                        Menampilkan {filteredData.length} dari {tambalBanData.length} total data
                                    </Text>
                                </Box>
                            </VStack>
                        </Box>

                        {/* Overall Statistics */}
                        <Box bg="white" rounded="lg" shadow={1} p={4}>
                            <Heading size="md" color={COLORS.text} mb={4}>
                                Statistik Keseluruhan
                            </Heading>
                            
                            <VStack space={3}>
                                <HStack justifyContent="space-around" alignItems="center">
                                    <VStack alignItems="center">
                                        <Text fontSize="2xl" fontWeight="bold" color={COLORS.primary}>
                                            {totalStats.totalData || 0}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Total Data
                                        </Text>
                                    </VStack>
                                    <Divider orientation="vertical" />
                                    <VStack alignItems="center">
                                        <Text fontSize="2xl" fontWeight="bold" color={COLORS.primary}>
                                            {totalStats.totalUsers || 0}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Kontributor
                                        </Text>
                                    </VStack>
                                    <Divider orientation="vertical" />
                                    <VStack alignItems="center">
                                        <Text fontSize="2xl" fontWeight="bold" color={COLORS.primary}>
                                            {userStats.length > 0 ? Math.round(totalStats.totalData / totalStats.totalUsers) : 0}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Rata-rata
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </Box>

                        {/* User Rankings */}
                        <Box bg="white" rounded="lg" shadow={1} p={4}>
                            <Heading size="md" color={COLORS.text} mb={4}>
                                Ranking Kontributor
                            </Heading>
                            
                            {userStats.length === 0 ? (
                                <Center py={8}>
                                    <Icon
                                        as={Ionicons}
                                        name="document-outline"
                                        size="4xl"
                                        color="gray.400"
                                        mb={3}
                                    />
                                    <Text fontSize="lg" color="gray.500">
                                        Tidak ada data pada periode ini
                                    </Text>
                                    <Text fontSize="sm" color="gray.400" mt={2}>
                                        Coba ubah filter periode
                                    </Text>
                                </Center>
                            ) : (
                                <VStack space={3}>
                                    {userStats.map((user, index) => (
                                        <Pressable
                                            key={user.uid || user.email || index}
                                            onPress={() => showUserDetail(user)}
                                        >
                                            <Box
                                                bg={index < 3 ? "gray.50" : "white"}
                                                borderWidth={1}
                                                borderColor={index < 3 ? COLORS.primary : "gray.200"}
                                                rounded="lg"
                                                p={3}
                                            >
                                                <HStack space={3} alignItems="center">
                                                    {/* Ranking */}
                                                    <Circle
                                                        size="40px"
                                                        bg={index === 0 ? "#FFD700" : 
                                                            index === 1 ? "#C0C0C0" : 
                                                            index === 2 ? "#CD7F32" : COLORS.primary}
                                                    >
                                                        <Text
                                                            fontSize="md"
                                                            fontWeight="bold"
                                                            color={index < 3 ? "white" : "white"}
                                                        >
                                                            {index + 1}
                                                        </Text>
                                                    </Circle>

                                                    {/* User Info */}
                                                    <VStack flex={1} space={1}>
                                                        <HStack justifyContent="space-between" alignItems="center">
                                                            <Text fontSize="md" fontWeight="bold" color="gray.800" flex={1}>
                                                                {user.nama}
                                                            </Text>
                                                            <Badge
                                                                bg={getRoleColor(user.role)}
                                                                _text={{ color: 'white', fontSize: 'xs' }}
                                                                rounded="full"
                                                                px={2}
                                                                py={1}
                                                            >
                                                                {getRoleDisplayName(user.role)}
                                                            </Badge>
                                                        </HStack>
                                                        
                                                        <Text fontSize="sm" color="gray.600">
                                                            {user.email}
                                                        </Text>
                                                        
                                                        <HStack justifyContent="space-between" alignItems="center" mt={1}>
                                                            <Text fontSize="lg" fontWeight="bold" color={COLORS.primary}>
                                                                {user.totalData} data
                                                            </Text>
                                                            
                                                            {/* Progress Bar */}
                                                            <VStack space={1} flex={1} ml={3}>
                                                                <Progress
                                                                    value={(user.totalData / userStats[0].totalData) * 100}
                                                                    colorScheme="red"
                                                                    size="sm"
                                                                />
                                                                <Text fontSize="xs" color="gray.500" textAlign="right">
                                                                    {Math.round((user.totalData / totalStats.totalData) * 100)}%
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                            </Box>
                                        </Pressable>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    </VStack>
                </ScrollView>

                {/* Custom Date Range Modal */}
                <Modal isOpen={showCustomDateModal} onClose={() => setShowCustomDateModal(false)}>
                    <Modal.Content maxWidth="400px">
                        <Modal.CloseButton />
                        <Modal.Header>Pilih Rentang Tanggal</Modal.Header>
                        <Modal.Body>
                            <VStack space={4}>
                                {/* Quick Date Options */}
                                <VStack space={2}>
                                    <Text fontSize="sm" fontWeight="bold" color="gray.700">
                                        Pilihan Cepat:
                                    </Text>
                                    <HStack space={2} flexWrap="wrap">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onPress={() => setQuickDateRange(7)}
                                            borderColor={COLORS.primary}
                                            _text={{ color: COLORS.primary, fontSize: 'xs' }}
                                        >
                                            7 Hari
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onPress={() => setQuickDateRange(30)}
                                            borderColor={COLORS.primary}
                                            _text={{ color: COLORS.primary, fontSize: 'xs' }}
                                        >
                                            30 Hari
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onPress={() => setQuickDateRange(90)}
                                            borderColor={COLORS.primary}
                                            _text={{ color: COLORS.primary, fontSize: 'xs' }}
                                        >
                                            90 Hari
                                        </Button>
                                    </HStack>
                                </VStack>
                                
                                <Divider />
                                
                                <FormControl>
                                    <FormControl.Label>Tanggal Mulai</FormControl.Label>
                                    <CustomDatePicker
                                        value={customDateRange.startDate}
                                        onDateChange={(date) => 
                                            setCustomDateRange({...customDateRange, startDate: date})
                                        }
                                        placeholder="Pilih tanggal mulai"
                                        maximumDate={customDateRange.endDate ? new Date(customDateRange.endDate) : new Date()}
                                    />
                                </FormControl>
                                
                                <FormControl>
                                    <FormControl.Label>Tanggal Akhir</FormControl.Label>
                                    <CustomDatePicker
                                        value={customDateRange.endDate}
                                        onDateChange={(date) => 
                                            setCustomDateRange({...customDateRange, endDate: date})
                                        }
                                        placeholder="Pilih tanggal akhir"
                                        minimumDate={customDateRange.startDate ? new Date(customDateRange.startDate) : null}
                                        maximumDate={new Date()}
                                    />
                                </FormControl>
                                
                                {customDateRange.startDate && customDateRange.endDate && (
                                    <Box bg="blue.50" rounded="md" p={3}>
                                        <Text fontSize="sm" color="blue.700" textAlign="center">
                                            Rentang: {Math.ceil((new Date(customDateRange.endDate) - new Date(customDateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1} hari
                                        </Text>
                                    </Box>
                                )}
                            </VStack>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button.Group space={2}>
                                <Button
                                    variant="ghost"
                                    colorScheme="blueGray"
                                    onPress={resetCustomDate}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="ghost"
                                    colorScheme="blueGray"
                                    onPress={() => setShowCustomDateModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    bg={COLORS.primary}
                                    onPress={handleCustomDateSubmit}
                                >
                                    Terapkan
                                </Button>
                            </Button.Group>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>

                {/* User Detail Modal */}
                <Modal isOpen={showUserDetailModal} onClose={() => setShowUserDetailModal(false)} size="lg">
                    <Modal.Content maxWidth="90%">
                        <Modal.CloseButton />
                        <Modal.Header>
                            Detail Kontribusi - {selectedUserDetail?.nama}
                        </Modal.Header>
                        <Modal.Body>
                            {selectedUserDetail && (
                                <VStack space={4}>
                                    {/* User Info */}
                                    <Box bg="gray.50" rounded="lg" p={3}>
                                        <VStack space={2}>
                                            <HStack justifyContent="space-between">
                                                <Text fontWeight="bold">Email:</Text>
                                                <Text>{selectedUserDetail.email}</Text>
                                            </HStack>
                                            <HStack justifyContent="space-between">
                                                <Text fontWeight="bold">Role:</Text>
                                                <Badge
                                                    bg={getRoleColor(selectedUserDetail.role)}
                                                    _text={{ color: 'white', fontSize: 'xs' }}
                                                    rounded="full"
                                                >
                                                    {getRoleDisplayName(selectedUserDetail.role)}
                                                </Badge>
                                            </HStack>
                                            <HStack justifyContent="space-between">
                                                <Text fontWeight="bold">Total Data:</Text>
                                                <Text color={COLORS.primary} fontWeight="bold">
                                                    {selectedUserDetail.totalData}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    {/* Status Breakdown */}
                                    <VStack space={2}>
                                        <Text fontWeight="bold">Breakdown Status:</Text>
                                        {Object.entries(selectedUserDetail.statusBreakdown).map(([status, count]) => (
                                            count > 0 && (
                                                <HStack key={status} justifyContent="space-between" alignItems="center">
                                                    <Badge
                                                        bg={getStatusColor(status)}
                                                        _text={{ color: 'white', fontSize: 'xs' }}
                                                        rounded="full"
                                                        px={3}
                                                        py={1}
                                                    >
                                                        {getStatusLabel(status)}
                                                    </Badge>
                                                    <Text fontWeight="bold">{count} data</Text>
                                                </HStack>
                                            )
                                        ))}
                                    </VStack>

                                    {/* All Data Section */}
                                    <VStack space={2}>
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text fontWeight="bold">Semua Data ({selectedUserDetail.items.length}):</Text>
                                            <Text fontSize="xs" color="gray.500">
                                                Diurutkan berdasarkan tanggal terbaru
                                            </Text>
                                        </HStack>
                                        
                                        <ScrollView maxH="300px">
                                            <VStack space={2}>
                                                {selectedUserDetail.items
                                                    .sort((a, b) => new Date(b.tanggal_ditambahkan) - new Date(a.tanggal_ditambahkan))
                                                    .map((item, index) => (
                                                    <Box key={index} bg="white" rounded="md" p={2} borderWidth={1} borderColor="gray.200">
                                                        <HStack justifyContent="space-between" alignItems="center">
                                                            <VStack flex={1}>
                                                                <Text fontSize="sm" fontWeight="bold" numberOfLines={1}>
                                                                    {item.nama}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.600">
                                                                    {formatDate(item.tanggal_ditambahkan)}
                                                                </Text>
                                                            </VStack>
                                                            <Badge
                                                                bg={getStatusColor(item.status)}
                                                                _text={{ color: 'white', fontSize: 'xs' }}
                                                                rounded="full"
                                                            >
                                                                {getStatusLabel(item.status)}
                                                            </Badge>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </ScrollView>
                                    </VStack>
                                </VStack>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                bg={COLORS.primary}
                                onPress={() => setShowUserDetailModal(false)}
                            >
                                Tutup
                            </Button>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
            </Box>
        </>
    );
};

export default UserManagementScreen;