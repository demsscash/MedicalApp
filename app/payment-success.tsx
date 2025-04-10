// app/payment-success.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Title, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { printReceipt } from '../utils';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const [printing, setPrinting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20); // Timer de 20 secondes

    useEffect(() => {
        // ⏳ Décompte toutes les secondes
        const countdown = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        // 🏁 Naviguer vers l'accueil au bout de 20 sec
        const redirect = setTimeout(() => {
            router.push(ROUTES.HOME);
        }, 20000);

        return () => {
            clearInterval(countdown);
            clearTimeout(redirect);
        };
    }, []);


    const handlePrintReceipt = async () => {
        // Simulation du processus d'impression du reçu
        setPrinting(true);

        try {
            // Logique d'impression simulée
            await printReceipt();

            Alert.alert(
                'Impression terminée',
                'Votre reçu a été imprimé.',
                [{
                    text: 'OK',
                    onPress: () => router.push(ROUTES.HOME)
                }]
            );
        } catch (error) {
            console.error('Erreur lors de l\'impression:', error);
            Alert.alert(
                'Erreur d\'impression',
                'Une erreur est survenue lors de l\'impression du reçu.',
                [{
                    text: 'OK',
                    onPress: () => router.push(ROUTES.HOME)
                }]
            );
        } finally {
            setPrinting(false);
        }
    };

    const handlePrintPrescription = async () => {
        // Simulation du processus d'impression de l'ordonnance
        setPrinting(true);

        try {
            // Logique d'impression simulée
            await printReceipt(); // Réutilisation de la même fonction pour simplifier

            Alert.alert(
                'Impression terminée',
                'Votre ordonnance a été imprimée.',
                [{
                    text: 'OK',
                    onPress: () => router.push(ROUTES.HOME)
                }]
            );
        } catch (error) {
            console.error('Erreur lors de l\'impression:', error);
            Alert.alert(
                'Erreur d\'impression',
                'Une erreur est survenue lors de l\'impression de l\'ordonnance.',
                [{
                    text: 'OK',
                    onPress: () => router.push(ROUTES.HOME)
                }]
            );
        } finally {
            setPrinting(false);
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

            {/* Affichage du timer (petit et discret) */}
            <Paragraph className="text-sm text-gray-400 text-center mb-8">
                Retour à l'accueil dans {timeLeft} secondes
            </Paragraph>

            {/* Boutons d'impression */}
            {!printing ? (
                <View className="flex-row justify-center space-x-4">
                    <Button
                        title="Imprimer le reçu"
                        onPress={handlePrintReceipt}
                        variant="secondary"
                        className="px-6"
                    />

                    <Button
                        title="Imprimer l'ordonnance"
                        onPress={handlePrintPrescription}
                        variant="secondary"
                        className="px-6"
                    />
                </View>
            ) : (
                <View className="items-center">
                    <LoadingIndicator size="large" />
                    <Text className="text-lg text-gray-700 mt-4">
                        Impression en cours...
                    </Text>
                </View>
            )}
        </ScreenLayout>
    );
}