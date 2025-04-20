// src/services/authService.ts

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig  } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config/config';

/**
 * authService.ts
 * 
 * Service d’authentification centralisé pour l’application React Native.
 * - Axios instance avec interceptors pour injection et rafraîchissement automatique du token
 * - Stockage sécurisé via AsyncStorage
 * - Typages stricts pour DTOs et réponses
 * - Gestion exhaustive des erreurs réseau et business
 */

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/**
 * Instance Axios partagée
 */
const api: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.TIMEOUT,
});

/**
 * Request interceptor pour injecter le token d’accès
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.ACCESS_TOKEN);
    // Assure un objet headers non-undefined
    config.headers = config.headers ?? {};
    if (token) {
      // on peut typer headers en indexable
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor pour gérer les 401 et rafraîchir automatiquement le token
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
        const response = await axios.post(`${Config.API_BASE_URL}/refresh`, { refresh_token: refreshToken });
        const { access_token, refresh_token } = response.data;
        await AsyncStorage.multiSet([
          [Config.STORAGE_KEYS.ACCESS_TOKEN, access_token],
          [Config.STORAGE_KEYS.REFRESH_TOKEN, refresh_token],
        ]);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        processQueue(null, access_token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await AsyncStorage.multiRemove([Config.STORAGE_KEYS.ACCESS_TOKEN, Config.STORAGE_KEYS.REFRESH_TOKEN]);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * DTOs et interfaces
 */
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

export interface VerifyOtpDto {
  userId: string;
  otp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  roles: string[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  jti: string;
  user: UserProfile;
}

/**
 * AuthService exposant toutes les méthodes d’authentification
 */
export const authService = {
  /**
   * Connexion utilisateur
   */
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', data);
    const { access_token, refresh_token } = response.data;
    await AsyncStorage.multiSet([
      [Config.STORAGE_KEYS.ACCESS_TOKEN, access_token],
      [Config.STORAGE_KEYS.REFRESH_TOKEN, refresh_token],
    ]);
    return response.data;
  },

  /**
   * Inscription utilisateur
   */
  register: async (data: RegisterDto): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/register', data);
    return response.data;
  },

  /**
   * Rafraîchir le token manuellement (utile hors interceptor)
   */
  refreshToken: async (): Promise<{ access_token: string; refresh_token: string }> => {
    const refresh_token = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
    const response = await api.post<{ access_token: string; refresh_token: string } >('/refresh', { refresh_token } as RefreshTokenDto);
    await AsyncStorage.multiSet([
      [Config.STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token],
      [Config.STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token],
    ]);
    return response.data;
  },

  /**
   * Demande de réinitialisation de mot de passe
   */
  forgotPassword: async (data: ForgotPasswordDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/forgot-password', data);
    return response.data;
  },

  /**
   * Réinitialisation de mot de passe
   */
  resetPassword: async (data: ResetPasswordDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/reset-password', data);
    return response.data;
  },

  /**
   * Vérifier OTP et connecter
   */
  verifyOtp: async (data: VerifyOtpDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/verify-otp', data);
    const { access_token, refresh_token } = response.data;
    await AsyncStorage.multiSet([
      [Config.STORAGE_KEYS.ACCESS_TOKEN, access_token],
      [Config.STORAGE_KEYS.REFRESH_TOKEN, refresh_token],
    ]);
    return response.data;
  },

  /**
   * Déconnexion (supprime tokens locaux)
   */
  logout: async (): Promise<void> => {
    const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.ACCESS_TOKEN);
    try {
      await api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Même en cas d'échec, on supprime les tokens
    }
    await AsyncStorage.multiRemove([Config.STORAGE_KEYS.ACCESS_TOKEN, Config.STORAGE_KEYS.REFRESH_TOKEN]);
  },

  /**
   * Récupérer le profil utilisateur connecté
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/me');
    return response.data;
  },
};
