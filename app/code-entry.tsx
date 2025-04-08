// app/code-entry.tsx
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

export default function CodeValidationScreen() {
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
            // Navigation vers la page de vérification avec le code
            router.push({
                pathname: '/verification',
                params: { code: fullCode }
            });
        } else {
            Keyboard.dismiss();
            Alert.alert('Code incomplet', 'Veuillez saisir un code à 6 chiffres.');
        }
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

            {/* Contenu de la page */}
            <View className="flex-1 justify-center items-center p-5 bg-transparent">
                <StatusBar barStyle="dark-content" />

                <Text className="text-2xl font-semibold text-[#333] mb-4 text-center">
                    Validation du rendez-vous
                </Text>

                <Text className="text-sm text-[#666] mb-8 text-center px-5">
                    Pour toute autre information, adressez-vous au secrétariat
                </Text>

                <Text className="text-lg text-[#333] mb-6">
                    Veuillez entrer votre code
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