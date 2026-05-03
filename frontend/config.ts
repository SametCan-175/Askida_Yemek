/**
 * Backend bağlantı ayarları.
 * 
 * GELİŞTİRME (telefonda test ediyorsan):
 *   - Bilgisayarın LAN IP'sini bul (Windows: ipconfig, Mac: ifconfig)
 *   - Örnek: 192.168.1.9
 *   - BACKEND_URL'i o IP ile değiştir
 * 
 * EMÜLATÖR'DE TEST EDİYORSAN:
 *   - Android emülatör: http://10.0.2.2:8000
 *   - iOS simülatör: http://localhost:8000
 */

// 🔧 BURAYI DEĞİŞTİR — telefonda test için bilgisayarının LAN IP'sini yaz
export const BACKEND_URL = "http://192.168.1.6:8000";

// AI servisi (frontend doğrudan çağırmıyor, backend üzerinden gidecek)
// Buraya gerek yok ama referans olsun

export const API_TIMEOUT = 15000; // 15 saniye