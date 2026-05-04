/**
 * Kullanıcı istatistikleri.
 * Backend'de doğrudan endpoint olmadığı için /reservations/my'dan hesaplıyoruz.
 */
import { fetchMyReservations } from './reservations';
import { fetchListingById } from './listings';

export interface UserStats {
  toplam_siparis: number;
  toplam_tasarruf: number;
  toplam_harcama: number;
  onlenen_israf_kg: number;
  bu_hafta_siparis: number;
}

/**
 * Kullanıcının istatistiklerini hesapla.
 * Her rezervasyon için ilgili listing'i çekip indirimli/orijinal fiyatları kullanır.
 */
export async function fetchMyStats(): Promise<UserStats> {
  const reservations = await fetchMyReservations();

  const toplam_siparis = reservations.length;

  // Her benzersiz listing'i bir kez çek (cache mantığı)
  const uniqueListingIds = [...new Set(reservations.map(r => r.listing_id))];
  const listingMap = new Map<number, any>();

  await Promise.all(
    uniqueListingIds.map(async (id) => {
      try {
        const listing = await fetchListingById(id);
        listingMap.set(id, listing);
      } catch {
        // Listing çekilemezse yoksay
      }
    })
  );

  // Tasarruf ve harcama hesabı
  let toplam_harcama = 0;
  let toplam_tasarruf = 0;

  for (const r of reservations) {
    const listing = listingMap.get(r.listing_id);
    if (!listing) continue;
    
    const qty = Number(r.quantity) || 0;
    const discounted = Number(listing.discounted_price) || 0;
    const original = Number(listing.original_price) || discounted;

    toplam_harcama += discounted * qty;
    toplam_tasarruf += (original - discounted) * qty;
  }

  // AI ekibinin formülü: her sipariş ortalama 0.35 kg yemek kurtarır
  const onlenen_israf_kg = parseFloat((toplam_siparis * 0.35).toFixed(2));

  // Bu haftaki siparişler
  const haftaBasi = new Date();
  haftaBasi.setDate(haftaBasi.getDate() - haftaBasi.getDay());
  haftaBasi.setHours(0, 0, 0, 0);

  const bu_hafta_siparis = reservations.filter(r => {
    return new Date(r.created_at) >= haftaBasi;
  }).length;

  return {
    toplam_siparis,
    toplam_tasarruf: Math.round(toplam_tasarruf),
    toplam_harcama: Math.round(toplam_harcama),
    onlenen_israf_kg,
    bu_hafta_siparis,
  };
}