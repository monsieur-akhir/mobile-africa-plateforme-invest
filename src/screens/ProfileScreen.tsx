import React, { useState, useEffect, useContext } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import AuthContext from '../context/AuthContext';
import { AppTabParamList } from '../navigation/MainNavigator';
import {
View,
Text,
StyleSheet,
Image,
TouchableOpacity,
ScrollView,
TextInput,
ActivityIndicator,
Alert,
Platform
} from 'react-native';

type ProfileNavigationProp = NativeStackNavigationProp<AppTabParamList, 'Profile'>;

interface ProfileData {
id: string;
name: string;
email: string;
phone: string;
bio: string;
profileImage: string | null;
}

const ProfileScreen: React.FC = () => {
const navigation = useNavigation<ProfileNavigationProp>();
const { user } = useContext(AuthContext);

const [isLoading, setIsLoading] = useState(true);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [profileData, setProfileData] = useState<ProfileData>({
    id: '1',
    name: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: null
});

useEffect(() => {
    loadProfileData();
    requestMediaLibraryPermissions();
}, []);

const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera roll permissions to update your profile picture.'
            );
        }
    }
};

const loadProfileData = async () => {
    try {
        setIsLoading(true);
        // Simulate API call or get from AsyncStorage
        const storedProfile = await AsyncStorage.getItem('profileData');
        
        // If we have stored profile data, use it
        if (storedProfile) {
            setProfileData(JSON.parse(storedProfile));
        } else {
            // Otherwise use default data based on authentication
            setProfileData({
                id: user?.id || '1',
                name: user?.name || 'John Doe',
                email: user?.email || 'john.doe@example.com',
                phone: '',
                bio: 'Software developer passionate about mobile applications',
                profileImage: null
            });
        }
    } catch (error) {
        console.error('Failed to load profile data:', error);
        Alert.alert('Error', 'Failed to load profile data');
    } finally {
        setIsLoading(false);
    }
};

const saveProfileData = async () => {
    try {
        setIsSaving(true);
        // Validate profile data
        if (!profileData.name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save to local storage
        await AsyncStorage.setItem('profileData', JSON.stringify(profileData));
        
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
        console.error('Failed to save profile data:', error);
        Alert.alert('Error', 'Failed to save profile data');
    } finally {
        setIsSaving(false);
    }
};

const handlePickImage = async () => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setProfileData(prev => ({
                ...prev,
                profileImage: result.assets[0].uri
            }));
        }
    } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to pick image');
    }
};

if (isLoading) {
    return (
        <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2f95dc" />
        </SafeAreaView>
    );
}

return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => isEditing ? saveProfileData() : setIsEditing(true)}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.editButtonText}>
                        {isEditing ? 'Save' : 'Edit'}
                    </Text>
                )}
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.profileImageContainer}>
                <Image 
                    source={
                        profileData.profileImage 
                            ? { uri: profileData.profileImage } 
                            : require('../assets/default-avatar.png')
                    } 
                    style={styles.profileImage} 
                />
                {isEditing && (
                    <TouchableOpacity 
                        style={styles.changePhotoButton}
                        onPress={handlePickImage}
                    >
                        <Ionicons name="camera" size={22} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Name</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={profileData.name}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                            placeholder="Enter your name"
                        />
                    ) : (
                        <Text style={styles.infoValue}>{profileData.name}</Text>
                    )}
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Email</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={profileData.email}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                        />
                    ) : (
                        <Text style={styles.infoValue}>{profileData.email}</Text>
                    )}
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={profileData.phone}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                        />
                    ) : (
                        <Text style={styles.infoValue}>
                            {profileData.phone || 'Not specified'}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.bioSection}>
                <Text style={styles.bioLabel}>About Me</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.bioInput}
                        value={profileData.bio}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                        placeholder="Tell us about yourself"
                        multiline
                        numberOfLines={4}
                    />
                ) : (
                    <Text style={styles.bioText}>{profileData.bio || 'No bio provided'}</Text>
                )}
            </View>

            <View style={styles.actionsSection}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Settings')}>
                    <Ionicons name="settings-outline" size={22} color="#2f95dc" />
                    <Text style={styles.actionButtonText}>Settings</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Help', 'Contact support at support@example.com')}>
                    <Ionicons name="help-circle-outline" size={22} color="#2f95dc" />
                    <Text style={styles.actionButtonText}>Help & Support</Text>
                </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
editButton: {
    backgroundColor: '#2f95dc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
},
editButtonText: {
    color: '#fff',
    fontWeight: '600',
},
scrollView: {
    flex: 1,
},
profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
},
profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
},
changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#2f95dc',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
},
infoSection: {
    backgroundColor: '#fff',
    marginTop: 24,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
},
infoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
},
infoLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
},
infoValue: {
    fontSize: 16,
    color: '#000',
},
input: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2f95dc',
},
bioSection: {
    backgroundColor: '#fff',
    marginTop: 24,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
},
bioLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
},
bioText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
},
bioInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 120,
},
actionsSection: {
    backgroundColor: '#fff',
    marginTop: 24,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 24,
},
actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
},
actionButtonText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
},
});

export default ProfileScreen;