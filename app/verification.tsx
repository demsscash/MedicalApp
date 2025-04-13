// app/verification.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { InfoCard } from '../components/ui/Card';
import { Heading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';
import { PatientInfo } from '../types';
import { MOCK_PATIENT_DATA, VALID_CODES } from '../constants/mockData';

export default function VerificationScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
    const [appointmentId, setAppointmentId] = useState<number | null>(null);

    // Fonction locale pour simuler la vérification du code
    const mockVerifyAppointmentCode = async (code: string): Promise<PatientInfo | null> => {
        // Simule un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Retourne les données simulées si le code est valide
        if (VALID_CODES.includes(code) && MOCK_PATIENT_DATA[code]) {
            return MOCK_PATIENT_DATA[code];
        }

        return null;
    };

    // Vérification du code de rendez-vous
    useEffect(() => {
        // Cette fonction utilise l'API réelle
        const verifyCode = async () => {
            try {
                // Utiliser l'API réelle ou la fonction simulée en fonction de la disponibilité de l'API
                let result: PatientInfo | null;

                try {
                    // Essayer d'abord avec l'API réelle
                    result = await ApiService.verifyAppointmentCode(code as string);
                    // Si nous avons un résultat, stocker l'ID du rendez-vous pour confirmation ultérieure
                    if (result && result.id) {
                        setAppointmentId(result.id);
                    }
                } catch (apiError) {
                    console.warn('API réelle non disponible, utilisation des données simulées:', apiError);
                    // En cas d'échec avec l'API réelle, utiliser les données simulées
                    result = await mockVerifyAppointmentCode(code as string);
                }

                if (result) {
                    setPatientInfo(result);
                } else {
                    // Code invalide
                    setPatientInfo(null);
                    // Rediriger en cas d'échec après un court délai
                    setTimeout(() => {
                        router.push({
                            pathname: ROUTES.CODE_ENTRY,
                            params: { error: 'invalidCode' }
                        });
                    }, 1000);
                }

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la vérification :', error);
                setLoading(false);
                // Rediriger en cas d'erreur
                router.push({
                    pathname: ROUTES.CODE_ENTRY,
                    params: { error: 'serverError' }
                });
            }
        };

        verifyCode();
    }, [code, router]);

    // Redirection vers la page suivante après vérification réussie
    useEffect(() => {
        if (patientInfo && patientInfo.verified && !loading) {
            // Timer avant de passer à l'écran suivant (pour que l'utilisateur puisse voir les informations)
            const timer = setTimeout(() => {
                // Confirmer le rendez-vous si nous avons un ID
                if (appointmentId) {
                    try {
                        ApiService.confirmAppointment(appointmentId)
                            .catch(error => console.error('Erreur lors de la confirmation du rendez-vous:', error));
                    } catch (error) {
                        console.error('Erreur lors de la confirmation du rendez-vous:', error);
                    }
                }

                router.push({
                    pathname: ROUTES.APPOINTMENT_CONFIRMED,
                    params: { name: patientInfo.nom }
                });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [patientInfo, loading, router, appointmentId]);

    return (
        <ScreenLayout>
            {loading ? (
                <LoadingIndicator text="Vérification en cours..." />
            ) : (
                patientInfo && (
                    <View className="w-full max-w-md">
                        <Heading className="text-center mb-8">
                            Vérification en cours...
                        </Heading>

                        <InfoCard label="Nom et prénom" value={patientInfo.nom} />
                        <InfoCard label="Date de naissance" value={patientInfo.dateNaissance} />
                        <InfoCard label="Numéro de sécurité sociale" value={patientInfo.numeroSecu} />
                        <InfoCard label="Date de rendez-vous" value={patientInfo.dateRendezVous} />
                        <InfoCard label="Heure du rendez-vous" value={patientInfo.heureRendezVous} />
                    </View>
                )
            )}
        </ScreenLayout>
    );
}