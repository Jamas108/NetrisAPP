import { 
    StyleSheet, 
    View, 
    Image, 
    Text, 
    Dimensions, 
    Animated, 
    StatusBar 
} from "react-native";
import React, { Component } from "react";
import { getData } from "../utils/localStorage";

const { width, height } = Dimensions.get('window');

export default class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fadeAnim: new Animated.Value(0),
            scaleAnim: new Animated.Value(0.5),
            logoSlide: new Animated.Value(-100),
            textSlide: new Animated.Value(100),
            loadingWidth: new Animated.Value(0),
        };
    }

    async componentDidMount() {
        // Hide status bar for immersive experience
        StatusBar.setHidden(true);
        
        // Start animations
        this.startAnimations();
        
        try {
            // Wait for splash screen display and animations
            await this.delay(3000);
            
            // Check if user data exists in AsyncStorage
            const userData = await getData('user');
            
            if (userData && userData.role) {
                // User is logged in, navigate based on role
                this.navigateByRole(userData.role);
            } else {
                // No user data found, navigate to home
                this.props.navigation.replace('Guest');
            }
        } catch (error) {
            console.log('Error checking user data:', error);
            // If error occurs, navigate to home
            this.props.navigation.replace('Guest');
        }
    }

    componentWillUnmount() {
        // Show status bar when component unmounts
        StatusBar.setHidden(false);
    }

    // Start all animations
    startAnimations = () => {
        // Fade in animation
        Animated.timing(this.state.fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        // Logo slide in from top
        Animated.spring(this.state.logoSlide, {
            toValue: 0,
            tension: 80,
            friction: 8,
            delay: 300,
            useNativeDriver: true,
        }).start();

        // Logo scale animation
        Animated.spring(this.state.scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            delay: 500,
            useNativeDriver: true,
        }).start();

        // Text slide up from bottom
        Animated.timing(this.state.textSlide, {
            toValue: 0,
            duration: 800,
            delay: 1000,
            useNativeDriver: true,
        }).start();

        // Loading bar animation
        Animated.timing(this.state.loadingWidth, {
            toValue: 200,
            duration: 2000,
            delay: 1500,
            useNativeDriver: false,
        }).start();
    };

    // Helper function to create delay
    delay = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Navigate user based on their role
    navigateByRole = (role) => {
        switch (role) {
            case 'pengguna':
                this.props.navigation.replace('Pengguna');
                break;
            case 'admin':
                this.props.navigation.replace('HomeAdmin');
                break;
            case 'superadmin':
                this.props.navigation.replace('HomeSuperAdmin');
                break;
            default:
                // Invalid role, navigate to home
                this.props.navigation.replace('Guest');
        }
    }

    render() {
        const { fadeAnim, scaleAnim, logoSlide, textSlide, loadingWidth } = this.state;

        return (
            <View style={styles.container}>
                <StatusBar hidden={true} />
                
                {/* Background with Pattern */}
                <View style={styles.background}>
                    {/* Decorative circles */}
                    <View style={[styles.circle, styles.circle1]} />
                    <View style={[styles.circle, styles.circle2]} />
                    <View style={[styles.circle, styles.circle3]} />
                    <View style={[styles.circle, styles.circle4]} />
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Logo Section */}
                    <Animated.View 
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: logoSlide },
                                    { scale: scaleAnim }
                                ]
                            }
                        ]}
                    >
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require("../assets/logonetriss.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            {/* Logo glow effect */}
                            <View style={styles.logoGlow} />
                        </View>
                    </Animated.View>

                    {/* Title Section */}
                    <Animated.View
                        style={[
                            styles.titleContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: textSlide }]
                            }
                        ]}
                    >
                        <Text style={styles.mainTitle}>TAMBAL BAN</Text>
                        <Text style={styles.subtitle}>Solusi Perbaikan Ban Kendaraan</Text>
                        <View style={styles.divider} />
                        <Text style={styles.tagline}>Mudah dan Cepat</Text>
                    </Animated.View>

                    {/* Loading Section */}
                    <Animated.View
                        style={[
                            styles.loadingSection,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <View style={styles.loadingContainer}>
                            <Animated.View
                                style={[
                                    styles.loadingBar,
                                    { width: loadingWidth }
                                ]}
                            />
                        </View>
                        <Text style={styles.loadingText}>Memuat aplikasi...</Text>
                    </Animated.View>
                </View>

                {/* Footer */}
                <Animated.View
                    style={[
                        styles.footer,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Text style={styles.footerText}>Powered by</Text>
                    <Text style={styles.companyName}>Netris Team</Text>
                    <Text style={styles.companyName}>Sistem Informasi Telkom University Surabaya</Text>
                    <Text style={styles.version}>v1.0</Text>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E62E05',
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    circle1: {
        width: 250,
        height: 250,
        top: -125,
        right: -125,
    },
    circle2: {
        width: 180,
        height: 180,
        bottom: -90,
        left: -90,
    },
    circle3: {
        width: 120,
        height: 120,
        top: height * 0.2,
        left: -60,
    },
    circle4: {
        width: 80,
        height: 80,
        bottom: height * 0.3,
        right: -40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoWrapper: {
        position: 'relative',
        padding: 25,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    logo: {
        width: 100,
        height: 100,
    },
    logoGlow: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: -1,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    mainTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 8,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        letterSpacing: 1,
        fontWeight: '400',
        marginBottom: 20,
    },
    divider: {
        width: 80,
        height: 2,
        backgroundColor: 'white',
        marginBottom: 15,
        borderRadius: 1,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontStyle: 'italic',
        letterSpacing: 2,
    },
    loadingSection: {
        alignItems: 'center',
        width: '100%',
    },
    loadingContainer: {
        width: 200,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        marginBottom: 15,
        overflow: 'hidden',
    },
    loadingBar: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '300',
        letterSpacing: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: '300',
    },
    companyName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        letterSpacing: 1,
    },
    version: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        marginTop: 3,
        letterSpacing: 1,
    },
});