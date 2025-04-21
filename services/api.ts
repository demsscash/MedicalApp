// services/api.ts
import { PatientInfo, PaymentInfo } from '../types';
import { MOCK_PATIENT_DATA, VALID_CODES, MOCK_PAYMENT_DATA } from '../constants/mockData';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// Configuration de l'API
const API_CONFIG = {
    baseUrl: 'http://localhost:8080/api',
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
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(id);

        if (url.includes(API_CONFIG.endpoints.VALIDATE_CODE) && response.status === 404) {
            console.log("Code invalide détecté (statut 404)");
            return response;
        }

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        return response;
    } catch (error: unknown) {
        clearTimeout(id);

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
     * Cette méthode reste inchangée
     */
    async verifyAppointmentCode(code: string): Promise<boolean> {
        try {
            // En mode développement, vérifier directement avec les données simulées
            if (process.env.NODE_ENV !== 'production') {
                console.log("Mode développement: vérification avec données simulées");
                await new Promise(resolve => setTimeout(resolve, 500));
                return VALID_CODES.includes(code);
            }

            // Pour la production
            const response = await fetchWithTimeout(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.VALIDATE_CODE}`, {
                method: 'POST',
                headers: API_CONFIG.headers,
                body: JSON.stringify({ code }),
            });

            if (response.status === 404) {
                return false;
            }

            let data;
            try {
                data = await response.json();
            } catch (e) {
                return response.status === 200;
            }

            const isValid =
                (data && data.success === true) ||
                (data && data.status === "success") ||
                (data && (data.appointment || data.rendezVous)) ||
                (response.status === 200 && data);

            return isValid;
        } catch (error) {
            console.error('Erreur lors de la vérification du code:', error);
            // En cas d'erreur, vérifier si c'est un code de test valide
            if (VALID_CODES.includes(code)) {
                return true;
            }
            throw error;
        }
    },

    /**
     * Récupère les données de rendez-vous complètes par code
     * @param code Code du rendez-vous
     * @returns Informations détaillées du rendez-vous incluant prix et couverture
     */
    async getAppointmentByCode(code: string): Promise<PatientInfo | null> {
        try {
            // En mode développement, utiliser les données simulées
            if (process.env.NODE_ENV !== 'production' && VALID_CODES.includes(code) && MOCK_PATIENT_DATA[code]) {
                console.log("Mode développement: données de rendez-vous simulées");
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return {
                    ...MOCK_PATIENT_DATA[code],
                    price: 49,
                    couverture: 10,
                    status: "validated",
                    id: parseInt(code)
                };
            }

            try {
                // Pour la production ou le développement avec API réelle
                const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.GET_APPOINTMENT}/${code}`;
                console.log(`Appelant l'API avec l'URL: ${url}`);
                
                const response = await fetchWithTimeout(url, {
                    method: 'GET',
                    headers: API_CONFIG.headers,
                });

                const appointmentDetails = await response.json();
                console.log("Réponse de l'API GET_APPOINTMENT:", appointmentDetails);
                
                if (!appointmentDetails) {
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

                return {
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
            } catch (apiError) {
                console.error("Erreur API, utilisation des données de secours:", apiError);
                
                // En cas d'erreur, essayer les données simulées
                if (VALID_CODES.includes(code) && MOCK_PATIENT_DATA[code]) {
                    return {
                        ...MOCK_PATIENT_DATA[code],
                        price: 49,
                        couverture: 10,
                        status: "validated",
                        id: parseInt(code)
                    };
                }
                
                throw apiError;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du rendez-vous:', error);
            throw error;
        }
    },

    /**
     * Récupère les informations de paiement à partir du code de validation
     * Utilise simplement getAppointmentByCode et convertit le résultat au format PaymentInfo
     */
    async getPaymentByCode(code: string): Promise<PaymentInfo | null> {
        try {
            // Utiliser getAppointmentByCode pour récupérer les informations du rendez-vous
            const appointmentDetails = await this.getAppointmentByCode(code);
            
            if (!appointmentDetails || !appointmentDetails.id) {
                console.error("Impossible de récupérer l'ID du rendez-vous pour le code:", code);
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
            
            // En cas d'erreur, essayer les données simulées
            if (VALID_CODES.includes(code) && MOCK_PAYMENT_DATA[code]) {
                return {
                    ...MOCK_PAYMENT_DATA[code],
                    appointmentId: parseInt(code)
                };
            }
            
            throw error;
        }
    },

    /**
     * Télécharge ou ouvre le PDF de la facture selon la plateforme
     * @param appointmentId ID du rendez-vous
     * @returns Promise résolue quand le téléchargement ou l'ouverture est terminé
     */
    async downloadAndShareInvoice(appointmentId: number): Promise<boolean> {
        try {
            console.log(`Téléchargement de la facture pour le rendez-vous ${appointmentId}`);
            
            // Construire l'URL du PDF
            let pdfUrl: string;
            if (process.env.NODE_ENV !== 'production') {
                pdfUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.INVOICE_PDF}/${appointmentId}/pdf`;;
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
    
    /**
     * Télécharge ou ouvre le PDF de l'ordonnance selon la plateforme
     * @param appointmentId ID du rendez-vous
     * @returns Promise résolue quand le téléchargement ou l'ouverture est terminé
     */
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