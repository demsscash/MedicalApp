// app/appointment-confirmed.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppointmentConfirmedScreen() {
    const router = useRouter();

    const handleReturn = () => {
        // Retour à l'écran d'accueil
        router.push('/');
    };

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
                <View className="items-center w-full max-w-lg">
                    {/* Icône et titre */}
                    <View className="flex-row items-center mb-16">
                        <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                            <Ionicons name="checkmark" size={32} color="#4169E1" />
                        </View>
                        <Text className="text-2xl font-semibold text-[#4169E1]">
                            Présence confirmée
                        </Text>
                    </View>

                    {/* Informations du rendez-vous */}
                    <View className="w-full mb-4">
                        <View className="bg-white rounded-xl p-4 items-center justify-center shadow">
                            <Text className="text-base text-gray-800">
                                Rendez-vous validé
                            </Text>
                        </View>
                    </View>

                    <View className="w-full mb-4">
                        <View className="bg-white rounded-xl p-4 items-center justify-center shadow">
                            <Text className="text-base text-gray-800">
                                Secrétaire informée
                            </Text>
                        </View>
                    </View>

                    <View className="w-full mb-16">
                        <View className="bg-white rounded-xl p-4 shadow">
                            <Text className="text-base text-gray-800 text-center">
                                Votre consultation aura lieu dans la salle
                            </Text>
                            <Text className="text-xl font-semibold text-[#4169E1] text-center">
                                Consultation 1
                            </Text>
                        </View>
                    </View>

                    {/* Bouton de retour */}
                    <TouchableOpacity
                        onPress={handleReturn}
                        activeOpacity={0.8}
                        className="bg-white px-8 py-4 rounded-full shadow"
                    >
                        <Text className="text-[#4169E1] font-medium text-base">
                            Retour à la page d'accueil
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}