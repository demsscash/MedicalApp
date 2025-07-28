// components/layout/AuthWrapper.tsx - Version corrigée
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import LoadingIndicator from '../ui/LoadingIndicator';
import { KioskAuthService } from '../../services/kioskAuth';
import KioskAuthScreen from '../../app/kiosk-auth';

type AuthWrapperProps = {
    children: React.ReactNode;
};

/**
 * Wrapper qui vérifie l'authentification de la borne au démarrage
 * et affiche l'écran d'authentification si nécessaire
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const pathname = usePathname();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthScreen, setShowAuthScreen] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            // Vérifier si nous sommes déjà sur l'écran d'authentification
            if (pathname === '/kiosk-auth') {
                setIsCheckingAuth(false);
                setIsAuthenticated(true); // Permettre l'affichage de l'écran d'auth
                return;
            }

            console.log('Vérification de l\'authentification de la borne...');

            // Vérifier si la borne est déjà authentifiée
            const isAuth = await KioskAuthService.isKioskAuthenticated();

            console.log('Statut d\'authentification:', isAuth);

            if (isAuth) {
                // La borne est authentifiée, continuer normalement
                setIsAuthenticated(true);
                setShowAuthScreen(false);
                setIsCheckingAuth(false);
            } else {
                // La borne n'est pas authentifiée, afficher l'écran d'auth
                console.log('Borne non authentifiée, affichage de l\'écran d\'authentification');
                setIsAuthenticated(false);
                setShowAuthScreen(true);
                setIsCheckingAuth(false);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);

            // En cas d'erreur, afficher l'écran d'authentification par sécurité
            setIsAuthenticated(false);
            setShowAuthScreen(true);
            setIsCheckingAuth(false);
        }
    };

    // Fonction appelée quand l'authentification réussit
    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        setShowAuthScreen(false);
    };

    // Afficher un écran de chargement pendant la vérification
    if (isCheckingAuth) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F0F5FF' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingIndicator
                        text="Initialisation de la borne..."
                        size="large"
                    />
                </View>
            </View>
        );
    }

    // Si nous devons afficher l'écran d'authentification
    if (showAuthScreen && !isAuthenticated) {
        return <KioskAuthScreen onAuthSuccess={handleAuthSuccess} />;
    }

    // Si la borne est authentifiée ou si nous sommes sur l'écran d'authentification,
    // afficher le contenu normal
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // Fallback: ne rien afficher
    return null;
};

export default AuthWrapper;