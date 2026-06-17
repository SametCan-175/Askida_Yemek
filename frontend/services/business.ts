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
export interface ListingCreateData {
  title: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  quantity: number;
  pickup_start: string;
  pickup_end: string;
  image_url?: string;
}

/**
 * Yeni listing (sürpriz paket) oluştur.
 * Backend tokendan shop_id'yi otomatik atıyor.
 */
export async function createListing(data: ListingCreateData): Promise<Listing> {
  return await api<Listing>('/listings', {
    method: 'POST',
    body: data,
    requireAuth: true,
  });
}
export interface ShopUpdateData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  category?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Mağaza bilgilerini güncelle.
 */
export async function updateShop(shopId: number, data: ShopUpdateData): Promise<Shop> {
  return await api<Shop>(`/shops/${shopId}`, {
    method: 'PUT',
    body: data,
    requireAuth: true,
  });
}
export interface ShopCreateData {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  category?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Yeni mağaza oluştur. İşletme rolündeki kullanıcı kullanır.
 */
export async function createShop(data: ShopCreateData): Promise<Shop> {
  return await api<Shop>('/shops', {
    method: 'POST',
    body: data,
    requireAuth: true,
  });
}
export interface ShopHoursItem {
  day_of_week: number;  // 0=Pazartesi, 6=Pazar
  is_open: boolean;
  open_time?: string | null;
  close_time?: string | null;
  pickup_start?: string | null;
  pickup_end?: string | null;
}

export interface ShopHoursResponse {
  shop_id: number;
  hours: ShopHoursItem[];
}

export async function fetchShopHours(shopId: number): Promise<ShopHoursItem[]> {
  const response = await api<ShopHoursResponse>(`/shops/${shopId}/hours`);
  return response.hours;
}

export async function updateShopHours(
  shopId: number,
  hours: ShopHoursItem[]
): Promise<ShopHoursItem[]> {
  const response = await api<ShopHoursResponse>(`/shops/${shopId}/hours`, {
    method: 'PUT',
    body: { hours },
    requireAuth: true,
  });
  return response.hours;
}
export interface ShopBank {
  shop_id: number;
  iban: string;
  account_holder: string;
  bank_name?: string | null;
  updated_at: string;
}

export interface ShopBankUpdateData {
  iban: string;
  account_holder: string;
  bank_name?: string;
}

export async function fetchShopBank(shopId: number): Promise<ShopBank | null> {
  return await api<ShopBank | null>(`/shops/${shopId}/bank`, { requireAuth: true });
}

export async function updateShopBank(
  shopId: number,
  data: ShopBankUpdateData
): Promise<ShopBank> {
  return await api<ShopBank>(`/shops/${shopId}/bank`, {
    method: 'PUT',
    body: data,
    requireAuth: true,
  });
}

export interface WalletBalance {
  shop_id: number;
  total_earned: number;
  total_withdrawn: number;
  pending_withdraw: number;
  available_balance: number;
}

export interface WalletTransaction {
  id: string;
  type: 'income' | 'withdraw';
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

export interface WithdrawRequest {
  id: number;
  shop_id: number;
  amount: number;
  iban: string;
  status: string;
  note?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export async function fetchWalletBalance(shopId: number): Promise<WalletBalance> {
  return await api<WalletBalance>(`/shops/${shopId}/wallet/balance`, { requireAuth: true });
}

export async function fetchWalletTransactions(shopId: number): Promise<WalletTransaction[]> {
  return await api<WalletTransaction[]>(`/shops/${shopId}/wallet/transactions`, { requireAuth: true });
}

export async function createWithdraw(
  shopId: number,
  data: { amount: number; iban?: string; note?: string }
): Promise<WithdrawRequest> {
  return await api<WithdrawRequest>(`/shops/${shopId}/wallet/withdraw`, {
    method: 'POST',
    body: data,
    requireAuth: true,
  });
}