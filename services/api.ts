// services/api.ts
import { PatientInfo, PaymentInfo } from '../types';

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
        CONFIRM_APPOINTMENT: '/kiosk/confirm',
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
     * Vérifie un code de rendez-vous et récupère les informations de l'appointment
     * @param code Code à 6 chiffres du rendez-vous
     * @returns Informations du patient si le code est valide, sinon null
     */
    async verifyAppointmentCode(code: string): Promise<PatientInfo | null> {
        try {
            const response = await fetchWithTimeout(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.VALIDATE_CODE}`, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            // Si l'API renvoie un succès sans données valides, on retourne null
            if (!data || !data.appointment) {
                return null;
            }

            // Extraire la date et l'heure du format "2025-04-14 14:19:00"
            const dateTime = data.appointment.date.split(' ');
            const dateStr = dateTime[0].split('-').reverse().join('/'); // Convertir YYYY-MM-DD en DD/MM/YYYY
            const timeStr = dateTime[1].substring(0, 5); // Extraire HH:MM

            // Formater le n° de sécu (simulation car non fourni par l'API)
            const randomSecu = Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
            const formattedSecu = `${randomSecu.substring(0, 1)} ${randomSecu.substring(1, 3)} ${randomSecu.substring(3, 5)} ${randomSecu.substring(5, 7)} ${randomSecu.substring(7, 10)} ${randomSecu.substring(10, 13)} ${randomSecu.substring(13, 15)}`;

            // Mapper les données de l'API vers le format attendu par l'application
            return {
                id: data.appointment.id,
                nom: data.appointment.patientName,
                dateNaissance: "01/01/1990", // Non fourni par l'API, valeur par défaut
                dateRendezVous: dateStr,
                heureRendezVous: timeStr,
                numeroSecu: formattedSecu,
                verified: true
            };
        } catch (error) {
            console.error('Erreur lors de la vérification du code:', error);
            throw error;
        }
    },

    /**
     * Confirme la présence du patient au rendez-vous
     * @param appointmentId ID du rendez-vous
     * @returns true si la confirmation est réussie, sinon false
     */
    async confirmAppointment(appointmentId: number): Promise<boolean> {
        try {
            const response = await fetchWithTimeout(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.CONFIRM_APPOINTMENT}`, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                },
                body: JSON.stringify({
                    id: appointmentId,
                    status: "confirmed",
                    confirmationTime: new Date().toISOString()
                }),
            });

            const data = await response.json();
            return data && data.message && data.message.includes("successfully");
        } catch (error) {
            console.error('Erreur lors de la confirmation du rendez-vous:', error);
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

            // Simulation des données de paiement (à adapter)
            return {
                consultation: "Consultation médicale",
                consultationPrice: "30.00 euro",
                mutuelle: "Mutuelle Couverte",
                mutuelleAmount: "-18.00 euro",
                totalTTC: "10.00 €",
                regimeObligatoire: "Regime Obligatoire",
                regimeObligatoireValue: "-6 euro",
            };
        } catch (error) {
            console.error('Erreur lors de la vérification du code de paiement:', error);
            throw error;
        }
    }
};

export default ApiService;