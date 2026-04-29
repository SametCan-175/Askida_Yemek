import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
  Alert,
  FlatList,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router'; 
import Slider from '@react-native-community/slider';

export default function BrowseScreen() {
  const { lat, lon, shopName } = useLocalSearchParams();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [targetMarker, setTargetMarker] = useState<any>(null);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // GÜNCELLENDİ: Fiyat state'i artık null (limitsiz) veya sayı olabilir
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | null>(150);

  const mapRef = useRef<MapView>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni reddedildi. Haritayı görmek için ayarlardan izin vermelisin.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      if (lat && lon) {
        const targetLat = parseFloat(lat as string);
        const targetLon = parseFloat(lon as string);

        setMapRegion({
          latitude: targetLat,
          longitude: targetLon,
          latitudeDelta: 0.01, 
          longitudeDelta: 0.01,
        });

        setTargetMarker({
          latitude: targetLat,
          longitude: targetLon,
          title: (shopName as string) || "Seçili İşletme"
        });
      } 
      else {
        setMapRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setTargetMarker(null); 
      }
    })();
  }, [lat, lon, shopName]); 

  const fetchSuggestions = async (text: string) => {
    setSearchQuery(text);

    if (text.trim().length === 0) {
      setSuggestions([]);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5`;
        
        if (location) {
           const { latitude, longitude } = location.coords;
           const viewbox = `${longitude-0.5},${latitude+0.5},${longitude+0.5},${latitude-0.5}`;
           url += `&viewbox=${viewbox}&bounded=0`; 
        }

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'SonLokmaApp/1.0', 
            'Accept-Language': 'tr-TR'
          }
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           const data = await response.json();
           setSuggestions(data);
        }
      } catch (error) {
        console.error("Öneri getirme hatası:", error);
      } finally {
        setIsTyping(false);
      }
    }, 500); 
  };

  const handleSelectLocation = (lat: string | number, lon: string | number, displayName: string) => {
    Keyboard.dismiss();
    
    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
    const longitude = typeof lon === 'string' ? parseFloat(lon) : lon;
    
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    setMapRegion(newRegion);
    
    if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
    }
    
    setModalVisible(false);
    setSearchQuery(displayName); 
    setSuggestions([]); 
    
    setTargetMarker({
      latitude,
      longitude,
      title: displayName.split(',')[0] 
    });
  };

  const handleManualSearch = async () => {
      if(!searchQuery.trim()) return;
      
      if(suggestions.length > 0) {
          handleSelectLocation(suggestions[0].lat, suggestions[0].lon, suggestions[0].display_name);
          return;
      }

      setIsSearching(true);
      Keyboard.dismiss();
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
          {
            headers: { 'User-Agent': 'SonLokmaApp/1.0', 'Accept-Language': 'tr-TR' }
          }
        );
        const data = await response.json();
        if (data && data.length > 0) {
            handleSelectLocation(data[0].lat, data[0].lon, data[0].display_name);
        } else {
            alert('Konum bulunamadı. Lütfen şehri veya ilçeyi daha açık yazın.');
        }
      } catch (error) {
        alert('Arama başarısız oldu.');
      } finally {
        setIsSearching(false);
      }
  };

  const renderSuggestionItem = ({ item }: { item: any }) => {
    const nameParts = item.display_name.split(',');
    const mainName = nameParts[0];
    const subName = nameParts.slice(1, 3).join(',').trim(); 

    return (
        <TouchableOpacity 
          style={styles.suggestionItem}
          onPress={() => handleSelectLocation(item.lat, item.lon, item.display_name)}
        >
          <View style={styles.suggestionIconBox}>
            <Ionicons name="location-sharp" size={20} color="#9CA3AF" />
          </View>
          <View style={styles.suggestionTextContainer}>
            <Text style={styles.suggestionMainText} numberOfLines={1}>{mainName}</Text>
            <Text style={styles.suggestionSubText} numberOfLines={1}>{subName || item.display_name}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#D1D5DB" />
        </TouchableOpacity>
    );
  };

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
    Alert.alert(
      "Filtreler Uygulandı", 
      `Kategori: ${selectedCategory === 'all' ? 'Tümü' : selectedCategory}\nMaksimum Fiyat: ${selectedMaxPrice !== null ? selectedMaxPrice + '₺' : 'Limitsiz'}`
    );
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
          ref={mapRef} 
          style={styles.mapBackground}
          initialRegion={mapRegion} 
        >
          {location && (
            <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title="Senin Konumun">
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
              </View>
            </Marker>
          )}

          {targetMarker && (
            <Marker 
              coordinate={{ latitude: targetMarker.latitude, longitude: targetMarker.longitude }} 
              title={targetMarker.title}
              pinColor="#EA4335" 
            />
          )}
        </MapView>
      )}

      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.searchBar} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={styles.searchText}>{searchQuery ? searchQuery.split(',')[0] : "Restoran veya fırın ara..."}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => {
          if(location && mapRef.current) {
            const myRegion = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            mapRef.current.animateToRegion(myRegion, 1000);
            setTargetMarker(null); 
          } else if (!location) {
              Alert.alert("Konum Bekleniyor", "Kendi konumunuz henüz belirlenemedi.");
          }
        }}>
          <Ionicons name="navigate-outline" size={22} color="#0A4D44" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="options-outline" size={22} color="#0A4D44" />
          {(selectedCategory !== 'all' || selectedMaxPrice !== null) && (
            <View style={styles.filterActiveDot} />
          )}
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

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContent, suggestions.length > 0 && { flex: 0.9 }]}> 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Konum Değiştir</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSuggestions([]); }}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBox}>
              <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="Şehir, ilçe veya mahalle yazın..."
                value={searchQuery}
                onChangeText={fetchSuggestions} 
                onSubmitEditing={handleManualSearch}
                autoFocus={true}
              />
              {isTyping && <ActivityIndicator size="small" color="#10B981" />}
              {searchQuery.length > 0 && !isTyping && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }}>
                      <Ionicons name="close-circle" size={20} color="#D1D5DB" />
                  </TouchableOpacity>
              )}
            </View>

            {suggestions.length > 0 ? (
                <FlatList 
                  data={suggestions}
                  keyExtractor={(item, index) => item.place_id ? item.place_id.toString() : index.toString()}
                  renderItem={renderSuggestionItem}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                />
            ) : (
                <>
                  <TouchableOpacity style={styles.modalSearchButton} onPress={handleManualSearch} disabled={isSearching}>
                    {isSearching ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.modalSearchBtnText}>Ara ve Git</Text>}
                  </TouchableOpacity>

                  <View style={styles.quickPicksContainer}>
                    <Text style={styles.quickPicksTitle}>Hızlı Konumlar</Text>
                    <View style={styles.quickPicksRow}>
                      <TouchableOpacity style={styles.quickPickBadge} onPress={() => handleSelectLocation(41.6771, 26.5557, 'Edirne')}>
                        <Ionicons name="navigate" size={14} color="#0A4D44" />
                        <Text style={styles.quickPickText}>Edirne</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickPickBadge} onPress={() => handleSelectLocation(40.9901, 29.0292, 'Kadıköy, İstanbul')}>
                        <Ionicons name="navigate" size={14} color="#0A4D44" />
                        <Text style={styles.quickPickText}>Kadıköy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={isFilterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.filterModalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtreler</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Kategori</Text>
              <View style={styles.filterChipContainer}>
                {['all', 'fırın', 'restoran', 'kafe', 'market', 'otel'].map((cat) => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                      {cat === 'all' ? 'Tümü' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* GÜNCELLENDİ: Hem Slider Hem Manuel Giriş */}
              <View style={styles.sliderHeader}>
                <Text style={styles.filterSectionTitle}>Maksimum Fiyat</Text>
                
                <View style={styles.manualInputBox}>
                  <TextInput
                    style={styles.manualInput}
                    keyboardType="numeric"
                    value={selectedMaxPrice !== null ? selectedMaxPrice.toString() : ''}
                    onChangeText={(text) => {
                      if (text === '') {
                        setSelectedMaxPrice(null);
                      } else {
                        const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
                        setSelectedMaxPrice(isNaN(parsed) ? null : parsed);
                      }
                    }}
                    placeholder="Limitsiz"
                    placeholderTextColor="#9CA3AF"
                    maxLength={4}
                  />
                  <Text style={styles.manualInputCurrency}>₺</Text>
                </View>
              </View>

              <View style={styles.sliderContainer}>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={1000}
                  step={10} 
                  value={selectedMaxPrice === null ? 1000 : Math.min(selectedMaxPrice, 1000)}
                  onValueChange={(val) => setSelectedMaxPrice(val)}
                  minimumTrackTintColor="#10B981"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#0A4D44"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>0₺</Text>
                  <Text style={styles.sliderLabel}>500₺</Text>
                  <Text style={styles.sliderLabel}>1000₺</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity 
                style={styles.filterClearButton}
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedMaxPrice(null);
                }}
              >
                <Text style={styles.filterClearText}>Temizle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filterApplyButton} onPress={handleApplyFilters}>
                <Text style={styles.filterApplyText}>Uygula</Text>
              </TouchableOpacity>
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
  filterActiveDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EA4335', borderWidth: 1, borderColor: '#FFF' },
  
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
  quickPickText: { marginLeft: 5, color: '#0A4D44', fontWeight: '700', fontSize: 14 },
  
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  suggestionIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  suggestionTextContainer: { flex: 1, paddingRight: 10 },
  suggestionMainText: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  suggestionSubText: { fontSize: 12, color: '#6B7280' },

  filterModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, maxHeight: '85%' },
  filterSectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 10, marginBottom: 15 },
  filterChipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  filterChipTextActive: { color: '#FFFFFF' },
  
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  manualInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: '#E5E7EB' },
  manualInput: { fontSize: 16, fontWeight: '700', color: '#111827', minWidth: 60, textAlign: 'right' },
  manualInputCurrency: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginLeft: 2 },
  
  sliderContainer: { marginBottom: 30, paddingHorizontal: 10 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginTop: -5 },
  sliderLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  filterFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  filterClearButton: { paddingVertical: 14, paddingHorizontal: 20 },
  filterClearText: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  filterApplyButton: { flex: 1, backgroundColor: '#0A4D44', paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginLeft: 10 },
  filterApplyText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' }
});