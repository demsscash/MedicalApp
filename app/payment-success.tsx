// app/payment-success.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
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

    const handlePrint = async () => {
        // Simulate printing process
        setPrinting(true);

        try {
            // Simulated printing logic
            await printReceipt();

            Alert.alert(
                'Impression terminée',
                'Votre reçu et ordonnance ont été imprimés.',
                [{
                    text: 'OK',
                    onPress: () => router.push(ROUTES.HOME)
                }]
            );
        } catch (error) {
            console.error('Erreur lors de l\'impression:', error);
            Alert.alert(
                'Erreur d\'impression',
                'Une erreur est survenue lors de l\'impression.',
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
            {/* Checked circle */}
            <View className="w-24 h-24 bg-white rounded-full justify-center items-center mb-8 shadow">
                <Text className="text-[#4169E1] text-4xl">✓</Text>
            </View>

            {/* Success Title */}
            <Title className="mb-4">
                Paiement réussi !
            </Title>

            {/* Success Message */}
            <Paragraph className="text-lg text-gray-700 text-center mb-2">
                Voulez-vous imprimer votre reçu
            </Paragraph>
            <Paragraph className="text-lg text-gray-700 text-center mb-8">
                et votre ordonnance ?
            </Paragraph>

            {/* Print Button */}
            {!printing ? (
                <View className="flex-row space-x-4">
                    <Button
                        title="Imprimer"
                        onPress={handlePrint}
                        variant="secondary"
                    />

                    <Button
                        title="Annuler"
                        onPress={() => router.push(ROUTES.HOME)}
                        variant="secondary"
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