// app/carte-vitale.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CarteVitaleScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const handleCarteVitale = () => {
        // Montrer l'indicateur de chargement
        setLoading(true);

        // Simuler la lecture de la carte Vitale
        setTimeout(() => {
            setLoading(false);
            // Naviguer vers l'écran de carte Vitale validée
            router.push({
                pathname: '/carte-vitale-validated',
                params: { code: code }
            });
        }, 1500);
    };

    const handleNoCarte = () => {
        // Naviguer directement vers la page de confirmation de paiement sans carte Vitale
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

                {/* Image de la carte Vitale et du lecteur avec indicateur de chargement si besoin */}
                <TouchableOpacity
                    onPress={handleCarteVitale}
                    activeOpacity={0.8}
                    className="mb-16 items-center justify-center"
                    disabled={loading}
                >
                    <Image
                        source={require('../assets/images/vitale.png')}
                        className="w-64 h-80"
                        resizeMode="contain"
                    />

                    {loading && (
                        <View className="absolute">
                            <ActivityIndicator size="large" color="#4169E1" />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Bouton "Je n'ai pas de carte Vitale" */}
                <TouchableOpacity
                    onPress={handleNoCarte}
                    className="bg-white px-8 py-4 rounded-full shadow"
                    disabled={loading}
                >
                    <Text className={`font-medium text-base ${loading ? 'text-gray-400' : 'text-[#4169E1]'}`}>
                        Je n'ai pas de carte Vitale
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}