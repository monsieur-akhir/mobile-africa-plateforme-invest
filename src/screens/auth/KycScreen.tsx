import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Image, Alert } from 'react-native';
import { Text, TextInput, HelperText, Button, useTheme, Divider, Chip, Avatar, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

// Schéma de validation pour le processus KYC
const kycSchema = z.object({
    identityType: z.enum(['passport', 'idCard', 'driverLicense']),
    documentNumber: z.string().min(5, "Le numéro de document doit contenir au moins 5 caractères"),
    fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
    dateOfBirth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Format de date invalide (JJ/MM/AAAA)"),
    address: z.string().min(10, "L'adresse doit être complète"),
    postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide"),
    city: z.string().min(2, "Veuillez entrer une ville valide"),
    country: z.string().min(2, "Veuillez entrer un pays valide"),
    phoneNumber: z.string().regex(/^(\+\d{1,3})?\d{9,10}$/, "Numéro de téléphone invalide")
});

type KycFormData = z.infer<typeof kycSchema>;

const KycScreen = () => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [serverError, setServerError] = useState<string | null>(null);
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const theme = useTheme();

    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<KycFormData>({
        resolver: zodResolver(kycSchema),
        defaultValues: {
            identityType: 'idCard',
            documentNumber: '',
            fullName: '',
            dateOfBirth: '',
            address: '',
            postalCode: '',
            city: '',
            country: 'France',
            phoneNumber: ''
        }
    });

    const identityType = watch('identityType');

    useEffect(() => {
        (async () => {
            // Demande de permissions pour la caméra
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus === 'granted');

            // Demande de permissions pour la localisation
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            setHasLocationPermission(locationStatus === 'granted');

            if (locationStatus === 'granted') {
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    setLocation(location);
                } catch (error) {
                    console.error("Erreur lors de la récupération de la localisation:", error);
                }
            }
        })();
    }, []);

    const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>, title: string) => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            Alert.alert(
                "Choisir une méthode",
                "Comment souhaitez-vous ajouter votre document ?",
                [
                    {
                        text: "Appareil photo",
                        onPress: async () => {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            });

                            if (!result.canceled) {
                                setImage(result.assets[0].uri);
                                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                        }
                    },
                    {
                        text: "Galerie",
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            });

                            if (!result.canceled) {
                                setImage(result.assets[0].uri);
                                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                        }
                    },
                    {
                        text: "Annuler",
                        style: "cancel"
                    }
                ]
            );
        } catch (error) {
            console.error("Erreur lors de la sélection de l'image:", error);
            Alert.alert("Erreur", "Impossible de sélectionner l'image. Veuillez réessayer.");
        }
    };

    const onSubmit = async (data: KycFormData) => {
        try {
            setLoading(true);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
                setLoading(false);
                return;
            }

            // Simulation d'envoi des données KYC
            console.log("Données KYC:", {
                ...data,
                frontImage,
                backImage,
                selfieImage,
                geoLocation: location ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy
                } : null
            });

            // Simuler un délai de traitement
            setTimeout(() => {
                Alert.alert(
                    "Vérification soumise",
                    "Votre demande de vérification a été soumise avec succès. Nous vous contacterons une fois le processus terminé.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/(tabs)")
                        }
                    ]
                );
                setLoading(false);
            }, 2000);
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
            setServerError("Une erreur est survenue. Veuillez réessayer.");
            setLoading(false);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3].map((step) => (
                <View key={step} style={styles.stepRow}>
                    <View 
                        style={[
                            styles.stepCircle, 
                            currentStep >= step ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surfaceVariant }
                        ]}
                    >
                        {currentStep > step ? (
                            <Avatar.Icon size={24} icon="check" style={{ backgroundColor: 'transparent' }} color="white" />
                        ) : (
                            <Text style={{ color: currentStep === step ? 'white' : theme.colors.onSurfaceVariant }}>{step}</Text>
                        )}
                    </View>
                    <Text style={{ color: currentStep >= step ? theme.colors.primary : theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                        {step === 1 ? "Informations personnelles" : step === 2 ? "Document d'identité" : "Vérification"}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderPersonalInfoStep = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Informations personnelles</Text>
            <Text style={styles.stepDescription}>Veuillez fournir vos informations personnelles pour la vérification KYC</Text>

            <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            label="Nom complet"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.fullName}
                            autoCapitalize="words"
                        />
                        {errors.fullName && <HelperText type="error">{errors.fullName.message}</HelperText>}
                    </>
                )}
            />

            <Controller
                control={control}
                name="dateOfBirth"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            label="Date de naissance (JJ/MM/AAAA)"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.dateOfBirth}
                            keyboardType="numeric"
                            maxLength={10}
                            placeholder="JJ/MM/AAAA"
                        />
                        {errors.dateOfBirth && <HelperText type="error">{errors.dateOfBirth.message}</HelperText>}
                    </>
                )}
            />

            <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            label="Adresse"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.address}
                            multiline
                            numberOfLines={2}
                        />
                        {errors.address && <HelperText type="error">{errors.address.message}</HelperText>}
                    </>
                )}
            />

            <View style={styles.rowContainer}>
                <Controller
                    control={control}
                    name="postalCode"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <TextInput
                                label="Code postal"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.postalCode}
                                keyboardType="numeric"
                                maxLength={5}
                            />
                            {errors.postalCode && <HelperText type="error">{errors.postalCode.message}</HelperText>}
                        </View>
                    )}
                />

                <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={{ flex: 2 }}>
                            <TextInput
                                label="Ville"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.city}
                            />
                            {errors.city && <HelperText type="error">{errors.city.message}</HelperText>}
                        </View>
                    )}
                />
            </View>

            <Controller
                control={control}
                name="country"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            label="Pays"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.country}
                        />
                        {errors.country && <HelperText type="error">{errors.country.message}</HelperText>}
                    </>
                )}
            />

            <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            label="Numéro de téléphone"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.phoneNumber}
                            keyboardType="phone-pad"
                            placeholder="+33XXXXXXXXX"
                        />
                        {errors.phoneNumber && <HelperText type="error">{errors.phoneNumber.message}</HelperText>}
                    </>
                )}
            />
        </View>
    );

    const renderDocumentStep = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Document d'identité</Text>
            <Text style={styles.stepDescription}>Veuillez sélectionner et télécharger un document d'identité valide</Text>

            <View style={styles.identityTypeContainer}>
                <Controller
                    control={control}
                    name="identityType"
                    render={({ field: { onChange, value } }) => (
                        <>
                            <Text style={styles.sectionLabel}>Type de document</Text>
                            <View style={styles.chipContainer}>
                                <Chip 
                                    selected={value === 'passport'} 
                                    onPress={() => onChange('passport')}
                                    style={[styles.chip, value === 'passport' && styles.selectedChip]}
                                    showSelectedCheck
                                >
                                    Passeport
                                </Chip>
                                <Chip 
                                    selected={value === 'idCard'} 
                                    onPress={() => onChange('idCard')}
                                    style={[styles.chip, value === 'idCard' && styles.selectedChip]}
                                    showSelectedCheck
                                >
                                    Carte d'identité
                                </Chip>
                                <Chip 
                                    selected={value === 'driverLicense'} 
                                    onPress={() => onChange('driverLicense')}
                                    style={[styles.chip, value === 'driverLicense' && styles.selectedChip]}
                                    showSelectedCheck
                                >
                                    Permis de conduire
                                </Chip>
                            </View>
                        </>
                    )}
                />
            </View>

            <Controller
                control={control}
                name="documentNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            label="Numéro de document"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.documentNumber}
                        />
                        {errors.documentNumber && <HelperText type="error">{errors.documentNumber.message}</HelperText>}
                    </>
                )}
            />

            <Text style={styles.sectionLabel}>Photos du document</Text>
            
            <View style={styles.documentUploadContainer}>
                <View style={styles.documentUploadBox}>
                    <Text style={styles.documentUploadTitle}>Recto</Text>
                    {frontImage ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: frontImage }} style={styles.imagePreview} />
                            <IconButton
                                icon="close-circle"
                                size={24}
                                style={styles.removeImageButton}
                                onPress={() => setFrontImage(null)}
                            />
                        </View>
                    ) : (
                        <Button 
                            mode="outlined" 
                            icon="camera" 
                            onPress={() => pickImage(setFrontImage, "Recto")}
                            style={styles.uploadButton}
                        >
                            Ajouter
                        </Button>
                    )}
                </View>

                {(identityType === 'idCard' || identityType === 'driverLicense') && (
                    <View style={styles.documentUploadBox}>
                        <Text style={styles.documentUploadTitle}>Verso</Text>
                        {backImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: backImage }} style={styles.imagePreview} />
                                <IconButton
                                    icon="close-circle"
                                    size={24}
                                    style={styles.removeImageButton}
                                    onPress={() => setBackImage(null)}
                                />
                            </View>
                        ) : (
                            <Button 
                                mode="outlined" 
                                icon="camera" 
                                onPress={() => pickImage(setBackImage, "Verso")}
                                style={styles.uploadButton}
                            >
                                Ajouter
                            </Button>
                        )}
                    </View>
                )}
            </View>
        </View>
    );

    const renderVerificationStep = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Vérification finale</Text>
            <Text style={styles.stepDescription}>Prenez un selfie pour confirmer votre identité</Text>

            <View style={styles.selfieContainer}>
                {selfieImage ? (
                    <View style={styles.selfiePreviewContainer}>
                        <Image source={{ uri: selfieImage }} style={styles.selfiePreview} />
                        <IconButton
                            icon="close-circle"
                            size={24}
                            style={styles.removeSelfieButton}
                            onPress={() => setSelfieImage(null)}
                        />
                    </View>
                ) : (
                    <View style={styles.selfieBox}>
                        <Avatar.Icon size={64} icon="account" />
                        <Button 
                            mode="contained" 
                            icon="camera" 
                            onPress={() => pickImage(setSelfieImage, "Selfie")}
                            style={styles.selfieButton}
                        >
                            Prendre un selfie
                        </Button>
                    </View>
                )}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Résumé des informations</Text>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Nom complet:</Text>
                    <Text style={styles.summaryValue}>{watch('fullName')}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Document:</Text>
                    <Text style={styles.summaryValue}>
                        {identityType === 'passport' ? 'Passeport' : 
                         identityType === 'idCard' ? 'Carte d\'identité' : 'Permis de conduire'}
                    </Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Num. document:</Text>
                    <Text style={styles.summaryValue}>{watch('documentNumber')}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date de naissance:</Text>
                    <Text style={styles.summaryValue}>{watch('dateOfBirth')}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Adresse:</Text>
                    <Text style={styles.summaryValue}>
                        {watch('address')}, {watch('postalCode')} {watch('city')}, {watch('country')}
                    </Text>
                </View>
            </View>

            <View style={styles.consentContainer}>
                <Text style={styles.consentText}>
                    En soumettant ces informations, je certifie que toutes les informations fournies sont exactes et complètes.
                    J'autorise la vérification de mon identité selon les termes et conditions de service.
                </Text>
            </View>
        </View>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderPersonalInfoStep();
            case 2:
                return renderDocumentStep();
            case 3:
                return renderVerificationStep();
            default:
                return null;
        }
    };

    const isNextButtonDisabled = () => {
        if (currentStep === 1) {
            return !!(errors.fullName || errors.dateOfBirth || errors.address || errors.postalCode || errors.city || errors.country || errors.phoneNumber);
        } else if (currentStep === 2) {
            return !!(errors.documentNumber || !frontImage || (identityType !== 'passport' && !backImage));
        } else if (currentStep === 3) {
            return !selfieImage;
        }
        return false;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar style="auto" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Vérification d'identité</Text>
                        <Text style={styles.subtitle}>
                            Pour sécuriser votre compte et respecter les réglementations, nous avons besoin de vérifier votre identité.
                        </Text>

                        {renderStepIndicator()}

                        {serverError && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>{serverError}</Text>
                        )}

                        {renderCurrentStep()}

                        <View style={styles.buttonsContainer}>
                            {currentStep > 1 && (
                                <Button
                                    mode="outlined"
                                    onPress={() => setCurrentStep(currentStep - 1)}
                                    style={[styles.button, styles.backButton]}
                                    disabled={loading}
                                >
                                    Retour
                                </Button>
                            )}
                            
                            <Button
                                mode="contained"
                                onPress={handleSubmit(onSubmit)}
                                style={[styles.button, styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
                                disabled={isNextButtonDisabled() || loading}
                                loading={loading}
                            >
                                {currentStep < 3 ? "Suivant" : "Soumettre"}
                            </Button>
                        </View>

                        <Button
                            mode="text"
                            onPress={() => router.back()}
                            style={styles.cancelButton}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
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
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
        padding: 16,
    },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
        opacity: 0.7,
    },
    stepIndicatorContainer: {
        marginVertical: 24,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        marginBottom: 24,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.7,
    },
    input: {
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    identityTypeContainer: {
        marginBottom: 16,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    chip: {
        margin: 4,
    },
    selectedChip: {
        backgroundColor: '#E8F5E9',
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    documentUploadContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    documentUploadBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    documentUploadTitle: {
        marginBottom: 8,
        fontWeight: '500',
    },
    uploadButton: {
        width: '100%',
    },
    imagePreviewContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 3/4,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
    },
    selfieContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    selfieBox: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#BDBDBD',
        borderRadius: 8,
        padding: 24,
        width: '100%',
    },
    selfieButton: {
        marginTop: 16,
    },
    selfiePreviewContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
        maxWidth: 300,
    },
    selfiePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeSelfieButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
    },
    divider: {
        marginVertical: 16,
    },
    summaryContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    summaryLabel: {
        fontWeight: '600',
        width: 120,
    },
    summaryValue: {
        flex: 1,
    },
    consentContainer: {
        marginTop: 16,
    },
    consentText: {
        fontSize: 12,
        opacity: 0.7,
        lineHeight: 18,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    button: {
        paddingVertical: 8,
    },
    backButton: {
        flex: 1,
        marginRight: 8,
    },
    nextButton: {
        flex: 2,
        marginLeft: 8,
    },
    fullWidthButton: {
        flex: 1,
        marginLeft: 0,
    },
    cancelButton: {
        marginTop: 8,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
});

export default KycScreen;