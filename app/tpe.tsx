// app/tpe.tsx
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import { Title } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';

export default function TPEScreen() {
    const router = useRouter();

    const handlePay = () => {
        // Navigate directly to payment success screen
        router.push(ROUTES.PAYMENT_SUCCESS);
    };

    return (
        <ScreenLayout>
            <Title className="mb-12">
                Payer maintenant
            </Title>

            {/* Image TPE */}
            <TouchableOpacity
                onPress={handlePay}
                activeOpacity={0.8}
            >
                <Image
                    source={require('../assets/images/tpe.png')}
                    className="w-96 h-96"
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </ScreenLayout>
    );
}