// app/mutuelle-scan.tsx
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Title } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { readHealthCard } from '../utils';

export default function MutuelleScanScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const handleMutuelleCard = async () => {
        // Montrer l'indicateur de chargement
        setLoading(true);

        try {
            // Simuler la lecture de la carte Mutuelle
            await readHealthCard();

            // Naviguer vers l'écran de mutuelle validée
            router.push({
                pathname: ROUTES.MUTUELLE_VALIDATED,
                params: { code: code }
            });
        } catch (error) {
            console.error('Erreur lors de la lecture de la carte mutuelle:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNoMutuelle = () => {
        // Naviguer directement vers la page de confirmation de paiement sans carte Mutuelle
        router.push({
            pathname: ROUTES.PAYMENT_CONFIRMATION,
            params: { code: code }
        });
    };

    return (
        <ScreenLayout>
            <Title className="mb-6 text-center text-[#4169E1] p-8">
                Scannez votre{"\n"}mutuelle
            </Title>

            {/* Carte mutuelle et zone de scan */}
            <TouchableOpacity
                onPress={handleMutuelleCard}
                activeOpacity={0.8}
                className="mb-16 items-center justify-center"
                disabled={loading}
            >
                <View className="w-60 h-60 bg-white rounded-3xl items-center justify-center shadow">
                    {loading ? (
                        <LoadingIndicator size="large" />
                    ) : (
                        <Image
                            source={require('../assets/images/Rectangle.png')}
                            className="w-48 h-48"
                            resizeMode="contain"
                        />
                    )}
                </View>
            </TouchableOpacity>

            {/* Bouton "Je n'ai pas de mutuelle" */}
            <Button
                title="Je n'ai pas de mutuelle"
                onPress={handleNoMutuelle}
                variant="secondary"
                className="px-8"
            />
        </ScreenLayout>
    );
}