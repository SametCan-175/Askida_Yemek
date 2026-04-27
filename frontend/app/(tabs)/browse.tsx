import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router'; // DIŞARIDAN VERİ ALMAK İÇİN EKLENDİ

export default function BrowseScreen() {
  // GÜNCELLENEN KISIM: Detay sayfasından gelen işletme konumu ve adını yakalıyoruz
  const { lat, lon, shopName } = useLocalSearchParams();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  
  // İşletme için özel bir işaretçi (marker) state'i
  const [targetMarker, setTargetMarker] = useState<any>(null);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni reddedildi. Haritayı görmek için ayarlardan izin vermelisin.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // EĞER DETAY SAYFASINDAN KOORDİNAT GELDİYSE ORAYA GİT
      if (lat && lon) {
        const targetLat = parseFloat(lat as string);
        const targetLon = parseFloat(lon as string);

        setMapRegion({
          latitude: targetLat,
          longitude: targetLon,
          latitudeDelta: 0.01, // 0.01 yaparak işletmeye iyice zoomluyoruz
          longitudeDelta: 0.01,
        });

        // İşletmenin olduğu yere kırmızı pin koy
        setTargetMarker({
          latitude: targetLat,
          longitude: targetLon,
          title: (shopName as string) || "Seçili İşletme"
        });
      } 
      // EĞER NORMAL TIKLANIP AÇILDIYSA KENDİ KONUMUNA GİT
      else {
        setMapRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setTargetMarker(null); // Normal haritada işletme pini olmasın
      }
    })();
  }, [lat, lon, shopName]); // Koordinatlar değişirse haritayı güncelle

  const handleSearchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    Keyboard.dismiss();

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);
        
        setLocation({ coords: { latitude, longitude } } as Location.LocationObject);
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        
        setModalVisible(false);
        setSearchQuery('');
        setTargetMarker(null); // Yeni arama yapınca eski pini kaldır
      } else {
        alert('Konum bulunamadı. Lütfen şehri veya ilçeyi daha açık yazın.');
      }
    } catch (error) {
      console.error("Konum arama hatası:", error);
      alert('Arama başarısız oldu. İnternet bağlantını kontrol et.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {errorMsg ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="location-outline" size={50} color="#EA4335" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : !location || !mapRegion ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A4D44" />
          <Text style={styles.loadingText}>Konumun bulunuyor...</Text>
        </View>
      ) : (
        <MapView 
          style={styles.mapBackground}
          region={mapRegion}
        >
          {/* Senin kendi mavi konum noktan */}
          {location && (
            <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title="Senin Konumun">
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
              </View>
            </Marker>
          )}

          {/* EĞER İŞLETMEDEN GELDİYSE: İşletmenin kırmızı pini */}
          {targetMarker && (
            <Marker 
              coordinate={{ latitude: targetMarker.latitude, longitude: targetMarker.longitude }} 
              title={targetMarker.title}
              pinColor="#EA4335" // Standart kırmızı Google Maps pini
            />
          )}
        </MapView>
      )}

      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.searchBar} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={styles.searchText}>Restoran veya fırın ara...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => {
          // Kendi konumuma dön butonu
          if(location) {
            setMapRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
            setTargetMarker(null);
          }
        }}>
          <Ionicons name="navigate-outline" size={22} color="#0A4D44" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="options-outline" size={22} color="#0A4D44" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Konum Analizi</Text>
        <Text style={styles.sheetDesc}>
          Harita şu an seçtiğin bölgeye odaklandı. Çevredeki indirimli ürünler taranıyor...
        </Text>
        <TouchableOpacity style={styles.chooseButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.chooseButtonText}>Farklı bir konum seç</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Konum Değiştir</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBox}>
              <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="Şehir, ilçe veya mahalle yazın..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearchLocation(searchQuery)}
                autoFocus={true}
              />
            </View>

            <TouchableOpacity 
              style={styles.modalSearchButton}
              onPress={() => handleSearchLocation(searchQuery)}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSearchBtnText}>Ara ve Git</Text>
              )}
            </TouchableOpacity>

            <View style={styles.quickPicksContainer}>
              <Text style={styles.quickPicksTitle}>Hızlı Konumlar</Text>
              <View style={styles.quickPicksRow}>
                <TouchableOpacity style={styles.quickPickBadge} onPress={() => handleSearchLocation('Keşan, Edirne')}>
                  <Ionicons name="navigate" size={14} color="#0A4D44" />
                  <Text style={styles.quickPickText}>Keşan</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickPickBadge} onPress={() => handleSearchLocation('Bursa')}>
                  <Ionicons name="navigate" size={14} color="#0A4D44" />
                  <Text style={styles.quickPickText}>Bursa</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  mapBackground: { width: '100%', height: '100%', position: 'absolute' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F6F2', padding: 20 },
  loadingText: { marginTop: 15, fontSize: 16, color: '#0A4D44', fontWeight: '600' },
  errorText: { marginTop: 15, fontSize: 16, color: '#EA4335', textAlign: 'center', fontWeight: '600', lineHeight: 24 },
  userLocationMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(24, 119, 242, 0.3)', justifyContent: 'center', alignItems: 'center' },
  userLocationDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1877F2', borderWidth: 2, borderColor: '#FFFFFF' },
  topControls: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 50, gap: 10, alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', height: 48, borderRadius: 24, paddingHorizontal: 16, elevation: 3 },
  searchText: { marginLeft: 10, fontSize: 15, color: '#9CA3AF' },
  iconButton: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30, alignItems: 'center', elevation: 10 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sheetDesc: { fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 20 },
  chooseButton: { backgroundColor: '#0A4D44', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 24, width: '100%', alignItems: 'center' },
  chooseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, minHeight: 350 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, paddingHorizontal: 15, height: 55, marginBottom: 15 },
  modalInput: { flex: 1, fontSize: 16, color: '#111827' },
  modalSearchButton: { backgroundColor: '#10B981', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  modalSearchBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  quickPicksContainer: { marginTop: 10 },
  quickPicksTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 10 },
  quickPicksRow: { flexDirection: 'row', gap: 10 },
  quickPickBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2F1', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
  quickPickText: { marginLeft: 5, color: '#0A4D44', fontWeight: '700', fontSize: 14 }
});