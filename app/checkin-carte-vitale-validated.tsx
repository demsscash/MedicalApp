// app/checkin-carte-vitale-validated.tsx
import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import { Heading, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';

export default function CheckinCarteVitaleValidatedScreen() {
    const router = useRouter();
    const { code, appointmentId, fromPersonalSearch } = useLocalSearchParams();

    // Vérifier d'où vient l'utilisateur
    const isFromPersonalSearch = fromPersonalSearch === 'true';

    useEffect(() => {
        console.log('CheckinCarteVitaleValidated - Paramètres reçus:', {
            code,
            appointmentId,
            fromPersonalSearch: isFromPersonalSearch
        });
    }, [code, appointmentId, isFromPersonalSearch]);

    // Redirection automatique après un délai
    useEffect(() => {
        const timer = setTimeout(() => {
            // Après le délai, naviguer vers la vérification
            if (isFromPersonalSearch && appointmentId) {
                // Si on vient de la recherche personnelle, utiliser l'appointmentId
                router.push({
                    pathname: ROUTES.VERIFICATION,
                    params: {
                        appointmentId: appointmentId,
                        fromPersonalSearch: 'true'
                    }
                });
            } else if (code) {
                // Si on vient du flux traditionnel avec code
                router.push({
                    pathname: ROUTES.VERIFICATION,
                    params: { code }
                });
            } else {
                console.error('Aucun code ou appointmentId disponible');
                // Fallback - retourner à l'accueil
                router.push(ROUTES.HOME);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [code, appointmentId, isFromPersonalSearch, router]);

    const handleNext = () => {
        // Si l'utilisateur clique sur Suivant, on va directement à la vérification
        if (isFromPersonalSearch && appointmentId) {
            // Si on vient de la recherche personnelle, utiliser l'appointmentId
            router.push({
                pathname: ROUTES.VERIFICATION,
                params: {
                    appointmentId: appointmentId,
                    fromPersonalSearch: 'true'
                }
            });
        } else if (code) {
            // Si on vient du flux traditionnel avec code
            router.push({
                pathname: ROUTES.VERIFICATION,
                params: { code }
            });
        } else {
            console.error('Aucun code ou appointmentId disponible');
            // Fallback - retourner à l'accueil
            router.push(ROUTES.HOME);
        }
    };

    return (
        <ScreenLayout>
            <Heading className="mb-8 text-center">
                Merci d'avoir inséré votre{"\n"}carte vitale
            </Heading>

            <Paragraph className="mb-6 text-center">
                Vos informations ont été correctement lues
            </Paragraph>

            {/* Image de la carte Vitale avec badge de validation superposé */}
            <View className="mb-16 relative">
                <Image
                    source={require('../assets/images/vitale.png')}
                    className="w-64 h-80"
                    resizeMode="contain"
                />

                {/* Badge de validation - position fixe */}
                <View style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 113,
                    height: 113,
                    borderRadius: 56.5,
                    backgroundColor: 'rgba(240, 245, 255, 0.8)',
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