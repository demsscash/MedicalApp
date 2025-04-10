// app/payment-confirmation.tsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Card, CenteredCard, HighlightCard } from '../components/ui/Card';
import { Heading, Title } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/theme';
import { verifyPaymentCode } from '../utils';
import { PaymentInfo } from '../types';

export default function PaymentConfirmationScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [paymentComplete, setPaymentComplete] = useState(false);

    // Charger les informations de paiement
    useEffect(() => {
        const loadPaymentInfo = async () => {
            try {
                const result = await verifyPaymentCode(code as string);
                if (result) {
                    setPaymentInfo(result);
                } else {
                    // Rediriger en cas d'échec
                    router.push({
                        pathname: ROUTES.PAYMENT,
                        params: { error: 'invalidCode' }
                    });
                }
            } catch (error) {
                console.error('Erreur lors du chargement des informations de paiement:', error);
                router.push({
                    pathname: ROUTES.PAYMENT,
                    params: { error: 'serverError' }
                });
            } finally {
                setLoading(false);
            }
        };

        loadPaymentInfo();
    }, [code, router]);

    const handlePayment = () => {
        router.push(ROUTES.TPE);
    };

    const handleReturn = () => {
        // Retour à l'écran d'accueil
        router.push(ROUTES.HOME);
    };

    if (loading) {
        return (
            <ScreenLayout>
                <LoadingIndicator text="Traitement en cours..." />
            </ScreenLayout>
        );
    }

    if (paymentComplete) {
        return (
            <ScreenLayout>
                <View className="items-center w-full max-w-lg">
                    {/* Icône et titre */}
                    <View className="flex-row items-center mb-16">
                        <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                            <Ionicons name="checkmark" size={32} color={COLORS.primary} />
                        </View>
                        <Heading>
                            Facture réglée
                        </Heading>
                    </View>

                    {/* Informations du paiement */}
                    <CenteredCard
                        text="Paiement effectué"
                        className="w-full mb-4"
                    />

                    <CenteredCard
                        text="Reçu envoyé par email"
                        className="w-full mb-4"
                    />

                    <HighlightCard
                        title="Montant total payé"
                        highlight={paymentInfo?.totalTTC || ""}
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

    return (
        <ScreenLayout>
            <View className="w-full max-w-md">
                {/* Titre */}
                <Title className="mb-20">
                    Facture
                </Title>

                {/* Détails de la facture */}
                {paymentInfo && (
                    <View className="w-full mb-12">
                        <Card className="bg-white rounded-2xl p-5 mb-4 flex-row justify-between items-center shadow">
                            <Text className="text-base text-gray-800">{paymentInfo.consultation}</Text>
                            <Text className="text-base text-gray-800">{paymentInfo.consultationPrice}</Text>
                        </Card>

                        <Card className="bg-white rounded-2xl p-5 mb-4 flex-row justify-between items-center shadow">
                            <Text className="text-base text-gray-800">{paymentInfo.mutuelle}</Text>
                            <Text className="text-base text-gray-800">{paymentInfo.mutuelleAmount}</Text>
                        </Card>

                        <Card className="bg-white rounded-2xl p-5 mb-4 flex-row justify-between items-center shadow">
                            <Text className="text-base text-gray-800">{paymentInfo.regimeObligatoire}</Text>
                            <Text className="text-base text-gray-800">{paymentInfo.regimeObligatoireValue}</Text>
                        </Card>

                        <Card className="bg-white rounded-2xl p-5 shadow">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-base font-medium text-gray-800">Total TTC</Text>
                                <Text className="text-3xl font-bold text-[#4169E1]">{paymentInfo.totalTTC}</Text>
                            </View>
                        </Card>
                    </View>
                )}

                {/* Bouton de paiement */}
                <Button
                    title="Payer maintenant"
                    onPress={handlePayment}
                    variant="primary"
                    className="mx-auto"
                />
            </View>
        </ScreenLayout>
    );
}