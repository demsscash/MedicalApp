// hooks/useAppState.ts
import { useState } from 'react';
import { PatientInfo, PaymentInfo } from '../types';
import { ApiService } from '../services/api';
import { MOCK_PATIENT_DATA, MOCK_PAYMENT_DATA, VALID_CODES } from '../constants/mockData';

/**
 * Hook pour gérer l'état global de l'application
 */
export const useAppState = () => {
    // États pour le flux de rendez-vous
    const [appointmentCode, setAppointmentCode] = useState<string>('');
    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
    const [appointmentVerified, setAppointmentVerified] = useState<boolean>(false);

    // États pour le flux de paiement 
    const [paymentCode, setPaymentCode] = useState<string>('');
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [healthCardInserted, setHealthCardInserted] = useState<boolean>(false);
    const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);

    // États de chargement et d'erreur
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Action pour vérifier le code de rendez-vous
    const verifyAppointmentCode = async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            // Étape 1: Vérifier si le code est valide
            let isCodeValid: boolean;
            try {
                isCodeValid = await ApiService.verifyAppointmentCode(code);
            } catch (apiError) {
                console.warn('API de vérification non disponible, utilisation de données simulées', apiError);
                // En cas d'échec, vérifier si le code est dans les codes simulés valides
                isCodeValid = VALID_CODES.includes(code);
            }

            if (!isCodeValid) {
                setError('Code de rendez-vous invalide');
                setLoading(false);
                return false;
            }

            // Stocker le code du rendez-vous
            setAppointmentCode(code);

            // Étape 2: Récupérer les détails du rendez-vous avec le même code
            return await fetchAppointmentDetails(code);
        } catch (err) {
            console.error('Erreur lors de la vérification du code:', err);
            setError('Erreur lors de la vérification. Veuillez contacter le secrétariat.');
            setLoading(false);
            return false;
        }
    };

    // Action pour récupérer les détails du rendez-vous par code
    const fetchAppointmentDetails = async (code: string) => {
        setLoading(true);
        try {
            let details: PatientInfo | null;
            try {
                details = await ApiService.getAppointmentByCode(code);
            } catch (apiError) {
                console.warn('API de détails non disponible, utilisation de données simulées', apiError);
                // Simuler les détails du rendez-vous
                const mockData = VALID_CODES.length > 0 && MOCK_PATIENT_DATA[code];
                if (mockData) {
                    details = {
                        ...mockData,
                        price: 49,
                        couverture: 10,
                        status: "validated"
                    };
                } else {
                    details = null;
                }
            }

            if (details) {
                setPatientInfo(details);
                setAppointmentVerified(true);
                setLoading(false);
                return true;
            } else {
                setError('Détails du rendez-vous introuvables');
                setLoading(false);
                return false;
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des détails:', err);
            setError('Erreur lors de la récupération des détails. Veuillez contacter le secrétariat.');
            setLoading(false);
            return false;
        }
    };

    // Reset pour le flux de rendez-vous
    const resetAppointment = () => {
        setAppointmentCode('');
        setPatientInfo(null);
        setAppointmentVerified(false);
    };

    // Fonction locale pour simuler la vérification du code de paiement
    const mockVerifyPaymentCode = async (code: string): Promise<PaymentInfo | null> => {
        // Simule un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Retourne les données simulées si le code est valide
        if (VALID_CODES.includes(code) && MOCK_PAYMENT_DATA[code]) {
            return MOCK_PAYMENT_DATA[code];
        }

        return null;
    };

    // Actions pour le flux de paiement
    const verifyPayment = async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            // Essayer d'abord l'API réelle
            let result: PaymentInfo | null;

            try {
                // Utiliser l'API réelle
                result = await ApiService.verifyPaymentCode(code);
            } catch (apiError) {
                console.warn('API réelle non disponible, utilisation des données simulées:', apiError);
                // En cas d'échec, utiliser les données simulées pour le développement
                result = await mockVerifyPaymentCode(code);
            }

            if (result) {
                setPaymentCode(code);
                setPaymentInfo(result);
                setLoading(false);
                return true;
            } else {
                setError('Code de paiement invalide');
                setLoading(false);
                return false;
            }
        } catch (err) {
            console.error('Erreur lors de la vérification du paiement:', err);
            setError('Erreur lors de la vérification du paiement');
            setLoading(false);
            return false;
        }
    };

    const insertHealthCard = () => {
        setHealthCardInserted(true);
    };

    const completePayment = () => {
        setPaymentCompleted(true);
    };

    const resetPayment = () => {
        setPaymentCode('');
        setPaymentInfo(null);
        setHealthCardInserted(false);
        setPaymentCompleted(false);
    };

    const resetAll = () => {
        resetAppointment();
        resetPayment();
        setLoading(false);
        setError(null);
    };

    return {
        // États
        appointmentCode,
        patientInfo,
        appointmentVerified,
        paymentCode,
        paymentInfo,
        healthCardInserted,
        paymentCompleted,
        loading,
        error,

        // Actions
        verifyAppointmentCode,
        fetchAppointmentDetails,
        resetAppointment,
        verifyPayment,
        insertHealthCard,
        completePayment,
        resetPayment,
        resetAll,
        resetState: resetAll, // Alias pour l'utiliser dans les écrans

        // Setters
        setAppointmentCode,
        setPaymentCode,
        setLoading,
        setError
    };
};

export default useAppState;