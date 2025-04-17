// app/payment-success.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Title, Paragraph } from '../components/ui/Typography';
import PDFModal from '../components/ui/PDFModal';
import { ROUTES } from '../constants/routes';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const [printing, setPrinting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(20);
    const [endTime, setEndTime] = useState(Date.now() + 20000);

    // États pour le PDF
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const [documentTitle, setDocumentTitle] = useState('');
    const [documentType, setDocumentType] = useState<'receipt' | 'prescription'>('receipt');

    // Fonction pour mettre à jour le timer
    const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        setSecondsLeft(remaining);

        if (remaining <= 0) {
            router.push(ROUTES.HOME);
        }

        return remaining > 0;
    };

    // Effet pour gérer le timer
    useEffect(() => {
        // Ne démarrer le timer que si nous ne sommes pas en mode impression
        // Et que le modal PDF n'est pas ouvert
        if (printing || pdfModalVisible) return;

        // Mettre à jour immédiatement
        updateTimer();

        // Puis mettre à jour chaque seconde
        const interval = setInterval(() => {
            const shouldContinue = updateTimer();
            if (!shouldContinue) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, printing, pdfModalVisible, router]);

    // Fonction pour réinitialiser le timer à 20 secondes
    const resetTimer = () => {
        setEndTime(Date.now() + 20000);
    };

    // Fonction pour ouvrir la prévisualisation du document
    const openDocumentPreview = (type: string) => {
        // Arrêter le timer pendant que le document est ouvert
        setPrinting(true);

        if (type === 'reçu') {
            setDocumentTitle('Reçu de paiement');
            setDocumentType('receipt');
        } else {
            setDocumentTitle('Ordonnance médicale');
            setDocumentType('prescription');
        }

        setPdfModalVisible(true);
    };

    // Fonction pour fermer la prévisualisation du document
    const closeDocumentPreview = () => {
        setPdfModalVisible(false);
        setPrinting(false);
        resetTimer();
    };

    // Fonction pour gérer "l'impression" (prévisualisation du document)
    const handlePrint = async (type: string) => {
        // Mettre en mode impression (ce qui arrête le timer)
        setPrinting(true);

        try {
            // Simuler un délai d'impression de 1 seconde
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Ouvrir la prévisualisation du document
            openDocumentPreview(type);

        } catch (error) {
            console.error(`Erreur lors de l'affichage du ${type}:`, error);

            // IMPORTANT: S'assurer que le mode d'impression est toujours désactivé
            setPrinting(false);

            Alert.alert(
                'Erreur d\'affichage',
                `Une erreur est survenue lors de l'affichage du ${type}.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        // Réinitialiser le timer même en cas d'erreur
                        resetTimer();
                    }
                }]
            );
        }
    };

    return (
        <ScreenLayout>
            {/* Cercle avec coche */}
            <View className="w-24 h-24 bg-white rounded-full justify-center items-center mb-8 shadow">
                <Text className="text-[#4169E1] text-4xl">✓</Text>
            </View>

            {/* Titre de succès */}
            <Title className="mb-4 text-[#4169E1]">
                Paiement réussi !
            </Title>

            {/* Message de succès */}
            <Paragraph className="text-lg text-gray-700 text-center mb-12">
                Votre reçu est prêt.
            </Paragraph>

            {/* Affichage du timer (petit et discret) - masqué pendant l'impression */}
            {!printing && !pdfModalVisible && (
                <Paragraph className="text-sm text-gray-400 text-center mb-8">
                    Retour à l'accueil dans {secondsLeft} secondes
                </Paragraph>
            )}

            {/* Boutons d'impression */}
            {!printing ? (
                <View className="flex-row justify-center space-x-4">
                    <Button
                        title="Imprimer le reçu"
                        onPress={() => handlePrint('reçu')}
                        variant="secondary"
                        className="px-6"
                    />

                    <Button
                        title="Imprimer l'ordonnance"
                        onPress={() => handlePrint('ordonnance')}
                        variant="secondary"
                        className="px-6"
                    />
                </View>
            ) : (
                <View className="items-center">
                    <LoadingIndicator size="large" />
                    <Text className="text-lg text-gray-700 mt-4">
                        Préparation en cours...
                    </Text>
                </View>
            )}

            {/* Modal pour afficher la prévisualisation du document */}
            <PDFModal
                visible={pdfModalVisible}
                documentType={documentType}
                onClose={closeDocumentPreview}
                documentTitle={documentTitle}
            />
        </ScreenLayout>
    );
}