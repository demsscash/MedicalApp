// app/appointment-confirmed.tsx

import React, { useCallback, useLayoutEffect } from 'react';
import { View, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import { CenteredCard, HighlightCard } from '../components/ui/Card';
import { Heading } from '../components/ui/Typography';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState'; // Hook global state

export default function AppointmentConfirmedScreen() {
    const navigation = useNavigation();
    const { resetState } = useAppState(); // Fonction de reset dans ton hook global

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
        resetState(); // vide le state global (code, patient, etc.)
        navigation.reset({
            index: 0,
            routes: [{ name: 'index' }], // fichier app/index.tsx
        });
    };

    return (
        <ScreenLayout>
            <View className="items-center w-full max-w-lg">
                {/* Icône de confirmation */}
                <View className="flex-row items-center mb-16">
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
                    className="w-full mb-16"
                />

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
