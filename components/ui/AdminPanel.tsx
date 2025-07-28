// components/ui/AdminPanel.tsx - Version complète avec test API
import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import Button from './Button';
import { Card } from './Card';
import { KioskAuthService } from '../../services/kioskAuth';
import { useRouter } from 'expo-router';
import { ROUTES } from '../../constants/routes';

type AdminPanelProps = {
    visible: boolean;
    onClose: () => void;
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ visible, onClose }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showApiTestModal, setShowApiTestModal] = useState(false);
    const [fingerprintDetails, setFingerprintDetails] = useState<any>(null);

    const handleResetAuth = async () => {
        Alert.alert(
            'Réinitialiser l\'authentification',
            'Êtes-vous sûr de vouloir réinitialiser l\'authentification de cette borne ? Cette action nécessitera une nouvelle authentification.',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await KioskAuthService.resetKioskAuthentication();

                            Alert.alert(
                                'Authentification réinitialisée',
                                'La borne a été déconnectée. L\'application va redémarrer.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            onClose();
                                            router.replace(ROUTES.KIOSK_AUTH);
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Erreur lors de la réinitialisation:', error);
                            Alert.alert(
                                'Erreur',
                                'Impossible de réinitialiser l\'authentification.'
                            );
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleShowKioskInfo = async () => {
        try {
            setLoading(true);
            const info = await KioskAuthService.getKioskInfo();
            const mac = await KioskAuthService.getMacAddress();

            Alert.alert(
                'Informations de la borne (Expo)',
                `Code: ${info.code || 'Non défini'}\nMAC: ${mac}\n\nIdentifiant unique généré via Expo managed workflow`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Erreur',
                'Impossible de récupérer les informations de la borne.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleShowDetailedFingerprint = async () => {
        try {
            setLoading(true);
            const details = await KioskAuthService.getDetailedFingerprint();
            setFingerprintDetails(details);
            setShowDetailsModal(true);
        } catch (error) {
            Alert.alert(
                'Erreur',
                'Impossible de récupérer les détails de l\'empreinte Expo.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateMac = async () => {
        Alert.alert(
            'Régénérer l\'empreinte Expo',
            'Cette action va recalculer l\'identifiant unique basé sur les APIs Expo. Continuer ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Régénérer',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const newMac = await KioskAuthService.getMacAddress();
                            Alert.alert(
                                'Empreinte Expo régénérée',
                                `Nouvelle adresse MAC: ${newMac}\n\nBasée sur les identifiants Expo disponibles.\nNote: Cette modification ne sera effective qu'après une nouvelle authentification.`
                            );
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de régénérer l\'empreinte Expo.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <>
            <Modal
                visible={visible}
                title="Administration de la borne (Expo)"
                message="Gestion et diagnostic de l'authentification Expo managed workflow"
                type="info"
                primaryButtonText="Fermer"
                onPrimaryButtonPress={onClose}
            >
                <View className="mt-4 space-y-3">
                    <Button
                        title="🔧 Tester l'API réelle"
                        onPress={() => setShowApiTestModal(true)}
                        variant="primary"
                        className="w-full"
                        disabled={loading}
                    />

                    <Button
                        title="📱 Informations Expo"
                        onPress={handleShowKioskInfo}
                        variant="secondary"
                        className="w-full"
                        disabled={loading}
                    />

                    <Button
                        title="🔍 Empreinte Expo détaillée"
                        onPress={handleShowDetailedFingerprint}
                        variant="secondary"
                        className="w-full"
                        disabled={loading}
                    />

                    <Button
                        title="🔄 Régénérer empreinte"
                        onPress={handleRegenerateMac}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                    />

                    <Button
                        title="⚠️ Réinitialiser authentification"
                        onPress={handleResetAuth}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                    />

                    {__DEV__ && (
                        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <Text className="text-xs text-blue-800 text-center">
                                Mode développement Expo{'\n'}
                                Fallback TEST123: DÉSACTIVÉ{'\n'}
                                Empreinte composite Expo activée
                            </Text>
                        </View>
                    )}
                </View>
            </Modal>

            {/* Modal des détails d'empreinte Expo */}
            <Modal
                visible={showDetailsModal}
                title="Empreinte Expo détaillée"
                message="Informations collectées via les APIs Expo"
                type="info"
                primaryButtonText="Fermer"
                onPrimaryButtonPress={() => setShowDetailsModal(false)}
            >
                <ScrollView className="max-h-96 mt-4">
                    {fingerprintDetails && (
                        <View className="space-y-3">
                            {/* Adresse MAC finale */}
                            <Card className="bg-blue-50">
                                <Text className="text-sm font-semibold text-blue-800 mb-2">
                                    Adresse MAC Finale (Expo)
                                </Text>
                                <Text className="text-xs font-mono text-blue-700">
                                    {fingerprintDetails.macAddress}
                                </Text>
                                <Text className="text-xs text-blue-600 mt-1">
                                    Générée via empreinte composite Expo
                                </Text>
                            </Card>

                            {/* Informations Application Expo */}
                            <Card className="bg-green-50">
                                <Text className="text-sm font-semibold text-green-800 mb-2">
                                    Application Expo
                                </Text>
                                <View className="space-y-1">
                                    <Text className="text-xs">
                                        <Text className="font-medium">App ID:</Text> {fingerprintDetails.fingerprint.applicationId}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">App Name:</Text> {fingerprintDetails.fingerprint.applicationName}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Version:</Text> {fingerprintDetails.fingerprint.nativeApplicationVersion}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Build:</Text> {fingerprintDetails.fingerprint.nativeBuildVersion}
                                    </Text>
                                </View>
                            </Card>

                            {/* Identifiants Appareil Expo */}
                            <Card>
                                <Text className="text-sm font-semibold text-gray-800 mb-2">
                                    Appareil (expo-device)
                                </Text>
                                <View className="space-y-1">
                                    <Text className="text-xs">
                                        <Text className="font-medium">Marque:</Text> {fingerprintDetails.fingerprint.brand}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Modèle:</Text> {fingerprintDetails.fingerprint.modelName}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Model ID:</Text> {fingerprintDetails.fingerprint.modelId}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Fabricant:</Text> {fingerprintDetails.fingerprint.manufacturer}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Design:</Text> {fingerprintDetails.fingerprint.designName}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Nom:</Text> {fingerprintDetails.fingerprint.deviceName}
                                    </Text>
                                </View>
                            </Card>

                            {/* Système d'exploitation */}
                            <Card>
                                <Text className="text-sm font-semibold text-gray-800 mb-2">
                                    Système d'exploitation
                                </Text>
                                <View className="space-y-1">
                                    <Text className="text-xs">
                                        <Text className="font-medium">OS:</Text> {fingerprintDetails.fingerprint.osName}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Version:</Text> {fingerprintDetails.fingerprint.osVersion}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">API Level:</Text> {fingerprintDetails.fingerprint.platformApiLevel}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Type:</Text> {fingerprintDetails.fingerprint.deviceType}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Vrai appareil:</Text> {fingerprintDetails.fingerprint.isDevice ? 'Oui' : 'Non (Simulateur)'}
                                    </Text>
                                </View>
                            </Card>

                            {/* Informations matérielles */}
                            <Card>
                                <Text className="text-sm font-semibold text-gray-800 mb-2">
                                    Matériel et réseau
                                </Text>
                                <View className="space-y-1">
                                    <Text className="text-xs">
                                        <Text className="font-medium">Mémoire:</Text> {Math.round(fingerprintDetails.fingerprint.totalMemory / 1024 / 1024)} MB
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Produit:</Text> {fingerprintDetails.fingerprint.productName}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Type réseau:</Text> {fingerprintDetails.fingerprint.networkState}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">IP:</Text> {fingerprintDetails.fingerprint.ipAddress}
                                    </Text>
                                </View>
                            </Card>

                            {/* Identifiants uniques Expo */}
                            <Card className="bg-yellow-50">
                                <Text className="text-sm font-semibold text-yellow-800 mb-2">
                                    Identifiants uniques Expo
                                </Text>
                                <View className="space-y-1">
                                    <Text className="text-xs">
                                        <Text className="font-medium">Installation ID:</Text> {fingerprintDetails.fingerprint.installationId}
                                    </Text>
                                    <Text className="text-xs">
                                        <Text className="font-medium">Session ID:</Text> {fingerprintDetails.fingerprint.sessionId}
                                    </Text>
                                </View>
                                <Text className="text-xs text-yellow-600 mt-2">
                                    L'Installation ID est persistant et unique par installation
                                </Text>
                            </Card>

                            {/* Hash composite */}
                            <Card className="bg-purple-50">
                                <Text className="text-sm font-semibold text-purple-800 mb-2">
                                    Hash Composite Expo
                                </Text>
                                <Text className="text-xs font-mono text-purple-700">
                                    {fingerprintDetails.fingerprint.hash}
                                </Text>
                                <Text className="text-xs text-purple-600 mt-1">
                                    Généré à partir de tous les identifiants Expo combinés
                                </Text>
                            </Card>
                        </View>
                    )}
                </ScrollView>
            </Modal>

            {/* Modal de test API */}
            <ApiTestPanel
                visible={showApiTestModal}
                onClose={() => setShowApiTestModal(false)}
            />
        </>
    );
};

// Composant pour le bouton d'accès administrateur caché (inchangé)
type AdminAccessProps = {
    onShowPanel: () => void;
};

export const AdminAccess: React.FC<AdminAccessProps> = ({ onShowPanel }) => {
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    const handleTap = () => {
        const now = Date.now();

        // Réinitialiser le compteur si plus de 3 secondes entre les taps
        if (now - lastTapTime > 3000) {
            setTapCount(1);
        } else {
            setTapCount(prev => prev + 1);
        }

        setLastTapTime(now);

        // Ouvrir le panneau admin après 7 taps rapides
        if (tapCount >= 6) {
            setTapCount(0);
            onShowPanel();
        }
    };

    return (
        <TouchableOpacity
            onPress={handleTap}
            className="absolute bottom-4 right-4 w-8 h-8"
            activeOpacity={1}
        >
            {/* Zone invisible pour les taps */}
            <View className="w-full h-full" />

            {/* Indicateur visuel seulement en mode dev */}
            {__DEV__ && tapCount > 3 && (
                <View className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
            )}
        </TouchableOpacity>
    );
};

export default AdminPanel;