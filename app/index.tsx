// app/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

type PressedButtonType = 'accueil' | 'paiement' | null;

export default function HomeScreen() {
  const router = useRouter();
  const [pressedButton, setPressedButton] = useState<PressedButtonType>(null);

  const handleAccueil = () => {
    router.push('/code-entry');
  };

  const handlePaiement = () => {
    router.push('/payment');
  };

  return (
    <View className="flex-1 bg-[#F0F5FF]">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Arrière-plan avec fusion de deux images */}
      <View className="absolute w-full h-full overflow-hidden">
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
    </View>
  );
}