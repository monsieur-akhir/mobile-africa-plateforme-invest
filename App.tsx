import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useAuth } from './hooks/useAuth';

// Screens

// Navigation types
type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

type AppStackParamList = {
    Home: undefined;
    Profile: { userId?: string };
    Settings: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Auth Navigator
const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

// App Navigator
const AppNavigator = () => (
    <AppStack.Navigator>
        <AppStack.Screen name="Home" component={HomeScreen} />
        <AppStack.Screen name="Profile" component={ProfileScreen} />
        <AppStack.Screen name="Settings" component={SettingsScreen} />
    </AppStack.Navigator>
);

// Main Navigation Component
const Navigation = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        // Return a loading screen
        return <View style={{ flex: 1 }} />;
    }
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

// App Entry Point
export default function App() {
    const [fontsLoaded] = useFonts({
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
    });
    React.useEffect(() => {
        async function prepare() {
            await SplashScreen.preventAutoHideAsync();
        }
        prepare();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    SplashScreen.hideAsync();
    }

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Navigation />
                <StatusBar style="auto" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}