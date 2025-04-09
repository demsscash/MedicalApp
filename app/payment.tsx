// app/payment.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    StatusBar,
    Image,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PaymentScreen() {
    const router = useRouter();
    const { error } = useLocalSearchParams();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null)
    ];

    // Gérer les erreurs de validation redirigées
    useEffect(() => {
        if (error === 'invalidCode') {
            Alert.alert('Code invalide', 'Le code que vous avez saisi est incorrect. Veuillez réessayer.');
        } else if (error === 'serverError') {
            Alert.alert('Erreur de serveur', 'Une erreur s\'est produite. Veuillez réessayer plus tard.');
        }
    }, [error]);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Gestion automatique du focus
        if (text.length === 1 && index < 5) {
            inputRefs[index + 1].current?.focus();
        } else if (text.length === 0 && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleValidation = () => {
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            // Navigation vers la page de carte Vitale avec le code
            router.push({
                pathname: '/carte-vitale',
                params: { code: fullCode }
            });
        } else {
            Keyboard.dismiss();
            Alert.alert('Code incomplet', 'Veuillez saisir un code à 6 chiffres.');
        }
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

                <Text className="text-2xl font-semibold text-[#333] mb-4 text-center">
                    Régler votre facture
                </Text>

                <Text className="text-sm text-[#666] mb-8 text-center px-5">
                    Pour toute autre information adressez vous au secrétariat
                </Text>

                <Text className="text-lg text-[#333] mb-6">
                    Veuillez entrer le code facture
                </Text>

                <View className="flex-row justify-center items-center mb-8">
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={inputRefs[index]}
                            className="w-20 h-20 bg-white rounded-xl mx-1 text-2xl text-center shadow"
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            selectTextOnFocus={true}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    className={`w-64 h-14 rounded-full justify-center items-center ${code.every(digit => digit !== '')
                        ? 'bg-[#4169E1]'
                        : 'bg-[#D3D3D3]'
                        }`}
                    onPress={handleValidation}
                    disabled={code.some(digit => digit === '')}
                    activeOpacity={0.7}
                >
                    <Text className="text-white text-lg font-semibold">
                        Valider
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}