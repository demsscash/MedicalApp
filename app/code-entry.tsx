import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    StatusBar,
    Image,
    StyleSheet,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CodeValidationScreen() {
    const router = useRouter();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null)
    ];

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
            // Logique de validation
            console.log('Code de validation :', fullCode);
            // Navigation vers l'écran suivant

        } else {
            Keyboard.dismiss();
        }
    };

    return (
        <View style={styles.container}>
            {/* Arrière-plan avec vagues */}
            <View style={styles.backgroundContainer}>
                <Image
                    source={require('../assets/images/background.png')}
                    style={styles.leftWave}
                    resizeMode="cover"
                />
                <Image
                    source={require('../assets/images/background2.jpeg')}
                    style={styles.rightWave}
                    resizeMode="cover"
                />
            </View>

            {/* Contenu de la page */}
            <View style={styles.contentContainer}>
                <StatusBar barStyle="dark-content" />

                <Text style={styles.title}>
                    Validation du rendez-vous
                </Text>

                <Text style={styles.subtitle}>
                    Pour toute autre information, adressez-vous au secrétariat
                </Text>

                <Text style={styles.instructionText}>
                    Veuillez entrer votre code
                </Text>

                <View style={styles.inputContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={inputRefs[index]}
                            style={styles.input}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            selectTextOnFocus={true}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.validationButton,
                        {
                            backgroundColor: code.every(digit => digit !== '')
                                ? '#4169E1'
                                : '#D3D3D3'
                        }
                    ]}
                    onPress={handleValidation}
                    disabled={code.some(digit => digit === '')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.validationButtonText}>
                        Valider
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    leftWave: {
        position: 'absolute',
        left: -width * 0.3,
        top: -height * 0.3,
        width: width * 1.5,
        height: height * 1.5,
        transform: [{ rotate: '-180deg' }],
        opacity: 0.1,
    },
    rightWave: {
        position: 'absolute',
        right: -width * 0.3,
        bottom: -height * 0.3,
        width: width * 1.5,
        height: height * 1.5,
        transform: [{ rotate: '180' }],
        opacity: 0.1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    instructionText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    input: {
        width: 80,
        height: 86,
        backgroundColor: 'white',
        borderRadius: 12,
        marginHorizontal: 4,
        fontSize: 24,
        textAlign: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    validationButton: {
        width: 250,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    validationButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});