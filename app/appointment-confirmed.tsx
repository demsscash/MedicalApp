// app/appointment-confirmed.tsx
import React, { useCallback, useLayoutEffect } from 'react';
import { View, BackHandler, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import { Card, CenteredCard, HighlightCard } from '../components/ui/Card';
import { Heading, SubHeading } from '../components/ui/Typography';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { ROUTES } from '../constants/routes';

export default function AppointmentConfirmedScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const { resetState } = useAppState();
    const { name, price, couverture } = useLocalSearchParams();

    // Calculer le reste à payer si les paramètres sont disponibles
    const priceValue = price ? parseFloat(price as string) : 0;
    const couvertureValue = couverture ? parseFloat(couverture as string) : 0;
    const resteToPay = Math.max(0, priceValue - couvertureValue);
    const hasFinancialInfo = priceValue > 0;

    // 🔒 Bloquer le retour gestuel (iOS) + cacher le header natif si présent
    useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
            headerShown: false,
        });
    }, [navigation]);

    // 🔙 Bloquer le bouton "retour" Android
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true;
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    // 🧼 Reset navigation + état global
    const handleReturn = () => {
        resetState();
        router.push(ROUTES.HOME);
    };

    return (
        <ScreenLayout>
            <View className="items-center w-full max-w-lg">
                {/* Icône de confirmation */}
                <View className="flex-row items-center mb-12">
                    <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                        <Ionicons name="checkmark" size={32} color={COLORS.primary} />
                    </View>
                    <Heading>Présence confirmée</Heading>
                </View>

                {/* Cartes d'information */}
                <CenteredCard text="Rendez-vous validé" className="w-full mb-4" />
                <CenteredCard text="Secrétaire informée" className="w-full mb-4" />
                <HighlightCard
                    title="Votre consultation aura lieu dans la salle"
                    highlight="Consultation 1"
                    className="w-full mb-8"
                />

                {/* Informations financières si disponibles */}
                {hasFinancialInfo && (
                    <Card className="w-full mb-12 bg-white rounded-xl p-5 shadow">
                        <SubHeading className="text-center mb-4">Informations de tarification</SubHeading>

                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base text-gray-600">Prix de la consultation</Text>
                            <Text className="text-lg font-medium">{priceValue} €</Text>
                        </View>

                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-base text-gray-600">Couverture mutuelle</Text>
                            <Text className="text-lg font-medium text-green-600">- {couvertureValue} €</Text>
                        </View>

                        <View className="border-t border-gray-200 pt-3 flex-row justify-between items-center">
                            <Text className="text-base font-medium">Reste à payer</Text>
                            <Text className="text-xl font-bold text-[#4169E1]">{resteToPay} €</Text>
                        </View>
                    </Card>
                )}

                {/* Bouton de retour */}
                <Button
                    title="Retour à la page d'accueil"
                    onPress={handleReturn}
                    variant="secondary"
                />
            </View>
        </ScreenLayout>
    );
}