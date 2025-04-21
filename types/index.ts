// types/index.ts
import { TextInput } from "react-native";

export type PatientInfo = {
    id?: number; // ID du rendez-vous pour la confirmation
    nom: string;
    dateNaissance: string;
    dateRendezVous: string;
    heureRendezVous: string;
    numeroSecu: string;
    verified: boolean;
    // Nouvelles propriétés
    price?: number; // Prix de la consultation
    couverture?: number; // Montant de la couverture mutuelle
    status?: string; // Statut du rendez-vous
};

export type PaymentInfo = {
    consultation: string;
    consultationPrice: string;
    mutuelle: string;
    mutuelleAmount: string;
    totalTTC: string;
    regimeObligatoire: string;
    regimeObligatoireValue: string;
    id?: string; // ID direct pour les documents PDF
};

export type PressedButtonType = 'accueil' | 'paiement' | null;

export type CodeInputRef = React.RefObject<TextInput>;