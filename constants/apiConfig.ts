// constants/apiConfig.ts

// Type d'environnement pour l'API
type Environment = 'development' | 'test' | 'production';

// Configuration par environnement
const API_CONFIG = {
    development: {
        baseUrl: 'http://localhost:8000/api',
        timeout: 15000,
        debug: true
    },
    test: {
        baseUrl: 'https://preprod-api.votre-domaine.com/api',
        timeout: 10000,
        debug: true
    },
    production: {
        baseUrl: 'https://api.votre-domaine.com/api',
        timeout: 8000,
        debug: false
    }
};

// L'environnement actuel (à modifier selon le contexte)
// En production, cette valeur serait définie par des variables d'environnement
const CURRENT_ENV: Environment = process.env.NODE_ENV === 'production'
    ? 'production'
    : (process.env.NODE_ENV === 'test' ? 'test' : 'development');

// Configuration active
export const API = {
    ...API_CONFIG[CURRENT_ENV],
    // Endpoints de l'API
    endpoints: {
        VERIFY_CODE: '/appointments/verify',
        CONFIRM_APPOINTMENT: '/appointments/confirm',
        PAYMENT_VERIFY: '/payments/verify',
        PAYMENT_PROCESS: '/payments/process',
    },
    // En-têtes communs pour toutes les requêtes
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': '1.0.0'
    }
};

export default API;