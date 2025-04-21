// app/payment.tsx
import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import CodeInput from '../components/ui/CodeInput';
import Button from '../components/ui/Button';
import ErrorModal from '../components/ui/ErrorModal';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Heading, Paragraph, SubHeading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { DEFAULT_CODE_LENGTH } from '../constants/mockData';
import useCodeInput from '../hooks/useCodeInput';
import { ApiService } from '../services/api';

export default function PaymentScreen() {
    const router = useRouter();
    const { error } = useLocalSearchParams();
    const { code, isComplete, handleCodeChange, getFullCode } = useCodeInput(DEFAULT_CODE_LENGTH);
    
    // États pour le loading
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

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

    const handleValidation = async () => {
        const fullCode = getFullCode();
        if (fullCode.length === DEFAULT_CODE_LENGTH) {
            Keyboard.dismiss();
            setLoading(true);
            setLoadingMessage("Vérification du code...");

            try {
                // Étape 1: Vérifier si le code est valide
                const isValid = await ApiService.verifyAppointmentCode(fullCode);
                console.log("Résultat de la vérification du code:", isValid);

                if (!isValid) {
                    setLoading(false);
                    setErrorTitle('Code invalide');
                    setErrorMessage('Le code que vous avez saisi ne correspond à aucun rendez-vous dans notre système.');
                    setErrorModalVisible(true);
                    return;
                }

                // Étape 2: Récupérer les informations du rendez-vous
                setLoadingMessage("Récupération des informations...");
                try {
                    const details = await ApiService.getAppointmentByCode(fullCode);

                    if (details) {
                        setLoading(false);
                        // Navigation vers la page de carte vitale avec le code
                        router.push({
                            pathname: ROUTES.CARTE_VITALE,
                            params: { code: fullCode }
                        });
                    } else {
                        throw new Error('Détails du rendez-vous non disponibles');
                    }
                } catch (detailsError) {
                    console.error('Erreur lors de la récupération des détails:', detailsError);
                    setLoading(false);
                    setErrorTitle('Erreur de serveur');
                    setErrorMessage('Une erreur s\'est produite lors de la récupération des détails. Veuillez réessayer plus tard ou contacter le secrétariat.');
                    setErrorModalVisible(true);
                }
            } catch (error) {
                console.error('Erreur globale lors de la vérification:', error);
                setLoading(false);
                setErrorTitle('Erreur de serveur');
                setErrorMessage('Une erreur s\'est produite lors de la vérification. Veuillez réessayer plus tard ou contacter le secrétariat.');
                setErrorModalVisible(true);
            }
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
            {loading ? (
                <LoadingIndicator text={loadingMessage} />
            ) : (
                <>
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
                </>
            )}

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