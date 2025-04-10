// app/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import { ROUTES } from '../constants/routes';
import { PressedButtonType } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const [pressedButton, setPressedButton] = useState<PressedButtonType>(null);

  const handleAccueil = () => {
    router.push(ROUTES.CODE_ENTRY);
  };

  const handlePaiement = () => {
    router.push(ROUTES.PAYMENT);
  };

  return (
    <ScreenLayout centered withPadding={false}>
      {/* Contenu principal */}
      <View className="flex-1 flex-row justify-center items-center p-5">
        {/* Bouton Accueil */}
        <TouchableOpacity
          onPress={handleAccueil}
          onPressIn={() => setPressedButton('accueil')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={1}
          className={`bg-white rounded-2xl flex justify-center items-center mx-5 w-64 h-64 shadow ${pressedButton === 'accueil' ? '!bg-[#4169E1] scale-95' : ''
            }`}
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
          activeOpacity={1}
          className={`bg-white rounded-2xl flex justify-center items-center mx-5 w-64 h-64 shadow ${pressedButton === 'paiement' ? '!bg-[#4169E1] scale-95' : ''
            }`}
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