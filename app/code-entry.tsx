// app/code-entry.tsx
import React, { useEffect } from 'react';
import { View, Text, Keyboard, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import CodeInput from '../components/ui/CodeInput';
import Button from '../components/ui/Button';
import { Heading, Paragraph, SubHeading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { DEFAULT_CODE_LENGTH } from '../constants/mockData';
import useCodeInput from '../hooks/useCodeInput';

export default function CodeValidationScreen() {
    const router = useRouter();
    const { error } = useLocalSearchParams();
    const { code, isComplete, handleCodeChange, getFullCode } = useCodeInput(DEFAULT_CODE_LENGTH);

    // Gérer les erreurs de validation redirigées
    useEffect(() => {
        if (error === 'invalidCode') {
            Alert.alert('Code invalide', 'Le code que vous avez saisi est incorrect. Veuillez réessayer.');
        } else if (error === 'serverError') {
            Alert.alert('Erreur de serveur', 'Une erreur s\'est produite. Veuillez réessayer plus tard.');
        }
    }, [error]);

    const handleValidation = () => {
        const fullCode = getFullCode();
        if (fullCode.length === DEFAULT_CODE_LENGTH) {
            // Navigation vers la page de vérification avec le code
            router.push({
                pathname: ROUTES.VERIFICATION,
                params: { code: fullCode }
            });
        } else {
            Keyboard.dismiss();
            Alert.alert('Code incomplet', 'Veuillez saisir un code à 6 chiffres.');
        }
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
        </ScreenLayout>
    );
}