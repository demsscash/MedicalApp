// services/api.ts
import { PatientInfo } from '../types';
import { API } from '../constants/apiConfig';

// Configuration récupérée depuis le fichier de configuration
const API_BASE_URL = API.baseUrl;
const API_TIMEOUT = API.timeout;
const ENDPOINTS = API.endpoints;

/**
 * Fonction pour effectuer des requêtes avec gestion d'erreurs et de timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = API_TIMEOUT): Promise<Response> {
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
 * API Service pour gérer les interactions avec l'API Symfony
 */
export const ApiService = {
    /**
     * Vérifie un code de rendez-vous et récupère les informations du patient
     * @param code Code à 6 chiffres du rendez-vous
     * @returns Informations du patient si le code est valide, sinon null
     */
    async verifyAppointmentCode(code: string): Promise<PatientInfo | null> {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}${ENDPOINTS.VERIFY_CODE}`, {
                method: 'POST',
                headers: {
                    ...API.headers,
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            // Si l'API renvoie un succès sans données valides, on retourne null
            if (!data || !data.success) {
                return null;
            }

            // Mapper les données de l'API vers le format attendu par l'application
            return {
                nom: data.patient.fullName,
                dateNaissance: data.patient.birthDate,
                dateRendezVous: data.appointment.date,
                heureRendezVous: data.appointment.time,
                numeroSecu: data.patient.securityNumber,
                verified: true
            };
        } catch (error) {
            console.error('Erreur lors de la vérification du code:', error);
            throw error;
        }
    },

    /**
     * Confirme la présence du patient au rendez-vous
     * @param code Code du rendez-vous
     * @returns true si la confirmation est réussie, sinon false
     */
    async confirmAppointment(code: string): Promise<boolean> {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}${ENDPOINTS.CONFIRM_APPOINTMENT}`, {
                method: 'POST',
                headers: {
                    ...API.headers,
                },
                body: JSON.stringify({
                    code,
                    confirmationTime: new Date().toISOString()
                }),
            });

            const data = await response.json();
            return data && data.success === true;
        } catch (error) {
            console.error('Erreur lors de la confirmation du rendez-vous:', error);
            throw error;
        }
    }
};

export default ApiService;