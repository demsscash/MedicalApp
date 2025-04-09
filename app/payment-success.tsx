// app/payment-success.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const [printing, setPrinting] = useState(false);

    const handlePrint = () => {
        // Simulate printing process
        setPrinting(true);

        // Simulated printing logic
        setTimeout(() => {
            setPrinting(false);
            Alert.alert(
                'Impression terminée',
                'Votre reçu et ordonnance ont été imprimés.',
                [{
                    text: 'OK',
                    onPress: () => router.push('/')
                }]
            );
        }, 3000);
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

            {/* Contenu principal */}
            <View className="flex-1 justify-center items-center p-5">
                <StatusBar barStyle="dark-content" />

                {/* Checked circle */}
                <View className="w-24 h-24 bg-white rounded-full justify-center items-center mb-8 shadow">
                    <Text className="text-[#4169E1] text-4xl">✓</Text>
                </View>

                {/* Success Title */}
                <Text className="text-3xl font-semibold text-[#4169E1] mb-4 text-center">
                    Paiement réussi !
                </Text>

                {/* Success Message */}
                <Text className="text-lg text-gray-700 text-center mb-2">
                    Voulez-vous imprimer votre reçu
                </Text>
                <Text className="text-lg text-gray-700 text-center mb-8">
                    et votre ordonnance ?
                </Text>

                {/* Print Button */}
                {!printing ? (
                    <View className="flex-row space-x-4">
                        <TouchableOpacity
                            onPress={handlePrint}
                            className="bg-white px-8 py-4 rounded-full shadow"
                        >
                            <Text className="text-[#4169E1] text-lg font-semibold">
                                Imprimer
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            className="bg-white px-8 py-4 rounded-full shadow"
                        >
                            <Text className="text-[#4169E1] text-lg font-semibold">
                                Annuler
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#4169E1" />
                        <Text className="text-lg text-gray-700 mt-4">
                            Impression en cours...
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}