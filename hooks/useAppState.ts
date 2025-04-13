// hooks/useAppState.ts
import { useState } from 'react';
import { PatientInfo, PaymentInfo } from '../types';
import ApiService from '../services/api';
import { verifyPaymentCode } from '../utils'; // Gardons la fonction simulée pour le paiement pour l'instant

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

    // Actions pour le flux de rendez-vous
    const verifyAppointment = async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            // Utilisation de l'API pour vérifier le code
            const result = await ApiService.verifyAppointmentCode(code);

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

    //  fonction pour confirmer le rendez-vous
    const confirmAppointment = async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            // Utilisation de l'API pour confirmer le rendez-vous
            const success = await ApiService.confirmAppointment(code);

            if (success) {
                setAppointmentConfirmed(true);
                return true;
            } else {
                setError('Erreur lors de la confirmation du rendez-vous');
                return false;
            }
        } catch (err: unknown) {
            // Vérification sécurisée du type d'erreur
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
            const result = await verifyPaymentCode(code);
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
        resetState: resetAll, // 👉 Alias pour l'utiliser dans les écrans

        // Setters
        setAppointmentCode,
        setPaymentCode,
        setLoading,
        setError
    };
};

export default useAppState;
