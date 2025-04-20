import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, HelperText, Button as PaperButton, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Schéma de validation pour le formulaire d'inscription
const registerSchema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
        .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterScreen = () => {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [secureTextEntry, setSecureTextEntry] = useState({
        password: true,
        confirmPassword: true
    });
    const theme = useTheme();

    const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nom: '',
            prenom: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const toggleSecureEntry = (field: 'password' | 'confirmPassword') => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSecureTextEntry(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setLoading(true);
            setServerError(null);
            
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            // TODO: Implémenter l'appel API pour l'inscription
            // Simulation d'une requête asynchrone
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Rediriger vers la page de connexion après l'inscription
            router.replace('/login');
        } catch (error) {
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            setServerError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
            console.error("Erreur d'inscription:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="auto" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <Text style={styles.title}>Créer un compte</Text>
                        <Text style={styles.subtitle}>Veuillez remplir tous les champs pour vous inscrire</Text>
                        
                        {serverError && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                {serverError}
                            </Text>
                        )}

                        <View style={styles.form}>
                            <Controller
                                control={control}
                                name="nom"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <TextInput
                                            label="Nom"
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={!!errors.nom}
                                            style={styles.input}
                                            autoCapitalize="words"
                                            disabled={loading}
                                        />
                                        {errors.nom && (
                                            <HelperText type="error" visible={!!errors.nom}>
                                                {errors.nom.message}
                                            </HelperText>
                                        )}
                                    </>
                                )}
                            />

                            <Controller
                                control={control}
                                name="prenom"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <TextInput
                                            label="Prénom"
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={!!errors.prenom}
                                            style={styles.input}
                                            autoCapitalize="words"
                                            disabled={loading}
                                        />
                                        {errors.prenom && (
                                            <HelperText type="error" visible={!!errors.prenom}>
                                                {errors.prenom.message}
                                            </HelperText>
                                        )}
                                    </>
                                )}
                            />

                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <TextInput
                                            label="Email"
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={!!errors.email}
                                            style={styles.input}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            disabled={loading}
                                        />
                                        {errors.email && (
                                            <HelperText type="error" visible={!!errors.email}>
                                                {errors.email.message}
                                            </HelperText>
                                        )}
                                    </>
                                )}
                            />

                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <TextInput
                                            label="Mot de passe"
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={!!errors.password}
                                            secureTextEntry={secureTextEntry.password}
                                            style={styles.input}
                                            right={
                                                <TextInput.Icon
                                                    icon={secureTextEntry.password ? 'eye' : 'eye-off'}
                                                    onPress={() => toggleSecureEntry('password')}
                                                />
                                            }
                                            disabled={loading}
                                        />
                                        {errors.password && (
                                            <HelperText type="error" visible={!!errors.password}>
                                                {errors.password.message}
                                            </HelperText>
                                        )}
                                    </>
                                )}
                            />

                            <Controller
                                control={control}
                                name="confirmPassword"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <TextInput
                                            label="Confirmer le mot de passe"
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={!!errors.confirmPassword}
                                            secureTextEntry={secureTextEntry.confirmPassword}
                                            style={styles.input}
                                            right={
                                                <TextInput.Icon
                                                    icon={secureTextEntry.confirmPassword ? 'eye' : 'eye-off'}
                                                    onPress={() => toggleSecureEntry('confirmPassword')}
                                                />
                                            }
                                            disabled={loading}
                                        />
                                        {errors.confirmPassword && (
                                            <HelperText type="error" visible={!!errors.confirmPassword}>
                                                {errors.confirmPassword.message}
                                            </HelperText>
                                        )}
                                    </>
                                )}
                            />

                            <PaperButton
                                mode="contained"
                                onPress={handleSubmit(onSubmit)}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                            >
                                S'inscrire
                            </PaperButton>

                            <View style={styles.linkContainer}>
                                <Text style={styles.linkText}>Vous avez déjà un compte?</Text>
                                <Text
                                    style={styles.link}
                                    onPress={() => {
                                        if (Platform.OS !== 'web') {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        }
                                        router.replace('/login');
                                    }}
                                >
                                    {" Se connecter"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: 24,
        paddingVertical: 8,
        borderRadius: 8,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    linkText: {
        marginRight: 5,
    },
    link: {
        color: '#0066cc',
        fontWeight: 'bold',
    }
});

export default RegisterScreen;