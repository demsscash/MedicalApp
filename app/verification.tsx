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
    const { code, appointmentId, fromPersonalSearch } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Vérification en cours...");
    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

    // États pour le modal d'erreur
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Vérifier d'où vient l'utilisateur
    const isFromPersonalSearch = fromPersonalSearch === 'true';

    useEffect(() => {
        console.log('Verification - Paramètres reçus:', {
            code,
            appointmentId,
            fromPersonalSearch: isFromPersonalSearch
        });
    }, [code, appointmentId, isFromPersonalSearch]);

    // Fermeture du modal et redirection
    const handleCloseErrorModal = () => {
        setErrorModalVisible(false);
        if (isFromPersonalSearch) {
            router.push(ROUTES.PERSONAL_SEARCH);
        } else {
            router.push(ROUTES.CODE_ENTRY);
        }
    };

    // Vérification du rendez-vous - Processus adapté selon le flux
    useEffect(() => {
        const verifyAppointment = async () => {
            if (!code && !appointmentId) {
                setErrorTitle('Paramètres manquants');
                setErrorMessage('Aucun code de rendez-vous ou ID n\'a été fourni.');
                setErrorModalVisible(true);
                setLoading(false);
                return;
            }

            try {
                setLoadingMessage("Récupération des informations...");

                let details: PatientInfo | null = null;

                if (isFromPersonalSearch && appointmentId) {
                    // Si on vient de la recherche personnelle, récupérer par ID
                    console.log("Récupération des détails par appointmentId:", appointmentId);
                    details = await ApiService.getAppointmentById(parseInt(appointmentId as string));
                } else if (code) {
                    // Si on vient du flux traditionnel, récupérer par code
                    console.log("Récupération des détails par code:", code);
                    details = await ApiService.getAppointmentByCode(code as string);
                } else {
                    throw new Error('Paramètres insuffisants pour la récupération');
                }

                console.log("Détails du rendez-vous reçus:", details);

                if (details) {
                    setPatientInfo(details);
                    setLoading(false);
                } else {
                    throw new Error('Détails du rendez-vous non disponibles');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des détails:', error);
                setLoading(false);
                setErrorTitle('Erreur de serveur');
                setErrorMessage('Une erreur s\'est produite lors de la récupération des détails. Veuillez réessayer plus tard ou contacter le secrétariat.');
                setErrorModalVisible(true);
            }
        };

        verifyAppointment();
    }, [code, appointmentId, isFromPersonalSearch, router]);

    // Redirection vers la page suivante après vérification réussie
    useEffect(() => {
        if (patientInfo && patientInfo.verified && !loading) {
            // Timer avant de passer à l'écran suivant
            const timer = setTimeout(() => {
                router.push({
                    pathname: ROUTES.APPOINTMENT_CONFIRMED,
                    params: {
                        name: patientInfo.nom,
                        price: patientInfo.price?.toString() || '0',
                        couverture: patientInfo.couverture?.toString() || '0',
                        salleConsultation: patientInfo.salleConsultation || '',
                        salleAttente: patientInfo.salleAttente || '',
                        medecin: patientInfo.medecin || ''
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

                        {/* Affichage du flux utilisé pour le debug en mode développement */}
                        {__DEV__ && (
                            <InfoCard
                                label="Flux utilisé"
                                value={isFromPersonalSearch ? "Recherche personnelle" : "Code de validation"}
                            />
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