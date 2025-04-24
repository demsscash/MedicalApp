// components/ui/SimpleInactivityTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import Svg, { Circle } from 'react-native-svg';
import { useActivity } from '../layout/ActivityWrapper';

type SimpleInactivityTimerProps = {
    timeoutDuration?: number; // en secondes
    warningThreshold?: number; // en secondes
    initialDelay?: number; // en secondes avant que le timer apparaisse
    disabledRoutes?: string[]; // routes où le timer est désactivé
};

const SimpleInactivityTimer: React.FC<SimpleInactivityTimerProps> = ({
    timeoutDuration = 30,
    warningThreshold = 10,
    initialDelay = 5, // Apparaît après 5 secondes d'inactivité
    disabledRoutes = [ROUTES.HOME], // désactivé sur la page d'accueil par défaut
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timeoutDuration);
    const [circleProgress, setCircleProgress] = useState(100); // pourcentage du cercle rempli

    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const activityListenerIdRef = useRef<string | null>(null);

    const activity = useActivity();

    // Vérifier si le timer doit être désactivé pour la route actuelle
    const isTimerDisabled = disabledRoutes.includes(pathname);

    // Démarrer le timer de compte à rebours
    const startCountdown = () => {
        // Ne pas démarrer le timer si nous sommes sur une route où il est désactivé
        if (isTimerDisabled) {
            return;
        }

        setIsVisible(true);
        setTimeLeft(timeoutDuration);
        setCircleProgress(100); // commencer avec le cercle plein

        // Démarrer le décompte
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }

        countdownTimerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                const newTimeLeft = prev - 1;

                // Calculer le pourcentage de remplissage
                const newProgress = (newTimeLeft / timeoutDuration) * 100;
                setCircleProgress(newProgress);

                if (newTimeLeft <= 0) {
                    // Temps écoulé, rediriger vers l'accueil
                    if (countdownTimerRef.current) {
                        clearInterval(countdownTimerRef.current);
                    }
                    router.push(ROUTES.HOME);
                    setIsVisible(false);
                    return 0;
                }
                return newTimeLeft;
            });
        }, 1000);
    };

    // Réinitialiser complètement le timer à 30s
    const resetTimerToMax = () => {
        setTimeLeft(timeoutDuration);
        setCircleProgress(100);

        // Arrêter le timer actuel
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }

        // Redémarrer le décompte
        countdownTimerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                const newTimeLeft = prev - 1;

                // Calculer le pourcentage de remplissage
                const newProgress = (newTimeLeft / timeoutDuration) * 100;
                setCircleProgress(newProgress);

                if (newTimeLeft <= 0) {
                    // Temps écoulé, rediriger vers l'accueil
                    if (countdownTimerRef.current) {
                        clearInterval(countdownTimerRef.current);
                    }
                    router.push(ROUTES.HOME);
                    setIsVisible(false);
                    return 0;
                }
                return newTimeLeft;
            });
        }, 1000);
    };

    // Réinitialiser le timer d'inactivité
    const resetInactivityTimer = () => {
        // Si le timer est déjà visible, on le réinitialise à sa valeur maximale
        if (isVisible) {
            resetTimerToMax();
        } else {
            // Le timer n'est pas visible, on prépare son apparition après le délai

            // Nettoyer le timer d'inactivité précédent
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }

            // Ne pas démarrer de nouveau timer si nous sommes sur une route où il est désactivé
            if (isTimerDisabled) {
                return;
            }

            // Démarrer un nouveau timer d'inactivité avec le délai initial
            inactivityTimerRef.current = setTimeout(() => {
                startCountdown();
            }, initialDelay * 1000);
        }
    };

    // S'abonner aux événements d'activité
    useEffect(() => {
        // S'abonner à l'événement d'activité
        activityListenerIdRef.current = activity.addActivityListener(() => {
            if (isVisible) {
                // Si le timer est visible, le réinitialiser à 30s
                resetTimerToMax();
            } else {
                // Sinon, réinitialiser le délai d'inactivité
                resetInactivityTimer();
            }
        });

        // Se désabonner à la destruction du composant
        return () => {
            if (activityListenerIdRef.current) {
                activity.removeActivityListener(activityListenerIdRef.current);
            }
        };
    }, [isVisible, isTimerDisabled]);

    // Écouter les changements de chemin
    useEffect(() => {
        // À chaque changement de route, réinitialiser le timer
        resetInactivityTimer();
    }, [pathname]);

    // Initialiser le timer au montage et configurer les écouteurs d'événements
    useEffect(() => {
        resetInactivityTimer();

        // Surveiller l'état de l'application
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                resetInactivityTimer();
            }
            appStateRef.current = nextAppState;
        });

        return () => {
            // Nettoyer les timers
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }

            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }

            // Nettoyer les écouteurs
            subscription.remove();
        };
    }, [isTimerDisabled]);

    // Ne rien afficher si le timer n'est pas visible ou si nous sommes sur la page d'accueil
    if (!isVisible || isTimerDisabled) {
        return null;
    }

    // Déterminer si nous sommes en mode alerte
    const isWarning = timeLeft <= warningThreshold;

    // Utiliser explicitement la couleur rouge du thème ou une couleur rouge fixe
    const circleColor = isWarning ? '#FF3B30' : '#4169E1';

    // Calculs pour le cercle SVG
    const size = 60;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - circleProgress / 100);

    return (
        <View style={styles.container}>
            <View style={styles.timerContainer}>
                {/* Utiliser SVG pour un meilleur contrôle du remplissage du cercle */}
                <Svg width={size} height={size}>
                    {/* Cercle de fond */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(0, 0, 0, 0.1)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Cercle de progression qui se vide */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={circleColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        // Rotation pour commencer en haut
                        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                    />
                </Svg>

                {/* Cercle central avec le temps restant */}
                <View style={styles.centerCircle}>
                    <Text style={[styles.timerText, { color: circleColor }]}>
                        {timeLeft}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 9999,
    },
    timerContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerCircle: {
        position: 'absolute',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,
    },
    timerText: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default SimpleInactivityTimer;