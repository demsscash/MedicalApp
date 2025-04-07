import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

// Dimensions pour le dimensionnement réactif
const { width, height } = Dimensions.get('window');
const cardSize = Math.min(width * 0.35, height * 0.35);

type PressedButtonType = 'accueil' | 'paiement' | null;

export default function HomeScreen() {
  const router = useRouter();
  const [pressedButton, setPressedButton] = useState<PressedButtonType>(null);

  const handleAccueil = () => {
    router.push('/code-entry');
  };

  const handlePaiement = () => {
    // Logique pour le paiement
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

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

      {/* Contenu principal */}
      <View style={styles.contentContainer}>
        {/* Bouton Accueil */}
        <TouchableOpacity
          onPress={handleAccueil}
          onPressIn={() => setPressedButton('accueil')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={1}
          style={[
            styles.card,
            pressedButton === 'accueil' && styles.cardPressed
          ]}
        >
          <Image
            source={require('../assets/images/home-icon.png')}
            style={[
              styles.icon,
              pressedButton === 'accueil' && styles.iconPressed
            ]}
            resizeMode="contain"
          />
          <Text style={[
            styles.buttonText,
            pressedButton === 'accueil' && styles.buttonTextPressed
          ]}>
            Accueil
          </Text>
        </TouchableOpacity>

        {/* Bouton Paiement */}
        <TouchableOpacity
          onPress={handlePaiement}
          onPressIn={() => setPressedButton('paiement')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={1}
          style={[
            styles.card,
            pressedButton === 'paiement' && styles.cardPressed
          ]}
        >
          <Image
            source={require('../assets/images/payment-icon.png')}
            style={[
              styles.icon,
              pressedButton === 'paiement' && styles.iconPressed
            ]}
            resizeMode="contain"
          />
          <Text style={[
            styles.buttonText,
            pressedButton === 'paiement' && styles.buttonTextPressed
          ]}>
            Paiement
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5FF',
  },
  backgroundContainer: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    width: cardSize,
    height: cardSize,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    backgroundColor: '#4169E1', // Bleu foncé
    transform: [{ scale: 0.95 }], // Effet de réduction légère
  },
  icon: {
    width: 64,
    height: 64,
  },
  iconPressed: {
    tintColor: 'white', // Changement de couleur de l'icône en blanc
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#4169E1',
    marginTop: 20,
  },
  buttonTextPressed: {
    color: 'white', // Texte en blanc quand pressé
  },
});