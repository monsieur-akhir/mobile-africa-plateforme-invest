import React, { useContext } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AuthNavigator, { AuthStackParamList } from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingScreen';
import AuthContext, { AuthProvider } from '../context/AuthContext';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';


//
// 1. Define App (signed-in) bottom‐tab navigator and its params
//
export type AppTabParamList = {
Home: undefined;
Profile: undefined;
Settings: undefined;
};
const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator: React.FC = () => (
<Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
            let iconName: string = 'ellipse';
            if (route.name === 'Home') iconName = 'home-outline';
            else if (route.name === 'Profile') iconName = 'person-outline';
            else if (route.name === 'Settings') iconName = 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
    })}
>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
</Tab.Navigator>
);

//
// 2. Root switch between Auth vs App flows
//
type RootStackParamList = {
Auth: undefined;
App: undefined;
};
const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
const { isLoading, token: userToken } = useContext(AuthContext);

if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2f95dc" />
        </View>
    );
}

return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
            <RootStack.Screen name="App" component={AppNavigator} />
        )}
    </RootStack.Navigator>
);
};

//
// 3. Main entrypoint wrapping in NavigationContainer & AuthProvider
//
const MainNavigator: React.FC = () => (
<AuthProvider>
    <NavigationContainer>
        <RootNavigator />
    </NavigationContainer>
</AuthProvider>
);

export default MainNavigator;

//
// 4. Styles
//
const styles = StyleSheet.create({
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
});