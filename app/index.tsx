// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import NetworkError from '../components/ui/NetworkError';
import { ROUTES } from '../constants/routes';
import { PressedButtonType } from '../types';
import useNetworkStatus from '../hooks/useNetworkStatus';

export default function HomeScreen() {
  const router = useRouter();
  const [pressedButton, setPressedButton] = useState<PressedButtonType>(null);
  const { isConnected, isInternetReachable, checkConnection } = useNetworkStatus();
  const [showNetworkError, setShowNetworkError] = useState(false);

  // Vérifier l'état du réseau au chargement et à chaque changement
  useEffect(() => {
    if (isConnected === false || isInternetReachable === false) {
      setShowNetworkError(true);
    } else {
      setShowNetworkError(false);
    }
  }, [isConnected, isInternetReachable]);

  // Fonction pour gérer une nouvelle tentative de connexion
  const handleRetry = async () => {
    const isConnected = await checkConnection();
    setShowNetworkError(!isConnected);
  };

  const handleAccueil = () => {
    if (!isConnected || !isInternetReachable) {
      Alert.alert(
        'Connexion impossible',
        'Votre appareil n\'est pas connecté à Internet. Veuillez vérifier votre connexion réseau et réessayer.'
      );
      return;
    }
    router.push(ROUTES.CODE_ENTRY);
  };

  const handlePaiement = () => {
    if (!isConnected || !isInternetReachable) {
      Alert.alert(
        'Connexion impossible',
        'Votre appareil n\'est pas connecté à Internet. Veuillez vérifier votre connexion réseau et réessayer.'
      );
      return;
    }
    router.push(ROUTES.PAYMENT);
  };

  return (
    <ScreenLayout centered withPadding={false}>
      {/* Afficher un message de connexion si nécessaire */}
      {showNetworkError && (
        <View className="absolute top-5 left-0 right-0 z-10">
          <NetworkError
            message="Votre appareil n'est pas connecté à Internet. Les fonctionnalités de l'application pourraient être limitées."
            onRetry={handleRetry}
          />
        </View>
      )}

      {/* Contenu principal */}
      <View className="flex-1 flex-row justify-center items-center p-5">
        {/* Bouton Accueil */}
        <TouchableOpacity
          onPress={handleAccueil}
          onPressIn={() => setPressedButton('accueil')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={showNetworkError ? 0.5 : 1}
          disabled={showNetworkError}
          className={`bg-white rounded-2xl flex justify-center items-center mx-5 w-64 h-64 shadow ${pressedButton === 'accueil' ? '!bg-[#4169E1] scale-95' : ''
            } ${showNetworkError ? 'opacity-50' : ''}`}
        >
          <Image
            source={require('../assets/images/home-icon.png')}
            className="w-16 h-16 mb-12"
            style={pressedButton === 'accueil' ? { tintColor: 'white', opacity: 0.8 } : {}}
            resizeMode="contain"
          />
          <View className="absolute bottom-12">
            <Text
              className={`text-2xl font-medium text-[#4169E1] ${pressedButton === 'accueil' ? '!text-white' : ''
                }`}
            >
              Accueil
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bouton Paiement */}
        <TouchableOpacity
          onPress={handlePaiement}
          onPressIn={() => setPressedButton('paiement')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={showNetworkError ? 0.5 : 1}
          disabled={showNetworkError}
          className={`bg-white rounded-2xl flex justify-center items-center mx-5 w-64 h-64 shadow ${pressedButton === 'paiement' ? '!bg-[#4169E1] scale-95' : ''
            } ${showNetworkError ? 'opacity-50' : ''}`}
        >
          <Image
            source={require('../assets/images/payment-icon.png')}
            className="w-16 h-16 mb-12"
            style={pressedButton === 'paiement' ? { tintColor: 'white', opacity: 0.8 } : {}}
            resizeMode="contain"
          />
          <View className="absolute bottom-12">
            <Text
              className={`text-2xl font-medium text-[#4169E1] ${pressedButton === 'paiement' ? '!text-white' : ''
                }`}
            >
              Paiement
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}