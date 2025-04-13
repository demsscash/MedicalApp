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
    const [appointmentConfirmed, setAppointmentConfirmed] = useState<boolean>(false);

    // États pour le flux de paiement 
    const [paymentCode, setPaymentCode] = useState<string>('');
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [healthCardInserted, setHealthCardInserted] = useState<boolean>(false);
    const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);

    // États de chargement et d'erreur
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

    // Actions pour le flux de rendez-vous
    const verifyAppointment = async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            // Essayer d'abord l'API réelle
            let result: PatientInfo | null;

            try {
                // Utiliser l'API réelle
                result = await ApiService.verifyAppointmentCode(code);
            } catch (apiError) {
                console.warn('API réelle non disponible, utilisation des données simulées:', apiError);
                // En cas d'échec, utiliser les données simulées pour le développement
                result = MOCK_PATIENT_DATA[code] || null;
            }

            if (result) {
                setAppointmentCode(code);
                setPatientInfo(result);
                setAppointmentVerified(true);
                return true;
            } else {
                setError('Code de rendez-vous invalide');
                return false;
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.message && err.message.includes('Requête abandonnée')) {
                setError('Le serveur ne répond pas. Veuillez réessayer plus tard.');
            } else {
                setError('Erreur lors de la vérification. Veuillez contacter le secrétariat.');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour confirmer le rendez-vous
    const confirmAppointment = async (appointmentId: number) => {
        setLoading(true);
        setError(null);

        try {
            // Essayer d'abord l'API réelle
            let success = false;

            try {
                // Utiliser l'API réelle
                success = await ApiService.confirmAppointment(appointmentId);
            } catch (apiError) {
                console.warn('API réelle non disponible, simulation de confirmation:', apiError);
                // En cas d'échec, simuler le succès pour le développement
                success = true;
            }

            if (success) {
                setAppointmentConfirmed(true);
                return true;
            } else {
                setError('Erreur lors de la confirmation du rendez-vous');
                return false;
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.message && err.message.includes('Requête abandonnée')) {
                setError('Le serveur ne répond pas. Veuillez réessayer plus tard.');
            } else {
                setError('Erreur lors de la confirmation. Veuillez contacter le secrétariat.');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetAppointment = () => {
        setAppointmentCode('');
        setPatientInfo(null);
        setAppointmentVerified(false);
        setAppointmentConfirmed(false);
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
                return true;
            } else {
                setError('Code de paiement invalide');
                return false;
            }
        } catch (err) {
            setError('Erreur lors de la vérification du paiement');
            return false;
        } finally {
            setLoading(false);
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
        appointmentConfirmed,
        paymentCode,
        paymentInfo,
        healthCardInserted,
        paymentCompleted,
        loading,
        error,

        // Actions
        verifyAppointment,
        confirmAppointment,
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