import React, { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { Text, Button, TextInput, HelperText, Checkbox } from "react-native-paper";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import * as SecureStore from 'expo-secure-store';

// Form validation schema
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { signIn } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setIsSubmitting(true);
            
            // Call the signIn method from AuthContext
            const result = await signIn(data.email, data.password);
            
            // Store credentials if "Remember Me" is checked
            if (data.rememberMe) {
                await SecureStore.setItemAsync('userEmail', data.email);
                // Don't store password in plain text for security reasons
            }
            
            // Redirect to home screen or dashboard upon successful login
            router.replace("/(tabs)");
            
        } catch (error: any) {
            // Handle specific error cases
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError('root', {
                    message: 'Invalid email or password'
                });
            } else if (error.code === 'auth/too-many-requests') {
                setError('root', {
                    message: 'Too many failed attempts. Please try again later.'
                });
            } else if (error.code === 'auth/network-request-failed') {
                Alert.alert(
                    "Network Error",
                    "Unable to connect to the server. Please check your internet connection."
                );
            } else {
                Alert.alert(
                    "Login Failed",
                    error.message || "An unknown error occurred. Please try again."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Sign in to continue to your account
            </Text>

            {errors.root && (
                <HelperText type="error" visible={!!errors.root} style={styles.errorText}>
                    {errors.root.message}
                </HelperText>
            )}

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="Email"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!errors.email}
                        style={styles.input}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        disabled={isSubmitting}
                        left={<TextInput.Icon icon="email" />}
                        testID="email-input"
                    />
                )}
            />
            {errors.email && (
                <HelperText type="error" visible={!!errors.email}>
                    {errors.email.message}
                </HelperText>
            )}

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="Password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!errors.password}
                        style={styles.input}
                        secureTextEntry={!passwordVisible}
                        disabled={isSubmitting}
                        left={<TextInput.Icon icon="lock" />}
                        right={
                            <TextInput.Icon
                                icon={passwordVisible ? "eye-off" : "eye"}
                                onPress={() => setPasswordVisible(!passwordVisible)}
                            />
                        }
                        testID="password-input"
                    />
                )}
            />
            {errors.password && (
                <HelperText type="error" visible={!!errors.password}>
                    {errors.password.message}
                </HelperText>
            )}

            <View style={styles.rememberForgotContainer}>
                <Controller
                    control={control}
                    name="rememberMe"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                status={value ? "checked" : "unchecked"}
                                onPress={() => onChange(!value)}
                                testID="remember-me-checkbox"
                            />
                            <Text onPress={() => onChange(!value)}>Remember me</Text>
                        </View>
                    )}
                />

                <Link href="/forgot-password" asChild>
                    <TouchableOpacity>
                        <Text style={styles.link}>Forgot Password?</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
                disabled={isSubmitting}
                testID="login-button"
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    "Sign In"
                )}
            </Button>

            <View style={styles.linkContainer}>
                <Text>Don't have an account? </Text>
                <Link href="/sign-up" asChild>
                    <Text style={styles.link}>Sign Up</Text>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    title: {
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        marginBottom: 24,
        textAlign: "center",
        opacity: 0.7,
    },
    input: {
        marginBottom: 8,
        backgroundColor: "transparent",
    },
    button: {
        marginTop: 24,
        paddingVertical: 8,
    },
    errorText: {
        textAlign: "center",
        marginBottom: 16,
    },
    rememberForgotContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    linkContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    link: {
        color: "#1E88E5",
        fontWeight: "bold",
    },
});