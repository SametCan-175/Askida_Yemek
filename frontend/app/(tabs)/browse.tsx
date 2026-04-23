import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'; // GPS Kütüphanesi Eklendi

export default function BrowseScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sayfa açıldığında otomatik olarak çalışacak konum bulma fonksiyonu
  useEffect(() => {
    (async () => {
      // 1. Kullanıcıdan konum izni iste
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni reddedildi. Haritayı görmek için ayarlardan izin vermelisin.');
        return;
      }

      // 2. İzin verildiyse gerçek konumu bul
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Eğer hata varsa ekrana hatayı bas */}
      {errorMsg ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="location-outline" size={50} color="#EA4335" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : !location ? (
        // Konum aranırken ekranda dönen yükleme animasyonu
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A4D44" />
          <Text style={styles.loadingText}>Konumun bulunuyor...</Text>
        </View>
      ) : (
        // Konum bulunduysa Gerçek Haritayı Göster
        <MapView 
          style={styles.mapBackground}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Senin bulunduğun yere bir pin (işaretçi) atıyoruz */}
          <Marker 
            coordinate={{ 
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude 
            }}
            title="Buradasın!"
            description="Çevrendeki sürpriz paketler aranıyor..."
          >
            {/* Özel tasarım mavi konum noktası */}
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        </MapView>
      )}

      {/* Üst Arama ve Filtreleme Çubuğu */}
      <SafeAreaView style={styles.topControls}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={styles.searchText}>Search</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="location-outline" size={22} color="#0A4D44" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="options-outline" size={22} color="#0A4D44" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Alttaki Beyaz Uyarı Paneli */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Konum Analizi</Text>
        <Text style={styles.sheetDesc}>
          {location ? "Harika! Çevrendeki işletmeler taranıyor..." : "Lütfen konum erişimine izin verin."}
        </Text>
        <TouchableOpacity style={styles.chooseButton}>
          <Text style={styles.chooseButtonText}>Farklı bir konum seç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  mapBackground: { width: '100%', height: '100%', position: 'absolute' },
  
  // Yükleme ve Hata ekranı stilleri
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F6F2', padding: 20 },
  loadingText: { marginTop: 15, fontSize: 16, color: '#0A4D44', fontWeight: '600' },
  errorText: { marginTop: 15, fontSize: 16, color: '#EA4335', textAlign: 'center', fontWeight: '600', lineHeight: 24 },

  // Haritadaki mavi "Buradasın" noktası tasarımı
  userLocationMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(24, 119, 242, 0.3)', justifyContent: 'center', alignItems: 'center' },
  userLocationDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1877F2', borderWidth: 2, borderColor: '#FFFFFF' },

  topControls: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 50, gap: 10, alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', height: 48, borderRadius: 24, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchText: { marginLeft: 10, fontSize: 16, color: '#9CA3AF' },
  iconButton: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sheetDesc: { fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 24 },
  chooseButton: { backgroundColor: '#0A4D44', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 24 },
  chooseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});