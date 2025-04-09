// app/payer-maintenant.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';

export default function PayerMaintenantScreen() {
    const router = useRouter();

    const handlePay = () => {
        // Navigate directly to payment confirmation screen
        router.push('/payment-success');
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

                <Text className="text-3xl font-semibold text-[#4169E1] mb-12 text-center">
                    Payer maintenant
                </Text>

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
            </View>
        </View>
    );
}