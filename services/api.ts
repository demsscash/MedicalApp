// services/api.ts
import { PatientInfo, PaymentInfo } from '../types';
import { MOCK_PATIENT_DATA, VALID_CODES, MOCK_PAYMENT_DATA } from '../constants/mockData';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// Configuration de l'API
const API_CONFIG = {
    baseUrl: 'https://borne.techfawn.fr/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    endpoints: {
        VALIDATE_CODE: '/kiosk/validate',
        GET_APPOINTMENT: '/kiosk/appointment',
        INVOICE_PDF: '/kiosk/invoices',
        PRESCRIPTION_PDF: '/kiosk/prescriptions'
    }
};

/**
 * Fonction pour effectuer des requêtes avec gestion d'erreurs et de timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = API_CONFIG.timeout): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        console.log(`Appel API: ${url}`, options);
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(id);

        console.log(`Réponse API: ${url}, status:`, response.status);

        if (url.includes(API_CONFIG.endpoints.VALIDATE_CODE) && response.status === 404) {
            console.log("Code invalide détecté (statut 404)");
            return response;
        }

        if (!response.ok) {
            console.error(`Erreur API: ${response.status} ${response.statusText}`);
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        return response;
    } catch (error) {
        clearTimeout(id);
        console.error("Erreur fetch:", error);

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Requête abandonnée: le serveur n\'a pas répondu à temps');
        }

        throw error;
    }
}

/**
 * API Service pour gérer les interactions avec l'API
 */
export const ApiService = {
    /**
     * Vérifie si un code de rendez-vous est valide (utilisé par le premier flux)
     */
    async verifyAppointmentCode(code: string): Promise<boolean> {
        console.log("Vérification du code:", code);

        try {
            // Essayer d'abord l'API
            try {
                const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.VALIDATE_CODE}`;
                console.log(`Appel API validation: ${url}`);

                const response = await fetchWithTimeout(url, {
                    method: 'POST',
                    headers: API_CONFIG.headers,
                    body: JSON.stringify({ code }),
                });

                console.log("Réponse du serveur:", response.status);

                if (response.status === 404) {
                    console.log("Code invalide (404)");
                    return false;
                }

                let data;
                try {
                    data = await response.json();
                    console.log("Données reçues:", data);
                } catch (e) {
                    console.log("Pas de données JSON, utilisation du statut");
                    return response.status === 200;
                }

                const isValid =
                    (data && data.success === true) ||
                    (data && data.status === "success") ||
                    (data && (data.appointment || data.rendezVous)) ||
                    (response.status === 200 && data);

                console.log("Code valide?", isValid);
                return isValid;
            } catch (apiError) {
                console.warn('Erreur API de validation, utilisation des données locales:', apiError);
                // En cas d'erreur d'API, utiliser les données locales
                const isValid = VALID_CODES.includes(code);
                console.log("Validation locale:", isValid);
                return isValid;
            }
        } catch (error) {
            console.error('Erreur globale lors de la vérification:', error);
            // En cas d'erreur générale, vérifier si c'est un code de test valide
            const isValid = VALID_CODES.includes(code);
            console.log("Validation de secours:", isValid);
            return isValid;
        }
    },

    /**
     * Récupère les données de rendez-vous complètes par code
     */
    async getAppointmentByCode(code: string): Promise<PatientInfo | null> {
        console.log("Récupération des données du rendez-vous pour le code:", code);

        try {
            // Essayer d'abord l'API
            try {
                // Construire l'URL correcte
                const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.GET_APPOINTMENT}/${code}`;
                console.log(`Appel API détails: ${url}`);

                const response = await fetchWithTimeout(url, {
                    method: 'GET',
                    headers: API_CONFIG.headers,
                });

                const appointmentDetails = await response.json();
                console.log("Réponse de l'API GET_APPOINTMENT:", appointmentDetails);

                if (!appointmentDetails) {
                    console.log("Aucune donnée reçue de l'API");
                    return null;
                }

                // Formater la date et l'heure si disponibles
                let dateStr = "01/01/2025";
                let timeStr = "00:00";

                if (appointmentDetails.appointmentDate) {
                    try {
                        const date = new Date(appointmentDetails.appointmentDate);
                        dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                        timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    } catch (e) {
                        console.error("Erreur lors du formatage de la date:", e);
                    }
                }

                // Récupérer les infos du patient
                const patientInfo = appointmentDetails.patient || {};
                const fullName = patientInfo.fullName || `${patientInfo.prenom || ''} ${patientInfo.nom || ''}`;

                // Formater le n° de sécu à partir du téléphone si disponible
                let numeroSecu = "";
                if (patientInfo.telephone) {
                    const tel = patientInfo.telephone.padEnd(15, '0');
                    numeroSecu = `${tel.substring(0, 1)} ${tel.substring(1, 3)} ${tel.substring(3, 5)} ${tel.substring(5, 7)} ${tel.substring(7, 10)} ${tel.substring(10, 13)} ${tel.substring(13, 15)}`;
                } else {
                    // Valeur par défaut
                    numeroSecu = "0 00 00 00 000 000 00";
                }

                const result = {
                    id: appointmentDetails.id,
                    nom: fullName.trim() || "Patient",
                    dateNaissance: patientInfo.date_naissance ? new Date(patientInfo.date_naissance).toLocaleDateString('fr-FR') : "01/01/1990",
                    dateRendezVous: dateStr,
                    heureRendezVous: timeStr,
                    numeroSecu: numeroSecu,
                    verified: true,
                    price: appointmentDetails.price || 0,
                    couverture: appointmentDetails.couverture || 0,
                    status: appointmentDetails.status || "validated"
                };

                console.log("Données formatées:", result);
                return result;
            } catch (apiError) {
                console.warn("Erreur API détails, utilisation des données locales:", apiError);

                // En cas d'erreur, utiliser les données simulées
                if (VALID_CODES.includes(code) && MOCK_PATIENT_DATA[code]) {
                    const mockData = MOCK_PATIENT_DATA[code];
                    console.log("Utilisation des données simulées:", mockData);

                    // Ajouter les champs manquants
                    return {
                        ...mockData,
                        price: mockData.price || 49,
                        couverture: mockData.couverture || 10,
                        status: "validated",
                        id: parseInt(code)
                    };
                }

                throw apiError;
            }
        } catch (error) {
            console.error('Erreur globale lors de la récupération des détails:', error);

            // Fallback final - utiliser les données simulées
            if (VALID_CODES.includes(code) && MOCK_PATIENT_DATA[code]) {
                const mockData = MOCK_PATIENT_DATA[code];
                console.log("Utilisation des données simulées (fallback final):", mockData);

                return {
                    ...mockData,
                    price: mockData.price || 49,
                    couverture: mockData.couverture || 10,
                    status: "validated",
                    id: parseInt(code)
                };
            }

            throw error;
        }
    },

    async getPaymentByCode(code: string): Promise<PaymentInfo | null> {
        try {
            // Utiliser getAppointmentByCode pour récupérer les informations du rendez-vous
            const appointmentDetails = await this.getAppointmentByCode(code);

            if (!appointmentDetails || !appointmentDetails.id) {
                console.error("Aucune information valide trouvée pour le code:", code);
                return null;
            }

            // Construire les informations de paiement à partir des données du rendez-vous
            const appointmentId = appointmentDetails.id;
            const price = appointmentDetails.price || 0;
            const couverture = appointmentDetails.couverture || 0;
            const total = price - couverture;

            console.log(`Rendez-vous trouvé avec ID=${appointmentId}, prix=${price}, couverture=${couverture}, total=${total}`);

            return {
                appointmentId: appointmentId,
                consultation: "Consultation médicale",
                consultationPrice: `${price.toFixed(2)} €`,
                mutuelle: "Mutuelle",
                mutuelleAmount: `-${couverture.toFixed(2)} €`,
                totalTTC: `${total.toFixed(2)} €`,
                regimeObligatoire: "Régime Obligatoire",
                regimeObligatoireValue: "-0.00 €",  // Par défaut
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des informations de paiement:', error);

            // En cas d'erreur, essayer les données simulées si le code est valide
            if (VALID_CODES.includes(code) && MOCK_PAYMENT_DATA[code]) {
                return {
                    ...MOCK_PAYMENT_DATA[code],
                    appointmentId: parseInt(code)
                };
            }

            // Si même les données simulées ne sont pas disponibles, retourner null
            // pour garder un comportement cohérent avec getAppointmentByCode
            return null;
        }
    },
    async downloadAndShareInvoice(appointmentId: number): Promise<boolean> {
        try {
            console.log(`Téléchargement de la facture pour le rendez-vous ${appointmentId}`);

            // Construire l'URL du PDF
            let pdfUrl: string;
            if (process.env.NODE_ENV !== 'production') {
                pdfUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.INVOICE_PDF}/${appointmentId}/pdf`;
            } else {
                pdfUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.INVOICE_PDF}/${appointmentId}/pdf`;
            }

            // Vérifier si nous sommes sur le web
            if (Platform.OS === 'web') {
                console.log("Plateforme web: ouverture du PDF dans un nouvel onglet");

                // Sur le web, ouvrir le PDF dans un nouvel onglet
                window.open(pdfUrl, '_blank');
                return true;
            } else {
                // Sur mobile, utiliser expo-file-system et expo-sharing
                const fileName = `facture_${appointmentId}_${Date.now()}.pdf`;
                const fileUri = FileSystem.documentDirectory + fileName;

                // Télécharger le fichier
                const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);

                if (downloadResult.status !== 200) {
                    throw new Error(`Erreur lors du téléchargement: ${downloadResult.status}`);
                }

                // Vérifier si le partage est disponible
                const canShare = await Sharing.isAvailableAsync();
                if (!canShare) {
                    throw new Error("Le partage n'est pas disponible sur cet appareil");
                }

                // Ouvrir le dialogue de partage
                await Sharing.shareAsync(fileUri, {
                    UTI: 'com.adobe.pdf',
                    mimeType: 'application/pdf',
                    dialogTitle: 'Enregistrer ou partager votre facture'
                });
            }

            return true;
        } catch (error) {
            console.error('Erreur lors du téléchargement de la facture:', error);
            throw error;
        }
    },

    async downloadAndSharePrescription(appointmentId: number): Promise<boolean> {
        try {
            console.log(`Téléchargement de l'ordonnance pour le rendez-vous ${appointmentId}`);

            // Construire l'URL du PDF
            let pdfUrl: string;
            if (process.env.NODE_ENV !== 'production') {
                pdfUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.PRESCRIPTION_PDF}/${appointmentId}/pdf`;
            } else {
                pdfUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.PRESCRIPTION_PDF}/${appointmentId}/pdf`;
            }

            // Vérifier si nous sommes sur le web
            if (Platform.OS === 'web') {
                console.log("Plateforme web: ouverture du PDF dans un nouvel onglet");

                // Sur le web, ouvrir le PDF dans un nouvel onglet
                window.open(pdfUrl, '_blank');
                return true;
            } else {
                // Sur mobile, utiliser expo-file-system et expo-sharing
                const fileName = `ordonnance_${appointmentId}_${Date.now()}.pdf`;
                const fileUri = FileSystem.documentDirectory + fileName;

                // Télécharger le fichier
                const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);

                if (downloadResult.status !== 200) {
                    throw new Error(`Erreur lors du téléchargement: ${downloadResult.status}`);
                }

                // Vérifier si le partage est disponible
                const canShare = await Sharing.isAvailableAsync();
                if (!canShare) {
                    throw new Error("Le partage n'est pas disponible sur cet appareil");
                }

                // Ouvrir le dialogue de partage
                await Sharing.shareAsync(fileUri, {
                    UTI: 'com.adobe.pdf',
                    mimeType: 'application/pdf',
                    dialogTitle: 'Enregistrer ou partager votre ordonnance'
                });
            }

            return true;
        } catch (error) {
            console.error('Erreur lors du téléchargement de l\'ordonnance:', error);
            throw error;
        }
    }
};

export default ApiService;