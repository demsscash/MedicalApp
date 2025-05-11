// app/code-entry.tsx
import React, { useState, useEffect } from 'react';
import { View, Keyboard, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import CodeInput from '../components/ui/CodeInput';
import Button from '../components/ui/Button';
import ErrorModal from '../components/ui/ErrorModal';
import { Heading, Paragraph, SubHeading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { DEFAULT_CODE_LENGTH } from '../constants/mockData';
import useCodeInput from '../hooks/useCodeInput';

export default function CodeValidationScreen() {
    const router = useRouter();
    const { error } = useLocalSearchParams();
    const { code, isComplete, handleCodeChange, getFullCode } = useCodeInput(DEFAULT_CODE_LENGTH);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Debug state
    const [renderCount, setRenderCount] = useState(0);

    // Update render count to track re-renders
    useEffect(() => {
        setRenderCount(prev => prev + 1);
        console.log("Code Entry Screen rendered:", renderCount + 1, "times");
        console.log("Current code state:", code);
        console.log("Is complete:", isComplete);
    }, [code, isComplete]);

    // Gérer les erreurs de validation redirigées
    useEffect(() => {
        if (error === 'invalidCode') {
            setErrorTitle('Code invalide');
            setErrorMessage('Le code que vous avez saisi est incorrect. Veuillez réessayer.');
            setErrorModalVisible(true);
        } else if (error === 'serverError') {
            setErrorTitle('Erreur de serveur');
            setErrorMessage('Une erreur s\'est produite. Veuillez réessayer plus tard ou contacter le secrétariat.');
            setErrorModalVisible(true);
        }
    }, [error]);

    const handleValidation = () => {
        const fullCode = getFullCode();
        if (fullCode.length === DEFAULT_CODE_LENGTH) {
            // Navigation vers la page de lecture de carte Vitale avec le code
            router.push({
                pathname: ROUTES.CHECKIN_CARTE_VITALE,
                params: { code: fullCode }
            });
        } else {
            Keyboard.dismiss();
            setErrorTitle('Code incomplet');
            setErrorMessage('Veuillez saisir un code à 6 chiffres.');
            setErrorModalVisible(true);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    // Debug info renderer
    const renderDebugInfo = () => {
        return (
            <View className="absolute bottom-2 left-2 bg-white p-2 rounded-lg opacity-70">
                <Text className="text-xs">Complete: {isComplete ? 'Yes' : 'No'}</Text>
                <Text className="text-xs">Code: {code.join('')}</Text>
                <Text className="text-xs">Renders: {renderCount}</Text>
            </View>
        );
    };

    return (
        <ScreenLayout>
            <Heading className="mb-4 text-center">
                Validation du rendez-vous
            </Heading>

            <Paragraph className="mb-8 text-center px-5">
                Pour toute autre information, adressez-vous au secrétariat
            </Paragraph>

            <SubHeading className="mb-6">
                Veuillez entrer votre code
            </SubHeading>

            <CodeInput
                codeLength={DEFAULT_CODE_LENGTH}
                value={code}
                onChange={handleCodeChange}
                containerClassName="mb-8"
            />

            <Button
                title="Valider"
                onPress={handleValidation}
                variant="primary"
                disabled={!isComplete}
                className={`w-64 h-14 justify-center items-center`}
            />

            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorModalVisible}
                title={errorTitle}
                message={errorMessage}
                onClose={closeErrorModal}
            />

            {/* Debug info (only visible in dev mode) */}
            {__DEV__ && renderDebugInfo()}
        </ScreenLayout>
    );
}