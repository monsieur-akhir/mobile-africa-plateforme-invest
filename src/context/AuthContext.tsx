import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for the auth context
type User = {
    id: string;
    email: string;
    name: string;
    // Add other user properties as needed
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (userData: Partial<User>) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
};

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    resetPassword: async () => {},
    updateUserProfile: async () => {},
    signIn: async () => {},
});

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Auth provider props
type AuthProviderProps = {
    children: ReactNode;
};

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if the user is already logged in
    useEffect(() => {
        const loadStoredAuthState = async () => {
            try {
                const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
                const storedUser = await AsyncStorage.getItem(USER_KEY);
                
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load auth state:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredAuthState();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            
            // This would be replaced with an actual API call
            // Example: const response = await api.post('/auth/login', { email, password });
            
            // Simulate API response
            const mockResponse = {
                user: {
                    id: '12345',
                    email,
                    name: 'John Doe',
                },
                token: 'mock_jwt_token'
            };
            
            // Save to state
            setUser(mockResponse.user);
            setToken(mockResponse.token);
            
            // Save to storage
            await AsyncStorage.setItem(TOKEN_KEY, mockResponse.token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockResponse.user));
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (email: string, password: string, name: string) => {
        try {
            setIsLoading(true);
            
            // This would be replaced with an actual API call
            // Example: const response = await api.post('/auth/register', { email, password, name });
            
            // Simulate API response
            const mockResponse = {
                user: {
                    id: '12345',
                    email,
                    name,
                },
                token: 'mock_jwt_token'
            };
            
            // Save to state
            setUser(mockResponse.user);
            setToken(mockResponse.token);
            
            // Save to storage
            await AsyncStorage.setItem(TOKEN_KEY, mockResponse.token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockResponse.user));
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            setIsLoading(true);
            
            // Clear storage
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
            
            // Clear state
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        try {
            setIsLoading(true);
            // This would be replaced with an actual API call
            // Example: await api.post('/auth/reset-password', { email });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Update user profile
    const updateUserProfile = async (userData: Partial<User>) => {
        try {
            setIsLoading(true);
            
            // This would be replaced with an actual API call
            // Example: const response = await api.put('/user/profile', userData);
            
            // Simulate API response
            const updatedUser = { ...user, ...userData };
            
            // Update state
            setUser(updatedUser as User);
            
            // Update storage
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Value object for the context provider
    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
        signIn: login, // Using login function for signIn since they appear to be the same
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};

export default AuthContext;