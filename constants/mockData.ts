// constants/mockData.ts
export const MOCK_PATIENT_DATA = {
    '123456': {
        nom: 'Dupont Sophie',
        dateNaissance: '24/01/1990',
        dateRendezVous: '20/02/2025',
        heureRendezVous: '14:30',
        numeroSecu: '2 90 01 75 123 456 78',
        verified: true
    },
    // Ajoutez d'autres patients simulés ici
};

export const MOCK_PAYMENT_DATA = {
    '123456': {
        consultation: "Consultation médicale",
        consultationPrice: "30.00 euro",
        mutuelle: "Mutuelle Couverte",
        mutuelleAmount: "-20.00 euro",
        totalTTC: "10.00 €",
        regimeObligatoire: "Regime Obligatoire",
        regimeObligatoireValue: "Data"
    },
    // Ajoutez d'autres paiements simulés ici
};

export const DEFAULT_CODE_LENGTH = 6;
export const VALID_CODES = ['123456'];