// app/payment.tsx
import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import CodeInput from '../components/ui/CodeInput';
import Button from '../components/ui/Button';
import ErrorModal from '../components/ui/ErrorModal';
import { Heading, Paragraph, SubHeading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { DEFAULT_CODE_LENGTH } from '../constants/mockData';
import useCodeInput from '../hooks/useCodeInput';

export default function PaymentScreen() {
    const router = useRouter();
    const { error } = useLocalSearchParams();
    const { code, isComplete, handleCodeChange, getFullCode } = useCodeInput(DEFAULT_CODE_LENGTH);

    // États pour le modal d'erreur
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Gérer les erreurs de validation redirigées
    useEffect(() => {
        if (error === 'invalidCode') {
            setErrorTitle('Code facture invalide');
            setErrorMessage('Le code facture que vous avez saisi est incorrect. Veuillez réessayer.');
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
            // Navigation vers la page de carte vitale avec le code
            router.push({
                pathname: ROUTES.CARTE_VITALE,
                params: { code: fullCode }
            });
        } else {
            Keyboard.dismiss();
            setErrorTitle('Code incomplet');
            setErrorMessage('Veuillez saisir un code facture à 6 chiffres.');
            setErrorModalVisible(true);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    return (
        <ScreenLayout>
            <Heading className="mb-4 text-center">
                Régler votre facture
            </Heading>

            <Paragraph className="mb-8 text-center px-5">
                Pour toute autre information adressez vous au secrétariat
            </Paragraph>

            <SubHeading className="mb-6">
                Veuillez entrer le code facture
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
        </ScreenLayout>
    );
}