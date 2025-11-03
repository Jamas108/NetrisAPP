import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider, Text } from "native-base";
import Ionicons from "@expo/vector-icons/Ionicons";
import Home from "./screens/home";
import About from "./screens/about";
import Profile from "./screens/profile";
import Splash from "./screens/splash";
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";

// Pengguna Screen
import PenggunaAbout from "./screens/Pengguna/PenggunaAbout";
import PenggunaHome from "./screens/Pengguna/PenggunaHome";
import PenggunaProfile from "./screens/Pengguna/PenggunaProfile";

// Admin screens
import HomeAdmin from "./screens/Admin/HomeAdmin";
import UserManagement from "./screens/Admin/UserManagement";
import AdminProfile from "./screens/Admin/AdminProfile";
import AdminReports from "./screens/Admin/AdminReports";
import AddTambalBanScreen from "./screens/Admin/AddTambalBanScreen";
import EditTambalBanScreen from "./screens/Admin/EditTambalBanScreen";
import ApprovalScreen from "./screens/Admin/ApprovalTambalBanScreen";
import ApprovalDetailScreen from "./screens/Admin/ApprovalDetailScreen";

// SuperAdmin screens
import HomeSuperAdmin from "./screens/Superadmin/HomeSuperAdmin";
import UserManagementScreen from "./screens/Superadmin/UserManagement";
import SuperAdminProfile from "./screens/Superadmin/SuperAdminProfile";
import RekapData from "./screens/Superadmin/RekapData";

// Navigator Declaration
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const noHead = { headerShown: false };

// Bottom Tab Navigator for Regular Users (Pengguna)
const GuestTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Informasi":
              iconName = "information-circle-outline";
              break;
            case "Profil":
              iconName = "person-circle-outline";
              break;
          }
          return (
            <Ionicons
              name={iconName}
              size={28}
              color={focused ? "#E62E05" : color}
            />
          );
        },
        tabBarIconStyle: { marginTop: 5 },
        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
        },
        tabBarLabel: ({ children, color, focused }) => {
          return (
            <Text color={focused ? "#E62E05" : color} mb={2}>
              {children}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={noHead} />
      <Tab.Screen name="Informasi" component={About} options={noHead} />
      <Tab.Screen name="Profil" component={Profile} options={noHead} />
    </Tab.Navigator>
  );
};
const PenggunaTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Informasi":
              iconName = "information-circle-outline";
              break;
            case "Profil":
              iconName = "person-circle-outline";
              break;
          }
          return (
            <Ionicons
              name={iconName}
              size={28}
              color={focused ? "#E62E05" : color}
            />
          );
        },
        tabBarIconStyle: { marginTop: 5 },
        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
        },
        tabBarLabel: ({ children, color, focused }) => {
          return (
            <Text color={focused ? "#E62E05" : color} mb={2}>
              {children}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={PenggunaHome} options={noHead} />
      <Tab.Screen name="Informasi" component={PenggunaAbout} options={noHead} />
      <Tab.Screen name="Profil" component={PenggunaProfile} options={noHead} />
    </Tab.Navigator>
  );
};

// Bottom Tab Navigator for Admin
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Persetujuan":
              iconName = "time-outline";
              break;
            case "Profil":
              iconName = "person-circle-outline";
              break;
          }
          return (
            <Ionicons
              name={iconName}
              size={28}
              color={focused ? "#E62E05" : color}
            />
          );
        },
        tabBarIconStyle: { marginTop: 5 },
        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
        },
        tabBarLabel: ({ children, color, focused }) => {
          return (
            <Text color={focused ? "#E62E05" : color} mb={2}>
              {children}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeAdmin} options={noHead} />
      <Tab.Screen name="Persetujuan" component={ApprovalScreen} options={noHead} />
      <Tab.Screen name="Profil" component={AdminProfile} options={noHead} />
    </Tab.Navigator>
  );
};

// Bottom Tab Navigator for SuperAdmin
const SuperAdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Pengguna":
              iconName = "people-circle-outline";
              break;
            case "Rekap":
              iconName = "book-outline";
              break;
            case "Profil":
              iconName = "person-circle-outline";
              break;
          }
          return (
            <Ionicons
              name={iconName}
              size={28}
              color={focused ? "#E62E05" : color}
            />
          );
        },
        tabBarIconStyle: { marginTop: 5 },
        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
        },
        tabBarLabel: ({ children, color, focused }) => {
          return (
            <Text color={focused ? "#E62E05" : color} mb={2}>
              {children}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeSuperAdmin} options={noHead} />
      <Tab.Screen name="Pengguna" component={UserManagementScreen} options={noHead} />
      <Tab.Screen name="Rekap" component={RekapData} options={noHead} />
      <Tab.Screen name="Profil" component={SuperAdminProfile} options={noHead} />
    </Tab.Navigator>
  );
};

// Admin Stack untuk navigasi dalam role Admin
const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={noHead}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AddTambalBan" component={AddTambalBanScreen} />
      <Stack.Screen name="EditTambalBan" component={EditTambalBanScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={Splash} options={noHead} />
          <Stack.Screen name="Login" component={LoginScreen} options={noHead} />
          <Stack.Screen name="Register" component={RegisterScreen} options={noHead} />
          
          {/* Role-based navigation */}
          <Stack.Screen name="Guest" component={GuestTabs} options={noHead} />
          <Stack.Screen name="Pengguna" component={PenggunaTabs} options={noHead} />
          <Stack.Screen name="HomeAdmin" component={AdminStack} options={noHead} />
          <Stack.Screen name="HomeSuperAdmin" component={SuperAdminTabs} options={noHead} />
          <Stack.Screen name="AddTambalBanScreen" component={AddTambalBanScreen} options={noHead}/>
          <Stack.Screen name="ApprovalDetailScreen" component={ApprovalDetailScreen} options={noHead}/>
          <Stack.Screen name="EditTambalBan" component={EditTambalBanScreen} options={noHead} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;