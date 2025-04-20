import React, { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { Text, Button, TextInput, HelperText } from "react-native-paper";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";

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

export default function RegisterScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const { register } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        reset
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nom: "",
            prenom: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsSubmitting(true);
            
            // Appeler la méthode signUp du contexte d'authentification
            await register(data.email, data.password, `${data.nom} ${data.prenom}`);
            
            // Réinitialiser le formulaire après inscription réussie
            reset();
            
            // Afficher un message de succès
            Alert.alert(
                "Inscription réussie",
                "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
                [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
            );
            
        } catch (error: any) {
            // Gérer les cas d'erreur spécifiques
            if (error.code === 'auth/email-already-in-use') {
                setError('email', {
                    message: 'Cette adresse email est déjà utilisée par un autre compte'
                });
            } else if (error.code === 'auth/invalid-email') {
                setError('email', {
                    message: 'Format d\'email invalide'
                });
            } else if (error.code === 'auth/weak-password') {
                setError('password', {
                    message: 'Mot de passe trop faible'
                });
            } else if (error.code === 'auth/network-request-failed') {
                Alert.alert(
                    "Erreur réseau",
                    "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet."
                );
            } else {
                Alert.alert(
                    "Erreur d'inscription",
                    error.message || "Une erreur inconnue s'est produite. Veuillez réessayer."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>Inscrivez-vous pour accéder à toutes les fonctionnalités</Text>
                
                <View style={styles.form}>
                    {/* Champ Nom */}
                    <Controller
                        control={control}
                        name="nom"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <>
                                <TextInput
                                    label="Nom"
                                    mode="outlined"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={styles.input}
                                    error={!!errors.nom}
                                    disabled={isSubmitting}
                                    left={<TextInput.Icon icon="account" />}
                                />
                                {errors.nom && (
                                    <HelperText type="error" visible={!!errors.nom}>
                                        {errors.nom.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />

                    {/* Champ Prénom */}
                    <Controller
                        control={control}
                        name="prenom"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <>
                                <TextInput
                                    label="Prénom"
                                    mode="outlined"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={styles.input}
                                    error={!!errors.prenom}
                                    disabled={isSubmitting}
                                    left={<TextInput.Icon icon="account-outline" />}
                                />
                                {errors.prenom && (
                                    <HelperText type="error" visible={!!errors.prenom}>
                                        {errors.prenom.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />

                    {/* Champ Email */}
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <>
                                <TextInput
                                    label="Email"
                                    mode="outlined"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={styles.input}
                                    error={!!errors.email}
                                    disabled={isSubmitting}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    left={<TextInput.Icon icon="email" />}
                                />
                                {errors.email && (
                                    <HelperText type="error" visible={!!errors.email}>
                                        {errors.email.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />

                    {/* Champ Mot de passe */}
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <>
                                <TextInput
                                    label="Mot de passe"
                                    mode="outlined"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={styles.input}
                                    error={!!errors.password}
                                    disabled={isSubmitting}
                                    secureTextEntry={!passwordVisible}
                                    left={<TextInput.Icon icon="lock" />}
                                    right={
                                        <TextInput.Icon
                                            icon={passwordVisible ? "eye-off" : "eye"}
                                            onPress={() => setPasswordVisible(!passwordVisible)}
                                        />
                                    }
                                />
                                {errors.password && (
                                    <HelperText type="error" visible={!!errors.password}>
                                        {errors.password.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />

                    {/* Champ Confirmation mot de passe */}
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <>
                                <TextInput
                                    label="Confirmer le mot de passe"
                                    mode="outlined"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={styles.input}
                                    error={!!errors.confirmPassword}
                                    disabled={isSubmitting}
                                    secureTextEntry={!confirmPasswordVisible}
                                    left={<TextInput.Icon icon="lock-check" />}
                                    right={
                                        <TextInput.Icon
                                            icon={confirmPasswordVisible ? "eye-off" : "eye"}
                                            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                        />
                                    }
                                />
                                {errors.confirmPassword && (
                                    <HelperText type="error" visible={!!errors.confirmPassword}>
                                        {errors.confirmPassword.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />

                    {/* Bouton d'inscription */}
                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.button}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            "S'inscrire"
                        )}
                    </Button>

                    {/* Lien vers la page de connexion */}
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Vous avez déjà un compte?</Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Connectez-vous</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
    },
    button: {
        marginTop: 24,
        paddingVertical: 8,
        borderRadius: 8,
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