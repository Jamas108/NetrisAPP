import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { Box, HStack, Image, Heading, Pressable } from "native-base";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const HeaderNoAuth = ({ 
  title, 
  withBack = false, 
  showAddButton = false, 
  onAddPress 
}) => {
  const trueGray900 = "#E62E05";
  
  // Define colors yang sama dengan HomeAdmin
  const COLORS = {
    primary: "#E62E05",
    secondary: "#FFD600",
    light: "#FFFFFF"
  };
  
  const navigation = useNavigation();
  
  // Handle untuk navigasi ke tambah tambal ban
  const handleAddTambalBan = () => {
    try {
      navigation.navigate('AddTambalBan');
    } catch (error) {
      console.error("Error navigating to AddTambalBan:", error);
    }
  };
  
  return (
    <SafeAreaView>
      <StatusBar barStyle="light" backgroundColor={trueGray900} />
      <Box bg={"#E62E05"} p={"4"} position="relative">
        <HStack justifyContent="space-between" alignItems="center">
          {/* Left Side - Logo/Back + Title */}
          <HStack alignItems="center" flex={1}>
            {!withBack ? (
              <>
                <Image
                  source={require("../assets/logonetriss.png")}
                  w="10"
                  h="10"
                  alt="Netris Logo"
                  mr={"3"}
                />
              </>
            ) : (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => navigation.goBack()}
              >
                <Box mr={"3"}>
                  <Ionicons name="arrow-back-outline" size={32} color="white" />
                </Box>
              </TouchableOpacity>
            )}
            <Heading color={"white"} fontSize="lg">{title}</Heading>
          </HStack>
         
        
        </HStack>
      </Box>
    </SafeAreaView>
  );
};

export default HeaderNoAuth;