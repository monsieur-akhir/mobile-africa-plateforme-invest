import { useState, useCallback, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/AuthContext';

// Types pour le processus KYC
export type KycStep = 'identity' | 'address' | 'finance' | 'documents' | 'verification' | 'completed';
export type KycStatus = 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
export type KycDocument = {
    id: string;
    type: 'id_card' | 'passport' | 'driver_license' | 'proof_of_address' | 'bank_statement';
    status: 'pending' | 'verified' | 'rejected';
    uploadDate: Date;
    verificationDate?: Date;
    rejectionReason?: string;
};

interface KycState {
    currentStep: KycStep;
    status: KycStatus;
    completedSteps: KycStep[];
    documents: KycDocument[];
    verificationStartDate?: Date;
    verificationEndDate?: Date;
}

/**
 * Hook pour gérer le processus KYC (Know Your Customer)
 * Fournit des fonctions pour naviguer et gérer les étapes de vérification d'identité
 */
export function useKyc() {
    // État pour le processus KYC
    const [kycState, setKycState] = useState<KycState>({
        currentStep: 'identity',
        status: 'not_started',
        completedSteps: [],
        documents: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Récupérer le contexte d'authentification
    const authContext = useContext(AuthContext);
    
    // Charger les données KYC depuis le stockage
    useEffect(() => {
        const loadKycData = async () => {
            try {
                setLoading(true);
                const storedData = await AsyncStorage.getItem('kyc_data');
                
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    // Conversion des dates string en objets Date
                    if (parsedData.documents) {
                        parsedData.documents = parsedData.documents.map((doc: any) => ({
                            ...doc,
                            uploadDate: new Date(doc.uploadDate),
                            verificationDate: doc.verificationDate ? new Date(doc.verificationDate) : undefined
                        }));
                    }
                    
                    if (parsedData.verificationStartDate) {
                        parsedData.verificationStartDate = new Date(parsedData.verificationStartDate);
                    }
                    
                    if (parsedData.verificationEndDate) {
                        parsedData.verificationEndDate = new Date(parsedData.verificationEndDate);
                    }
                    
                    setKycState(parsedData);
                }
            } catch (err) {
                setError("Erreur lors du chargement des données KYC");
                console.error("Erreur de chargement KYC:", err);
            } finally {
                setLoading(false);
            }
        };
        
        if (authContext?.isAuthenticated) {
            loadKycData();
        }
    }, [authContext?.isAuthenticated]);
    
    // Sauvegarder les données KYC
    const saveKycData = async (data: KycState) => {
        try {
            await AsyncStorage.setItem('kyc_data', JSON.stringify(data));
        } catch (err) {
            console.error("Erreur lors de la sauvegarde des données KYC:", err);
            throw new Error("Impossible de sauvegarder les données KYC");
        }
    };
    
    // Passer à l'étape suivante du processus KYC
    const goToNextStep = useCallback(async () => {
        try {
            setLoading(true);
            
            const stepOrder: KycStep[] = ['identity', 'address', 'finance', 'documents', 'verification', 'completed'];
            const currentIndex = stepOrder.indexOf(kycState.currentStep);
            
            if (currentIndex < stepOrder.length - 1) {
                const nextStep = stepOrder[currentIndex + 1];
                const updatedCompletedSteps = [...kycState.completedSteps];
                
                if (!updatedCompletedSteps.includes(kycState.currentStep)) {
                    updatedCompletedSteps.push(kycState.currentStep);
                }
                
                const newState: KycState = {
                    ...kycState,
                    currentStep: nextStep,
                    completedSteps: updatedCompletedSteps,
                    status: nextStep === 'completed' ? 'approved' : 'in_progress'
                };
                
                setKycState(newState);
                await saveKycData(newState);
            }
        } catch (err) {
            setError("Erreur lors du passage à l'étape suivante");
            console.error("Erreur d'étape KYC:", err);
        } finally {
            setLoading(false);
        }
    }, [kycState]);
    
    // Télécharger un document
    const uploadDocument = useCallback(async (type: KycDocument['type'], fileUri: string) => {
        try {
            setLoading(true);
            // Simulation d'un appel API pour télécharger le document
            // En production, il faudrait envoyer le document à un backend sécurisé
            
            // Créer un nouveau document
            const newDocument: KycDocument = {
                id: Date.now().toString(),
                type,
                status: 'pending',
                uploadDate: new Date()
            };
            
            const updatedDocuments = [...kycState.documents, newDocument];
            const newState = {
                ...kycState,
                documents: updatedDocuments
            };
            
            setKycState(newState);
            await saveKycData(newState);
            
            return newDocument.id;
        } catch (err) {
            setError("Erreur lors du téléchargement du document");
            console.error("Erreur de téléchargement:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [kycState]);
    
    // Soumettre le KYC pour vérification
    const submitForVerification = useCallback(async () => {
        try {
            setLoading(true);
            
            const newState: KycState = {
                ...kycState,
                status: 'pending_review',
                verificationStartDate: new Date()
            };
            
            setKycState(newState);
            await saveKycData(newState);
            
            // Ici, vous pourriez faire un appel API pour informer le backend
            // que l'utilisateur a soumis son KYC pour vérification
            
            return true;
        } catch (err) {
            setError("Erreur lors de la soumission pour vérification");
            console.error("Erreur de soumission KYC:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [kycState]);
    
    // Réinitialiser le processus KYC
    const resetKyc = useCallback(async () => {
        try {
            setLoading(true);
            
            const initialState: KycState = {
                currentStep: 'identity',
                status: 'not_started',
                completedSteps: [],
                documents: []
            };
            
            setKycState(initialState);
            await saveKycData(initialState);
            
            return true;
        } catch (err) {
            setError("Erreur lors de la réinitialisation du processus KYC");
            console.error("Erreur de réinitialisation KYC:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Vérifier si l'étape est complétée
    const isStepCompleted = useCallback((step: KycStep) => {
        return kycState.completedSteps.includes(step);
    }, [kycState.completedSteps]);
    
    // Vérifier si le KYC est approuvé
    const isKycApproved = useCallback(() => {
        return kycState.status === 'approved';
    }, [kycState.status]);
    
    return {
        kycState,
        loading,
        error,
        goToNextStep,
        uploadDocument,
        submitForVerification,
        resetKyc,
        isStepCompleted,
        isKycApproved
    };
}