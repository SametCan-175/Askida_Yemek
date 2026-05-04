/**
 * Rozet (badge) işlemleri.
 */
import { api } from './api';

export interface Badge {
  id: number;
  name: string;
  emoji: string;
  description: string;
  earned_at: string;
}

/**
 * Giriş yapmış kullanıcının kazandığı rozetleri getir.
 */
export async function fetchMyBadges(): Promise<Badge[]> {
  return await api<Badge[]>('/users/rozetler', { requireAuth: true });
}