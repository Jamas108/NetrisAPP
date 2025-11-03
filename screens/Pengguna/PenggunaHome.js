import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box, Text, Pressable, Image, HStack, VStack, Heading, Button, ScrollView, IconButton, Slide, Collapse, Fab, Spinner, Center, Modal, TextArea, FormControl, useToast, Input } from 'native-base';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Dimensions, FlatList, Platform, Linking } from 'react-native';
import { getAllTambalBanData, deleteTambalBanData } from '../../src/config/tambalBanAPI';
import { getCurrentUser } from '../../controllers/LoginController';
import { Header } from "../../components";
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

// Define tambal ban color theme
const COLORS = {
    primary: "#E62E05",    // Bright red (primary color)
    secondary: "#FFD600",  // Bright yellow (secondary color)
    accent: "#000000",     // Black (for contrast)
    text: "#333333",       // Dark gray for text
    light: "#FFFFFF"       // White
};

// MapTiler API key
const MAPTILER_API_KEY = 'ZDQbltfi4TOAQhQlCCJi';

// Permission request for location
import * as Location from 'expo-location';

// Custom Static Pin Marker Component - Memoized to prevent unnecessary re-renders
const StaticPinMarker = React.memo(({ onPress, itemId }) => {
    return (
        <Pressable onPress={onPress}>
            <Box alignItems="center">
                {/* Pin Head (Circle) */}
                <Box
                    width="40px"
                    height="40px"
                    bg={COLORS.primary}
                    borderRadius="full"
                    borderWidth={3}
                    borderColor={COLORS.secondary}
                    shadow={4}
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                >
                    <Ionicons name="build" size={20} color={COLORS.light} />
                </Box>
                
                {/* Pin Point (Triangle) */}
                <Box
                    width={0}
                    height={0}
                    borderLeftWidth="8px"
                    borderRightWidth="8px"
                    borderTopWidth="12px"
                    borderLeftColor="transparent"
                    borderRightColor="transparent"
                    borderTopColor={COLORS.primary}
                    marginTop="-1px"
                    shadow={2}
                />
                
                {/* Shadow under pin */}
                <Box
                    width="20px"
                    height="6px"
                    bg="rgba(0,0,0,0.15)"
                    borderRadius="full"
                    marginTop="2px"
                />
            </Box>
        </Pressable>
    );
});

// Add display name for debugging
StaticPinMarker.displayName = 'StaticPinMarker';

// MapTiler web content component
const MapTilerWebView = React.forwardRef(({ markers, onMarkerPress, onMapReady }, ref) => {
    // Default center coordinates (same as used in the Google Maps version)
    const defaultLatitude = -7.304905100569785;
    const defaultLongitude = 112.73611469554196;
    
    // Create HTML content for MapTiler
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.js"></script>
            <link href="https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.css" rel="stylesheet" />
            <style>
                body { margin: 0; padding: 0; }
                #map { position: absolute; top: 0; bottom: 0; width: 100%; }
                .marker {
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                }
                .marker-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .marker-head {
                    width: 40px;
                    height: 40px;
                    background-color: #E62E05;
                    border: 3px solid #FFD600;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    position: relative;
                    z-index: 2;
                }
                .marker-icon {
                    color: white;
                    font-size: 20px;
                }
                .marker-point {
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 12px solid #E62E05;
                    margin-top: -1px;
                    z-index: 1;
                }
                .marker-shadow {
                    width: 20px;
                    height: 6px;
                    background-color: rgba(0,0,0,0.15);
                    border-radius: 50%;
                    margin-top: 2px;
                }
                .maplibregl-popup {
                    max-width: 200px;
                }
                .user-location-marker {
                    width: 20px;
                    height: 20px;
                    background-color: #4285F4;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.3);
                    position: relative;
                }
                .user-location-pulse {
                    position: absolute;
                    top: -8px;
                    left: -8px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(66, 133, 244, 0.15);
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% {
                        transform: scale(0.9);
                        opacity: 1;
                    }
                    70% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                // Initialize the map
                const map = new maplibregl.Map({
                    container: 'map',
                    style: \`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}\`,
                    center: [${defaultLongitude}, ${defaultLatitude}],
                    zoom: 13
                });
                
                // Add navigation control (zoom buttons)
                map.addControl(new maplibregl.NavigationControl());
                
                // Initialize user location marker variable
                let userLocationMarker = null;
                
                // Add geolocate control
                const geolocateControl = new maplibregl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true
                });
                
                map.addControl(geolocateControl);
                
                // Add markers when map is loaded
                map.on('load', function() {
                    // Notify React Native that map is ready
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapReady'
                    }));
                    
                    // Add markers from data
                    const markers = ${JSON.stringify(markers)};
                    
                    markers.forEach((marker, index) => {
                        try {
                            // Create custom marker element
                            const el = document.createElement('div');
                            el.className = 'marker-container';
                            
                            const head = document.createElement('div');
                            head.className = 'marker-head';
                            
                            const icon = document.createElement('span');
                            icon.className = 'marker-icon';
                            icon.innerHTML = '🔧'; // Simple wrench emoji as fallback
                            
                            const point = document.createElement('div');
                            point.className = 'marker-point';
                            
                            const shadow = document.createElement('div');
                            shadow.className = 'marker-shadow';
                            
                            // Append elements
                            head.appendChild(icon);
                            el.appendChild(head);
                            el.appendChild(point);
                            el.appendChild(shadow);
                            
                            // Add opacity for pending deletion markers
                            if (marker.status === 'pending_deletion') {
                                el.style.opacity = '0.5';
                            }
                            
                            // Add marker to map
                            const markerObj = new maplibregl.Marker(el)
                                .setLngLat([parseFloat(marker.longitude), parseFloat(marker.latitude)])
                                .addTo(map);
                                
                            // Add click event
                            el.addEventListener('click', function() {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'markerClick',
                                    id: marker.id
                                }));
                            });
                        } catch (error) {
                            console.error("Error adding marker:", error);
                        }
                    });
                });
                
                // Function to add or update user location marker
                function updateUserLocationMarker(lng, lat) {
                    // Remove previous marker if exists
                    if (userLocationMarker) {
                        userLocationMarker.remove();
                    }
                    
                    // Create custom user location marker
                    const el = document.createElement('div');
                    el.className = 'user-location-marker';
                    
                    // Add pulse effect
                    const pulse = document.createElement('div');
                    pulse.className = 'user-location-pulse';
                    el.appendChild(pulse);
                    
                    // Add marker to map
                    userLocationMarker = new maplibregl.Marker(el)
                        .setLngLat([lng, lat])
                        .addTo(map);
                        
                    // Fly to user location
                    map.flyTo({
                        center: [lng, lat],
                        zoom: 15,
                        speed: 1.5
                    });
                }
                
                // Function to be called from React Native to zoom in
                function zoomIn() {
                    map.zoomIn();
                }
                
                // Function to be called from React Native to zoom out
                function zoomOut() {
                    map.zoomOut();
                }
                
                // Function to be called from React Native to locate user
                function locateUser(lng, lat) {
                    if (lng && lat) {
                        updateUserLocationMarker(lng, lat);
                    } else {
                        // If no coordinates provided, try to use geolocation
                        geolocateControl.trigger();
                    }
                }
                
                // Listen for messages from React Native
                document.addEventListener('message', function(event) {
                    try {
                        const message = JSON.parse(event.data);
                        
                        if (message.action === 'zoomIn') {
                            zoomIn();
                        } else if (message.action === 'zoomOut') {
                            zoomOut();
                        } else if (message.action === 'locateUser') {
                            if (message.longitude && message.latitude) {
                                locateUser(message.longitude, message.latitude);
                            } else {
                                locateUser();
                            }
                        }
                    } catch (error) {
                        console.error("Error processing message:", error);
                    }
                });
                
                // Listen for location events from geolocate control
                geolocateControl.on('geolocate', function(position) {
                    const lng = position.coords.longitude;
                    const lat = position.coords.latitude;
                    
                    // Notify React Native of new location
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'userLocation',
                        latitude: lat,
                        longitude: lng
                    }));
                    
                    // Update marker
                    updateUserLocationMarker(lng, lat);
                });
            </script>
        </body>
        </html>
    `;
    
    // Handle messages from WebView
    const handleWebViewMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            
            if (data.type === 'markerClick' && data.id) {
                // Find the marker with the clicked ID
                const clickedMarker = markers.find(marker => marker.id === data.id);
                if (clickedMarker && onMarkerPress) {
                    onMarkerPress(clickedMarker);
                }
            } else if (data.type === 'mapReady' && onMapReady) {
                onMapReady();
            } else if (data.type === 'userLocation' && data.latitude && data.longitude) {
                // Handle user location updates from the map
                onUserLocationUpdate && onUserLocationUpdate({
                    latitude: data.latitude,
                    longitude: data.longitude
                });
            }
        } catch (error) {
            console.error('Error handling WebView message:', error);
        }
    };
    
    // Reference to WebView to send messages
    const webViewRef = useRef(null);
    
    // Method to send message to WebView
    const sendMessageToWebView = (message) => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify(message));
        }
    };
    
    // Expose methods to parent component
    React.useImperativeHandle(ref, () => ({
        zoomIn: () => sendMessageToWebView({ action: 'zoomIn' }),
        zoomOut: () => sendMessageToWebView({ action: 'zoomOut' }),
        locateUser: (coords) => {
            if (coords && coords.latitude && coords.longitude) {
                sendMessageToWebView({ 
                    action: 'locateUser',
                    latitude: coords.latitude,
                    longitude: coords.longitude
                });
            } else {
                sendMessageToWebView({ action: 'locateUser' });
            }
        }
    }));
    
    return (
        <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={{ flex: 1, width: '100%', height: '100%' }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
                <Center flex={1}>
                    <Spinner size="lg" color={COLORS.primary} />
                </Center>
            )}
        />
    );
});

const PenggunaHome = ({ navigation }) => {
    // State untuk menyimpan data lokasi yang dipilih
    const [selectedLocation, setSelectedLocation] = useState(null);
    
    // State untuk menampilkan/menyembunyikan modal
    const [showModal, setShowModal] = useState(false);
    
    // State untuk dropdown jam operasional
    const [showOperationalHours, setShowOperationalHours] = useState(false);
    
    // State untuk tracking current image
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // State for safeguarding location data
    const [locationData, setLocationData] = useState([]);
    
    // State untuk filter data
    const [showMyDataOnly, setShowMyDataOnly] = useState(false);
    
    // State untuk current user
    const [currentUser, setCurrentUser] = useState(null);
    
    // Loading state
    const [loading, setLoading] = useState(true);
    
    // State untuk map rendering
    const [mapReady, setMapReady] = useState(false);
    
    // State untuk search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    
    // State untuk delete functionality
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletionReason, setDeletionReason] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // State for user location
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState(false);
    
    // Reference to MapView component
    const mapRef = useRef(null);
    
    // Reference to FlatList for images
    const imageListRef = useRef(null);
    
    // Toast
    const toast = useToast();
    
    // Fetch data from Firebase - optimized to prevent excessive calls
    const fetchTambalBanData = useCallback(async () => {
        try {
            setLoading(true);
            const [data, userData] = await Promise.all([
                getAllTambalBanData(),
                getCurrentUser()
            ]);
            
            setCurrentUser(userData);
            
            // Admin bisa lihat semua data termasuk pending_deletion
            setLocationData(prevData => {
                const newData = (data || []).filter(item => 
                    item.status === 'aktif' || item.status === 'pending_deletion'
                );
                // Simple comparison - in production you might want deep comparison
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        } catch (error) {
            console.error("Error fetching tambal ban data:", error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Load data on component mount - optimized
    useEffect(() => {
        fetchTambalBanData();
        
        // Request location permission
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                setLocationPermission(status === 'granted');
                
                if (status === 'granted') {
                    // Get initial location
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            } catch (error) {
                console.error("Error getting location permission:", error);
                toast.show({
                    title: "Lokasi tidak tersedia",
                    description: "Tidak dapat mengakses lokasi saat ini",
                    status: "warning"
                });
            }
        })();
        
        // Debounced listener for focus events to prevent excessive re-fetching
        let timeoutId;
        const unsubscribe = navigation.addListener('focus', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fetchTambalBanData();
            }, 500); // 500ms debounce
        });
        
        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [navigation, fetchTambalBanData]);

    // Filter data berdasarkan user yang sedang login dan search query
    const getFilteredData = useCallback(() => {
        let filteredData = locationData;
        
        // Filter berdasarkan ownership jika showMyDataOnly true
        if (showMyDataOnly && currentUser) {
            filteredData = filteredData.filter(item => {
                return item.uid_penambah === currentUser.uid || 
                       item.email_penambah === currentUser.email;
            });
        }
        
        // Filter berdasarkan search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredData = filteredData.filter(item => {
                return (
                    (item.nama && item.nama.toLowerCase().includes(query)) ||
                    (item.alamat && item.alamat.toLowerCase().includes(query)) ||
                    (item.telepon && item.telepon.toLowerCase().includes(query)) ||
                    (item.ditambahkan_oleh && item.ditambahkan_oleh.toLowerCase().includes(query))
                );
            });
        }
        
        return filteredData;
    }, [locationData, showMyDataOnly, currentUser, searchQuery]);

    // Handle ketika marker diklik - memoized to prevent re-render
    const handleMarkerPress = useCallback((item) => {
        if (!item) return;
        
        try {
            setSelectedLocation(item);
            setShowModal(true);
            setShowOperationalHours(false);
            setCurrentImageIndex(0);
        } catch (error) {
            console.error("Error in handleMarkerPress:", error);
        }
    }, []);

    // Memoize processed location data to prevent unnecessary re-renders
    const processedLocationData = useMemo(() => {
        const filteredData = getFilteredData();
        return filteredData.filter(item => {
            return (
                item && 
                item.id && 
                item.latitude && 
                item.longitude && 
                !isNaN(parseFloat(item.latitude)) && 
                !isNaN(parseFloat(item.longitude))
            );
        });
    }, [getFilteredData]);

    // Check if user can edit this location
    const canEditLocation = useCallback((item) => {
        if (!currentUser || !item) return false;
        
        // Admin can edit all data
        if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
            return true;
        }
        
        // Regular users can only edit their own data
        return item.uid_penambah === currentUser.uid || 
               item.email_penambah === currentUser.email;
    }, [currentUser]);

    // Check if user can delete this location
    const canDeleteLocation = useCallback((item) => {
        if (!currentUser || !item) return false;
        
        // Admin dapat menghapus semua data tanpa batasan
        if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
            return true;
        }
        
        // Regular users dapat menghapus data mereka sendiri
        return item.uid_penambah === currentUser.uid || 
               item.email_penambah === currentUser.email;
    }, [currentUser]);

    // Handle delete location
    const handleDeleteLocation = useCallback(async () => {
        if (!selectedLocation || !deletionReason.trim()) {
            toast.show({
                title: "Alasan diperlukan",
                description: "Silakan masukkan alasan penghapusan",
                status: "warning"
            });
            return;
        }
        
        try {
            setDeleteLoading(true);
            
            // Admin langsung hapus data dari Firebase
            await deleteTambalBanData(selectedLocation.id);
            
            toast.show({
                title: "Berhasil",
                description: "Data tambal ban telah dihapus secara permanen",
                status: "success"
            });
            
            // Reset states
            setShowDeleteModal(false);
            setShowModal(false);
            setDeletionReason('');
            
            // Refresh data
            fetchTambalBanData();
            
        } catch (error) {
            console.error('Error deleting location:', error);
            toast.show({
                title: "Error",
                description: "Gagal menghapus data",
                status: "error"
            });
        } finally {
            setDeleteLoading(false);
        }
    }, [selectedLocation, deletionReason, toast, fetchTambalBanData]);

    // Handle edit location
    const handleEditLocation = useCallback(() => {
        if (!selectedLocation) return;
        
        if (canEditLocation(selectedLocation)) {
            navigation.navigate('EditTambalBan', { 
                id: selectedLocation.id,
                isAdmin: currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
            });
        }
    }, [selectedLocation, canEditLocation, navigation, currentUser]);

    // Handle search toggle
    const handleSearchToggle = () => {
        setShowSearchInput(!showSearchInput);
        if (showSearchInput) {
            setSearchQuery(''); // Reset search when closing
        }
    };

    const handleSearchClear = () => {
        setSearchQuery('');
    };

    // Handle untuk menutup modal
    const handleCloseModal = () => {
        try {
            setShowModal(false);
            
            // Use a safer approach to reset state
            const timer = setTimeout(() => {
                try {
                    setSelectedLocation(null);
                    setShowOperationalHours(false);
                    clearTimeout(timer); // Clean up the timer
                } catch (error) {
                    console.error("Error in delayed modal close:", error);
                }
            }, 300); // Delay untuk animasi closing
        } catch (error) {
            console.error("Error in handleCloseModal:", error);
        }
    };

    // Toggle dropdown jam operasional
    const toggleOperationalHours = () => {
        try {
            setShowOperationalHours(prevState => !prevState);
        } catch (error) {
            console.error("Error in toggleOperationalHours:", error);
        }
    };

    // Handle image swipe/scroll end
    const handleViewableItemsChanged = useRef(({ viewableItems }) => {
        try {
            if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
                setCurrentImageIndex(viewableItems[0].index || 0);
            }
        } catch (error) {
            console.error("Error in handleViewableItemsChanged:", error);
        }
    }).current;

    // MapTiler control functions - forwarded to WebView
    const handleZoomIn = () => {
        try {
            if (mapRef.current) {
                mapRef.current.zoomIn();
            }
        } catch (error) {
            console.error("Error in handleZoomIn:", error);
        }
    };

    const handleZoomOut = () => {
        try {
            if (mapRef.current) {
                mapRef.current.zoomOut();
            }
        } catch (error) {
            console.error("Error in handleZoomOut:", error);
        }
    };

    const handleLocateUser = () => {
        try {
            if (!locationPermission) {
                // Request permission again if not granted
                (async () => {
                    try {
                        const { status } = await Location.requestForegroundPermissionsAsync();
                        setLocationPermission(status === 'granted');
                        
                        if (status === 'granted') {
                            // Get current location
                            const location = await Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.Balanced,
                            });
                            
                            setUserLocation({
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            });
                            
                            // Center map on user location
                            if (mapRef.current && location) {
                                mapRef.current.locateUser({
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude
                                });
                            }
                        } else {
                            toast.show({
                                title: "Izin diperlukan",
                                description: "Diperlukan izin lokasi untuk fitur ini",
                                status: "warning"
                            });
                        }
                    } catch (error) {
                        console.error("Error getting location:", error);
                    }
                })();
                return;
            }
            
            // Get current location if permission is granted
            (async () => {
                try {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                    
                    // Center map on user location
                    if (mapRef.current && location) {
                        mapRef.current.locateUser({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        });
                    }
                } catch (error) {
                    console.error("Error getting current location:", error);
                    toast.show({
                        title: "Error",
                        description: "Tidak dapat mengakses lokasi saat ini",
                        status: "error"
                    });
                }
            })();
        } catch (error) {
            console.error("Error in handleLocateUser:", error);
        }
    };

    // Function to open Google Maps with directions
    const openGoogleMapsDirections = () => {
        try {
            if (!selectedLocation) return;
            
            const latitude = parseFloat(selectedLocation.latitude);
            const longitude = parseFloat(selectedLocation.longitude);
            
            if (isNaN(latitude) || isNaN(longitude)) {
                console.warn("Invalid coordinates for directions");
                return;
            }
            
            const destination = `${latitude},${longitude}`;
            
            // Create the appropriate URL based on the platform
            const url = Platform.select({
                ios: `maps://app?daddr=${destination}`,
                android: `google.navigation:q=${destination}`
            });
            
            // Universal URL that works as fallback
            const universalUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            
            // Try to open platform-specific maps app first
            Linking.canOpenURL(url)
                .then(supported => {
                    if (supported) {
                        return Linking.openURL(url);
                    } else {
                        return Linking.openURL(universalUrl);
                    }
                })
                .catch(error => {
                    console.error("Error opening Maps URL:", error);
                    // Try universal URL as fallback
                    Linking.openURL(universalUrl).catch(err => {
                        console.error("Could not open Google Maps:", err);
                    });
                });
        } catch (error) {
            console.error("Error in openGoogleMapsDirections:", error);
        }
    };

    // Render rating dalam bentuk bintang
    const renderRating = (rating = 4.5) => {
        try {
            const ratingValue = parseFloat(rating);
            if (isNaN(ratingValue)) return null;
            
            const fullStars = Math.floor(ratingValue);
            const hasHalfStar = ratingValue % 1 !== 0;
            const stars = [];
            
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    stars.push(<FontAwesome key={i} name="star" size={16} color={COLORS.secondary} />);
                } else if (i === fullStars && hasHalfStar) {
                    stars.push(<FontAwesome key={i} name="star-half-o" size={16} color={COLORS.secondary} />);
                } else {
                    stars.push(<FontAwesome key={i} name="star-o" size={16} color={COLORS.secondary} />);
                }
            }

            return (
                <HStack space={1} mt={1}>
                    {stars}
                    <Text ml={2} fontSize="sm" color="gray.600">{ratingValue.toFixed(1)}</Text>
                </HStack>
            );
        } catch (error) {
            console.error("Error in renderRating:", error);
            return null;
        }
    };

    // Improved image extraction from Google Drive links
    const getImageIdFromUrl = (url) => {
        try {
            if (!url || typeof url !== 'string') return '';
            
            // Extract ID from Google Drive URL
            const match = url.match(/[-\w]{25,}/);
            return match ? match[0] : '';
        } catch (error) {
            console.error("Error extracting image ID:", error);
            return '';
        }
    };

    // Function to safely extract image URIs
    const getImageUri = (imageUrl) => {
        try {
            // Check if it's already a Cloudinary URL
            if (imageUrl && imageUrl.includes('cloudinary.com')) {
                return imageUrl;
            }
            
            // If it's a Google Drive URL, extract the ID
            const imageId = getImageIdFromUrl(imageUrl);
            if (!imageId) return null;
            
            return `https://drive.google.com/uc?export=view&id=${imageId}`;
        } catch (error) {
            console.error("Error getting image URI:", error);
            return null;
        }
    };

    // Render jam operasional per hari
    const renderOperationalHours = () => {
        try {
            if (!selectedLocation) return null;

            const days = [
                { key: 'senin', label: 'Senin' },
                { key: 'selasa', label: 'Selasa' },
                { key: 'rabu', label: 'Rabu' },
                { key: 'kamis', label: 'Kamis' },
                { key: 'jumat', label: 'Jumat' },
                { key: 'sabtu', label: 'Sabtu' },
                { key: 'minggu', label: 'Minggu' },
            ];

            return (
                <Collapse isOpen={showOperationalHours}>
                    <VStack space={2} mt={2} mb={2} bg="gray.100" p={3} borderRadius={8}>
                        {days.map(day => {
                            try {
                                const dayKey = `hari_${day.key}`;
                                
                                // Safely check if properties exist
                                const dayValue = selectedLocation[dayKey];
                                const is24Hours = dayValue === "Buka 24 Jam";

                                // First shift
                                const bukaTime = selectedLocation[`${dayKey}_buka`];
                                const tutupTime = selectedLocation[`${dayKey}_tutup`];

                                // Second shift
                                const buka2Time = selectedLocation[`${dayKey}_buka2`];
                                const tutup2Time = selectedLocation[`${dayKey}_tutup2`];

                                const hasFirstShift = bukaTime && tutupTime;
                                const hasSecondShift = buka2Time && tutup2Time;
                                const hasBukaKey = hasFirstShift || hasSecondShift;

                                return (
                                    <VStack key={dayKey} py={1} space={1}>
                                        <Text fontWeight="bold" color={COLORS.text} fontSize="md">{day.label}</Text>

                                        {is24Hours ? (
                                            <Text color="green.500" fontWeight="medium">Buka 24 Jam</Text>
                                        ) : !hasBukaKey ? (
                                            <Text color="gray.500">Tutup</Text>
                                        ) : (
                                            <VStack space={1}>
                                                {hasFirstShift && (
                                                    <HStack space={2} alignItems="center">
                                                        <Text color="green.500" fontWeight="medium">Buka </Text>
                                                        <Text color={COLORS.text}>{bukaTime}</Text>
                                                        <Text color="red.500" fontWeight="medium" ml={2}>Tutup </Text>
                                                        <Text color={COLORS.text}>{tutupTime}</Text>
                                                    </HStack>
                                                )}

                                                {hasSecondShift && (
                                                    <HStack space={2} alignItems="center">
                                                        <Text color="green.500" fontWeight="medium">Buka </Text>
                                                        <Text color={COLORS.text}>{buka2Time}</Text>
                                                        <Text color="red.500" fontWeight="medium" ml={2}>Tutup </Text>
                                                        <Text color={COLORS.text}>{tutup2Time}</Text>
                                                    </HStack>
                                                )}
                                            </VStack>
                                        )}
                                    </VStack>
                                );
                            } catch (error) {
                                console.error(`Error rendering day ${day.label}:`, error);
                                return null;
                            }
                        })}
                    </VStack>
                </Collapse>
            );
        } catch (error) {
            console.error("Error in renderOperationalHours:", error);
            return null;
        }
    };

    // Prepare image data outside render
    const getImageData = () => {
        try {
            if (!selectedLocation) return [];
            
            const images = [];
            
            if (selectedLocation.gambar_1) {
                images.push({ id: 'gambar_1', uri: selectedLocation.gambar_1 });
            }
            
            if (selectedLocation.gambar_2) {
                images.push({ id: 'gambar_2', uri: selectedLocation.gambar_2 });
            }
            
            return images;
        } catch (error) {
            console.error("Error getting image data:", error);
            return [];
        }
    };

    // Handle map ready event
    const handleMapReady = () => {
        setMapReady(true);
    };

    try {
        return (
            <>
                <Header title={"Tambal Ban"} />
                <Box flex={1} position="relative" width="100%" height="100%">
                    {loading ? (
                        <Center flex={1}>
                            <Spinner size="lg" color={COLORS.primary} />
                            <Text mt={2} color="gray.500">Memuat data tambal ban...</Text>
                        </Center>
                    ) : (
                        <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={0}>
                            {/* MapTiler WebView component replaces Google Maps */}
                            <MapTilerWebView
                                ref={mapRef}
                                markers={processedLocationData}
                                onMarkerPress={handleMarkerPress}
                                onMapReady={handleMapReady}
                            />
                        </Box>
                    )}

                    {/* Filter and Search Controls */}
                    <Box position="absolute" top={4} left={4} right={100} zIndex={1}>
                        <VStack space={2}>
                            {/* Row 1: Filter Button and Search Button */}
                            <HStack space={3} alignItems="center">
                                {/* Filter Button */}
                                <Pressable
                                    bg={showMyDataOnly ? COLORS.secondary : COLORS.primary}
                                    shadow={2}
                                    borderRadius="full"
                                    px={4}
                                    py={2}
                                    borderWidth={2}
                                    borderColor={showMyDataOnly ? COLORS.primary : COLORS.secondary}
                                    onPress={() => setShowMyDataOnly(!showMyDataOnly)}
                                    minW="130px"
                                >
                                    <HStack space={2} alignItems="center" justifyContent="center">
                                        <Ionicons 
                                            name={showMyDataOnly ? "person" : "people"} 
                                            size={18} 
                                            color={showMyDataOnly ? COLORS.primary : COLORS.light} 
                                        />
                                        <Text 
                                            color={showMyDataOnly ? COLORS.primary : COLORS.light}
                                            fontWeight="bold"
                                            fontSize="sm"
                                        >
                                            {showMyDataOnly ? "Data Saya" : "Semua Data"}
                                        </Text>
                                    </HStack>
                                </Pressable>

                                {/* Search Button */}
                                <Pressable
                                    bg={showSearchInput ? COLORS.secondary : COLORS.primary}
                                    shadow={2}
                                    borderRadius="full"
                                    px={4}
                                    py={2}
                                    borderWidth={2}
                                    borderColor={showSearchInput ? COLORS.primary : COLORS.secondary}
                                    onPress={handleSearchToggle}
                                    minW="100px"
                                >
                                    <HStack space={2} alignItems="center" justifyContent="center">
                                        <Ionicons 
                                            name={showSearchInput ? "close" : "search"} 
                                            size={18} 
                                            color={showSearchInput ? COLORS.primary : COLORS.light} 
                                        />
                                        <Text 
                                            color={showSearchInput ? COLORS.primary : COLORS.light}
                                            fontWeight="bold"
                                            fontSize="sm"
                                        >
                                            {showSearchInput ? "Tutup" : "Cari"}
                                        </Text>
                                    </HStack>
                                </Pressable>
                            </HStack>

                            {/* Row 2: Search Input (conditionally shown) */}
                            {showSearchInput && (
                                <Box
                                    bg="white"
                                    borderRadius={25}
                                    shadow={2}
                                    borderWidth={2}
                                    borderColor={COLORS.primary}
                                    overflow="hidden"
                                >
                                    <Input
                                        placeholder="Cari berdasarkan nama, alamat, telepon..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        variant="unstyled"
                                        size="md"
                                        px={4}
                                        py={2}
                                        borderRadius={0}
                                        InputRightElement={
                                            searchQuery ? (
                                                <Pressable onPress={handleSearchClear} mr={3}>
                                                    <Ionicons name="close-circle" size={20} color="gray" />
                                                </Pressable>
                                            ) : undefined
                                        }
                                        _focus={{
                                            borderColor: "transparent",
                                            backgroundColor: "white",
                                            borderRadius: 0
                                        }}
                                        _hover={{
                                            borderColor: "transparent",
                                            borderRadius: 0
                                        }}
                                    />
                                </Box>
                            )}
                        </VStack>
                    </Box>

                    {/* Result Counter (when searching) */}
                    {searchQuery.trim() && (
                        <Box position="absolute" top={showSearchInput ? 120 : 80} left={4} zIndex={1}>
                            <Box
                                bg="rgba(255,255,255,0.9)"
                                px={3}
                                py={1}
                                borderRadius={15}
                                borderWidth={1}
                                borderColor={COLORS.primary}
                            >
                                <Text fontSize="xs" color={COLORS.text} fontWeight="medium">
                                    {processedLocationData.length} hasil ditemukan
                                </Text>
                            </Box>
                        </Box>
                    )}

                    {/* Zoom control buttons */}
                    <Box position="absolute" top={4} right={4} zIndex={1}>
                        <VStack space={2}>
                            {/* Zoom in button */}
                            <Pressable
                                bg={COLORS.primary}
                                shadow={2}
                                borderRadius="full"
                                p={2}
                                borderWidth={2}
                                borderColor={COLORS.secondary}
                                onPress={handleZoomIn}
                            >
                                <Ionicons name="add" size={24} color={COLORS.light} />
                            </Pressable>

                            {/* Zoom out button */}
                            <Pressable
                                bg={COLORS.primary}
                                shadow={2}
                                borderRadius="full"
                                p={2}
                                borderWidth={2}
                                borderColor={COLORS.secondary}
                                onPress={handleZoomOut}
                            >
                                <Ionicons name="remove" size={24} color={COLORS.light} />
                            </Pressable>
                        </VStack>
                    </Box>

                    {/* Floating action button untuk lokasi pengguna */}
                    <Box position="absolute" bottom={4} right={4} zIndex={1}>
                        <Pressable
                            bg={COLORS.primary}
                            shadow={2}
                            borderRadius="full"
                            p={3}
                            borderWidth={2}
                            borderColor={COLORS.secondary}
                            onPress={handleLocateUser}
                        >
                            <Ionicons name="locate" size={24} color={COLORS.light} />
                        </Pressable>
                    </Box>

                    {/* Custom Modal Popup */}
                    <Slide in={showModal} placement="bottom">
                        <Box
                            position="absolute"
                            bottom={0}
                            left={0}
                            right={0}
                            bg="white"
                            borderTopLeftRadius={20}
                            borderTopRightRadius={20}
                            borderTopWidth={4}
                            borderTopColor={COLORS.primary}
                            borderLeftWidth={1}
                            borderRightWidth={1}
                            borderLeftColor={COLORS.primary}
                            borderRightColor={COLORS.primary}
                            shadow={5}
                            height="75%"
                            py={2}
                            zIndex={10}
                        >
                            {selectedLocation && (
                                <ScrollView p={4}>
                                    {/* Close button - Fixed position to avoid overlap with photo */}
                                    <Box position="absolute" right={2} top={2} zIndex={10} bg="rgba(255,255,255,0.7)" borderRadius="full">
                                        <IconButton
                                            onPress={handleCloseModal}
                                            icon={<Ionicons name="close" size={24} color={COLORS.accent} />}
                                            borderRadius="full"
                                        />
                                    </Box>

                                    {/* Handle untuk drag */}
                                    <Box width={16} height={1} bg="gray.300" alignSelf="center" mb={4} borderRadius="full" />

                                    {/* Status Badge jika pending deletion */}
                                    {selectedLocation.status === 'pending_deletion' && (
                                        <Box bg="orange.100" p={3} borderRadius={8} mb={4} borderWidth={1} borderColor="orange.300">
                                            <HStack space={2} alignItems="center">
                                                <Ionicons name="warning" size={20} color="orange.600" />
                                                <VStack flex={1}>
                                                    <Text color="orange.800" fontWeight="bold">Data Sedang Menunggu Penghapusan</Text>
                                                    <Text color="orange.700" fontSize="sm">
                                                        Data ini sedang menunggu persetujuan penghapusan dari admin
                                                    </Text>
                                                    {selectedLocation.deletion_reason && (
                                                        <Text color="orange.600" fontSize="xs" mt={1}>
                                                            Alasan: {selectedLocation.deletion_reason}
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    )}

                                    {/* Image Gallery - Support for multiple images with swipe */}
                                    <Box pt={10}>
                                        <FlatList
                                            ref={imageListRef}
                                            data={getImageData()}
                                            horizontal
                                            pagingEnabled
                                            showsHorizontalScrollIndicator={false}
                                            keyExtractor={item => item.id}
                                            onViewableItemsChanged={handleViewableItemsChanged}
                                            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                                            renderItem={({ item }) => {
                                                try {
                                                    const imageUri = getImageUri(item.uri);
                                                    
                                                    if (!imageUri) {
                                                        return (
                                                            <Box width={width - 40} mr={2} 
                                                                 justifyContent="center" alignItems="center"
                                                                 h={200} bg="gray.200" borderRadius={10}>
                                                                <Ionicons name="image" size={40} color="gray" />
                                                                <Text color="gray.500" mt={2}>Gambar tidak tersedia</Text>
                                                            </Box>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <Box width={width - 40} mr={2}>
                                                            <Image
                                                                source={{ uri: imageUri }}
                                                                alt={selectedLocation.nama || "Tambal Ban"}
                                                                h={200}
                                                                w="100%"
                                                                borderRadius={10}
                                                                fallbackElement={
                                                                    <Box justifyContent="center" alignItems="center" 
                                                                         h={200} w="100%" bg="gray.200" borderRadius={10}>
                                                                        <Ionicons name="image" size={40} color="gray" />
                                                                        <Text color="gray.500" mt={2}>Gambar tidak tersedia</Text>
                                                                    </Box>
                                                                }
                                                            />
                                                        </Box>
                                                    );
                                                } catch (error) {
                                                    console.error("Error in renderItem for image:", error);
                                                    return (
                                                        <Box width={width - 40} mr={2} 
                                                             justifyContent="center" alignItems="center"
                                                             h={200} bg="gray.200" borderRadius={10}>
                                                            <Ionicons name="alert-circle" size={40} color="gray" />
                                                            <Text color="gray.500" mt={2}>Error loading image</Text>
                                                        </Box>
                                                    );
                                                }
                                            }}
                                            mb={4}
                                        />

                                        {/* Image indicators - Dynamic based on current image */}
                                        {selectedLocation && selectedLocation.gambar_1 && selectedLocation.gambar_2 && (
                                            <HStack justifyContent="center" space={2} mt={2} mb={2}>
                                                <Box
                                                    w={2}
                                                    h={2}
                                                    borderRadius="full"
                                                    bg={currentImageIndex === 0 ? COLORS.primary : "gray.300"}
                                                />
                                                <Box
                                                    w={2}
                                                    h={2}
                                                    borderRadius="full"
                                                    bg={currentImageIndex === 1 ? COLORS.primary : "gray.300"}
                                                />
                                            </HStack>
                                        )}
                                    </Box>

                                    {/* Title and Status */}
                                    <HStack justifyContent="space-between" alignItems="center" mb={2}>
                                        <Heading size="md" color={COLORS.accent}>
                                            {selectedLocation.nama || "Unknown Location"}
                                        </Heading>
                                    </HStack>

                                    {/* Ditambahkan oleh */}
                                    {selectedLocation.ditambahkan_oleh && (
                                        <HStack space={2} mt={2} alignItems="center">
                                            <Ionicons name="person" size={16} color={COLORS.primary} />
                                            <Text fontSize="xs" color="gray.500">
                                                Ditambahkan oleh: {selectedLocation.ditambahkan_oleh}
                                            </Text>
                                        </HStack>
                                    )}

                                    {/* Alamat */}
                                    <HStack space={2} mt={4} alignItems="flex-start">
                                        <Ionicons name="location" size={20} color={COLORS.primary} />
                                        <Text flex={1} color={COLORS.text}>
                                            {selectedLocation.alamat || "Alamat tidak tersedia"}
                                        </Text>
                                    </HStack>

                                    {/* Telepon */}
                                    <HStack space={2} mt={3} alignItems="center">
                                        <Ionicons name="call" size={20} color={COLORS.primary} />
                                        <Text color={COLORS.text}>
                                            {selectedLocation.telepon || "Telepon tidak tersedia"}
                                        </Text>
                                    </HStack>

                                    {/* Hari Operasional */}
                                    <HStack space={2} mt={3} alignItems="center">
                                        <Ionicons name="calendar" size={20} color={COLORS.primary} />
                                        <Text color={COLORS.text}>
                                            {selectedLocation.hari_operasional || "Hari operasional tidak tersedia"}
                                        </Text>
                                    </HStack>

                                    {/* Jam Operasional dengan Dropdown - Make entire row pressable */}
                                    <Pressable onPress={toggleOperationalHours} mt={3}>
                                        <HStack space={2} alignItems="center" justifyContent="space-between">
                                            <HStack space={2} alignItems="center">
                                                <Ionicons name="time" size={20} color={COLORS.primary} />
                                                <Text color={COLORS.text}>Jam Operasional</Text>
                                            </HStack>
                                            <Ionicons
                                                name={showOperationalHours ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color={COLORS.accent}
                                            />
                                        </HStack>
                                    </Pressable>

                                    {/* Dropdown Content for Operational Hours */}
                                    {renderOperationalHours()}

                                    {/* Action Buttons */}
                                    <VStack space={3} mt={6} mb={4}>
                                        {/* Row 1: Petunjuk Arah */}
                                        <Button
                                            leftIcon={<Ionicons name="navigate" size={16} color={COLORS.light} />}
                                            bg={COLORS.primary}
                                            _pressed={{ bg: COLORS.accent }}
                                            borderWidth={2}
                                            borderColor={COLORS.secondary}
                                            onPress={openGoogleMapsDirections}
                                        >
                                            Petunjuk Arah
                                        </Button>
                                        
                                        {/* Row 2: Edit and Delete buttons */}
                                        <HStack space={2}>
                                            {/* Edit button - show if user can edit */}
                                            {canEditLocation(selectedLocation) && (
                                                <Button
                                                    flex={1}
                                                    leftIcon={<Ionicons name="pencil" size={16} color={COLORS.primary} />}
                                                    bg={COLORS.secondary}
                                                    _pressed={{ bg: "yellow.600" }}
                                                    _text={{ color: COLORS.primary, fontWeight: "bold" }}
                                                    onPress={handleEditLocation}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            
                                            {/* Delete button - Admin bisa hapus semua data */}
                                            {canDeleteLocation(selectedLocation) && (
                                                <Button
                                                    flex={1}
                                                    leftIcon={<Ionicons name="trash" size={16} color={COLORS.light} />}
                                                    bg="red.600"
                                                    _pressed={{ bg: "red.700" }}
                                                    onPress={() => setShowDeleteModal(true)}
                                                >
                                                    Hapus
                                                </Button>
                                            )}
                                        </HStack>
                                    </VStack>
                                </ScrollView>
                            )}
                        </Box>
                    </Slide>

                    {/* Modal Konfirmasi Delete */}
                    <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                        <Modal.Content>
                            <Modal.CloseButton />
                            <Modal.Header>Konfirmasi Penghapusan</Modal.Header>
                            <Modal.Body>
                                <VStack space={3}>
                                    <Text>
                                        Apakah Anda yakin ingin menghapus data tambal ban "{selectedLocation?.nama}"?
                                    </Text>
                                    <Text color="red.600" fontSize="sm" fontWeight="bold">
                                        ⚠️ PERINGATAN: Data akan langsung dihapus secara permanen tanpa bisa dikembalikan!
                                    </Text>
                                    <FormControl>
                                        <FormControl.Label>Alasan Penghapusan *</FormControl.Label>
                                        <Box
                                            borderWidth={1}
                                            borderColor="gray.300"
                                            borderRadius={8}
                                            overflow="hidden"
                                            _focus={{
                                                borderColor: COLORS.primary,
                                                borderWidth: 2
                                            }}
                                        >
                                            <TextArea
                                                placeholder="Masukkan alasan penghapusan..."
                                                value={deletionReason}
                                                onChangeText={setDeletionReason}
                                                h={20}
                                                borderWidth={0}
                                                borderRadius={0}
                                                _focus={{
                                                    borderWidth: 0,
                                                    borderColor: "transparent",
                                                    backgroundColor: "white"
                                                }}
                                                _hover={{
                                                    borderWidth: 0,
                                                    borderColor: "transparent"
                                                }}
                                            />
                                        </Box>
                                    </FormControl>
                                </VStack>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button.Group space={2}>
                                    <Button
                                        variant="ghost"
                                        onPress={() => {
                                            setShowDeleteModal(false);
                                            setDeletionReason('');
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        bg="red.600"
                                        onPress={handleDeleteLocation}
                                        isLoading={deleteLoading}
                                    >
                                        Hapus Permanen
                                    </Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                </Box>
            </>
        );
    } catch (error) {
        console.error("Error in Home component render:", error);
        return (
            <Box flex={1} justifyContent="center" alignItems="center">
                <Text>Error rendering the application. Please check logs.</Text>
            </Box>
        );
    }
};

export default PenggunaHome;