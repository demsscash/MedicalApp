// services/api.ts
import { PatientInfo, PaymentInfo, RoomInfo } from '../types';
import { MOCK_PATIENT_DATA, VALID_CODES, MOCK_PAYMENT_DATA } from '../constants/mockData';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// Nouvelles interfaces pour la recherche personnelle
export interface PersonalSearchData {
    nom: string;
    prenom: string;
    date_naissance: string; // Format ISO: YYYY-MM-DD
}

export interface ApiAppointmentResponse {
    id: number;
    appointmentDate: string;
    validationCode: string;
    status: string;
    patient: {
        id: number;
        nom: string;
        prenom: string;
        telephone: string | null;
        date_naissance: string;
        num_sec_social: string | null;
        zip_code: string | null;
        fullName: string;
    };
    price: number | null;
    couverture: number | null;
    total: number | null;
    time: string;
    title: string;
    medecin: {
        id: number;
        nom: string;
        prenom: string;
        telephone: string;
        specialite: string;
    };
    centre: {
        id: number;
        adresse: string;
        telephone: string;
        clinic: {
            name: string;
        };
    };
    regime_obligatoire: number | null;
}

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
        PERSONAL_SEARCH: '/kiosk/check', // NOUVEAU ENDPOINT
        ROOM_PROGRAMMING: '/kiosk/programmation-salle/appointment',
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
     * NOUVELLE MÉTHODE: Recherche un rendez-vous par informations personnelles
     */
    async searchAppointmentByPersonalInfo(searchData: PersonalSearchData): Promise<PatientInfo | null> {
        console.log("Recherche de rendez-vous par informations personnelles:", searchData);

        try {
            const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.PERSONAL_SEARCH}`;
            console.log(`Appel API recherche personnelle: ${url}`);

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: API_CONFIG.headers,
                body: JSON.stringify(searchData),
            });

            if (response.status === 404) {
                console.log("Aucun rendez-vous trouvé (404)");
                return null;
            }

            const appointmentData: ApiAppointmentResponse = await response.json();
            console.log("Réponse de l'API recherche personnelle:", appointmentData);

            if (!appointmentData || !appointmentData.id) {
                console.log("Aucune donnée valide reçue de l'API");
                return null;
            }

            // Formater la date et l'heure
            let dateStr = "01/01/2025";
            let timeStr = "00:00";

            if (appointmentData.appointmentDate) {
                try {
                    const date = new Date(appointmentData.appointmentDate);
                    dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                    timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                } catch (e) {
                    console.error("Erreur lors du formatage de la date:", e);
                }
            }

            // Formater le numéro de sécurité sociale
            let numeroSecu = "";
            if (appointmentData.patient.num_sec_social) {
                numeroSecu = appointmentData.patient.num_sec_social;
            } else if (appointmentData.patient.telephone) {
                const tel = appointmentData.patient.telephone.padEnd(15, '0');
                numeroSecu = `${tel.substring(0, 1)} ${tel.substring(1, 3)} ${tel.substring(3, 5)} ${tel.substring(5, 7)} ${tel.substring(7, 10)} ${tel.substring(10, 13)} ${tel.substring(13, 15)}`;
            } else {
                numeroSecu = "0 00 00 00 000 000 00";
            }

            // Récupérer les informations de salle si possible
            let salleConsultation = "salle de consultation 04";
            let salleAttente = "salle d'attente 01";
            let medecin = `${appointmentData.medecin.nom} ${appointmentData.medecin.prenom}`.trim();

            try {
                const roomInfo = await this.getRoomInfoByAppointment(appointmentData.id);
                if (roomInfo) {
                    salleConsultation = roomInfo.salle.numero;
                    salleAttente = roomInfo.salle.salleAttentes.length > 0
                        ? roomInfo.salle.salleAttentes[0].nom
                        : "salle d'attente 01";
                    medecin = roomInfo.medecin.nom;
                }
            } catch (roomError) {
                console.warn("Erreur lors de la récupération des informations de salle, utilisation des valeurs par défaut:", roomError);
            }

            const result: PatientInfo = {
                id: appointmentData.id,
                nom: appointmentData.patient.fullName || `${appointmentData.patient.prenom} ${appointmentData.patient.nom}`,
                dateNaissance: appointmentData.patient.date_naissance ?
                    new Date(appointmentData.patient.date_naissance).toLocaleDateString('fr-FR') :
                    "01/01/1990",
                dateRendezVous: dateStr,
                heureRendezVous: timeStr,
                numeroSecu: numeroSecu,
                verified: true,
                price: appointmentData.price || 0,
                couverture: appointmentData.couverture || 0,
                status: appointmentData.status || "En attente",
                salleConsultation: salleConsultation,
                salleAttente: salleAttente,
                medecin: medecin
            };

            console.log("Données formatées:", result);
            return result;

        } catch (error) {
            console.error('Erreur lors de la recherche par informations personnelles:', error);

            // Pas de fallback pour la recherche personnelle car les données simulées 
            // ne correspondent pas à des vraies recherches par nom
            throw error;
        }
    },

    /**
     * NOUVELLE MÉTHODE: Récupère les données de rendez-vous par ID (utilisé après recherche personnelle)
     */
    async getAppointmentById(appointmentId: number): Promise<PatientInfo | null> {
        console.log("Récupération des données du rendez-vous pour l'ID:", appointmentId);

        try {
            // Construire l'URL pour récupérer par ID
            const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.GET_APPOINTMENT}/${appointmentId}`;
            console.log(`Appel API détails par ID: ${url}`);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: API_CONFIG.headers,
            });

            const appointmentDetails = await response.json();
            console.log("Réponse de l'API GET_APPOINTMENT par ID:", appointmentDetails);

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

            // Formater le n° de sécu
            let numeroSecu = "";
            if (patientInfo.num_sec_social) {
                numeroSecu = patientInfo.num_sec_social;
            } else if (patientInfo.telephone) {
                const tel = patientInfo.telephone.padEnd(15, '0');
                numeroSecu = `${tel.substring(0, 1)} ${tel.substring(1, 3)} ${tel.substring(3, 5)} ${tel.substring(5, 7)} ${tel.substring(7, 10)} ${tel.substring(10, 13)} ${tel.substring(13, 15)}`;
            } else {
                numeroSecu = "0 00 00 00 000 000 00";
            }

            // Récupérer les informations de salle
            let salleConsultation = "salle de consultation 04";
            let salleAttente = "salle d'attente 01";
            let medecin = "Dr Martin François";

            if (appointmentDetails.medecin) {
                medecin = `${appointmentDetails.medecin.nom} ${appointmentDetails.medecin.prenom || ''}`.trim();
            }

            try {
                const roomInfo = await this.getRoomInfoByAppointment(appointmentId);
                if (roomInfo) {
                    salleConsultation = roomInfo.salle.numero;
                    salleAttente = roomInfo.salle.salleAttentes.length > 0
                        ? roomInfo.salle.salleAttentes[0].nom
                        : "salle d'attente 01";
                    medecin = roomInfo.medecin.nom;
                }
            } catch (roomError) {
                console.warn("Erreur lors de la récupération des informations de salle, utilisation des valeurs par défaut:", roomError);
            }

            const result: PatientInfo = {
                id: appointmentDetails.id || appointmentId,
                nom: fullName.trim() || "Patient",
                dateNaissance: patientInfo.date_naissance ? new Date(patientInfo.date_naissance).toLocaleDateString('fr-FR') : "01/01/1990",
                dateRendezVous: dateStr,
                heureRendezVous: timeStr,
                numeroSecu: numeroSecu,
                verified: true,
                price: appointmentDetails.price || 0,
                couverture: appointmentDetails.couverture || 0,
                status: appointmentDetails.status || "validated",
                salleConsultation: salleConsultation,
                salleAttente: salleAttente,
                medecin: medecin
            };

            console.log("Données formatées par ID:", result);
            return result;

        } catch (error) {
            console.error('Erreur lors de la récupération des détails par ID:', error);
            throw error;
        }
    },

    /**
     * Récupère les informations de programmation de salle pour un rendez-vous
     */
    async getRoomInfoByAppointment(appointmentId: number): Promise<RoomInfo | null> {
        console.log("Récupération des informations de salle pour le rendez-vous:", appointmentId);

        try {
            const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.ROOM_PROGRAMMING}/${appointmentId}`;
            console.log(`Appel API programmation salle: ${url}`);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: API_CONFIG.headers,
            });

            const roomData = await response.json();
            console.log("Réponse de l'API programmation salle:", roomData);

            // L'API retourne un tableau, prendre le premier élément
            if (Array.isArray(roomData) && roomData.length > 0) {
                return roomData[0];
            }

            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération des informations de salle:', error);
            // Retourner des données par défaut en cas d'erreur
            return {
                id: appointmentId,
                date: new Date().toISOString(),
                medecin: {
                    nom: "Dr Martin François",
                    prenom: null
                },
                etat: "Disponible",
                remarque: "",
                salle: {
                    id: 1,
                    numero: "salle de consultation 04",
                    salleAttentes: [{
                        id: 1,
                        nom: "salle d'attente 01"
                    }]
                }
            };
        }
    },

    /**
     * Récupère les données de rendez-vous complètes par code avec informations de salle
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

                // Récupérer les informations de salle si l'ID du rendez-vous est disponible
                let salleConsultation = "salle de consultation 04";
                let salleAttente = "salle d'attente 01";
                let medecin = "Dr Martin François";

                if (appointmentDetails.id) {
                    try {
                        const roomInfo = await this.getRoomInfoByAppointment(appointmentDetails.id);
                        if (roomInfo) {
                            salleConsultation = roomInfo.salle.numero;
                            salleAttente = roomInfo.salle.salleAttentes.length > 0
                                ? roomInfo.salle.salleAttentes[0].nom
                                : "salle d'attente 01";
                            medecin = roomInfo.medecin.nom;
                        }
                    } catch (roomError) {
                        console.warn("Erreur lors de la récupération des informations de salle, utilisation des valeurs par défaut:", roomError);
                    }
                }

                const result: PatientInfo = {
                    id: appointmentDetails.id,
                    nom: fullName.trim() || "Patient",
                    dateNaissance: patientInfo.date_naissance ? new Date(patientInfo.date_naissance).toLocaleDateString('fr-FR') : "01/01/1990",
                    dateRendezVous: dateStr,
                    heureRendezVous: timeStr,
                    numeroSecu: numeroSecu,
                    verified: true,
                    price: appointmentDetails.price || 0,
                    couverture: appointmentDetails.couverture || 0,
                    status: appointmentDetails.status || "validated",
                    // Nouvelles propriétés dynamiques
                    salleConsultation: salleConsultation,
                    salleAttente: salleAttente,
                    medecin: medecin
                };

                console.log("Données formatées avec informations de salle:", result);
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
                        id: parseInt(code),
                        // Données de salle par défaut pour les tests
                        salleConsultation: "salle de consultation 04",
                        salleAttente: "salle d'attente 01",
                        medecin: "Dr Martin François"
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
                    id: parseInt(code),
                    // Données de salle par défaut pour les tests
                    salleConsultation: "salle de consultation 04",
                    salleAttente: "salle d'attente 01",
                    medecin: "Dr Martin François"
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