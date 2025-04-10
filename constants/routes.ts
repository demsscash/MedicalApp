// constants/routes.ts
// Définition des types pour les chemins de routeur
export type AppRoutes = {
    HOME: '/',
    CODE_ENTRY: '/code-entry',
    VERIFICATION: '/verification',
    APPOINTMENT_CONFIRMED: '/appointment-confirmed',
    PAYMENT: '/payment',
    CARTE_VITALE: '/carte-vitale',
    CARTE_VITALE_VALIDATED: '/carte-vitale-validated',
    PAYMENT_CONFIRMATION: '/payment-confirmation',
    TPE: '/tpe',
    PAYMENT_SUCCESS: '/payment-success',
};

// Les chemins comme valeurs littérales pour satisfaire le typage d'Expo Router
export const ROUTES: AppRoutes = {
    HOME: '/',
    CODE_ENTRY: '/code-entry',
    VERIFICATION: '/verification',
    APPOINTMENT_CONFIRMED: '/appointment-confirmed',
    PAYMENT: '/payment',
    CARTE_VITALE: '/carte-vitale',
    CARTE_VITALE_VALIDATED: '/carte-vitale-validated',
    PAYMENT_CONFIRMATION: '/payment-confirmation',
    TPE: '/tpe',
    PAYMENT_SUCCESS: '/payment-success',
};