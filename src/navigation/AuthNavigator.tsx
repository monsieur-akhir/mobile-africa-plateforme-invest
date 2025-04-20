import React, { useContext, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import MainNavigator from './MainNavigator';
import KycIdentityScreen from '../screens/kyc/KycIdentityScreen';
import KycAddressScreen from '../screens/kyc/KycAddressScreen';
import KycFinanceScreen from '../screens/kyc/KycFinanceScreen';
import KycDocumentsScreen from '../screens/kyc/KycDocumentsScreen';
import KycVerificationScreen from '../screens/kyc/KycVerificationScreen';
import KycCompletedScreen from '../screens/kyc/KycCompletedScreen';
import AuthContext from '../context/AuthContext';

// Auth screens

// Main app navigation

// KYC screens based on useKyc hook

// Context

// Types
export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    OtpVerification: { email: string; mode: 'register' | 'reset' };
    ResetPassword: { email: string; token: string };
    KycIdentity: undefined;
    KycAddress: undefined;
    KycFinance: undefined;
    KycDocuments: undefined;
    KycVerification: undefined;
    KycCompleted: undefined;
    Main: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
    const { isAuthenticated, isLoading, kycStatus, user } = useContext(AuthContext);

    // Determine if KYC is needed and which KYC screen to show
    const getInitialRouteName = () => {
        if (!isAuthenticated) return 'Welcome';
        
        // If KYC not started or in progress, direct to the appropriate KYC screen
        if (kycStatus === 'not_started') return 'KycIdentity';
        if (kycStatus === 'in_progress') {
            // Map KYC current step to the correct screen
            const kycStepMap = {
                identity: 'KycIdentity',
                address: 'KycAddress',
                finance: 'KycFinance',
                documents: 'KycDocuments',
                verification: 'KycVerification',
                completed: 'KycCompleted'
            };
            return kycStepMap[user?.kycCurrentStep || 'identity'] as keyof AuthStackParamList;
        }
        
        // If KYC is completed or approved, go to main app
        return 'Main';
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={getInitialRouteName()}
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#FFFFFF' },
                    cardShadowEnabled: true,
                    gestureEnabled: false,
                }}
            >
                {!isAuthenticated ? (
                    // Auth screens
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
                        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                    </>
                ) : (
                    // KYC and Main screens based on authentication status
                    <>
                        {(kycStatus === 'not_started' || kycStatus === 'in_progress') && (
                            <>
                                <Stack.Screen name="KycIdentity" component={KycIdentityScreen} />
                                <Stack.Screen name="KycAddress" component={KycAddressScreen} />
                                <Stack.Screen name="KycFinance" component={KycFinanceScreen} />
                                <Stack.Screen name="KycDocuments" component={KycDocumentsScreen} />
                                <Stack.Screen name="KycVerification" component={KycVerificationScreen} />
                                <Stack.Screen name="KycCompleted" component={KycCompletedScreen} />
                            </>
                        )}
                        {(kycStatus === 'completed' || kycStatus === 'approved') && (
                            <Stack.Screen name="Main" component={MainNavigator} />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    }
});

export default AuthNavigator;