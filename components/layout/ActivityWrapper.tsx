// components/layout/ActivityWrapper.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

// Créer un contexte pour partager les événements d'activité
type ActivityContextType = {
    triggerActivity: () => void;
    addActivityListener: (callback: () => void) => string;
    removeActivityListener: (id: string) => void;
};

const ActivityContext = createContext<ActivityContextType | null>(null);

// Hook pour utiliser le contexte d'activité
export const useActivity = () => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error('useActivity doit être utilisé à l\'intérieur d\'un ActivityProvider');
    }
    return context;
};

// Props pour le wrapper d'activité
type ActivityWrapperProps = {
    children: React.ReactNode;
};

// Composant wrapper qui détecte les clics
export const ActivityWrapper: React.FC<ActivityWrapperProps> = ({ children }) => {
    // Stocker les écouteurs d'activité
    const [listeners, setListeners] = useState<Record<string, () => void>>({});

    // Fonction pour déclencher un événement d'activité
    const triggerActivity = useCallback(() => {
        // Notifier tous les écouteurs enregistrés
        Object.values(listeners).forEach(callback => callback());
    }, [listeners]);

    // Fonction pour ajouter un écouteur
    const addActivityListener = useCallback((callback: () => void) => {
        const id = Math.random().toString(36).substr(2, 9);
        setListeners(prev => ({ ...prev, [id]: callback }));
        return id;
    }, []);

    // Fonction pour supprimer un écouteur
    const removeActivityListener = useCallback((id: string) => {
        setListeners(prev => {
            const newListeners = { ...prev };
            delete newListeners[id];
            return newListeners;
        });
    }, []);

    // Valeur du contexte
    const contextValue: ActivityContextType = {
        triggerActivity,
        addActivityListener,
        removeActivityListener
    };

    return (
        <ActivityContext.Provider value={contextValue}>
            <TouchableWithoutFeedback onPress={triggerActivity}>
                <View style={{ flex: 1 }}>
                    {children}
                </View>
            </TouchableWithoutFeedback>
        </ActivityContext.Provider>
    );
};

export default ActivityWrapper;