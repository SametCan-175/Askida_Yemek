/**
 * Tüm backend isteklerini buradan yapacağız.
 * Token otomatik eklenir, hata yönetimi merkezi.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, API_TIMEOUT } from '../config';

const TOKEN_KEY = 'auth_token';

// ── Token yönetimi ──
export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ── Ana fetch wrapper ──
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: any;
  requireAuth?: boolean;
  isFormData?: boolean; // login için
}

export async function api<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    requireAuth = false,
    isFormData = false,
  } = options;

  // URL'i hazırla
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  // Header'ları hazırla
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const token = await getToken();
    if (!token) {
      throw new Error('Oturum açılmamış. Lütfen giriş yapın.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Timeout için AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body
        ? (isFormData ? body : JSON.stringify(body))
        : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 401 → token geçersiz
    if (response.status === 401) {
      await clearToken();
      throw new Error('Oturum süresi doldu. Tekrar giriş yapın.');
    }

    // Hata kontrolü
    if (!response.ok) {
      let errorMessage = `Sunucu hatası (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    // 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Sunucuya ulaşılamıyor. Bağlantını kontrol et.');
    }
    throw error;
  }
}