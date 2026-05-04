/**
 * İşletme paneli için backend bağlantıları.
 */
import { api } from './api';
import { Listing } from './listings';
import { Reservation } from './reservations';

export interface Shop {
  id: number;
  owner_id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  category?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
}

export interface ShopListResponse {
  total: number;
  shops: Shop[];
}

/**
 * İşletme sahibinin kendi mağazasını bul.
 * Tüm shop'ları çekip owner_id'ye göre filtreliyoruz.
 */
export async function fetchMyShop(userId: number): Promise<Shop | null> {
  const response = await api<ShopListResponse>('/shops?limit=100');
  const myShop = response.shops.find(s => s.owner_id === userId);
  return myShop || null;
}

/**
 * Bir mağazaya ait listing'leri getir.
 */
export async function fetchShopListings(shopId: number): Promise<Listing[]> {
  const response = await api<{ total: number; listings: Listing[] }>(
    `/listings?shop_id=${shopId}&limit=100`
  );
  return response.listings;
}

/**
 * İşletmenin tüm rezervasyonlarını getir.
 * Backend tokendan owner'ı tanıyor, parametre lazım değil.
 */
export async function fetchShopReservations(): Promise<Reservation[]> {
  return await api<Reservation[]>('/reservations/shop', { requireAuth: true });
}

/**
 * Rezervasyonun statüsünü güncelle (QR scan sonrası "picked_up" yapmak için).
 */
export async function updateReservationStatus(
  reservationId: number,
  status: 'pending' | 'confirmed' | 'picked_up' | 'cancelled'
): Promise<Reservation> {
  return await api<Reservation>(`/reservations/${reservationId}/status`, {
    method: 'PATCH',
    body: { status },
    requireAuth: true,
  });
}