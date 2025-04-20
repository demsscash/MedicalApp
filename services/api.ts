// services/api.ts
import { PatientInfo, PaymentInfo } from '../types';
import { MOCK_PATIENT_DATA, VALID_CODES, MOCK_PAYMENT_DATA } from '../constants/mockData';

// Configuration de l'API
const API_CONFIG = {
    baseUrl: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'deflate, gzip',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Content-Type': 'application/json'
    },
    endpoints: {
        VALIDATE_CODE: '/kiosk/validate',
        GET_APPOINTMENT: '/kiosk/appointment',  // Endpoint pour obtenir un rendez-vous avec le code
        PAYMENT_VERIFY: '/kiosk/payment/verify',
        PAYMENT_PROCESS: '/kiosk/payment/process'
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

        // Pour vérification du code, traiter 404 comme une réponse valide (code invalide)
        if (url.includes(API_CONFIG.endpoints.VALIDATE_CODE) && response.status === 404) {
            console.log("Code invalide détecté (statut 404)");
            return response; // Retourner la réponse pour qu'on puisse traiter le 404 comme code invalide
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
     * Vérifie si un code de rendez-vous est valide
     * @param code Code à 6 chiffres du rendez-vous
     * @returns true si le code est valide, sinon false
     */
    async verifyAppointmentCode(code: string): Promise<boolean> {
        try {
            // Vérifier le code
            const response = await fetchWithTimeout(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.VALIDATE_CODE}`, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                },
                body: JSON.stringify({ code }),
            });

            // Si le serveur retourne 404, interpréter comme code invalide
            if (response.status === 404) {
                console.log("Le serveur a retourné 404 - code invalide");
                return false;
            }

            let data;
            try {
                data = await response.json();
                console.log("Réponse API pour la vérification du code:", data);
            } catch (e) {
                console.log("Erreur lors du parsing JSON:", e);
                // Si aucune donnée JSON valide n'est reçue mais que le statut est 200, 
                // c'est probablement une réponse de succès sans contenu
                return response.status === 200;
            }

            // L'API peut renvoyer différentes structures de réponse pour indiquer le succès
            // Vérifiez toutes les possibilités courantes
            const isValid =
                // Si data.success existe et est true
                (data && data.success === true) ||
                // OU si data.status est "success"
                (data && data.status === "success") ||
                // OU si data a un champ appointment/rendezVous
                (data && (data.appointment || data.rendezVous)) ||
                // OU si le statut HTTP est 200 et data existe (indication minimale de succès)
                (response.status === 200 && data);

            console.log("Code valide:", isValid);
            return isValid;
        } catch (error) {
            console.error('Erreur lors de la vérification du code:', error);
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
            // Gestion spéciale des codes de test
            if (VALID_CODES.includes(code) && MOCK_PATIENT_DATA && MOCK_PATIENT_DATA[code]) {
                console.log("Code de test détecté, utilisation des données simulées");
                const mockData = MOCK_PATIENT_DATA[code];
                return {
                    ...mockData,
                    price: 49,
                    couverture: 10,
                    status: "validated"
                };
            }

            // URL avec le code dans le chemin ou en paramètre selon l'API
            const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.GET_APPOINTMENT}/${code}`;
            console.log(`Appelant l'API avec l'URL: ${url}`);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: {
                    ...API_CONFIG.headers,
                },
            });

            const appointmentDetails = await response.json();

            if (!appointmentDetails) {
                return null;
            }

            // Formater la date et l'heure si disponibles
            let dateStr = "01/01/2025";
            let timeStr = "00:00";

            if (appointmentDetails.date) {
                const dateTime = appointmentDetails.date.split(' ');
                dateStr = dateTime[0].split('-').reverse().join('/'); // Convertir YYYY-MM-DD en DD/MM/YYYY
                timeStr = dateTime[1]?.substring(0, 5) || "00:00"; // Extraire HH:MM
            }

            // Formater le n° de sécu (simulation car non fourni par l'API)
            const randomSecu = Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
            const formattedSecu = `${randomSecu.substring(0, 1)} ${randomSecu.substring(1, 3)} ${randomSecu.substring(3, 5)} ${randomSecu.substring(5, 7)} ${randomSecu.substring(7, 10)} ${randomSecu.substring(10, 13)} ${randomSecu.substring(13, 15)}`;

            // Mapper les données de l'API vers le format attendu par l'application
            return {
                nom: appointmentDetails.patientName || "Patient",
                dateNaissance: "01/01/1990", // Non fourni par l'API, valeur par défaut
                dateRendezVous: dateStr,
                heureRendezVous: timeStr,
                numeroSecu: formattedSecu,
                verified: true,
                // Données financières
                price: appointmentDetails.price || 0,
                couverture: appointmentDetails.couverture || 0,
                status: appointmentDetails.status || "validated"
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du rendez-vous:', error);
            throw error;
        }
    },

    /**
     * Vérifie un code de paiement
     * @param code Code à 6 chiffres pour le paiement
     * @returns Informations de paiement si valide, sinon null
     */
    async verifyPaymentCode(code: string): Promise<PaymentInfo | null> {
        try {
            // Vérifier d'abord si nous avons des données de test pour ce code
            if (VALID_CODES.includes(code) && MOCK_PAYMENT_DATA && MOCK_PAYMENT_DATA[code]) {
                console.log("Code de test détecté, utilisation des données simulées de paiement");
                return MOCK_PAYMENT_DATA[code];
            }

            // Sinon, appeler l'API
            const response = await fetchWithTimeout(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.PAYMENT_VERIFY}`, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            // À adapter selon la réponse réelle de votre API
            if (!data || !data.success) {
                return null;
            }

            // Mapper les données de l'API vers le format attendu
            return {
                consultation: data.consultation || "Consultation médicale",
                consultationPrice: data.price || "30.00 euro",
                mutuelle: data.mutuelle || "Mutuelle Couverte",
                mutuelleAmount: data.mutuelleAmount || "-18.00 euro",
                totalTTC: data.totalTTC || "10.00 €",
                regimeObligatoire: data.regimeObligatoire || "Regime Obligatoire",
                regimeObligatoireValue: data.regimeObligatoireValue || "-6 euro",
            };
        } catch (error) {
            console.error('Erreur lors de la vérification du code de paiement:', error);
            // En cas d'erreur, vérifier si nous avons des données de test pour ce code
            if (VALID_CODES.includes(code) && MOCK_PAYMENT_DATA && MOCK_PAYMENT_DATA[code]) {
                console.log("Utilisation des données simulées de paiement en secours");
                return MOCK_PAYMENT_DATA[code];
            }
            throw error;
        }
    }
};

export default ApiService;