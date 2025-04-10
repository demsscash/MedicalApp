// hooks/useAppState.ts
import { useState } from 'react';
import { PatientInfo, PaymentInfo } from '../types';
import { verifyAppointmentCode, verifyPaymentCode } from '../utils';

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

    // États de chargement
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Actions pour le flux de rendez-vous
    const verifyAppointment = async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            const result = await verifyAppointmentCode(code);
            if (result) {
                setAppointmentCode(code);
                setPatientInfo(result);
                setAppointmentVerified(true);
                return true;
            } else {
                setError('Code de rendez-vous invalide');
                return false;
            }
        } catch (err) {
            setError('Erreur lors de la vérification');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetAppointment = () => {
        setAppointmentCode('');
        setPatientInfo(null);
        setAppointmentVerified(false);
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
        paymentCode,
        paymentInfo,
        healthCardInserted,
        paymentCompleted,
        loading,
        error,

        // Actions
        verifyAppointment,
        resetAppointment,
        verifyPayment,
        insertHealthCard,
        completePayment,
        resetPayment,
        resetAll,

        // Setters
        setAppointmentCode,
        setPaymentCode,
        setLoading,
        setError
    };
};

export default useAppState;