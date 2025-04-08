// app/verification.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

type PatientInfo = {
    nom: string;
    dateNaissance: string;
    dateRendezVous: string;
    verified: boolean;
};

export default function VerificationScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

    // Simulation de la vérification du code
    useEffect(() => {
        // Cette fonction simule une vérification API
        const verifyCode = async () => {
            try {
                // Simuler un délai de réseau
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Simuler les données du patient (en production, cela proviendrait d'une API)
                if (code === '123456') {
                    setPatientInfo({
                        nom: 'Dupont Sophie',
                        dateNaissance: '24/01/1990',
                        dateRendezVous: '20/02/2025',
                        verified: true
                    });
                } else {
                    // Code invalide
                    setPatientInfo(null);
                    // Rediriger en cas d'échec après un court délai
                    setTimeout(() => {
                        router.push('/code-entry?error=invalidCode');
                    }, 1000);
                }

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la vérification :', error);
                setLoading(false);
                // Rediriger en cas d'erreur
                router.push('/code-entry?error=serverError');
            }
        };

        verifyCode();
    }, [code, router]);

    // Redirection vers la page suivante après vérification réussie
    useEffect(() => {
        if (patientInfo && patientInfo.verified && !loading) {
            // Timer avant de passer à l'écran suivant (pour que l'utilisateur puisse voir les informations)
            const timer = setTimeout(() => {
                router.push({
                    pathname: '/appointment-confirmed',
                    params: { name: patientInfo.nom }
                });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [patientInfo, loading, router]);

    return (
        <View className="flex-1 bg-[#F0F5FF]">
            {/* Arrière-plan avec vagues */}
            <View className="absolute inset-0">
                <Image
                    source={require('../assets/images/background.png')}
                    className="absolute -left-1/3 -top-1/3 w-[150%] h-[150%] -rotate-180 opacity-10"
                    resizeMode="cover"
                />
                <Image
                    source={require('../assets/images/background2.png')}
                    className="absolute -right-1/3 -bottom-1/3 w-[150%] h-[150%] rotate-180 opacity-10"
                    resizeMode="cover"
                />
            </View>

            {/* Contenu principal */}
            <View className="flex-1 justify-center items-center p-5">
                {loading ? (
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#4169E1" className="mb-6" />
                        <Text className="text-2xl text-[#4169E1] font-semibold text-center">
                            Vérification en cours...
                        </Text>
                    </View>
                ) : (
                    patientInfo && (
                        <View className="w-full max-w-md">
                            <Text className="text-2xl text-[#4169E1] font-semibold text-center mb-8">
                                Vérification en cours...
                            </Text>

                            <View className="bg-white rounded-xl p-4 mb-4 flex-row justify-between items-center shadow">
                                <Text className="text-base text-gray-600">Nom et prénom</Text>
                                <Text className="text-lg font-medium">{patientInfo.nom}</Text>
                            </View>

                            <View className="bg-white rounded-xl p-4 mb-4 flex-row justify-between items-center shadow">
                                <Text className="text-base text-gray-600">Date de naissance</Text>
                                <Text className="text-lg font-medium">{patientInfo.dateNaissance}</Text>
                            </View>

                            <View className="bg-white rounded-xl p-4 mb-4 flex-row justify-between items-center shadow">
                                <Text className="text-base text-gray-600">Date de rendez-vous</Text>
                                <Text className="text-lg font-medium">{patientInfo.dateRendezVous}</Text>
                            </View>
                        </View>
                    )
                )}
            </View>
        </View>
    );
}