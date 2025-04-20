// src/config/config.ts
// Fichier de configuration centralisé pour l'application React Native

/**
 * Variables de configuration (à adapter ou surcharger selon l'environnement)
 */
export const Config = {
  /** URL de base de l'API d'authentification */
  API_BASE_URL: 'https://api.votre-backend.com/auth',

  /** Timeout par défaut pour les requêtes Axios (en ms) */
  TIMEOUT: 10000,

  /** Clés utilisées pour stocker les tokens dans AsyncStorage */
   STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_EMAIL: 'userEmail',
    REMEMBER_ME: 'rememberMe',
  },
};
