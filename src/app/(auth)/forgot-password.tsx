import React, { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";

// Form validation schema
const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const { resetPassword } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setIsSubmitting(true);
            await resetPassword(data.email);
            setResetSent(true);
        } catch (error) {
            Alert.alert(
                "Error",
                "Failed to send password reset email. Please try again."
            );
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (resetSent) {
        return (
            <View style={styles.container}>
                <Text variant="headlineMedium" style={styles.title}>
                    Reset Email Sent
                </Text>
                <Text style={styles.message}>
                    We've sent an email with instructions to reset your password. Please check your inbox.
                </Text>
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => router.replace("/login")}
                >
                    Return to Sign In
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>
                Forgot Password
            </Text>
            <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to reset your password.
            </Text>

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
                    />
                )}
            />
            {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    "Reset Password"
                )}
            </Button>

            <View style={styles.linkContainer}>
                <Text>Remember your password? </Text>
                <Link href="/(auth)/login" asChild>
                    <Text style={styles.link}>Sign In</Text>
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
        marginBottom: 12,
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
        color: "red",
        fontSize: 12,
        marginBottom: 8,
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
    message: {
        textAlign: "center",
        marginBottom: 24,
    },
});