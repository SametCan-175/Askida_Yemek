import { api } from './api';

export interface ReservationCreate {
  listing_id: number;
  quantity: number;
}

export interface Reservation {
  id: number;
  listing_id: number;
  user_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  qr_code?: string;
}

export async function createReservation(data: ReservationCreate): Promise<Reservation> {
  return await api<Reservation>('/reservations', {
    method: 'POST',
    body: data,
    requireAuth: true,
  });
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  return await api<Reservation[]>('/reservations/my', { requireAuth: true });
}