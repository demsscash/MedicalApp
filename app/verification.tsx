// app/verification.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { InfoCard } from '../components/ui/Card';
import { Heading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { verifyAppointmentCode } from '../utils';
import { PatientInfo } from '../types';

export default function VerificationScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

    // Simulation de la vérification du code
    useEffect(() => {
        // Cette fonction simule une vérification API
        const verifyCode = async () => {
            try {
                const result = await verifyAppointmentCode(code as string);

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
                router.push({
                    pathname: ROUTES.APPOINTMENT_CONFIRMED,
                    params: { name: patientInfo.nom }
                });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [patientInfo, loading, router]);

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