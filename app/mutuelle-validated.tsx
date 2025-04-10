// app/mutuelle-validated.tsx
import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import { Title } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';

export default function MutuelleValidatedScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();

    // Redirection automatique après un délai
    useEffect(() => {
        const timer = setTimeout(() => {
            // Après le délai, naviguer vers la page de confirmation de paiement
            router.push({
                pathname: ROUTES.PAYMENT_CONFIRMATION,
                params: { code: code }
            });
        }, 5000);

        return () => clearTimeout(timer);
    }, [code, router]);

    const handleNext = () => {
        // Si l'utilisateur clique sur Suivant, on va directement à la confirmation
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

            {/* Carte mutuelle avec badge de validation superposé */}
            <View className="mb-16 relative">
                <View className="w-60 h-60 bg-white rounded-3xl items-center justify-center shadow">
                    <Image
                        source={require('../assets/images/Rectangle.png')}
                        className="w-48 h-48"
                        resizeMode="contain"
                    />
                </View>

                {/* Badge de validation - position fixe */}
                <View style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(240, 245, 255, 0.9)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.5,
                    elevation: 2
                }}>
                    <Text style={{ color: '#4169E1', fontSize: 30 }}>✓</Text>
                </View>
            </View>

            {/* Bouton "Suivant" */}
            <Button
                title="Suivant"
                onPress={handleNext}
                variant="secondary"
            />
        </ScreenLayout>
    );
}