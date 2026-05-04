import Constants from 'expo-constants';

/**
 * Geliştirme bilgisayarının IP'sini Expo'dan otomatik al.
 * Bu sayede her geliştiricinin makinasında çalışır.
 */
function getDevHost(): string {
  // expoConfig.hostUri formatı: "192.168.1.6:8081"
  const hostUri = 
    Constants.expoConfig?.hostUri || 
    (Constants.manifest2 as any)?.extra?.expoClient?.hostUri ||
    (Constants.manifest as any)?.hostUri;

  if (hostUri && typeof hostUri === 'string') {
    return hostUri.split(':')[0];
  }

  // Fallback (dev'de Expo IP veremezse)
  return '127.0.0.1';
}

const HOST = getDevHost();

export const BACKEND_URL = `http://${HOST}:8000`;
export const AI_URL = `http://${HOST}:5000`;
export const API_TIMEOUT = 15000;