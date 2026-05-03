/**
 * Listing (fırsat) işlemleri.
 */
import { api } from './api';

export interface ShopInfo {
  id: number;
  name: string;
  category: string;
  city: string;
  district?: string;
  latitude?: number;
  longitude?: number;
}

export interface Listing {
  id: number;
  shop_id: number;
  title: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  discount_percent: number;
  quantity: number;
  pickup_start: string;
  pickup_end: string;
  image_url?: string;
  status: string;
  created_at: string;
  shop?: ShopInfo;
  // AI alanları
  ai_score?: number;
  badge_text?: string;
  ai_description?: string;
}

export interface ListingListResponse {
  total: number;
  listings: Listing[];
}

export interface ListingFilters {
  shop_id?: number;
  city?: string;
  max_price?: number;
  skip?: number;
  limit?: number;
  lat?: number;
  lon?: number;
  radius?: number;
  user_id?: number;
}

/**
 * Listing'leri getir. Konum + user_id verilirse AI skorlu döner.
 */
export async function fetchListings(filters: ListingFilters = {}): Promise<ListingListResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  const url = `/listings${queryString ? '?' + queryString : ''}`;

  return await api<ListingListResponse>(url);
}

/**
 * Tek listing detayı.
 */
export async function fetchListingById(id: number): Promise<Listing> {
  return await api<Listing>(`/listings/${id}`);
}