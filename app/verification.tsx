// app/verification.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { InfoCard, Card } from '../components/ui/Card';
import { Heading, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';
import { PatientInfo } from '../types';
import ErrorModal from '../components/ui/ErrorModal';

export default function VerificationScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Vérification en cours...");
    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

    // États pour le modal d'erreur
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Fermeture du modal et redirection
    const handleCloseErrorModal = () => {
        setErrorModalVisible(false);
        router.push(ROUTES.CODE_ENTRY);
    };

    // Vérification du code de rendez-vous - Processus en deux étapes
    useEffect(() => {
        const verifyAppointment = async () => {
            if (!code) {
                setErrorTitle('Code manquant');
                setErrorMessage('Aucun code de rendez-vous n\'a été fourni.');
                setErrorModalVisible(true);
                setLoading(false);
                return;
            }

            try {
                setLoadingMessage("Vérification du code...");
                console.log("Vérification du code:", code);

                // Étape 1: Vérifier si le code est valide
                const isValid = await ApiService.verifyAppointmentCode(code as string);
                console.log("Résultat de la vérification du code:", isValid);

                if (!isValid) {
                    setLoading(false);
                    setErrorTitle('Code invalide');
                    setErrorMessage('Le code que vous avez saisi ne correspond à aucun rendez-vous dans notre système.');
                    setErrorModalVisible(true);
                    return;
                }

                // Étape 2: Récupérer les informations du rendez-vous avec le même code
                setLoadingMessage("Récupération des informations...");
                try {
                    const details = await ApiService.getAppointmentByCode(code as string);
                    console.log("Détails du rendez-vous reçus:", details);

                    if (details) {
                        setPatientInfo(details);
                        setLoading(false);
                    } else {
                        throw new Error('Détails du rendez-vous non disponibles');
                    }
                } catch (detailsError) {
                    console.error('Erreur lors de la récupération des détails:', detailsError);
                    setLoading(false);
                    setErrorTitle('Erreur de serveur');
                    setErrorMessage('Une erreur s\'est produite lors de la récupération des détails. Veuillez réessayer plus tard ou contacter le secrétariat.');
                    setErrorModalVisible(true);
                }

            } catch (error) {
                console.error('Erreur globale lors de la vérification:', error);
                setLoading(false);
                setErrorTitle('Erreur de serveur');
                setErrorMessage('Une erreur s\'est produite lors de la vérification. Veuillez réessayer plus tard ou contacter le secrétariat.');
                setErrorModalVisible(true);
            }
        };

        verifyAppointment();
    }, [code, router]);

    // Redirection vers la page suivante après vérification réussie
    useEffect(() => {
        if (patientInfo && patientInfo.verified && !loading) {
            // Timer avant de passer à l'écran suivant (pour que l'utilisateur puisse voir les informations)
            const timer = setTimeout(() => {
                router.push({
                    pathname: ROUTES.APPOINTMENT_CONFIRMED,
                    params: {
                        name: patientInfo.nom,
                        price: patientInfo.price?.toString() || '0',
                        couverture: patientInfo.couverture?.toString() || '0'
                    }
                });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [patientInfo, loading, router]);

    // Calcul du reste à payer (si les informations sont disponibles)
    const calculateResteToPay = () => {
        if (patientInfo?.price && patientInfo?.couverture !== undefined) {
            return Math.max(0, patientInfo.price - patientInfo.couverture);
        }
        return null;
    };

    const resteToPay = calculateResteToPay();

    return (
        <ScreenLayout>
            {loading ? (
                <LoadingIndicator text={loadingMessage} />
            ) : (
                patientInfo && (
                    <View className="w-full max-w-md">
                        <Heading className="text-center mb-8">
                            Vérification en cours...
                        </Heading>

                        {/* Informations de base du patient */}
                        <InfoCard label="Nom et prénom" value={patientInfo.nom} />
                        <InfoCard label="Date de naissance" value={patientInfo.dateNaissance} />
                        <InfoCard label="Numéro de sécurité sociale" value={patientInfo.numeroSecu} />
                        <InfoCard label="Date de rendez-vous" value={patientInfo.dateRendezVous} />
                        <InfoCard label="Heure du rendez-vous" value={patientInfo.heureRendezVous} />

                        {/* Informations financières */}
                        {patientInfo.price !== undefined && (
                            <Card className="mt-6 mb-2 bg-white rounded-xl p-4 shadow">
                                <Paragraph className="text-center text-base mb-2 text-gray-600">
                                    Informations de tarification
                                </Paragraph>
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-base text-gray-600">Prix de la consultation</Text>
                                    <Text className="text-lg font-medium">{patientInfo.price} €</Text>
                                </View>
                                {patientInfo.couverture !== undefined && (
                                    <View className="flex-row justify-between items-center mt-2">
                                        <Text className="text-base text-gray-600">Couverture mutuelle</Text>
                                        <Text className="text-lg font-medium text-green-600">- {patientInfo.couverture} €</Text>
                                    </View>
                                )}
                                {resteToPay !== null && (
                                    <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200">
                                        <Text className="text-base font-medium text-gray-800">Reste à payer</Text>
                                        <Text className="text-xl font-bold text-[#4169E1]">{resteToPay} €</Text>
                                    </View>
                                )}
                            </Card>
                        )}
                    </View>
                )
            )}

            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorModalVisible}
                title={errorTitle}
                message={errorMessage}
                onClose={handleCloseErrorModal}
            />
        </ScreenLayout>
    );
}