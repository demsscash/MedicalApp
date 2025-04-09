// app/payment-confirmation.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type PaymentInfo = {
    consultation: string;
    consultationPrice: string;
    mutuelle: string;
    mutuelleAmount: string;
    totalTTC: string;
    regimeObligatoire: string
    regimeObligatoireValue: string
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
        totalTTC: "10.00 €",
        regimeObligatoire: "Regime Obligatoire",
        regimeObligatoireValue: "Data"
    };

    const handlePayment = () => {
        router.push('/tpe');
    };

    const handleReturn = () => {
        // Retour à l'écran d'accueil
        router.push('/');
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
                    <View className="items-center w-full max-w-lg">
                        {/* Icône et titre */}
                        <View className="flex-row items-center mb-16">
                            <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                                <Ionicons name="checkmark" size={32} color="#4169E1" />
                            </View>
                            <Text className="text-2xl font-semibold text-[#4169E1]">
                                Facture réglée
                            </Text>
                        </View>

                        {/* Informations du paiement */}
                        <View className="w-full mb-4">
                            <View className="bg-white rounded-xl p-4 items-center justify-center shadow">
                                <Text className="text-base text-gray-800">
                                    Paiement effectué
                                </Text>
                            </View>
                        </View>

                        <View className="w-full mb-4">
                            <View className="bg-white rounded-xl p-4 items-center justify-center shadow">
                                <Text className="text-base text-gray-800">
                                    Reçu envoyé par email
                                </Text>
                            </View>
                        </View>

                        <View className="w-full mb-16">
                            <View className="bg-white rounded-xl p-4 shadow">
                                <Text className="text-base text-gray-800 text-center">
                                    Montant total payé
                                </Text>
                                <Text className="text-xl font-semibold text-[#4169E1] text-center">
                                    {paymentInfo.totalTTC}
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
                ) : (
                    <View className="w-full max-w-md">
                        {/* Titre */}
                        <Text
                            className="text-[38px] font-semibold text-[#4169E1] text-center mb-20"
                            style={{
                                fontFamily: 'Montserrat',
                                fontWeight: '600',
                                lineHeight: 40,
                                letterSpacing: 0
                            }}
                        >
                            Facture
                        </Text>

                        {/* Détails de la facture */}
                        <View className="w-full mb-12">
                            <View className="bg-white rounded-2xl p-5 mb-4 flex-row justify-between items-center shadow">
                                <Text className="text-base text-gray-800">{paymentInfo.consultation}</Text>
                                <Text className="text-base text-gray-800">{paymentInfo.consultationPrice}</Text>
                            </View>

                            <View className="bg-white rounded-2xl p-5 mb-4 flex-row justify-between items-center shadow">
                                <Text className="text-base text-gray-800">{paymentInfo.mutuelle}</Text>
                                <Text className="text-base text-gray-800">{paymentInfo.mutuelleAmount}</Text>
                            </View>
                            <View className="bg-white rounded-2xl p-5 mb-4 flex-row justify-between items-center shadow">
                                <Text className="text-base text-gray-800">{paymentInfo.regimeObligatoire}</Text>
                                <Text className="text-base text-gray-800">{paymentInfo.regimeObligatoireValue}</Text>
                            </View>

                            <View className="bg-white rounded-2xl p-5 shadow">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-base font-medium text-gray-800">Total TTC</Text>
                                    <Text className="text-3xl font-bold text-[#4169E1]">10.00 €</Text>
                                </View>
                            </View>
                        </View>

                        {/* Bouton de paiement */}
                        <TouchableOpacity
                            onPress={handlePayment}
                            activeOpacity={0.8}
                            className="bg-[#4169E1] px-8 py-4 rounded-full shadow mx-auto"
                        >
                            <Text className="text-white font-medium text-base">
                                Payer maintenant
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}