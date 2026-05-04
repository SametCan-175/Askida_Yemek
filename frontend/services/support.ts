import { api } from './api';

export interface ChatMessage {
  rol: 'kullanici' | 'asistan';
  mesaj: string;
}

export interface SupportResponse {
  yanit: string;
  guncellenmis_gecmis: ChatMessage[];
  siparis_gecmisi?: any[];
}

/**
 * Lokma'ya backend üzerinden mesaj gönder.
 * Backend kullanıcının sipariş geçmişini DB'den çekip AI'a context olarak yollar.
 */
export async function sendSupportMessage(
  user_id: number,
  mesaj: string,
  konusma_gecmisi: ChatMessage[]
): Promise<SupportResponse> {
  const data = await api<SupportResponse>('/ai/destek', {
    method: 'POST',
    body: { user_id, mesaj, konusma_gecmisi },
    requireAuth: true,
  });

  console.log('🤖 AI Response:', JSON.stringify(data));
  return data;
}