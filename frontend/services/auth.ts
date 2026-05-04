/**
 * Login, register, mevcut kullanıcı işlemleri.
 */
import { api, saveToken, clearToken } from './api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

/**
 * Email + şifre ile giriş.
 * Backend OAuth2PasswordRequestForm bekliyor → form-data göndermeli.
 */
export async function login(email: string, password: string): Promise<User> {
  const data = await api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  await saveToken(data.access_token);

  // Login response zaten user içeriyor, ama getCurrentUser çağırmak da çalışır
  const user = await getCurrentUser();
  return user;
}

/**
 * Yeni kullanıcı kaydı.
 */
export async function register(
  email: string,
  password: string,
  name: string,
  role: 'customer' | 'business'
): Promise<User> {
  await api('/auth/register', {
    method: 'POST',
    body: { email, password, full_name: name, role },
  });

  // Kayıttan sonra otomatik giriş
  return await login(email, password);
}

/**
 * Mevcut kullanıcıyı getir.
 */
export async function getCurrentUser(): Promise<User> {
  return await api<User>('/auth/me', { requireAuth: true });
}

/**
 * Çıkış.
 */
export async function logout(): Promise<void> {
  await clearToken();
}
export interface UserUpdateData {
  full_name?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  city?: string;
  district?: string;
  address?: string;
}

export async function updateMyProfile(data: UserUpdateData): Promise<User> {
  return await api<User>('/users/me', {
    method: 'PUT',
    body: data,
    requireAuth: true,
  });
}