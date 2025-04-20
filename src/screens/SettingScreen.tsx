import React, { useContext, useState, useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppTabParamList } from '../navigation/MainNavigator';
import {
View,
Text,
StyleSheet,
ScrollView,
Switch,
TouchableOpacity,
Alert,
Platform,
ActivityIndicator
} from 'react-native';

type SettingsNavigationProp = NativeStackNavigationProp<AppTabParamList, 'Settings'>;

interface SettingItemProps {
icon: string;
title: string;
description?: string;
onPress?: () => void;
value?: boolean;
onValueChange?: (value: boolean) => void;
showToggle?: boolean;
showChevron?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
icon,
title,
description,
onPress,
value,
onValueChange,
showToggle = false,
showChevron = true
}) => {
return (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={!onPress && !showToggle}
    >
        <View style={styles.settingIconContainer}>
            <Ionicons name={icon} size={24} color="#2f95dc" />
        </View>
        <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{title}</Text>
            {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
        {showToggle && (
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#d1d1d1', true: '#2f95dc' }}
                thumbColor={Platform.OS === 'ios' ? undefined : (value ? '#ffffff' : '#f4f3f4')}
            />
        )}
        {showChevron && !showToggle && (
            <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
        )}
    </TouchableOpacity>
);
};

const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({
title,
children
}) => {
return (
    <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);
};

const SettingsScreen: React.FC = () => {
const navigation = useNavigation<SettingsNavigationProp>();
const authContext = useContext(AuthContext);
const signOut = authContext.logout ; // Use the correct method name from your AuthContext
const [isLoading, setIsLoading] = useState(false);

// Settings state
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
const [darkModeEnabled, setDarkModeEnabled] = useState(false);
const [locationEnabled, setLocationEnabled] = useState(true);
const [biometricsEnabled, setBiometricsEnabled] = useState(false);
const [appVersion, setAppVersion] = useState('1.0.0');

// Load stored settings
useEffect(() => {
    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
            const storedDarkMode = await AsyncStorage.getItem('darkModeEnabled');
            const storedLocation = await AsyncStorage.getItem('locationEnabled');
            const storedBiometrics = await AsyncStorage.getItem('biometricsEnabled');
            
            if (storedNotifications !== null) setNotificationsEnabled(JSON.parse(storedNotifications));
            if (storedDarkMode !== null) setDarkModeEnabled(JSON.parse(storedDarkMode));
            if (storedLocation !== null) setLocationEnabled(JSON.parse(storedLocation));
            if (storedBiometrics !== null) setBiometricsEnabled(JSON.parse(storedBiometrics));
        } catch (error) {
            console.error('Failed to load settings:', error);
            Alert.alert('Error', 'Failed to load your settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    loadSettings();
}, []);

// Save settings when changed
const saveSettings = async (key: string, value: boolean) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Failed to save setting:', error);
        Alert.alert('Error', 'Failed to save your preferences.');
    }
};

const handleNotificationsChange = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings('notificationsEnabled', value);
};

const handleDarkModeChange = (value: boolean) => {
    setDarkModeEnabled(value);
    saveSettings('darkModeEnabled', value);
    // Implement theme change logic here
};

const handleLocationChange = (value: boolean) => {
    setLocationEnabled(value);
    saveSettings('locationEnabled', value);
};

const handleBiometricsChange = (value: boolean) => {
    setBiometricsEnabled(value);
    saveSettings('biometricsEnabled', value);
};

const handleLogout = () => {
    Alert.alert(
        'Confirm Logout',
        'Are you sure you want to log out?',
        [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Logout', 
                style: 'destructive',
                onPress: () => {
                    setIsLoading(true);
                    // Simulate network request
                    setTimeout(() => {
                        signOut();
                        setIsLoading(false);
                    }, 500);
                }
            }
        ]
    );
};

const handleClearCache = () => {
    Alert.alert(
        'Clear Cache',
        'This will clear all cached data. Continue?',
        [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Clear', 
                style: 'destructive',
                onPress: () => {
                    setIsLoading(true);
                    // Simulate clearing cache
                    setTimeout(() => {
                        Alert.alert('Success', 'Cache cleared successfully');
                        setIsLoading(false);
                    }, 1000);
                }
            }
        ]
    );
};

const handleAbout = () => {
    // Navigate to About screen or show info
    Alert.alert(
        'About App',
        `Version: ${appVersion}\n\nThis app was developed to showcase powerful and stable mobile app development practices.`,
        [{ text: 'OK' }]
    );
};

if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2f95dc" />
        </View>
    );
}

return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
            <SettingSection title="App Preferences">
                <SettingItem
                    icon="notifications-outline"
                    title="Notifications"
                    description="Receive push notifications"
                    showToggle
                    value={notificationsEnabled}
                    onValueChange={handleNotificationsChange}
                />
                <SettingItem
                    icon="moon-outline"
                    title="Dark Mode"
                    description="Enable dark app theme"
                    showToggle
                    value={darkModeEnabled}
                    onValueChange={handleDarkModeChange}
                />
                <SettingItem
                    icon="location-outline"
                    title="Location Services"
                    description="Allow app to use your location"
                    showToggle
                    value={locationEnabled}
                    onValueChange={handleLocationChange}
                />
            </SettingSection>
            
            <SettingSection title="Security">
                <SettingItem
                    icon="finger-print-outline"
                    title="Biometric Authentication"
                    description="Use fingerprint or Face ID for login"
                    showToggle
                    value={biometricsEnabled}
                    onValueChange={handleBiometricsChange}
                />
                <SettingItem
                    icon="key-outline"
                    title="Change Password"
                    onPress={() => Alert.alert('Feature', 'Change Password functionality would be implemented here')}
                />
                <SettingItem
                    icon="shield-outline"
                    title="Privacy Policy"
                    onPress={() => Alert.alert('Feature', 'Privacy Policy would be displayed here')}
                />
            </SettingSection>
            
            <SettingSection title="Storage">
                <SettingItem
                    icon="trash-outline"
                    title="Clear Cache"
                    description="Free up storage space"
                    onPress={handleClearCache}
                />
            </SettingSection>
            
            <SettingSection title="About">
                <SettingItem
                    icon="information-circle-outline"
                    title="About"
                    description={`Version ${appVersion}`}
                    onPress={handleAbout}
                />
                <SettingItem
                    icon="help-circle-outline"
                    title="Help & Support"
                    onPress={() => Alert.alert('Feature', 'Help & Support would be displayed here')}
                />
            </SettingSection>
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2023 My App. All rights reserved.</Text>
            </View>
        </ScrollView>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
},
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
},
headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
},
scrollView: {
    flex: 1,
},
settingSection: {
    marginBottom: 24,
},
sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8e8e93',
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
},
sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
},
settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
},
settingIconContainer: {
    width: 30,
    marginRight: 10,
    alignItems: 'center',
},
settingContent: {
    flex: 1,
},
settingTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
},
settingDescription: {
    fontSize: 14,
    color: '#8e8e93',
},
logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    alignItems: 'center',
},
logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
},
footer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
},
footerText: {
    fontSize: 12,
    color: '#8e8e93',
},
});

export default SettingsScreen;