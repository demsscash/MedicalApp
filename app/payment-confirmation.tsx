// app/payment-confirmation.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

type PaymentInfo = {
    consultation: string;
    consultationPrice: string;
    mutuelle: string;
    mutuelleAmount: string;
    totalTTC: string;
};

export default function PaymentConfirmationScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);

    // Données de facture statiques (en production, elles viendraient de l'API)
    const paymentInfo: PaymentInfo = {
        consultation: "Consultation médicale",
        consultationPrice: "30.00 euro",
        mutuelle: "Mutuelle Couverte",
        mutuelleAmount: "-20.00 euro",
        totalTTC: "10.00 €"
    };

    const handlePayment = () => {
        setLoading(true);
        // Simuler un processus de paiement
        setTimeout(() => {
            setLoading(false);
            setPaymentComplete(true);

            // Afficher la confirmation pendant quelques secondes avant de retourner à l'accueil
            setTimeout(() => {
                router.push('/');
            }, 3000);
        }, 2000);
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
                {loading ? (
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#4169E1" className="mb-6" />
                        <Text className="text-2xl text-[#4169E1] font-semibold text-center">
                            Traitement en cours...
                        </Text>
                    </View>
                ) : paymentComplete ? (
                    <View className="items-center w-full max-w-md">
                        <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-4">
                            <Text className="text-[#4169E1] text-2xl">✓</Text>
                        </View>
                        <Text className="text-2xl font-semibold text-[#4169E1] mb-4">
                            Facture réglée
                        </Text>

                        <Text className="text-lg text-gray-700 mb-2 text-center">
                            Votre facture a été réglée avec succès
                        </Text>
                        <Text className="text-sm text-gray-500 mb-8 text-center">
                            Un reçu vous sera envoyé par email
                        </Text>
                    </View>
                ) : (
                    <View className="w-full max-w-md">
                        <Text className="text-3xl text-[#4169E1] font-semibold text-center mb-12">
                            Facture
                        </Text>

                        {/* Détails de la facture */}
                        <View className="mb-8">
                            <View className="bg-white rounded-2xl p-4 mb-2 flex-row justify-between items-center shadow">
                                <Text className="text-lg text-gray-800">{paymentInfo.consultation}</Text>
                                <Text className="text-lg text-gray-800">{paymentInfo.consultationPrice}</Text>
                            </View>

                            <View className="bg-white rounded-2xl p-4 mb-2 flex-row justify-between items-center shadow">
                                <Text className="text-lg text-gray-800">{paymentInfo.mutuelle}</Text>
                                <Text className="text-lg text-gray-800">{paymentInfo.mutuelleAmount}</Text>
                            </View>

                            <View className="bg-white rounded-2xl p-4 flex-row justify-between items-center shadow">
                                <Text className="text-lg font-bold text-gray-800">Total TTC</Text>
                                <Text className="text-3xl font-bold text-[#4169E1]">{paymentInfo.totalTTC}</Text>
                            </View>
                        </View>

                        {/* Bouton de paiement */}
                        <TouchableOpacity
                            onPress={handlePayment}
                            className="bg-[#4169E1] py-4 px-8 rounded-full items-center shadow mx-auto"
                        >
                            <Text className="text-white text-lg font-semibold">
                                Payer maintenant
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}