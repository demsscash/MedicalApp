// app/carte-vitale-validated.tsx
import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CarteVitaleValidatedScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();

    // Redirection automatique après un délai
    useEffect(() => {
        const timer = setTimeout(() => {
            // Après le délai, naviguer vers la page de confirmation de paiement
            router.push({
                pathname: '/payment-confirmation',
                params: { code: code }
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [code, router]);

    const handleNext = () => {
        // Si l'utilisateur clique sur Suivant, on va directement à la confirmation
        router.push({
            pathname: '/payment-confirmation',
            params: { code: code }
        });
    };

    return (
        <View className="flex-1 bg-[#F0F5FF]">
            {/* Arrière-plan avec fusion de deux images */}
            <View className="absolute inset-0 overflow-hidden">
                <View className="flex-row w-full h-full">
                    {/* Première image (gauche - 50% de la largeur) */}
                    <View className="w-1/2 h-full">
                        <Image
                            source={require('../assets/images/bg-left-body.png')}
                            className="absolute w-full h-full"
                            resizeMode="cover"
                        />
                    </View>

                    {/* Deuxième image (droite - 50% de la largeur) - alignée à droite */}
                    <View className="w-1/2 h-full overflow-hidden">
                        <Image
                            source={require('../assets/images/bg-right-body.png')}
                            className="absolute right-0 h-full"
                            style={{ width: '200%', right: 0 }}
                            resizeMode="cover"
                        />
                    </View>
                </View>
            </View>

            {/* Contenu de la page */}
            <View className="flex-1 justify-center items-center p-5 bg-transparent">
                <StatusBar barStyle="dark-content" />

                <Text className="text-2xl font-semibold text-[#4169E1] mb-12 text-center">
                    Merci d'insérer votre{"\n"}carte vitale
                </Text>

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
                <TouchableOpacity
                    onPress={handleNext}
                    className="bg-white px-8 py-4 rounded-full shadow"
                >
                    <Text className="text-[#4169E1] font-medium text-base">
                        Suivant
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}