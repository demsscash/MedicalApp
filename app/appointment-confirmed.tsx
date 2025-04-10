// app/appointment-confirmed.tsx
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import { CenteredCard, HighlightCard } from '../components/ui/Card';
import { Heading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/theme';

export default function AppointmentConfirmedScreen() {
    const router = useRouter();

    const handleReturn = () => {
        // Retour à l'écran d'accueil
        router.push(ROUTES.HOME);
    };

    return (
        <ScreenLayout>
            <View className="items-center w-full max-w-lg">
                {/* Icône et titre */}
                <View className="flex-row items-center mb-16">
                    <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                        <Ionicons name="checkmark" size={32} color={COLORS.primary} />
                    </View>
                    <Heading>
                        Présence confirmée
                    </Heading>
                </View>

                {/* Informations du rendez-vous */}
                <CenteredCard
                    text="Rendez-vous validé"
                    className="w-full mb-4"
                />

                <CenteredCard
                    text="Secrétaire informée"
                    className="w-full mb-4"
                />

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